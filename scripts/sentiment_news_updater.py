#!/usr/bin/env python3
"""
sentiment_news_updater.py — Aggiornamento sentiment, news e previsioni ogni 6 ore
Eseguito da crontab: 0 6,12,18,0 * * 1-5
"""

import os
import json
import subprocess
import logging
import requests
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
VENV_PYTHON = Path("/root/portfolio_venv/bin/python")

logging.basicConfig(
    format="%(asctime)s [SENTIMENT] %(message)s",
    level=logging.INFO,
    handlers=[
        logging.FileHandler("/root/portfolio_logs/sentiment.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── Config Telegram ──────────────────────────────────────────────────────────
def load_env():
    env_path = BASE_DIR / ".env"
    env = {}
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

def send_telegram(token: str, chat_id: str, text: str):
    try:
        requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=10
        )
    except Exception as e:
        log.error(f"Telegram error: {e}")

# ── Aggiorna prezzi e P&L (richiama monitor orario) ────────────────────────
def update_prices():
    log.info("Aggiornamento prezzi...")
    result = subprocess.run(
        [str(VENV_PYTHON), str(BASE_DIR / "scripts/vps_hourly_monitor.py")],
        capture_output=True, text=True, timeout=90, cwd=str(BASE_DIR)
    )
    log.info(result.stdout[-500:] if result.stdout else result.stderr[-200:])

# ── Aggiorna geo/social ──────────────────────────────────────────────────────
def update_geo():
    log.info("Aggiornamento geo/social...")
    result = subprocess.run(
        [str(VENV_PYTHON), str(BASE_DIR / "scripts/vps_social_geo_monitor.py")],
        capture_output=True, text=True, timeout=90, cwd=str(BASE_DIR)
    )
    log.info(result.stdout[-500:] if result.stdout else result.stderr[-200:])

# ── Genera summary con Claude ────────────────────────────────────────────────
def generate_summary() -> str:
    try:
        pnl = json.loads((DATA_DIR / "portfolio_pnl.json").read_text())
        geo = json.loads((DATA_DIR / "geopolitical_data.json").read_text())
        mkt = json.loads((DATA_DIR / "market_data.json").read_text())

        s = pnl["summary"]
        news_titles = [n.get("title", "")[:80] for n in geo.get("news", [])[:4]]
        sentiment = mkt.get("sentiment", "N/A")

        prompt = f"""Sei un analista del portfolio di @ItaloMarziano. Genera un briefing di mercato in italiano, max 250 parole, in formato Telegram (usa emoji e grassetto *testo*).

Dati portfolio:
- Valore: ${s['total_value']:.2f} | P&L: ${s['total_return']:.2f} ({s['total_return_pct']:.1f}%)
- Posizioni: TSLA {pnl['positions']['TSLA']['change_today_pct']:.1f}%, BLK {pnl['positions']['BLK']['change_today_pct']:.1f}%, TEM {pnl['positions']['TEM']['change_today_pct']:.1f}%, ACHR {pnl['positions']['ACHR']['change_today_pct']:.1f}%, CRSP {pnl['positions']['CRSP']['change_today_pct']:.1f}%, CRWV {pnl['positions']['CRWV']['change_today_pct']:.1f}%

Sentiment: {sentiment}
Notizie: {'; '.join(news_titles)}

Includi: sentiment generale, titoli in evidenza, rischi principali, un'azione suggerita (monitora/agisci/mantieni)."""

        result = subprocess.run(
            ["claude", "-p", prompt],
            capture_output=True, text=True, timeout=60,
            cwd=str(BASE_DIR),
            env={**os.environ, "CLAUDE_NO_STREAM": "1"}
        )
        return result.stdout.strip() if result.stdout else "Briefing non disponibile."
    except Exception as e:
        log.error(f"Errore generazione summary: {e}")
        return f"Errore summary: {e}"

# ── Git deploy ───────────────────────────────────────────────────────────────
def git_deploy():
    log.info("Git deploy...")
    subprocess.run(
        ["bash", str(BASE_DIR / "scripts/vps_git_deploy.sh")],
        capture_output=True, text=True, timeout=60, cwd=str(BASE_DIR)
    )

# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    env = load_env()
    for k, v in env.items():
        os.environ.setdefault(k, v)

    token = env.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = env.get("TELEGRAM_CHAT_ID", "320293500")
    now = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC")

    log.info(f"=== Sentiment update {now} ===")

    update_prices()
    update_geo()

    summary = generate_summary()
    header = f"📊 *Briefing Portfolio — {now}*\n\n"
    send_telegram(token, chat_id, header + summary)
    log.info("Summary inviato su Telegram")

    git_deploy()
    log.info("=== Sentiment update completato ===")

if __name__ == "__main__":
    main()
