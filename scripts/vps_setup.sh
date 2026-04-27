#!/usr/bin/env bash
# =============================================================================
#  Portfolio Intelligence — VPS Setup Script
#  Esegui UNA VOLTA sulla VPS come root o utente con sudo
#  Usage: bash vps_setup.sh
# =============================================================================
set -e

REPO_URL="git@github.com:AndyTrust/Portfolio-Claude-Code.git"
REPO_DIR="$HOME/Portfolio-Claude-Code"
SCRIPTS_DIR="$REPO_DIR/scripts"
PYTHON_BIN="python3"
PIP_BIN="pip3"

echo "======================================================"
echo " Portfolio Intelligence VPS Setup"
echo "======================================================"

# ── 1. Dipendenze di sistema ───────────────────────────────
echo ""
echo "[1/6] Installazione dipendenze sistema..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
  python3 python3-pip python3-venv \
  git curl wget jq \
  ca-certificates gnupg

# ── 2. Virtual environment Python ─────────────────────────
echo ""
echo "[2/6] Creazione virtual environment Python..."
$PYTHON_BIN -m venv "$HOME/portfolio_venv"
source "$HOME/portfolio_venv/bin/activate"

pip install --upgrade pip -q
pip install -q \
  yfinance \
  requests \
  feedparser \
  beautifulsoup4 \
  lxml \
  python-dotenv \
  schedule \
  pytz \
  pandas

echo "  ✅ Virtual env pronto in $HOME/portfolio_venv"

# ── 3. SSH Key per GitHub ──────────────────────────────────
echo ""
echo "[3/6] Configurazione SSH key per GitHub..."
SSH_DIR="$HOME/.ssh"
KEY_FILE="$SSH_DIR/id_portfolio"

mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

if [ ! -f "$KEY_FILE" ]; then
  ssh-keygen -t ed25519 -C "portfolio-vps@auto" -f "$KEY_FILE" -N ""
  echo ""
  echo "  ⚠️  IMPORTANTE: aggiungi questa Deploy Key su GitHub:"
  echo "  Vai su: https://github.com/AndyTrust/Portfolio-Claude-Code/settings/keys"
  echo "  Titolo: VPS Deploy Key"
  echo "  Chiave pubblica (copia tutto):"
  echo "  ─────────────────────────────────────────────────────"
  cat "${KEY_FILE}.pub"
  echo "  ─────────────────────────────────────────────────────"
  echo ""
  read -p "  Premi INVIO quando hai aggiunto la chiave su GitHub..."
else
  echo "  ✅ SSH key già esistente: $KEY_FILE"
fi

# Configura SSH per usare la key giusta con GitHub
cat > "$SSH_DIR/config" << EOF
Host github.com
    HostName github.com
    User git
    IdentityFile $KEY_FILE
    StrictHostKeyChecking no
EOF
chmod 600 "$SSH_DIR/config"

# Test connessione
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated" && \
  echo "  ✅ GitHub SSH OK" || \
  echo "  ⚠️  GitHub SSH non ancora configurato — aggiungi la deploy key"

# ── 4. Clone / aggiornamento repo ─────────────────────────
echo ""
echo "[4/6] Clone/aggiornamento repository..."

if [ -d "$REPO_DIR/.git" ]; then
  cd "$REPO_DIR"
  git pull origin main
  echo "  ✅ Repo aggiornato"
else
  git clone "$REPO_URL" "$REPO_DIR"
  echo "  ✅ Repo clonato in $REPO_DIR"
fi

# Configura git
cd "$REPO_DIR"
git config user.email "portfolio-vps@auto"
git config user.name "Portfolio VPS Bot"

# ── 5. File .env con secrets ──────────────────────────────
echo ""
echo "[5/6] Configurazione variabili d'ambiente..."

ENV_FILE="$REPO_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" << 'EOF'
# ── Telegram Notifications ────────────────────────────────
# Crea il bot con @BotFather su Telegram → ottieni il token
# Poi invia un messaggio al bot e vai su:
# https://api.telegram.org/bot<TOKEN>/getUpdates → copia il chat_id
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_TELEGRAM_CHAT_ID_HERE

# ── Alert thresholds ──────────────────────────────────────
# Notifica se un titolo in portafoglio cambia di più di X%
PRICE_ALERT_THRESHOLD=2.0

# ── GitHub (se usi token invece di SSH) ──────────────────
# GITHUB_TOKEN=ghp_xxxxx  # Opzionale, SSH è preferibile

# ── Orari operativi ───────────────────────────────────────
# NON modificare: gestito dal crontab
EOF
  echo "  ✅ File .env creato in $ENV_FILE"
  echo "  ⚠️  CONFIGURA i valori in $ENV_FILE (Telegram token + chat_id)"
else
  echo "  ✅ File .env già esistente"
fi

# Aggiungi .env al gitignore se non c'è già
grep -q "^\.env$" "$REPO_DIR/.gitignore" 2>/dev/null || \
  echo ".env" >> "$REPO_DIR/.gitignore"

# ── 6. Installazione Crontab ──────────────────────────────
echo ""
echo "[6/6] Installazione crontab..."

VENV_PYTHON="$HOME/portfolio_venv/bin/python"
LOG_DIR="$HOME/portfolio_logs"
mkdir -p "$LOG_DIR"

# Scrivi crontab
CRONTAB_CONTENT=$(cat << EOF
# ============================================================
# Portfolio Intelligence — Cron Jobs
# Timezone: Europe/Rome (UTC+1/+2)
# ============================================================
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=""

# ── Orario di funzionamento ─────────────────────────────
# Mon-Fri (1-5), ore 06:00-01:59 (escluse 02:00-05:59)
# Cron espressione: ogni ora alle :00, nelle ore 0,1,6,7,...,23 nei giorni 1-5

# Monitor prezzi + portfolio (ogni ora Mon-Fri 06:00-01:59)
0 0-1,6-23 * * 1-5 $VENV_PYTHON $SCRIPTS_DIR/vps_hourly_monitor.py >> $LOG_DIR/hourly_monitor.log 2>&1

# Monitor geopolitica + social (ogni ora Mon-Fri 06:00-01:59)
5 0-1,6-23 * * 1-5 $VENV_PYTHON $SCRIPTS_DIR/vps_social_geo_monitor.py >> $LOG_DIR/social_monitor.log 2>&1

# Report insider + 13F (ogni 3 giorni Mon-Fri alle 07:00)
0 7 */3 * 1-5 $VENV_PYTHON $SCRIPTS_DIR/fetch_all_daily.py >> $LOG_DIR/insider_daily.log 2>&1

# Git commit + push (dopo monitor, alle :30 ogni ora Mon-Fri)
30 0-1,6-23 * * 1-5 bash $SCRIPTS_DIR/vps_git_deploy.sh >> $LOG_DIR/git_deploy.log 2>&1

# Cleanup log vecchi (domenica alle 03:00)
0 3 * * 0 find $LOG_DIR -name "*.log" -mtime +7 -delete

EOF
)

# Installa il crontab
echo "$CRONTAB_CONTENT" | crontab -
echo "  ✅ Crontab installato"
echo ""
crontab -l

# ── Fine setup ─────────────────────────────────────────────
echo ""
echo "======================================================"
echo " ✅ Setup completato!"
echo "======================================================"
echo ""
echo " Prossimi passi:"
echo "  1. Aggiungi la deploy key SSH su GitHub (se non l'hai già fatto)"
echo "  2. Configura $ENV_FILE con Telegram token e chat_id"
echo "  3. Test manuale:"
echo "     source $HOME/portfolio_venv/bin/activate"
echo "     python $SCRIPTS_DIR/vps_hourly_monitor.py"
echo ""
echo " Log files: $LOG_DIR/"
echo " Repo:      $REPO_DIR/"
echo ""
