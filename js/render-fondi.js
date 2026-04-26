function renderFondiPage() {
  renderKeySignals();
  renderHeatmap();
  renderFundFlowCharts();
  renderStockCards();
  renderInsiderTable();
}

function renderKeySignals() {
  const c = document.getElementById('key-signals-container');

  // Build signals dynamically from fundData
  const accumItems = [], distribItems = [], insiderItems = [];
  Object.entries(fundData || {}).forEach(([ticker, fd]) => {
    (fd.buyers || []).forEach(b => {
      if (b.pct >= 5) accumItems.push({ ticker, text: ticker + ': ' + b.name.split(' ').slice(0,2).join(' ') + ' +' + b.pct + '%', pct: b.pct });
    });
    (fd.sellers || []).forEach(s => {
      if (Math.abs(s.pct) >= 5) distribItems.push({ ticker, text: ticker + ': ' + s.name.split(' ').slice(0,2).join(' ') + ' ' + s.pct + '%', pct: Math.abs(s.pct) });
    });
    (fd.insider || []).forEach(ins => {
      if (ins.action === 'ACQUISTO') insiderItems.push({ ticker, text: ticker + ': ' + ins.name.split(' ').pop() + ' compra ' + ins.value });
    });
  });
  accumItems.sort((a, b) => b.pct - a.pct);
  distribItems.sort((a, b) => b.pct - a.pct);

  const signals = [
    { title: '🔥 ACCUMULO FORTE', items: accumItems.slice(0, 4), color: 'green' },
    { title: '⚠️ DISTRIBUZIONE', items: distribItems.slice(0, 4), color: 'red' },
    { title: '🔍 INSIDER BUY', items: insiderItems.slice(0, 4), color: 'cyan' }
  ];
  const rgba = { green: '52,211,153', red: '248,113,113', cyan: '34,211,238' };
  c.innerHTML = '<div class="grid-3">' + signals.map(function(s) {
    return '<div class="highlight-box" style="background:rgba(' + rgba[s.color] + ',.06);border-color:rgba(' + rgba[s.color] + ',.25);">'
      + '<div style="font-size:15px;font-weight:700;color:var(--' + s.color + ');margin-bottom:6px;">' + s.title + '</div>'
      + (s.items.length
        ? s.items.map(function(item) {
            return '<div style="font-size:15px;color:var(--muted);padding:2px 0;cursor:pointer;" onclick="openStockModal(\'' + item.ticker + '\')">' + item.text + '</div>';
          }).join('')
        : '<div style="font-size:15px;color:var(--dim);">Nessun segnale rilevato</div>')
      + '</div>';
  }).join('') + '</div>';
}

function renderHeatmap() {
  const c = document.getElementById('heatmap-container');
  const tickers = Object.keys(fundData);
  const allFunds = new Map();
  tickers.forEach(function(t) {
    const fd = fundData[t];
    if (!fd) return;
    (fd.buyers || []).forEach(function(b) { if (!allFunds.has(b.name)) allFunds.set(b.name, {}); allFunds.get(b.name)[t] = b.pct; });
    (fd.sellers || []).forEach(function(s) { if (!allFunds.has(s.name)) allFunds.set(s.name, {}); allFunds.get(s.name)[t] = s.pct; });
  });

  let html = '<table><thead><tr><th style="min-width:160px;">Fondo <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Matrice Fondi</span>Ogni cella mostra la variazione % della posizione del fondo nel titolo. Verde = accumulo, Rosso = distribuzione.<br><span class="tooltip-note">Dati da SEC 13F filings. Clicca un ticker per aprire l\'analisi completa.</span></span></span></th>';
  tickers.forEach(function(t) { html += '<th style="text-align:center;"><span class="ticker-link" onclick="openStockModal(\'' + t + '\')">' + t + '</span></th>'; });
  html += '<th style="text-align:center;color:var(--green);">🟢 Buy</th><th style="text-align:center;color:var(--red);">🔴 Sell</th><th>Orientamento</th></tr></thead><tbody>';

  allFunds.forEach(function(positions, fund) {
    html += '<tr><td style="font-weight:600;font-size:15px;">' + fund + '</td>';
    let buys = 0, sells = 0;
    tickers.forEach(function(t) {
      const v = positions[t];
      if (v !== undefined) {
        const cls = v > 50 ? 'heat-strong-pos' : v > 0 ? 'heat-pos' : v < -20 ? 'heat-strong-neg' : 'heat-neg';
        html += '<td><div class="' + cls + '" onclick="openStockModal(\'' + t + '\')">' + (v > 0 ? '+' : '') + v + '%</div></td>';
        if (v > 0) buys++; else sells++;
      } else {
        html += '<td><div class="heat-neutral">—</div></td>';
      }
    });
    const orient = buys > sells ? (buys > sells + 1 ? 'FORTE ACCUMULO' : 'ACCUMULA') : sells > buys ? 'DISTRIBUZIONE' : 'MISTO';
    const badgeCls = orient.includes('FORTE') ? 'badge-strong' : orient === 'ACCUMULA' ? 'badge-accum' : orient === 'DISTRIBUZIONE' ? 'badge-distrib' : 'badge-neutro';
    html += '<td style="text-align:center;" class="up">' + buys + '</td><td style="text-align:center;" class="down">' + sells + '</td><td><span class="badge ' + badgeCls + '">' + orient + '</span></td></tr>';
  });
  html += '</tbody></table>';
  c.innerHTML = html;
}

function renderFundFlowCharts() {
  const tickers = Object.keys(fundData);
  // Net Flow Chart
  const ctx1 = document.getElementById('chart-net-flow') ? document.getElementById('chart-net-flow').getContext('2d') : null;
  if (ctx1) {
    const flows = tickers.map(function(t) {
      const fd = fundData[t];
      const buySum = (fd.buyers || []).reduce(function(a, b) { return a + Math.abs(b.pct); }, 0);
      const sellSum = (fd.sellers || []).reduce(function(a, s) { return a + Math.abs(s.pct); }, 0);
      return buySum - sellSum;
    });
    if (netFlowChart) netFlowChart.destroy();
    netFlowChart = new Chart(ctx1, { type: 'bar', data: { labels: tickers, datasets: [{ data: flows, backgroundColor: flows.map(function(f) { return f >= 0 ? 'rgba(52,211,153,.6)' : 'rgba(248,113,113,.6)'; }), borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#525a72', font: { size: 12 } }, grid: { display: false } }, y: { ticks: { color: '#525a72' }, grid: { color: '#2a2f48' } } } } });
  }
  // Consensus Chart
  const ctx2 = document.getElementById('chart-consensus') ? document.getElementById('chart-consensus').getContext('2d') : null;
  if (ctx2) {
    const scores = tickers.map(function(t) { return fundData[t] && fundData[t].targets ? fundData[t].targets.consensusScore || 50 : 50; });
    if (consensusChart) consensusChart.destroy();
    consensusChart = new Chart(ctx2, { type: 'bar', data: { labels: tickers, datasets: [{ data: scores, backgroundColor: scores.map(function(s) { return s >= 80 ? 'rgba(52,211,153,.6)' : s >= 60 ? 'rgba(251,191,36,.6)' : 'rgba(248,113,113,.6)'; }), borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#525a72', font: { size: 12 } }, grid: { display: false } }, y: { min: 0, max: 100, ticks: { color: '#525a72' }, grid: { color: '#2a2f48' } } } } });
  }
}

function renderStockCards() {
  const c = document.getElementById('stock-cards-container');
  c.innerHTML = '';
  Object.entries(fundData).forEach(function(entry) {
    const ticker = entry[0];
    const fd = entry[1];
    const sColor = fd.signalColor === 'green' ? 'var(--green)' : fd.signalColor === 'red' ? 'var(--red)' : 'var(--yellow)';
    const sentPct = fd.sentiment ? fd.sentiment.overall || 50 : 50;

    // Top buyer
    const buyers = (fd.buyers || []).slice().sort(function(a, b) { return b.pct - a.pct; });
    const topBuyer = buyers[0];
    // Top seller
    const sellers = (fd.sellers || []).slice().sort(function(a, b) { return Math.abs(b.pct) - Math.abs(a.pct); });
    const topSeller = sellers[0];
    // Last insider op (most recent)
    const insiders = (fd.insider || []).slice().sort(function(a, b) { return b.date.localeCompare(a.date); });
    const lastIns = insiders[0];
    // Analyst targets
    const tgt = fd.targets || {};
    const consensus = tgt.consensus || '—';
    const tgtLow = tgt.low || '—';
    const tgtMed = tgt.mid || '—';
    const tgtHigh = tgt.high || '—';
    const consensusColor = consensus === 'BUY' || consensus === 'STRONG BUY' ? 'var(--green)' : consensus === 'SELL' || consensus === 'STRONG SELL' ? 'var(--red)' : 'var(--yellow)';

    // Sector/tag
    const sector = fd.sector || '';

    // PE
    const pe = fd.pe || '—';
    const mktCap = fd.marketCap || '';

    let card = '<div class="stock-card" onclick="openStockModal(\'' + ticker + '\')" style="cursor:pointer;">';

    // ── Header: ticker + price
    card += '<div class="stock-header">';
    card += '<div>';
    card += '<div class="stock-ticker" style="color:' + sColor + ';font-size:20px;">' + ticker + '</div>';
    if (sector) card += '<div style="font-size:12px;color:var(--dim);margin:1px 0;">' + sector + '</div>';
    card += '<div style="margin-top:4px;">';
    card += '<span class="badge badge-' + (fd.signalColor === 'green' ? 'accum' : fd.signalColor === 'red' ? 'distrib' : 'neutro') + '">' + (fd.signal || '—') + '</span>';
    if (pe !== '—') card += '<span class="badge badge-info" style="margin-left:4px;">P/E ' + pe + '</span>';
    card += '</div>';
    card += '</div>';
    card += '<div class="stock-price">';
    card += '<div class="price" style="font-size:19px;">' + (fd.currency === 'EUR' ? '€' : '$') + fd.price + '</div>';
    card += '<div class="change ' + (fd.change >= 0 ? 'up' : 'down') + '" style="font-size:15px;">' + (fd.change >= 0 ? '▲' : '▼') + ' ' + Math.abs(fd.change) + '%</div>';
    if (mktCap) card += '<div style="font-size:11px;color:var(--dim);margin-top:2px;">' + mktCap + '</div>';
    card += '</div>';
    card += '</div>'; // .stock-header

    // ── Sentiment bar
    card += '<div style="margin:8px 0 6px;">';
    card += '<div style="display:flex;justify-content:space-between;font-size:13px;color:var(--dim);margin-bottom:2px;"><span>Sentiment aggregato</span><span style="font-weight:700;color:' + (sentPct >= 70 ? 'var(--green)' : sentPct >= 50 ? 'var(--yellow)' : 'var(--red)') + ';">' + sentPct + '/100</span></div>';
    card += '<div class="sentiment-bar"><div class="buy" style="width:' + sentPct + '%;"></div><div class="sell" style="width:' + (100 - sentPct) + '%;"></div></div>';
    if (fd.sentiment) {
      card += '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11px;color:var(--dim);margin-top:3px;">';
      card += '<span>Analisti: ' + (fd.sentiment.analysts || '—') + '</span>';
      card += '<span>Social: ' + (fd.sentiment.social || '—') + '</span>';
      card += '<span>News: ' + (fd.sentiment.news || '—') + '</span>';
      card += '<span>Istit.: ' + (fd.sentiment.institutional || '—') + '</span>';
      card += '</div>';
    }
    card += '</div>';

    // ── Top fondo compratore / venditore
    card += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0;">';
    if (topBuyer) {
      card += '<div style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.2);border-radius:6px;padding:6px 8px;">';
      card += '<div style="font-size:11px;color:var(--green);font-weight:700;margin-bottom:2px;">🟢 TOP BUYER</div>';
      card += '<div style="font-size:13px;color:var(--muted);font-weight:600;">' + topBuyer.name.split(' ').slice(0,3).join(' ') + '</div>';
      card += '<div style="font-size:12px;color:var(--green);font-weight:700;">+' + topBuyer.pct + '%</div>';
      if (topBuyer.shares) card += '<div style="font-size:11px;color:var(--dim);">' + topBuyer.shares.toLocaleString() + ' az.</div>';
      card += '</div>';
    } else {
      card += '<div style="background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-size:13px;color:var(--dim);">Nessun buyer attivo</div>';
    }
    if (topSeller) {
      card += '<div style="background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2);border-radius:6px;padding:6px 8px;">';
      card += '<div style="font-size:11px;color:var(--red);font-weight:700;margin-bottom:2px;">🔴 TOP SELLER</div>';
      card += '<div style="font-size:13px;color:var(--muted);font-weight:600;">' + topSeller.name.split(' ').slice(0,3).join(' ') + '</div>';
      card += '<div style="font-size:12px;color:var(--red);font-weight:700;">' + topSeller.pct + '%</div>';
      if (topSeller.shares) card += '<div style="font-size:11px;color:var(--dim);">' + topSeller.shares.toLocaleString() + ' az.</div>';
      card += '</div>';
    } else {
      card += '<div style="background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-size:13px;color:var(--dim);">Nessun seller attivo</div>';
    }
    card += '</div>'; // grid

    // ── Last insider activity
    if (lastIns) {
      const insColor = lastIns.action === 'ACQUISTO' ? 'rgba(52,211,153,.12)' : 'rgba(248,113,113,.10)';
      const insBorder = lastIns.action === 'ACQUISTO' ? 'rgba(52,211,153,.3)' : 'rgba(248,113,113,.3)';
      const insTextColor = lastIns.action === 'ACQUISTO' ? 'var(--green)' : 'var(--red)';
      card += '<div style="background:' + insColor + ';border:1px solid ' + insBorder + ';border-radius:6px;padding:7px 10px;margin-bottom:8px;">';
      card += '<div style="font-size:11px;color:var(--dim);margin-bottom:2px;">🔍 ULTIMO INSIDER (' + lastIns.date + ')</div>';
      card += '<div style="font-size:13px;font-weight:600;color:var(--muted);">' + lastIns.name + '</div>';
      card += '<div style="font-size:12px;color:var(--dim);">' + lastIns.role + '</div>';
      card += '<div style="display:flex;gap:8px;align-items:center;margin-top:4px;">';
      card += '<span class="badge ' + (lastIns.action === 'ACQUISTO' ? 'badge-buy' : 'badge-sell') + '">' + lastIns.action + '</span>';
      card += '<span style="font-size:13px;color:' + insTextColor + ';font-weight:700;">' + lastIns.value + '</span>';
      if (lastIns.price) card += '<span style="font-size:12px;color:var(--dim);">@ $' + lastIns.price + '</span>';
      card += '</div>';
      if (lastIns.note) card += '<div style="font-size:12px;color:var(--dim);margin-top:3px;font-style:italic;">' + lastIns.note + '</div>';
      card += '</div>';
    }

    // ── Analyst targets box
    if (tgt.consensus || tgt.low || tgt.mid || tgt.high) {
      card += '<div style="background:rgba(99,102,241,.07);border:1px solid rgba(99,102,241,.2);border-radius:6px;padding:7px 10px;margin-bottom:8px;">';
      card += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      card += '<span style="font-size:11px;color:var(--dim);">📊 CONSENSUS ANALISTI</span>';
      card += '<span style="font-size:14px;font-weight:700;color:' + consensusColor + ';">' + consensus + '</span>';
      card += '</div>';
      card += '<div style="display:flex;gap:8px;font-size:12px;">';
      card += '<div style="flex:1;text-align:center;"><div style="color:var(--dim);font-size:11px;">MIN</div><div style="color:var(--red);font-weight:600;">' + (fd.currency === 'EUR' ? '€' : '$') + tgtLow + '</div></div>';
      card += '<div style="flex:1;text-align:center;"><div style="color:var(--dim);font-size:11px;">TARGET</div><div style="color:var(--yellow);font-weight:700;">' + (fd.currency === 'EUR' ? '€' : '$') + tgtMed + '</div></div>';
      card += '<div style="flex:1;text-align:center;"><div style="color:var(--dim);font-size:11px;">MAX</div><div style="color:var(--green);font-weight:600;">' + (fd.currency === 'EUR' ? '€' : '$') + tgtHigh + '</div></div>';
      card += '</div>';
      if (tgt.consensusScore) {
        const cscore = tgt.consensusScore;
        card += '<div style="margin-top:5px;"><div class="sentiment-bar" style="height:5px;"><div class="buy" style="width:' + cscore + '%;"></div><div class="sell" style="width:' + (100 - cscore) + '%;"></div></div></div>';
      }
      card += '</div>';
    }

    // ── Fund count summary
    card += '<div style="display:flex;gap:8px;font-size:13px;color:var(--muted);flex-wrap:wrap;border-top:1px solid var(--border);padding-top:6px;">';
    card += '<span>🟢 ' + (fd.buyers || []).length + ' fondi compratori</span>';
    card += '<span>🔴 ' + (fd.sellers || []).length + ' fondi venditori</span>';
    card += '<span>🔍 ' + (fd.insider || []).length + ' op. insider</span>';
    card += '</div>';
    card += '<div style="margin-top:6px;font-size:13px;color:var(--dim);text-align:right;">Analisi completa →</div>';

    card += '</div>'; // .stock-card
    c.innerHTML += card;
  });
}

function renderInsiderTable() {
  const c = document.getElementById('insider-table-container');
  const allInsider = [];
  Object.entries(fundData).forEach(function(entry) {
    const ticker = entry[0];
    const fd = entry[1];
    (fd.insider || []).forEach(function(ins) { allInsider.push(Object.assign({}, ins, { ticker: ticker })); });
  });
  allInsider.sort(function(a, b) { return b.date.localeCompare(a.date); });

  c.innerHTML = '<table><thead><tr>'
    + '<th>Data</th><th>Ticker</th><th>Nome</th><th>Ruolo</th><th>Azione</th><th>Shares</th><th>Prezzo</th><th>Valore</th>'
    + '<th>Note <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Note Insider</span>Contesto dell\'operazione. "Piano 10b5-1" = vendita pre-programmata (meno significativa). "Open market" = acquisto volontario (segnale forte).</span></span></span></th>'
    + '</tr></thead>'
    + '<tbody>'
    + allInsider.map(function(ins) {
        return '<tr>'
          + '<td style="font-size:15px;">' + ins.date + '</td>'
          + '<td><span class="ticker-link" onclick="openStockModal(\'' + ins.ticker + '\')">' + ins.ticker + '</span></td>'
          + '<td style="font-size:15px;">' + ins.name + '</td>'
          + '<td style="font-size:13px;color:var(--dim);">' + ins.role + '</td>'
          + '<td><span class="badge ' + (ins.action === 'ACQUISTO' ? 'badge-buy' : 'badge-sell') + '">' + ins.action + '</span></td>'
          + '<td style="font-family:monospace;font-size:14px;">' + (ins.shares ? ins.shares.toLocaleString() : '—') + '</td>'
          + '<td style="font-family:monospace;font-size:14px;">$' + (ins.price || '—') + '</td>'
          + '<td style="font-family:monospace;font-size:14px;">' + (ins.value || '—') + '</td>'
          + '<td style="font-size:13px;color:var(--muted);max-width:250px;">' + (ins.note || '') + '</td>'
          + '</tr>';
      }).join('')
    + '</tbody></table>';
}
