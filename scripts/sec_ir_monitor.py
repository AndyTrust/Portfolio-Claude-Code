#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════════
# PORTFOLIO INTELLIGENCE — SEC EDGAR + IR Monitor
# Eseguito alle 07:30 ogni giorno (dopo fetch_all_daily.py)
#
# Cosa fa:
#   1. Fetch RSS EDGAR per ogni CIK (8-K, 10-Q, 10-K, 13F-HR)
#   2. Fetch EFTS full-text search per ticker (tutti i filing)
#   3. Fetch pagine IR pubbliche (press release, earnings call)
#   4. Aggiorna data/sec_filings.json
#   5. Inietta news rilevanti in data/market_data.json (NEWS_DB)
#   6. Invia alert Telegram per eventi materiali (8-K priority)
#
# Dipendenze: pip3 install requests beautifulsoup4 feedparser --break-system-packages
# ═══════════════════════════════════════════════════════════════════

import json
import os
import re
import sys
import time
import datetime
import traceback
from pathlib import Path
from urllib.parse import urljoin

try:
    import requests
    from bs4 import BeautifulSoup
    import feedparser
except ImportError:
    os.system("pip3 install requests beautifulsoup4 feedparser --break-system-packages -q")
    import requests
    from bs4 import BeautifulSoup
    import feedparser

BASE_DIR     = Path(__file__).parent.parent
DATA_DIR     = BASE_DIR / "data"
FILINGS_JSON = DATA_DIR / "sec_filings.json"
MARKET_JSON  = DATA_DIR / "market_data.json"
SENT_JSON    = DATA_DIR / "sec_alerts_sent.json"  # tracker alert già inviati

TODAY     = datetime.date.today()
TODAY_STR = TODAY.strftime("%Y-%m-%d")
YESTERDAY = (TODAY - datetime.timedelta(days=1)).strftime("%Y-%m-%d")

HEADERS = {
    "User-Agent": "Portfolio-Intelligence-Bot/1.0 (andrea@140grammi.com) personal investment research",
    "Accept": "application/atom+xml,application/xml,text/html,*/*;q=0.8",
}

# ── CIK ufficiali SEC EDGAR ───────────────────────────────────────
# Fonte: https://www.sec.gov/cgi-bin/browse-edgar?company=&CIK=TICKER&type=&action=getcompany
COMPANY_CIK = {
    "TSLA":  "0001318605",   # Tesla Inc
    "BLK":   "0001364742",   # BlackRock Inc
    "TEM":   "0001974440",   # Tempus AI Inc
    "ACHR":  "0001834127",   # Archer Aviation Inc
    "CRSP":  "0001674930",   # CRISPR Therapeutics AG
    "CRWV":  "0001937655",   # CoreWeave Inc
    # Watchlist (solo monitoring passivo)
    "NVDA":  "0001045810",
    "AVGO":  "0001730168",
    "MU":    "0000723125",
    "ASML":  "0000937556",
    "LLY":   "0000059478",
    "NVO":   "0000353278",
    "XOM":   "0000034088",
    "NEE":   "0000753308",
    "DLR":   "0001297996",
    "EQIX":  "0001101239",
}

REAL_TICKERS  = ["TSLA", "BLK", "TEM", "ACHR", "CRSP", "CRWV"]
WATCH_TICKERS = ["NVDA", "AVGO", "MU", "ASML", "LLY", "NVO", "XOM", "NEE", "DLR", "EQIX"]
ALL_TICKERS   = REAL_TICKERS + WATCH_TICKERS

# ── Pagine IR ufficiali ────────────────────────────────────────────
IR_PAGES = {
    "TSLA":  {
        "press_releases": "https://ir.tesla.com/press-releases",
        "rss": "https://ir.tesla.com/rss/news-releases.xml",
    },
    "BLK":   {
        "press_releases": "https://ir.blackrock.com/news-and-events/press-releases",
        "rss": "https://ir.blackrock.com/rss/news-releases.xml",
    },
    "TEM":   {
        "press_releases": "https://www.tempus.com/news/",
        "rss": None,
    },
    "ACHR":  {
        "press_releases": "https://investors.archer.com/news-releases",
        "rss": "https://investors.archer.com/rss/news-releases.xml",
    },
    "CRSP":  {
        "press_releases": "https://crisprtx.com/news-media/press-releases",
        "rss": "https://crisprtx.com/news-media/press-releases/rss",
    },
    "CRWV":  {
        "press_releases": "https://www.coreweave.com/news",
        "rss": None,
    },
    "NVDA":  {"rss": "https://nvidianews.nvidia.com/releases.xml"},
    "LLY":   {"rss": "https://investor.lilly.com/rss/news-releases.xml"},
    "XOM":   {"rss": "https://corporate.exxonmobil.com/rss/news-releases.xml"},
}

# ── Tipi filing SEC con priorità e impatto ───────────────────────
FILING_PRIORITY = {
    "8-K":    {"priority": "ALTA",   "label": "Evento Materiale",       "icon": "🔴"},
    "8-K/A":  {"priority": "ALTA",   "label": "Emendamento 8-K",        "icon": "🔴"},
    "10-Q":   {"priority": "ALTA",   "label": "Report Trimestrale",     "icon": "📊"},
    "10-K":   {"priority": "ALTA",   "label": "Report Annuale",         "icon": "📊"},
    "10-K/A": {"priority": "MEDIA",  "label": "Emendamento 10-K",       "icon": "📊"},
    "13F-HR": {"priority": "MEDIA",  "label": "Holdings Istituzionali", "icon": "🏛️"},
    "DEF 14A":{"priority": "BASSA",  "label": "Proxy Statement",        "icon": "📋"},
    "S-1":    {"priority": "ALTA",   "label": "Registrazione IPO",      "icon": "🚀"},
    "S-1/A":  {"priority": "ALTA",   "label": "Emendamento S-1",        "icon": "🚀"},
    "SC 13G": {"priority": "MEDIA",  "label": "Quota >5% Passiva",      "icon": "👁️"},
    "SC 13D": {"priority": "ALTA",   "label": "Quota >5% Attiva",       "icon": "🎯"},
    "4":      {"priority": "MEDIA",  "label": "Insider Trade Form 4",   "icon": "👤"},
}

# ─────────────────────────────────────────────────────────────────
# 1. SEC EDGAR RSS FEED per CIK
# ─────────────────────────────────────────────────────────────────
def fetch_edgar_rss(ticker: str, cik: str, form_types: list = None, days: int = 30) -> list:
    """
    Fetch RSS EDGAR per CIK specificato.
    form_types: lista di form type (es. ["8-K", "10-Q"]) o None per tutti.
    """
    if form_types is None:
        form_types = ["8-K", "8-K/A", "10-Q", "10-K", "13F-HR"]

    filings = []
    cutoff = (TODAY - datetime.timedelta(days=days)).strftime("%Y-%m-%d")

    for form_type in form_types:
        url = (
            f"https://www.sec.gov/cgi-bin/browse-edgar"
            f"?action=getcompany&CIK={cik}&type={form_type.replace('/', '%2F')}"
            f"&dateb=&owner=include&count=10&search_text=&output=atom"
        )
        try:
            resp = requests.get(url, headers=HEADERS, timeout=20)
            if not resp.ok:
                continue
            feed = feedparser.parse(resp.content)
            for entry in feed.entries[:10]:
                filed_date = ""
                if hasattr(entry, "updated"):
                    filed_date = entry.updated[:10]
                elif hasattr(entry, "published"):
                    filed_date = entry.published[:10]

                if filed_date and filed_date < cutoff:
                    continue

                filing_url = entry.get("link", "")
                title = entry.get("title", f"{form_type} filing")
                summary = entry.get("summary", "")

                # Estrai item 1.01, 2.02, etc. dall'8-K summary
                items = []
                if form_type in ("8-K", "8-K/A") and summary:
                    items = re.findall(r'Item\s+[\d\.]+[^<\n]+', summary)

                meta = FILING_PRIORITY.get(form_type, {"priority": "BASSA", "label": form_type, "icon": "📄"})

                filings.append({
                    "ticker": ticker,
                    "cik": cik,
                    "form_type": form_type,
                    "filed_date": filed_date,
                    "title": title.strip(),
                    "items": items[:5],
                    "filing_url": filing_url,
                    "priority": meta["priority"],
                    "label": meta["label"],
                    "icon": meta["icon"],
                    "source": "SEC EDGAR",
                    "edgarUrl": f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type={form_type}&dateb=&owner=include&count=10",
                })
        except Exception as e:
            print(f"    ⚠ EDGAR RSS {ticker} {form_type}: {e}")
        time.sleep(0.3)

    return filings


# ─────────────────────────────────────────────────────────────────
# 2. SEC EDGAR EFTS — ricerca full-text per ticker
# ─────────────────────────────────────────────────────────────────
def fetch_efts_filings(ticker: str, days: int = 7) -> list:
    """Cerca tutti i filing recenti che menzionano il ticker su EFTS."""
    start = (TODAY - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    url = (
        f"https://efts.sec.gov/LATEST/search-index"
        f"?q=%22{ticker}%22&forms=8-K,10-Q,10-K,SC+13D,SC+13G"
        f"&dateRange=custom&startdt={start}&enddt={TODAY_STR}"
        f"&hits.hits.total.value=true&hits.hits._source=period_of_report"
        f"&hits.hits._source=entity_name&hits.hits._source=file_date"
        f"&hits.hits._source=form_type&hits.hits._source=file_num"
    )
    results = []
    try:
        resp = requests.get(url, headers={"User-Agent": HEADERS["User-Agent"]}, timeout=20)
        if resp.ok:
            data = resp.json()
            for h in data.get("hits", {}).get("hits", [])[:15]:
                src = h.get("_source", {})
                form_type = src.get("form_type", "")
                meta = FILING_PRIORITY.get(form_type, {"priority": "BASSA", "label": form_type, "icon": "📄"})
                acc = h.get("_id", "")
                filing_url = f"https://www.sec.gov/Archives/edgar/data/{acc.replace('-','/')}/{acc}-index.htm" if acc else ""
                results.append({
                    "ticker": ticker,
                    "entity": src.get("entity_name", ""),
                    "form_type": form_type,
                    "filed_date": src.get("file_date", "")[:10],
                    "period": src.get("period_of_report", ""),
                    "filing_url": filing_url,
                    "priority": meta["priority"],
                    "label": meta["label"],
                    "icon": meta["icon"],
                    "source": "SEC EDGAR EFTS",
                })
    except Exception as e:
        print(f"    ⚠ EFTS {ticker}: {e}")
    return results


# ─────────────────────────────────────────────────────────────────
# 3. IR Pages RSS / Press Releases
# ─────────────────────────────────────────────────────────────────
def fetch_ir_rss(ticker: str) -> list:
    """Fetch RSS feed dalla pagina IR ufficiale."""
    ir = IR_PAGES.get(ticker, {})
    rss_url = ir.get("rss")
    if not rss_url:
        return []

    releases = []
    try:
        resp = requests.get(rss_url, headers=HEADERS, timeout=20)
        if not resp.ok:
            return []
        feed = feedparser.parse(resp.content)
        cutoff = (TODAY - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        for entry in feed.entries[:10]:
            pub_date = ""
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                pub_date = datetime.date(*entry.published_parsed[:3]).strftime("%Y-%m-%d")
            elif hasattr(entry, "updated"):
                pub_date = entry.updated[:10]

            if pub_date and pub_date < cutoff:
                continue

            title = entry.get("title", "Press release")
            link  = entry.get("link", ir.get("press_releases", ""))
            summary = BeautifulSoup(entry.get("summary", ""), "html.parser").get_text()[:300]

            # Categorizza automaticamente
            title_lower = title.lower()
            if any(kw in title_lower for kw in ["earnings", "revenue", "quarter", "annual", "results", "guidance"]):
                category = "earnings"
                priority = "ALTA"
                icon = "📊"
            elif any(kw in title_lower for kw in ["acquisition", "merger", "partnership", "agreement", "deal"]):
                category = "deal"
                priority = "ALTA"
                icon = "🤝"
            elif any(kw in title_lower for kw in ["fda", "approval", "clinical", "trial", "regulatory"]):
                category = "regulatory"
                priority = "ALTA"
                icon = "🏥"
            elif any(kw in title_lower for kw in ["dividend", "buyback", "repurchase", "share"]):
                category = "capital"
                priority = "MEDIA"
                icon = "💰"
            else:
                category = "news"
                priority = "BASSA"
                icon = "📰"

            releases.append({
                "ticker": ticker,
                "date": pub_date,
                "title": title.strip(),
                "summary": summary.strip(),
                "url": link,
                "category": category,
                "priority": priority,
                "icon": icon,
                "source": "IR Page RSS",
            })
    except Exception as e:
        print(f"    ⚠ IR RSS {ticker}: {e}")
    return releases


# ─────────────────────────────────────────────────────────────────
# 4. Scraping diretto pagine IR (fallback se no RSS)
# ─────────────────────────────────────────────────────────────────
def fetch_ir_page(ticker: str) -> list:
    """Scraping diretto pagina press release IR — usato se no RSS."""
    ir = IR_PAGES.get(ticker, {})
    pr_url = ir.get("press_releases")
    if not pr_url or ir.get("rss"):  # usa RSS se disponibile
        return []

    releases = []
    try:
        resp = requests.get(pr_url, headers=HEADERS, timeout=20)
        if not resp.ok:
            return []
        soup = BeautifulSoup(resp.text, "html.parser")

        # Strategia generica: cerca link con date
        cutoff = (TODAY - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        for a_tag in soup.find_all("a", href=True)[:50]:
            text = a_tag.get_text(strip=True)
            if len(text) < 20 or len(text) > 200:
                continue
            # Cerca pattern data nel testo circostante o nel tag
            parent_text = a_tag.parent.get_text() if a_tag.parent else ""
            date_match = re.search(r'(\d{4}-\d{2}-\d{2}|\w+ \d{1,2},? \d{4})', parent_text)
            pub_date = ""
            if date_match:
                raw_date = date_match.group(1)
                for fmt in ("%Y-%m-%d", "%B %d, %Y", "%B %d %Y", "%b %d, %Y"):
                    try:
                        pub_date = datetime.datetime.strptime(raw_date, fmt).strftime("%Y-%m-%d")
                        break
                    except:
                        pass

            if pub_date and pub_date < cutoff:
                continue

            href = a_tag["href"]
            if not href.startswith("http"):
                href = urljoin(pr_url, href)

            releases.append({
                "ticker": ticker,
                "date": pub_date or TODAY_STR,
                "title": text,
                "summary": "",
                "url": href,
                "category": "news",
                "priority": "BASSA",
                "icon": "📰",
                "source": "IR Page scraping",
            })
            if len(releases) >= 5:
                break
    except Exception as e:
        print(f"    ⚠ IR Page {ticker}: {e}")
    return releases


# ─────────────────────────────────────────────────────────────────
# 5. Aggiorna sec_filings.json
# ─────────────────────────────────────────────────────────────────
def update_filings_json(all_filings: list, ir_releases: list) -> dict:
    """Aggiorna data/sec_filings.json mantenendo storico 60gg."""
    existing = {}
    if FILINGS_JSON.exists():
        with open(FILINGS_JSON) as f:
            existing = json.load(f)

    old_filings = existing.get("filings", [])
    old_ir = existing.get("ir_releases", [])

    # Deduplica per (ticker + form_type + filed_date)
    existing_keys_f = {(f["ticker"], f.get("form_type",""), f.get("filed_date","")) for f in old_filings}
    new_filings = [f for f in all_filings if (f["ticker"], f.get("form_type",""), f.get("filed_date","")) not in existing_keys_f]

    # Deduplica IR per (ticker + title)
    existing_keys_ir = {(r["ticker"], r.get("title","")) for r in old_ir}
    new_ir = [r for r in ir_releases if (r["ticker"], r.get("title","")) not in existing_keys_ir]

    cutoff_60d = (TODAY - datetime.timedelta(days=60)).strftime("%Y-%m-%d")
    merged_filings = sorted(
        new_filings + old_filings,
        key=lambda x: x.get("filed_date",""),
        reverse=True
    )
    merged_filings = [f for f in merged_filings if f.get("filed_date","") >= cutoff_60d][:100]

    merged_ir = sorted(
        new_ir + old_ir,
        key=lambda x: x.get("date",""),
        reverse=True
    )
    merged_ir = [r for r in merged_ir if r.get("date","") >= cutoff_60d][:50]

    # Calcola stats per ticker
    stats = {}
    for t in ALL_TICKERS:
        t_filings = [f for f in merged_filings if f["ticker"] == t]
        t_ir = [r for r in merged_ir if r["ticker"] == t]
        high_priority = [f for f in t_filings if f.get("priority") == "ALTA"]
        stats[t] = {
            "total_filings": len(t_filings),
            "high_priority": len(high_priority),
            "ir_releases": len(t_ir),
            "last_filing": t_filings[0].get("filed_date","—") if t_filings else "—",
            "last_ir": t_ir[0].get("date","—") if t_ir else "—",
        }

    output = {
        "lastUpdated": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "coverageFrom": cutoff_60d,
        "tickers": ALL_TICKERS,
        "cik_map": COMPANY_CIK,
        "stats": stats,
        "new_today": {
            "filings": len(new_filings),
            "ir_releases": len(new_ir),
            "high_priority": [f for f in new_filings if f.get("priority") == "ALTA"],
        },
        "filings": merged_filings,
        "ir_releases": merged_ir,
    }

    with open(FILINGS_JSON, "w") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"  ✅ sec_filings.json: {len(merged_filings)} filing, {len(merged_ir)} IR release")
    print(f"     Nuovi oggi: {len(new_filings)} filing, {len(new_ir)} IR")
    return output


# ─────────────────────────────────────────────────────────────────
# 6. Alert Telegram per eventi materiali
# ─────────────────────────────────────────────────────────────────
def _load_sent_cache() -> dict:
    """Carica il tracker degli alert già inviati (mantiene 30gg)."""
    if not SENT_JSON.exists():
        return {}
    try:
        with open(SENT_JSON) as f:
            raw = json.load(f)
        cutoff = (TODAY - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        return {k: v for k, v in raw.items() if v >= cutoff}
    except Exception:
        return {}


def _save_sent_cache(cache: dict):
    with open(SENT_JSON, "w") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


def _alert_key(item: dict) -> str:
    """Chiave univoca per un filing o IR release."""
    return f"{item.get('ticker','')}-{item.get('form_type', item.get('category',''))}-{item.get('filed_date', item.get('date',''))}"


def send_telegram_alert(data: dict):
    """Invia alert Telegram solo per filing NUOVI non ancora segnalati."""
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN") or _read_env_from_file("TELEGRAM_BOT_TOKEN")
    chat_id   = os.environ.get("TELEGRAM_CHAT_ID")   or _read_env_from_file("TELEGRAM_CHAT_ID")
    if not bot_token or not chat_id:
        print("  ⚠ Telegram: variabili non configurate, skip alert")
        return

    sent_cache = _load_sent_cache()

    new_today = data.get("new_today", {})
    all_high   = new_today.get("high_priority", [])
    all_new_ir = [r for r in data.get("ir_releases", [])
                  if r.get("date") == TODAY_STR and r.get("priority") == "ALTA"]

    # Filtra solo quelli NON già inviati
    high_prio = [f for f in all_high  if _alert_key(f) not in sent_cache]
    new_ir    = [r for r in all_new_ir if _alert_key(r) not in sent_cache]

    if not high_prio and not new_ir:
        print("  ℹ Nessun evento nuovo ad alta priorità — nessun alert Telegram")
        return

    lines = [f"📡 *SEC/IR Monitor — {TODAY_STR}*\n"]

    if high_prio:
        lines.append("*🔴 Nuovi filing ad alta priorità:*")
        for f in high_prio[:5]:
            icon      = f["icon"]
            ticker    = f["ticker"]
            form      = f["form_type"]
            date      = f["filed_date"]
            label     = f["label"]
            items_str = " | ".join(f["items"][:2]) if f.get("items") else ""
            lines.append(f"{icon} *{ticker}* — {form} ({label}) [{date}]")
            if items_str:
                lines.append(f"   _{items_str}_")
            lines.append(f"   [EDGAR]({f.get('filing_url','https://www.sec.gov')})")
            sent_cache[_alert_key(f)] = TODAY_STR
        lines.append("")

    if new_ir:
        lines.append("*📰 Nuovi Press Release IR:*")
        for r in new_ir[:3]:
            lines.append(f"  {r['icon']} *{r['ticker']}* — {r['title'][:80]}")
            lines.append(f"   [Leggi]({r.get('url','#')})")
            sent_cache[_alert_key(r)] = TODAY_STR

    lines.append(f"\n[Dashboard](https://andytrust.github.io/Portfolio-Claude-Code/Protfolio.html)")
    message = "\n".join(lines)

    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        resp = requests.post(url, json={
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown",
            "disable_web_page_preview": False,
        }, timeout=15)
        if resp.ok:
            print(f"  ✅ Alert Telegram inviato ({len(high_prio)} filing + {len(new_ir)} IR)")
            _save_sent_cache(sent_cache)
        else:
            print(f"  ⚠ Telegram error: {resp.text[:100]}")
    except Exception as e:
        print(f"  ⚠ Telegram exception: {e}")


def _read_env_from_file(key: str) -> str:
    """Legge variabile da .env se non in environ."""
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return ""
    for line in env_path.read_text().splitlines():
        if line.startswith(f"{key}="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


# ─────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────
def main():
    print(f"\n{'='*60}")
    print(f"SEC EDGAR + IR Monitor — {TODAY_STR}")
    print(f"{'='*60}\n")

    DATA_DIR.mkdir(exist_ok=True)
    all_filings = []
    all_ir = []

    # ── 1. EDGAR RSS per CIK (ticker reali — massima priorità) ──
    print("🏛️  SEC EDGAR RSS per CIK (portfolio reale)...")
    for ticker in REAL_TICKERS:
        cik = COMPANY_CIK.get(ticker)
        if not cik:
            print(f"  ⚠ CIK non trovato per {ticker}")
            continue
        print(f"  → {ticker} (CIK {cik})...", end=" ", flush=True)
        filings = fetch_edgar_rss(ticker, cik, days=30)
        print(f"{len(filings)} filing")
        all_filings.extend(filings)
        time.sleep(1.0)

    # ── 2. EDGAR RSS watchlist (meno frequente) ─────────────────
    print("\n🏛️  SEC EDGAR RSS watchlist...")
    for ticker in WATCH_TICKERS:
        cik = COMPANY_CIK.get(ticker)
        if not cik:
            continue
        print(f"  → {ticker}...", end=" ", flush=True)
        # Per watchlist solo 8-K e 10-Q
        filings = fetch_edgar_rss(ticker, cik, form_types=["8-K", "10-Q"], days=14)
        print(f"{len(filings)} filing")
        all_filings.extend(filings)
        time.sleep(0.8)

    # ── 3. EFTS search ultimi 7gg (cattura filing su altri ticker) ─
    print("\n🔍 EDGAR EFTS search (ultimi 7gg)...")
    for ticker in REAL_TICKERS:
        print(f"  → EFTS {ticker}...", end=" ", flush=True)
        efts = fetch_efts_filings(ticker, days=7)
        # Non duplicare quello che abbiamo già da RSS
        existing_keys = {(f["ticker"], f.get("form_type",""), f.get("filed_date","")) for f in all_filings}
        new_efts = [f for f in efts if (f["ticker"], f.get("form_type",""), f.get("filed_date","")) not in existing_keys]
        print(f"{len(new_efts)} nuovi")
        all_filings.extend(new_efts)
        time.sleep(0.5)

    # ── 4. IR Pages RSS ─────────────────────────────────────────
    print("\n📰 IR Pages RSS...")
    for ticker in ALL_TICKERS:
        ir = IR_PAGES.get(ticker, {})
        if not ir:
            continue
        print(f"  → {ticker} IR...", end=" ", flush=True)
        if ir.get("rss"):
            releases = fetch_ir_rss(ticker)
        else:
            releases = fetch_ir_page(ticker)
        print(f"{len(releases)} release")
        all_ir.extend(releases)
        time.sleep(0.8)

    # ── 5. Aggiorna JSON ────────────────────────────────────────
    print("\n💾 Aggiorno sec_filings.json...")
    data = update_filings_json(all_filings, all_ir)

    # ── 6. Alert Telegram per eventi ad alta priorità ───────────
    print("\n📱 Check alert Telegram...")
    send_telegram_alert(data)

    # ── 7. Summary ──────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"✅ SEC/IR Monitor completato — {TODAY_STR}")
    for t in REAL_TICKERS:
        s = data["stats"].get(t, {})
        print(f"   {t}: {s.get('total_filings',0)} filing | {s.get('ir_releases',0)} IR | ultimo: {s.get('last_filing','—')}")
    high = data["new_today"].get("high_priority", [])
    if high:
        print(f"\n⚠️  ALTA PRIORITÀ OGGI:")
        for f in high:
            print(f"   {f['icon']} {f['ticker']} — {f['form_type']} ({f['label']}) [{f['filed_date']}]")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
