// data-monitor.js — Barra stato dati, una voce per pagina
(function () {
  'use strict';

  const basePath = window.location.pathname.includes('/pages/') ? '../' : '';

  // Una riga per pagina → quale JSON usa e quale campo timestamp
  const PAGES = [
    { key: 'screener',     label: '🔍 Screener',     file: 'market_data.json',       field: 'lastUpdated' },
    { key: 'portfolio',    label: '💼 Portfolio',     file: 'portfolio_pnl.json',     field: 'lastUpdated' },
    { key: 'fondi',        label: '🏦 Fondi',         file: 'insider_data.json',      field: 'lastUpdated' },
    { key: 'intelligence', label: '⚡ Intelligence',  file: 'market_data.json',       field: 'lastUpdated' },
    { key: 'geopolitica',  label: '🌍 Geopolitica',  file: 'geopolitical_data.json', field: 'lastUpdated' },
    { key: 'reports',      label: '📋 Reports',       file: 'market_data.json',       field: 'lastUpdated' },
    { key: 'money',        label: '💰 Money Follow',  file: 'insider_data.json',      field: 'lastUpdated' },
  ];

  // File unici da fetchare (evita fetch doppi)
  const UNIQUE_FILES = [...new Set(PAGES.map(p => p.file))];

  const TZ = 'Europe/Rome';

  function fmtFull(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('it-IT', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: TZ
      });
    } catch(e) { return iso; }
  }

  function fmtBar(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const parts = new Intl.DateTimeFormat('it-IT', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
        timeZone: TZ, hour12: false
      }).formatToParts(d);
      const get = type => parts.find(p => p.type === type)?.value ?? '00';
      return `${get('day')}/${get('month')} ${get('hour')}:${get('minute')}`;
    } catch(e) { return '—'; }
  }

  function ageMin(iso) {
    if (!iso) return Infinity;
    return (Date.now() - new Date(iso).getTime()) / 60000;
  }

  function statusFor(age) {
    if (age < 90)   return { dot: '🟢', cls: 'dm-ok'    };
    if (age < 360)  return { dot: '🟡', cls: 'dm-warn'  };
    if (age < 1440) return { dot: '🟠', cls: 'dm-old'   };
    return            { dot: '🔴', cls: 'dm-stale' };
  }

  function fmtAgo(min) {
    if (!isFinite(min)) return '';
    if (min < 2)    return 'ora';
    if (min < 60)   return `${Math.round(min)}m fa`;
    if (min < 1440) return `${Math.round(min/60)}h fa`;
    return `${Math.round(min/1440)}g fa`;
  }

  function injectCSS() {
    if (document.getElementById('dm-style')) return;
    const s = document.createElement('style');
    s.id = 'dm-style';
    s.textContent = `
      #data-monitor-bar {
        box-sizing: border-box;
        width: 100%;
        background: #07110d;
        border-bottom: 1px solid #1e3a2e;
        padding: 0 12px;
        height: 32px;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        gap: 0;
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        font-size: 11px;
        white-space: nowrap;
        scrollbar-width: none;
        -ms-overflow-style: none;
        z-index: 900;
      }
      #data-monitor-bar::-webkit-scrollbar { display: none; }

      #data-monitor-bar .dm-title {
        color: #4ade80;
        font-weight: 700;
        font-size: 10px;
        letter-spacing: 1.5px;
        margin-right: 10px;
        flex-shrink: 0;
        opacity: 0.8;
      }
      #data-monitor-bar .dm-cell {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 0 11px;
        border-right: 1px solid #1e3a2e;
        flex-shrink: 0;
        height: 100%;
        cursor: default;
      }
      #data-monitor-bar .dm-cell:last-of-type { border-right: none; }

      /* LABEL: bianca, visibile */
      #data-monitor-bar .dm-lbl {
        color: #e2e8f0;
        font-size: 10.5px;
        font-weight: 500;
      }
      /* TIMESTAMP: colorato per freschezza */
      #data-monitor-bar .dm-ts {
        font-size: 10.5px;
        font-weight: 600;
        color: #94a3b8;
      }
      #data-monitor-bar .dm-ok    .dm-ts { color: #4ade80; }
      #data-monitor-bar .dm-warn  .dm-ts { color: #fbbf24; }
      #data-monitor-bar .dm-old   .dm-ts { color: #f97316; }
      #data-monitor-bar .dm-stale .dm-ts { color: #f87171; }

      /* "X min fa" — testo secondario bianco basso contrasto */
      #data-monitor-bar .dm-ago {
        color: #64748b;
        font-size: 9.5px;
      }
      #data-monitor-bar .dm-refresh {
        margin-left: auto;
        padding-left: 12px;
        color: #4ade80;
        cursor: pointer;
        font-size: 10px;
        flex-shrink: 0;
        user-select: none;
        opacity: 0.6;
      }
      #data-monitor-bar .dm-refresh:hover { opacity: 1; }
    `;
    document.head.appendChild(s);
  }

  function buildBar() {
    const bar = document.createElement('div');
    bar.id = 'data-monitor-bar';
    bar.innerHTML =
      `<span class="dm-title">LIVE</span>` +
      PAGES.map(p =>
        `<div class="dm-cell" id="dm-cell-${p.key}">` +
          `<span class="dm-lbl">${p.label}</span>` +
          `<span class="dm-ts" id="dm-ts-${p.key}">⏳</span>` +
          `<span class="dm-ago" id="dm-ago-${p.key}"></span>` +
        `</div>`
      ).join('') +
      `<span class="dm-refresh" id="dm-refresh" title="Aggiorna">↻ <span id="dm-refreshed">—</span></span>`;
    return bar;
  }

  async function refresh() {
    // Fetch tutti i file unici
    const cache = {};
    await Promise.allSettled(
      UNIQUE_FILES.map(f =>
        fetch(`${basePath}data/${f}?_=${Date.now()}`)
          .then(r => r.json())
          .then(d => { cache[f] = d; })
          .catch(() => { cache[f] = null; })
      )
    );

    // Aggiorna ogni cella
    PAGES.forEach(p => {
      const data = cache[p.file];
      const iso  = data ? data[p.field] : null;
      const age  = ageMin(iso);
      const st   = statusFor(age);

      const cell = document.getElementById(`dm-cell-${p.key}`);
      const ts   = document.getElementById(`dm-ts-${p.key}`);
      const ago  = document.getElementById(`dm-ago-${p.key}`);
      if (!cell) return;

      cell.className = `dm-cell ${st.cls}`;
      if (ts)  ts.textContent  = `${st.dot} ${fmtBar(iso)}`;
      if (ago) ago.textContent = fmtAgo(age);
    });

    // Orario ultimo refresh
    const el = document.getElementById('dm-refreshed');
    if (el) {
      el.textContent = new Date().toLocaleTimeString('it-IT', {
        hour: '2-digit', minute: '2-digit', timeZone: TZ
      });
    }

    // Imposta window._liveTs per i renderer JS interni
    const mkt     = cache['market_data.json'];
    const pnlD    = cache['portfolio_pnl.json'];
    const ins     = cache['insider_data.json'];
    const geo     = cache['geopolitical_data.json'];
    window._liveTs = {
      market:  fmtFull(mkt?.lastUpdated),
      pnl:     fmtFull(pnlD?.lastUpdated),
      insider: fmtFull(ins?.lastUpdated),
      geo:     fmtFull(geo?.lastUpdated),
    };

    // Aggiorna sidebar #last-update con il timestamp più rilevante per la pagina corrente
    const sidebar = document.getElementById('last-update');
    if (sidebar) {
      const path = window.location.pathname;
      let ts = mkt?.lastUpdated;
      if (/fondi|money/.test(path))      ts = ins?.lastUpdated  || ts;
      else if (/geopolit/.test(path))    ts = geo?.lastUpdated  || ts;
      else if (/portfolio/.test(path))   ts = pnlD?.lastUpdated || ts;
      sidebar.textContent = fmtFull(ts);
    }

    // Aggiorna elementi inline nelle pagine
    [
      ['intelligence-ts', fmtFull(mkt?.lastUpdated)],
      ['geo-last-ts',     fmtFull(geo?.lastUpdated)],
      ['screener-last-ts',fmtFull(mkt?.lastUpdated)],
    ].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val) el.textContent = val;
    });

    const fondiDis = document.getElementById('fondi-disclaimer');
    if (fondiDis && ins?.lastUpdated) {
      const strong = fondiDis.querySelector('strong');
      if (strong) strong.textContent = fmtFull(ins.lastUpdated);
    }
  }

  function inject() {
    if (document.getElementById('data-monitor-bar')) return;
    injectCSS();
    const bar = buildBar();

    const container =
      document.querySelector('.main-area') ||
      document.querySelector('.main-content') ||
      document.querySelector('main') ||
      document.body;
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
