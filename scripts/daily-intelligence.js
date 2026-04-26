#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// DAILY INTELLIGENCE — Analisi giornaliera di mercato
// Usa fonti pubbliche (SEC EDGAR, Yahoo Finance, finviz) per:
//   · News ultime 24h per ticker watchlist
//   · Form 4 insider recenti
//   · Revisioni analisti
//   · Earnings prossimi
//   · Catalyst events
// Output:
//   · reports/intelligence_YYYYMMDD.md  (leggibile)
//   · reports/intelligence_YYYYMMDD.json (strutturato)
// Uso:
//   node scripts/daily-intelligence.js
//   node scripts/daily-intelligence.js --tickers=TSLA,NVDA
//   node scripts/daily-intelligence.js --max=10
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
const maxArg = parseInt((args.find(a => a.startsWith('--max=')) || '--max=20').replace('--max=', ''), 10);

// ── Carica stato ──────────────────────────────────────────────────
const state = bridge.loadState();
const fundData = bridge.getFundData(state);
bridge.ensureReportsDir();

let tickers = tickerArg
  ? tickerArg.split(',').map(t => t.trim().toUpperCase()).filter(Boolean)
  : bridge.getActiveTickers(state).slice(0, maxArg);

if (tickers.length === 0) {
  console.log('\n⚠️  Nessun ticker trovato. Esporta stato dalla dashboard.\n');
  process.exit(0);
}

const TODAY = bridge.todayFull();
const TODAY_TS = bridge.todayISO();

// ── Fetch sicuro ──────────────────────────────────────────────────
async function safeFetch(url, opts = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)',
        'Accept': 'application/json, text/html',
        ...opts.headers
      }
    });
    clearTimeout(t);
    return res;
  } catch(e) { clearTimeout(t); return null; }
}

// ── SEC EDGAR: Form 4 per insider ─────────────────────────────────
async function fetchInsiderForm4(ticker) {
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22${ticker}%22&dateRange=custom&startdt=${getTodayMinus(7)}&enddt=${TODAY}&forms=4`;
  const res = await safeFetch(url);
  if (!res || !res.ok) return [];
  try {
    const data = await res.json();
    const filings = (data.hits?.hits || []).slice(0, 5);
    return filings.map(f => ({
      type: 'insider_form4',
      ticker,
      accessionNo: f._id,
      date: f._source?.period_of_report || f._source?.file_date || '',
      filer: f._source?.display_names?.join(', ') || '',
      formType: f._source?.form_type || '4'
    }));
  } catch(e) { return []; }
}

// ── SEC EDGAR: full-text search notizie/filings recenti ───────────
async function fetchSecFilings(ticker, formTypes = ['8-K', '10-Q', '10-K']) {
  const forms = formTypes.join(',');
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22${ticker}%22&forms=${forms}&dateRange=custom&startdt=${getTodayMinus(14)}&enddt=${TODAY}`;
  const res = await safeFetch(url);
  if (!res || !res.ok) return [];
  try {
    const data = await res.json();
    return (data.hits?.hits || []).slice(0, 3).map(f => ({
      type: 'sec_filing',
      ticker,
      form: f._source?.form_type || '',
      description: (f._source?.file_description || f._source?.entity_name || '').substring(0, 120),
      date: f._source?.file_date || '',
      url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=${f._source?.form_type}&dateb=&owner=include&count=10`
    }));
  } catch(e) { return []; }
}

// ── Yahoo Finance: quote + news ───────────────────────────────────
async function fetchYahooQuote(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=1d&events=earnings`;
  const res = await safeFetch(url);
  if (!res || !res.ok) return null;
  try {
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    return {
      ticker,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePct: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
      volume: meta.regularMarketVolume,
      marketCap: meta.marketCap,
      currency: meta.currency,
      exchange: meta.exchangeName,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow
    };
  } catch(e) { return null; }
}

// ── Finviz: news ticker ───────────────────────────────────────────
async function fetchFinvizNews(ticker) {
  const url = `https://finviz.com/quote.ashx?t=${ticker}`;
  const res = await safeFetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36' }
  });
  if (!res || !res.ok) return [];
  try {
    const html = await res.text();
    const newsItems = [];
    // Parsing grezzo tabella news finviz
    const newsRegex = /<a[^>]+class="nn-tab-link"[^>]*>(.*?)<\/a>/g;
    const dateRegex = /(\w{3}-\d{2}-\d{2}|\w{3,9}\s+\d{1,2}(?:\s+\d{4})?)/g;
    let m;
    while ((m = newsRegex.exec(html)) !== null && newsItems.length < 5) {
      const title = m[1].replace(/<[^>]+>/g, '').trim();
      if (title.length > 10) newsItems.push({ title: title.substring(0, 150), ticker });
    }
    return newsItems;
  } catch(e) { return []; }
}

// ── Alpha Vantage: earnings calendar (gratuito) ───────────────────
async function fetchEarningsCalendar(ticker) {
  // Usa Yahoo Finance earnings API (senza key)
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=calendarEvents,earnings`;
  const res = await safeFetch(url);
  if (!res || !res.ok) return null;
  try {
    const data = await res.json();
    const cal = data?.quoteSummary?.result?.[0]?.calendarEvents;
    if (!cal) return null;
    const earningsDate = cal?.earnings?.earningsDate?.[0]?.fmt;
    return earningsDate ? { ticker, earningsDate } : null;
  } catch(e) { return null; }
}

// ── Helper date ───────────────────────────────────────────────────
function getTodayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// ── Analisi singolo ticker ────────────────────────────────────────
async function analyzeTicker(ticker) {
  process.stdout.write(`  📈  ${ticker.padEnd(8)}`);

  const [quote, insider, secFilings, news, earnings] = await Promise.allSettled([
    fetchYahooQuote(ticker),
    fetchInsiderForm4(ticker),
    fetchSecFilings(ticker),
    fetchFinvizNews(ticker),
    fetchEarningsCalendar(ticker)
  ]);

  const result = {
    ticker,
    name: fundData[ticker]?.name || ticker,
    analyzedAt: new Date().toISOString(),
    quote: quote.value || null,
    insiderActivity: insider.value || [],
    secFilings: secFilings.value || [],
    news: news.value || [],
    earnings: earnings.value || null,
    signals: []
  };

  // Genera segnali
  if (result.quote) {
    const chg = parseFloat(result.quote.changePct || 0);
    if (Math.abs(chg) >= 3) result.signals.push({ level: Math.abs(chg)>=5?'alto':'medio', msg: `Movimento significativo: ${chg > 0 ? '+':''}${chg}% oggi` });
  }
  if (result.insiderActivity.length > 0) {
    result.signals.push({ level: 'medio', msg: `${result.insiderActivity.length} filing insider ultimi 7 giorni (Form 4)` });
  }
  if (result.secFilings.length > 0) {
    const forms = result.secFilings.map(f=>f.form).join(', ');
    result.signals.push({ level: 'info', msg: `Filing SEC recenti: ${forms}` });
  }
  if (result.earnings?.earningsDate) {
    result.signals.push({ level: 'info', msg: `Prossimi earnings: ${result.earnings.earningsDate}` });
  }

  const statusIcon = result.signals.some(s=>s.level==='alto') ? '🔴' : result.signals.some(s=>s.level==='medio') ? '🟡' : '🟢';
  console.log(` ${statusIcon}  segnali: ${result.signals.length}, news: ${result.news.length}, insider: ${result.insiderActivity.length}`);

  // Pausa anti-rate-limit
  await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
  return result;
}

// ── Genera report Markdown ────────────────────────────────────────
function buildMarkdownReport(analyses) {
  const lines = [];
  lines.push(`# 📊 Intelligence Report — ${TODAY}`);
  lines.push('');
  lines.push(`> Generato: ${new Date().toLocaleString('it-IT')} · Ticker analizzati: ${analyses.length}`);
  lines.push('');

  // Segnali urgenti in cima
  const urgenti = analyses.filter(a => a.signals.some(s=>s.level==='alto'));
  if (urgenti.length > 0) {
    lines.push('## 🔴 SEGNALI URGENTI');
    urgenti.forEach(a => {
      a.signals.filter(s=>s.level==='alto').forEach(s => {
        lines.push(`- **${a.ticker}** (${a.name}): ${s.msg}`);
      });
    });
    lines.push('');
  }

  // Segnali medi
  const medi = analyses.filter(a => a.signals.some(s=>s.level==='medio'));
  if (medi.length > 0) {
    lines.push('## 🟡 SEGNALI MEDI');
    medi.forEach(a => {
      a.signals.filter(s=>s.level==='medio').forEach(s => {
        lines.push(`- **${a.ticker}**: ${s.msg}`);
      });
    });
    lines.push('');
  }

  // Dettaglio per ticker
  lines.push('## 📋 DETTAGLIO PER TICKER');
  lines.push('');

  analyses.forEach(a => {
    lines.push(`### ${a.ticker} — ${a.name}`);
    if (a.quote) {
      const q = a.quote;
      const sign = parseFloat(q.changePct||0) >= 0 ? '+' : '';
      lines.push(`**Prezzo:** ${q.price} ${q.currency || ''} | **Variazione:** ${sign}${q.changePct}% | **Exchange:** ${q.exchange||''}`);
      if (q.fiftyTwoWeekHigh) lines.push(`**52W High:** ${q.fiftyTwoWeekHigh} | **52W Low:** ${q.fiftyTwoWeekLow}`);
    }
    if (a.earnings?.earningsDate) {
      lines.push(`**📅 Prossimi Earnings:** ${a.earnings.earningsDate}`);
    }
    if (a.insiderActivity.length > 0) {
      lines.push('**👤 Insider Form 4 recenti:**');
      a.insiderActivity.slice(0,3).forEach(ins => {
        lines.push(`  - ${ins.date} · ${ins.filer || 'N/D'} · ${ins.formType}`);
      });
    }
    if (a.secFilings.length > 0) {
      lines.push('**📄 Filing SEC recenti:**');
      a.secFilings.slice(0,3).forEach(f => {
        lines.push(`  - ${f.date} · ${f.form} · ${f.description}`);
      });
    }
    if (a.news.length > 0) {
      lines.push('**📰 News:**');
      a.news.slice(0,3).forEach(n => {
        lines.push(`  - ${n.title}`);
      });
    }
    if (a.signals.length === 0) lines.push('*Nessun segnale rilevante oggi.*');
    lines.push('');
  });

  lines.push('---');
  lines.push(`*Report generato automaticamente da daily-intelligence.js · ${TODAY}*`);
  return lines.join('\n');
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🧠  DAILY INTELLIGENCE — Analisi Giornaliera');
  console.log('─'.repeat(50));
  console.log(`  Data: ${TODAY}`);
  console.log(`  Ticker da analizzare: ${tickers.join(', ')}`);
  console.log('');

  const analyses = [];
  for (const ticker of tickers) {
    const result = await analyzeTicker(ticker);
    analyses.push(result);
  }

  // Salva JSON strutturato
  const jsonOut = path.join(bridge.REPORTS_DIR, `intelligence_${TODAY_TS}.json`);
  const jsonLatest = path.join(bridge.REPORTS_DIR, 'intelligence_latest.json');
  const jsonData = { generatedAt: new Date().toISOString(), date: TODAY, analyses };
  fs.writeFileSync(jsonOut, JSON.stringify(jsonData, null, 2));
  fs.writeFileSync(jsonLatest, JSON.stringify(jsonData, null, 2));

  // Salva Markdown
  const mdOut = path.join(bridge.REPORTS_DIR, `intelligence_${TODAY_TS}.md`);
  const md = buildMarkdownReport(analyses);
  fs.writeFileSync(mdOut, md);

  // Statistiche finali
  const urgent = analyses.filter(a => a.signals.some(s=>s.level==='alto')).length;
  const medium = analyses.filter(a => a.signals.some(s=>s.level==='medio')).length;

  console.log('');
  console.log(`  ✅  Analisi completata`);
  console.log(`  🔴  Segnali urgenti: ${urgent} ticker`);
  console.log(`  🟡  Segnali medi: ${medium} ticker`);
  console.log(`  📄  Report: ${mdOut}`);
  console.log(`  📊  JSON: ${jsonOut}`);
  console.log(`\n  Esegui sync-back.js per aggiornare la dashboard.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
