// ── Sync badge helper — mostra data aggiornamento su ogni sezione ──
function syncBadge(date, section) {
  return '<div style="display:inline-flex;align-items:center;gap:5px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);border-radius:20px;padding:2px 10px;font-size:11px;color:var(--accent);margin-bottom:8px;">'
    + '<span style="width:6px;height:6px;border-radius:50%;background:var(--accent);display:inline-block;"></span>'
    + ' 🔄 Aggiornato: <strong style="margin-left:3px;">' + (date || '—') + '</strong>'
    + (section ? ' &nbsp;·&nbsp; <span style="color:var(--dim);">' + section + '</span>' : '')
    + '</div>';
}

function renderIntelligence() {
  renderMarketPulse();
  renderNewsFeed();
  renderMacroSnapshot();
  renderSentimentAgg();
  renderPolymarket();
  renderSourcesMonitor();
  renderHolderFlowMonitor();
}

function renderMarketPulse() {
  const c = document.getElementById('market-pulse-container');
  const updatedAt = (typeof MARKET_DATA !== 'undefined' && MARKET_DATA.lastUpdated) ? MARKET_DATA.lastUpdated : '26/04/2026';
  c.innerHTML = syncBadge(updatedAt, 'Indici mercato · prezzi EOD')
    + '<div class="grid-4">'
    + MARKET_DATA.indices.map(function(m) {
        const tooltip = m.name === 'VIX' ? 'Volatility Index: misura la volatilità attesa del mercato. VIX < 15 = calma. 15-25 = normale. > 25 = stress. > 30 = panico.'
          : m.name === 'Oil WTI' ? 'Prezzo del petrolio West Texas Intermediate. Benchmark USA. Influenza costi energia e inflazione.'
          : m.name === 'US 10Y' ? 'Rendimento Treasury 10 anni USA. Benchmark globale per il costo del denaro. Impatta REIT e growth stocks.'
          : m.name === 'Gold' ? "Prezzo dell'oro. Bene rifugio in periodi di incertezza. Sale quando risk-off e inflazione."
          : 'Indice ' + m.name + '. Traccia la performance delle principali azioni del mercato.';
        return '<div style="text-align:center;padding:10px;background:var(--surface2);border-radius:8px;">'
          + '<div style="font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.05em;">' + m.name
          + ' <span class="info-i">i<span class="tooltip"><span class="tooltip-title">' + m.name + '</span>' + tooltip + '</span></span></span></div>'
          + '<div style="font-size:18px;font-weight:700;margin:4px 0;" class="' + m.direction + '">' + m.value + '</div>'
          + '<div style="font-size:13px;" class="' + m.direction + '">' + m.change + '</div>'
          + '</div>';
      }).join('')
    + '</div>';
}

function renderNewsFeed() {
  const c = document.getElementById('news-feed-container');
  const filtered = newsFilter === 'all' ? NEWS_DB : NEWS_DB.filter(function(n) { return n.category === newsFilter; });
  // Find most recent news date
  const latestDate = filtered.length > 0 ? filtered[0].date : '—';
  const badge = syncBadge(latestDate, 'News aggiornate — ' + filtered.length + ' articoli');
  c.innerHTML = badge + filtered.map(function(n) {
    const catBadge = n.category === 'geopolitica' ? 'badge-geo' : n.category === 'macro' ? 'badge-macro' : n.category === 'insider' ? 'badge-insider' : 'badge-info';
    const impBadge = n.impact === 'alto' ? 'badge-sell' : n.impact === 'medio' ? 'badge-neutro' : 'badge-etf';
    return '<div class="news-card" id="news-' + n.id + '" onclick="toggleNews(' + n.id + ')">'
      + '<div class="news-source">' + n.source + ' · ' + n.date + '</div>'
      + '<div class="news-title">' + n.title + '</div>'
      + '<div class="news-body">' + n.body + '</div>'
      + '<div class="news-impact">'
      + '<span class="badge ' + catBadge + '">' + n.category.toUpperCase() + '</span>'
      + '<span class="badge ' + impBadge + '">IMPATTO: ' + n.impact.toUpperCase() + '</span>'
      + (n.tickers || []).map(function(t) { return '<span class="ticker-link" onclick="event.stopPropagation();openStockModal(\'' + t + '\')">' + t + '</span>'; }).join(' ')
      + '<button class="expand-btn">📖 Leggi analisi completa ▼</button>'
      + '</div>'
      + '<div class="news-expand">'
      + '<div class="report-section"><h5>📊 Analisi Approfondita</h5><div class="report-text"><p>' + (n.analysis || '') + '</p></div></div>'
      + '<div class="report-section"><h5>🎯 Azioni Suggerite</h5><div class="report-text"><p>' + (n.actions || '') + '</p></div></div>'
      + '</div>'
      + '</div>';
  }).join('');
}

function toggleNews(id) {
  const el = document.getElementById('news-' + id);
  if (el) el.classList.toggle('expanded');
}

function renderMacroSnapshot() {
  const c = document.getElementById('macro-snapshot');
  const updatedAt = (typeof MARKET_DATA !== 'undefined' && MARKET_DATA.lastUpdated) ? MARKET_DATA.lastUpdated : '26/04/2026';
  const macroAssets = {
    'S&P 500': {ticker:'SPY', icon:'📈'},
    'NASDAQ':  {ticker:'QQQ', icon:'💻'},
    'Gold':    {ticker:'GLD', icon:'🥇'},
    'Oil WTI': {ticker:'USO', icon:'🛢️'},
    'VIX':     {ticker:'VIXY', icon:'⚡'},
  };
  c.innerHTML = syncBadge(updatedAt, 'Macro snapshot')
    + MARKET_DATA.indices.map(function(m) {
        const macro = macroAssets[m.name];
        const badge = macro
          ? '<span class="ticker-link" onclick="openStockModal(\'' + macro.ticker + '\')" style="font-size:11px;margin-left:4px;padding:1px 5px;">' + macro.icon + ' ' + macro.ticker + '</span>'
          : '';
        return '<div class="stat-row">'
          + '<span class="stat-label">' + m.name + badge + '</span>'
          + '<span class="' + m.direction + '">' + m.value + ' (' + m.change + ')</span>'
          + '</div>';
      }).join('')
    + '<div style="margin-top:8px;padding:6px 8px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:6px;font-size:12px;color:var(--dim);">'
    + '💡 Clicca sui ticker <b style="color:var(--yellow)">SPY · QQQ · GLD · USO</b> per l\'analisi completa → Screener "Macro / Indici / Commodities"'
    + '</div>';
}

function renderSentimentAgg() {
  const c = document.getElementById('sentiment-container');
  const tickers = Object.keys(fundData);
  c.innerHTML = syncBadge('26/04/2026', 'Sentiment aggregato — fondi+social+news+istituz.')
    + tickers.map(function(t) {
        const fd = fundData[t];
        if (!fd || !fd.sentiment) return '';
        const s = fd.sentiment;
        return '<div style="margin-bottom:10px;">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">'
          + '<span class="ticker-link" onclick="openStockModal(\'' + t + '\')" style="font-size:14px;">' + t + '</span>'
          + '<span style="font-size:13px;font-weight:700;color:' + (s.overall >= 70 ? 'var(--green)' : s.overall >= 50 ? 'var(--yellow)' : 'var(--red)') + ';">' + s.overall + '/100</span>'
          + '</div>'
          + '<div class="sentiment-bar"><div class="buy" style="width:' + s.overall + '%"></div><div class="sell" style="width:' + (100 - s.overall) + '%"></div></div>'
          + '<div style="display:flex;gap:8px;font-size:11px;color:var(--dim);margin-top:2px;">'
          + '<span>Analisti: ' + s.analysts + '</span><span>Social: ' + s.social + '</span><span>News: ' + s.news + '</span><span>Istit.: ' + s.institutional + '</span>'
          + '</div>'
          + '</div>';
      }).join('');
}

function renderPolymarket() {
  const c = document.getElementById('polymarket-container');
  c.innerHTML = syncBadge('26/04/2026', 'Polymarket — mercati predittivi')
    + '<div style="padding:10px;background:var(--surface2);border-radius:8px;margin-bottom:8px;">'
    + '<div style="font-size:13px;font-weight:600;color:var(--dim);margin-bottom:6px;">Largest Company fine Marzo 2026?</div>'
    + '<div class="stat-row"><span>NVIDIA</span><span style="font-weight:700;">100,0%</span></div>'
    + '<div class="stat-row"><span>Apple</span><span>&lt;0,1%</span></div>'
    + '</div>'
    + '<div style="padding:10px;background:var(--surface2);border-radius:8px;margin-bottom:8px;">'
    + '<div style="font-size:13px;font-weight:600;color:var(--dim);margin-bottom:6px;">Fed Rate Cuts 2026?</div>'
    + '<div class="stat-row"><span>0 tagli</span><span style="color:var(--red);">38,0%</span></div>'
    + '<div class="stat-row"><span>1 taglio (25bps)</span><span style="color:var(--yellow);">25,0%</span></div>'
    + '<div class="stat-row"><span>2 tagli (50bps)</span><span style="color:var(--green);">19,0%</span></div>'
    + '</div>'
    + '<div style="padding:10px;background:var(--surface2);border-radius:8px;">'
    + '<div style="font-size:13px;font-weight:600;color:var(--dim);margin-bottom:6px;">NVDA sopra $200 entro Giugno 2026?</div>'
    + '<div class="stat-row"><span>Sì</span><span style="color:var(--green);">52,0%</span></div>'
    + '<div class="stat-row"><span>No</span><span style="color:var(--red);">48,0%</span></div>'
    + '</div>';
}

function renderSourcesMonitor() {
  const c = document.getElementById('sources-monitor');
  c.innerHTML = syncBadge('26/04/2026', 'Fonti verificate — affidabilità media 82%')
    + '<div class="grid-3">'
    + ANALYSIS_SOURCES.map(function(s) {
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--surface2);border-radius:6px;border:1px solid var(--border);">'
          + '<span style="font-size:18px;">' + s.icon + '</span>'
          + '<div style="flex:1;">'
          + '<div style="font-size:13px;font-weight:600;">' + s.name + '</div>'
          + '<div style="font-size:11px;color:var(--dim);">' + s.specialty.substring(0, 50) + '...</div>'
          + '</div>'
          + '<div style="text-align:right;">'
          + '<div class="gauge-wrap" style="width:60px;"><div class="gauge"><div class="gauge-fill" style="width:' + s.reliability + '%;background:' + (s.reliability >= 85 ? 'var(--green)' : s.reliability >= 70 ? 'var(--yellow)' : 'var(--red)') + ';"></div></div></div>'
          + '<div style="font-size:10px;color:var(--dim);">' + s.reliability + '%</div>'
          + '</div>'
          + '<a href="' + s.url + '" target="_blank" class="btn xs ghost" style="text-decoration:none;">↗</a>'
          + '</div>';
      }).join('')
    + '</div>';
}

function renderHolderFlowMonitor() {
  const c = document.getElementById('holder-flow-monitor');
  if (!c || typeof HOLDER_FLOW_TRACKER === 'undefined' || !HOLDER_FLOW_TRACKER.entries || !HOLDER_FLOW_TRACKER.entries.length) return;
  const alertCount = HOLDER_FLOW_TRACKER.entries.filter(function(e) { return e.status === 'Alert'; }).length;
  c.innerHTML = syncBadge(HOLDER_FLOW_TRACKER.updatedAt || '26/04/2026', 'Holder flow — Form 4 + 13F tracking')
    + (alertCount ? '<div style="margin-bottom:8px;"><span class="badge badge-sell">⚠️ Alert attivi: ' + alertCount + '</span></div>' : '')
    + '<table>'
    + '<thead><tr><th>Ticker</th><th>Bucket</th><th>Stato</th><th>Segnale</th><th>Sintesi</th><th>Fonti</th></tr></thead>'
    + '<tbody>'
    + HOLDER_FLOW_TRACKER.entries.map(function(e) {
        return '<tr>'
          + '<td><span class="ticker-link" onclick="openStockModal(\'' + e.ticker + '\')">' + e.ticker + '</span></td>'
          + '<td style="font-size:13px;">' + e.bucket + '</td>'
          + '<td><span class="badge ' + (e.status === 'Accumulo' ? 'badge-buy' : (e.status === 'Distribuzione' || e.status === 'Alert') ? 'badge-sell' : 'badge-neutro') + '">' + e.status + '</span></td>'
          + '<td style="font-family:monospace;font-size:13px;">' + e.signal + '</td>'
          + '<td style="font-size:12px;color:var(--muted);max-width:340px;">' + e.summary + '</td>'
          + '<td>' + (e.links || []).map(function(url) { return '<a class="link-btn" href="' + url + '" target="_blank">Apri</a>'; }).join(' ') + '</td>'
          + '</tr>';
      }).join('')
    + '</tbody></table>';
}
