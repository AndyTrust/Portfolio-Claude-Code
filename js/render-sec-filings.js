// ═══════════════════════════════════════════════════════════════
// SEC FILINGS RENDERER — mostra filing EDGAR + IR press release
// Legge: data/sec_filings.json (generato da sec_ir_monitor.py)
// ═══════════════════════════════════════════════════════════════

const SEC_ANALYSIS = {
  TSLA: {
    '8-K':   { action: 'ASPETTA', color: '#f59e0b', note: 'Earnings Q1: EPS $0.41 beat. Ma deliveries -13% YoY. Catalyst: Cybercab agosto 2026.' },
    '10-Q':  { action: 'MONITORA', color: '#6b7280', note: 'Report trimestrale Q1 depositato. Leggere margini e CAPEX guidance.' },
    '10-K':  { action: 'NEUTRO', color: '#6b7280', note: 'Annual report 2025. 10-K/A = emendamento minore.' },
    default: { action: 'MONITORA', color: '#6b7280', note: 'Filing tecnico — nessuna azione immediata.' },
  },
  BLK: {
    '8-K':   { action: 'ACCUMULA', color: '#10b981', note: 'Q1 RECORD: EPS $12.53 adj +11% YoY, $130Mld inflows, revenue +27%, dividendo +10% → $5.73/trim.' },
    default: { action: 'ACCUMULA', color: '#10b981', note: 'Fondamentali eccezionali Q1 2026.' },
  },
  CRWV: {
    '8-K':   { action: 'ATTENZIONE', color: '#ef4444', note: '$4Mld debito emesso in aprile al 9.75%. Profit margin -23%. Lock-up set 2026. NON aumentare.' },
    default: { action: 'ATTENZIONE', color: '#ef4444', note: 'Rischio finanziario crescente. Monitorare guidance profittabilità.' },
  },
  CRSP: {
    '10-Q':  { action: 'ASPETTA', color: '#f59e0b', note: 'Q1 2026 non ancora depositato (scadenza 15 mag). Aspettare prima di aumentare.' },
    '8-K':   { action: 'MONITORA', color: '#6b7280', note: 'Evento materiale. Leggere contenuto per determinare impatto.' },
    default: { action: 'ASPETTA', color: '#f59e0b', note: 'Nessun report Q1 ancora. Runway 4+ anni garantito.' },
  },
  ACHR: {
    '8-K':   { action: 'MONITORA', color: '#6b7280', note: 'FAA certification progress. CEO Goldstein ha comprato $2.7M open market 23/04 — segnale forte.' },
    default: { action: 'ACCUMULA', color: '#10b981', note: '100% FAA Means of Compliance accettati. Certificazione Type Q3 2026.' },
  },
  TEM: {
    default: { action: 'MONITORA', color: '#6b7280', note: 'CEO Lefkofsky $9.6M acquisto 23/04. AstraZeneca $200M. +29.8% da PMC.' },
  },
};

function _secAction(ticker, formType) {
  const ta = SEC_ANALYSIS[ticker];
  if (!ta) return { action: 'MONITORA', color: '#6b7280', note: 'Filing registrato su EDGAR.' };
  return ta[formType] || ta.default || { action: 'MONITORA', color: '#6b7280', note: '' };
}

function _priorityBadge(priority) {
  if (priority === 'ALTA')  return `<span style="background:#ef444422;color:#ef4444;border:1px solid #ef444440;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700;">ALTA</span>`;
  if (priority === 'MEDIA') return `<span style="background:#f59e0b22;color:#f59e0b;border:1px solid #f59e0b40;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700;">MEDIA</span>`;
  return `<span style="background:#6b728022;color:#9ca3af;border:1px solid #6b728040;font-size:10px;padding:2px 7px;border-radius:4px;">BASSA</span>`;
}

function _formBadge(form) {
  const colors = {
    '8-K': '#ef4444', '8-K/A': '#f87171',
    '10-Q': '#3b82f6', '10-K': '#6366f1', '10-K/A': '#818cf8',
    '13F-HR': '#8b5cf6', 'SC 13D': '#f59e0b', 'SC 13G': '#f59e0b',
    'DEF 14A': '#6b7280', '4': '#9ca3af',
  };
  const c = colors[form] || '#6b7280';
  return `<span style="background:${c}22;color:${c};border:1px solid ${c}40;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700;font-family:monospace;">${form}</span>`;
}

function renderSecFilings() {
  const container = document.getElementById('sec-filings-container');
  if (!container) return;

  const data = window._secFilingsData;
  if (!data) {
    container.innerHTML = `<div style="color:var(--dim);font-size:13px;padding:20px 0;text-align:center;">⏳ Caricamento filing SEC in corso...</div>`;
    return;
  }

  const REAL = ['TSLA','BLK','TEM','ACHR','CRSP','CRWV'];

  // ── Header stats ──────────────────────────────────────────────
  const stats = data.stats || {};
  const totalFilings = data.filings?.length || 0;
  const totalIR = data.ir_releases?.length || 0;
  const highPrio = (data.filings || []).filter(f => f.priority === 'ALTA' && REAL.includes(f.ticker)).length;
  const lastUpd = data.lastUpdated ? new Date(data.lastUpdated).toLocaleString('it-IT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';

  let html = `
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:18px;">
    <div class="stat-mini"><div class="stat-mini-val">${totalFilings}</div><div class="stat-mini-label">Filing totali (60gg)</div></div>
    <div class="stat-mini"><div class="stat-mini-val" style="color:#ef4444;">${highPrio}</div><div class="stat-mini-label">Alta priorità (portfolio)</div></div>
    <div class="stat-mini"><div class="stat-mini-val">${totalIR}</div><div class="stat-mini-label">IR Press Release</div></div>
    <div class="stat-mini"><div class="stat-mini-val" style="font-size:11px;">${lastUpd}</div><div class="stat-mini-label">Ultimo aggiornamento</div></div>
  </div>`;

  // ── Per ogni ticker reale ─────────────────────────────────────
  for (const ticker of REAL) {
    const tFilings = (data.filings || []).filter(f => f.ticker === ticker);
    const tIR = (data.ir_releases || []).filter(r => r.ticker === ticker);
    const s = stats[ticker] || {};
    const analysis = _secAction(ticker, tFilings[0]?.form_type || '');

    if (!tFilings.length && !tIR.length) continue;

    html += `
    <div class="card" style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <strong style="font-size:16px;">${ticker}</strong>
          <span style="background:${analysis.color}22;color:${analysis.color};border:1px solid ${analysis.color}40;font-size:11px;padding:3px 10px;border-radius:6px;font-weight:700;">${analysis.action}</span>
          <span style="font-size:11px;color:var(--dim);">${s.total_filings||0} filing | ultimo: ${s.last_filing||'—'}</span>
        </div>
        <div style="font-size:11px;color:var(--muted);max-width:420px;text-align:right;">${analysis.note}</div>
      </div>`;

    // Filing SEC
    if (tFilings.length) {
      html += `<div style="font-size:11px;font-weight:700;color:var(--dim);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">📋 SEC EDGAR Filing</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">`;

      for (const f of tFilings.slice(0, 6)) {
        const items = (f.items || []).slice(0, 2).map(i => `<span style="color:var(--muted);font-size:10px;">${i.replace('Item ','Item ')}</span>`).join(' • ');
        html += `
        <div style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;background:var(--bg-card2);border-radius:7px;border-left:3px solid ${f.priority==='ALTA'?'#ef4444':f.priority==='MEDIA'?'#f59e0b':'#374151'};">
          <div style="min-width:54px;">${_formBadge(f.form_type)}</div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
              ${_priorityBadge(f.priority)}
              <span style="font-size:11px;color:var(--dim);">${f.filed_date||'—'}</span>
              ${f.filing_url ? `<a href="${f.filing_url}" target="_blank" style="font-size:10px;color:#3b82f6;margin-left:4px;">EDGAR ↗</a>` : ''}
            </div>
            ${items ? `<div style="margin-top:3px;">${items}</div>` : ''}
            ${f.exhibit_snippet ? `<div style="margin-top:5px;font-size:11px;color:var(--muted);line-height:1.5;border-top:1px solid var(--border);padding-top:5px;">📄 ${f.exhibit_snippet}</div>` : ''}
          </div>
        </div>`;
      }
      html += `</div>`;
    }

    // IR Releases
    if (tIR.length) {
      html += `<div style="font-size:11px;font-weight:700;color:var(--dim);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">📰 Press Release IR</div>
      <div style="display:flex;flex-direction:column;gap:5px;">`;
      for (const r of tIR.slice(0, 4)) {
        html += `
        <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--bg-card2);border-radius:7px;">
          <span style="font-size:14px;">${r.icon||'📄'}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.title||'—'}</div>
            <div style="font-size:10px;color:var(--dim);margin-top:1px;">${r.date||'—'} · ${r.source||'IR'}</div>
          </div>
          ${r.url ? `<a href="${r.url}" target="_blank" style="font-size:10px;color:#3b82f6;white-space:nowrap;">Leggi ↗</a>` : ''}
        </div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
  }

  // ── Watchlist filing alta priorità ────────────────────────────
  const watchHighPrio = (data.filings || []).filter(f => !REAL.includes(f.ticker) && f.priority === 'ALTA');
  if (watchHighPrio.length) {
    html += `
    <div class="card" style="margin-bottom:12px;">
      <div style="font-size:13px;font-weight:700;margin-bottom:10px;">👁️ Watchlist — Filing Alta Priorità</div>
      <div style="display:flex;flex-direction:column;gap:5px;">`;
    for (const f of watchHighPrio.slice(0, 8)) {
      const items = (f.items||[]).slice(0,1).map(i=>`<span style="font-size:10px;color:var(--muted);">${i}</span>`).join('');
      html += `
      <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--bg-card2);border-radius:7px;">
        <strong style="min-width:40px;font-size:12px;">${f.ticker}</strong>
        ${_formBadge(f.form_type)}
        <span style="font-size:11px;color:var(--dim);">${f.filed_date||'—'}</span>
        ${items}
        ${f.filing_url ? `<a href="${f.filing_url}" target="_blank" style="font-size:10px;color:#3b82f6;margin-left:auto;">↗</a>` : ''}
      </div>`;
    }
    html += `</div></div>`;
  }

  // ── Footer CIK map ────────────────────────────────────────────
  const cikMap = data.cik_map || {};
  const cikLinks = REAL.map(t => cikMap[t] ? `<a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cikMap[t]}&type=8-K&dateb=&owner=include&count=10" target="_blank" style="color:#3b82f6;font-size:11px;">${t}</a>` : t).join(' · ');
  html += `
  <div style="font-size:11px;color:var(--dim);margin-top:4px;padding:8px 0;border-top:1px solid var(--border);">
    🔗 EDGAR diretto: ${cikLinks} ·
    <a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=8-K&dateb=&owner=include&count=10&search_text=&action=getcompany" target="_blank" style="color:#3b82f6;">EDGAR Search ↗</a> ·
    Aggiornato: ${lastUpd}
  </div>`;

  container.innerHTML = html;
}

// Carica sec_filings.json e renderizza
async function initSecFilings() {
  const container = document.getElementById('sec-filings-container');
  if (!container) return;
  try {
    const data = await fetch('data/sec_filings.json').then(r => r.json());
    window._secFilingsData = data;
    renderSecFilings();
  } catch(e) {
    if (container) container.innerHTML = `<div style="color:var(--dim);font-size:13px;padding:16px;">⚠️ Filing SEC non disponibili — verifica che il monitor VPS sia attivo.</div>`;
  }
}
