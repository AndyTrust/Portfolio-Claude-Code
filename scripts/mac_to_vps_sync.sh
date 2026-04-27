#!/bin/bash
# mac_to_vps_sync.sh — Sync Mac → VPS
# Eseguire DAL MAC: bash ~/Desktop/Portfolio/scripts/mac_to_vps_sync.sh

VPS_USER="root"
VPS_HOST="82.29.179.90"
VPS_PATH="~/Portfolio-Claude-Code/"
MAC_PATH="$HOME/Desktop/Portfolio/"

echo "=== Sync Mac → VPS ==="
echo "Sorgente: $MAC_PATH"
echo "Destinazione: $VPS_USER@$VPS_HOST:$VPS_PATH"
echo ""

rsync -avz --progress \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.DS_Store' \
  --exclude='*.pyc' \
  --exclude='__pycache__/' \
  "$MAC_PATH" \
  "$VPS_USER@$VPS_HOST:$VPS_PATH"

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ Sync completato!"
  echo ""
  echo "Per attivare venv e fare un test sulla VPS:"
  echo "  ssh root@82.29.179.90 'cd ~/Portfolio-Claude-Code && source ~/portfolio_venv/bin/activate && python scripts/vps_hourly_monitor.py'"
else
  echo ""
  echo "✗ Errore durante il sync. Controlla la connessione SSH."
fi
