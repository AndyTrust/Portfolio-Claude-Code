#!/usr/bin/env python3
"""
sentiment_news_updater.py — Aggiornamento sentiment e briefing portfolio
Eseguito da crontab: 0 0,6,12,18 * * 1-5 + 0 9,18 * * 6,0

Regole anti-spam:
- Telegram briefing SOLO alle 06:00 (mattina) e 18:00 (sera)
- Tutte le altre run aggiornano JSON ma NON mandano Telegram
- Il briefing viene saltato se il contenuto non è cambiato significativamente
"""

import os
import json
import hashlib
import subprocess
import logging
import requests
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR     = Path(__file__).parent.parent
DATA_DIR     = BASE_DIR / "data"
VENV_PYTHON  = Path("/root/portfolio_venv/bin/python")
BRIEFING_CACHE = DATA_DIR / "memory" / "last_briefing.json"

# Ore in cui si manda il briefing Telegram (UTC)
BRIEFING_HOURS = {6, 18}

logging.basicConfig(
    format="%(asctime)s [SENTIMENT] %(message)s",
    level=logging.INFO,
    handlers=[
        logging.FileHandler("/root/portfolio_logs/sentiment.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)


def load_env() -> dict:
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
        resp = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=10,
        )
        if resp.ok:
            log.info("Telegram: briefing inviato")
        else:
            log.warning(f"Telegram error: {resp.status_code}")
    except Exception as e:
        log.error(f"Telegram exception: {e}")


def update_prices():
    log.info("Aggiornamento prezzi...")
    result = subprocess.run(
        [str(VENV_PYTHON), str(BASE_DIR / "scripts/vps_hourly_monitor.py")],
        capture_output=True, text=True, timeout=90, cwd=str(BASE_DIR),
    )
    log.info(result.stdout[-300:] if result.stdout else result.stderr[-150:])


def update_geo():
    log.info("Aggiornamento geo/social...")
    result = subprocess.run(
        [str(VENV_PYTHON), str(BASE_DIR / "scripts/vps_social_geo_monitor.py")],
        capture_output=True, text=True, timeout=90, cwd=str(BASE_DIR),
    )
    log.info(result.stdout[-300:] if result.stdout else result.stderr[-150:])


def _briefing_fingerprint(pnl: dict, geo: dict) -> str:
    """Hash leggero su P&L + prime 3 news per rilevare cambiamenti significativi."""
    s = pnl.get("summary", {})
    total_val = round(s.get("total_value", 0), 0)
    news_ids  = [n.get("id") or n.get("text", "")[:40] for n in geo.get("items", [])[:3]]
    raw = f"{total_val}|{'|'.join(str(x) for x in news_ids)}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def _load_briefing_cache() -> dict:
    try:
        if BRIEFING_CACHE.exists():
            return json.loads(BRIEFING_CACHE.read_text())
    except Exception:
        pass
    return {}


def _save_briefing_cache(fingerprint: str, hour: int):
    BRIEFING_CACHE.parent.mkdir(parents=True, exist_ok=True)
    cache = _load_briefing_cache()
    cache["last_fingerprint"] = fingerprint
    cache["last_sent_hour"]   = hour
    cache["last_sent_date"]   = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    BRIEFING_CACHE.write_text(json.dumps(cache, indent=2))


def should_send_briefing(current_hour: int, pnl: dict, geo: dict) -> tuple[bool, str]:
    """
    Restituisce (bool, motivo).
    Invia se: è un orario di briefing E (contenuto cambiato OPPURE è mattina).
    """
    if current_hour not in BRIEFING_HOURS:
        return False, f"ora {current_hour}:00 non è orario briefing ({sorted(BRIEFING_HOURS)})"

    fingerprint = _briefing_fingerprint(pnl, geo)
    cache = _load_briefing_cache()

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    same_day  = cache.get("last_sent_date") == today_str
    same_fp   = cache.get("last_fingerprint") == fingerprint

    # Mattina (06:00): manda sempre, anche se non ci sono novità
    if current_hour == 6:
        return True, "briefing mattutino obbligatorio"

    # Sera (18:00): salta se stesso fingerprint già inviato oggi
    if same_day and same_fp:
        return False, "contenuto identico all'ultimo briefing — skip"

    return True, "contenuto aggiornato"


def generate_summary(pnl: dict, geo: dict, mkt: dict, is_morning: bool) -> str:
    """Genera briefing via Claude con prompt contestuale."""
    try:
        s = pnl["summary"]
        news_titles = [
            (n.get("text_it") or n.get("text") or n.get("title", ""))[:80]
            for n in geo.get("items", [])[:4]
        ]
        sentiment = mkt.get("sentiment", "N/A")

        slot = "mattutino (apertura mercati)" if is_morning else "serale (chiusura mercati)"

        prompt = (
            f"Sei un analista del portfolio di @ItaloMarziano. "
            f"Genera un briefing {slot} in italiano, max 220 parole, formato Telegram "
            f"(usa emoji e *grassetto*). Non ripetere informazioni ovvie o di routine.\n\n"
            f"Dati portfolio:\n"
            f"- Valore: ${s['total_value']:.2f} | P&L: ${s['total_return']:.2f} ({s['total_return_pct']:.1f}%)\n"
            f"- TSLA {pnl['positions']['TSLA']['change_today_pct']:.1f}% | "
            f"BLK {pnl['positions']['BLK']['change_today_pct']:.1f}% | "
            f"TEM {pnl['positions']['TEM']['change_today_pct']:.1f}% | "
            f"ACHR {pnl['positions']['ACHR']['change_today_pct']:.1f}% | "
            f"CRSP {pnl['positions']['CRSP']['change_today_pct']:.1f}% | "
            f"CRWV {pnl['positions']['CRWV']['change_today_pct']:.1f}%\n\n"
            f"Sentiment: {sentiment}\n"
            f"Notizie chiave: {'; '.join(news_titles)}\n\n"
            f"Includi SOLO: titoli in movimento, rischi attivi, azione suggerita. "
            f"Non scrivere 'nessuna novità', sii specifico."
        )

        result = subprocess.run(
            ["claude", "-p", prompt],
            capture_output=True, text=True, timeout=60,
            cwd=str(BASE_DIR),
            env={**os.environ, "CLAUDE_NO_STREAM": "1"},
        )
        return result.stdout.strip() if result.stdout else "Briefing non disponibile."
    except Exception as e:
        log.error(f"Errore generazione summary: {e}")
        return f"Errore summary: {e}"


def git_deploy():
    log.info("Git deploy...")
    subprocess.run(
        ["bash", str(BASE_DIR / "scripts/vps_git_deploy.sh")],
        capture_output=True, text=True, timeout=60, cwd=str(BASE_DIR),
    )


def main():
    env = load_env()
    for k, v in env.items():
        os.environ.setdefault(k, v)

    token   = env.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = env.get("TELEGRAM_CHAT_ID", "320293500")
    now_utc = datetime.now(timezone.utc)
    current_hour = now_utc.hour
    now_str = now_utc.strftime("%d/%m/%Y %H:%M UTC")

    log.info(f"=== Sentiment update {now_str} (ora UTC {current_hour}) ===")

    # Aggiorna sempre i dati (prezzi + geo)
    update_prices()
    update_geo()

    # Decidi se mandare briefing Telegram
    try:
        pnl = json.loads((DATA_DIR / "portfolio_pnl.json").read_text())
        geo = json.loads((DATA_DIR / "geopolitical_data.json").read_text())
        mkt = json.loads((DATA_DIR / "market_data.json").read_text())
    except Exception as e:
        log.error(f"Errore lettura JSON: {e}")
        git_deploy()
        return

    do_send, reason = should_send_briefing(current_hour, pnl, geo)
    log.info(f"Briefing Telegram: {'SÌ' if do_send else 'NO'} — {reason}")

    if do_send and token:
        is_morning = (current_hour == 6)
        summary = generate_summary(pnl, geo, mkt, is_morning)
        slot_label = "☀️ Apertura" if is_morning else "🌙 Chiusura"
        header = f"📊 *Briefing {slot_label} — {now_str}*\n\n"
        send_telegram(token, chat_id, header + summary)
        _save_briefing_cache(_briefing_fingerprint(pnl, geo), current_hour)

    git_deploy()
    log.info("=== Sentiment update completato ===")


if __name__ == "__main__":
    main()
