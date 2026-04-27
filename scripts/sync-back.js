#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SYNC BACK — Sincronizza report JSON → file JS della dashboard
// Legge i report generati dagli altri script e aggiorna:
//   · js/holder-flow-tracker.js  (già aggiornato da fund-insider-scan.js)
//   · js/data.js                 (NEWS_DB, MARKET_DATA aggiornati)
//   · js/online-sector-map.js   (già aggiornato da update-online-sector-map.js)
// Uso:
//   node scripts/sync-back.js
//   node scripts/sync-back.js --dry-run   (solo preview, no scrittura)
// ═══════════════════════════════════════════════════════════════

'use strict';

const path = require('path');
const fs = require('fs');
const bridge = require('./state-bridge.js');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const TODAY = bridge.todayFull();

// ── Helper: legge JSON sicuro ──────────────────────────────────────
function readJSON(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch(e) { console.warn(`  ⚠️  Impossibile leggere ${path.basename(filePath)}: ${e.message}`); return fallback; }
}

// ── Genera NEWS_DB compatibile con render-intelligence.js ─────────
function buildNewsDB(intelligenceData) {
  if (!intelligenceData?.analyses) return null;

  const newsItems = [];
  let id = Date.now();

  intelligenceData.analyses.forEach(a => {
    // Segnali urgenti → news ad alto impatto
    a.signals.forEach(sig => {
      newsItems.push({
        id: id++,
        source: 'Portfolio Intelligence',
        date: TODAY,
        title: `${a.ticker}: ${sig.msg}`,
        body: `Segnale ${sig.level} per ${a.name} (${a.ticker}). Rilevato in data ${TODAY}.`,
        category: a.insiderActivity?.length > 0 ? 'insider' : 'macro',
        impact: sig.level === 'alto' ? 'alto' : sig.level === 'medio' ? 'medio' : 'basso',
        tickers: [a.ticker],
        analysis: [
          a.quote ? `Prezzo: ${a.quote.price} (${a.quote.changePct >= 0 ? '+' : ''}${a.quote.changePct}%)` : '',
          a.insiderActivity?.length ? `Form 4 insider: ${a.insiderActivity.length} filing recenti.` : '',
          a.secFilings?.length ? `Filing SEC: ${a.secFilings.map(f=>f.form).join(', ')}` : '',
          a.earnings?.earningsDate ? `Prossimi earnings: ${a.earnings.earningsDate}` : ''
        ].filter(Boolean).join(' | '),
        actions: sig.level === 'alto'
          ? `Monitorare ${a.ticker} nelle prossime 24-48h. Verificare catalizzatore su Perplexity.`
          : `Aggiornare scoring ${a.ticker} nella watchlist. Ricontrollare tra 3 giorni.`
      });
    });

    // News da finviz
    (a.news || []).slice(0, 2).forEach(n => {
      newsItems.push({
        id: id++,
        source: 'Market News',
        date: TODAY,
        title: `${a.ticker}: ${n.title}`,
        body: n.title,
        category: 'info',
        impact: 'basso',
        tickers: [a.ticker],
        analysis: n.title,
        actions: `Leggere analisi completa per ${a.ticker}.`
      });
    });
  });

  return newsItems.slice(0, 50); // Max 50 news nel DB
}

// ── Legge js/data.js e aggiorna NEWS_DB ──────────────────────────
function updateDataJS(newsItems) {
  const dataFile = path.join(bridge.JS_DIR, 'data.js');
  if (!fs.existsSync(dataFile)) {
    console.log(`  ⚠️  js/data.js non trovato, skip.`);
    return false;
  }

  let content = fs.readFileSync(dataFile, 'utf8');

  // Cerca il blocco NEWS_DB esistente
  const newsStartMarker = '// NEWS_DB_GENERATED_START';
  const newsEndMarker = '// NEWS_DB_GENERATED_END';
  const injectedBlock = `${newsStartMarker}
// Aggiornato automaticamente da sync-back.js in data ${TODAY}
const NEWS_DB_GENERATED = ${JSON.stringify(newsItems, null, 2)};
// Merge con NEWS_DB esistente (dati generati in coda)
if (typeof NEWS_DB !== 'undefined') {
  const _existingIds = new Set(NEWS_DB.map(n => n.title));
  NEWS_DB_GENERATED.forEach(n => { if (!_existingIds.has(n.title)) NEWS_DB.push(n); });
}
${newsEndMarker}`;

  let newContent;
  if (content.includes(newsStartMarker)) {
    // Sostituisce il blocco esistente
    const start = content.indexOf(newsStartMarker);
    const end = content.indexOf(newsEndMarker) + newsEndMarker.length;
    newContent = content.substring(0, start) + injectedBlock + content.substring(end);
  } else {
    // Appende in fondo
    newContent = content + '\n\n' + injectedBlock + '\n';
  }

  if (DRY_RUN) {
    console.log(`  🔍  DRY-RUN: js/data.js → ${newsItems.length} nuove news da iniettare`);
    return true;
  }

  bridge.backupFile(dataFile);
  fs.writeFileSync(dataFile, newContent);
  console.log(`  ✅  js/data.js aggiornato: ${newsItems.length} news iniettate`);
  return true;
}

// ── Verifica holder-flow-tracker.js ──────────────────────────────
function checkHolderFlowTracker() {
  const file = path.join(bridge.JS_DIR, 'holder-flow-tracker.js');
  if (!fs.existsSync(file)) {
    console.log(`  ⚠️  js/holder-flow-tracker.js non trovato. Esegui fund-insider-scan.js`);
    return false;
  }
  const stat = fs.statSync(file);
  const ageH = (Date.now() - stat.mtime.getTime()) / 3600000;
  if (ageH > 72) {
    console.log(`  ⚠️  js/holder-flow-tracker.js è vecchio di ${ageH.toFixed(0)}h. Esegui fund-insider-scan.js`);
  } else {
    console.log(`  ✅  js/holder-flow-tracker.js aggiornato ${ageH.toFixed(1)}h fa`);
  }
  return true;
}

// ── Genera summary delle modifiche ───────────────────────────────
function generateSummary(intelligence, holders) {
  const summaryFile = path.join(bridge.REPORTS_DIR, `sync_summary_${bridge.todayISO()}.md`);
  const lines = [
    `# Sync Summary — ${TODAY}`,
    '',
    `Eseguito: ${new Date().toLocaleString('it-IT')}`,
    DRY_RUN ? '**MODALITÀ DRY-RUN — Nessuna scrittura effettuata**' : '',
    '',
    '## File aggiornati'
  ];

  if (intelligence) {
    const urgent = intelligence.analyses?.filter(a=>a.signals.some(s=>s.level==='alto')).length || 0;
    lines.push(`- **js/data.js NEWS_DB**: ${intelligence.analyses?.length || 0} ticker analizzati, ${urgent} segnali urgenti`);
  }
  if (holders) {
    const acc = holders.analyses?.filter(a=>a.holderFlowSignal==='accumulation').length || 0;
    const dist = holders.analyses?.filter(a=>a.holderFlowSignal==='distribution').length || 0;
    lines.push(`- **js/holder-flow-tracker.js**: ${holders.analyses?.length || 0} ticker | 🟢 ${acc} acc | 🔴 ${dist} dist`);
  }
  lines.push('');
  lines.push('## Azione richiesta');
  lines.push('Ricarica `Protfolio.html` nel browser per vedere i dati aggiornati.');

  if (!DRY_RUN) fs.writeFileSync(summaryFile, lines.filter(l=>l!==null).join('\n'));
  return summaryFile;
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🔄  SYNC BACK — Aggiornamento dashboard');
  console.log('─'.repeat(50));
  if (DRY_RUN) console.log('  ⚠️  DRY-RUN: preview senza scrittura\n');

  bridge.ensureReportsDir();

  let updated = 0;

  // 1. Leggi intelligence_latest.json
  const intelligenceLatest = path.join(bridge.REPORTS_DIR, 'intelligence_latest.json');
  const intelligence = readJSON(intelligenceLatest);
  if (intelligence) {
    console.log(`  📊  Intelligence trovata: ${intelligence.date} (${intelligence.analyses?.length || 0} ticker)`);
    const newsItems = buildNewsDB(intelligence);
    if (newsItems && newsItems.length > 0 && updateDataJS(newsItems)) updated++;
  } else {
    console.log(`  ⚠️  Nessun intelligence_latest.json trovato. Esegui daily-intelligence.js`);
  }

  // 2. Verifica holder-flow-tracker.js
  console.log('');
  if (checkHolderFlowTracker()) updated++;

  // 3. Leggi holders_monitor_latest.json per info
  const holdersLatest = path.join(bridge.REPORTS_DIR, 'holders_monitor_latest.json');
  const holders = readJSON(holdersLatest);
  if (holders) {
    console.log(`  📊  Holder flow trovato: ${holders.date} (${holders.analyses?.length || 0} ticker)`);
  }

  // 4. Genera summary
  const summaryFile = generateSummary(intelligence, holders);
  if (!DRY_RUN) console.log(`\n  📋  Summary: ${summaryFile}`);

  console.log('');
  console.log(`  ✅  Sync completato (${updated} file aggiornati)`);
  console.log('  🌐  Ricarica Protfolio.html nel browser per vedere i dati aggiornati.\n');
}

main().catch(e => { console.error(e); process.exit(1); });
