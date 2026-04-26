// ═══════════════════════════════════════════════════
// APP INITIALIZATION & EVENT LISTENERS
// ═══════════════════════════════════════════════════

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
  document.getElementById('last-update').textContent = new Date().toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
