#!/usr/bin/env python3
"""
telegram_bot.py — Portfolio Intelligence Bot
Polling 24/7 sulla VPS. Risponde a comandi e domande in linguaggio naturale.
"""

import os
import json
import logging
import subprocess
import asyncio
from datetime import datetime
from pathlib import Path

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.constants import ParseMode

# ── Config ──────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
SCRIPTS_DIR = BASE_DIR / "scripts"
VENV_PYTHON = Path("/root/portfolio_venv/bin/python")

# Carica .env prima di leggere le variabili
_env_path = BASE_DIR / ".env"
if _env_path.exists():
    for _line in _env_path.read_text().splitlines():
        if "=" in _line and not _line.startswith("#"):
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k.strip(), _v.strip())

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ALLOWED_CHAT_ID = int(os.getenv("TELEGRAM_CHAT_ID", "320293500"))

logging.basicConfig(
    format="%(asctime)s [BOT] %(levelname)s %(message)s",
    level=logging.INFO,
    handlers=[
        logging.FileHandler("/root/portfolio_logs/telegram_bot.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── Sicurezza: solo il proprietario può interagire ──────────────────────────
def authorized(update: Update) -> bool:
    return update.effective_chat.id == ALLOWED_CHAT_ID

def deny(update: Update):
    log.warning(f"Accesso negato a chat_id={update.effective_chat.id}")

# ── Helpers ──────────────────────────────────────────────────────────────────
def load_json(path: Path) -> dict:
    with open(path) as f:
        return json.load(f)

def fmt_pct(v: float) -> str:
    return f"+{v:.2f}%" if v >= 0 else f"{v:.2f}%"

def fmt_money(v: float) -> str:
    return f"+${v:.2f}" if v >= 0 else f"-${abs(v):.2f}"

def run_script(script: str, timeout: int = 120) -> str:
    result = subprocess.run(
        [str(VENV_PYTHON), str(SCRIPTS_DIR / script)],
        capture_output=True, text=True, timeout=timeout,
        cwd=str(BASE_DIR)
    )
    return result.stdout[-1500:] if result.stdout else result.stderr[-500:]

def ask_claude(question: str, context: str = "") -> str:
    prompt = f"{context}\n\nDomanda: {question}" if context else question
    result = subprocess.run(
        ["claude", "-p", prompt],
        capture_output=True, text=True, timeout=60,
        cwd=str(BASE_DIR),
        env={**os.environ, "CLAUDE_NO_STREAM": "1"}
    )
    return result.stdout.strip() if result.stdout else "Errore nella risposta Claude."

def build_portfolio_context() -> str:
    try:
        pnl = load_json(DATA_DIR / "portfolio_pnl.json")
        mkt = load_json(DATA_DIR / "market_data.json")
        s = pnl["summary"]
        lines = [
            f"Portfolio @ItaloMarziano — {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            f"Investito: ${s['total_cost']:.2f} | Valore: ${s['total_value']:.2f}",
            f"P&L: {fmt_money(s['total_return'])} ({fmt_pct(s['total_return_pct'])})",
            "",
            "Posizioni:"
        ]
        for ticker, pos in pnl["positions"].items():
            lines.append(
                f"  {ticker}: ${pos['current_price']:.2f} | "
                f"{fmt_pct(pos['unrealized_pct'])} | oggi {fmt_pct(pos['change_today_pct'])}"
            )
        lines.append(f"\nSentiment mercato: {mkt.get('sentiment','N/A')}")
        return "\n".join(lines)
    except Exception as e:
        return f"Contesto portfolio non disponibile: {e}"

# ── Comandi ─────────────────────────────────────────────────────────────────
async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not authorized(update): return deny(update)
    await update.message.reply_text(
        "🤖 *Portfolio Intelligence Bot* attivo!\n\n"
        "Comandi rapidi:\n"
        "/pnl — P\\&L attuale\n"
        "/news — Ultime notizie geo\n"
        "/update — Forza aggiornamento prezzi\n"
        "/deploy — Push su GitHub\n"
        "/status — Status sistema\n\n"
        "Oppure scrivi qualsiasi domanda sul portfolio in linguaggio naturale.",
        parse_mode=ParseMode.MARKDOWN_V2
    )

async def cmd_pnl(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not authorized(update): return deny(update)
    await update.message.reply_text("⏳ Carico P&L...")
    try:
        pnl = load_json(DATA_DIR / "portfolio_pnl.json")
        s = pnl["summary"]
        emoji = "📈" if s["total_return"] >= 0 else "📉"
        last = pnl.get("lastUpdated", "?")[:16].replace("T", " ")

        lines = [
            f"{emoji} *Portfolio @ItaloMarziano*",
            f"_Aggiornato: {last} UTC_\n",
            f"💰 Investito: `${s['total_cost']:.2f}`",
            f"💼 Valore: `${s['total_value']:.2f}`",
            f"{'🟢' if s['total_return']>=0 else '🔴'} P&L: `{fmt_money(s['total_return'])}` ({fmt_pct(s['total_return_pct'])})",
            f"🏦 Dividendi: `+${s['total_dividends']:.2f}`\n",
            "──────────────────"
        ]
        for ticker, pos in pnl["positions"].items():
            arrow = "🟢" if pos["unrealized_pnl"] >= 0 else "🔴"
            today = "↑" if pos["change_today_pct"] >= 0 else "↓"
            lines.append(
                f"{arrow} *{ticker}* `${pos['current_price']:.2f}` "
                f"{fmt_pct(pos['unrealized_pct'])} | oggi {today}{abs(pos['change_today_pct']):.1f}%"
            )
        await update.message.reply_text("\n".join(lines), parse_mode=ParseMode.MARKDOWN_V2)
    except Exception as e:
        await update.message.reply_text(f"❌ Errore: {e}")

async def cmd_news(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not authorized(update): return deny(update)
    await update.message.reply_text("⏳ Carico notizie...")
    try:
        geo = load_json(DATA_DIR / "geopolitical_data.json")
        news = geo.get("news", [])[:5]
        if not news:
            await update.message.reply_text("Nessuna notizia recente.")
            return
        lines = ["📰 *Ultime notizie geo*\n"]
        for n in news:
            impact = n.get("marketImpact", "")
            lines.append(f"• *{n.get('title','?')[:80]}*")
            if impact:
                lines.append(f"  _{impact}_")
        await update.message.reply_text("\n".join(lines), parse_mode=ParseMode.MARKDOWN_V2)
    except Exception as e:
        await update.message.reply_text(f"❌ Errore: {e}")

async def cmd_update(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not authorized(update): return deny(update)
    await update.message.reply_text("⏳ Aggiornamento prezzi in corso...")
    try:
        out = run_script("vps_hourly_monitor.py", timeout=90)
        await update.message.reply_text(f"✅ Aggiornamento completato\n\n`{out[-800:]}`", parse_mode=ParseMode.MARKDOWN_V2)
    except subprocess.TimeoutExpired:
        await update.message.reply_text("⏱️ Timeout — controlla i log")
    except Exception as e:
        await update.message.reply_text(f"❌ Errore: {e}")

async def cmd_deploy(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not authorized(update): return deny(update)
    await update.message.reply_text("⏳ Git deploy in corso...")
    try:
        result = subprocess.run(
            ["bash", str(SCRIPTS_DIR / "vps_git_deploy.sh")],
            capture_output=True, text=True, timeout=60, cwd=str(BASE_DIR)
        )
        out = (result.stdout + result.stderr)[-800:]
        await update.message.reply_text(f"✅ Deploy\n\n`{out}`", parse_mode=ParseMode.MARKDOWN_V2)
    except Exception as e:
        await update.message.reply_text(f"❌ Errore: {e}")

async def cmd_status(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not authorized(update): return deny(update)
    try:
        pnl = load_json(DATA_DIR / "portfolio_pnl.json")
        mkt = load_json(DATA_DIR / "market_data.json")
        last_pnl = pnl.get("lastUpdated", "?")[:16].replace("T", " ")
        last_mkt = mkt.get("lastUpdated", "?")[:16]
        lines = [
            "⚙️ *Status Sistema*\n",
            f"🕐 P&L aggiornato: `{last_pnl} UTC`",
            f"📊 Prezzi: `{last_mkt} UTC`",
            f"🌍 Sentiment: `{mkt.get('sentiment','N/A')[:50]}`",
            f"🤖 Bot: *ONLINE* ✅",
            f"📅 Ora VPS: `{datetime.utcnow().strftime('%d/%m/%Y %H:%M')} UTC`"
        ]
        await update.message.reply_text("\n".join(lines), parse_mode=ParseMode.MARKDOWN_V2)
    except Exception as e:
        await update.message.reply_text(f"❌ Errore: {e}")

# ── Messaggio libero → Claude ────────────────────────────────────────────────
async def handle_message(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not authorized(update): return deny(update)
    text = update.message.text.strip()
    await update.message.reply_text("🤔 Elaboro...")
    try:
        context = build_portfolio_context()
        system = (
            "Sei un assistente per il portfolio di investimento di Andrea (@ItaloMarziano). "
            "Titoli: TSLA, BLK, TEM, ACHR, CRSP, CRWV. Rispondi in italiano, conciso, max 300 parole. "
            "Non inventare dati. Usa solo il contesto fornito."
        )
        full_prompt = f"{system}\n\nContesto attuale:\n{context}\n\nDomanda: {text}"
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: ask_claude(full_prompt))
        if len(response) > 3500:
            response = response[:3500] + "..."
        await update.message.reply_text(response)
    except Exception as e:
        await update.message.reply_text(f"❌ Errore Claude: {e}")

# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    if not TOKEN:
        raise ValueError("TELEGRAM_BOT_TOKEN non trovato nel .env")
    log.info("🤖 Bot avviato — polling attivo")
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_start))
    app.add_handler(CommandHandler("pnl", cmd_pnl))
    app.add_handler(CommandHandler("news", cmd_news))
    app.add_handler(CommandHandler("update", cmd_update))
    app.add_handler(CommandHandler("deploy", cmd_deploy))
    app.add_handler(CommandHandler("status", cmd_status))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    # Carica .env
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())
    main()
