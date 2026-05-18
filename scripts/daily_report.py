#!/usr/bin/env python3
"""
Portfolio Intelligence — Daily Report Telegram
Inviato 2 volte al giorno:
  - 08:00 CET: Morning Brief (apertura mercati + agenda + portfolio)
  - 20:00 CET: Evening Brief (chiusura + P&L giornaliero + post X.com pronti)

Uso:
  python3 scripts/daily_report.py --slot=morning
  python3 scripts/daily_report.py --slot=evening
"""

import json
import os
import argparse
import requests
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

# ── Config ────────────────────────────────────────────────
REPO_DIR   = Path(__file__).parent.parent
DATA_DIR   = REPO_DIR / "data"
REPORTS_DIR = REPO_DIR / "reports"

load_dotenv(REPO_DIR / ".env")
TELEGRAM_TOKEN   = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# ── Argomenti CLI ─────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument('--slot', choices=['morning', 'evening'], required=True)
args = parser.parse_args()


# ── Helpers ───────────────────────────────────────────────
def load_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return {}


def send_telegram(message: str):
    if not TELEGRAM_TOKEN:
        print(f"Telegram non configurato.\n{message}")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    try:
        r = requests.post(url, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }, timeout=15)
        if r.ok:
            print(f"✅ Telegram inviato ({args.slot})")
        else:
            print(f"❌ Telegram error: {r.status_code} {r.text[:200]}")
    except Exception as e:
        print(f"❌ Telegram failed: {e}")


def fmt_price(v):
    try:
        return f"${float(v):,.2f}"
    except Exception:
        return str(v)


def fmt_pct(v, plus=True):
    try:
        f = float(v)
        sign = "+" if f >= 0 and plus else ""
        return f"{sign}{f:.2f}%"
    except Exception:
        return str(v)


def pnl_emoji(v):
    try:
        return "📈" if float(v) >= 0 else "📉"
    except Exception:
        return "—"


# ── Leggi dati ────────────────────────────────────────────
def get_portfolio_data():
    vp = load_json(DATA_DIR / "virtual_portfolio.json")
    mkt = load_json(DATA_DIR / "market_data.json")
    ins = load_json(DATA_DIR / "insider_data.json")
    geo = load_json(DATA_DIR / "geopolitical_data.json")
    return vp, mkt, ins, geo


def get_market_prices(mkt):
    """Estrae prezzi indici dal market_data.json."""
    idx_map = {}
    for entry in mkt.get("indices", []):
        name = entry.get("name", "")
        idx_map[name] = {
            "value": entry.get("value", "—"),
            "change": entry.get("change", "—"),
            "direction": entry.get("direction", ""),
        }
    return idx_map


def get_portfolio_summary(vp):
    cap = vp.get("capital", {})
    positions = vp.get("positions", [])
    return cap, positions


# ── MORNING BRIEF ─────────────────────────────────────────
def build_morning_report(vp, mkt, ins, geo):
    now = datetime.now()
    date_str = now.strftime("%d/%m/%Y")
    cap, positions = get_portfolio_summary(vp)
    idx = get_market_prices(mkt)

    total_val  = cap.get("total_value", 0)
    cash       = cap.get("cash", 0)
    deployed   = cap.get("deployed", 0)
    pnl_usd    = cap.get("pnl_usd", 0)
    pnl_pct    = cap.get("pnl_pct", 0)
    starting   = cap.get("starting", 10000)
    cash_pct   = (cash / total_val * 100) if total_val else 0
    dep_pct    = (deployed / total_val * 100) if total_val else 0

    # Posizioni
    pos_lines = []
    for p in positions:
        t = p.get("ticker", "?")
        cp = p.get("current_price", p.get("entry_price", 0))
        pnl = p.get("pnl_usd", 0)
        pct = p.get("pnl_pct", 0)
        ep  = p.get("entry_price", 0)
        chg_day = p.get("change_today_pct", 0)
        e = pnl_emoji(pnl)
        sign = "+" if float(pnl) >= 0 else ""
        pos_lines.append(
            f"  • <b>{t}</b>  {fmt_price(cp)}  ({fmt_pct(chg_day)} oggi)  "
            f"P&amp;L: {sign}{fmt_price(pnl)} ({fmt_pct(pct)})"
        )

    # Alert insider
    conv = ins.get("convergence", {})
    strong_buy  = conv.get("strongBuy", [])
    strong_sell = conv.get("strongSell", [])
    alert_lines = []
    if strong_sell:
        alert_lines.append(f"⚠️ <b>VENDITA MASSIVA:</b> {', '.join(strong_sell)} — controlla insider flow")
    if strong_buy:
        alert_lines.append(f"✅ <b>ACCUMULO:</b> {', '.join(strong_buy)}")
    # Alert fisso CRWV
    alert_lines.append("⚠️ <b>CRWV</b>: $77.6M venduti in 7gg — NON in portfolio (corretto)")

    # Mercati
    sp500 = idx.get("S&P 500", {})
    nasdaq = idx.get("NASDAQ", {})
    vix   = idx.get("VIX", {})
    btc   = idx.get("BTC", {})
    oil   = idx.get("Oil WTI", {})

    msg = f"""🌅 <b>MORNING BRIEF — {date_str}</b>
<i>Portfolio Intelligence PRO v5.0</i>

━━━━━━━━━━━━━━━━━━━━━━━━
💼 <b>PORTFOLIO VIRTUALE</b>
━━━━━━━━━━━━━━━━━━━━━━━━
Valore totale: <b>{fmt_price(total_val)}</b> / ${starting:,.0f}
P&amp;L totale: <b>{pnl_emoji(pnl_usd)} {fmt_price(pnl_usd)} ({fmt_pct(pnl_pct)})</b>
Cash: <b>{fmt_price(cash)}</b> ({cash_pct:.1f}%) | Deployed: {fmt_price(deployed)} ({dep_pct:.1f}%)

<b>POSIZIONI LIVE:</b>
{chr(10).join(pos_lines) if pos_lines else '  — Nessuna posizione'}

━━━━━━━━━━━━━━━━━━━━━━━━
🌍 <b>MERCATI APERTURA</b>
━━━━━━━━━━━━━━━━━━━━━━━━
S&amp;P 500: {sp500.get('value','—')}  {sp500.get('change','—')}
NASDAQ:   {nasdaq.get('value','—')}  {nasdaq.get('change','—')}
VIX:      {vix.get('value','—')}  {vix.get('change','—')}
BTC:      {btc.get('value','—')}  {btc.get('change','—')}
Oil WTI:  {oil.get('value','—')}  {oil.get('change','—')}

━━━━━━━━━━━━━━━━━━━━━━━━
🚨 <b>INSIDER ALERT</b>
━━━━━━━━━━━━━━━━━━━━━━━━
{chr(10).join(alert_lines)}

━━━━━━━━━━━━━━━━━━━━━━━━
📋 <b>WATCH QUEUE</b>
━━━━━━━━━━━━━━━━━━━━━━━━"""

    watch = vp.get("watch_queue", [])
    for w in watch:
        ticker  = w.get("ticker", "?")
        trigger = w.get("entry_trigger", "—")
        reason  = w.get("reason", "")
        msg += f"\n  • <b>{ticker}</b> — entry se {trigger} | {reason}"

    msg += f"""

━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dati aggiornati: {mkt.get('lastUpdated','—')[:16].replace('T',' ')} UTC
🔗 Dashboard: andytrust.github.io/Portfolio-Claude-Code"""

    return msg


# ── EVENING BRIEF ─────────────────────────────────────────
def build_evening_report(vp, mkt, ins, geo):
    now = datetime.now()
    date_str = now.strftime("%d/%m/%Y")
    cap, positions = get_portfolio_summary(vp)
    idx = get_market_prices(mkt)

    total_val = cap.get("total_value", 0)
    pnl_usd   = cap.get("pnl_usd", 0)
    pnl_pct   = cap.get("pnl_pct", 0)
    cash      = cap.get("cash", 0)

    # Calcola P&L giornaliero stimato
    day_pnl = sum(
        p.get("current_value", 0) * p.get("change_today_pct", 0) / 100
        for p in positions
        if p.get("current_value")
    )

    # Posizione migliore e peggiore
    best  = max(positions, key=lambda p: p.get("pnl_pct", 0), default={})
    worst = min(positions, key=lambda p: p.get("pnl_pct", 0), default={})

    sp500  = idx.get("S&P 500", {})
    nasdaq = idx.get("NASDAQ", {})
    vix    = idx.get("VIX", {})
    gold   = idx.get("Gold", {})

    # Ultimi insider dal JSON
    txs = ins.get("transactions", [])[:3]
    insider_lines = []
    for tx in txs:
        ticker = tx.get("ticker", "?")
        role   = tx.get("role", "?")
        action = "VENDITA" if "sale" in role.lower() or "sell" in role.lower() else "ACQUISTO"
        date   = tx.get("date", "?")
        insider_lines.append(f"  • {date} <b>{ticker}</b> {action} ({role})")

    # Post X.com pronti (link alla pagina)
    msg = f"""🌙 <b>EVENING BRIEF — {date_str}</b>
<i>Portfolio Intelligence PRO v5.0</i>

━━━━━━━━━━━━━━━━━━━━━━━━
💼 <b>CHIUSURA PORTFOLIO</b>
━━━━━━━━━━━━━━━━━━━━━━━━
Valore: <b>{fmt_price(total_val)}</b>
P&amp;L totale: <b>{pnl_emoji(pnl_usd)} {fmt_price(pnl_usd)} ({fmt_pct(pnl_pct)})</b>
Delta oggi: <b>{pnl_emoji(day_pnl)} {fmt_price(abs(day_pnl))}</b>
Cash disponibile: <b>{fmt_price(cash)}</b>

<b>Migliore:</b> {best.get('ticker','—')} {fmt_pct(best.get('pnl_pct',0))}
<b>Peggiore:</b> {worst.get('ticker','—')} {fmt_pct(worst.get('pnl_pct',0))}

━━━━━━━━━━━━━━━━━━━━━━━━
📊 <b>CHIUSURA MERCATI</b>
━━━━━━━━━━━━━━━━━━━━━━━━
S&amp;P 500: {sp500.get('value','—')}  {sp500.get('change','—')}
NASDAQ:   {nasdaq.get('value','—')}  {nasdaq.get('change','—')}
VIX:      {vix.get('value','—')} | Gold: {gold.get('value','—')}

━━━━━━━━━━━━━━━━━━━━━━━━
🔍 <b>INSIDER RECENTI</b>
━━━━━━━━━━━━━━━━━━━━━━━━
{chr(10).join(insider_lines) if insider_lines else '  — Nessuna transazione recente'}

━━━━━━━━━━━━━━━━━━━━━━━━
📱 <b>POST X.COM PRONTI</b>
━━━━━━━━━━━━━━━━━━━━━━━━
Thread 8 tweet + Articolo long-form disponibili su:
🔗 andytrust.github.io/Portfolio-Claude-Code/reports.html

━━━━━━━━━━━━━━━━━━━━━━━━
🗓️ <b>DOMANI DA MONITORARE</b>
━━━━━━━━━━━━━━━━━━━━━━━━
• Insider fetch: 07:00 — nuovi Form 4 SEC
• Prezzi apertura: 15:30 CET (apertura NYSE)
• VIX target: {'⚠️ rimane elevato' if float(vix.get('value',20)) > 18 else '✅ sotto controllo'}
• Watch queue: ASML <$1,100 | EQIX <$950 | JPM <$230

━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ Aggiornato: {mkt.get('lastUpdated','—')[:16].replace('T',' ')} UTC"""

    return msg


# ── MAIN ─────────────────────────────────────────────────
def main():
    vp, mkt, ins, geo = get_portfolio_data()

    if args.slot == "morning":
        print("📤 Generando Morning Brief...")
        message = build_morning_report(vp, mkt, ins, geo)
    else:
        print("📤 Generando Evening Brief...")
        message = build_evening_report(vp, mkt, ins, geo)

    print(message)
    print("\n" + "─" * 60)
    send_telegram(message)


if __name__ == "__main__":
    main()
