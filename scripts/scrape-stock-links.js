#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SCRAPE STOCK LINKS — Estrae dati da URL configurati per ogni stock
// Legge sourceUrls[ticker] dallo stato esportato
// Output: reports/scraped_YYYYMMDD.json
// Uso:
//   node scripts/scrape-stock-links.js
//   node scripts/scrape-stock-links.js --ticker=TSLA
//   node scripts/scrape-stock-links.js --ticker=TSLA,NVDA
// ═══════════════════════════════════════════════════════════════

'use strict';

let fetch, cheerio;
try {
  fetch = require('node-fetch');
} catch(e) {
  console.error('❌  node-fetch non trovato. Installa con:\n   npm install node-fetch@2\n');
  process.exit(1);
}
try {
  cheerio = require('cheerio');
} catch(e) {
  console.error('❌  cheerio non trovato. Installa con:\n   npm install cheerio\n');
  process.exit(1);
}

const path = require('path');
const fs = require('fs');
const bridge = require('./state-bridge.js');

// ── Argomenti CLI ────────────────────────────────────────────────
const args = process.argv.slice(2);
const tickerArg = (args.find(a => a.startsWith('--ticker=')) || '').replace('--ticker=', '');
const filterTickers = tickerArg ? tickerArg.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) : null;

// ── Carica stato ─────────────────────────────────────────────────
const state = bridge.loadState();
const sourceUrls = bridge.getSourceUrls(state);
const fundData = bridge.getFundData(state);
bridge.ensureReportsDir();

// ── Filtra ticker da processare ──────────────────────────────────
let tickersToProcess = Object.keys(sourceUrls);
if (filterTickers) {
  tickersToProcess = tickersToProcess.filter(t => filterTickers.includes(t.toUpperCase()));
}
if (tickersToProcess.length === 0) {
  console.log('\n⚠️  Nessun ticker con URL configurati trovato.');
  console.log('   Aggiungi URL nel modal stock della dashboard → campo "🔗 Link Analisi"\n');
  process.exit(0);
}

// ── Estrattori specializzati per fonti comuni ────────────────────
async function extractFromFinancials(url, $) {
  const data = {};
  // Prova a trovare prezzo
  const priceSelectors = [
    '[data-field="regularMarketPrice"]',
    '.price', '#quote-header-info span[data-reactid]',
    '.Fw\\(b\\)', 'fin-streamer[data-field="regularMarketPrice"]',
    '[class*="price"]', '.current-price'
  ];
  for (const sel of priceSelectors) {
    const val = $(sel).first().text().trim();
    if (val && /[\d.,]/.test(val)) { data.price = val; break; }
  }
  // Variazione
  const changeSelectors = ['[data-field="regularMarketChange"]', '.change', '[class*="change"]'];
  for (const sel of changeSelectors) {
    const val = $(sel).first().text().trim();
    if (val && /[-+\d.,]/.test(val)) { data.change = val; break; }
  }
  // Titolo pagina
  data.pageTitle = $('title').text().replace(/\s+/g, ' ').trim().substring(0, 120);
  return data;
}

async function extractFromSECEdgar(url, $) {
  const data = { type: 'sec_filing', filings: [] };
  // Cerca tabelle di filing
  $('table tr').each((i, row) => {
    if (i > 20) return false;
    const cells = $(row).find('td');
    if (cells.length >= 3) {
      data.filings.push({
        type: $(cells[0]).text().trim(),
        description: $(cells[1]).text().trim().substring(0, 100),
        date: $(cells[2]).text().trim()
      });
    }
  });
  data.pageTitle = $('title').text().trim().substring(0, 120);
  return data;
}

async function extractGeneric(url, $) {
  const data = {};
  data.pageTitle = $('title').text().trim().substring(0, 120);
  data.h1 = $('h1').first().text().trim().substring(0, 200);
  // Cerca paragrafi rilevanti (news, analyst)
  const paragraphs = [];
  $('p, .article-body p, .news-body p').each((i, el) => {
    if (i >= 5) return false;
    const t = $(el).text().trim();
    if (t.length > 40) paragraphs.push(t.substring(0, 300));
  });
  data.snippets = paragraphs;
  // Meta description
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  if (metaDesc) data.metaDescription = metaDesc.substring(0, 300);
  return data;
}

// ── Determina tipo URL ───────────────────────────────────────────
function classifyUrl(url) {
  const u = url.toLowerCase();
  if (u.includes('finance.yahoo.com')) return 'yahoo';
  if (u.includes('sec.gov')) return 'sec';
  if (u.includes('marketwatch.com')) return 'marketwatch';
  if (u.includes('seekingalpha.com')) return 'seekingalpha';
  if (u.includes('finviz.com')) return 'finviz';
  if (u.includes('macrotrends.net')) return 'macrotrends';
  if (u.includes('wsj.com')) return 'wsj';
  if (u.includes('reuters.com')) return 'reuters';
  if (u.includes('bloomberg.com')) return 'bloomberg';
  return 'generic';
}

// ── Fetch con timeout ────────────────────────────────────────────
async function fetchWithTimeout(url, timeout = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      }
    });
    clearTimeout(timer);
    return res;
  } catch(e) {
    clearTimeout(timer);
    throw e;
  }
}

// ── Scraping principale ──────────────────────────────────────────
async function scrapeUrl(ticker, url) {
  const result = { ticker, url, type: classifyUrl(url), scrapedAt: new Date().toISOString() };
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      result.error = `HTTP ${res.status}`;
      return result;
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    let extracted = {};
    switch(result.type) {
      case 'yahoo':
      case 'marketwatch':
      case 'finviz':
        extracted = await extractFromFinancials(url, $);
        break;
      case 'sec':
        extracted = await extractFromSECEdgar(url, $);
        break;
      default:
        extracted = await extractGeneric(url, $);
    }
    result.data = extracted;
  } catch(e) {
    result.error = e.message.substring(0, 100);
  }
  return result;
}

// ── Processo un ticker (può avere più URL) ───────────────────────
async function processTicker(ticker) {
  const urls = sourceUrls[ticker];
  const urlList = Array.isArray(urls) ? urls : (typeof urls === 'string' ? urls.split('\n').map(u=>u.trim()).filter(Boolean) : []);
  if (urlList.length === 0) return null;

  console.log(`\n  🔍  ${ticker} — ${urlList.length} URL`);
  const scraped = [];
  for (const url of urlList) {
    if (!url.startsWith('http')) continue;
    process.stdout.write(`      → ${url.substring(0, 60)}... `);
    const result = await scrapeUrl(ticker, url);
    if (result.error) {
      console.log(`❌  ${result.error}`);
    } else {
      console.log(`✅  OK`);
    }
    scraped.push(result);
    // Pausa anti-ban
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
  }
  return { ticker, name: fundData[ticker]?.name || ticker, scraped };
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🔗  SCRAPE STOCK LINKS');
  console.log('─'.repeat(50));
  console.log(`  Ticker da processare: ${tickersToProcess.join(', ')}`);

  const results = {};
  const startTime = Date.now();

  for (const ticker of tickersToProcess) {
    const res = await processTicker(ticker);
    if (res) results[ticker] = res;
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const outFile = path.join(bridge.REPORTS_DIR, `scraped_${bridge.todayISO()}.json`);
  const outLatest = path.join(bridge.REPORTS_DIR, 'scraped_latest.json');

  const output = {
    generatedAt: new Date().toISOString(),
    tickersProcessed: tickersToProcess.length,
    results
  };

  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));
  fs.writeFileSync(outLatest, JSON.stringify(output, null, 2));

  console.log(`\n  ✅  Completato in ${elapsed}s`);
  console.log(`  📄  Report: ${outFile}`);
  console.log(`  📄  Latest: ${outLatest}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
