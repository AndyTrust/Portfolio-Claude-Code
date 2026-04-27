// ═══════════════════════════════════════════════════
// SHARED SIDEBAR NAV — Portfolio Intelligence PRO
// Include this script in every standalone page.
// Usage: <script src="../shared/nav.js" data-active="reports"></script>
// Or:    injectNav('reports');
// ═══════════════════════════════════════════════════

(function() {
  const scriptEl = document.currentScript;
  let activePage = scriptEl ? scriptEl.getAttribute('data-active') : null;
  if (!activePage) {
    const path = window.location.pathname;
    const file = path.split('/').pop().replace('.html','').toLowerCase();
    activePage = file || 'screener';
  }

  const basePath = window.location.pathname.includes('/pages/') ? '../' : '';

  const navHTML = `
<nav class="sidebar" id="main-sidebar">
  <button class="sidebar-close-btn" id="sidebar-close-btn" aria-label="Chiudi menu">✕</button>
  <div class="sidebar-logo">
    <a href="${basePath}Protfolio.html">
      <img src="${basePath}assets/italoMarziano_598_199.png" alt="@ItaloMarziano" class="sidebar-logo-img"/>
    </a>
  </div>

  <div class="tabs" id="main-tabs">
    <div class="nav-group-label">Analisi</div>

    <a class="tab ${activePage==='screener'?'active':''}" href="${basePath}screener.html">
      <svg class="tab-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      Screener
    </a>
    <a class="tab ${activePage==='portfolio'?'active':''}" href="${basePath}portfolio.html">
      <svg class="tab-icon" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
      Portfolio
    </a>

    <div class="nav-group-label">Intelligence</div>

    <a class="tab ${activePage==='fondi'?'active':''}" href="${basePath}fondi.html">
      <svg class="tab-icon" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      Fondi &amp; Insider
    </a>
    <a class="tab ${activePage==='intelligence'?'active':''}" href="${basePath}intelligence.html">
      <svg class="tab-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      Intelligence
      <span class="tab-badge">LIVE</span>
    </a>
    <a class="tab ${activePage==='geopolitica'?'active':''}" href="${basePath}geopolitica.html">
      <svg class="tab-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      Geopolitica &amp; Macro
    </a>

    <div class="nav-group-label">Report</div>

    <a class="tab ${activePage==='reports'?'active':''}" href="${basePath}reports.html">
      <svg class="tab-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      Reports
      <span class="tab-badge">LIVE</span>
    </a>
    <a class="tab ${activePage==='money-follow'?'active':''}" href="${basePath}money-follow.html">
      <svg class="tab-icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      Money Follow
      <span class="tab-badge">BI</span>
    </a>
  </div>

  <div class="sidebar-footer">
    <div class="sidebar-footer-label">Ultimo aggiornamento</div>
    <span id="last-update">—</span>
  </div>
  <div class="sidebar-version">Portfolio Intelligence · PRO v4.0</div>
</nav>

<div class="nav-overlay" id="nav-overlay"></div>

<div class="mobile-topbar" id="mobile-topbar">
  <button class="hamburger-btn" id="nav-hamburger" aria-label="Apri menu">
    <span></span><span></span><span></span>
  </button>
  <a class="mobile-topbar-logo" href="${basePath}Protfolio.html">
    <img src="${basePath}assets/italoMarziano_598_199.png" alt="@ItaloMarziano"/>
  </a>
</div>`;

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  // ── Hamburger logic ─────────────────────────────
  const sidebar  = document.getElementById('main-sidebar');
  const overlay  = document.getElementById('nav-overlay');
  const hamburger = document.getElementById('nav-hamburger');
  const closeBtn  = document.getElementById('sidebar-close-btn');

  function openNav() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('nav-open');
  }
  function closeNav() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  hamburger.addEventListener('click', openNav);
  overlay.addEventListener('click', closeNav);
  closeBtn.addEventListener('click', closeNav);

  // Close drawer on link tap (navigates to new page anyway, but keeps UX clean)
  sidebar.querySelectorAll('a.tab').forEach(function(link) {
    link.addEventListener('click', closeNav);
  });

  // Style fix
  const style = document.createElement('style');
  style.textContent = '.sidebar .tab { text-decoration:none; display:flex; align-items:center; gap:8px; }';
  document.head.appendChild(style);
})();
