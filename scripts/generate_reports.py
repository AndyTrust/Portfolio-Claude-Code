#!/usr/bin/env python3
"""
generate_reports.py — Genera riassunti AI giornaliero / settimanale / mensile
Usa Claude CLI per leggere tutte le news raccolte e scrivere un report in italiano.

Crontab:
  0 18 * * 1-5   → briefing giornaliero
  0 20 * * 0     → report settimanale (domenica)
  0 20 1 * *     → report mensile (1° del mese)
"""

import json
import os
import sys
import subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path

REPO_DIR = Path(__file__).parent.parent
DATA_DIR = REPO_DIR / "data"
LOG_DIR  = Path("/root/portfolio_logs")

def load_env():
    env = {}
    env_path = REPO_DIR / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

def fmtd(iso):
    try:
        return datetime.fromisoformat(iso.replace("Z","+00:00")).strftime("%d/%m/%Y %H:%M")
    except Exception:
        return iso[:16] if iso else "—"

def load_json(path):
    try:
        return json.loads(Path(path).read_text())
    except Exception:
        return None

def get_recent_news(hours=24):
    """Restituisce news delle ultime N ore da geopolitical_data.json."""
    geo = load_json(DATA_DIR / "geopolitical_data.json")
    if not geo:
        return []
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    items = []
    for item in geo.get("items", []):
        ts_str = item.get("timestamp", "")
        try:
            ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            if ts >= cutoff:
                items.append(item)
        except Exception:
            pass
    return items

def get_portfolio_summary():
    """Dati P&L correnti."""
    pnl = load_json(DATA_DIR / "portfolio_pnl.json")
    mkt = load_json(DATA_DIR / "market_data.json")
    if not pnl:
        return "Dati portfolio non disponibili."
    s = pnl.get("summary", {})
    pos = pnl.get("positions", {})
    lines = [
        f"Portfolio totale: ${s.get('total_value',0):.2f}",
        f"P&L non realizzato: ${s.get('total_unrealized_pnl',0):+.2f} ({s.get('total_unrealized_pct',0):+.1f}%)",
        f"Ritorno totale (incl. dividendi): ${s.get('total_return',0):+.2f} ({s.get('total_return_pct',0):+.1f}%)",
    ]
    for ticker, p in pos.items():
        lines.append(f"  {ticker}: ${p.get('current_price',0):.2f} | P&L {p.get('unrealized_pct',0):+.1f}% | oggi {p.get('change_today_pct',0):+.1f}%")
    if mkt:
        for idx in mkt.get("indices", []):
            if idx.get("symbol") in ["SPY","^VIX","GLD"]:
                lines.append(f"  {idx['name']}: {idx.get('value','—')} {idx.get('change','')}")
    return "\n".join(lines)

def run_claude(prompt, max_tokens=800):
    """Chiama claude CLI e restituisce l'output."""
    try:
        result = subprocess.run(
            ["claude", "-p", prompt],
            capture_output=True, text=True, timeout=90,
            cwd=str(REPO_DIR),
            env={**os.environ, "CLAUDE_NO_STREAM": "1"}
        )
        out = result.stdout.strip()
        if out:
            return out
        return f"[Errore Claude: {result.stderr[:200]}]"
    except FileNotFoundError:
        return "[Claude CLI non disponibile]"
    except Exception as e:
        return f"[Errore: {e}]"

def send_telegram(token, chat_id, text):
    import requests as req
    try:
        req.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=10
        )
    except Exception as e:
        print(f"  Telegram error: {e}")

def save_summary(filename, summary, period_label):
    """Salva il riassunto nel file JSON."""
    data = {
        "lastGenerated": datetime.now(timezone.utc).isoformat(),
        "period": period_label,
        "summary": summary
    }
    path = DATA_DIR / filename
    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  ✅ Salvato: {path}")

# ── DAILY ──────────────────────────────────────────────────────────
def generate_daily():
    print("\n📅 Generazione briefing giornaliero…")
    news = get_recent_news(hours=24)
    pnl_summary = get_portfolio_summary()

    news_text = "\n".join([
        f"- {(n.get('text_it') or n.get('text',''))[:120]} [{n.get('author','')}]"
        for n in news[:15]
    ]) or "Nessuna news significativa nelle ultime 24 ore."

    prompt = f"""Sei l'analista personale di @ItaloMarziano. Scrivi un briefing di mercato giornaliero in italiano. Massimo 300 parole. Formato: punti elenco con emoji, tono diretto.

PORTFOLIO OGGI:
{pnl_summary}

NEWS ULTIME 24 ORE:
{news_text}

Includi: situazione mercati, titoli portfolio in evidenza, notizie più rilevanti, azione suggerita (monitora/hold/attenzione). SOLO in italiano."""

    summary = run_claude(prompt)
    save_summary("daily_summary.json", summary, f"Daily — {datetime.now().strftime('%d/%m/%Y')}")
    return summary

# ── WEEKLY ──────────────────────────────────────────────────────────
def generate_weekly():
    print("\n📊 Generazione report settimanale…")
    news = get_recent_news(hours=168)  # 7 giorni
    pnl_summary = get_portfolio_summary()

    # Raggruppa per categoria
    by_cat = {}
    for n in news:
        cat = n.get("category", "news")
        by_cat.setdefault(cat, []).append(n)

    news_text = ""
    for cat, items in by_cat.items():
        news_text += f"\n[{cat.upper()}]\n"
        for n in items[:5]:
            news_text += f"  - {(n.get('text_it') or n.get('text',''))[:100]} | {n.get('author','')}\n"

    if not news_text.strip():
        news_text = "Nessuna news raccolta questa settimana."

    prompt = f"""Sei l'analista personale di @ItaloMarziano. Scrivi un REPORT SETTIMANALE di mercato in italiano. Massimo 500 parole. Struttura:
1. Riepilogo settimana (2-3 frasi)
2. Titoli portfolio: performance e segnali
3. Geopolitica e macro: 3-5 eventi chiave con impatto
4. Insider e fondi: movimenti significativi
5. Outlook prossima settimana
6. Azione raccomandata

PORTFOLIO:
{pnl_summary}

NEWS SETTIMANA:
{news_text}

SOLO in italiano. Sii preciso, usa numeri reali, non essere generico."""

    summary = run_claude(prompt)
    now = datetime.now()
    week_label = f"Settimana {now.isocalendar()[1]} — {now.strftime('%d/%m/%Y')}"
    save_summary("weekly_summary.json", summary, week_label)
    return summary

# ── MONTHLY ──────────────────────────────────────────────────────────
def generate_monthly():
    print("\n📆 Generazione report mensile…")
    news = get_recent_news(hours=720)  # 30 giorni
    pnl_summary = get_portfolio_summary()

    # Top 20 news più rilevanti (per score)
    top_news = sorted(news, key=lambda x: x.get("score", 0), reverse=True)[:20]
    news_text = "\n".join([
        f"- {(n.get('text_it') or n.get('text',''))[:120]} [{n.get('author','')}] score:{n.get('score',0)}"
        for n in top_news
    ]) or "Nessuna news raccolta questo mese."

    prompt = f"""Sei l'analista personale di @ItaloMarziano. Scrivi un REPORT MENSILE completo in italiano. Massimo 800 parole. Struttura:
1. Riepilogo mese (macro e mercati)
2. Portfolio: P&L mensile, titoli migliori/peggiori, cambiamenti
3. Top 5 eventi geopolitici/macro del mese con impatto
4. Insider e fondi: segnali di accumulo/distribuzione
5. Outlook prossimo mese: rischi e opportunità
6. Raccomandazioni: hold/accumula/riduci per ogni titolo

PORTFOLIO ATTUALE:
{pnl_summary}

NEWS DEL MESE (top per rilevanza):
{news_text}

SOLO in italiano. Sii dettagliato e professionale."""

    summary = run_claude(prompt)
    now = datetime.now()
    month_label = f"{now.strftime('%B %Y').capitalize()}"
    save_summary("monthly_summary.json", summary, month_label)
    return summary

# ── MAIN ──────────────────────────────────────────────────────────────
def main():
    env = load_env()
    for k, v in env.items():
        os.environ.setdefault(k, v)

    token = env.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = env.get("TELEGRAM_CHAT_ID", "320293500")

    mode = sys.argv[1] if len(sys.argv) > 1 else "daily"
    print(f"\n{'='*55}")
    print(f" Generate Reports — {mode.upper()} — {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print(f"{'='*55}")

    if mode == "daily":
        summary = generate_daily()
        if token:
            send_telegram(token, chat_id,
                f"📅 *Briefing Giornaliero — {datetime.now().strftime('%d/%m/%Y %H:%M')}*\n\n{summary[:3000]}")
    elif mode == "weekly":
        summary = generate_weekly()
        if token:
            send_telegram(token, chat_id,
                f"📊 *Report Settimanale — {datetime.now().strftime('W%W %Y')}*\n\n{summary[:3000]}")
    elif mode == "monthly":
        summary = generate_monthly()
        if token:
            send_telegram(token, chat_id,
                f"📆 *Report Mensile — {datetime.now().strftime('%B %Y')}*\n\n{summary[:3000]}")
    else:
        print(f"Uso: {sys.argv[0]} [daily|weekly|monthly]")
        sys.exit(1)

    # Git deploy per aggiornare il sito con i nuovi riassunti
    subprocess.run(["bash", str(REPO_DIR / "scripts/vps_git_deploy.sh")],
                   capture_output=True, cwd=str(REPO_DIR))

    print(f"\n  ✅ Report {mode} completato — {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    main()
