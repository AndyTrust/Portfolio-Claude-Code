#!/usr/bin/env python3
"""
Fetch e parse dati OpenInsider Form 4 per tutti i ticker del portfolio.
Script leggero (solo stdlib) — alternativa veloce a fetch_all_daily.py.

Uso:
  python3 scripts/fetch_insider.py
  python3 scripts/fetch_insider.py --tickers TSLA,BLK,CRSP
  python3 scripts/fetch_insider.py --real-only
  python3 scripts/fetch_insider.py --days 90

Output: data/insider_data.json (formato compatibile con render-money-follow.js)
Log:    ~/portfolio_logs/insider.log
"""

import urllib.request
import urllib.error
import re
import json
import time
import argparse
import sys
import os
import datetime
import logging
from pathlib import Path

# ── Percorsi VPS ─────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent.parent
DATA_DIR   = BASE_DIR / "data"
LOG_DIR    = Path.home() / "portfolio_logs"
INSIDER_JSON = DATA_DIR / "insider_data.json"
ENV_FILE   = BASE_DIR / ".env"

LOG_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# ── Logging ───────────────────────────────────────────────────────────────────
log = logging.getLogger("fetch_insider")
log.setLevel(logging.INFO)
_fh = logging.FileHandler(LOG_DIR / "insider.log")
_fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
_sh = logging.StreamHandler(sys.stderr)
_sh.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
log.addHandler(_fh)
log.addHandler(_sh)

# ── Ticker ────────────────────────────────────────────────────────────────────
REAL_POSITIONS = ["TSLA", "BLK", "CRSP", "ACHR", "TEM", "CRWV"]
WATCHLIST      = ["NVDA", "AVGO", "MU", "ASML", "LLY", "NVO", "XOM", "NEE", "DLR", "EQIX"]
ALL_TICKERS    = REAL_POSITIONS + WATCHLIST

TODAY     = datetime.date.today()
TODAY_STR = TODAY.isoformat()

# ── Telegram ──────────────────────────────────────────────────────────────────
def _load_telegram_token() -> tuple[str, str]:
    """Legge TELEGRAM_TOKEN e TELEGRAM_CHAT_ID da .env o environment."""
    token   = os.environ.get("TELEGRAM_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "320293500")
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith("TELEGRAM_TOKEN="):
                token = line.split("=", 1)[1].strip().strip('"')
            elif line.startswith("TELEGRAM_CHAT_ID="):
                chat_id = line.split("=", 1)[1].strip().strip('"')
    return token, chat_id


def send_telegram(message: str) -> None:
    """Invia messaggio Telegram. Fallisce silenziosamente se non configurato."""
    token, chat_id = _load_telegram_token()
    if not token:
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": message, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=payload,
                                  headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        log.warning(f"Telegram send failed: {e}")


# ── HTTP helper ───────────────────────────────────────────────────────────────
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml",
}

def fetch_html(url: str, timeout: int = 20) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return f"ERROR: HTTP {e.code} {e.reason}"
    except Exception as e:
        return f"ERROR: {e}"


# ── Parser OpenInsider ────────────────────────────────────────────────────────
def parse_openinsider_rows(html: str, ticker: str) -> list[dict]:
    """Estrae righe dalla tabella OpenInsider tramite regex (senza BeautifulSoup)."""
    rows = re.findall(r'<tr[^>]*style="[^"]*">(.*?)</tr>', html, re.DOTALL)
    results = []
    for row in rows:
        sec_match  = re.search(
            r'href="(http://www\.sec\.gov/[^"]+)"[^>]*>(\d{4}-\d{2}-\d{2})', row
        )
        name_match = re.search(r'href="/insider/[^"]+"[^>]*>([^<]+)</a>', row)
        if not (sec_match and name_match):
            continue

        dates      = re.findall(r'<div>(\d{4}-\d{2}-\d{2})</div>', row)
        title_m    = re.search(r'</a></td><td>([^<]+)</td><td>', row)
        type_m     = re.search(
            r'<td>(P - Purchase|S - Sale[^<]*|F - Tax[^<]*|M - Option[^<]*'
            r'|X - Option[^<]*|A - Grant[^<]*|D - Sale[^<]*)</td>', row
        )
        price_m    = re.search(r'<td align=right>\$([0-9,.]+)</td>', row)
        qty_m      = re.search(r'<td align=right>(-?[0-9,]+)</td>', row)
        all_vals   = re.findall(r'<td align=right>(-?\$[0-9,]+(?:\.[0-9]+)?)</td>', row)

        trade_type = type_m.group(1).strip() if type_m else ""
        is_buy     = trade_type.startswith("P - Purchase") or trade_type.startswith("A - Grant")
        action     = "BUY" if is_buy else "SELL"

        is_planned = "10b5-1" in trade_type
        tx_type    = "10b5-1 (pianificato)" if is_planned else "OPEN MARKET"

        value_str = all_vals[-1] if all_vals else "—"
        signal    = _compute_signal(action, is_planned, value_str)

        insider = name_match.group(1).strip()
        title   = title_m.group(1).strip() if title_m else ""

        results.append({
            "date":      sec_match.group(2),
            "ticker":    ticker,
            "insider":   insider,
            "role":      title,
            "action":    action,
            "qty":       (qty_m.group(1) if qty_m else "") + " az",
            "price":     "$" + price_m.group(1) if price_m else "—",
            "value":     ("+" if is_buy else "-") + value_str,
            "type":      tx_type,
            "signal":    signal,
            "sourceUrl": f"http://openinsider.com/search?q={ticker}",
            "secUrl":    sec_match.group(1),
            "note":      f"{insider} ({title}) — {tx_type}.",
            "source":    "openinsider",
        })
    return results


def _compute_signal(action: str, is_planned: bool, value_str: str) -> str:
    if is_planned:
        return "NEUTRO"
    val = _parse_value(value_str)
    if action == "BUY":
        return "FORTE POSITIVO" if val > 1_000_000 else "POSITIVO"
    else:
        return "FORTE NEGATIVO" if val > 5_000_000 else "NEGATIVO"


def _parse_value(val_str: str) -> float:
    try:
        cleaned = re.sub(r"[^0-9.]", "", val_str.replace(",", ""))
        return float(cleaned) if cleaned else 0.0
    except Exception:
        return 0.0


# ── Convergenza ───────────────────────────────────────────────────────────────
def compute_convergence(transactions: list[dict]) -> dict:
    buy_counts: dict[str, int]   = {}
    sell_counts: dict[str, int]  = {}
    buy_values: dict[str, float] = {}

    for tx in transactions:
        t = tx.get("ticker", "")
        if t not in ALL_TICKERS or tx.get("signal") == "NEUTRO":
            continue
        if tx.get("action") == "BUY":
            buy_counts[t]  = buy_counts.get(t, 0) + 1
            buy_values[t]  = buy_values.get(t, 0.0) + abs(_parse_value(tx.get("value", "0")))
        elif tx.get("action") == "SELL":
            sell_counts[t] = sell_counts.get(t, 0) + 1

    strong_buy  = [t for t, c in buy_counts.items()  if c >= 2 or buy_values.get(t, 0) > 1_000_000]
    strong_sell = [t for t, c in sell_counts.items() if c >= 2]
    neutral     = [t for t in ALL_TICKERS if t not in strong_buy and t not in strong_sell]

    parts = []
    if strong_buy:
        parts.append(f"Accumulo insider: {', '.join(strong_buy[:3])}")
    if strong_sell:
        parts.append(f"Distribuzione insider: {', '.join(strong_sell[:3])}")

    return {
        "strongBuy":    strong_buy[:6],
        "strongSell":   strong_sell[:6],
        "neutral":      neutral[:6],
        "lastAnalysis": TODAY_STR,
        "summary":      ". ".join(parts) or "Nessuna convergenza forte rilevata.",
    }


# ── Aggiorna insider_data.json ────────────────────────────────────────────────
def update_insider_json(new_transactions: list[dict]) -> dict:
    """Merge nuove transazioni con storico esistente, dedup, salva JSON."""
    existing: dict = {}
    if INSIDER_JSON.exists():
        try:
            with open(INSIDER_JSON) as f:
                existing = json.load(f)
        except json.JSONDecodeError:
            log.warning("insider_data.json corrotto — verrà riscritto")

    old_tx = existing.get("transactions", [])
    old_keys = {(tx["date"], tx["ticker"], tx["insider"]) for tx in old_tx}
    filtered_new = [
        tx for tx in new_transactions
        if (tx["date"], tx["ticker"], tx["insider"]) not in old_keys
    ]

    all_tx = filtered_new + old_tx
    all_tx.sort(key=lambda x: x.get("date", ""), reverse=True)
    all_tx = all_tx[:60]

    convergence = compute_convergence(all_tx[:30])

    output = {
        "lastUpdated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "nextUpdate":  (TODAY + datetime.timedelta(days=3)).isoformat() + "T06:00:00Z",
        "source":      "OpenInsider scraping — fetch_insider.py",
        "transactions": all_tx,
        "convergence":  convergence,
        "politicians":  existing.get("politicians", []),
    }

    with open(INSIDER_JSON, "w") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    log.info(f"insider_data.json: {len(all_tx)} transazioni totali, {len(filtered_new)} nuove")
    return output, len(filtered_new)


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Fetch OpenInsider Form 4 — VPS Portfolio"
    )
    parser.add_argument("--tickers", default=",".join(ALL_TICKERS),
                        help="Ticker separati da virgola (default: tutti)")
    parser.add_argument("--real-only", action="store_true",
                        help="Solo posizioni reali (senza watchlist)")
    parser.add_argument("--days", type=int, default=730,
                        help="Finestra temporale giorni (default: 730)")
    parser.add_argument("--no-telegram", action="store_true",
                        help="Non inviare notifica Telegram")
    args = parser.parse_args()

    tickers = REAL_POSITIONS if args.real_only else [
        t.strip().upper() for t in args.tickers.split(",") if t.strip()
    ]

    log.info(f"{'='*55}")
    log.info(f"fetch_insider.py — {TODAY_STR} — {len(tickers)} ticker")
    log.info(f"{'='*55}")

    all_new: list[dict] = []
    ticker_summary: list[str] = []

    for ticker in tickers:
        log.info(f"Fetching {ticker}...")
        url = (
            f"http://openinsider.com/screener?s={ticker}&o=&pl=&ph=&ll=&lh="
            f"&fd={args.days}&fdr=&td=0&tdr=&fdlyl=&fdlyh=&daysago="
            f"&xp=1&xs=1&xf=1&xm=1&xx=1&vl=&vh=&ocl=&och=&sic1=-1"
            f"&sicl=100&sich=9999&grp=0&nfl=&nfh=&nil=&nih=&nol=&noh="
            f"&v2l=&v2h=&oc2l=&oc2h=&sortcol=0&cnt=100&page=1"
        )
        html = fetch_html(url)
        if html.startswith("ERROR"):
            log.error(f"  {ticker}: {html}")
            ticker_summary.append(f"  ❌ {ticker}: errore fetch")
            time.sleep(0.5)
            continue

        rows  = parse_openinsider_rows(html, ticker)
        buys  = [r for r in rows if r["action"] == "BUY"]
        sells = [r for r in rows if r["action"] == "SELL"]
        all_new.extend(rows)

        summary = f"  {ticker}: {len(buys)} buy / {len(sells)} sell"
        log.info(summary)
        ticker_summary.append(f"  {'🟢' if buys else '🔴'} {ticker}: {len(buys)} BUY / {len(sells)} SELL")

        for r in (buys + sells)[:2]:
            log.info(f"    {r['date']} {r['insider']} ({r['role']}) {r['action']} {r['value']}")

        time.sleep(0.9)  # rate limiting educato

    # Salva JSON
    updated, n_new = update_insider_json(all_new)
    convergence = updated["convergence"]

    # Summary stdout
    print(f"\n{'='*55}")
    print(f"FETCH INSIDER — {TODAY_STR}")
    print(f"{'='*55}")
    for line in ticker_summary:
        print(line)
    print(f"\nNuove transazioni: {n_new}")
    print(f"Convergenza BUY:  {convergence['strongBuy']}")
    print(f"Convergenza SELL: {convergence['strongSell']}")
    print(f"Summary: {convergence['summary']}")
    print(f"{'='*55}\n")

    # Notifica Telegram solo se ci sono nuove transazioni significative
    if not args.no_telegram and n_new > 0:
        strong = [
            tx for tx in all_new
            if "FORTE" in tx.get("signal", "") and tx["action"] == "BUY"
        ]
        msg_lines = [
            f"📋 <b>Insider Update — {TODAY_STR}</b>",
            f"Nuove transazioni: <b>{n_new}</b>",
        ]
        if strong:
            msg_lines.append("\n🟢 <b>Segnali forti BUY:</b>")
            for tx in strong[:3]:
                msg_lines.append(
                    f"• {tx['ticker']} — {tx['insider']} {tx['value']} [{tx['type']}]"
                )
        if convergence["strongBuy"]:
            msg_lines.append(f"\n🧲 Accumulo: {', '.join(convergence['strongBuy'])}")
        if convergence["strongSell"]:
            msg_lines.append(f"⚠️ Distribuzione: {', '.join(convergence['strongSell'])}")
        send_telegram("\n".join(msg_lines))
        log.info("Notifica Telegram inviata")


if __name__ == "__main__":
    main()
