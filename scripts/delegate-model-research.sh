#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/Users/andrea140grammi/Desktop/Portfolio"
REPORT_DIR="$PROJECT_DIR/reports"
DATE_TAG="$(date +%Y%m%d)"
TICKER="${1:-TSLA}"

mkdir -p "$REPORT_DIR"

PROMPT="Analizza ${TICKER}. Produci JSON con: thesis, catalyst_30_90d, risks, sector, key_sources(url array), action(add|monitor|remove). Usa fonti finanziarie verificabili."

run_claude() {
  if command -v claude >/dev/null 2>&1; then
    claude -p "$PROMPT" > "$REPORT_DIR/${TICKER}_claude_${DATE_TAG}.md" 2>/dev/null || true
  fi
}

run_gemini() {
  if command -v gemini >/dev/null 2>&1; then
    gemini -p "$PROMPT" > "$REPORT_DIR/${TICKER}_gemini_${DATE_TAG}.md" 2>/dev/null || true
  fi
}

run_codex() {
  if command -v codex >/dev/null 2>&1; then
    codex exec "$PROMPT" > "$REPORT_DIR/${TICKER}_codex_${DATE_TAG}.md" 2>/dev/null || true
  fi
}

run_claude &
run_gemini &
run_codex &
wait

echo "Report multi-modello completati per ${TICKER} in $REPORT_DIR"
