#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// STATE BRIDGE — Bridge localStorage → File JSON
// Legge reports/state_export_latest.json (esportato dal browser)
// Espone helper functions usate da tutti gli altri script
// ═══════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const STATE_FILE = path.join(PROJECT_DIR, 'reports', 'state_export_latest.json');
const REPORTS_DIR = path.join(PROJECT_DIR, 'reports');
const JS_DIR = path.join(PROJECT_DIR, 'js');

// ── Carica stato dal file esportato ─────────────────────────────
function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    console.error(`\n❌  File stato non trovato: ${STATE_FILE}`);
    console.error('ℹ️   Esporta prima lo stato dalla dashboard:');
    console.error('     Dashboard → pulsante "📤 Esporta Stato" → salva come reports/state_export_latest.json\n');
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`❌  Errore parsing state_export_latest.json: ${e.message}`);
    process.exit(1);
  }
}

// ── Getter helper ────────────────────────────────────────────────
function getOperazioni(state) {
  try { return JSON.parse(state['dashboard_operazioni'] || '[]') || []; }
  catch(e) { return []; }
}

function getSectors(state) {
  try { return JSON.parse(state['dashboard_sectors_v3'] || '[]') || []; }
  catch(e) { return []; }
}

function getFundData(state) {
  try { return JSON.parse(state['dashboard_fund_data_v3'] || '{}') || {}; }
  catch(e) { return {}; }
}

function getSourceUrls(state) {
  try { return JSON.parse(state['dashboard_source_urls_v3'] || '{}') || {}; }
  catch(e) { return {}; }
}

function getStockNotes(state) {
  try { return JSON.parse(state['dashboard_stock_notes_v3'] || '{}') || {}; }
  catch(e) { return {}; }
}

function getStockStatus(state) {
  try { return JSON.parse(state['dashboard_stock_status_v3'] || '{}') || {}; }
  catch(e) { return {}; }
}

// ── Estrai tutti i ticker attivi dalla watchlist ─────────────────
function getActiveTickers(state) {
  const sectors = getSectors(state);
  const status = getStockStatus(state);
  const tickers = new Set();
  sectors.forEach(s => {
    (s.instruments || []).forEach(inst => {
      const ticker = String(inst.ticker || inst || '').toUpperCase();
      if (ticker && status[ticker] !== false) tickers.add(ticker);
    });
  });
  return [...tickers];
}

// ── Date helper ──────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().split('T')[0].replace(/-/g, '');
}

function todayFull() {
  return new Date().toISOString().split('T')[0];
}

// ── Backup file ──────────────────────────────────────────────────
function backupFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const bak = filePath + '.bak.' + todayISO();
  fs.copyFileSync(filePath, bak);
  console.log(`💾  Backup: ${path.basename(bak)}`);
}

// ── Assicura che la cartella reports esista ──────────────────────
function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// ── Calcola P&L per operazioni chiuse ───────────────────────────
function computePnL(operazioni) {
  const positions = {};

  // Prima passa: acquisti
  operazioni
    .filter(op => op.tipo === 'BUY' || op.tipo === 'buy' || op.tipo === 'Acquisto')
    .sort((a,b) => new Date(a.data) - new Date(b.data))
    .forEach(op => {
      const tk = String(op.ticker || '').toUpperCase();
      if (!tk) return;
      if (!positions[tk]) positions[tk] = { lots: [], totalInvested: 0, totalQty: 0 };
      const qty = parseFloat(op.quantita || op.qty || 0);
      const price = parseFloat(op.prezzo || op.prezzoAcquisto || 0);
      const commission = parseFloat(op.commissione || op.comm || 0);
      if (qty > 0 && price > 0) {
        positions[tk].lots.push({ qty, price, commission, data: op.data, id: op.id });
        positions[tk].totalQty += qty;
        positions[tk].totalInvested += (qty * price) + commission;
      }
    });

  // Seconda passa: vendite → calcola P&L realizzato
  const realizzato = [];
  operazioni
    .filter(op => op.tipo === 'SELL' || op.tipo === 'sell' || op.tipo === 'Vendita')
    .sort((a,b) => new Date(a.data) - new Date(b.data))
    .forEach(op => {
      const tk = String(op.ticker || '').toUpperCase();
      if (!tk || !positions[tk]) return;
      const qtyVenduta = parseFloat(op.quantita || op.qty || 0);
      const prezzoVendita = parseFloat(op.prezzo || op.prezzoVendita || 0);
      const commVendita = parseFloat(op.commissione || op.comm || 0);
      if (qtyVenduta <= 0 || prezzoVendita <= 0) return;

      const pos = positions[tk];
      // FIFO cost basis
      let qtyLeft = qtyVenduta;
      let costBasis = 0;
      for (const lot of pos.lots) {
        if (qtyLeft <= 0) break;
        const used = Math.min(lot.qty, qtyLeft);
        costBasis += used * lot.price + (lot.commission * (used / lot.qty));
        lot.qty -= used;
        qtyLeft -= used;
      }
      pos.lots = pos.lots.filter(l => l.qty > 0);
      pos.totalQty = Math.max(0, pos.totalQty - qtyVenduta);
      pos.totalInvested = Math.max(0, pos.totalInvested - costBasis);

      const ricavo = qtyVenduta * prezzoVendita - commVendita;
      const pnl = ricavo - costBasis;
      const rendimento = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      realizzato.push({
        ticker: tk,
        dataVendita: op.data,
        qtyVenduta,
        prezzoVendita,
        costBasis: Math.round(costBasis * 100) / 100,
        ricavo: Math.round(ricavo * 100) / 100,
        pnl: Math.round(pnl * 100) / 100,
        rendimento: Math.round(rendimento * 100) / 100
      });
    });

  return { positions, realizzato };
}

module.exports = {
  loadState,
  getOperazioni,
  getSectors,
  getFundData,
  getSourceUrls,
  getStockNotes,
  getStockStatus,
  getActiveTickers,
  computePnL,
  backupFile,
  ensureReportsDir,
  todayISO,
  todayFull,
  PROJECT_DIR,
  REPORTS_DIR,
  JS_DIR,
  STATE_FILE
};

// ── Se eseguito direttamente: mostra info stato ──────────────────
if (require.main === module) {
  const state = loadState();
  const operazioni = getOperazioni(state);
  const tickers = getActiveTickers(state);
  const urls = getSourceUrls(state);
  console.log('\n📊  STATE BRIDGE — Info stato corrente');
  console.log(`   Operazioni: ${operazioni.length}`);
  console.log(`   Ticker attivi: ${tickers.length} → ${tickers.slice(0,10).join(', ')}${tickers.length > 10 ? '...' : ''}`);
  console.log(`   Source URLs configurati: ${Object.keys(urls).length}`);
  console.log(`   Stato aggiornato: ${fs.statSync(STATE_FILE).mtime.toLocaleString()}\n`);
}
