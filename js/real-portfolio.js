/**
 * Real Portfolio Manager — Le Tue Transazioni Reali
 * Legge da data/real-trades.json e localStorage (per nuove aggiunte)
 * Aggiornato: 25/04/2026
 */

const REAL_PORTFOLIO_STORAGE_KEY = 'realPortfolio_trades_v1';
const REAL_PORTFOLIO_PRICES_KEY  = 'realPortfolio_prices_v1';

// ─── Sector map ───────────────────────────────────────────────────────────────
const REAL_SECTOR_MAP = {
  TSLA:  { sector: 'Automotive / AI', color: '#e11d48', perplexity: 'https://www.perplexity.ai/finance/TSLA', news: 'https://www.perplexity.ai/finance/TSLA/news' },
  BLK:   { sector: 'Asset Management', color: '#2563eb', perplexity: 'https://www.perplexity.ai/finance/BLK',  news: 'https://www.perplexity.ai/finance/BLK/news' },
  CRSP:  { sector: 'Biotech / Gene Editing', color: '#16a34a', perplexity: 'https://www.perplexity.ai/finance/CRSP', news: 'https://www.perplexity.ai/finance/CRSP/news' },
  ACHR:  { sector: 'eVTOL / Aviation', color: '#7c3aed', perplexity: 'https://www.perplexity.ai/finance/ACHR', news: 'https://www.perplexity.ai/finance/ACHR/news' },
  TEM:   { sector: 'AI Healthcare', color: '#0891b2', perplexity: 'https://www.perplexity.ai/finance/TEM',  news: 'https://www.perplexity.ai/finance/TEM/news' },
  CRWV:  { sector: 'AI Cloud Infra', color: '#9333ea', perplexity: 'https://www.perplexity.ai/finance/CRWV', news: 'https://www.perplexity.ai/finance/CRWV/news' },
  NVDA:  { sector: 'AI Hardware', color: '#76b900', perplexity: 'https://www.perplexity.ai/finance/NVDA', news: 'https://www.perplexity.ai/finance/NVDA/news' },
  AVGO:  { sector: 'AI Custom Silicon', color: '#cc0000', perplexity: 'https://www.perplexity.ai/finance/AVGO', news: 'https://www.perplexity.ai/finance/AVGO/news' },
  MU:    { sector: 'Memory / HBM AI', color: '#0052cc', perplexity: 'https://www.perplexity.ai/finance/MU',   news: 'https://www.perplexity.ai/finance/MU/news' },
  ASML:  { sector: 'Semiconduttori EUV', color: '#ff6600', perplexity: 'https://www.perplexity.ai/finance/ASML', news: 'https://www.perplexity.ai/finance/ASML/news' },
  LLY:   { sector: 'Pharma / GLP-1', color: '#be123c', perplexity: 'https://www.perplexity.ai/finance/LLY',  news: 'https://www.perplexity.ai/finance/LLY/news' },
  NVO:   { sector: 'Pharma / GLP-1', color: '#15803d', perplexity: 'https://www.perplexity.ai/finance/NVO',  news: 'https://www.perplexity.ai/finance/NVO/news' },
  XOM:   { sector: 'Energia / Oil', color: '#b45309', perplexity: 'https://www.perplexity.ai/finance/XOM',  news: 'https://www.perplexity.ai/finance/XOM/news' },
  NEE:   { sector: 'Utilities / Clean Energy', color: '#065f46', perplexity: 'https://www.perplexity.ai/finance/NEE',  news: 'https://www.perplexity.ai/finance/NEE/news' },
  DLR:   { sector: 'REIT / Data Center', color: '#1d4ed8', perplexity: 'https://www.perplexity.ai/finance/DLR',  news: 'https://www.perplexity.ai/finance/DLR/news' },
  EQIX:  { sector: 'REIT / Data Center', color: '#7e22ce', perplexity: 'https://www.perplexity.ai/finance/EQIX', news: 'https://www.perplexity.ai/finance/EQIX/news' },
};

// ─── Default prices (aggiornati 25/04/2026) ───────────────────────────────────
const DEFAULT_LIVE_PRICES = {
  TSLA: 376.30, BLK: 1054.05, CRSP: 55.18, ACHR: 5.68, TEM: 50.90, CRWV: 115.16,
  NVDA: 208.24, AVGO: 404.00, MU: 496.30, ASML: 1245.00, LLY: 883.89,
  NVO: 39.00, XOM: 150.00, NEE: 96.25, DLR: 201.27, EQIX: 1102.28
};

// ─── Load/save from localStorage ─────────────────────────────────────────────
function loadRealTrades() {
  try {
    const stored = localStorage.getItem(REAL_PORTFOLIO_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  // Default: le transazioni reali dalle screenshot
  return [
    { id:'T001', date:'2025-11-07', time:'15:30', type:'BUY', ticker:'TSLA', name:'Tesla Inc.', shares:1.01588208, pricePerShare:437.60, totalAmount:444.55, commission:0, notes:'Primo acquisto TSLA' },
    { id:'T002', date:'2026-01-22', time:'15:58', type:'BUY', ticker:'BLK',  name:'BlackRock Inc.', shares:0.219815, pricePerShare:1137.32, totalAmount:250.00, commission:0, notes:'Acquisto frazionario BLK' },
    { id:'T003', date:'2026-03-24', time:'13:41', type:'DIVIDEND', ticker:'BLK', name:'BlackRock Inc.', shares:0, pricePerShare:0, totalAmount:1.06, commission:0, notes:'Dividendo Q1 2026' },
    { id:'T004', date:'2026-03-30', time:'19:05', type:'BUY', ticker:'TEM',  name:'Tempus AI Inc.', shares:3.0217186, pricePerShare:42.36, totalAmount:128.00, commission:0, notes:'AI healthcare' },
    { id:'T005', date:'2026-04-09', time:'15:34', type:'BUY', ticker:'ACHR', name:'Archer Aviation Inc.', shares:28.28467153, pricePerShare:5.48, totalAmount:155.00, commission:0, notes:'eVTOL aviation' },
    { id:'T006', date:'2026-04-09', time:'15:35', type:'BUY', ticker:'CRSP', name:'CRISPR Therapeutics AG', shares:4.01794422, pricePerShare:51.27, totalAmount:206.00, commission:0, notes:'Gene editing biotech' },
    { id:'T007', date:'2026-04-15', time:'20:10', type:'BUY', ticker:'CRWV', name:'CoreWeave Inc.', shares:1.0001688, pricePerShare:118.48, totalAmount:118.50, commission:0, notes:'AI cloud infra (IPO)' },
    { id:'T008', date:'2026-04-23', time:'20:53', type:'BUY', ticker:'TSLA', name:'Tesla Inc.', shares:1.00203622, pricePerShare:373.24, totalAmount:374.00, commission:0, notes:'Secondo acquisto post Q1' },
  ];
}

function saveRealTrades(trades) {
  try { localStorage.setItem(REAL_PORTFOLIO_STORAGE_KEY, JSON.stringify(trades)); } catch(e) {}
  // Rebuild full CSV snapshot in localStorage on every save
  try { rebuildCSVSnapshot(trades); } catch(e) {}
}

// ─── CSV Snapshot (localStorage) ─────────────────────────────────────────────
const PORTFOLIO_CSV_KEY = 'portfolio_csv_v1';

function rebuildCSVSnapshot(trades) {
  const header = 'ID,Data,Ora,Tipo,Ticker,Nome,Settore,Valuta,Azioni,Prezzo_Az,Totale_Lordo,Commissione,Totale_Netto,Note';
  const rows = trades.map(t => {
    const sector = (REAL_SECTOR_MAP[t.ticker] || {}).sector || '';
    const fields = [
      t.id || '', t.date || '', t.time || '', t.type || '',
      t.ticker || '', (t.name || '').replace(/,/g, ' '), sector.replace(/,/g, ' '), 'USD',
      t.type === 'DIVIDEND' ? '' : (t.shares || ''),
      t.type === 'DIVIDEND' ? '' : (t.pricePerShare || ''),
      t.totalAmount || '', t.commission || 0, t.totalAmount || '',
      (t.notes || '').replace(/,/g, ' ')
    ];
    return fields.join(',');
  });
  localStorage.setItem(PORTFOLIO_CSV_KEY, header + '\n' + rows.join('\n'));
}

function exportPortfolioCSV() {
  const csv = localStorage.getItem(PORTFOLIO_CSV_KEY) || '';
  if (!csv) { alert('Nessun dato CSV salvato. Aggiungi prima delle transazioni.'); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = `portfolio_storico_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

function loadLivePrices() {
  try {
    const stored = localStorage.getItem(REAL_PORTFOLIO_PRICES_KEY);
    if (stored) return { ...DEFAULT_LIVE_PRICES, ...JSON.parse(stored) };
  } catch(e) {}
  return { ...DEFAULT_LIVE_PRICES };
}

function saveLivePrices(prices) {
  try { localStorage.setItem(REAL_PORTFOLIO_PRICES_KEY, JSON.stringify(prices)); } catch(e) {}
}

// ─── Portfolio calculation ─────────────────────────────────────────────────────
function calcRealPositions(trades, prices) {
  const positions = {};
  const dividends = [];

  trades.forEach(t => {
    if (t.type === 'DIVIDEND') {
      dividends.push(t);
      return;
    }
    if (!positions[t.ticker]) {
      positions[t.ticker] = { ticker: t.ticker, name: t.name, shares: 0, totalCost: 0, trades: [] };
    }
    if (t.type === 'BUY') {
      positions[t.ticker].shares += t.shares;
      positions[t.ticker].totalCost += t.totalAmount + (t.commission || 0);
    } else if (t.type === 'SELL') {
      positions[t.ticker].shares -= t.shares;
      // FIFO: riduce il costo proporzionalmente
      const pmc = positions[t.ticker].totalCost / (positions[t.ticker].shares + t.shares);
      positions[t.ticker].totalCost -= pmc * t.shares;
    }
    positions[t.ticker].trades.push(t);
  });

  // Calcola metriche per ogni posizione
  const result = [];
  Object.values(positions).forEach(pos => {
    if (pos.shares <= 0.0001) return; // posizione chiusa
    const pmc = pos.totalCost / pos.shares;
    const currentPrice = prices[pos.ticker] || pmc;
    const currentValue = pos.shares * currentPrice;
    const pnl = currentValue - pos.totalCost;
    const pnlPct = (pnl / pos.totalCost) * 100;
    const meta = REAL_SECTOR_MAP[pos.ticker] || { sector: 'Altro', color: '#888', perplexity: `https://www.perplexity.ai/finance/${pos.ticker}`, news: `https://www.perplexity.ai/finance/${pos.ticker}/news` };
    result.push({ ...pos, pmc, currentPrice, currentValue, pnl, pnlPct, ...meta });
  });

  return { positions: result.sort((a, b) => b.currentValue - a.currentValue), dividends };
}

function calcPortfolioTotals(positions, dividends) {
  const totalCost = positions.reduce((s, p) => s + p.totalCost, 0);
  const totalValue = positions.reduce((s, p) => s + p.currentValue, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const totalDividends = dividends.reduce((s, d) => s + d.totalAmount, 0);
  return { totalCost, totalValue, totalPnl, totalPnlPct, totalDividends };
}

// ─── SIM Positions Builder ────────────────────────────────────────────────────
function buildSimRows(prices, showEur, fmt) {
  if (typeof AI_POSITIONS === 'undefined' || !AI_POSITIONS.length) return { rows: '', totals: null };
  const sigColors = { ACCUMULO: '#4ade80', DISTRIBUZIONE: '#f87171', MISTO: '#f59e0b' };
  let totalInvested = 0, totalValue = 0;
  const rows = AI_POSITIONS.map(function(p) {
    const livePrice = prices[p.ticker] || p.currentPrice;
    const invested = p.shares * p.entryPrice;
    const currentValue = p.shares * livePrice;
    const pnl = currentValue - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    const meta = REAL_SECTOR_MAP[p.ticker] || {};
    const sigCol = sigColors[p.signal] || '#f59e0b';
    const fmtSh = p.shares < 1 ? p.shares.toFixed(4) : p.shares.toFixed(2);
    totalInvested += invested;
    totalValue += currentValue;
    return '<tr class="rp-row" style="background:rgba(200,145,36,.04);border-left:3px solid rgba(200,145,36,.5)">'
      + '<td><span style="background:#C89124;color:#1a0e00;font-size:9px;font-weight:900;padding:2px 5px;border-radius:3px;letter-spacing:.05em">SIM</span></td>'
      + '<td><div class="rp-ticker-cell"><div class="rp-ticker-dot" style="background:' + (meta.color || '#C89124') + '"></div><strong>' + p.ticker + '</strong></div></td>'
      + '<td class="rp-name">' + p.name + '</td>'
      + '<td><span class="rp-sector-tag">' + (meta.sector || p.sector) + '</span></td>'
      + '<td class="rp-mono">' + fmtSh + '</td>'
      + '<td class="rp-mono">' + fmt(p.entryPrice, showEur) + '</td>'
      + '<td class="rp-mono rp-live">' + fmt(livePrice, showEur) + '</td>'
      + '<td class="rp-mono">' + fmt(invested, showEur) + '</td>'
      + '<td class="rp-mono"><strong>' + fmt(currentValue, showEur) + '</strong></td>'
      + '<td class="rp-mono ' + (pnl >= 0 ? 'txt-pos' : 'txt-neg') + '">' + (pnl >= 0 ? '+' : '') + fmt(pnl, showEur) + '</td>'
      + '<td class="rp-mono ' + (pnl >= 0 ? 'txt-pos' : 'txt-neg') + '"><strong>' + (pnl >= 0 ? '+' : '') + pnlPct.toFixed(2) + '%</strong></td>'
      + '<td class="rp-links">'
        + '<a href="' + (meta.perplexity || 'https://www.perplexity.ai/finance/' + p.ticker) + '" target="_blank" class="rp-link-btn" title="Perplexity Finance">📊</a>'
        + '<a href="' + (meta.news || 'https://www.perplexity.ai/finance/' + p.ticker + '/news') + '" target="_blank" class="rp-link-btn" title="News">📰</a>'
        + '<a href="https://finance.yahoo.com/quote/' + p.ticker + '" target="_blank" class="rp-link-btn" title="Yahoo Finance">Y!</a>'
        + '<a href="https://openinsider.com/search?q=' + p.ticker + '" target="_blank" class="rp-link-btn" title="SEC Insider">SEC</a>'
      + '</td>'
      + '<td style="text-align:center;padding:4px 6px"><span style="color:' + sigCol + ';font-size:10px;font-weight:700;white-space:nowrap">' + p.signal + '</span></td>'
      + '</tr>';
  }).join('');
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  return { rows, totals: { invested: totalInvested, currentValue: totalValue, pnl: totalPnl, pnlPct: totalPnlPct } };
}

// ─── Render Real Portfolio ────────────────────────────────────────────────────
function renderRealPortfolio() {
  const root = document.getElementById('real-portfolio-root');
  if (!root) return;

  const trades  = loadRealTrades();
  const prices  = loadLivePrices();
  const { positions, dividends } = calcRealPositions(trades, prices);
  const totals  = calcPortfolioTotals(positions, dividends);
  const showEur = document.getElementById('real-currency-toggle')?.checked;
  const eurRate = 1.08;

  const fmt = (v, eur) => {
    if (eur) return '€' + (v / eurRate).toLocaleString('it-IT', {minimumFractionDigits:2,maximumFractionDigits:2});
    return '$' + v.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2});
  };
  const fmtShares = (n) => n.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:6});

  // SIM positions (from ai-portfolio.js, same price feed)
  const simData = buildSimRows(prices, showEur, fmt);
  const simSeparator = simData.rows
    ? '<tr><td colspan="13" style="padding:6px 10px;background:rgba(200,145,36,.1);color:#C89124;font-size:11px;font-weight:700;letter-spacing:.05em;border-top:2px solid rgba(200,145,36,.4);border-bottom:1px solid rgba(200,145,36,.25)">📊 POSIZIONI SIMULATE (SIM) — Budget virtuale · Stesso feed prezzi live</td></tr>' + simData.rows
    : '';
  const simTotalRow = simData.totals
    ? '<tr style="border-top:1px solid rgba(200,145,36,.4);background:rgba(200,145,36,.06)">'
      + '<td colspan="7" style="padding:6px 8px"><strong style="color:#C89124;font-size:12px">TOTALE SIM</strong></td>'
      + '<td class="rp-mono"><strong>' + fmt(simData.totals.invested, showEur) + '</strong></td>'
      + '<td class="rp-mono"><strong>' + fmt(simData.totals.currentValue, showEur) + '</strong></td>'
      + '<td class="rp-mono ' + (simData.totals.pnl >= 0 ? 'txt-pos' : 'txt-neg') + '"><strong>' + (simData.totals.pnl >= 0 ? '+' : '') + fmt(simData.totals.pnl, showEur) + '</strong></td>'
      + '<td class="rp-mono ' + (simData.totals.pnl >= 0 ? 'txt-pos' : 'txt-neg') + '"><strong>' + (simData.totals.pnl >= 0 ? '+' : '') + simData.totals.pnlPct.toFixed(2) + '%</strong></td>'
      + '<td colspan="2"></td>'
      + '</tr>'
    : '';

  root.innerHTML = `
    <!-- Header -->
    <div class="rp-header">
      <div class="rp-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        Le Tue Transazioni Reali
        <span class="rp-badge">LIVE</span>
      </div>
      <div class="rp-header-actions">
        <span class="rp-updated">Prezzi: ${(window._liveTs&&window._liveTs.pnl!=='—')?window._liveTs.pnl:((window._liveTs&&window._liveTs.market!=='—')?window._liveTs.market:'—')}</span>
        <label class="ai-currency-switch" style="margin:0">
          <input type="checkbox" id="real-currency-toggle" ${showEur?'checked':''} onchange="renderRealPortfolio()">
          <span class="ai-currency-label">USD</span>
          <span class="ai-currency-pill">EUR</span>
        </label>
        <button class="btn sm" onclick="openAddTradeModal()" style="background:var(--brand-ochre);color:var(--brand-brown);font-weight:800;border:none;padding:6px 14px;border-radius:8px;cursor:pointer">
          + Aggiungi
        </button>
        <button class="btn sm ghost" onclick="openUpdatePricesModal()" style="font-size:11px;padding:5px 10px;border:1px solid rgba(0,0,0,.15);border-radius:8px;cursor:pointer;background:transparent">
          🔄 Prezzi
        </button>
        <button class="btn sm ghost" onclick="exportTradesXLSX()" title="Esporta storico in Excel" style="font-size:11px;padding:5px 10px;border:1px solid rgba(0,0,0,.15);border-radius:8px;cursor:pointer;background:transparent">
          📊 Excel
        </button>
        <button class="btn sm ghost" onclick="exportPortfolioCSV()" title="Scarica CSV storico" style="font-size:11px;padding:5px 10px;border:1px solid rgba(0,0,0,.15);border-radius:8px;cursor:pointer;background:transparent">
          📄 CSV
        </button>
      </div>
    </div>

    <!-- KPI -->
    <div class="rp-kpi-row">
      <div class="rp-kpi">
        <div class="rp-kpi-label">Investito Totale</div>
        <div class="rp-kpi-val">${fmt(totals.totalCost, showEur)}</div>
      </div>
      <div class="rp-kpi">
        <div class="rp-kpi-label">Valore Attuale</div>
        <div class="rp-kpi-val">${fmt(totals.totalValue, showEur)}</div>
      </div>
      <div class="rp-kpi ${totals.totalPnl >= 0 ? 'kpi-pos' : 'kpi-neg'}">
        <div class="rp-kpi-label">P&L Totale</div>
        <div class="rp-kpi-val">${totals.totalPnl >= 0 ? '+' : ''}${fmt(totals.totalPnl, showEur)}</div>
        <div class="rp-kpi-sub">${totals.totalPnl >= 0 ? '+' : ''}${totals.totalPnlPct.toFixed(2)}%</div>
      </div>
      <div class="rp-kpi kpi-div">
        <div class="rp-kpi-label">Dividendi Ricevuti</div>
        <div class="rp-kpi-val">${fmt(totals.totalDividends, showEur)}</div>
        <div class="rp-kpi-sub">${dividends.length} pagamenti</div>
      </div>
    </div>

    <!-- Positions Table -->
    <div class="rp-table-wrap">
      <table class="rp-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Ticker</th>
            <th>Nome</th>
            <th>Settore</th>
            <th>Azioni</th>
            <th>PMC / Entry</th>
            <th>Prezzo Att.</th>
            <th>Investito</th>
            <th>Val. Attuale</th>
            <th>P&L $</th>
            <th>P&L %</th>
            <th>Fonti</th>
            <th>Segnale</th>
          </tr>
        </thead>
        <tbody>
          ${positions.map(p => `
            <tr class="rp-row ${p.pnl >= 0 ? 'row-pos' : 'row-neg'}">
              <td><span style="background:#16a34a;color:#fff;font-size:9px;font-weight:900;padding:2px 5px;border-radius:3px;letter-spacing:.05em">REALE</span></td>
              <td>
                <div class="rp-ticker-cell">
                  <div class="rp-ticker-dot" style="background:${p.color}"></div>
                  <strong>${p.ticker}</strong>
                </div>
              </td>
              <td class="rp-name">${p.name}</td>
              <td><span class="rp-sector-tag">${p.sector}</span></td>
              <td class="rp-mono">${fmtShares(p.shares)}</td>
              <td class="rp-mono">${fmt(p.pmc, showEur)}</td>
              <td class="rp-mono rp-live">${fmt(p.currentPrice, showEur)}</td>
              <td class="rp-mono">${fmt(p.totalCost, showEur)}</td>
              <td class="rp-mono"><strong>${fmt(p.currentValue, showEur)}</strong></td>
              <td class="rp-mono ${p.pnl >= 0 ? 'txt-pos' : 'txt-neg'}">${p.pnl >= 0 ? '+' : ''}${fmt(p.pnl, showEur)}</td>
              <td class="rp-mono ${p.pnl >= 0 ? 'txt-pos' : 'txt-neg'}"><strong>${p.pnl >= 0 ? '+' : ''}${p.pnlPct.toFixed(2)}%</strong></td>
              <td class="rp-links">
                <a href="${p.perplexity}" target="_blank" title="Perplexity Finance" class="rp-link-btn">📊</a>
                <a href="${p.news}" target="_blank" title="News" class="rp-link-btn">📰</a>
                <a href="https://finance.yahoo.com/quote/${p.ticker}" target="_blank" title="Yahoo Finance" class="rp-link-btn">Y!</a>
                <a href="https://openinsider.com/search?q=${p.ticker}" target="_blank" title="SEC Insider" class="rp-link-btn">SEC</a>
              </td>
              <td style="text-align:center;padding:4px 6px">
                <button
                  onclick="openQuickSellModal('${p.ticker}', '${p.name}', ${p.currentPrice.toFixed(2)}, ${p.shares.toFixed(6)}, ${p.pmc.toFixed(4)})"
                  style="background:#ef4444;color:#fff;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:10px;font-weight:800;letter-spacing:.02em;white-space:nowrap"
                  title="Registra una vendita di ${p.ticker}">
                  💰 VENDI
                </button>
              </td>
            </tr>
          `).join('')}
          ${simSeparator}
        </tbody>
        <tfoot>
          <tr class="rp-total-row">
            <td colspan="7"><strong>TOTALE REALE</strong></td>
            <td class="rp-mono"><strong>${fmt(totals.totalCost, showEur)}</strong></td>
            <td class="rp-mono"><strong>${fmt(totals.totalValue, showEur)}</strong></td>
            <td class="rp-mono ${totals.totalPnl >= 0 ? 'txt-pos' : 'txt-neg'}"><strong>${totals.totalPnl >= 0?'+':''}${fmt(totals.totalPnl, showEur)}</strong></td>
            <td class="rp-mono ${totals.totalPnl >= 0 ? 'txt-pos' : 'txt-neg'}"><strong>${totals.totalPnl >= 0?'+':''}${totals.totalPnlPct.toFixed(2)}%</strong></td>
            <td colspan="2"></td>
          </tr>
          ${simTotalRow}
        </tfoot>
      </table>
    </div>

    <!-- DCA Plan (from ai-portfolio.js) -->
    ${typeof renderDCAPlan === 'function' ? renderDCAPlan(prices, showEur, fmt) : ''}

    <!-- Dividends -->
    ${dividends.length > 0 ? `
    <div class="rp-dividends">
      <div class="rp-div-title">💰 Dividendi Ricevuti</div>
      ${dividends.map(d => `
        <div class="rp-div-row">
          <span class="rp-mono">${d.date}</span>
          <span><strong>${d.ticker}</strong> — ${d.name}</span>
          <span class="txt-pos rp-mono">+${fmt(d.totalAmount, showEur)}</span>
          <span class="rp-note">${d.notes || ''}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Trade History -->
    <div class="rp-history">
      <div class="rp-history-title" onclick="this.parentNode.querySelector('.rp-history-body').classList.toggle('open')">
        📋 Storico Operazioni <span class="rp-history-count">${trades.length}</span> <span class="rp-chevron">▼</span>
      </div>
      <div class="rp-history-body">
        <table class="rp-hist-table">
          <thead><tr><th>Data</th><th>Tipo</th><th>Ticker</th><th>Azioni</th><th>Prezzo</th><th>Totale</th><th>Note</th><th></th></tr></thead>
          <tbody>
            ${[...trades].reverse().map(t => `
              <tr>
                <td class="rp-mono">${t.date} ${t.time || ''}</td>
                <td><span class="rp-type-badge type-${t.type.toLowerCase()}">${t.type}</span></td>
                <td class="rp-mono"><strong>${t.ticker}</strong></td>
                <td class="rp-mono">${t.type === 'DIVIDEND' ? '—' : fmtShares(t.shares)}</td>
                <td class="rp-mono">${t.type === 'DIVIDEND' ? '—' : fmt(t.pricePerShare, showEur)}</td>
                <td class="rp-mono ${t.type === 'DIVIDEND' ? 'txt-pos' : ''}">${t.type === 'DIVIDEND' ? '+' : '-'}${fmt(t.totalAmount, showEur)}</td>
                <td class="rp-note">${t.notes || ''}</td>
                <td><button class="rp-del-btn" onclick="deleteRealTrade('${t.id}')" title="Elimina">✕</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="rp-footer">
      <span>📁 Dati salvati in localStorage + <code>data/real-trades.json</code></span>
      <span>🔗 Powered by Perplexity Finance · Yahoo Finance · SEC EDGAR</span>
    </div>
  `;
}

// ─── Stock Catalog for autocomplete ──────────────────────────────────────────
const KNOWN_STOCKS_CATALOG = [
  // Real portfolio positions
  { ticker:'TSLA',  name:'Tesla Inc.',              sector:'Automotive / AI',      price: 376.30 },
  { ticker:'BLK',   name:'BlackRock Inc.',           sector:'Finanza / Asset Mgmt', price:1054.05 },
  { ticker:'CRSP',  name:'CRISPR Therapeutics AG',   sector:'Biotech / Gene Editing',price: 55.18 },
  { ticker:'ACHR',  name:'Archer Aviation Inc.',     sector:'eVTOL / Aviazione',    price:   5.68 },
  { ticker:'TEM',   name:'Tempus AI Inc.',           sector:'AI Healthcare',        price:  56.78 },
  { ticker:'CRWV',  name:'CoreWeave Inc.',           sector:'AI Cloud Infra',       price: 115.16 },
  // Watchlist
  { ticker:'NVDA',  name:'Nvidia Corporation',       sector:'AI Hardware',          price: 208.24 },
  { ticker:'AVGO',  name:'Broadcom Inc.',            sector:'AI Custom Silicon',    price: 404.00 },
  { ticker:'MU',    name:'Micron Technology',        sector:'Memory / HBM AI',      price: 496.30 },
  { ticker:'ASML',  name:'ASML Holding NV',          sector:'Semiconduttori EUV',   price:1245.00 },
  { ticker:'LLY',   name:'Eli Lilly and Company',    sector:'Pharma / GLP-1',       price: 883.89 },
  { ticker:'NVO',   name:'Novo Nordisk A/S',         sector:'Pharma / GLP-1',       price:  39.00 },
  { ticker:'XOM',   name:'ExxonMobil Corporation',   sector:'Energia / Oil',        price: 150.00 },
  { ticker:'NEE',   name:'NextEra Energy Inc.',      sector:'Utilities / Clean Energy',price: 96.25 },
  { ticker:'DLR',   name:'Digital Realty Trust',     sector:'REIT / Data Center',   price: 201.27 },
  { ticker:'EQIX',  name:'Equinix Inc.',             sector:'REIT / Data Center',   price:1102.28 },
  // Common additional stocks
  { ticker:'AAPL',  name:'Apple Inc.',               sector:'Tech / Consumer',      price: 210.00 },
  { ticker:'MSFT',  name:'Microsoft Corporation',    sector:'Cloud / AI',           price: 420.00 },
  { ticker:'AMZN',  name:'Amazon.com Inc.',          sector:'Cloud / E-Commerce',   price: 215.00 },
  { ticker:'GOOGL', name:'Alphabet Inc.',            sector:'AI / Ads',             price: 175.00 },
  { ticker:'META',  name:'Meta Platforms Inc.',      sector:'Social / AI',          price: 550.00 },
  { ticker:'JPM',   name:'JPMorgan Chase & Co.',     sector:'Finanza / Banking',    price: 240.00 },
  { ticker:'V',     name:'Visa Inc.',                sector:'Fintech / Payments',   price: 350.00 },
];

// ─── Modal: Aggiungi Transazione ──────────────────────────────────────────────
function openAddTradeModal() {
  const modal = document.getElementById('add-trade-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('trade-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('trade-time').value = new Date().toTimeString().slice(0,5);
    // Clear fields
    ['trade-ticker','trade-name','trade-shares','trade-price','trade-amount','trade-commission','trade-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    // Set up autocomplete
    setupAddTradeAutocomplete();
  }
}

function setupAddTradeAutocomplete() {
  const input    = document.getElementById('trade-ticker');
  const dropdown = document.getElementById('trade-ticker-dropdown');
  const nameInput  = document.getElementById('trade-name');
  const priceInput = document.getElementById('trade-price');
  if (!input || !dropdown) return;

  // Remove old listeners by cloning
  const newInput = input.cloneNode(true);
  input.parentNode.replaceChild(newInput, input);
  const inp = document.getElementById('trade-ticker');

  function showDropdown(query) {
    const q = query.toUpperCase().trim();
    if (!q) { dropdown.style.display = 'none'; return; }
    const matches = KNOWN_STOCKS_CATALOG.filter(s =>
      s.ticker.startsWith(q) || s.name.toUpperCase().includes(q)
    ).slice(0, 10);
    if (!matches.length) { dropdown.style.display = 'none'; return; }

    dropdown.innerHTML = matches.map((s, i) => `
      <div class="trade-ac-item" data-idx="${i}"
        style="padding:9px 12px;cursor:pointer;border-bottom:1px solid rgba(200,145,36,.1);display:flex;justify-content:space-between;align-items:center;transition:background .15s"
        onmouseover="this.style.background='rgba(200,145,36,.15)'"
        onmouseout="this.style.background='transparent'"
        onmousedown="event.preventDefault();selectTradeStock(${i})">
        <div>
          <span style="font-weight:800;color:#C89124;font-size:13px">${s.ticker}</span>
          <span style="color:#d4c4a0;font-size:12px;margin-left:8px">${s.name}</span>
        </div>
        <div style="text-align:right">
          <span style="color:#4ade80;font-size:11px;font-weight:700">$${s.price}</span>
          <div style="color:#6b7280;font-size:9px">${s.sector}</div>
        </div>
      </div>`).join('');
    dropdown.style.display = 'block';
    dropdown._matches = matches;
  }

  window.selectTradeStock = function(idx) {
    const dropdown2 = document.getElementById('trade-ticker-dropdown');
    const matches = dropdown2._matches || [];
    const s = matches[idx];
    if (!s) return;
    const tickerEl = document.getElementById('trade-ticker');
    if (tickerEl) tickerEl.value = s.ticker;
    if (nameInput) nameInput.value = s.name;
    // Pre-fill price from live prices if available, then catalog
    const livePrices = (typeof loadLivePrices === 'function') ? loadLivePrices() : {};
    if (priceInput) priceInput.value = (livePrices[s.ticker] || s.price).toFixed(2);
    dropdown2.style.display = 'none';
  };

  inp.addEventListener('input', () => showDropdown(inp.value));
  inp.addEventListener('focus', () => { if (inp.value) showDropdown(inp.value); });
  inp.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));
  // Also update price on manual entry when matches known stock
  inp.addEventListener('change', () => {
    const ticker = inp.value.toUpperCase().trim();
    const match = KNOWN_STOCKS_CATALOG.find(s => s.ticker === ticker);
    if (match) {
      if (nameInput && !nameInput.value) nameInput.value = match.name;
      const livePrices = (typeof loadLivePrices === 'function') ? loadLivePrices() : {};
      if (priceInput && !priceInput.value) priceInput.value = (livePrices[ticker] || match.price).toFixed(2);
    }
  });
}

function closeAddTradeModal() {
  const modal = document.getElementById('add-trade-modal');
  if (modal) modal.style.display = 'none';
  const dd = document.getElementById('trade-ticker-dropdown');
  if (dd) dd.style.display = 'none';
}

function submitAddTrade() {
  const type    = document.getElementById('trade-type').value;
  const ticker  = document.getElementById('trade-ticker').value.toUpperCase().trim();
  const name    = document.getElementById('trade-name').value.trim() || ticker;
  const date    = document.getElementById('trade-date').value;
  const time    = document.getElementById('trade-time').value;
  const shares  = parseFloat(document.getElementById('trade-shares').value) || 0;
  const price   = parseFloat(document.getElementById('trade-price').value) || 0;
  const amount  = parseFloat(document.getElementById('trade-amount').value) || (shares * price);
  const comm    = parseFloat(document.getElementById('trade-commission').value) || 0;
  const notes   = document.getElementById('trade-notes').value.trim();

  if (!ticker || !date) { alert('Inserisci almeno Ticker e Data'); return; }
  if (!price && type !== 'DIVIDEND') { alert('Inserisci il prezzo per azione'); return; }

  // Auto-fill name from catalog if still empty
  if (!name || name === ticker) {
    const cat = KNOWN_STOCKS_CATALOG.find(s => s.ticker === ticker);
    if (cat) document.getElementById('trade-name').value = cat.name;
  }

  const trades = loadRealTrades();
  const newId = 'T' + Date.now();
  const finalAmount = amount || shares * price;
  trades.push({
    id: newId, date, time, type, ticker,
    name: document.getElementById('trade-name').value.trim() || ticker,
    shares, pricePerShare: price,
    totalAmount: finalAmount, commission: comm, notes
  });
  saveRealTrades(trades);
  closeAddTradeModal();
  renderRealPortfolio();
  if (typeof renderAIPortfolio === 'function') setTimeout(renderAIPortfolio, 150);
}

function deleteRealTrade(id) {
  if (!confirm('Eliminare questa operazione?')) return;
  const trades = loadRealTrades().filter(t => t.id !== id);
  saveRealTrades(trades);
  renderRealPortfolio();
}

// ─── Quick Sell Modal ─────────────────────────────────────────────────────────
function openQuickSellModal(ticker, name, currentPrice, availableShares, pmc) {
  const modal = document.getElementById('quick-sell-modal');
  if (!modal) {
    // Fallback: use the standard add-trade modal pre-filled as SELL
    const m = document.getElementById('add-trade-modal');
    if (m) {
      document.getElementById('trade-type').value = 'SELL';
      document.getElementById('trade-ticker').value = ticker;
      document.getElementById('trade-name').value = name || ticker;
      document.getElementById('trade-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('trade-time').value = new Date().toTimeString().slice(0,5);
      document.getElementById('trade-shares').value = '';
      document.getElementById('trade-price').value = currentPrice;
      document.getElementById('trade-amount').value = '';
      document.getElementById('trade-notes').value = '';
      m.style.display = 'flex';
    }
    return;
  }
  // Populate quick sell modal
  document.getElementById('qs-ticker').textContent   = ticker;
  document.getElementById('qs-name').textContent     = name || ticker;
  document.getElementById('qs-pmc').textContent      = '$' + parseFloat(pmc).toFixed(2);
  document.getElementById('qs-available').textContent = parseFloat(availableShares).toFixed(4) + ' az.';
  document.getElementById('qs-price').value          = currentPrice;
  document.getElementById('qs-qty').value            = '';
  document.getElementById('qs-total').value          = '';
  document.getElementById('qs-notes').value          = '';
  document.getElementById('qs-date').value           = new Date().toISOString().split('T')[0];
  document.getElementById('qs-time').value           = new Date().toTimeString().slice(0,5);
  // Store for submit
  modal.dataset.ticker          = ticker;
  modal.dataset.name            = name || ticker;
  modal.dataset.availableShares = availableShares;
  modal.dataset.pmc             = pmc;
  // Calc P&L preview on input
  const priceInput = document.getElementById('qs-price');
  const qtyInput   = document.getElementById('qs-qty');
  const totalInput = document.getElementById('qs-total');
  const pnlDiv     = document.getElementById('qs-pnl-preview');
  function updateQSSell() {
    const price = parseFloat(priceInput.value) || 0;
    const qty   = parseFloat(qtyInput.value)   || 0;
    const total = price * qty;
    if (qty > 0) totalInput.value = total.toFixed(2);
    if (qty > 0 && pmc > 0) {
      const pnl    = (price - parseFloat(pmc)) * qty;
      const pnlPct = ((price / parseFloat(pmc)) - 1) * 100;
      pnlDiv.innerHTML = `P&L stimato: <strong style="color:${pnl >= 0 ? '#16a34a' : '#ef4444'}">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%)</strong>`;
    } else {
      pnlDiv.innerHTML = '';
    }
  }
  priceInput.oninput = updateQSSell;
  qtyInput.oninput   = updateQSSell;
  modal.style.display = 'flex';
}

function closeQuickSellModal() {
  const modal = document.getElementById('quick-sell-modal');
  if (modal) modal.style.display = 'none';
}

function submitQuickSell() {
  const modal  = document.getElementById('quick-sell-modal');
  if (!modal) return;
  const ticker = modal.dataset.ticker;
  const name   = modal.dataset.name;
  const maxQty = parseFloat(modal.dataset.availableShares) || 0;
  const date   = document.getElementById('qs-date').value;
  const time   = document.getElementById('qs-time').value;
  const price  = parseFloat(document.getElementById('qs-price').value) || 0;
  const qty    = parseFloat(document.getElementById('qs-qty').value) || 0;
  const notes  = document.getElementById('qs-notes').value.trim();

  if (!date || !price || qty <= 0) { alert('Inserisci data, prezzo e quantità'); return; }
  if (qty > maxQty + 0.000001) {
    alert(`Quantità inserita (${qty}) supera le azioni disponibili (${maxQty.toFixed(4)})`);
    return;
  }

  const trades = loadRealTrades();
  const newId  = 'SELL' + Date.now();
  trades.push({
    id: newId, date, time, type: 'SELL',
    ticker, name, shares: qty,
    pricePerShare: price, totalAmount: price * qty,
    commission: 0,
    notes: notes || `Vendita ${ticker} a $${price}`
  });
  saveRealTrades(trades);
  closeQuickSellModal();
  renderRealPortfolio();
  if (typeof renderAIPortfolio === 'function') setTimeout(renderAIPortfolio, 100);
  // Show confirmation
  const pmc  = parseFloat(modal.dataset.pmc) || 0;
  const pnl  = pmc > 0 ? (price - pmc) * qty : 0;
  const sign = pnl >= 0 ? '+' : '';
  alert(`✅ Vendita registrata!\n${qty} az. ${ticker} a $${price}\nP&L: ${sign}$${pnl.toFixed(2)}\n\n📄 CSV aggiornato in localStorage → clicca "CSV" per scaricare`);
}

// ─── Export to Excel (XLSX) ───────────────────────────────────────────────────
function exportTradesXLSX() {
  if (typeof XLSX === 'undefined') { alert('Libreria XLSX non disponibile'); return; }

  const trades  = loadRealTrades();
  const prices  = loadLivePrices();
  const { positions, dividends } = calcRealPositions(trades, prices);
  const totals  = calcPortfolioTotals(positions, dividends);
  const now     = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0,5).replace(':','h');

  // ── Sheet 1: Storico Operazioni ──
  const tradeHeaders = ['ID','Data','Ora','Tipo','Ticker','Nome','Azioni','Prezzo/az ($)','Totale ($)','Commissione ($)','Note'];
  const tradeRows = trades.map(t => [
    t.id, t.date, t.time||'', t.type, t.ticker, t.name,
    t.type === 'DIVIDEND' ? '' : t.shares,
    t.type === 'DIVIDEND' ? '' : t.pricePerShare,
    t.totalAmount, t.commission || 0, t.notes||''
  ]);

  // ── Sheet 2: Posizioni Aperte ──
  const posHeaders = ['Ticker','Nome','Settore','Azioni','PMC ($)','Prezzo Att. ($)','Investito ($)','Valore Att. ($)','P&L ($)','P&L %','Link Perplexity'];
  const posRows = positions.map(p => [
    p.ticker, p.name, p.sector,
    parseFloat(p.shares.toFixed(6)),
    parseFloat(p.pmc.toFixed(4)),
    parseFloat(p.currentPrice.toFixed(2)),
    parseFloat(p.totalCost.toFixed(2)),
    parseFloat(p.currentValue.toFixed(2)),
    parseFloat(p.pnl.toFixed(2)),
    parseFloat(p.pnlPct.toFixed(2)),
    `https://www.perplexity.ai/finance/${p.ticker}`
  ]);
  posRows.push(['','','','','','','TOTALE',
    parseFloat(totals.totalCost.toFixed(2)),
    parseFloat(totals.totalValue.toFixed(2)),
    parseFloat(totals.totalPnl.toFixed(2)),
    parseFloat(totals.totalPnlPct.toFixed(2)),
    ''
  ]);

  // ── Sheet 3: Dividendi ──
  const divHeaders = ['ID','Data','Ticker','Nome','Importo ($)','Note'];
  const divRows = dividends.map(d => [d.id, d.date, d.ticker, d.name, d.totalAmount, d.notes||'']);
  const totalDiv = dividends.reduce((s,d) => s + d.totalAmount, 0);
  divRows.push(['','TOTALE DIVIDENDI','','','',parseFloat(totalDiv.toFixed(2)),'']);

  // Build workbook
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet([tradeHeaders, ...tradeRows]);
  const ws2 = XLSX.utils.aoa_to_sheet([posHeaders, ...posRows]);
  const ws3 = XLSX.utils.aoa_to_sheet([divHeaders, ...divRows]);

  // Column widths
  ws1['!cols'] = [8,12,6,10,8,24,10,12,12,12,30].map(w => ({wch:w}));
  ws2['!cols'] = [8,24,20,10,12,12,12,12,12,10,40].map(w => ({wch:w}));
  ws3['!cols'] = [8,12,8,24,12,30].map(w => ({wch:w}));

  XLSX.utils.book_append_sheet(wb, ws1, 'Storico Operazioni');
  XLSX.utils.book_append_sheet(wb, ws2, 'Posizioni Aperte');
  XLSX.utils.book_append_sheet(wb, ws3, 'Dividendi');

  const filename = `portfolio_storico_${dateStr}_${timeStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ─── Modal: Aggiorna Prezzi ───────────────────────────────────────────────────
function openUpdatePricesModal() {
  const trades = loadRealTrades();
  const prices = loadLivePrices();
  const tickers = [...new Set(trades.filter(t => t.type !== 'DIVIDEND').map(t => t.ticker))];

  const modal = document.getElementById('update-prices-modal');
  if (!modal) return;
  const body = document.getElementById('update-prices-body');
  body.innerHTML = tickers.map(tk => `
    <div class="up-row">
      <label class="up-label">
        <strong>${tk}</strong>
        <a href="https://www.perplexity.ai/finance/${tk}" target="_blank" class="up-pf-link">Perplexity ↗</a>
        <a href="https://finance.yahoo.com/quote/${tk}" target="_blank" class="up-pf-link">Yahoo ↗</a>
      </label>
      <input type="number" step="0.01" class="up-input" id="price-input-${tk}" value="${prices[tk] || ''}" placeholder="Prezzo attuale USD"/>
    </div>
  `).join('');
  modal.style.display = 'flex';
}

function submitUpdatePrices() {
  const trades = loadRealTrades();
  const tickers = [...new Set(trades.filter(t => t.type !== 'DIVIDEND').map(t => t.ticker))];
  const prices = loadLivePrices();
  tickers.forEach(tk => {
    const input = document.getElementById('price-input-' + tk);
    if (input && input.value) prices[tk] = parseFloat(input.value);
  });
  saveLivePrices(prices);
  document.getElementById('update-prices-modal').style.display = 'none';
  renderRealPortfolio();
}

function closeUpdatePricesModal() {
  document.getElementById('update-prices-modal').style.display = 'none';
}

// ─── Global ESC key handler for real-portfolio modals ─────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  const addModal = document.getElementById('add-trade-modal');
  if (addModal && addModal.style.display === 'flex') { closeAddTradeModal(); return; }
  const sellModal = document.getElementById('quick-sell-modal');
  if (sellModal && sellModal.style.display === 'flex') { closeQuickSellModal(); return; }
  const priceModal = document.getElementById('update-prices-modal');
  if (priceModal && priceModal.style.display === 'flex') { closeUpdatePricesModal(); return; }
});

// Click-outside-to-close for all real-portfolio modals
['add-trade-modal','quick-sell-modal','update-prices-modal'].forEach(id => {
  document.addEventListener('click', function(e) {
    const modal = document.getElementById(id);
    if (modal && e.target === modal) {
      modal.style.display = 'none';
      if (id === 'add-trade-modal') {
        const dd = document.getElementById('trade-ticker-dropdown');
        if (dd) dd.style.display = 'none';
      }
    }
  });
});

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const obs = new MutationObserver(() => {
    const root = document.getElementById('real-portfolio-root');
    if (root && root.offsetParent !== null && !root.dataset.rendered) {
      root.dataset.rendered = '1';
      renderRealPortfolio();
    }
  });
  obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  document.querySelectorAll('.tab[data-tab="portfolio"]').forEach(el => {
    el.addEventListener('click', () => setTimeout(renderRealPortfolio, 150));
  });
  setTimeout(renderRealPortfolio, 400);
});

window.REAL_PORTFOLIO = { render: renderRealPortfolio, loadTrades: loadRealTrades, saveTrades: saveRealTrades };
