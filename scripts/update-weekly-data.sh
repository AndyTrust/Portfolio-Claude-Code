#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/Users/andrea140grammi/Desktop/Portfolio"
NODE_BIN="$(command -v node)"

# 1) Holder flow (SEC Form 4 + links istituzionali/politici)
"$NODE_BIN" "$PROJECT_DIR/scripts/update-holder-flow-sec.js" --tickers=TSLA,NVDA,ASML,LLY,NVO,XOM,AVGO,EQIX,BLK

# 2) Mappa settori online per ticker core (usata per auto-classificazione)
"$NODE_BIN" "$PROJECT_DIR/scripts/update-online-sector-map.js" --tickers=TSLA,NVDA,ASML,LLY,NVO,XOM,AVGO,EQIX,BLK,MU,INTC,AMGN,PFE,DLR,RIO,BHP,FCX

# 3) File master unico con catalogo completo + fonti
"$NODE_BIN" "$PROJECT_DIR/scripts/build-stock-master.js"
