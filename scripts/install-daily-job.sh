#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# INSTALL DAILY JOB — macOS launchd
# Installa job giornaliero ore 07:00
# Uso: bash scripts/install-daily-job.sh
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

PROJECT_DIR="/Users/andrea140grammi/Desktop/Portfolio"
PLIST_LABEL="com.portfolio.daily-intelligence"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"

chmod +x "$PROJECT_DIR/scripts/run-daily.sh"

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
    <string>${PROJECT_DIR}/scripts/run-daily.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>7</integer>
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

# Carica il job
launchctl unload "$PLIST_PATH" 2>/dev/null || true
launchctl load "$PLIST_PATH"

echo "✅  Job giornaliero installato: $PLIST_LABEL"
echo "   → Esecuzione automatica ogni giorno alle 07:00"
echo "   → Log: $PROJECT_DIR/reports/holderflow_job.out.log"
echo ""
echo "   Per rimuovere: launchctl unload $PLIST_PATH && rm $PLIST_PATH"
