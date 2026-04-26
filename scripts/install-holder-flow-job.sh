#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/Users/andrea140grammi/Desktop/Portfolio"
SCRIPT_PATH="$PROJECT_DIR/scripts/update-weekly-data.sh"
NODE_PATH_BIN="$(command -v node)"
PLIST_ID="com.portfolio.holderflow.weekly"
PLIST_FILE="$HOME/Library/LaunchAgents/$PLIST_ID.plist"
LOG_OUT="$PROJECT_DIR/reports/holderflow_job.out.log"
LOG_ERR="$PROJECT_DIR/reports/holderflow_job.err.log"

if [[ ! -x "$NODE_PATH_BIN" ]]; then
  echo "node non trovato"
  exit 1
fi

cat > "$PLIST_FILE" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$PLIST_ID</string>
  <key>ProgramArguments</key>
  <array>
    <string>$SCRIPT_PATH</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$PROJECT_DIR</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key>
    <integer>1</integer>
    <key>Hour</key>
    <integer>6</integer>
    <key>Minute</key>
    <integer>30</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>$LOG_OUT</string>
  <key>StandardErrorPath</key>
  <string>$LOG_ERR</string>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
PLIST

launchctl unload "$PLIST_FILE" >/dev/null 2>&1 || true
launchctl load "$PLIST_FILE"
echo "Job installato: $PLIST_ID"
echo "Plist: $PLIST_FILE"
echo "Log out: $LOG_OUT"
echo "Log err: $LOG_ERR"
