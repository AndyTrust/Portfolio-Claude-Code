// ═══════════════════════════════════════════════════
// MODAL & UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════
function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

function renderUpdateSourcesModal() {
  const body = document.getElementById('modal-sources-body');
  let html = `<div class="disclaimer">Apri le fonti per ogni titolo in nuove tab per aggiornare manualmente i dati. Le fonti principali sono SEC EDGAR (13F, Form 4), Finviz, WhaleWisdom e Perplexity Finance.</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center;">
    <strong style="font-size:11px;color:var(--muted);">🗂️ Sync file locali (reports/):</strong>
    <button class="btn xs ghost" onclick="trySyncStockMasterJSON();this.textContent='⏳ Sync...';setTimeout(()=>this.textContent='✅ Stock Master',1500);">📦 Stock Master JSON</button>
    <button class="btn xs ghost" onclick="trySyncOnlineSectorMapJSON();this.textContent='⏳ Sync...';setTimeout(()=>this.textContent='✅ Sector Map',1500);">🗺️ Sector Map JSON</button>
    <button class="btn xs ghost" onclick="tryLoadHolderMonitorJSON();this.textContent='⏳ Sync...';setTimeout(()=>this.textContent='✅ Holder Monitor',1500);">📊 Holder Monitor JSON</button>
    <span style="font-size:10px;color:var(--dim);">(Disponibili solo su server HTTP, non su file://)</span>
  </div>`;
  const tickers = [...new Set([
    ...Object.keys(fundData || {}),
    ...getAllInstruments().map(item => item.ticker),
    ...Object.keys(stockRegistry || {})
  ])].sort();
  tickers.forEach(ticker => {
    const fd = fundData[ticker] || {};
    const registry = getStockRegistryEntry(ticker);
    const sources = fd.sources || registry?.sources || buildDefaultSources(ticker);
    const lastUp = lastUpdates[ticker] ? new Date(lastUpdates[ticker]).toLocaleString('it-IT') : 'Mai aggiornato';
    html += `<div class="card" style="margin-bottom:10px;"><h3><span class="ticker-link" onclick="openStockModal('${ticker}')">${ticker}</span> · <span style="font-size:10px;color:var(--dim);">Ultimo aggiornamento: ${lastUp}</span></h3>
    <div style="display:flex;gap:4px;flex-wrap:wrap;">
      ${sources.map(url => `<a href="${url}" target="_blank" class="btn xs ghost" style="text-decoration:none;">${new URL(url).hostname.replace('www.','').split('.')[0]} ↗</a>`).join('')}
      <button class="btn xs success" onclick="markUpdated('${ticker}')">✅ Segna aggiornato</button>
    </div></div>`;
  });
  body.innerHTML = html;
  openModal('modal-sources');
}

function markUpdated(ticker) {
  lastUpdates[ticker] = new Date().toISOString();
  save('dashboard_last_updates_v3', lastUpdates);
  renderUpdateSourcesModal();
}

// EXPORT
function exportCSV() {
  if (!operazioni.length) { alert('Nessuna operazione'); return; }
  const csv = [['Data', 'Ticker', 'Nome', 'Settore', 'Tipo', 'Prezzo', 'Qty', 'Totale', 'Comm', 'Note'], ...operazioni.map(o => [o.data, o.ticker, o.nome, o.settore, o.tipo, o.prezzo, o.qty, o.totale.toFixed(2), o.comm, o.note])].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })); a.download = `movimenti_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
}
function exportXLSX() {
  if (typeof XLSX === 'undefined' || !operazioni.length) { alert('Libreria non disponibile o nessuna operazione'); return; }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([['STORICO OPERAZIONI'], ['Generato: ' + new Date().toLocaleString('it-IT')], [], ['Data', 'Ticker', 'Nome', 'Settore', 'Tipo', 'Prezzo', 'Qty', 'Totale', 'Comm', 'Note'], ...operazioni.map(o => [o.data, o.ticker, o.nome, o.settore, o.tipo, o.prezzo, o.qty, +o.totale.toFixed(2), o.comm, o.note])]);
  ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 6 }, { wch: 12 }, { wch: 8 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Operazioni');
  XLSX.writeFile(wb, `portafoglio_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
function exportFullReport() {
  if (typeof XLSX === 'undefined') { alert('XLSX non disponibile'); return; }
  const wb = XLSX.utils.book_new();
  // Sheet 1: Fund Overview
  const fundRows = [['REPORT FONDI & INSIDER'], ['Generato: ' + new Date().toLocaleString('it-IT')], [], ['Ticker', 'Prezzo', 'P/E', 'Segnale', 'Compratori', 'Venditori', 'Consensus', 'Target Medio', 'RSI']];
  Object.entries(fundData).forEach(([t, fd]) => fundRows.push([t, fd.price, fd.pe, fd.signal, (fd.buyers || []).length, (fd.sellers || []).length, fd.targets?.consensus, fd.targets?.avg, fd.technicals?.rsi]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(fundRows), 'Fondi Overview');
  // Sheet 2: Operations
  if (operazioni.length) {
    const opRows = [['Data', 'Ticker', 'Tipo', 'Prezzo', 'Qty', 'Totale', 'Comm'], ...operazioni.map(o => [o.data, o.ticker, o.tipo, o.prezzo, o.qty, +o.totale.toFixed(2), o.comm])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(opRows), 'Operazioni');
  }
  XLSX.writeFile(wb, `report_completo_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
