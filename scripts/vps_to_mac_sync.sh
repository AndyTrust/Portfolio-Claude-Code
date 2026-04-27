#!/bin/bash
# vps_to_mac_sync.sh — Sync VPS → Mac (scarica da VPS)
# Eseguire DAL MAC: bash ~/Desktop/Portfolio/scripts/vps_to_mac_sync.sh

VPS_USER="root"
VPS_HOST="82.29.179.90"
VPS_PATH="~/Portfolio-Claude-Code/"
MAC_PATH="$HOME/Desktop/Portfolio/"

echo "=== Sync VPS → Mac ==="
echo "Sorgente: $VPS_USER@$VPS_HOST:$VPS_PATH"
echo "Destinazione: $MAC_PATH"
echo ""

rsync -avz --progress \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='*.pyc' \
  --exclude='__pycache__/' \
  "$VPS_USER@$VPS_HOST:$VPS_PATH" \
  "$MAC_PATH"

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ Sync VPS→Mac completato!"
else
  echo ""
  echo "✗ Errore. Controlla la connessione SSH."
fi
