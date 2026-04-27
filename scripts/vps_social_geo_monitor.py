#!/usr/bin/env python3
"""
Portfolio Intelligence — Social & Geopolitical Monitor
Runs on VPS every hour Mon-Fri 06:00-01:59

Sources:
- Truth Social: @realDonaldTrump (public Mastodon API)
- X/Twitter: nitter RSS feeds per account e hashtag
- Google News RSS: keywords macro/geopolitici
- Reuters / FT RSS: mercati e finanza

Filtra per:
- Escalation militare / geopolitica
- Impatto mercati / finanza / economia
- Keywords: iran, taiwan, tariffs, trade war, fed, rates,
            ukraine, israel, china, oil, gold, bitcoin, stocks
"""

import json
import os
import sys
import time
import re
import hashlib
import feedparser
import requests
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv

# ── Config ────────────────────────────────────────────────
REPO_DIR = Path(__file__).parent.parent
DATA_DIR = REPO_DIR / "data"
load_dotenv(REPO_DIR / ".env")

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# File cache per evitare duplicati
CACHE_FILE = DATA_DIR / "geo_alerts_cache.json"
GEO_DATA_FILE = DATA_DIR / "geopolitical_data.json"

# Massimo ore indietro per considerare un post
MAX_AGE_HOURS = 2

# ── Keywords per filtro rilevanza ──────────────────────────
ESCALATION_KEYWORDS = {
    "military": ["war", "attack", "missile", "strike", "troops", "invasion",
                 "bombed", "military", "navy", "nuclear", "sanction", "blockade",
                 "escalat", "conflict", "nato", "troops"],
    "geopolitical": ["iran", "taiwan", "china", "russia", "ukraine", "israel",
                     "hamas", "hezbollah", "north korea", "dprk", "strait",
                     "south china sea", "middle east"],
    "market_moving": ["tariff", "trade war", "interest rate", "fed", "federal reserve",
                      "inflation", "recession", "gdp", "unemployment", "jobs report",
                      "earnings", "ipo", "merger", "acquisition", "bankruptcy",
                      "oil price", "crude", "gold", "bitcoin", "crypto",
                      "stock market", "s&p", "nasdaq", "dow"],
    "trump_specific": ["trump", "tariff", "deal", "executive order", "white house",
                       "administration", "policy", "america first", "maga",
                       "trade", "china deal", "ukraine deal", "ceasefire"]
}

ALL_KEYWORDS = [kw for group in ESCALATION_KEYWORDS.values() for kw in group]

def is_relevant(text: str) -> dict:
    """Verifica se un testo è rilevante per mercati/geopolitica."""
    text_lower = text.lower()
    found = []
    category = None

    for cat, keywords in ESCALATION_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                found.append(kw)
                category = cat

    relevance_score = len(set(found))
    return {
        "relevant": relevance_score > 0,
        "score": relevance_score,
        "keywords": list(set(found))[:5],
        "category": category
    }

def text_hash(text: str) -> str:
    return hashlib.md5(text[:200].encode()).hexdigest()[:12]

def load_cache() -> set:
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE) as f:
                data = json.load(f)
            # Pulisci cache vecchia (> 24h)
            cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
            data = {k: v for k, v in data.items() if v > cutoff}
            return set(data.keys()), data
        except Exception:
            pass
    return set(), {}

def save_cache(cache_dict: dict):
    with open(CACHE_FILE, "w") as f:
        json.dump(cache_dict, f, indent=2)

def send_telegram(message: str, urgent: bool = False):
    if not TELEGRAM_TOKEN or TELEGRAM_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        print(f"  [TELEGRAM] {message[:120]}")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    emoji_prefix = "🚨" if urgent else "📡"
    try:
        r = requests.post(url, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": f"{emoji_prefix} {message}",
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }, timeout=10)
        if not r.ok:
            print(f"  Telegram error: {r.status_code}")
    except Exception as e:
        print(f"  Telegram failed: {e}")

# ── Traduzione en→it via MyMemory (gratuita, no API key) ──
_translate_cache: dict = {}

def translate_to_it(text: str) -> str:
    """Traduce testo en→it. Fallback silenzioso sull'originale."""
    if not text or len(text.strip()) < 8:
        return text
    key = text[:120]
    if key in _translate_cache:
        return _translate_cache[key]
    try:
        r = requests.get(
            "https://api.mymemory.translated.net/get",
            params={"q": text[:500], "langpair": "en|it"},
            timeout=6,
            headers={"User-Agent": "Portfolio-Intelligence/1.0"}
        )
        if r.ok:
            t = r.json().get("responseData", {}).get("translatedText", "")
            if t and "QUERY LENGTH" not in t and t.strip() != text.strip():
                _translate_cache[key] = t
                return t
    except Exception:
        pass
    _translate_cache[key] = text
    return text

# ── FONTE 1: Truth Social — @realDonaldTrump ──────────────
def fetch_truth_social_trump():
    """
    Truth Social è compatibile con l'API Mastodon.
    Non richiede autenticazione per post pubblici.
    """
    items = []
    print("  [Truth Social] Fetching @realDonaldTrump...")

    try:
        # Step 1: ottieni account ID
        r = requests.get(
            "https://truthsocial.com/api/v1/accounts/lookup",
            params={"acct": "realDonaldTrump"},
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=15
        )
        if not r.ok:
            print(f"    ⚠️  Lookup failed: {r.status_code}")
            return items

        account_id = r.json().get("id")
        if not account_id:
            return items

        # Step 2: ottieni statuses recenti
        r2 = requests.get(
            f"https://truthsocial.com/api/v1/accounts/{account_id}/statuses",
            params={"limit": 20, "exclude_replies": "true"},
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=15
        )
        if not r2.ok:
            print(f"    ⚠️  Statuses failed: {r2.status_code}")
            return items

        posts = r2.json()
        cutoff = datetime.now(timezone.utc) - timedelta(hours=MAX_AGE_HOURS)

        for post in posts:
            # Parse timestamp
            created = post.get("created_at", "")
            try:
                ts = datetime.fromisoformat(created.replace("Z", "+00:00"))
                if ts < cutoff:
                    continue
            except Exception:
                continue

            # Clean HTML
            content = re.sub(r'<[^>]+>', ' ', post.get("content", ""))
            content = re.sub(r'\s+', ' ', content).strip()

            if not content:
                continue

            rel = is_relevant(content)

            items.append({
                "source": "truth_social",
                "author": "@realDonaldTrump",
                "platform": "Truth Social",
                "text": content[:500],
                "url": post.get("url", "https://truthsocial.com/@realDonaldTrump"),
                "timestamp": created,
                "relevant": rel["relevant"],
                "keywords": rel["keywords"],
                "category": rel.get("category", "general"),
                "score": rel["score"]
            })

        print(f"    ✅ {len(items)} post trovati (ultimi {MAX_AGE_HOURS}h)")

    except Exception as e:
        print(f"    ❌ Truth Social error: {e}")

    return items

# ── FONTE 2: Nitter RSS — X/Twitter accounts ──────────────
NITTER_INSTANCES = [
    "https://nitter.privacydev.net",
    "https://nitter.poast.org",
    "https://nitter.1d4.us",
    "https://nitter.kavin.rocks",
]

TWITTER_ACCOUNTS = [
    "realDonaldTrump",   # Fallback se Truth Social non funziona
    "elonmusk",          # Market mover
    "federalreserve",    # Fed comunicazioni
    "SecBlinken",        # Segretario di Stato
]

TWITTER_SEARCHES = [
    "#Iran market",
    "#Taiwan market",
    "#TrumpTariffs",
    "#TradeWar",
    "#FedRate",
    "#OilPrice",
    "escalation war market",
]

def fetch_nitter_rss(path: str) -> list:
    """Prova ogni istanza Nitter disponibile."""
    for instance in NITTER_INSTANCES:
        url = f"{instance}{path}"
        try:
            feed = feedparser.parse(url)
            if feed.entries:
                return feed.entries
        except Exception:
            continue
        time.sleep(0.3)
    return []

def fetch_twitter_via_nitter():
    items = []
    print("  [Nitter/X] Fetching accounts + searches...")

    # Account feed
    for account in TWITTER_ACCOUNTS[:3]:  # Limita richieste
        entries = fetch_nitter_rss(f"/{account}/rss")
        cutoff = datetime.now(timezone.utc) - timedelta(hours=MAX_AGE_HOURS)

        for entry in entries[:10]:
            title = entry.get("title", "")
            summary = entry.get("summary", title)
            text = re.sub(r'<[^>]+>', ' ', summary)
            text = re.sub(r'\s+', ' ', text).strip()

            # Parse date
            published = entry.get("published_parsed")
            if published:
                ts = datetime(*published[:6], tzinfo=timezone.utc)
                if ts < cutoff:
                    continue

            rel = is_relevant(text)
            if not rel["relevant"] and account not in ["realDonaldTrump", "elonmusk"]:
                continue

            items.append({
                "source": "twitter_nitter",
                "author": f"@{account}",
                "platform": "X (Twitter)",
                "text": text[:400],
                "url": entry.get("link", f"https://x.com/{account}"),
                "timestamp": entry.get("published", datetime.now().isoformat()),
                "relevant": rel["relevant"],
                "keywords": rel["keywords"],
                "category": rel.get("category", "general"),
                "score": rel["score"]
            })

        time.sleep(0.5)

    print(f"    ✅ {len(items)} tweet trovati")
    return items

# ── FONTE 3: Google News RSS ──────────────────────────────
GOOGLE_NEWS_QUERIES = [
    # Geopolitica + escalation
    "iran attack market",
    "taiwan strait escalation",
    "ukraine war ceasefire",
    "trump tariffs stock market",
    "china trade war economy",
    # Mercati + macro
    "federal reserve interest rates",
    "S&P 500 today market",
    "oil price OPEC",
    "gold price today",
    "bitcoin crypto market",
    # Insider + fondi
    "warren buffett berkshire hathaway",
    "blackrock portfolio allocation",
]

def fetch_google_news():
    items = []
    print("  [Google News] Fetching RSS feeds...")

    cutoff = datetime.now(timezone.utc) - timedelta(hours=MAX_AGE_HOURS * 2)  # Google news un po' più indietro

    for query in GOOGLE_NEWS_QUERIES[:8]:  # Limita per non sovraccaricare
        q_encoded = requests.utils.quote(query)
        url = f"https://news.google.com/rss/search?q={q_encoded}&hl=en-US&gl=US&ceid=US:en"

        try:
            feed = feedparser.parse(url)

            for entry in feed.entries[:3]:
                title = entry.get("title", "")
                if not title:
                    continue

                published = entry.get("published_parsed")
                if published:
                    ts = datetime(*published[:6], tzinfo=timezone.utc)
                    if ts < cutoff:
                        continue

                raw_summary = entry.get("summary", "")
                rel = is_relevant(title + " " + raw_summary)
                clean_summary = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', raw_summary)).strip()

                items.append({
                    "source": "google_news",
                    "author": entry.get("source", {}).get("title", "Google News"),
                    "platform": "Google News",
                    "text": title[:300],
                    "summary": clean_summary[:400],
                    "url": entry.get("link", ""),
                    "timestamp": entry.get("published", ""),
                    "relevant": rel["relevant"],
                    "keywords": rel["keywords"],
                    "category": rel.get("category", "news"),
                    "score": rel["score"],
                    "query": query
                })

        except Exception as e:
            pass  # Silenzioso per Google News

        time.sleep(0.3)

    print(f"    ✅ {len(items)} notizie trovate")
    return items

# ── FONTE 4: Reuters / FT RSS ────────────────────────────
RSS_FEEDS = [
    {"url": "https://feeds.reuters.com/reuters/businessNews",      "name": "Reuters Business"},
    {"url": "https://feeds.reuters.com/reuters/worldNews",         "name": "Reuters World"},
    {"url": "https://feeds.reuters.com/reuters/technologyNews",    "name": "Reuters Tech"},
    {"url": "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", "name": "NYT Business"},
    {"url": "https://www.ft.com/rss/home",                         "name": "Financial Times"},
    {"url": "https://feeds.marketwatch.com/marketwatch/topstories/","name": "MarketWatch"},
]

def fetch_rss_feeds():
    items = []
    print("  [RSS Feeds] Reuters, FT, MarketWatch...")
    cutoff = datetime.now(timezone.utc) - timedelta(hours=MAX_AGE_HOURS * 2)

    for feed_info in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_info["url"])
            for entry in feed.entries[:5]:
                title = entry.get("title", "")
                summary = re.sub(r'<[^>]+>', ' ', entry.get("summary", ""))
                full_text = f"{title} {summary}"

                published = entry.get("published_parsed")
                if published:
                    ts = datetime(*published[:6], tzinfo=timezone.utc)
                    if ts < cutoff:
                        continue

                rel = is_relevant(full_text)
                if not rel["relevant"]:
                    continue

                # Prendi il summary RSS (già disponibile, no fetch extra)
                desc = re.sub(r'\s+', ' ', summary).strip()

                items.append({
                    "source": "rss",
                    "author": feed_info["name"],
                    "platform": feed_info["name"],
                    "text": title[:300],
                    "summary": desc[:500],
                    "url": entry.get("link", feed_info["url"]),
                    "timestamp": entry.get("published", ""),
                    "relevant": True,
                    "keywords": rel["keywords"],
                    "category": rel.get("category", "news"),
                    "score": rel["score"]
                })

        except Exception:
            pass
        time.sleep(0.2)

    print(f"    ✅ {len(items)} articoli RSS rilevanti")
    return items

# ── Mappa keyword → ticker portfolio impattati ────────────
KEYWORD_PORTFOLIO_MAP = {
    "tesla":      ("TSLA", "📉 Impatto diretto"),
    "tsla":       ("TSLA", "📉 Impatto diretto"),
    "blackrock":  ("BLK",  "📉 Impatto diretto"),
    "blk":        ("BLK",  "📉 Impatto diretto"),
    "crispr":     ("CRSP", "📉 Impatto diretto"),
    "gene":       ("CRSP", "Possibile impatto biotech"),
    "biotech":    ("CRSP", "Settore biotech in movimento"),
    "archer":     ("ACHR", "📉 Impatto diretto"),
    "evtol":      ("ACHR", "Settore aviation"),
    "tempus":     ("TEM",  "📉 Impatto diretto"),
    "ai health":  ("TEM",  "AI healthcare in movimento"),
    "coreweave":  ("CRWV", "📉 Impatto diretto"),
    "nvidia":     ("NVDA", "AI/GPU in movimento → CRWV correlato"),
    "ai":         ("CRWV", "AI cloud in movimento"),
    "china":      ("TSLA", "Mercato EV cinese"),
    "trade war":  ("TSLA", "Dazi → EV e tech"),
    "tariff":     ("TSLA", "Dazi → settore auto/tech"),
    "iran":       ("USO",  "Rischio geopolitico → oil spike"),
    "oil":        ("USO",  "Commodity in movimento"),
    "fed":        ("BLK",  "Tassi → asset management"),
    "interest rate": ("BLK", "Tassi → finanza"),
    "recession":  ("SPY",  "Risk-off → tutto il portfolio"),
    "war":        ("SPY",  "Risk-off → tutto il portfolio"),
}

def get_portfolio_impact(text: str, keywords: list) -> str:
    """Identifica quali titoli del portfolio sono impattati dalla notizia."""
    text_lower = text.lower()
    hits = {}
    for kw, (ticker, note) in KEYWORD_PORTFOLIO_MAP.items():
        if kw in text_lower or kw in [k.lower() for k in keywords]:
            hits[ticker] = note
    if hits:
        return " | ".join([f"<b>{t}</b>: {n}" for t, n in list(hits.items())[:3]])
    return ""

# ── Combina, deduplicazione e alert ───────────────────────
def process_and_alert(all_items: list, cache_set: set, cache_dict: dict):
    now_iso = datetime.now(timezone.utc).isoformat()
    new_items = []
    urgent_alerts = []
    normal_alerts = []

    for item in all_items:
        h = text_hash(item["text"])
        if h in cache_set:
            continue

        cache_dict[h] = now_iso
        cache_set.add(h)
        new_items.append(item)

        kws = [k.lower() for k in item.get("keywords", [])]
        is_trump = item.get("author", "").lower() in ["@realdonaldtrump"]
        is_escalation = any(k in kws for k in ["war", "attack", "missile", "strike", "nuclear", "invasion"])
        is_market_moving = item.get("score", 0) >= 3

        raw_title   = item["text"][:250]
        raw_summary = item.get("summary", "")[:350]
        impact = get_portfolio_impact(item["text"] + " " + raw_summary, item.get("keywords", []))
        source_name = item.get("author", item.get("platform", ""))
        url = item.get("url", "")

        # Traduci titolo e sommario in italiano
        title   = translate_to_it(raw_title)
        summary = translate_to_it(raw_summary) if raw_summary else ""

        # Traduci e salva anche nel JSON (campo text_it per il sito)
        item["text_it"]    = title
        item["summary_it"] = summary

        # Costruisci messaggio ricco
        msg_parts = [f"<b>{title}</b>"]
        if summary and summary.strip() != title.strip():
            msg_parts.append(f"\n📄 {summary}")
        if impact:
            msg_parts.append(f"\n💼 Portfolio: {impact}")
        msg_parts.append(f"\n📰 {source_name}")
        if url:
            msg_parts.append(f" · <a href='{url}'>Leggi ↗</a>")

        full_msg = "".join(msg_parts)

        score = item.get("score", 0)
        # Soglie: urgente se escalation/trump con score>=2, normale se score>=4
        if (is_trump or is_escalation) and score >= 2:
            urgent_alerts.append(full_msg)
        elif is_market_moving and score >= 4:
            normal_alerts.append(full_msg)

    # Alert urgenti: massimo 2 per run (no flood)
    if urgent_alerts:
        for alert in urgent_alerts[:2]:
            send_telegram(f"🚨 <b>ALERT — {datetime.now().strftime('%H:%M')}</b>\n\n{alert}", urgent=True)
            time.sleep(1.5)

    # News importanti: UN solo messaggio batch (max 3 notizie)
    if normal_alerts:
        batch = "\n\n─────\n\n".join(normal_alerts[:3])
        send_telegram(f"📡 <b>Market Intel — {datetime.now().strftime('%H:%M')}</b>\n\n{batch}")

    return new_items

# ── Aggiorna geopolitical_data.json ──────────────────────
def update_geo_data(all_items: list):
    existing = {}
    if GEO_DATA_FILE.exists():
        try:
            with open(GEO_DATA_FILE) as f:
                existing = json.load(f)
        except Exception:
            pass

    # Mantieni ultimi 100 items
    recent = existing.get("items", [])
    recent = all_items + recent
    recent = recent[:100]  # ultimi 100

    # Stats per categoria
    categories = {}
    for item in recent[:20]:
        cat = item.get("category", "other")
        categories[cat] = categories.get(cat, 0) + 1

    output = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "stats": {
            "total_items": len(recent),
            "categories": categories,
            "sources": {
                "truth_social": len([i for i in recent[:20] if i["source"] == "truth_social"]),
                "twitter": len([i for i in recent[:20] if i["source"] == "twitter_nitter"]),
                "google_news": len([i for i in recent[:20] if i["source"] == "google_news"]),
                "rss": len([i for i in recent[:20] if i["source"] == "rss"]),
            }
        },
        "items": recent
    }

    with open(GEO_DATA_FILE, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"  ✅ geopolitical_data.json aggiornato ({len(recent)} items totali)")

# ── Main ───────────────────────────────────────────────────
def main():
    now = datetime.now()
    print(f"\n{'='*55}")
    print(f" Geo/Social Monitor — {now.strftime('%A %d/%m/%Y %H:%M:%S')}")
    print(f"{'='*55}")

    # Carica cache
    cache_set, cache_dict = load_cache()
    print(f"  Cache: {len(cache_set)} items noti")

    # Fetch da tutte le fonti
    all_items = []

    # Trump su Truth Social (priorità massima)
    all_items.extend(fetch_truth_social_trump())

    # X via Nitter (fallback e altri account)
    all_items.extend(fetch_twitter_via_nitter())

    # Google News
    all_items.extend(fetch_google_news())

    # RSS Reuters/FT/MarketWatch
    all_items.extend(fetch_rss_feeds())

    print(f"\n  📥 Totale items raccolti: {len(all_items)}")

    # Filtra solo rilevanti
    relevant = [i for i in all_items if i.get("relevant", False) or i.get("score", 0) > 0]
    print(f"  🎯 Items rilevanti: {len(relevant)}")

    # Deduplica e invia alert
    new_items = process_and_alert(relevant, cache_set, cache_dict)
    print(f"  🆕 Nuovi items: {len(new_items)}")

    # Aggiorna file dati
    if relevant:
        update_geo_data(relevant)

    # Salva cache aggiornata
    save_cache(cache_dict)

    print(f"\n  ✅ Monitor geo completato — {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    main()
