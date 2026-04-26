#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_JS = path.join(PROJECT_ROOT, 'js', 'online-sector-map.js');
const OUTPUT_REPORT = path.join(PROJECT_ROOT, 'reports', 'online_sector_map_latest.json');
const USER_AGENT = 'Portfolio Online Sector Sync contact: local@example.com';
const DEFAULT_TICKERS = ['TSLA','NVDA','BLK','XOM','ASML','LLY','NVO','AVGO','EQIX','MU','INTC','AMGN','PFE','DLR','RIO','BHP','FCX'];

function parseArgs() {
  const tickersArg = process.argv.find(arg => arg.startsWith('--tickers='));
  if (!tickersArg) return DEFAULT_TICKERS;
  return tickersArg.split('=')[1].split(',').map(v => v.trim().toUpperCase()).filter(Boolean);
}

async function fetchYahooSearch(ticker) {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&quotesCount=1&newsCount=0`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const q = json?.quotes?.[0];
  if (!q) return null;
  return {
    sector: q.sector || q.sectorDisp || '',
    industry: q.industry || q.industryDisp || '',
    symbol: q.symbol || ticker,
    sourceUrl: url
  };
}

async function main() {
  const tickers = parseArgs();
  const map = {};
  const errors = {};

  for (const ticker of tickers) {
    try {
      const row = await fetchYahooSearch(ticker);
      if (row && row.sector) {
        map[ticker] = {
          sector: row.sector,
          industry: row.industry || '',
          sourceUrl: row.sourceUrl
        };
      } else {
        errors[ticker] = 'sector not found';
      }
    } catch (err) {
      errors[ticker] = String(err);
    }
  }

  const payload = {
    updatedAt: new Date().toISOString().slice(0, 10),
    provider: 'yahoo-finance-search-v1',
    map
  };

  fs.writeFileSync(OUTPUT_JS, `const ONLINE_SECTOR_MAP_DYNAMIC = ${JSON.stringify(payload, null, 2)};\n`, 'utf8');
  fs.writeFileSync(OUTPUT_REPORT, JSON.stringify({ payload, errors }, null, 2), 'utf8');
  console.log(`online-sector-map updated: ${OUTPUT_JS}`);
  console.log(`report updated: ${OUTPUT_REPORT}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
