function renderMarketBar() {
  const bar = document.getElementById('market-bar');
  const items = MARKET_DATA.indices.slice(0, 6);
  bar.innerHTML = items.map(m =>
    `<div class="mkt-item" onclick="showMarketDetail('${m.name}')">
      <span class="mkt-label">${m.name}</span>
      <span class="mkt-val ${m.direction}">${m.value} ${m.direction === 'up' ? '▲' : m.direction === 'down' ? '▼' : '⚠'} ${m.change}</span>
    </div>`
  ).join('') + `<div class="mkt-item"><span class="mkt-label">Sentiment</span><span class="mkt-val down">${MARKET_DATA.sentiment}</span></div>
    <div class="mkt-item"><span class="mkt-label">Aggiornato</span><span class="mkt-val" style="color:var(--dim);font-size:12px;" id="last-update">—</span></div>`;
}

function showMarketDetail(name) {
  const m = MARKET_DATA.indices.find(x => x.name === name);
  if (m) alert(`${m.name}\nValore: ${m.value}\nVariazione: ${m.change}`);
}

function renderSectorFilters() {
  const c = document.getElementById('sector-filters');
  c.innerHTML = `<button class="filter-btn ${currentSectorFilter === 'all' ? 'active' : ''}" data-sector="all">Tutti</button>` +
    SECTORS.map((s, i) => `<button class="filter-btn ${currentSectorFilter === String(i) ? 'active' : ''}" data-sector="${i}">${s.icon} ${s.name.split('/')[0].split('&')[0].trim()}</button>`).join('');
  c.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      c.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSectorFilter = btn.dataset.sector;
      renderScreener();
    });
  });
}

function resetToDefaultSectors() {
  if (!confirm('Ripristinare i settori predefiniti? Sovrascriverà i settori attuali.')) return;
  SECTORS.length = 0;
  JSON.parse(JSON.stringify(DEFAULT_SECTORS)).forEach(s => SECTORS.push(s));
  sectorWeights.length = 0;
  SECTORS.forEach(() => sectorWeights.push(+(100/SECTORS.length).toFixed(2)));
  instrumentWeights.length = 0;
  SECTORS.forEach(s => instrumentWeights.push(new Array(s.instruments.length).fill(0)));
  saveSectors(); saveWeights();
  renderAll();
}

function renderScreener() {
  const body = document.getElementById('screener-body'); body.innerHTML = '';

  // Fallback se SECTORS è vuoto
  if (!SECTORS || SECTORS.length === 0) {
    body.innerHTML = `<div style="text-align:center;padding:40px;background:var(--surface2);border-radius:10px;border:1px dashed var(--border2);">
      <div style="font-size:34px;margin-bottom:12px;">📭</div>
      <div style="font-size:16px;font-weight:600;margin-bottom:8px;">Nessun settore configurato</div>
      <div style="font-size:14px;color:var(--muted);margin-bottom:16px;">Il watchlist è vuoto. Ripristina i settori predefiniti oppure aggiungi manualmente settori e strumenti.</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
        <button class="btn" onclick="resetToDefaultSectors()">🔄 Ripristina Settori Predefiniti</button>
        <button class="btn secondary" onclick="document.getElementById('btn-add-sector').click()">➕ Aggiungi Settore</button>
      </div>
    </div>`;
    return;
  }

  // Count active/inactive for summary
  const allInstr = getAllInstruments();
  const activeCount = allInstr.filter(i => isStockActive(i.ticker)).length;
  const inactiveCount = allInstr.length - activeCount;

  // ── INSIDER ALERT BANNER (da MONEY_FOLLOW_DATA se disponibile) ──
  if (typeof MONEY_FOLLOW_DATA !== 'undefined' && MONEY_FOLLOW_DATA.insiderActivity) {
    const recentAlerts = MONEY_FOLLOW_DATA.insiderActivity
      .filter(a => {
        // Show last 90 days
        const d = new Date(a.date); const now = new Date();
        return (now - d) < 90 * 24 * 60 * 60 * 1000;
      })
      .filter(a => Math.abs(parseFloat((a.value || '0').replace(/[^0-9.\-]/g,'').replace(/,/g,'.'))) > 100000 || a.action === 'BUY');
    if (recentAlerts.length > 0) {
      const alertBanner = document.createElement('div');
      alertBanner.style.cssText = 'margin-bottom:16px;background:rgba(20,18,14,.6);border:1px solid rgba(200,145,36,.3);border-radius:10px;padding:12px 14px;';
      alertBanner.innerHTML = '<div style="font-size:13px;font-weight:700;color:#C89124;margin-bottom:8px;letter-spacing:.5px;">⚡ INSIDER FEED — Form 4 SEC (ultimi 90gg) <a href="http://openinsider.com/screener?s=&o=&pl=&ph=&ll=&lh=&fd=730&fdr=&td=0&tdr=&fdlyl=&fdlyh=&daysago=&xp=1&xs=1&xf=1&xm=1&xx=1&vl=&vh=&ocl=&och=&sic1=-1&sicl=100&sich=9999&grp=0&nfl=&nfh=&nil=&nih=&nol=&noh=&v2l=&v2h=&oc2l=&oc2h=&sortcol=0&cnt=100&page=1" target="_blank" style="font-size:12px;color:#818cf8;text-decoration:none;margin-left:8px;">Screener completo →</a></div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:6px;">'
        + recentAlerts.map(a => {
            const isBuy = a.action === 'BUY';
            const color = isBuy ? '#4ade80' : '#f87171';
            const bg    = isBuy ? 'rgba(74,222,128,.1)' : 'rgba(239,68,68,.1)';
            const border= isBuy ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)';
            const secLink = a.secUrl ? ` <a href="${a.secUrl}" target="_blank" style="color:#818cf8;font-size:11px;text-decoration:none;" title="SEC Form 4 XML originale">SEC↗</a>` : '';
            return `<div style="background:${bg};border:1px solid ${border};border-radius:6px;padding:4px 8px;font-size:12px;">
              <span style="color:${color};font-weight:700;">${a.action === 'BUY' ? '↑' : '↓'} ${a.ticker}</span>
              <span style="color:var(--muted);margin-left:4px;">${a.date}</span>
              <span style="color:var(--text);margin-left:4px;">${a.insider}</span>
              <span style="color:${color};font-weight:600;margin-left:4px;">${a.value}</span>
              <a href="http://openinsider.com/search?q=${a.ticker}" target="_blank" style="color:#818cf8;font-size:11px;margin-left:4px;text-decoration:none;">OI↗</a>${secLink}
            </div>`;
          }).join('')
        + '</div>';
      body.appendChild(alertBanner);
    }
  }

  SECTORS.forEach((sector, si) => {
    const filtered = sector.instruments.filter(inst =>
      (currentSectorFilter === 'all' || currentSectorFilter === String(si)) &&
      (currentTypeFilter === 'all' || inst.type === currentTypeFilter) &&
      (currentStatusFilter === 'all' || (currentStatusFilter === 'active' && isStockActive(inst.ticker)) || (currentStatusFilter === 'inactive' && !isStockActive(inst.ticker))) &&
      (!searchQuery || normalizeSearchText(inst.name).includes(searchQuery) || normalizeSearchText(inst.ticker).includes(searchQuery))
    );
    if (!filtered.length) return;
    const activeSector = filtered.filter(i => isStockActive(i.ticker)).length;
    const block = document.createElement('div'); block.className = 'sector-block';
    block.innerHTML = `<div class="sector-header" style="background:${sector.color}15;border-left:3px solid ${sector.color};">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:10px;height:10px;border-radius:50%;background:${sector.color}"></div>
        ${sector.icon} ${sector.name}<span style="font-size:12px;color:var(--dim);margin-left:8px;">${filtered.length} strumenti · <span style="color:var(--green)">${activeSector} attivi</span></span>
      </div>
      <div style="display:flex;gap:4px;">
        <button class="btn xs ghost" onclick="addInstrumentPrompt(${si})">➕ Strumento</button>
        <button class="btn xs danger" onclick="removeSector(${si})">🗑️</button>
      </div>
    </div>
    <table><thead><tr><th>Stato</th><th>Nome</th><th>Ticker</th><th>Tipo</th><th>Link Analisi <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Link Analisi</span>Apri il titolo sulle principali piattaforme finanziarie per dati real-time, fondamentali e notizie.</span></span></span></th><th>Insider / SEC <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Insider Form 4</span>OpenInsider = Form 4 filtrati per ticker. SEC EDGAR = documento originale XML. Aggiornati in tempo reale entro 2 giorni dalla transazione.</span></span></th><th>Note</th><th></th></tr></thead>
    <tbody>${filtered.map(inst => {
      const fd = fundData[inst.ticker];
      const signal = fd ? `<span class="badge badge-${fd.signalColor === 'green' ? 'accum' : fd.signalColor === 'red' ? 'distrib' : 'neutro'}" style="font-size:11px;margin-left:4px;">${fd.signal}</span>` : '';
      const active = isStockActive(inst.ticker);
      const rowOpacity = active ? '1' : '0.4';
      // Get insider signal from MONEY_FOLLOW_DATA if available
      const insiderData = typeof MONEY_FOLLOW_DATA !== 'undefined'
        ? (MONEY_FOLLOW_DATA.insiderActivity || []).filter(i => i.ticker === inst.ticker)
        : [];
      const recentBuys  = insiderData.filter(i => i.action === 'BUY').length;
      const recentSells = insiderData.filter(i => i.action === 'SELL').length;
      const insiderBadge = recentBuys > 0
        ? `<span style="font-size:11px;padding:1px 5px;border-radius:3px;background:rgba(74,222,128,.2);color:#4ade80;font-weight:700;">↑${recentBuys}B</span>`
        : recentSells > 0
        ? `<span style="font-size:11px;padding:1px 5px;border-radius:3px;background:rgba(239,68,68,.15);color:#f87171;font-weight:700;">↓${recentSells}S</span>`
        : '';
      return `<tr style="opacity:${rowOpacity};">
        <td><button class="status-toggle ${active ? 'active' : 'inactive'}" onclick="toggleStockAndRender('${inst.ticker}')" title="${active ? 'Attivo — clicca per disattivare' : 'Disattivato — clicca per attivare'}">${active ? '🟢' : '🔴'}</button></td>
        <td style="font-weight:500;font-size:14px;"><span class="ticker-link" onclick="openStockModal('${inst.ticker}')">${inst.name}</span>${signal}</td>
        <td><span class="ticker-link" onclick="openStockModal('${inst.ticker}')" style="color:${sector.color}">${inst.ticker}</span></td>
        <td><span class="badge badge-${inst.type === 'ETF' ? 'etf' : 'stock'}">${inst.type}</span></td>
        <td style="white-space:nowrap;">
          <a class="link-btn" href="https://finance.yahoo.com/quote/${inst.yahoo}" target="_blank">Yahoo</a>
          <a class="link-btn" href="https://www.perplexity.ai/finance/${inst.ticker}" target="_blank">Perplexity</a>
          <a class="link-btn" href="https://finviz.com/quote.ashx?t=${inst.ticker}" target="_blank">Finviz</a>
          <a class="link-btn" href="https://www.google.com/finance/quote/${inst.ticker}:${inst.type === 'ETF' ? 'LON' : 'NASDAQ'}" target="_blank">Google</a>
        </td>
        <td style="white-space:nowrap;">
          <a class="link-btn" href="http://openinsider.com/search?q=${inst.ticker}" target="_blank" style="background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.4);color:#4ade80;">📋 Insider</a>
          <a class="link-btn" href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${inst.ticker}&type=4&dateb=&owner=include&count=10" target="_blank" style="background:rgba(99,102,241,.12);border-color:rgba(99,102,241,.4);color:#818cf8;">🏛️ SEC</a>
          ${insiderBadge}
        </td>
        <td><input class="note-input" placeholder="Nota..." value="${inst.notes || ''}" onchange="updateInstrNote(${si},'${inst.ticker}',this.value)"/></td>
        <td><span class="delete-row" onclick="removeInstrument(${si},'${inst.ticker}')">🗑️</span></td>
      </tr>`;
    }).join('')}</tbody></table>`;
    body.appendChild(block);
  });

  renderCatalogMatches(body);
}

function renderCatalogMatches(body) {
  if (!searchQuery) return;
  const matches = getSearchableInstruments()
    .filter(inst => !inst.tracked)
    .filter(inst => currentTypeFilter === 'all' || inst.type === currentTypeFilter)
    .filter(inst => normalizeSearchText(inst.name).includes(searchQuery) || normalizeSearchText(inst.ticker).includes(searchQuery))
  const sortedMatches = sortSearchMatches(matches, searchQuery).slice(0, 40);

  if (!sortedMatches.length) {
    const emptyBlock = document.createElement('div');
    emptyBlock.className = 'sector-block';
    emptyBlock.innerHTML = `<div style="padding:12px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.25);border-radius:8px;">
      <div style="font-size:14px;font-weight:600;margin-bottom:6px;">Nessun titolo trovato per "${searchQuery}"</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:8px;">Puoi inserirlo manualmente nel catalogo e sincronizzarlo subito con watchlist/operazioni/portfolio.</div>
      <button class="btn xs ghost" onclick="addStockPromptAndSync('${searchQuery.toUpperCase()}')">➕ Aggiungi Stock</button>
    </div>`;
    body.appendChild(emptyBlock);
    return;
  }

  const block = document.createElement('div');
  block.className = 'sector-block';
  block.innerHTML = `<div class="sector-header" style="background:rgba(59,130,246,.08);border-left:3px solid #3b82f6;">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:10px;height:10px;border-radius:50%;background:#3b82f6"></div>
        Catalogo titoli <span style="font-size:12px;color:var(--dim);margin-left:8px;">${sortedMatches.length} risultati per "${searchQuery}"</span>
      </div>
    </div>
    <table><thead><tr><th>Stato</th><th>Nome</th><th>Ticker</th><th>Tipo</th><th>Link Analisi</th><th>Watchlist</th><th>Settore</th></tr></thead>
    <tbody>${sortedMatches.map(inst => `
      <tr>
        <td><span class="status-toggle active" title="Disponibile nel catalogo">🟢</span></td>
        <td style="font-weight:500;font-size:14px;"><span class="ticker-link" onclick="openStockModal('${inst.ticker}')">${inst.name}</span></td>
        <td><span class="ticker-link" onclick="openStockModal('${inst.ticker}')" style="color:#3b82f6">${inst.ticker}</span></td>
        <td><span class="badge badge-${inst.type === 'ETF' ? 'etf' : 'stock'}">${inst.type}</span></td>
        <td style="white-space:nowrap;">
          <a class="link-btn" href="https://finance.yahoo.com/quote/${inst.yahoo || inst.ticker}" target="_blank">Yahoo</a>
          <a class="link-btn" href="https://www.perplexity.ai/search?q=${encodeURIComponent(inst.ticker + ' ' + inst.name + ' stock analysis')}" target="_blank">Perplexity</a>
          <a class="link-btn" href="https://finviz.com/quote.ashx?t=${inst.ticker}" target="_blank">Finviz</a>
          <a class="link-btn" href="https://www.sec.gov/edgar/search/#/q=${inst.ticker}" target="_blank">SEC</a>
        </td>
        <td><button class="btn xs ghost" onclick="addCatalogResultToWatchlist('${inst.ticker}')">➕ Watchlist</button></td>
        <td style="font-size:12px;color:var(--dim);">${inst.sectorName !== 'Catalogo generale' ? inst.sectorName : resolveSectorNameForTicker(inst.ticker, inst.name)}</td>
      </tr>
    `).join('')}</tbody></table>`;
  body.appendChild(block);
}

function addCatalogResultToWatchlist(ticker) {
  if (getTrackedInstrumentByTicker(ticker)) {
    alert(`${ticker} e gia presente nella watchlist.`);
    return;
  }
  const instrument = getInstrumentByTicker(ticker);
  const targetIndex = resolveSectorIndexForTicker(ticker, instrument?.name || '');
  addCatalogInstrumentToWatchlist(ticker, targetIndex, instrument?.name || ticker);
  renderAll();
}

function addStockPromptAndSync(prefillTicker = '') {
  const tickerInput = prompt('Ticker (es. BLK, TSLA, NVDA):', prefillTicker || '');
  if (!tickerInput) return;
  const ticker = String(tickerInput || '').trim().toUpperCase();
  if (!ticker) return;
  const existing = getInstrumentByTicker(ticker);
  const nameInput = prompt('Nome azienda (se vuoto uso catalogo esistente):', existing?.name || '');
  const typeInput = (prompt('Tipo (Azione / ETF):', existing?.type || 'Azione') || 'Azione').trim();
  const catalogRow = addOrUpdateStockCatalogEntry(ticker, nameInput || existing?.name || ticker, typeInput || 'Azione');
  if (!catalogRow) {
    alert(`Impossibile aggiungere ${ticker} al catalogo.`);
    return;
  }
  const targetIndex = resolveSectorIndexForTicker(ticker, catalogRow.name || ticker);
  addCatalogInstrumentToWatchlist(ticker, targetIndex, catalogRow.name || ticker);
  renderAll();
}

function toggleStockAndRender(ticker) {
  toggleStockStatus(ticker);
  renderScreener();
  // Also refresh operazioni if it has been rendered
  if (typeof renderOperazioni === 'function') renderOperazioni();
}

function updateInstrNote(si, ticker, val) {
  const inst = SECTORS[si].instruments.find(i => i.ticker === ticker);
  if (inst) { inst.notes = val; saveSectors(); }
}

function removeSector(si) { if (confirm(`Eliminare il settore "${SECTORS[si].name}"?`)) { SECTORS.splice(si, 1); sectorWeights.splice(si, 1); instrumentWeights.splice(si, 1); saveSectors(); saveWeights(); renderAll(); }}

function removeInstrument(si, ticker) { SECTORS[si].instruments = SECTORS[si].instruments.filter(i => i.ticker !== ticker); saveSectors(); renderScreener(); }

function addInstrumentPrompt(si) {
  const name = prompt('Nome strumento:'); if (!name) return;
  const ticker = prompt('Ticker (es. AAPL):'); if (!ticker) return;
  const type = prompt('Tipo (ETF o Azione):', 'Azione') || 'Azione';
  SECTORS[si].instruments.push({ name, ticker: ticker.toUpperCase(), type, yahoo: ticker.toUpperCase(), notes: '', active: true });
  instrumentWeights[si].push(0);
  stockStatus[ticker.toUpperCase()] = true; saveStockStatus();
  saveSectors(); saveWeights(); renderScreener();
  // Sync: refresh operazioni filters
  if (typeof renderOperazioni === 'function') renderOperazioni();
}

function addNewSector() {
  const name = document.getElementById('new-sector-name').value.trim();
  const icon = document.getElementById('new-sector-icon').value.trim() || '⚪';
  const color = document.getElementById('new-sector-color').value;
  if (!name) { alert('Inserisci un nome'); return; }
  SECTORS.push({ name, color, icon, instruments: [] });
  sectorWeights.push(0); instrumentWeights.push([]);
  saveSectors(); saveWeights(); closeModal('modal-add-sector'); renderAll();
}
