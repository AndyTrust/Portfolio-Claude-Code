// ═══════════════════════════════════════════════════════════════
// AUTO-BACKUP SYSTEM v1.0
// Salva automaticamente operazioni e portfolio su:
//  1. localStorage (3 chiavi ridondanti)
//  2. Server locale (save-server.js) se attivo
//  3. Download manuale con un click
// ═══════════════════════════════════════════════════════════════

const BACKUP_KEYS = {
  operazioni:  'dashboard_operazioni',
  operazioni_bk1: 'dashboard_operazioni_backup_1',
  operazioni_bk2: 'dashboard_operazioni_backup_2',
  sectors:     'dashboard_sectors_v3',
  sectors_bk:  'dashboard_sectors_backup',
  meta:        'dashboard_backup_meta'
};

const SAVE_SERVER_URL = 'http://localhost:3741/save';
let _backupServerActive = false;
let _backupPendingTimer = null;
let _opCountAtLastBackup = -1;

// ── 1. Testa se il save-server è attivo ──────────────────────────
async function checkSaveServer() {
  try {
    const r = await fetch('http://localhost:3741/ping', { method: 'GET', signal: AbortSignal.timeout(800) });
    _backupServerActive = r.ok;
  } catch(e) {
    _backupServerActive = false;
  }
  updateBackupStatusBadge();
  return _backupServerActive;
}

// ── 2. Backup triplo su localStorage ─────────────────────────────
function backupToLocalStorage() {
  try {
    const op = JSON.parse(localStorage.getItem(BACKUP_KEYS.operazioni) || '[]');
    const sec = JSON.parse(localStorage.getItem(BACKUP_KEYS.sectors) || '[]');
    const meta = {
      date: new Date().toISOString(),
      op_count: op.length,
      sectors_count: sec.length,
      version: 'v3'
    };
    localStorage.setItem(BACKUP_KEYS.operazioni_bk1, JSON.stringify(op));
    localStorage.setItem(BACKUP_KEYS.operazioni_bk2, JSON.stringify(op));
    localStorage.setItem(BACKUP_KEYS.sectors_bk, JSON.stringify(sec));
    localStorage.setItem(BACKUP_KEYS.meta, JSON.stringify(meta));
    return true;
  } catch(e) {
    console.warn('[AutoBackup] localStorage backup failed:', e);
    return false;
  }
}

// ── 3. Backup su save-server (Node.js locale) ─────────────────────
async function backupToServer() {
  if (!_backupServerActive) return false;
  try {
    const op = JSON.parse(localStorage.getItem(BACKUP_KEYS.operazioni) || '[]');
    const sec = JSON.parse(localStorage.getItem(BACKUP_KEYS.sectors) || '[]');
    const payload = {
      timestamp: new Date().toISOString(),
      operazioni: op,
      sectors: sec
    };
    const r = await fetch(SAVE_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (r.ok) {
      console.log(`[AutoBackup] ✅ Salvato su file: ${op.length} operazioni, ${sec.length} settori`);
      return true;
    }
  } catch(e) {
    // Server non attivo — silenzioso
  }
  return false;
}

// ── 4. Backup completo (localStorage + server) ────────────────────
async function runFullBackup(source = 'auto') {
  const lsOk = backupToLocalStorage();
  const serverOk = await backupToServer();
  const op = JSON.parse(localStorage.getItem(BACKUP_KEYS.operazioni) || '[]');
  _opCountAtLastBackup = op.length;
  updateBackupStatusBadge(lsOk, serverOk, source, op.length);
  return { lsOk, serverOk };
}

// ── 5. Trigger debounced (chiamato da saveOperazioni) ─────────────
function triggerAutoBackup(source = 'save') {
  clearTimeout(_backupPendingTimer);
  _backupPendingTimer = setTimeout(() => runFullBackup(source), 500);
}

// ── 6. Download manuale CSV + JSON ───────────────────────────────
function downloadBackupCSV() {
  const op = JSON.parse(localStorage.getItem(BACKUP_KEYS.operazioni) || '[]');
  if (!op.length) { alert('Nessuna operazione da esportare.'); return; }
  const headers = 'Data,Ticker,Nome,Settore,Tipo,Valuta,Prezzo,Qty,Lordo,Comm,Netto,Note';
  const rows = op.map(o => [
    o.data, o.ticker, `"${(o.nome||'').replace(/"/g,'""')}"`,
    `"${(o.settore||'').replace(/"/g,'""')}"`,
    o.tipo, o.valuta||'EUR',
    o.prezzo, o.qty,
    (o.totale||(o.prezzo*o.qty)).toFixed(2),
    o.comm, (o.totaleNetto||(o.totale+o.comm)).toFixed(2),
    `"${(o.note||'').replace(/"/g,'""')}"`
  ].join(','));
  const csv = headers + '\n' + rows.join('\n');
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  _download(`operazioni_backup_${date}.csv`, csv, 'text/csv');
}

function downloadBackupJSON() {
  const op = JSON.parse(localStorage.getItem(BACKUP_KEYS.operazioni) || '[]');
  const sec = JSON.parse(localStorage.getItem(BACKUP_KEYS.sectors) || '[]');
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 'v3',
    operazioni: op,
    sectors: sec
  };
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  _download(`portfolio_backup_${date}.json`, JSON.stringify(payload, null, 2), 'application/json');
}

function _download(filename, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ── 7. Ripristino da JSON ─────────────────────────────────────────
function restoreFromJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.operazioni && !data.sectors) {
        alert('File non valido: mancano operazioni o settori'); return;
      }
      if (data.operazioni) {
        localStorage.setItem(BACKUP_KEYS.operazioni, JSON.stringify(data.operazioni));
        localStorage.setItem(BACKUP_KEYS.operazioni_bk1, JSON.stringify(data.operazioni));
      }
      if (data.sectors) {
        localStorage.setItem(BACKUP_KEYS.sectors, JSON.stringify(data.sectors));
      }
      alert(`✅ Ripristino completato: ${data.operazioni?.length || 0} operazioni, ${data.sectors?.length || 0} settori. Ricarica la pagina.`);
      location.reload();
    } catch(err) {
      alert('❌ Errore nel file di backup: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ── 8. Ripristina da backup localStorage di emergenza ─────────────
function restoreFromLocalStorageBackup() {
  const main = localStorage.getItem(BACKUP_KEYS.operazioni);
  const bk1 = localStorage.getItem(BACKUP_KEYS.operazioni_bk1);
  const bk2 = localStorage.getItem(BACKUP_KEYS.operazioni_bk2);
  const candidates = [main, bk1, bk2].filter(Boolean).map(s => { try { return JSON.parse(s); } catch(e) { return null; }}).filter(Boolean);
  const best = candidates.reduce((a,b) => (b.length > a.length ? b : a), []);
  if (!best.length) { alert('Nessun backup trovato nel localStorage.'); return; }
  localStorage.setItem(BACKUP_KEYS.operazioni, JSON.stringify(best));
  alert(`✅ Recuperato backup con ${best.length} operazioni. Ricarica la pagina.`);
  location.reload();
}

// ── 9. Status badge nell'header ──────────────────────────────────
function updateBackupStatusBadge(lsOk, serverOk, source, opCount) {
  const badge = document.getElementById('backup-status-badge');
  if (!badge) return;
  const now = new Date().toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'});
  if (serverOk) {
    badge.innerHTML = `💾 Backup: <span style="color:#4ade80">FILE ✓</span> + LS ✓ · ${opCount} op · ${now}`;
    badge.title = 'Dati salvati su file tramite save-server + localStorage';
  } else if (lsOk) {
    badge.innerHTML = `💾 Backup: <span style="color:#fbbf24">LS ✓</span> (server offline) · ${opCount} op · ${now}`;
    badge.title = 'Dati salvati in localStorage. Avvia save-server.js per backup su file.';
  } else if (_backupServerActive === false && lsOk === undefined) {
    // Init
    const meta = JSON.parse(localStorage.getItem(BACKUP_KEYS.meta) || '{}');
    const opCount2 = JSON.parse(localStorage.getItem(BACKUP_KEYS.operazioni) || '[]').length;
    badge.innerHTML = `💾 ${opCount2} op · <span style="color:#94a3b8">last: ${meta.date ? new Date(meta.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}) : 'mai'}</span>`;
  }
}

// ── 10. Crea il pannello di backup nell'header ────────────────────
function injectBackupPanel() {
  // Aggiungi badge all'header
  const headerActions = document.querySelector('.header-actions');
  if (headerActions && !document.getElementById('backup-status-badge')) {
    const badge = document.createElement('span');
    badge.id = 'backup-status-badge';
    badge.style.cssText = 'font-size:10px;color:var(--muted);padding:4px 8px;background:rgba(255,255,255,.05);border-radius:4px;border:1px solid rgba(255,255,255,.08);white-space:nowrap;cursor:pointer;';
    badge.title = 'Clicca per aprire pannello backup';
    badge.onclick = toggleBackupPanel;
    headerActions.insertBefore(badge, headerActions.firstChild);
  }

  // Pannello di backup
  if (!document.getElementById('backup-panel')) {
    const panel = document.createElement('div');
    panel.id = 'backup-panel';
    panel.style.cssText = `
      display:none; position:fixed; top:52px; right:10px; z-index:9999;
      background:var(--card); border:1px solid var(--border); border-radius:10px;
      padding:16px; min-width:320px; box-shadow:0 8px 32px rgba(0,0,0,.4);
    `;
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h4 style="margin:0;font-size:13px;font-weight:700;">💾 Backup & Ripristino Dati</h4>
        <button onclick="toggleBackupPanel()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;">✕</button>
      </div>
      <div id="backup-server-status" style="font-size:11px;color:var(--muted);margin-bottom:12px;padding:6px 8px;background:rgba(0,0,0,.2);border-radius:6px;">
        🔌 Controllo save-server...
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <button class="btn sm" onclick="downloadBackupCSV()" style="text-align:left;">📄 Scarica CSV operazioni</button>
        <button class="btn sm" onclick="downloadBackupJSON()" style="text-align:left;">📦 Scarica backup completo JSON</button>
        <div style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px;">
          <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:6px;">📥 Ripristina da file JSON:</label>
          <input type="file" id="restore-file-input" accept=".json" style="font-size:11px;color:var(--text);width:100%;" onchange="restoreFromJSON(this.files[0])"/>
        </div>
        <button class="btn secondary sm" onclick="restoreFromLocalStorageBackup()" style="text-align:left;">🔄 Recupera da backup localStorage</button>
        <div style="font-size:10px;color:var(--dim);border-top:1px solid var(--border);padding-top:8px;margin-top:4px;">
          Per backup automatico su file: avvia <code style="background:rgba(255,255,255,.08);padding:1px 4px;border-radius:3px;">node scripts/save-server.js</code> dal terminale.
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  // Aggiorna status badge all'avvio
  updateBackupStatusBadge();

  // Controlla save-server
  checkSaveServer().then(active => {
    const div = document.getElementById('backup-server-status');
    if (div) {
      div.innerHTML = active
        ? '🟢 <strong>Save-server attivo</strong> — backup automatico su file abilitato'
        : '🟡 <strong>Save-server offline</strong> — solo localStorage. Avvia <code>node scripts/save-server.js</code>';
    }
  });
}

function toggleBackupPanel() {
  const p = document.getElementById('backup-panel');
  if (p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

// ── 11. Hook su saveOperazioni ────────────────────────────────────
// Chiamato DOPO ogni saveOperazioni() nell'app originale
function onOperazioniSaved() {
  triggerAutoBackup('op-save');
}

// ── 12. Auto-backup periodico ogni 5 minuti ───────────────────────
function startPeriodicBackup() {
  setInterval(() => {
    const op = JSON.parse(localStorage.getItem(BACKUP_KEYS.operazioni) || '[]');
    if (op.length !== _opCountAtLastBackup) {
      runFullBackup('periodic');
    }
  }, 5 * 60 * 1000);
}

// ── 13. Backup prima di chiudere la pagina ────────────────────────
window.addEventListener('beforeunload', () => {
  backupToLocalStorage(); // sincrono, non richiede await
});

// ── 14. Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectBackupPanel();
  startPeriodicBackup();
  // Primo backup automatico dopo 2 secondi (dopo init dell'app)
  setTimeout(() => runFullBackup('init'), 2000);
});
