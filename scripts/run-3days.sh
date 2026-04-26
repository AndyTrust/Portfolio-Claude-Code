#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# RUN 3 DAYS — Job ogni 3 giorni (ore 06:00)
# Esegue:
#   1. update-holder-flow-sec.js  (esistente — SEC Form 4)
#   2. fund-insider-scan.js       (nuovo — 13F + Yahoo holders)
#   3. update-online-sector-map.js (esistente — settori)
#   4. build-stock-master.js       (esistente — catalogo)
#   5. sync-back.js                (nuovo — sync dashboard)
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

PROJECT_DIR="/Users/andrea140grammi/Desktop/Portfolio"
NODE_BIN="$(command -v node 2>/dev/null || echo '/usr/local/bin/node')"
LOG_OUT="$PROJECT_DIR/reports/holderflow_job.out.log"
LOG_ERR="$PROJECT_DIR/reports/holderflow_job.err.log"
TODAY=$(date '+%Y-%m-%d %H:%M:%S')

# Tickers da monitorare (puoi estendere questa lista)
TICKERS="TSLA,NVDA,ASML,LLY,NVO,XOM,AVGO,EQIX,BLK,AAPL,MSFT,AMZN,GOOGL,META"

log() { echo "[$TODAY] $*" | tee -a "$LOG_OUT"; }
logerr() { echo "[$TODAY] ERROR: $*" | tee -a "$LOG_ERR"; }

log "=== RUN 3 DAYS START ==="

# 1. Holder flow esistente (SEC Form 4)
log "→ update-holder-flow-sec.js"
if "$NODE_BIN" "$PROJECT_DIR/scripts/update-holder-flow-sec.js" --tickers="$TICKERS" 2>>"$LOG_ERR"; then
  log "✅ update-holder-flow-sec.js completato"
else
  logerr "update-holder-flow-sec.js fallito (exit $?)"
fi

# 2. Fund + Insider scan avanzato (13F + Yahoo)
log "→ fund-insider-scan.js"
if "$NODE_BIN" "$PROJECT_DIR/scripts/fund-insider-scan.js" --tickers="$TICKERS" 2>>"$LOG_ERR"; then
  log "✅ fund-insider-scan.js completato"
else
  logerr "fund-insider-scan.js fallito (exit $?)"
fi

# 3. Mappa settori online
log "→ update-online-sector-map.js"
if "$NODE_BIN" "$PROJECT_DIR/scripts/update-online-sector-map.js" --tickers="$TICKERS" 2>>"$LOG_ERR"; then
  log "✅ update-online-sector-map.js completato"
else
  logerr "update-online-sector-map.js fallito (exit $?)"
fi

# 4. Build catalogo master
log "→ build-stock-master.js"
if "$NODE_BIN" "$PROJECT_DIR/scripts/build-stock-master.js" 2>>"$LOG_ERR"; then
  log "✅ build-stock-master.js completato"
else
  logerr "build-stock-master.js fallito (exit $?)"
fi

# 5. Sync back → dashboard
log "→ sync-back.js"
if "$NODE_BIN" "$PROJECT_DIR/scripts/sync-back.js" 2>>"$LOG_ERR"; then
  log "✅ sync-back.js completato"
else
  logerr "sync-back.js fallito (exit $?)"
fi

log "=== RUN 3 DAYS END ==="
