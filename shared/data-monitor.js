// data-monitor.js — Barra stato dati in tempo reale per tutte le pagine
// Inietta automaticamente un pannello con timestamp e freschezza di ogni fonte dati.
(function () {
  'use strict';

  const basePath = window.location.pathname.includes('/pages/') ? '../' : '';

  const SOURCES = [
    { key: 'prezzi',  label: '📊 Prezzi/P&L', file: 'market_data.json',       field: 'lastUpdated' },
    { key: 'pnl',     label: '💼 Portfolio',   file: 'portfolio_pnl.json',     field: 'lastUpdated' },
    { key: 'insider', label: '👁 Insider',     file: 'insider_data.json',      field: 'lastUpdated' },
    { key: 'geo',     label: '🌍 Geo/News',    file: 'geopolitical_data.json', field: 'lastUpdated' },
  ];

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth()+1)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
  }

  function ageMin(iso) {
    if (!iso) return Infinity;
    return (Date.now() - new Date(iso).getTime()) / 60000;
  }

  function statusFor(age) {
    if (age < 90)   return { dot: '🟢', cls: 'dm-ok',    label: 'ok'    };
    if (age < 360)  return { dot: '🟡', cls: 'dm-warn',  label: 'warn'  };
    if (age < 1440) return { dot: '🟠', cls: 'dm-old',   label: 'old'   };
    return            { dot: '🔴', cls: 'dm-stale', label: 'stale' };
  }

  function injectCSS() {
    if (document.getElementById('dm-style')) return;
    const s = document.createElement('style');
    s.id = 'dm-style';
    s.textContent = `
      #data-monitor-bar {
        width: 100%; box-sizing: border-box;
        background: #060e0a;
        border-bottom: 1px solid #1a3028;
        padding: 5px 14px;
        display: flex; align-items: center; flex-wrap: wrap; gap: 0;
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        font-size: 10.5px; line-height: 1.4;
        z-index: 800;
      }
      #data-monitor-bar .dm-header {
        color: #4ade80; font-weight: 700;
        margin-right: 10px; letter-spacing: 0.4px;
        white-space: nowrap;
      }
      #data-monitor-bar .dm-sep {
        color: #1a3028; margin: 0 2px;
      }
      #data-monitor-bar .dm-cell {
        display: flex; align-items: center; gap: 5px;
        padding: 1px 10px; border-right: 1px solid #1a3028;
        white-space: nowrap;
      }
      #data-monitor-bar .dm-cell:last-of-type { border-right: none; }
      #data-monitor-bar .dm-lbl { color: #475569; }
      #data-monitor-bar .dm-ts  { font-weight: 600; }
      #data-monitor-bar .dm-ok    .dm-ts { color: #4ade80; }
      #data-monitor-bar .dm-warn  .dm-ts { color: #fbbf24; }
      #data-monitor-bar .dm-old   .dm-ts { color: #f97316; }
      #data-monitor-bar .dm-stale .dm-ts { color: #f87171; }
      #data-monitor-bar .dm-ago { color: #334155; font-size: 9.5px; }
      #data-monitor-bar .dm-refresh {
        margin-left: auto; color: #334155;
        cursor: pointer; font-size: 10px;
        user-select: none; padding-left: 10px;
        white-space: nowrap;
      }
      #data-monitor-bar .dm-refresh:hover { color: #64748b; }
    `;
    document.head.appendChild(s);
  }

  function buildBar() {
    const bar = document.createElement('div');
    bar.id = 'data-monitor-bar';
    bar.innerHTML =
      `<span class="dm-header">⬤ DATA STATUS</span>` +
      SOURCES.map(s =>
        `<div class="dm-cell" id="dm-cell-${s.key}">
          <span class="dm-lbl">${s.label}</span>
          <span class="dm-ts" id="dm-ts-${s.key}">⏳</span>
          <span class="dm-ago" id="dm-ago-${s.key}"></span>
        </div>`
      ).join('') +
      `<span class="dm-refresh" id="dm-refresh">↻ <span id="dm-refreshed">—</span></span>`;
    return bar;
  }

  function fmtAgo(min) {
    if (!isFinite(min)) return '';
    if (min < 60)   return `${Math.round(min)}m fa`;
    if (min < 1440) return `${Math.round(min/60)}h fa`;
    return `${Math.round(min/1440)}g fa`;
  }

  async function refresh() {
    const results = await Promise.allSettled(
      SOURCES.map(s =>
        fetch(`${basePath}data/${s.file}?_=${Date.now()}`)
          .then(r => r.json())
          .then(d => ({ key: s.key, iso: d[s.field] || null }))
          .catch(() => ({ key: s.key, iso: null }))
      )
    );

    results.forEach(r => {
      if (r.status !== 'fulfilled') return;
      const { key, iso } = r.value;
      const cell  = document.getElementById(`dm-cell-${key}`);
      const tsEl  = document.getElementById(`dm-ts-${key}`);
      const agoEl = document.getElementById(`dm-ago-${key}`);
      if (!cell || !tsEl) return;
      const age = ageMin(iso);
      const st  = statusFor(age);
      cell.className = `dm-cell ${st.cls}`;
      tsEl.textContent  = `${st.dot} ${fmtDate(iso)}`;
      agoEl.textContent = fmtAgo(age);
    });

    const el = document.getElementById('dm-refreshed');
    if (el) {
      const now = new Date();
      el.textContent = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')} UTC`;
    }
  }

  function inject() {
    if (document.getElementById('data-monitor-bar')) return;
    injectCSS();
    const bar = buildBar();

    // Cerca il punto di inserimento: dopo sidebar, prima del contenuto principale
    const targets = [
      document.querySelector('.main-area'),
      document.querySelector('.main-content'),
      document.querySelector('main'),
      document.body,
    ];
    const container = targets.find(Boolean);
    if (container) container.insertBefore(bar, container.firstChild);

    refresh();
    setInterval(refresh, 5 * 60 * 1000);
    document.addEventListener('click', e => {
      if (e.target.closest('#dm-refresh')) refresh();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
