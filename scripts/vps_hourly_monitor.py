#!/usr/bin/env python3
"""
Portfolio Intelligence — Hourly Price Monitor
Runs on VPS every hour Mon-Fri 06:00-01:59
- Fetches live prices via yfinance (Yahoo Finance, free)
- Calculates P&L for your portfolio
- Sends Telegram alert if any position moves > threshold
- Updates data/market_data.json and data/portfolio_trades.json
- Triggers git commit+push via vps_git_deploy.sh
"""

import json
import os
import sys
import time
import subprocess
import requests
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

try:
    import yfinance as yf
except ImportError:
    print("ERROR: yfinance non installato. Esegui: pip install yfinance")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────
REPO_DIR = Path(__file__).parent.parent
DATA_DIR = REPO_DIR / "data"
SCRIPTS_DIR = REPO_DIR / "scripts"

load_dotenv(REPO_DIR / ".env")

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
ALERT_THRESHOLD = float(os.getenv("PRICE_ALERT_THRESHOLD", "2.0"))

# ── Ticker da monitorare ──────────────────────────────────
WATCHLIST = {
    # ── Virtual Portfolio positions ──────────────────────
    "NVDA":   {"name": "NVIDIA Corp.",         "category": "portfolio"},
    "LLY":    {"name": "Eli Lilly & Co.",      "category": "portfolio"},
    "AVGO":   {"name": "Broadcom Inc.",        "category": "portfolio"},
    "XOM":    {"name": "ExxonMobil Corp.",     "category": "portfolio"},
    # ── Watch Queue ──────────────────────────────────────
    "ASML":   {"name": "ASML Holding",         "category": "watchlist"},
    "EQIX":   {"name": "Equinix Inc.",         "category": "watchlist"},
    "JPM":    {"name": "JPMorgan Chase",       "category": "watchlist"},
    # ── Indici e macro ───────────────────────────────────
    "SPY":    {"name": "S&P 500 ETF",          "category": "index"},
    "QQQ":    {"name": "NASDAQ 100 ETF",       "category": "index"},
    "^VIX":   {"name": "VIX",                  "category": "index"},
    "GLD":    {"name": "Gold ETF",             "category": "macro"},
    "USO":    {"name": "Oil WTI ETF",          "category": "macro"},
    "TLT":    {"name": "20Y Treasury ETF",     "category": "macro"},
    "EURUSD=X": {"name": "EUR/USD",            "category": "macro"},
    "BTC-USD": {"name": "Bitcoin",             "category": "crypto"},
}

# ── Portfolio positions (da virtual_portfolio.json) ─────────
def load_portfolio():
    vp_path = DATA_DIR / "virtual_portfolio.json"
    if not vp_path.exists():
        return {}
    with open(vp_path) as f:
        data = json.load(f)

    positions = {}
    for pos in data.get("positions", []):
        ticker = pos["ticker"]
        positions[ticker] = {
            "shares": pos["shares"],
            "cost_basis": pos["cost_basis"],
            "dividends": 0.0,
            "entry_price": pos["entry_price"],
        }
    return positions


def update_virtual_portfolio_prices(prices):
    """Aggiorna i prezzi correnti e P&L in virtual_portfolio.json."""
    vp_path = DATA_DIR / "virtual_portfolio.json"
    if not vp_path.exists():
        return
    with open(vp_path) as f:
        vp = json.load(f)

    total_value = 0.0
    for pos in vp.get("positions", []):
        ticker = pos["ticker"]
        if ticker in prices:
            current_price = prices[ticker]["price"]
            pos["current_price"] = round(current_price, 2)
            pos["current_value"] = round(current_price * pos["shares"], 2)
            pos["pnl_usd"] = round(pos["current_value"] - pos["cost_basis"], 2)
            pos["pnl_pct"] = round((pos["pnl_usd"] / pos["cost_basis"]) * 100, 2) if pos["cost_basis"] else 0
            total_value += pos["current_value"]

    cash = vp["capital"]["cash"]
    total_value_with_cash = total_value + cash
    pnl_total = total_value_with_cash - vp["capital"]["starting"]
    vp["capital"]["total_value"] = round(total_value_with_cash, 2)
    vp["capital"]["deployed"] = round(total_value, 2)
    vp["capital"]["pnl_usd"] = round(pnl_total, 2)
    vp["capital"]["pnl_pct"] = round((pnl_total / vp["capital"]["starting"]) * 100, 2)
    vp["capital"]["lastUpdated"] = datetime.now(timezone.utc).isoformat()

    # Aggiungi al performance_log (solo una volta al giorno)
    today_str = datetime.now().strftime("%Y-%m-%d")
    last_log = vp.get("performance_log", [{}])[-1].get("date", "")
    if last_log != today_str:
        vp.setdefault("performance_log", []).append({
            "date": today_str,
            "total_value": vp["capital"]["total_value"],
            "cash": cash,
            "deployed": vp["capital"]["deployed"],
            "pnl_usd": vp["capital"]["pnl_usd"],
            "pnl_pct": vp["capital"]["pnl_pct"],
        })

    with open(vp_path, "w") as f:
        json.dump(vp, f, indent=2, ensure_ascii=False)
    print(f"  ✅ virtual_portfolio.json aggiornato (valore: ${total_value_with_cash:.2f})")

# ── Fetch prezzi live ─────────────────────────────────────
def fetch_prices(tickers):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Fetching prices for {len(tickers)} tickers...")
    prices = {}

    # Batch download
    symbols = list(tickers.keys())
    try:
        data = yf.download(
            symbols,
            period="2d",
            interval="1d",
            progress=False,
            auto_adjust=True,
            threads=True
        )

        if data.empty:
            raise ValueError("Empty data from yfinance")

        close = data["Close"]

        for sym in symbols:
            try:
                if sym in close.columns:
                    series = close[sym].dropna()
                    if len(series) >= 1:
                        current = float(series.iloc[-1])
                        prev = float(series.iloc[-2]) if len(series) >= 2 else current
                        change_pct = ((current - prev) / prev * 100) if prev != 0 else 0
                        prices[sym] = {
                            "price": round(current, 4),
                            "prev_close": round(prev, 4),
                            "change_pct": round(change_pct, 2),
                            "direction": "up" if change_pct >= 0 else "down"
                        }
            except Exception as e:
                print(f"  ⚠️  {sym}: {e}")

    except Exception as e:
        print(f"  ❌ Batch download fallito: {e}")
        # Fallback: singolo ticker
        for sym in symbols[:5]:  # Limita per evitare rate limit
            try:
                ticker = yf.Ticker(sym)
                info = ticker.fast_info
                current = float(info.last_price)
                prev = float(info.previous_close) if hasattr(info, 'previous_close') else current
                change_pct = ((current - prev) / prev * 100) if prev != 0 else 0
                prices[sym] = {
                    "price": round(current, 4),
                    "prev_close": round(prev, 4),
                    "change_pct": round(change_pct, 2),
                    "direction": "up" if change_pct >= 0 else "down"
                }
                time.sleep(0.5)
            except Exception as e2:
                print(f"  ❌ {sym} singolo fallito: {e2}")

    return prices

# ── Calcola P&L portfolio ─────────────────────────────────
def calculate_pnl(positions, prices):
    results = {}
    total_cost = 0
    total_value = 0
    total_dividends = 0

    for ticker, pos in positions.items():
        price_key = ticker
        if ticker not in prices and f"{ticker}" in prices:
            price_key = ticker

        if price_key not in prices:
            continue

        current_price = prices[price_key]["price"]
        shares = pos["shares"]
        cost = pos["cost_basis"]
        divs = pos["dividends"]

        market_value = shares * current_price
        unrealized_pnl = market_value - cost
        unrealized_pct = (unrealized_pnl / cost * 100) if cost > 0 else 0
        total_return = unrealized_pnl + divs
        total_return_pct = (total_return / cost * 100) if cost > 0 else 0

        results[ticker] = {
            "shares": round(shares, 6),
            "current_price": current_price,
            "market_value": round(market_value, 2),
            "cost_basis": round(cost, 2),
            "unrealized_pnl": round(unrealized_pnl, 2),
            "unrealized_pct": round(unrealized_pct, 2),
            "dividends": round(divs, 2),
            "total_return": round(total_return, 2),
            "total_return_pct": round(total_return_pct, 2),
            "change_today_pct": prices[price_key]["change_pct"]
        }

        total_cost += cost
        total_value += market_value
        total_dividends += divs

    total_pnl = total_value - total_cost
    total_pnl_pct = (total_pnl / total_cost * 100) if total_cost > 0 else 0

    return {
        "positions": results,
        "summary": {
            "total_cost": round(total_cost, 2),
            "total_value": round(total_value, 2),
            "total_unrealized_pnl": round(total_pnl, 2),
            "total_unrealized_pct": round(total_pnl_pct, 2),
            "total_dividends": round(total_dividends, 2),
            "total_return": round(total_pnl + total_dividends, 2),
            "total_return_pct": round(((total_pnl + total_dividends) / total_cost * 100) if total_cost > 0 else 0, 2)
        }
    }

# ── Aggiorna market_data.json ──────────────────────────────
def update_market_data(prices):
    market_path = DATA_DIR / "market_data.json"
    if not market_path.exists():
        return

    with open(market_path) as f:
        mdata = json.load(f)

    # Mappa symbol → index entry
    sym_map = {
        "SPY":      ("S&P 500",  "SPY",     lambda p: f"{p*10:.2f}"),  # SPY*10 ≈ S&P 500
        "QQQ":      ("NASDAQ",   "QQQ",     None),
        "^VIX":     ("VIX",      "VIX",     None),
        "EURUSD=X": ("EUR/USD",  "EURUSD",  None),
        "GLD":      ("Gold",     "GLD",     None),
        "USO":      ("Oil WTI",  "USO",     None),
        "TLT":      ("US 10Y",   "TLT",     None),
        "BTC-USD":  ("BTC",      "BTC",     None),
        "NVDA":     ("NVDA",     "NVDA",    None),
        "LLY":      ("LLY",      "LLY",     None),
        "AVGO":     ("AVGO",     "AVGO",    None),
        "XOM":      ("XOM",      "XOM",     None),
        "ASML":     ("ASML",     "ASML",    None),
        "EQIX":     ("EQIX",     "EQIX",    None),
        "JPM":      ("JPM",      "JPM",     None),
    }

    indices = mdata.get("indices", [])
    updated = 0

    for yf_sym, (name, json_sym, _) in sym_map.items():
        if yf_sym not in prices:
            continue
        p = prices[yf_sym]

        for idx, entry in enumerate(indices):
            if entry.get("symbol") == json_sym or entry.get("name") == name:
                sign = "+" if p["change_pct"] >= 0 else ""
                indices[idx]["price"] = p["price"]
                indices[idx]["raw"] = p["price"]
                indices[idx]["value"] = f"${p['price']:,.2f}" if p["price"] > 100 else f"${p['price']:.2f}"
                indices[idx]["change"] = f"{sign}{p['change_pct']:.2f}%"
                indices[idx]["direction"] = p["direction"]
                updated += 1
                break

    # Aggiorna timestamp
    mdata["lastUpdated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    mdata["source"] = f"yfinance — aggiornato {datetime.now().strftime('%d/%m/%Y %H:%M')} VPS"
    mdata["indices"] = indices

    with open(market_path, "w") as f:
        json.dump(mdata, f, indent=2, ensure_ascii=False)

    print(f"  ✅ market_data.json aggiornato ({updated} prezzi)")

# ── Salva snapshot P&L ─────────────────────────────────────
def save_pnl_snapshot(pnl_data):
    snapshot_path = DATA_DIR / "portfolio_pnl.json"
    pnl_data["lastUpdated"] = datetime.now(timezone.utc).isoformat()
    with open(snapshot_path, "w") as f:
        json.dump(pnl_data, f, indent=2, ensure_ascii=False)
    print(f"  ✅ portfolio_pnl.json salvato")

# ── Telegram notification ──────────────────────────────────
def send_telegram(message: str):
    if not TELEGRAM_TOKEN or TELEGRAM_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        print(f"  ℹ️  Telegram non configurato — messaggio: {message[:100]}")
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    try:
        r = requests.post(url, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }, timeout=10)
        if r.ok:
            print(f"  📱 Telegram: messaggio inviato")
        else:
            print(f"  ⚠️  Telegram error: {r.status_code} {r.text[:100]}")
    except Exception as e:
        print(f"  ❌ Telegram failed: {e}")

# ── Check alert ────────────────────────────────────────────
def check_alerts(pnl_data, prices):
    alerts = []

    # Alert su variazioni di prezzo giornaliero
    for ticker, pos in pnl_data.get("positions", {}).items():
        daily_change = pos.get("change_today_pct", 0)
        if abs(daily_change) >= ALERT_THRESHOLD:
            emoji = "🚀" if daily_change > 0 else "🔴"
            alerts.append(
                f"{emoji} <b>{ticker}</b>: {'+' if daily_change > 0 else ''}{daily_change:.1f}% oggi"
                f"\n   Valore: ${pos['market_value']:.2f} | P&L: "
                f"{'+'if pos['unrealized_pnl']>0 else ''}{pos['unrealized_pnl']:.2f} ({pos['unrealized_pct']:+.1f}%)"
            )

    # Alert VIX > 30 (paura di mercato)
    if "^VIX" in prices and prices["^VIX"]["price"] > 30:
        alerts.append(f"⚠️ <b>VIX ALTO: {prices['^VIX']['price']:.1f}</b> — alta volatilità, mercati in paura")

    # Alert VIX < 15 (complacency)
    if "^VIX" in prices and prices["^VIX"]["price"] < 15:
        alerts.append(f"🟢 VIX basso: {prices['^VIX']['price']:.1f} — mercati tranquilli")

    # Invia solo se ci sono alert reali — nessun messaggio di routine
    if alerts:
        summary = pnl_data.get("summary", {})
        header = (
            f"📊 <b>Portfolio Alert — {datetime.now().strftime('%d/%m %H:%M')}</b>\n\n"
            + "\n\n".join(alerts)
            + f"\n\n💼 <b>Totale:</b> ${summary.get('total_value', 0):.2f} "
            f"({'+' if summary.get('total_unrealized_pct', 0) > 0 else ''}"
            f"{summary.get('total_unrealized_pct', 0):.1f}%)"
        )
        send_telegram(header)

# ── Main ───────────────────────────────────────────────────
def main():
    now = datetime.now()
    print(f"\n{'='*55}")
    print(f" Portfolio Monitor — {now.strftime('%A %d/%m/%Y %H:%M:%S')}")
    print(f"{'='*55}")

    # 1. Fetch prezzi
    prices = fetch_prices(WATCHLIST)
    if not prices:
        print("❌ Nessun prezzo ottenuto — skip")
        return

    print(f"  📈 Prezzi ottenuti: {len(prices)}/{len(WATCHLIST)}")

    # Stampa prezzi chiave
    for sym in ["NVDA", "LLY", "AVGO", "XOM", "ASML", "SPY", "^VIX"]:
        if sym in prices:
            p = prices[sym]
            arrow = "↑" if p["direction"] == "up" else "↓"
            print(f"    {sym:10s} ${p['price']:>10.2f}  {arrow} {p['change_pct']:+.2f}%")

    # 2. Carica posizioni portfolio
    positions = load_portfolio()
    if positions:
        print(f"\n  💼 Posizioni portfolio: {len(positions)} titoli")

    # 3. Calcola P&L
    pnl_data = calculate_pnl(positions, prices)
    summary = pnl_data["summary"]
    print(f"\n  💰 Portfolio Summary:")
    print(f"    Valore:   ${summary['total_value']:.2f}")
    print(f"    Costo:    ${summary['total_cost']:.2f}")
    print(f"    P&L:      ${summary['total_unrealized_pnl']:+.2f} ({summary['total_unrealized_pct']:+.1f}%)")
    print(f"    Dividendi:${summary['total_dividends']:.2f}")
    print(f"    Return:   ${summary['total_return']:+.2f} ({summary['total_return_pct']:+.1f}%)")

    # 4. Aggiorna JSON files
    update_market_data(prices)
    save_pnl_snapshot(pnl_data)
    update_virtual_portfolio_prices(prices)

    # 5. Check e invia alert Telegram
    check_alerts(pnl_data, prices)

    print(f"\n  ✅ Monitor completato — {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    main()
