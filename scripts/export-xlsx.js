#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// EXPORT XLSX — Storico Movimenti Excel
// Genera reports/storico_movimenti.xlsx con:
//   · Sheet "Tutti i Movimenti"  (master completo)
//   · Sheet per ogni ticker      (storia completa di ogni titolo)
//   · Sheet "Portfolio Aperto"   (posizioni attive + P&L latente)
//   · Sheet "Statistiche"        (riepilogo per settore + mensile)
// Uso: node scripts/export-xlsx.js [--help]
// ═══════════════════════════════════════════════════════════════

'use strict';

let XLSX;
try {
  XLSX = require('xlsx');
} catch(e) {
  console.error('❌  Libreria xlsx non trovata. Installa con:\n   npm install xlsx\n');
  process.exit(1);
}

const path = require('path');
const fs = require('fs');

const bridge = require('./state-bridge.js');

// ── Carica stato ─────────────────────────────────────────────────
const state = bridge.loadState();
const operazioni = bridge.getOperazioni(state);
const fundData = bridge.getFundData(state);
const sectors = bridge.getSectors(state);
const { positions, realizzato } = bridge.computePnL(operazioni);

bridge.ensureReportsDir();

const OUT_FILE = path.join(bridge.REPORTS_DIR, 'storico_movimenti.xlsx');

// ── Stile header ─────────────────────────────────────────────────
function styleHeader(ws, headers, rowIdx = 1) {
  headers.forEach((h, i) => {
    const cell = ws[XLSX.utils.encode_cell({ c: i, r: rowIdx - 1 })];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1a2433' } },
        alignment: { horizontal: 'center' }
      };
    }
  });
}

// ── Formatta numero ──────────────────────────────────────────────
function fNum(v, dec = 2) {
  if (v == null || isNaN(v)) return '';
  return parseFloat(v).toFixed(dec);
}

function fDate(d) {
  if (!d) return '';
  return String(d).split('T')[0];
}

// ── Determina settore del ticker ─────────────────────────────────
function getSectorForTicker(ticker) {
  const tk = String(ticker || '').toUpperCase();
  for (const s of sectors) {
    const instr = s.instruments || [];
    if (instr.some(i => String(i.ticker || i || '').toUpperCase() === tk)) {
      return s.name.split('/')[0].trim();
    }
  }
  return fundData[tk]?.sector || 'N/D';
}

// ════════════════════════════════════════════════════════════════
// SHEET 1: Tutti i Movimenti
// ════════════════════════════════════════════════════════════════
function buildSheetMaster() {
  const headers = [
    'ID', 'Data', 'Ticker', 'Nome', 'Tipo', 'Settore',
    'Quantità', 'Prezzo', 'Totale Lordo', 'Commissione', 'Totale Netto',
    'Note'
  ];

  const rows = operazioni
    .slice()
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .map((op, idx) => {
      const tk = String(op.ticker || '').toUpperCase();
      const qty = parseFloat(op.quantita || op.qty || 0);
      const price = parseFloat(op.prezzo || 0);
      const comm = parseFloat(op.commissione || op.comm || 0);
      const gross = qty * price;
      const net = op.tipo?.toLowerCase().includes('sell') || op.tipo?.toLowerCase().includes('vend')
        ? gross - comm
        : gross + comm;

      return [
        op.id || idx + 1,
        fDate(op.data),
        tk,
        op.nome || fundData[tk]?.name || tk,
        op.tipo || '',
        getSectorForTicker(tk),
        fNum(qty, 4),
        fNum(price),
        fNum(gross),
        fNum(comm),
        fNum(net),
        op.note || op.notes || ''
      ];
    });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 6 }, { wch: 12 }, { wch: 8 }, { wch: 24 }, { wch: 10 }, { wch: 20 },
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 }
  ];
  styleHeader(ws, headers);
  return ws;
}

// ════════════════════════════════════════════════════════════════
// SHEET 2: Portfolio Aperto (posizioni attive)
// ════════════════════════════════════════════════════════════════
function buildSheetPortfolio() {
  const headers = [
    'Ticker', 'Nome', 'Settore', 'Quantità', 'PMC',
    'Investito', 'Prezzo Attuale*', 'Valore Attuale*',
    'P&L Latente*', 'Rendimento %*', '1° Acquisto'
  ];

  const rows = [];
  for (const [ticker, pos] of Object.entries(positions)) {
    if (pos.totalQty <= 0) continue;
    const pmc = pos.totalQty > 0 ? pos.totalInvested / pos.totalQty : 0;
    // Trova data primo acquisto
    const firstBuy = operazioni
      .filter(op => String(op.ticker||'').toUpperCase() === ticker && (op.tipo?.toLowerCase().includes('buy')||op.tipo?.toLowerCase().includes('acq')))
      .sort((a,b) => new Date(a.data)-new Date(b.data))[0];

    rows.push([
      ticker,
      fundData[ticker]?.name || ticker,
      getSectorForTicker(ticker),
      fNum(pos.totalQty, 4),
      fNum(pmc),
      fNum(pos.totalInvested),
      '(aggiorna in dashboard)',
      '(aggiorna in dashboard)',
      '(aggiorna in dashboard)',
      '(aggiorna in dashboard)',
      fDate(firstBuy?.data || '')
    ]);
  }

  rows.sort((a, b) => a[0].localeCompare(b[0]));

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 8 }, { wch: 24 }, { wch: 20 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }
  ];
  styleHeader(ws, headers);

  // Nota a piè pagina
  const lastRow = rows.length + 2;
  ws[XLSX.utils.encode_cell({ c: 0, r: lastRow })] = {
    v: '* Aggiorna prezzi attuali nella dashboard per P&L in tempo reale.',
    t: 's'
  };

  return ws;
}

// ════════════════════════════════════════════════════════════════
// SHEET 3: Statistiche (riepilogo per settore + mensile)
// ════════════════════════════════════════════════════════════════
function buildSheetStatistiche() {
  const data = [];

  // --- Riepilogo per settore ---
  data.push(['RIEPILOGO PER SETTORE', '', '', '', '', '']);
  data.push(['Settore', 'N° Operazioni', 'Totale Investito', 'Totale Venduto', 'P&L Realizzato', 'Ticker']);

  const bySector = {};
  operazioni.forEach(op => {
    const tk = String(op.ticker||'').toUpperCase();
    const sector = getSectorForTicker(tk);
    if (!bySector[sector]) bySector[sector] = { ops: 0, invested: 0, sold: 0, tickers: new Set() };
    bySector[sector].ops++;
    bySector[sector].tickers.add(tk);
    const qty = parseFloat(op.quantita||op.qty||0);
    const price = parseFloat(op.prezzo||0);
    const comm = parseFloat(op.commissione||op.comm||0);
    const type = String(op.tipo||'').toLowerCase();
    if (type.includes('buy') || type.includes('acq')) {
      bySector[sector].invested += qty*price + comm;
    } else if (type.includes('sell') || type.includes('vend')) {
      bySector[sector].sold += qty*price - comm;
    }
  });

  const pnlBySector = {};
  realizzato.forEach(r => {
    const sector = getSectorForTicker(r.ticker);
    if (!pnlBySector[sector]) pnlBySector[sector] = 0;
    pnlBySector[sector] += r.pnl;
  });

  Object.entries(bySector)
    .sort((a,b) => b[1].invested - a[1].invested)
    .forEach(([sector, d]) => {
      data.push([
        sector,
        d.ops,
        fNum(d.invested),
        fNum(d.sold),
        fNum(pnlBySector[sector] || 0),
        [...d.tickers].join(', ')
      ]);
    });

  data.push(['', '', '', '', '', '']);

  // --- Riepilogo mensile ---
  data.push(['RIEPILOGO MENSILE', '', '', '', '', '']);
  data.push(['Mese', 'N° Acquisti', 'N° Vendite', 'Investito', 'Incassato', 'P&L Mese']);

  const byMonth = {};
  operazioni.forEach(op => {
    const m = fDate(op.data).substring(0, 7); // YYYY-MM
    if (!m) return;
    if (!byMonth[m]) byMonth[m] = { buys: 0, sells: 0, invested: 0, sold: 0 };
    const qty = parseFloat(op.quantita||op.qty||0);
    const price = parseFloat(op.prezzo||0);
    const comm = parseFloat(op.commissione||op.comm||0);
    const type = String(op.tipo||'').toLowerCase();
    if (type.includes('buy') || type.includes('acq')) {
      byMonth[m].buys++;
      byMonth[m].invested += qty*price + comm;
    } else if (type.includes('sell') || type.includes('vend')) {
      byMonth[m].sells++;
      byMonth[m].sold += qty*price - comm;
    }
  });

  const pnlByMonth = {};
  realizzato.forEach(r => {
    const m = fDate(r.dataVendita).substring(0, 7);
    if (!m) return;
    if (!pnlByMonth[m]) pnlByMonth[m] = 0;
    pnlByMonth[m] += r.pnl;
  });

  Object.keys(byMonth)
    .sort()
    .forEach(m => {
      const d = byMonth[m];
      data.push([
        m,
        d.buys,
        d.sells,
        fNum(d.invested),
        fNum(d.sold),
        fNum(pnlByMonth[m] || 0)
      ]);
    });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 32 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 40 }
  ];
  return ws;
}

// ════════════════════════════════════════════════════════════════
// SHEET PER TICKER: storia completa
// ════════════════════════════════════════════════════════════════
function buildSheetTicker(ticker) {
  const tk = String(ticker).toUpperCase();
  const ops = operazioni
    .filter(op => String(op.ticker||'').toUpperCase() === tk)
    .sort((a,b) => new Date(a.data)-new Date(b.data));

  const headers = [
    'Data', 'Tipo', 'Quantità', 'Prezzo', 'Totale Lordo', 'Commissione', 'Totale Netto', 'Note'
  ];

  const rows = ops.map(op => {
    const qty = parseFloat(op.quantita||op.qty||0);
    const price = parseFloat(op.prezzo||0);
    const comm = parseFloat(op.commissione||op.comm||0);
    const gross = qty * price;
    const type = String(op.tipo||'').toLowerCase();
    const net = (type.includes('sell')||type.includes('vend')) ? gross - comm : gross + comm;
    return [fDate(op.data), op.tipo||'', fNum(qty,4), fNum(price), fNum(gross), fNum(comm), fNum(net), op.note||''];
  });

  // Aggiungi riepilogo in fondo
  const pos = positions[tk];
  rows.push(['', '', '', '', '', '', '', '']);
  rows.push(['RIEPILOGO', '', '', '', '', '', '', '']);

  if (pos && pos.totalQty > 0) {
    const pmc = pos.totalInvested / pos.totalQty;
    rows.push(['Posizione aperta', 'QTY:', fNum(pos.totalQty,4), 'PMC:', fNum(pmc), 'Investito:', fNum(pos.totalInvested), '']);
  } else {
    rows.push(['Posizione chiusa', '', '', '', '', '', '', '']);
  }

  const pnlRealizzatoTicker = realizzato.filter(r => r.ticker === tk);
  if (pnlRealizzatoTicker.length > 0) {
    const totalPnl = pnlRealizzatoTicker.reduce((acc, r) => acc + r.pnl, 0);
    rows.push(['P&L Realizzato', '', '', '', fNum(totalPnl), '', '', '']);
  }

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 }
  ];
  styleHeader(ws, headers);
  return ws;
}

// ════════════════════════════════════════════════════════════════
// ASSEMBLA WORKBOOK
// ════════════════════════════════════════════════════════════════
function buildWorkbook() {
  const wb = XLSX.utils.book_new();

  // Sheet master
  XLSX.utils.book_append_sheet(wb, buildSheetMaster(), 'Tutti i Movimenti');
  console.log('  ✅  Sheet "Tutti i Movimenti"');

  // Sheet portfolio aperto
  XLSX.utils.book_append_sheet(wb, buildSheetPortfolio(), 'Portfolio Aperto');
  console.log('  ✅  Sheet "Portfolio Aperto"');

  // Sheet statistiche
  XLSX.utils.book_append_sheet(wb, buildSheetStatistiche(), 'Statistiche');
  console.log('  ✅  Sheet "Statistiche"');

  // Un sheet per ticker (max 30 per evitare file enormi)
  const tickers = [...new Set(operazioni.map(op => String(op.ticker||'').toUpperCase()).filter(Boolean))].sort();
  let count = 0;
  for (const tk of tickers) {
    if (count >= 30) { console.log(`  ⚠️  Max 30 sheet per ticker raggiunti (${tickers.length} totali). Usa filtro.`); break; }
    XLSX.utils.book_append_sheet(wb, buildSheetTicker(tk), tk.substring(0, 31));
    count++;
  }
  console.log(`  ✅  Sheet per ${count} ticker`);

  return wb;
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
console.log('\n📊  EXPORT XLSX — Storico Movimenti');
console.log('─'.repeat(50));
console.log(`  Operazioni trovate: ${operazioni.length}`);
console.log(`  Posizioni aperte: ${Object.values(positions).filter(p=>p.totalQty>0).length}`);
console.log(`  Operazioni chiuse P&L: ${realizzato.length}`);
console.log('');
console.log('  Generazione sheet...');

const wb = buildWorkbook();

XLSX.writeFile(wb, OUT_FILE, { bookType: 'xlsx', type: 'buffer' });

console.log('');
console.log(`  ✅  File salvato: ${OUT_FILE}`);
console.log(`  📁  Apri con: open "${OUT_FILE}"\n`);
