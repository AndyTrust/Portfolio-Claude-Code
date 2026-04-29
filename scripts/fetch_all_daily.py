#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════════
# PORTFOLIO INTELLIGENCE — Daily Data Fetcher
# Eseguito ogni giorno alle 06:00 UTC dal task schedulato
#
# Cosa fa:
#   1. Scrape OpenInsider per tutti i ticker monitorati
#   2. Fetch SEC EDGAR Form 4 via API ufficiale (EFTS)
#   3. Fetch Capitol Trades (politici STOCK Act)
#   4. Aggiorna data/insider_data.json
#   5. Aggiorna data/market_data.json con timestamp
#   6. Genera report markdown giornaliero in reports/intelligence_YYYYMMDD.md
#
# Dipendenze: pip3 install requests beautifulsoup4 --break-system-packages
# ═══════════════════════════════════════════════════════════════════

import json
import os
import re
import sys
import time
import datetime
import traceback
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing dependencies...")
    os.system("pip3 install requests beautifulsoup4 --break-system-packages -q")
    import requests
    from bs4 import BeautifulSoup

# ── Percorsi ──────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
DATA_DIR  = BASE_DIR / "data"
REPORTS_DIR = BASE_DIR / "reports"
INSIDER_JSON = DATA_DIR / "insider_data.json"
MARKET_JSON  = DATA_DIR / "market_data.json"
SOURCES_JSON = DATA_DIR / "sources.json"

TODAY = datetime.date.today()
TODAY_STR = TODAY.strftime("%Y-%m-%d")
TODAY_IT  = TODAY.strftime("%d/%m/%Y")
REPORT_PATH = REPORTS_DIR / f"intelligence_{TODAY.strftime('%Y%m%d')}.md"

# ── Ticker monitorati ─────────────────────────────────────────────
TICKERS_REAL    = ["TSLA", "BLK", "CRSP", "ACHR", "TEM", "CRWV"]
TICKERS_WATCH   = ["NVDA", "AVGO", "MU", "ASML", "LLY", "NVO", "XOM", "NEE", "DLR", "EQIX"]
ALL_TICKERS     = TICKERS_REAL + TICKERS_WATCH

HEADERS = {
    "User-Agent": "Mozilla/5.0 Portfolio-Intelligence-Bot/1.0 (andrea@140grammi.com)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ─────────────────────────────────────────────────────────────────
# 1. OPENINSIDER SCRAPER
# ─────────────────────────────────────────────────────────────────
def fetch_openinsider_ticker(ticker: str, days: int = 90) -> list:
    """Scrape OpenInsider per un ticker — ultimi N giorni."""
    url = (
        f"http://openinsider.com/screener?s={ticker}&o=&pl=&ph=&ll=&lh="
        f"&fd={days}&fdr=&td=0&tdr=&fdlyl=&fdlyh=&daysago=&xp=1&xs=1"
        f"&xf=1&xm=1&xx=1&vl=&vh=&ocl=&och=&sic1=-1&sicl=100&sich=9999"
        f"&grp=0&nfl=&nfh=&nil=&nih=&nol=&noh=&v2l=&v2h=&oc2l=&oc2h="
        f"&sortcol=0&cnt=40&page=1"
    )
    transactions = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        table = soup.find("table", class_="tinytable")
        if not table:
            return []
        rows = table.find_all("tr")[1:]  # skip header
        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 12:
                continue
            # OpenInsider columns: X, Filing, Trade, Ticker, Company, Insider, Title, Trade Type, Price, Qty, Owned, ΔOwn, Value
            try:
                filing_date = cols[1].get_text(strip=True)
                trade_date  = cols[2].get_text(strip=True)
                ins_ticker  = cols[3].get_text(strip=True).upper()
                insider_name = cols[5].get_text(strip=True)
                title        = cols[6].get_text(strip=True)
                trade_type   = cols[7].get_text(strip=True)
                price        = cols[8].get_text(strip=True)
                qty          = cols[9].get_text(strip=True)
                value        = cols[12].get_text(strip=True) if len(cols) > 12 else "—"

                # Normalizza azione
                if trade_type.startswith("P"):
                    action = "BUY"
                elif trade_type.startswith("S"):
                    action = "SELL"
                else:
                    action = trade_type

                # Segnale
                if action == "BUY" and "10b5-1" not in trade_type:
                    signal = "POSITIVO" if abs(_parse_value(value)) < 5_000_000 else "FORTE POSITIVO"
                elif action == "SELL" and "10b5-1" not in trade_type:
                    signal = "NEGATIVO" if abs(_parse_value(value)) < 5_000_000 else "FORTE NEGATIVO"
                else:
                    signal = "NEUTRO"

                tx_type = "10b5-1 (pianificato)" if "10b5-1" in trade_type else "OPEN MARKET"

                transactions.append({
                    "date": _normalize_date(trade_date),
                    "ticker": ins_ticker,
                    "insider": insider_name,
                    "role": title,
                    "action": action,
                    "qty": qty + " az",
                    "price": "$" + price,
                    "value": ("+" if action == "BUY" else "-") + value,
                    "type": tx_type,
                    "signal": signal,
                    "sourceUrl": f"http://openinsider.com/search?q={ins_ticker}",
                    "secUrl": f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={ins_ticker}&type=4&dateb=&owner=include&count=40",
                    "note": f"{insider_name} ({title}) — {tx_type}.",
                    "source": "openinsider",
                })
            except Exception:
                continue
    except Exception as e:
        print(f"  ⚠ OpenInsider {ticker}: {e}")
    return transactions


def _parse_value(val_str: str) -> float:
    """Converti stringa valore in float."""
    try:
        cleaned = re.sub(r"[^0-9.]", "", val_str.replace(",", ""))
        return float(cleaned) if cleaned else 0.0
    except:
        return 0.0


def _normalize_date(date_str: str) -> str:
    """Converti varie date in YYYY-MM-DD."""
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y-%m-%dT%H:%M:%S", "%m/%d/%y"):
        try:
            return datetime.datetime.strptime(date_str.strip(), fmt).strftime("%Y-%m-%d")
        except:
            pass
    return date_str.strip()


# ─────────────────────────────────────────────────────────────────
# 2. SEC EDGAR EFTS API (Form 4 ufficiale)
# ─────────────────────────────────────────────────────────────────
def fetch_sec_form4_recent(days: int = 14) -> list:
    """Fetch Form 4 recenti da SEC EDGAR full-text search API."""
    start = (TODAY - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    url = (
        f"https://efts.sec.gov/LATEST/search-index?q=%22{'+'.join(ALL_TICKERS)}%22"
        f"&forms=4&dateRange=custom&startdt={start}&enddt={TODAY_STR}&hits.hits._source=period_of_report"
        f"&hits.hits._source=entity_name&hits.hits._source=file_date&hits.hits.total.value=true"
        f"&hits.hits._source=file_num"
    )
    results = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        if resp.ok:
            data = resp.json()
            hits = data.get("hits", {}).get("hits", [])
            for h in hits[:20]:
                src = h.get("_source", {})
                results.append({
                    "entity": src.get("entity_name", ""),
                    "file_date": src.get("file_date", ""),
                    "period": src.get("period_of_report", ""),
                })
    except Exception as e:
        print(f"  ⚠ SEC EDGAR: {e}")
    return results


# ─────────────────────────────────────────────────────────────────
# 3. CAPITOL TRADES (politici — solo fetch pubblico)
# ─────────────────────────────────────────────────────────────────
def fetch_capitol_trades_recent() -> list:
    """Fetch ultimi trade politici da Capitol Trades."""
    url = "https://www.capitoltrades.com/trades?pageSize=20"
    trades = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        # Cerca righe tabella
        rows = soup.select("table tbody tr") or soup.select("[data-trade-id]")
        for row in rows[:10]:
            cells = row.find_all("td")
            if len(cells) < 5:
                continue
            try:
                trades.append({
                    "date": cells[0].get_text(strip=True),
                    "name": cells[1].get_text(strip=True),
                    "party": "",
                    "action": cells[3].get_text(strip=True).upper(),
                    "ticker": cells[2].get_text(strip=True).upper(),
                    "value": cells[4].get_text(strip=True),
                    "sourceUrl": "https://www.capitoltrades.com/trades",
                })
            except:
                continue
    except Exception as e:
        print(f"  ⚠ Capitol Trades: {e}")
    return trades


# ─────────────────────────────────────────────────────────────────
# 4. Calcola convergenza smart money
# ─────────────────────────────────────────────────────────────────
def compute_convergence(transactions: list) -> dict:
    """Calcola quali ticker hanno convergenza buy/sell."""
    buy_counts  = {}
    sell_counts = {}
    buy_values  = {}

    for tx in transactions:
        t = tx.get("ticker", "")
        if t not in ALL_TICKERS:
            continue
        if tx.get("action") == "BUY" and tx.get("signal") not in ["NEUTRO"]:
            buy_counts[t]  = buy_counts.get(t, 0) + 1
            buy_values[t]  = buy_values.get(t, 0) + abs(_parse_value(tx.get("value", "0")))
        elif tx.get("action") == "SELL" and tx.get("signal") not in ["NEUTRO"]:
            sell_counts[t] = sell_counts.get(t, 0) + 1

    strong_buy  = [t for t, c in buy_counts.items()  if c >= 2 or buy_values.get(t, 0) > 1_000_000]
    strong_sell = [t for t, c in sell_counts.items() if c >= 2]
    neutral     = [t for t in ALL_TICKERS if t not in strong_buy and t not in strong_sell]

    top_buy = sorted(buy_values.items(), key=lambda x: x[1], reverse=True)
    summary_parts = []
    if strong_buy:
        summary_parts.append(f"Accumulo insider: {', '.join(strong_buy[:3])}")
    if strong_sell:
        summary_parts.append(f"Distribuzione insider: {', '.join(strong_sell[:3])}")

    return {
        "strongBuy":  strong_buy[:6],
        "strongSell": strong_sell[:6],
        "neutral":    neutral[:6],
        "lastAnalysis": TODAY_STR,
        "summary": ". ".join(summary_parts) or "Nessuna convergenza forte rilevata oggi.",
    }


# ─────────────────────────────────────────────────────────────────
# 5. Aggiorna insider_data.json
# ─────────────────────────────────────────────────────────────────
def update_insider_json(new_transactions: list, politicians: list):
    """Aggiorna data/insider_data.json mantenendo storico."""
    existing = {}
    if INSIDER_JSON.exists():
        with open(INSIDER_JSON) as f:
            existing = json.load(f)

    # Mantieni storico (ultime 60 tx) + aggiungi nuove
    old_tx = existing.get("transactions", [])
    # Rimuovi duplicati (stessa data + ticker + insider)
    existing_keys = {(tx["date"], tx["ticker"], tx["insider"]) for tx in old_tx}
    filtered_new = [
        tx for tx in new_transactions
        if (tx["date"], tx["ticker"], tx["insider"]) not in existing_keys
    ]
    all_tx = filtered_new + old_tx
    all_tx.sort(key=lambda x: x.get("date", ""), reverse=True)
    all_tx = all_tx[:60]  # mantieni massimo 60 transazioni

    convergence = compute_convergence(all_tx[:30])

    # Aggiorna politici (mantieni ultimi 20)
    old_pols = existing.get("politicians", [])
    pols_merged = politicians + [p for p in old_pols if p not in politicians]
    pols_merged = pols_merged[:20]

    output = {
        "lastUpdated": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "nextUpdate":  (TODAY + datetime.timedelta(days=1)).strftime("%Y-%m-%d") + "T06:00:00Z",
        "source": "OpenInsider scraping + SEC EDGAR EFTS API — aggiornato automaticamente",
        "transactions": all_tx,
        "convergence": convergence,
        "politicians": pols_merged,
    }

    with open(INSIDER_JSON, "w") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"  ✅ insider_data.json: {len(all_tx)} transazioni, {len(filtered_new)} nuove")
    return output


# ─────────────────────────────────────────────────────────────────
# 6. Genera report markdown giornaliero
# ─────────────────────────────────────────────────────────────────
def generate_daily_report(transactions: list, convergence: dict) -> str:
    """Genera intelligence_YYYYMMDD.md."""
    if REPORT_PATH.exists():
        print(f"  ⏭ Report {TODAY_STR} già esistente, skip")
        return str(REPORT_PATH)

    day_it = TODAY.strftime("%-d %B %Y").replace(
        "January","Gennaio").replace("February","Febbraio").replace("March","Marzo").replace(
        "April","Aprile").replace("May","Maggio").replace("June","Giugno").replace(
        "July","Luglio").replace("August","Agosto").replace("September","Settembre").replace(
        "October","Ottobre").replace("November","Novembre").replace("December","Dicembre")

    # Leggi market_data per contesto e prezzi correnti per ticker
    mkt = {}
    if MARKET_JSON.exists():
        with open(MARKET_JSON) as f:
            mkt = json.load(f)

    spx  = next((i["value"] for i in mkt.get("indices", []) if i["name"] == "S&P 500"), "—")
    ndx  = next((i["value"] for i in mkt.get("indices", []) if i["name"] == "NASDAQ"), "—")
    vix  = next((i["value"] for i in mkt.get("indices", []) if i["name"] == "VIX"), "—")
    oil  = next((i["value"] for i in mkt.get("indices", []) if i["name"] == "Oil WTI"), "—")

    # Mappa ticker → prezzo corrente (per tabella Riepilogo Segnali)
    live_price = {}
    for idx in mkt.get("indices", []):
        sym = idx.get("symbol") or idx.get("name", "")
        if sym and idx.get("value"):
            live_price[sym] = idx["value"]
    gold = next((i["value"] for i in mkt.get("indices", []) if i["name"] == "Gold"), "—")

    # Insider summary per ticker
    ticker_txns = {}
    for tx in transactions:
        t = tx.get("ticker", "")
        if t in ALL_TICKERS:
            if t not in ticker_txns:
                ticker_txns[t] = []
            ticker_txns[t].append(tx)

    lines = [
        f"# 📊 Intelligence Report — {day_it}",
        "",
        f"> **Generato:** {TODAY_STR} | **Fonte:** OpenInsider + SEC EDGAR Form 4 + Capitol Trades",
        "",
        "---",
        "",
        "## 📈 Market Snapshot",
        "",
        f"| Indice | Valore | Aggiornato |",
        f"|--------|--------|------------|",
        f"| S&P 500 | {spx} | {mkt.get('lastUpdated','—')[:10]} |",
        f"| NASDAQ | {ndx} | — |",
        f"| VIX | {vix} | — |",
        f"| Oil WTI | {oil} | — |",
        f"| Gold | {gold} | — |",
        "",
        "---",
        "",
        "## 🔍 Insider Activity — Oggi",
        "",
    ]

    today_txns = [tx for tx in transactions if tx.get("date") == TODAY_STR]
    if today_txns:
        for tx in today_txns:
            icon = "🟢" if tx.get("action") == "BUY" else "🔴"
            lines.append(f"- {icon} **{tx['ticker']}** — {tx['insider']} ({tx['role']}): "
                         f"{tx['action']} {tx['qty']} @ {tx['price']} = **{tx['value']}** "
                         f"[{tx['type']}] → *{tx['signal']}*")
        lines.append("")
    else:
        lines.append("_Nessuna transazione insider registrata oggi. Controlla OpenInsider per aggiornamenti._")
        lines.append("")

    # Convergenza
    lines += [
        "---",
        "",
        "## 🧲 Convergenza Smart Money",
        "",
        f"**Accumulo forte:** {', '.join(convergence.get('strongBuy', [])) or '—'}",
        f"**Distribuzione forte:** {', '.join(convergence.get('strongSell', [])) or '—'}",
        "",
        f"> {convergence.get('summary', '')}",
        "",
        "---",
        "",
        "## 📋 Riepilogo Segnali",
        "",
        "| Ticker | Prezzo | Segnale | Conviction |",
        "|--------|--------|---------|------------|",
    ]

    for t in ALL_TICKERS:
        # Prezzo corrente da market_data.json (NON dalla transazione insider)
        price = live_price.get(t, "—")

        txns_t = ticker_txns.get(t, [])
        if txns_t:
            last = txns_t[0]
            signal = "🟢 ACCUMULO" if last["action"] == "BUY" else "🔴 DISTRIBUZIONE"
            conviction = "⭐⭐⭐" if "FORTE" in last.get("signal", "") else "⭐⭐"
        elif t in convergence.get("strongBuy", []):
            signal, conviction = "🟢 ACCUMULO", "⭐⭐⭐"
        elif t in convergence.get("strongSell", []):
            signal, conviction = "🔴 DISTRIBUZIONE", "⭐⭐"
        else:
            signal, conviction = "🟡 MISTO", "⭐⭐"
        lines.append(f"| {t} | {price} | {signal} | {conviction} |")

    lines += [
        "",
        "---",
        "",
        "## 📡 Fonti Utilizzate Oggi",
        "",
        f"- [OpenInsider Screener (tutti i ticker)]"
        f"(http://openinsider.com/screener?s=&o=&pl=&ph=&ll=&lh=&fd=30&fdr=&td=0&tdr=&fdlyl=&fdlyh=&daysago=&xp=1&xs=1&xf=1&xm=1&xx=1&vl=&vh=&ocl=&och=&sic1=-1&sicl=100&sich=9999&grp=0&nfl=&nfh=&nil=&nih=&nol=&noh=&v2l=&v2h=&oc2l=&oc2h=&sortcol=0&cnt=100&page=1)",
        f"- [SEC EDGAR Form 4 — {TODAY_STR}]"
        f"(https://efts.sec.gov/LATEST/search-index?q=&forms=4&dateRange=custom&startdt={TODAY_STR}&enddt={TODAY_STR})",
        f"- [Capitol Trades — Live](https://www.capitoltrades.com/trades)",
        "",
        f"*Report generato automaticamente il {TODAY_STR} da scripts/fetch_all_daily.py*",
    ]

    report_text = "\n".join(lines)
    REPORTS_DIR.mkdir(exist_ok=True)
    with open(REPORT_PATH, "w") as f:
        f.write(report_text)

    print(f"  ✅ Report generato: {REPORT_PATH.name}")
    return str(REPORT_PATH)


# ─────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────
def main():
    print(f"\n{'='*60}")
    print(f"PORTFOLIO INTELLIGENCE — Daily Fetch — {TODAY_STR}")
    print(f"{'='*60}\n")

    DATA_DIR.mkdir(exist_ok=True)
    REPORTS_DIR.mkdir(exist_ok=True)

    all_transactions = []

    # ── 1. OpenInsider per ogni ticker ──────────────────────────
    print("📋 Fetching OpenInsider...")
    for ticker in ALL_TICKERS:
        print(f"  → {ticker}...", end=" ")
        txns = fetch_openinsider_ticker(ticker, days=30)
        print(f"{len(txns)} transazioni")
        all_transactions.extend(txns)
        time.sleep(1.2)  # rate limiting

    # ── 2. Cluster buys screener ─────────────────────────────────
    print("\n🟢 Fetching OpenInsider Cluster Buys...")
    cluster_url = (
        "http://openinsider.com/screener?s=&o=&pl=&ph=&ll=&lh=&fd=14"
        "&fdr=&td=0&tdr=&fdlyl=&fdlyh=&daysago=&xp=1&vl=&vh=&ocl=&och="
        "&sic1=-1&sicl=100&sich=9999&grp=0&nfl=&nfh=2&nil=2&nih=&nol=&noh="
        "&v2l=&v2h=&oc2l=&oc2h=&sortcol=0&cnt=50&page=1"
    )
    try:
        resp = requests.get(cluster_url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, "html.parser")
        table = soup.find("table", class_="tinytable")
        cluster_count = len(table.find_all("tr")) - 1 if table else 0
        print(f"  → {cluster_count} cluster buys trovati")
    except Exception as e:
        print(f"  ⚠ Cluster buys: {e}")
    time.sleep(1)

    # ── 3. SEC EDGAR ─────────────────────────────────────────────
    print("\n🏛️ Fetching SEC EDGAR Form 4...")
    sec_results = fetch_sec_form4_recent(days=7)
    print(f"  → {len(sec_results)} filing recenti da EDGAR")
    time.sleep(0.5)

    # ── 4. Capitol Trades ────────────────────────────────────────
    print("\n🏛️ Fetching Capitol Trades...")
    politicians = fetch_capitol_trades_recent()
    print(f"  → {len(politicians)} trade politici")
    time.sleep(1)

    # ── 5. Aggiorna insider_data.json ────────────────────────────
    print("\n💾 Aggiorno insider_data.json...")
    updated = update_insider_json(all_transactions, politicians)

    # ── 6. Aggiorna market_data.json (solo timestamp) ────────────
    print("\n💾 Aggiorno market_data.json timestamp...")
    if MARKET_JSON.exists():
        with open(MARKET_JSON) as f:
            mkt = json.load(f)
        mkt["lastChecked"] = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        with open(MARKET_JSON, "w") as f:
            json.dump(mkt, f, ensure_ascii=False, indent=2)
        print("  ✅ market_data.json aggiornato")

    # ── 7. Genera report giornaliero ─────────────────────────────
    print("\n📝 Genero report giornaliero...")
    generate_daily_report(
        updated["transactions"],
        updated["convergence"],
    )

    print(f"\n{'='*60}")
    print(f"✅ Daily fetch completato — {TODAY_STR}")
    print(f"   Transazioni totali in JSON: {len(updated['transactions'])}")
    print(f"   Convergenza: BUY={updated['convergence']['strongBuy']} SELL={updated['convergence']['strongSell']}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
