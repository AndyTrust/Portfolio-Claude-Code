#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SAVE-SERVER v1.0 — Server locale per backup automatico su file
// Riceve i dati dal browser via POST e li salva in Portfolio/reports/
//
// USO: node scripts/save-server.js
// (lascialo in esecuzione in background)
//
// Porta: 3741 (configurabile con PORT=XXXX)
// ═══════════════════════════════════════════════════════════════

'use strict';

const http   = require('http');
const fs     = require('fs');
const path   = require('path');

const PORT      = process.env.PORT || 3741;
const ROOT_DIR  = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT_DIR, 'reports');
const BACKUP_DIR = path.join(REPORT_DIR, 'backups');

// ── Crea cartelle se non esistono ──────────────────────────────
[REPORT_DIR, BACKUP_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ── Helper ─────────────────────────────────────────────────────
function today() { return new Date().toISOString().slice(0, 10); }
function nowISO() { return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); }

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
}

function writeCSV(filepath, operazioni) {
  const headers = 'Data,Ticker,Nome,Settore,Tipo,Valuta,Prezzo,Qty,Lordo,Comm,Netto,Note';
  const rows = (operazioni || []).map(o => {
    const lordo = o.totale || (o.prezzo * o.qty);
    const netto = o.totaleNetto || (lordo + o.comm);
    return [
      o.data, o.ticker,
      `"${(o.nome||'').replace(/"/g,'""')}"`,
      `"${(o.settore||'').replace(/"/g,'""')}"`,
      o.tipo, o.valuta||'EUR',
      o.prezzo, o.qty,
      lordo.toFixed(2), o.comm,
      netto.toFixed(2),
      `"${(o.note||'').replace(/"/g,'""')}"`
    ].join(',');
  });
  fs.writeFileSync(filepath, headers + '\n' + rows.join('\n'), 'utf8');
}

// ── Salva backup ───────────────────────────────────────────────
function saveBackup(data) {
  const d = today();
  const ts = nowISO();

  // 1. Backup giornaliero JSON (sovrascrive ogni giorno)
  const dailyJSON = path.join(REPORT_DIR, `portfolio_backup_${d}.json`);
  writeJSON(dailyJSON, data);

  // 2. CSV operazioni (sovrascrive ogni giorno)
  const dailyCSV = path.join(REPORT_DIR, `operazioni_backup_${d}.csv`);
  writeCSV(dailyCSV, data.operazioni);

  // 3. Ultimo backup (latest)
  writeJSON(path.join(REPORT_DIR, 'portfolio_backup_latest.json'), data);
  writeCSV(path.join(REPORT_DIR, 'operazioni_latest.csv'), data.operazioni);

  // 4. Archivio timestampato (ogni ora al massimo, per non creare troppi file)
  const archiveJSON = path.join(BACKUP_DIR, `backup_${ts}.json`);
  const archiveFiles = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup_')).sort();
  // Mantieni max 48 backup (48h di storia)
  if (archiveFiles.length >= 48) {
    fs.unlinkSync(path.join(BACKUP_DIR, archiveFiles[0]));
  }
  writeJSON(archiveJSON, data);

  return {
    daily_json: dailyJSON,
    daily_csv: dailyCSV,
    archive: archiveJSON,
    op_count: (data.operazioni || []).length,
    sectors_count: (data.sectors || []).length
  };
}

// ── Server HTTP ────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // CORS — permette richieste da file://
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200); res.end(); return;
  }

  // Ping
  if (req.method === 'GET' && req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'portfolio-save-server', port: PORT }));
    return;
  }

  // Salva
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 10_000_000) { res.writeHead(413); res.end('Too large'); } });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const result = saveBackup(data);
        const opCount = result.op_count;
        console.log(`  ✅  [${new Date().toLocaleTimeString('it-IT')}] Backup salvato: ${opCount} operazioni, ${result.sectors_count} settori → ${path.basename(result.daily_csv)}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, ...result }));
      } catch(e) {
        console.error('  ❌  Errore parse JSON:', e.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // Status
  if (req.method === 'GET' && req.url === '/status') {
    const files = fs.readdirSync(REPORT_DIR).filter(f => f.startsWith('operazioni_backup_')).sort().reverse();
    const latest = files[0] ? path.join(REPORT_DIR, files[0]) : null;
    const latestStat = latest ? fs.statSync(latest) : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      backup_dir: REPORT_DIR,
      latest_backup: files[0] || null,
      latest_size: latestStat ? latestStat.size : 0,
      backup_count: files.length,
      archive_count: fs.readdirSync(BACKUP_DIR).filter(f=>f.startsWith('backup_')).length
    }));
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  💾  Portfolio Save-Server v1.0                      ║');
  console.log(`║  📡  In ascolto su: http://localhost:${PORT}           ║`);
  console.log(`║  📂  Backup in:     ${path.relative(ROOT_DIR, REPORT_DIR).padEnd(30)} ║`);
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║  Ogni modifica al portfolio viene salvata su file.   ║');
  console.log('║  Lascia questa finestra aperta mentre usi il sito.   ║');
  console.log('║  Per fermare: Ctrl+C                                  ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`❌  Porta ${PORT} già in uso. Imposta PORT=XXXX per cambiare porta.`);
  } else {
    console.error('❌  Errore server:', e.message);
  }
  process.exit(1);
});
