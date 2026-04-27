#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// FUND & INSIDER SCAN — Analisi fondi istituzionali + insider
// Ogni 3 giorni. Scarica:
//   · Form 4 (insider buy/sell recenti — SEC EDGAR)
//   · 13F Holdings (posizioni fondi trimestrali — SEC EDGAR)
//   · Holder flow netto (accumulazione vs distribuzione)
// Cross-reference con portfolio watchlist
// Output:
//   · reports/fund_insider_YYYYMMDD.md
//   · reports/holders_monitor_YYYYMMDD.md
//   · reports/holders_monitor_latest.json
//   · js/holder-flow-tracker.js (aggiornato per la dashboard)
// Uso:
//   node scripts/fund-insider-scan.js
//   node scripts/fund-insider-scan.js --tickers=TSLA,NVDA,AAPL
//   node scripts/fund-insider-scan.js --days=14  (finestra temporale)
// ═══════════════════════════════════════════════════════════════

'use strict';

let fetch;
try { fetch = require('node-fetch'); }
catch(e) { console.error('❌  npm install node-fetch@2'); process.exit(1); }

const path = require('path');
const fs = require('fs');
const bridge = require('./state-bridge.js');

// ── Argomenti CLI ─────────────────────────────────────────────────
const args = process.argv.slice(2);
const tickerArg = (args.find(a => a.startsWith('--tickers=')) || '').replace('--tickers=', '');
const daysArg = parseInt((args.find(a => a.startsWith('--days=')) || '--days=21').replace('--days=', ''), 10);

// ── Carica stato ──────────────────────────────────────────────────
const state = bridge.loadState();
const fundData = bridge.getFundData(state);
bridge.ensureReportsDir();

const defaultTickers = ['TSLA','NVDA','ASML','LLY','NVO','XOM','AVGO','EQIX','BLK','AAPL','MSFT','AMZN','GOOGL','META','NFLX'];
let tickers = tickerArg
  ? tickerArg.split(',').map(t=>t.trim().toUpperCase()).filter(Boolean)
  : [...new Set([...bridge.getActiveTickers(state), ...defaultTickers])].slice(0, 25);

const TODAY = bridge.todayFull();
const TODAY_TS = bridge.todayISO();

// ── Fetch sicuro ──────────────────────────────────────────────────
async function safeFetch(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InstitutionalFlowBot/1.0; +mailto:research@portfolio)',
        'Accept': 'application/json, text/html'
      }
    });
    clearTimeout(t);
    return res;
  } catch(e) { clearTimeout(t); return null; }
}

function dateMinusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// ════════════════════════════════════════════════════════════════
// A. INSIDER — Form 4 (acquisti/vendite insider recenti)
// ════════════════════════════════════════════════════════════════
async function fetchForm4(ticker) {
  const startDt = dateMinusDays(daysArg);
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(ticker)}%22&forms=4&dateRange=custom&startdt=${startDt}&enddt=${TODAY}&_source=period_of_report,file_date,display_names,form_type,entity_name`;
  const res = await safeFetch(url);
  if (!res || !res.ok) return [];
  try {
    const data = await res.json();
    return (data.hits?.hits || []).slice(0, 10).map(hit => {
      const src = hit._source || {};
      return {
        ticker,
        type: 'form4',
        date: src.period_of_report || src.file_date || '',
        filedDate: src.file_date || '',
        insiderName: (src.display_names || []).join(', ') || 'N/D',
        entity: src.entity_name || ticker,
        accession: hit._id || ''
      };
    });
  } catch(e) { return []; }
}

// ════════════════════════════════════════════════════════════════
// B. 13F — Holdings istituzionali (CIK lookup + 13F)
// ════════════════════════════════════════════════════════════════

// Mappa CIK per i principali fondi
const MAJOR_FUNDS = {
  'Berkshire Hathaway': '0001067983',
  'BlackRock': '0001364742',
  'Vanguard': '0000102909',
  'State Street': '0000093751',
  'ARK Invest': '0001418819',
  'Bridgewater': '0001350694',
  'Renaissance Tech': '0001037389',
  'Citadel': '0000920424',
  'Point72': '0001603466',
  'Tiger Global': '0001167483'
};

async function fetch13FForFund(fundName, cik) {
  const url = `https://data.sec.gov/submissions/CIK${cik.padStart(10,'0')}.json`;
  const res = await safeFetch(url);
  if (!res || !res.ok) return null;
  try {
    const data = await res.json();
    // Cerca il più recente 13F
    const filings = data.filings?.recent;
    if (!filings) return null;
    const forms = filings.form || [];
    const idx13F = forms.findIndex(f => f === '13F-HR');
    if (idx13F === -1) return null;
    return {
      fundName,
      cik,
      latestFiling: {
        date: filings.filingDate?.[idx13F] || '',
        accession: filings.accessionNumber?.[idx13F] || '',
        report: filings.reportDate?.[idx13F] || ''
      }
    };
  } catch(e) { return null; }
}

async function fetchHoldingsFrom13F(cik, accession) {
  if (!accession) return [];
  const acc = accession.replace(/-/g, '');
  const url = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/` +
    `${acc}/${accession}-index.htm`;
  // Proviamo l'API EDGAR submissions per ottenere le holdings
  // Alternativa: cerca nel file XML infotable
  const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=%22${cik}%22&forms=13F-HR&dateRange=custom&startdt=${dateMinusDays(120)}&enddt=${TODAY}`;
  const res = await safeFetch(searchUrl);
  if (!res || !res.ok) return [];
  try {
    const data = await res.json();
    return (data.hits?.hits || []).slice(0, 3).map(hit => ({
      form: hit._source?.form_type || '13F-HR',
      date: hit._source?.file_date || '',
      description: (hit._source?.display_names || []).join(', ') || ''
    }));
  } catch(e) { return []; }
}

// ════════════════════════════════════════════════════════════════
// C. YAHOO FINANCE — Institutional Holders
// ════════════════════════════════════════════════════════════════
async function fetchInstitutionalHolders(ticker) {
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=institutionOwnership,majorHoldersBreakdown,netSharePurchaseActivity,insiderHolders`;
  const res = await safeFetch(url);
  if (!res || !res.ok) return null;
  try {
    const data = await res.json();
    const result = data?.quoteSummary?.result?.[0];
    if (!result) return null;
    return {
      ticker,
      institutionOwnership: result.institutionOwnership?.ownershipList?.slice(0, 8).map(o => ({
        holder: o.organization?.longFmt || o.organization?.raw || '',
        shares: o.position?.longFmt || '',
        value: o.value?.longFmt || '',
        pctChange: o.pctChange?.fmt || '',
        date: o.reportDate?.fmt || ''
      })) || [],
      majorHolders: {
        insidersPercent: result.majorHoldersBreakdown?.insidersPercentHeld?.fmt || '',
        institutionsPercent: result.majorHoldersBreakdown?.institutionsPercentHeld?.fmt || ''
      },
      netActivity: {
        buyInfoShares: result.netSharePurchaseActivity?.buyInfoShares?.longFmt || '',
        sellInfoShares: result.netSharePurchaseActivity?.sellInfoShares?.longFmt || '',
        netInfoShares: result.netSharePurchaseActivity?.netInfoShares?.longFmt || '',
        netPercentInsider: result.netSharePurchaseActivity?.netPercentInsiderShares?.fmt || ''
      },
      insiderHolders: result.insiderHolders?.holders?.slice(0, 5).map(h => ({
        name: h.name?.longFmt || '',
        relation: h.relation?.longFmt || '',
        shares: h.positionDirect?.longFmt || '',
        latestTransaction: h.latestTransType?.longFmt || '',
        transactionDate: h.transactionDescription?.longFmt || ''
      })) || []
    };
  } catch(e) { return null; }
}

// ════════════════════════════════════════════════════════════════
// D. ANALISI TICKER: aggrega tutti i dati
// ════════════════════════════════════════════════════════════════
async function analyzeTickerFundFlow(ticker) {
  process.stdout.write(`  🏛️  ${ticker.padEnd(8)}`);

  const [form4, holders] = await Promise.allSettled([
    fetchForm4(ticker),
    fetchInstitutionalHolders(ticker)
  ]);

  const result = {
    ticker,
    name: fundData[ticker]?.name || ticker,
    analyzedAt: new Date().toISOString(),
    insiderTransactions: form4.value || [],
    institutionalHolders: holders.value || null,
    signals: [],
    holderFlowSignal: 'neutral' // 'accumulation' | 'distribution' | 'neutral'
  };

  // Calcola segnale netto
  const institutional = result.institutionalHolders;
  if (institutional) {
    const netActivity = institutional.netActivity;
    const netShares = parseInt((netActivity.netInfoShares || '0').replace(/[^\d-]/g, '')) || 0;
    if (netShares > 0) result.holderFlowSignal = 'accumulation';
    else if (netShares < 0) result.holderFlowSignal = 'distribution';

    // Genera segnali
    if (result.holderFlowSignal === 'accumulation') {
      result.signals.push({ level: 'medio', msg: `Accumulo netto istituzionale: +${netActivity.netInfoShares} azioni` });
    } else if (result.holderFlowSignal === 'distribution') {
      result.signals.push({ level: 'medio', msg: `Distribuzione netta istituzionale: ${netActivity.netInfoShares} azioni` });
    }
    if (institutional.insiderHolders.length > 0) {
      const recentTx = institutional.insiderHolders.filter(h => h.latestTransaction);
      if (recentTx.length > 0) {
        result.signals.push({ level: 'info', msg: `${recentTx.length} insider con transazioni recenti` });
      }
    }
  }

  if (result.insiderTransactions.length > 0) {
    result.signals.push({ level: 'info', msg: `Form 4 SEC: ${result.insiderTransactions.length} filing recenti (${daysArg}gg)` });
  }

  const signalIcon = result.holderFlowSignal === 'accumulation' ? '🟢' : result.holderFlowSignal === 'distribution' ? '🔴' : '⚪';
  console.log(` ${signalIcon}  ${result.holderFlowSignal} · form4: ${result.insiderTransactions.length} · holders: ${result.institutionalHolders?.institutionOwnership?.length || 0}`);

  await new Promise(r => setTimeout(r, 600 + Math.random() * 300));
  return result;
}

// ════════════════════════════════════════════════════════════════
// E. GENERA OUTPUT holder-flow-tracker.js (aggiorna dashboard)
// ════════════════════════════════════════════════════════════════
function buildHolderFlowTrackerJS(analyses) {
  const flowData = {};

  analyses.forEach(a => {
    const inst = a.institutionalHolders;
    flowData[a.ticker] = {
      ticker: a.ticker,
      name: a.name,
      signal: a.holderFlowSignal,
      updatedAt: a.analyzedAt,
      topHolders: inst?.institutionOwnership?.slice(0, 5).map(h => ({
        name: h.holder,
        pctChange: h.pctChange,
        date: h.date
      })) || [],
      insidersPercent: inst?.majorHolders?.insidersPercent || '',
      institutionsPercent: inst?.majorHolders?.institutionsPercent || '',
      netActivity: inst?.netActivity || {},
      recentInsiderTx: a.insiderTransactions.slice(0, 3).map(tx => ({
        insider: tx.insiderName,
        date: tx.date,
        type: tx.type
      })),
      signals: a.signals
    };
  });

  const accumulating = analyses.filter(a=>a.holderFlowSignal==='accumulation').map(a=>a.ticker);
  const distributing = analyses.filter(a=>a.holderFlowSignal==='distribution').map(a=>a.ticker);

  return `// ═══════════════════════════════════════════════
// HOLDER FLOW TRACKER — Generato automaticamente
// Script: fund-insider-scan.js
// Data: ${TODAY}
// Ticker analizzati: ${analyses.length}
// ═══════════════════════════════════════════════

const HOLDER_FLOW_DATA = ${JSON.stringify(flowData, null, 2)};

const HOLDER_FLOW_SUMMARY = {
  updatedAt: "${new Date().toISOString()}",
  date: "${TODAY}",
  totalAnalyzed: ${analyses.length},
  accumulating: ${JSON.stringify(accumulating)},
  distributing: ${JSON.stringify(distributing)},
  neutral: ${JSON.stringify(analyses.filter(a=>a.holderFlowSignal==='neutral').map(a=>a.ticker))}
};
`;
}

// ════════════════════════════════════════════════════════════════
// F. GENERA REPORT MARKDOWN
// ════════════════════════════════════════════════════════════════
function buildMarkdownReport(analyses, fundInfos) {
  const lines = [];
  lines.push(`# 🏛️ Fund & Insider Flow Report — ${TODAY}`);
  lines.push('');
  lines.push(`> Analisi ogni 3 giorni | Ticker: ${analyses.length} | Finestra: ${daysArg} giorni`);
  lines.push('');

  // Accumulazione
  const acc = analyses.filter(a=>a.holderFlowSignal==='accumulation');
  if (acc.length > 0) {
    lines.push('## 🟢 TITOLI IN ACCUMULAZIONE ISTITUZIONALE');
    acc.forEach(a => {
      const net = a.institutionalHolders?.netActivity?.netInfoShares || 'N/D';
      lines.push(`- **${a.ticker}** (${a.name}): net shares ${net}`);
    });
    lines.push('');
  }

  // Distribuzione
  const dist = analyses.filter(a=>a.holderFlowSignal==='distribution');
  if (dist.length > 0) {
    lines.push('## 🔴 TITOLI IN DISTRIBUZIONE ISTITUZIONALE');
    dist.forEach(a => {
      const net = a.institutionalHolders?.netActivity?.netInfoShares || 'N/D';
      lines.push(`- **${a.ticker}** (${a.name}): net shares ${net}`);
    });
    lines.push('');
  }

  // Dettaglio per ticker
  lines.push('## 📋 DETTAGLIO HOLDER FLOW');
  lines.push('');
  analyses.forEach(a => {
    const signalIcon = a.holderFlowSignal === 'accumulation' ? '🟢' : a.holderFlowSignal === 'distribution' ? '🔴' : '⚪';
    lines.push(`### ${signalIcon} ${a.ticker} — ${a.name}`);
    const inst = a.institutionalHolders;
    if (inst) {
      lines.push(`**Insider:** ${inst.majorHolders.insidersPercent || 'N/D'} | **Istituzionale:** ${inst.majorHolders.institutionsPercent || 'N/D'}`);
      if (inst.institutionOwnership.length > 0) {
        lines.push('**Top Holder:**');
        inst.institutionOwnership.slice(0, 4).forEach(h => {
          lines.push(`  - ${h.holder || 'N/D'} | ${h.shares || ''} azioni | Δ: ${h.pctChange || 'N/D'}`);
        });
      }
      if (inst.netActivity.netInfoShares) {
        lines.push(`**Net Activity:** ${inst.netActivity.buyInfoShares || 0} acquistati / ${inst.netActivity.sellInfoShares || 0} venduti → **NET: ${inst.netActivity.netInfoShares}**`);
      }
    }
    if (a.insiderTransactions.length > 0) {
      lines.push(`**Form 4 recenti (${daysArg}gg):** ${a.insiderTransactions.length} filing`);
      a.insiderTransactions.slice(0, 2).forEach(tx => {
        lines.push(`  - ${tx.date} · ${tx.insiderName}`);
      });
    }
    lines.push('');
  });

  // Info fondi principali
  if (fundInfos.length > 0) {
    lines.push('## 🏦 STATO FILING FONDI PRINCIPALI');
    fundInfos.filter(Boolean).forEach(f => {
      if (!f) return;
      lines.push(`- **${f.fundName}**: ultimo 13F del ${f.latestFiling?.date || 'N/D'} (periodo: ${f.latestFiling?.report || 'N/D'})`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Report generato da fund-insider-scan.js · ${TODAY} · Finestra ${daysArg}gg*`);
  return lines.join('\n');
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🏛️  FUND & INSIDER SCAN — Analisi ogni 3 giorni');
  console.log('─'.repeat(50));
  console.log(`  Data: ${TODAY}`);
  console.log(`  Ticker: ${tickers.join(', ')}`);
  console.log(`  Finestra: ${daysArg} giorni`);
  console.log('');

  // Analizza tutti i ticker
  console.log('  Analisi holder flow per ticker...');
  const analyses = [];
  for (const ticker of tickers) {
    const result = await analyzeTickerFundFlow(ticker);
    analyses.push(result);
  }

  // Recupera info fondi principali (parallelo, non bloccante)
  console.log('\n  Recupero info 13F fondi principali...');
  const fundInfoPromises = Object.entries(MAJOR_FUNDS).slice(0, 5).map(
    ([name, cik]) => fetch13FForFund(name, cik).then(r => {
      if (r) console.log(`  ✅  ${name}`);
      return r;
    }).catch(() => null)
  );
  const fundInfos = await Promise.all(fundInfoPromises);

  // Salva holder-flow-tracker.js
  const holderFlowFile = path.join(bridge.JS_DIR, 'holder-flow-tracker.js');
  bridge.backupFile(holderFlowFile);
  fs.writeFileSync(holderFlowFile, buildHolderFlowTrackerJS(analyses));
  console.log(`\n  ✅  js/holder-flow-tracker.js aggiornato`);

  // Salva JSON
  const jsonData = {
    generatedAt: new Date().toISOString(),
    date: TODAY,
    daysWindow: daysArg,
    analyses,
    majorFunds: fundInfos.filter(Boolean)
  };
  const jsonOut = path.join(bridge.REPORTS_DIR, `holders_monitor_${TODAY_TS}.json`);
  const jsonLatest = path.join(bridge.REPORTS_DIR, 'holders_monitor_latest.json');
  fs.writeFileSync(jsonOut, JSON.stringify(jsonData, null, 2));
  fs.writeFileSync(jsonLatest, JSON.stringify(jsonData, null, 2));

  // Salva Markdown
  const mdOut = path.join(bridge.REPORTS_DIR, `fund_insider_${TODAY_TS}.md`);
  const mdMonitor = path.join(bridge.REPORTS_DIR, `holders_monitor_${TODAY_TS}.md`);
  const md = buildMarkdownReport(analyses, fundInfos.filter(Boolean));
  fs.writeFileSync(mdOut, md);
  fs.writeFileSync(mdMonitor, md);

  // Statistiche
  const acc = analyses.filter(a=>a.holderFlowSignal==='accumulation').length;
  const dist = analyses.filter(a=>a.holderFlowSignal==='distribution').length;
  console.log('');
  console.log(`  🟢  In accumulazione: ${acc} ticker`);
  console.log(`  🔴  In distribuzione: ${dist} ticker`);
  console.log(`  ⚪  Neutrali: ${analyses.length - acc - dist} ticker`);
  console.log(`  📄  Report: ${mdOut}`);
  console.log(`  📊  JSON: ${jsonLatest}`);
  console.log(`\n  Esegui sync-back.js per aggiornare la dashboard.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
