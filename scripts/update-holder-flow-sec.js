#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_JS = path.join(PROJECT_ROOT, 'js', 'holder-flow-tracker.js');
const OUTPUT_REPORT = path.join(PROJECT_ROOT, 'reports', 'holders_monitor_latest.json');

const DEFAULT_TICKERS = ['TSLA'];
const USER_AGENT = 'Portfolio Holder Flow Bot contact: local@example.com';
const DAYS_LOOKBACK = 120;

function toISODate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function daysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function parseArgs() {
  const tickersArg = process.argv.find(arg => arg.startsWith('--tickers='));
  if (!tickersArg) return DEFAULT_TICKERS;
  return tickersArg
    .split('=')[1]
    .split(',')
    .map(v => v.trim().toUpperCase())
    .filter(Boolean);
}

function buildEntry(ticker, bucket, status, signal, summary, links) {
  return { ticker, bucket, status, signal, summary, links };
}

async function getCikMap(tickers) {
  const data = await fetchJson('https://www.sec.gov/files/company_tickers.json');
  const map = {};
  for (const item of Object.values(data)) {
    const t = String(item.ticker || '').toUpperCase();
    if (tickers.includes(t)) {
      map[t] = String(item.cik_str || '');
    }
  }
  return map;
}

function filterRecentForms(filingsRecent, formType) {
  const forms = filingsRecent.form || [];
  const dates = filingsRecent.filingDate || [];
  const accs = filingsRecent.accessionNumber || [];
  const cutoff = daysAgo(DAYS_LOOKBACK);
  const rows = [];
  for (let i = 0; i < forms.length; i += 1) {
    if (forms[i] !== formType) continue;
    const d = new Date(dates[i]);
    if (Number.isNaN(d.getTime()) || d < cutoff) continue;
    rows.push({ date: dates[i], accession: accs[i] });
  }
  return rows;
}

function countInWindow(rows, startDate, endDate) {
  return rows.filter(r => {
    const d = new Date(r.date);
    return d >= startDate && d <= endDate;
  }).length;
}

function buildWeeklySignal(rows) {
  const now = new Date();
  const startLast7 = new Date(now);
  startLast7.setUTCDate(now.getUTCDate() - 7);
  const startPrev7 = new Date(now);
  startPrev7.setUTCDate(now.getUTCDate() - 14);
  const endPrev7 = new Date(now);
  endPrev7.setUTCDate(now.getUTCDate() - 8);

  const last7 = countInWindow(rows, startLast7, now);
  const prev7 = countInWindow(rows, startPrev7, endPrev7);
  const delta = last7 - prev7;

  // Trigger alert when the latest week accelerates materially.
  const isStrongJump = last7 >= 4 && (prev7 === 0 || last7 >= (prev7 * 2));
  const isDrop = prev7 >= 4 && last7 <= Math.floor(prev7 / 2);

  if (isStrongJump) {
    return {
      status: 'Alert',
      signal: `ALERT Form 4: +${delta} WoW`,
      summary: `Ultimi 7g: ${last7} filing vs ${prev7} nei 7g precedenti. Accelerazione forte da monitorare.`
    };
  }
  if (isDrop) {
    return {
      status: 'Monitorare',
      signal: `Form 4: rallentamento ${last7}/${prev7}`,
      summary: `Ultimi 7g: ${last7} filing vs ${prev7} nei 7g precedenti. Attivita insider in rallentamento.`
    };
  }
  return {
    status: 'Monitorare',
    signal: `Form 4: ${last7}/${prev7} (7g/prev7g)`,
    summary: `Ultimi 7g: ${last7} filing vs ${prev7} nei 7g precedenti.`
  };
}

function formatInsiderSummary(rows) {
  if (!rows.length) return 'Nessun Form 4 negli ultimi 120 giorni.';
  const latest = rows.slice(0, 4).map(r => r.date).join(', ');
  return `Rilevati ${rows.length} filing Form 4 negli ultimi 120 giorni. Ultimi: ${latest}.`;
}

function buildTracker(tickers, secResults) {
  const updatedAt = toISODate(new Date());
  const entries = [];
  for (const ticker of tickers) {
    const sec = secResults[ticker];
    const insiderRows = sec?.form4 || [];
    const weekly = buildWeeklySignal(insiderRows);
    const insiderSignal = insiderRows.length ? `${weekly.signal} | Tot120g:${insiderRows.length}` : 'Nessun nuovo Form 4 (120g)';
    entries.push(buildEntry(
      ticker,
      'Insider',
      weekly.status,
      insiderSignal,
      `${weekly.summary} ${formatInsiderSummary(insiderRows)}`,
      [
        `https://www.perplexity.ai/finance/${ticker}/holders?tab=insiders`,
        `https://www.sec.gov/edgar/search/#/q=${encodeURIComponent(ticker + ' form 4')}`,
        `https://www.nasdaq.com/market-activity/stocks/${ticker.toLowerCase()}/insider-activity`
      ]
    ));

    entries.push(buildEntry(
      ticker,
      'Institutional',
      'Monitorare',
      'N/D via automazione SEC issuer-side',
      'Per trend istituzionale usare filing 13F (gestori) e ownership aggregata. Perplexity puo richiedere verifica manuale.',
      [
        `https://www.perplexity.ai/finance/${ticker}/holders?tab=institutional`,
        `https://www.sec.gov/edgar/search/#/q=${encodeURIComponent(ticker + ' 13F')}`,
        `https://www.nasdaq.com/market-activity/stocks/${ticker.toLowerCase()}/institutional-holdings`
      ]
    ));

    entries.push(buildEntry(
      ticker,
      'Politicians',
      'Monitorare',
      'N/D via automazione',
      'Tracking politico via disclosure ufficiali House/Senate + verifica manuale Perplexity.',
      [
        `https://www.perplexity.ai/finance/${ticker}/holders?tab=politicians&page=1`,
        'https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure',
        'https://efdsearch.senate.gov/search/'
      ]
    ));
  }
  return { updatedAt, entries };
}

function writeOutputs(tracker, secResults) {
  const jsPayload = `const HOLDER_FLOW_TRACKER_DYNAMIC = ${JSON.stringify(tracker, null, 2)};\n`;
  fs.writeFileSync(OUTPUT_JS, jsPayload, 'utf8');
  fs.writeFileSync(OUTPUT_REPORT, JSON.stringify({ tracker, secResults }, null, 2), 'utf8');
}

async function main() {
  const tickers = parseArgs();
  const cikMap = await getCikMap(tickers);
  const secResults = {};

  for (const ticker of tickers) {
    const cikRaw = cikMap[ticker];
    if (!cikRaw) {
      secResults[ticker] = { error: 'CIK non trovato' };
      continue;
    }
    const cik = cikRaw.padStart(10, '0');
    const submissionsUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
    try {
      const sub = await fetchJson(submissionsUrl);
      const recent = sub.filings?.recent || {};
      secResults[ticker] = {
        cik,
        form4: filterRecentForms(recent, '4')
      };
    } catch (err) {
      secResults[ticker] = { error: String(err) };
    }
  }

  const tracker = buildTracker(tickers, secResults);
  writeOutputs(tracker, secResults);
  console.log(`holder-flow updated: ${OUTPUT_JS}`);
  console.log(`report updated: ${OUTPUT_REPORT}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
