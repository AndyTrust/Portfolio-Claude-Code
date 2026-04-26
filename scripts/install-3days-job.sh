#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# INSTALL 3 DAYS JOB — macOS launchd
# Installa job ogni 3 giorni ore 06:00
# (Lunedì, Giovedì, Domenica)
# Uso: bash scripts/install-3days-job.sh
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

PROJECT_DIR="/Users/andrea140grammi/Desktop/Portfolio"
PLIST_LABEL="com.portfolio.fund-insider-scan"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"

chmod +x "$PROJECT_DIR/scripts/run-3days.sh"

# launchd non supporta nativamente "ogni 3 giorni"
# Soluzione: esegui ogni giorno alle 06:00 e controlla dentro lo script
# se sono passati >= 3 giorni dall'ultima esecuzione.
# Per semplicità qui usiamo Lunedì (1), Giovedì (4), Domenica (0).
cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${PLIST_LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-c</string>
    <string>
      DAY=$(date +%u);
      if [ "$DAY" = "1" ] || [ "$DAY" = "4" ] || [ "$DAY" = "7" ]; then
        bash ${PROJECT_DIR}/scripts/run-3days.sh;
      fi
    </string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>6</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>WorkingDirectory</key>
  <string>${PROJECT_DIR}</string>
  <key>StandardOutPath</key>
  <string>${PROJECT_DIR}/reports/holderflow_job.out.log</string>
  <key>StandardErrorPath</key>
  <string>${PROJECT_DIR}/reports/holderflow_job.err.log</string>
  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>
EOF

launchctl unload "$PLIST_PATH" 2>/dev/null || true
launchctl load "$PLIST_PATH"

echo "✅  Job ogni 3 giorni installato: $PLIST_LABEL"
echo "   → Esecuzione automatica Lunedì/Giovedì/Domenica alle 06:00"
echo "   → Log: $PROJECT_DIR/reports/holderflow_job.out.log"
echo ""
echo "   Per eseguire manualmente ora: bash $PROJECT_DIR/scripts/run-3days.sh"
echo "   Per rimuovere: launchctl unload $PLIST_PATH && rm $PLIST_PATH"
