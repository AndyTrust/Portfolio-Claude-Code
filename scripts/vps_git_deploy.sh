#!/usr/bin/env bash
# =============================================================================
#  Portfolio Intelligence — VPS Git Commit + Deploy
#  Eseguito ogni ora :30 dal crontab
#  Committa solo se ci sono modifiche ai file JSON/MD
# =============================================================================
set -e

REPO_DIR="$HOME/Portfolio-Claude-Code"
LOG_TAG="[vps_git_deploy]"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

cd "$REPO_DIR" || { echo "$LOG_TAG ERROR: repo non trovato in $REPO_DIR"; exit 1; }

echo "$LOG_TAG [$TIMESTAMP] Check modifiche..."

# File che possono essere aggiornati dai monitor
MONITORED_FILES=(
  "data/market_data.json"
  "data/insider_data.json"
  "data/geopolitical_data.json"
  "data/portfolio_pnl.json"
  "data/sources.json"
  "reports/"
)

# Controlla se ci sono modifiche
git fetch origin --quiet 2>/dev/null || true

CHANGED=$(git status --short "${MONITORED_FILES[@]}" 2>/dev/null | grep -v "^$" | wc -l | tr -d ' ')

if [ "$CHANGED" -eq "0" ]; then
  echo "$LOG_TAG Nessuna modifica — skip commit"
  exit 0
fi

echo "$LOG_TAG $CHANGED file modificati — commit in corso..."
git status --short "${MONITORED_FILES[@]}"

# Stage solo i file monitorati (mai committare portfolio_trades.json o .env)
for f in "${MONITORED_FILES[@]}"; do
  if [ -e "$REPO_DIR/$f" ]; then
    git add "$REPO_DIR/$f" 2>/dev/null || true
  fi
done

# Verifica che non stiamo committando dati sensibili
if git diff --cached --name-only | grep -q "portfolio_trades.json\|real-trades.json\|\.env"; then
  echo "$LOG_TAG SICUREZZA: trovato file sensibile nello staging — rimozione..."
  git reset HEAD data/portfolio_trades.json 2>/dev/null || true
  git reset HEAD data/real-trades.json 2>/dev/null || true
  git reset HEAD .env 2>/dev/null || true
fi

# Controlla se c'è ancora qualcosa da committare
STAGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
if [ "$STAGED" -eq "0" ]; then
  echo "$LOG_TAG Nessun file staged dopo pulizia sicurezza — skip"
  exit 0
fi

# Commit
HOUR=$(date '+%H:%M')
DAY=$(date '+%A %d/%m/%Y')
git commit -m "auto: VPS update $DAY $HOUR

- market_data.json: prezzi live aggiornati
- insider_data.json: Form 4 e convergenza
- geopolitical_data.json: monitor geo/social
- portfolio_pnl.json: P&L snapshot
[skip ci]" --quiet

# Push
echo "$LOG_TAG Push su GitHub..."
GIT_SSH_COMMAND="ssh -i $HOME/.ssh/id_portfolio -o StrictHostKeyChecking=no" \
  git push origin HEAD:main --quiet

echo "$LOG_TAG ✅ Deploy completato — $TIMESTAMP"

# ── Notifica Telegram ──────────────────────────────────────────────────────
TELEGRAM_TOKEN=""
TELEGRAM_CHAT_ID="320293500"
if [ -f "$REPO_DIR/.env" ]; then
  TELEGRAM_TOKEN=$(grep '^TELEGRAM_TOKEN=' "$REPO_DIR/.env" | cut -d= -f2 | tr -d '"')
  CHAT_ID_ENV=$(grep '^TELEGRAM_CHAT_ID=' "$REPO_DIR/.env" | cut -d= -f2 | tr -d '"')
  [ -n "$CHAT_ID_ENV" ] && TELEGRAM_CHAT_ID="$CHAT_ID_ENV"
fi

if [ -n "$TELEGRAM_TOKEN" ]; then
  HOUR_NOW=$(date '+%H:%M')
  MSG="📡 <b>Portfolio aggiornato</b> — ${HOUR_NOW}
🔗 <a href=\"https://andytrust.github.io/Portfolio-Claude-Code/Protfolio.html\">Apri Dashboard</a>
📊 Files pushati: ${STAGED}
✅ GitHub Pages in aggiornamento (~2min)"
  curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{\"chat_id\":\"${TELEGRAM_CHAT_ID}\",\"text\":\"${MSG}\",\"parse_mode\":\"HTML\"}" \
    > /dev/null
  echo "$LOG_TAG Notifica Telegram inviata"
fi
