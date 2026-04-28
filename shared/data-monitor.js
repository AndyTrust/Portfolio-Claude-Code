// data-monitor.js — Barra stato dati + aggiornamento timestamp interno pagine
(function () {
  'use strict';

  const basePath = window.location.pathname.includes('/pages/') ? '../' : '';

  const SOURCES = [
    { key: 'market',  label: '📊 Prezzi',  file: 'market_data.json',       field: 'lastUpdated' },
    { key: 'pnl',     label: '💼 P&L',     file: 'portfolio_pnl.json',     field: 'lastUpdated' },
    { key: 'insider', label: '👁 Insider', file: 'insider_data.json',      field: 'lastUpdated' },
    { key: 'geo',     label: '🌍 Geo',     file: 'geopolitical_data.json', field: 'lastUpdated' },
  ];

  // Stessa formattazione di _fmtTs in app.js
  function fmtFull(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('it-IT', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch(e) { return iso; }
  }

  // Formato compatto per la barra
  function fmtBar(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const pad = n => String(n).padStart(2,'0');
    return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth()+1)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
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
        border-bottom: 1px solid #1a3028;
        padding: 0 14px;
        height: 30px;
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
      }
      #data-monitor-bar::-webkit-scrollbar { display: none; }

      #data-monitor-bar .dm-title {
        color: #4ade80;
        font-weight: 700;
        font-size: 10px;
        letter-spacing: 1px;
        margin-right: 12px;
        flex-shrink: 0;
      }
      #data-monitor-bar .dm-cell {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0 12px;
        border-right: 1px solid #1a3028;
        flex-shrink: 0;
        height: 100%;
      }
      #data-monitor-bar .dm-cell:last-of-type { border-right: none; }
      #data-monitor-bar .dm-lbl {
        color: #475569;
        font-size: 10px;
      }
      #data-monitor-bar .dm-dot { font-size: 9px; }
      #data-monitor-bar .dm-ts  { font-weight: 600; }
      #data-monitor-bar .dm-ok    .dm-ts { color: #4ade80; }
      #data-monitor-bar .dm-warn  .dm-ts { color: #fbbf24; }
      #data-monitor-bar .dm-old   .dm-ts { color: #f97316; }
      #data-monitor-bar .dm-stale .dm-ts { color: #f87171; }
      #data-monitor-bar .dm-ago {
        color: #2d4a3e;
        font-size: 9.5px;
      }
      #data-monitor-bar .dm-refresh {
        margin-left: auto;
        padding-left: 14px;
        color: #2d4a3e;
        cursor: pointer;
        font-size: 10px;
        flex-shrink: 0;
        user-select: none;
      }
      #data-monitor-bar .dm-refresh:hover { color: #4ade80; }
    `;
    document.head.appendChild(s);
  }

  function buildBar() {
    const bar = document.createElement('div');
    bar.id = 'data-monitor-bar';
    bar.innerHTML =
      `<span class="dm-title">DATA STATUS</span>` +
      SOURCES.map(s =>
        `<div class="dm-cell" id="dm-cell-${s.key}">` +
        `<span class="dm-lbl">${s.label}</span>` +
        `<span class="dm-dot" id="dm-dot-${s.key}">⏳</span>` +
        `<span class="dm-ts"  id="dm-ts-${s.key}">—</span>` +
        `<span class="dm-ago" id="dm-ago-${s.key}"></span>` +
        `</div>`
      ).join('') +
      `<span class="dm-refresh" id="dm-refresh">↻ <span id="dm-refreshed">—</span></span>`;
    return bar;
  }

  // Aggiorna barra + window._liveTs + sidebar + elementi interni pagina
  async function refresh() {
    const fetched = {};

    await Promise.allSettled(
      SOURCES.map(s =>
        fetch(`${basePath}data/${s.file}?_=${Date.now()}`)
          .then(r => r.json())
          .then(d => { fetched[s.key] = d[s.field] || null; })
          .catch(() => { fetched[s.key] = null; })
      )
    );

    // 1. Aggiorna barra visuale
    SOURCES.forEach(s => {
      const iso  = fetched[s.key];
      const age  = ageMin(iso);
      const st   = statusFor(age);
      const cell = document.getElementById(`dm-cell-${s.key}`);
      const dot  = document.getElementById(`dm-dot-${s.key}`);
      const ts   = document.getElementById(`dm-ts-${s.key}`);
      const ago  = document.getElementById(`dm-ago-${s.key}`);
      if (!cell) return;
      cell.className = `dm-cell ${st.cls}`;
      if (dot) dot.textContent = st.dot;
      if (ts)  ts.textContent  = fmtBar(iso);
      if (ago) ago.textContent = fmtAgo(age);
    });

    const refreshed = document.getElementById('dm-refreshed');
    if (refreshed) {
      const n = new Date();
      refreshed.textContent =
        `${String(n.getUTCHours()).padStart(2,'0')}:${String(n.getUTCMinutes()).padStart(2,'0')} UTC`;
    }

    // 2. Imposta window._liveTs nel formato usato dai renderer (es. render-intelligence.js)
    window._liveTs = {
      market:  fmtFull(fetched.market),
      pnl:     fmtFull(fetched.pnl),
      insider: fmtFull(fetched.insider),
      geo:     fmtFull(fetched.geo),
    };

    // 3. Aggiorna sidebar #last-update (elemento comune a tutte le pagine)
    const sidebarTs = document.getElementById('last-update');
    if (sidebarTs) {
      // Usa il timestamp più rilevante per questa pagina
      const path = window.location.pathname;
      let ts = fetched.market;
      if (path.includes('insider') || path.includes('fondi') || path.includes('money'))
        ts = fetched.insider || fetched.market;
      else if (path.includes('geopolit'))
        ts = fetched.geo || fetched.market;
      else if (path.includes('portfolio') || path.includes('Protfolio'))
        ts = fetched.pnl || fetched.market;
      sidebarTs.textContent = fmtFull(ts);
    }

    // 4. Aggiorna elementi inline nelle pagine che li espongono
    const maps = [
      // intelligence-ts nel header Intelligence
      { id: 'intelligence-ts',   val: fmtFull(fetched.market)  },
      // fondi-disclaimer con timestamp insider
      { id: 'fondi-disclaimer',  val: null }, // gestito separatamente sotto
      // geo-ts custom se esiste
      { id: 'geo-last-ts',       val: fmtFull(fetched.geo)     },
      // screener-ts custom se esiste
      { id: 'screener-last-ts',  val: fmtFull(fetched.market)  },
    ];
    maps.forEach(({ id, val }) => {
      if (!val) return;
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });

    // Fondi disclaimer: aggiorna solo il timestamp, non il testo intero
    const fondiDis = document.getElementById('fondi-disclaimer');
    if (fondiDis && fetched.insider) {
      const insTs = fmtFull(fetched.insider);
      // Aggiorna solo il <strong> dentro il disclaimer se esiste
      const strong = fondiDis.querySelector('strong');
      if (strong) strong.textContent = insTs;
    }

    // 5. Re-renderizza sezioni che usano _liveTs, se i render sono disponibili
    if (typeof renderGeopolitica === 'function') {
      if (fetched.geo) window._geoLastUpdated = fmtFull(fetched.geo);
      // Non ri-renderizza per intero, aggiorna solo il badge geo se esiste
    }
    if (typeof renderIntelligence === 'function' && document.getElementById('intelligence-ts')) {
      renderIntelligence();
    }
  }

  function inject() {
    if (document.getElementById('data-monitor-bar')) return;
    injectCSS();
    const bar = buildBar();

    // Inserisce prima del contenuto principale (dopo sidebar)
    const container =
      document.querySelector('.main-area') ||
      document.querySelector('.main-content') ||
      document.querySelector('main') ||
      document.body;

    if (container) container.insertBefore(bar, container.firstChild);

    // Prima lettura
    refresh();
    // Auto-refresh ogni 5 minuti
    setInterval(refresh, 5 * 60 * 1000);
    // Click manuale sul pulsante ↻
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
