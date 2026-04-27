#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# RUN DAILY — Job giornaliero (ore 07:00)
# Esegue: daily-intelligence.js → sync-back.js
# Log: reports/holderflow_job.out.log / .err.log
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

PROJECT_DIR="/Users/andrea140grammi/Desktop/Portfolio"
NODE_BIN="$(command -v node 2>/dev/null || echo '/usr/local/bin/node')"
LOG_OUT="$PROJECT_DIR/reports/holderflow_job.out.log"
LOG_ERR="$PROJECT_DIR/reports/holderflow_job.err.log"
TODAY=$(date '+%Y-%m-%d %H:%M:%S')

log() { echo "[$TODAY] $*" | tee -a "$LOG_OUT"; }
logerr() { echo "[$TODAY] ERROR: $*" | tee -a "$LOG_ERR"; }

log "=== RUN DAILY START ==="

# 1. Analisi giornaliera intelligence
log "→ daily-intelligence.js"
if "$NODE_BIN" "$PROJECT_DIR/scripts/daily-intelligence.js" 2>>"$LOG_ERR"; then
  log "✅ daily-intelligence.js completato"
else
  logerr "daily-intelligence.js fallito (exit $?)"
fi

# 2. Sync back verso la dashboard
log "→ sync-back.js"
if "$NODE_BIN" "$PROJECT_DIR/scripts/sync-back.js" 2>>"$LOG_ERR"; then
  log "✅ sync-back.js completato"
else
  logerr "sync-back.js fallito (exit $?)"
fi

log "=== RUN DAILY END ==="
