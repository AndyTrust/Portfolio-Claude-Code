// ═══════════════════════════════════════════════════
// APP INITIALIZATION & EVENT LISTENERS
// ═══════════════════════════════════════════════════

function _fmtTs(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('it-IT', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
  catch(e) { return iso; }
}

function renderAll() {
  if (typeof syncAllSectorData === 'function') syncAllSectorData();
  renderMarketBar();
  renderSectorFilters();
  renderScreener();
  if (typeof renderRealPortfolio === 'function') renderRealPortfolio();
  if (typeof renderAIPortfolio === 'function') renderAIPortfolio();
  renderFondiPage();
  renderIntelligence();
  renderGeopolitica();
  if (typeof renderReports === 'function') renderReports();
  if (typeof renderMoneyFollow === 'function') renderMoneyFollow();
  // Fetch tutti i JSON live e aggiorna timestamps + dati in ogni tab
  _syncLiveData();
}

// ═══ Sync dati live da tutti i JSON → aggiorna timestamp e contenuto ═══
async function _syncLiveData() {
  try {
    const [market, insider, geo, pnl, geoRisks, secFilings] = await Promise.all([
      fetch('data/market_data.json').then(r=>r.json()).catch(()=>null),
      fetch('data/insider_data.json').then(r=>r.json()).catch(()=>null),
      fetch('data/geopolitical_data.json').then(r=>r.json()).catch(()=>null),
      fetch('data/portfolio_pnl.json').then(r=>r.json()).catch(()=>null),
      fetch('data/geopolitical_risks.json').then(r=>r.json()).catch(()=>null),
      fetch('data/sec_filings.json').then(r=>r.json()).catch(()=>null),
    ]);

    // Aggiorna MARKET_DATA con prezzi live e ri-renderizza intelligence
    if (market && typeof MARKET_DATA !== 'undefined') {
      if (market.indices) MARKET_DATA.indices = market.indices;
      if (market.lastUpdated) MARKET_DATA.lastUpdated = market.lastUpdated;
      renderMarketBar();
      renderIntelligence();
    }

    // FIX 3: Aggiorna GEOPOLITICAL_RISKS da JSON (sovrascrive array hardcoded in data.js)
    if (geoRisks && geoRisks.risks && typeof GEOPOLITICAL_RISKS !== 'undefined') {
      GEOPOLITICAL_RISKS.length = 0;
      geoRisks.risks.forEach(r => GEOPOLITICAL_RISKS.push(r));
    }

    // FIX 4: Aggiunge news live da geopolitical_data.json al NEWS_DB
    if (geo && geo.items && typeof NEWS_DB !== 'undefined') {
      const liveNews = geo.items
        .filter(item => item.relevant && item.category)
        .slice(0, 15)
        .map((item, i) => ({
          id: 900 + i,
          date: item.timestamp ? new Date(item.timestamp).toLocaleDateString('it-IT') : '—',
          title: item.text || item.summary || '—',
          source: item.platform || item.author || 'Live Feed',
          category: item.category === 'geopolitical' ? 'geopolitica' :
                    item.category === 'market_moving' ? 'macro' : 'macro',
          impact: item.score >= 4 ? 'alto' : item.score >= 2 ? 'medio' : 'basso',
          tickers: [],
          impactType: 'live-feed',
          body: item.summary || item.text || '—',
          analysis: '',
          actions: '',
          _isLive: true,
        }));
      // Prependi news live rimuovendo eventuali precedenti live
      const staticNews = NEWS_DB.filter(n => !n._isLive);
      NEWS_DB.length = 0;
      liveNews.forEach(n => NEWS_DB.push(n));
      staticNews.forEach(n => NEWS_DB.push(n));
    }

    // Timestamp globali per i renderer
    window._liveTs = {
      market:  market?.lastUpdated  ? _fmtTs(market.lastUpdated)  : '—',
      insider: insider?.lastUpdated ? _fmtTs(insider.lastUpdated) : '—',
      geo:     geo?.lastUpdated     ? _fmtTs(geo.lastUpdated)     : '—',
      pnl:     pnl?.lastUpdated     ? _fmtTs(pnl.lastUpdated)     : '—',
    };

    // Geopolitica: aggiorna timestamp globale e ri-renderizza (con rischi aggiornati)
    if (geo?.lastUpdated || geoRisks?.lastUpdated) {
      window._geoLastUpdated = geoRisks?.lastUpdated
        ? _fmtTs(geoRisks.lastUpdated)
        : window._liveTs.geo;
      renderGeopolitica();
    }

    // Sidebar footer
    const sidebarEl = document.getElementById('last-update');
    if (sidebarEl) sidebarEl.textContent = window._liveTs.market;

    // Disclaimer fondi con timestamp reale
    const fondiDis = document.getElementById('fondi-disclaimer');
    if (fondiDis) {
      const insTs = window._liveTs.insider !== '—' ? window._liveTs.insider : window._liveTs.market;
      fondiDis.innerHTML = `⚠️ Insider Form 4 aggiornato: <strong>${insTs}</strong> — Filing 13F Q4 2025 (ritardo ~45gg). Q1 2026 disponibile dal 15 mag 2026. Fonti: SEC EDGAR, OpenInsider, WhaleWisdom.`;
    }

    // Intelligence: aggiorna header con timestamp prezzi
    const intTs = document.getElementById('intelligence-ts');
    if (intTs) intTs.textContent = window._liveTs.market;

    // Portfolio P&L: aggiorna con dati freschi
    if (pnl && typeof renderRealPortfolio === 'function') {
      window._livePnl = pnl;
      renderRealPortfolio();
    }

    // SEC Filings: carica dati e renderizza
    if (secFilings) {
      window._secFilingsData = secFilings;
      if (typeof renderSecFilings === 'function') renderSecFilings();
    }

    // Tutti gli altri tab: ri-renderizza con timestamp live
    if (typeof renderAIPortfolio === 'function') renderAIPortfolio();
    if (typeof renderMoneyFollow === 'function') renderMoneyFollow();
    if (typeof renderFondiPage === 'function') renderFondiPage();

    // Carica riassunti AI nel tab Reports
    _loadReportSummaries();

  } catch(e) {
    console.warn('_syncLiveData:', e);
  }
}

// ═══ Carica riassunti giornaliero/settimanale/mensile da JSON ═══
async function _loadReportSummaries() {
  const container = document.getElementById('report-summaries');
  if (!container) return;
  try {
    const [daily, weekly, monthly] = await Promise.all([
      fetch('data/daily_summary.json').then(r=>r.json()).catch(()=>null),
      fetch('data/weekly_summary.json').then(r=>r.json()).catch(()=>null),
      fetch('data/monthly_summary.json').then(r=>r.json()).catch(()=>null),
    ]);
    const _card = (icon, title, data) => data ? `
      <div style="border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="font-size:14px;">${icon} ${title}</strong>
          <span style="font-size:11px;color:var(--dim);">Generato: ${_fmtTs(data.lastGenerated)}</span>
        </div>
        <div style="font-size:13px;line-height:1.75;color:var(--muted);white-space:pre-line;">${data.summary || '—'}</div>
      </div>` : '';
    const html = _card('📅','Briefing Giornaliero',daily)
               + _card('📊','Report Settimanale',weekly)
               + _card('📆','Report Mensile',monthly);
    container.innerHTML = html || '<div style="color:var(--dim);font-size:13px;padding:4px 0;">⏳ Riassunti non ancora disponibili — generati dalla VPS ogni giorno alle 18:00, domenica 20:00, 1° del mese.</div>';
  } catch(e) {
    container.innerHTML = '<div style="color:var(--dim);font-size:13px;">⚠️ Errore caricamento riassunti.</div>';
  }
}

function exportReportAsText() {
  if (typeof INTELLIGENCE_REPORTS === 'undefined' || !INTELLIGENCE_REPORTS.length) { alert('Nessun report disponibile'); return; }
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));
  const report = sorted[currentReportIndex];
  if (!report) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([report.raw], { type: 'text/markdown;charset=utf-8;' }));
  a.download = `intelligence_${report.date}.md`;
  a.click();
}

// ═══ Tab switching ═══
document.querySelectorAll('#main-tabs .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#main-tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
    // Reset form di modifica se si cambia tab mentre era in corso un'edit
    if (typeof editingOperationId !== 'undefined' && editingOperationId !== null && tab.dataset.tab !== 'portfolio') {
      if (typeof annullaModificaOperazione === 'function') annullaModificaOperazione();
    }
    if (tab.dataset.tab === 'portfolio') {
      if (typeof initCharts === "function" && !pieChart) initCharts();
      if (typeof updateCharts === "function") updateCharts();
      if (typeof renderRealPortfolio === 'function') renderRealPortfolio();
      if (typeof renderAIPortfolio === 'function') setTimeout(renderAIPortfolio, 150);
    }
    if (tab.dataset.tab === 'reports') {
      if (typeof renderReports === 'function') renderReports();
    }
    if (tab.dataset.tab === 'money-follow') {
      if (typeof initMoneyFollow === 'function') initMoneyFollow();
    }
    if (tab.dataset.tab === 'sec-filings') {
      if (typeof renderSecFilings === 'function') renderSecFilings();
    }
    // Update URL hash for deep linking
    window.location.hash = tab.dataset.tab;
  });
});

// ═══ Deep link: open tab from URL hash ═══
function openTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const tab = document.querySelector(`#main-tabs .tab[data-tab="${hash}"]`);
    if (tab) tab.click();
  }
}

// ═══ Type filters ═══
document.querySelectorAll('[data-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); currentTypeFilter = btn.dataset.type; renderScreener();
  });
});

// ═══ Status filters (active/inactive) ═══
document.querySelectorAll('[data-status]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-status]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); currentStatusFilter = btn.dataset.status; renderScreener();
  });
});

// ═══ News filters ═══
document.querySelectorAll('[data-newsfilter]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-newsfilter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); newsFilter = btn.dataset.newsfilter; renderNewsFeed();
  });
});

// ═══ Search ═══
document.getElementById('search-input').addEventListener('input', e => { searchQuery = normalizeSearchText(e.target.value); renderScreener(); });



// ═══ Operation type change → update calc sign ═══


// ═══ ESC key for modals ═══
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
});

// ═══ Click overlay to close ═══
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
});

// ═══ Setup autocomplete for operations ticker ═══
if (typeof setupTickerAutocomplete === 'function') {
  setupTickerAutocomplete();
}

// ═══ INIT ═══
renderAll();
openTabFromHash();

// ─── Background sync: load latest JSON data from reports/ folder ───
// These run silently; if no HTTP server is available they fail gracefully
if (typeof trySyncStockMasterJSON === 'function') setTimeout(trySyncStockMasterJSON, 500);
if (typeof trySyncOnlineSectorMapJSON === 'function') setTimeout(trySyncOnlineSectorMapJSON, 700);

// Listen for hash changes (back/forward)
window.addEventListener('hashchange', openTabFromHash);

// ═══ Sticky offset sync: tabs top = altezza reale header ═══
// Evita che le tabs scivolino sotto l'header quando questo cresce (flex-wrap su mobile)
function syncTabsOffset() {
  const hdr = document.querySelector('header');
  const tabs = document.getElementById('main-tabs');
  if (!hdr || !tabs) return;
  const h = hdr.getBoundingClientRect().height;
  tabs.style.top = h + 'px';
}
syncTabsOffset();
window.addEventListener('resize', syncTabsOffset);
// Osserva cambiamenti di dimensione sull'header (es. market-bar che si ridimensiona)
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(syncTabsOffset).observe(document.querySelector('header'));
}

// ═══ GLOBAL TOOLTIP — posizionato sul body, immune a overflow:hidden ═══
(function() {
  const tip = document.createElement('div');
  tip.id = 'global-tooltip';
  tip.style.cssText = [
    'position:fixed',
    'z-index:99999',
    'max-width:300px',
    'background:#2a1810',
    'border:1px solid rgba(255,255,255,.14)',
    'border-radius:10px',
    'padding:12px 14px',
    'font-size:11px',
    'color:rgba(255,255,255,.9)',
    'font-family:system-ui,sans-serif',
    'line-height:1.55',
    'box-shadow:0 8px 32px rgba(0,0,0,.6)',
    'pointer-events:none',
    'display:none',
    'transition:opacity .12s ease',
    'word-wrap:break-word'
  ].join(';');
  document.body.appendChild(tip);

  function positionTip(e) {
    const pad = 14, vw = window.innerWidth, vh = window.innerHeight;
    let x = e.clientX + 12, y = e.clientY - tip.offsetHeight - 12;
    if (x + tip.offsetWidth + pad > vw) x = e.clientX - tip.offsetWidth - 12;
    if (y < pad) y = e.clientY + 18;
    if (y + tip.offsetHeight + pad > vh) y = vh - tip.offsetHeight - pad;
    tip.style.left = Math.max(pad, x) + 'px';
    tip.style.top  = Math.max(pad, y) + 'px';
  }

  document.addEventListener('mouseover', function(e) {
    const infoEl = e.target.closest('.info-i');
    if (!infoEl) return;
    const inner = infoEl.querySelector('.tooltip');
    if (!inner) return;
    tip.innerHTML = inner.innerHTML;
    tip.style.display = 'block';
    positionTip(e);
  });

  document.addEventListener('mousemove', function(e) {
    if (tip.style.display === 'none') return;
    if (!e.target.closest('.info-i')) return;
    positionTip(e);
  });

  document.addEventListener('mouseout', function(e) {
    if (!e.target.closest('.info-i')) return;
    if (e.relatedTarget && e.relatedTarget.closest('.info-i')) return;
    tip.style.display = 'none';
  });
})();
