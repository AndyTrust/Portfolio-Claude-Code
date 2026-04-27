#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const STOCK_UNIVERSE_FILE = path.join(PROJECT_ROOT, 'js', 'stock-universe.js');
const ONLINE_SECTOR_FILE = path.join(PROJECT_ROOT, 'js', 'online-sector-map.js');
const FUND_DATA_FILE = path.join(PROJECT_ROOT, 'js', 'data.js');
const OUTPUT_JSON = path.join(PROJECT_ROOT, 'reports', 'stock_master_latest.json');

function loadConstFromFile(filePath, constName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(`${source}\n;globalThis.__loaded = typeof ${constName} !== 'undefined' ? ${constName} : null;`, context, { timeout: 120000 });
  return context.globalThis.__loaded;
}

function inferSector(name, onlineSector, fundSector, type) {
  const raw = `${name || ''} ${onlineSector || ''} ${fundSector || ''}`.toLowerCase();
  if (onlineSector) return onlineSector;
  if (fundSector) return fundSector;
  if (type === 'ETF') return 'ETF / Multi-Sector';
  if (raw.includes('bank') || raw.includes('financial') || raw.includes('capital') || raw.includes('fund') || raw.includes('blackrock')) return 'Financial Services';
  if (raw.includes('semiconductor') || raw.includes('chip')) return 'Semiconductors';
  if (raw.includes('software') || raw.includes('technology') || raw.includes('cloud') || raw.includes('ai')) return 'Technology';
  if (raw.includes('pharma') || raw.includes('health') || raw.includes('biotech') || raw.includes('medical')) return 'Healthcare';
  if (raw.includes('energy') || raw.includes('oil') || raw.includes('gas') || raw.includes('utility')) return 'Energy';
  if (raw.includes('reit') || raw.includes('real estate') || raw.includes('property')) return 'Real Estate';
  if (raw.includes('consumer') || raw.includes('retail') || raw.includes('food') || raw.includes('auto')) return 'Consumer';
  if (raw.includes('mining') || raw.includes('materials') || raw.includes('steel') || raw.includes('copper')) return 'Materials';
  return 'Industrials';
}

function buildSources(ticker) {
  const key = String(ticker || '').toUpperCase();
  return [
    `https://finance.yahoo.com/quote/${key}`,
    `https://www.google.com/finance/quote/${key}:NYSE`,
    `https://www.perplexity.ai/finance/${key}`,
    `https://finviz.com/quote.ashx?t=${key}`,
    `https://www.sec.gov/edgar/search/#/q=${encodeURIComponent(key)}`
  ];
}

function main() {
  const stockUniverse = loadConstFromFile(STOCK_UNIVERSE_FILE, 'STOCK_UNIVERSE') || [];
  const onlineSectorRoot = loadConstFromFile(ONLINE_SECTOR_FILE, 'ONLINE_SECTOR_MAP_DYNAMIC') || {};
  const fundData = loadConstFromFile(FUND_DATA_FILE, 'DEFAULT_FUND_DATA') || {};
  const onlineMap = onlineSectorRoot?.map || {};

  const items = stockUniverse.map((row) => {
    const ticker = String(row?.ticker || '').toUpperCase();
    const online = onlineMap[ticker] || {};
    const fund = fundData[ticker] || {};
    const sector = inferSector(row?.name || '', online?.sector || '', fund?.sector || '', row?.type || 'Azione');
    return {
      ticker,
      name: row?.name || ticker,
      type: row?.type || 'Azione',
      cik: row?.cik || null,
      sector,
      industry: online?.industry || '',
      price: fund?.price || null,
      currency: fund?.currency || null,
      sources: buildSources(ticker),
      sourceMeta: {
        onlineSectorProvider: online?.sector ? 'yahoo-finance-search-v1' : '',
        fundSeedProvider: fund?.sector ? 'local-fund-dataset' : ''
      }
    };
  });

  const output = {
    generatedAt: new Date().toISOString(),
    total: items.length,
    providers: ['sec-company-tickers', 'yahoo-finance-search-v1', 'google-finance-link', 'perplexity-finance-link', 'finviz-link', 'sec-edgar-link'],
    items
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2), 'utf8');
  console.log(`stock master generated: ${OUTPUT_JSON}`);
  console.log(`items: ${items.length}`);
}

main();
