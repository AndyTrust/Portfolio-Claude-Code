// ═══════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════
// Usa un helper sicuro: [] vuoto è truthy in JS ma non è dati validi → fallback a default
function _safeLoad(key, fallback, validate) {
  const fb = () => { try { return JSON.parse(JSON.stringify(fallback)); } catch(e2) { return fallback; } };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fb();
    const parsed = JSON.parse(raw);
    if (validate && !validate(parsed)) return fb();
    return parsed;
  } catch(e) { return fb(); }
}
let SECTORS = _safeLoad('dashboard_sectors_v3', DEFAULT_SECTORS, v => Array.isArray(v) && v.length > 0);
let fundData = _safeLoad('dashboard_fund_data_v3', DEFAULT_FUND_DATA, v => v && typeof v === 'object' && !Array.isArray(v));
let stockNotes = JSON.parse(localStorage.getItem('dashboard_stock_notes_v3')) || {};
let sourceUrls = JSON.parse(localStorage.getItem('dashboard_source_urls_v3')) || {};
let lastUpdates = JSON.parse(localStorage.getItem('dashboard_last_updates_v3')) || {};
let sectorWeights = JSON.parse(localStorage.getItem('dashboard_sector_weights_v3')) || SECTORS.map(() => +(100/SECTORS.length).toFixed(2));
let instrumentWeights = JSON.parse(localStorage.getItem('dashboard_instr_weights_v3')) || SECTORS.map(s => new Array(s.instruments.length).fill(0));
let scenarios = JSON.parse(localStorage.getItem('dashboard_scenarios')) || {};
let operazioni = JSON.parse(localStorage.getItem('dashboard_operazioni')) || [];
let stockStatus = JSON.parse(localStorage.getItem('dashboard_stock_status_v3')) || {}; // {ticker: true/false}
let currentSectorFilter = 'all', currentTypeFilter = 'all', currentStatusFilter = 'all', searchQuery = '', newsFilter = 'all';
let pieChart, barChart, netFlowChart, consensusChart;

// Filters for operazioni page
let opFilterTicker = '', opFilterType = '', opFilterSector = '', opFilterDateFrom = '', opFilterDateTo = '';
const STOCK_UNIVERSE_DATA = Array.isArray(typeof STOCK_UNIVERSE !== 'undefined' ? STOCK_UNIVERSE : null) ? STOCK_UNIVERSE : [];
const CUSTOM_STOCKS_KEY = 'dashboard_custom_stock_universe_v1';
const STOCK_REGISTRY_KEY = 'dashboard_stock_registry_v1';
let customStockUniverse = JSON.parse(localStorage.getItem(CUSTOM_STOCKS_KEY)) || [];
let stockRegistry = JSON.parse(localStorage.getItem(STOCK_REGISTRY_KEY)) || {};
let STOCK_UNIVERSE_MAP = {};
const ONLINE_SECTOR_MAP_DATA = (typeof ONLINE_SECTOR_MAP_DYNAMIC !== 'undefined' && ONLINE_SECTOR_MAP_DYNAMIC?.map) ? ONLINE_SECTOR_MAP_DYNAMIC.map : {};
let didGlobalSectorSync = false;

function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function saveSectors() { save('dashboard_sectors_v3', SECTORS); }
function saveWeights() { save('dashboard_sector_weights_v3', sectorWeights); save('dashboard_instr_weights_v3', instrumentWeights); }
function saveScenarios() { save('dashboard_scenarios', scenarios); }
function saveOperazioni() { save('dashboard_operazioni', operazioni); }
function saveNotes() { save('dashboard_stock_notes_v3', stockNotes); }
function saveFundData() { save('dashboard_fund_data_v3', fundData); }
function saveStockStatus() { save('dashboard_stock_status_v3', stockStatus); }
function saveCustomStockUniverse() { save(CUSTOM_STOCKS_KEY, customStockUniverse); }
function saveStockRegistry() { save(STOCK_REGISTRY_KEY, stockRegistry); }

function rebuildStockUniverseMap() {
  const baseMap = Object.fromEntries(
    STOCK_UNIVERSE_DATA
      .filter(item => item?.ticker)
      .map(item => [String(item.ticker || '').toUpperCase(), { ...item, ticker: String(item.ticker || '').toUpperCase() }])
  );
  customStockUniverse
    .filter(item => item?.ticker)
    .forEach(item => {
      const ticker = String(item.ticker || '').toUpperCase();
      baseMap[ticker] = {
        ...(baseMap[ticker] || {}),
        ...item,
        ticker,
        type: item.type || baseMap[ticker]?.type || 'Azione'
      };
    });
  STOCK_UNIVERSE_MAP = baseMap;
}

rebuildStockUniverseMap();

function upsertCustomStockUniverseEntry({ ticker, name, type = 'Azione', cik = null }) {
  const key = String(ticker || '').trim().toUpperCase();
  if (!key) return null;
  const safeName = String(name || key).trim() || key;
  const idx = customStockUniverse.findIndex(item => String(item.ticker || '').toUpperCase() === key);
  const nextRow = { ticker: key, name: safeName, type: type || 'Azione', cik };
  if (idx >= 0) customStockUniverse[idx] = { ...customStockUniverse[idx], ...nextRow };
  else customStockUniverse.push(nextRow);
  saveCustomStockUniverse();
  rebuildStockUniverseMap();
  return nextRow;
}

function ensureStockRegistryEntry(ticker, patch = {}, persist = true) {
  const key = String(ticker || '').trim().toUpperCase();
  if (!key) return null;
  const existing = stockRegistry[key] || {};
  const merged = {
    ticker: key,
    name: patch.name || existing.name || key,
    type: patch.type || existing.type || 'Azione',
    sector: patch.sector || existing.sector || '',
    industry: patch.industry || existing.industry || '',
    reportSummary: patch.reportSummary || existing.reportSummary || '',
    sources: Array.isArray(patch.sources) && patch.sources.length ? [...new Set(patch.sources)] : (existing.sources || buildDefaultSources(key)),
    updatedAt: patch.updatedAt || new Date().toISOString().slice(0, 10),
    updatedBy: patch.updatedBy || existing.updatedBy || 'sync'
  };
  stockRegistry[key] = merged;
  if (persist) saveStockRegistry();
  return merged;
}

function getStockRegistryEntry(ticker) {
  const key = String(ticker || '').toUpperCase();
  return stockRegistry[key] || null;
}

function addOrUpdateStockCatalogEntry(rawTicker, rawName, rawType = 'Azione') {
  const ticker = String(rawTicker || '').trim().toUpperCase();
  if (!ticker) return null;
  const existing = STOCK_UNIVERSE_MAP[ticker];
  if (!existing) {
    upsertCustomStockUniverseEntry({
      ticker,
      name: String(rawName || ticker).trim() || ticker,
      type: rawType || 'Azione'
    });
  }
  const row = STOCK_UNIVERSE_MAP[ticker];
  if (!row) return null;
  ensureStockRegistryEntry(ticker, {
    name: String(rawName || row.name || ticker).trim() || ticker,
    type: row.type || rawType || 'Azione',
    sources: buildDefaultSources(ticker),
    updatedBy: existing ? 'sync' : 'manual-add'
  });
  return getCatalogInstrumentByTicker(ticker);
}

// Get stock active status (default: true = active)
function isStockActive(ticker) { return stockStatus[ticker] !== false; }
function toggleStockStatus(ticker) { stockStatus[ticker] = !isStockActive(ticker); saveStockStatus(); }

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getInstrumentSearchRank(instrument, query) {
  const q = normalizeSearchText(query);
  const ticker = normalizeSearchText(instrument?.ticker || '');
  const name = normalizeSearchText(instrument?.name || '');
  let rank = 99;
  if (!q) return rank;
  if (ticker === q) rank = 0;
  else if (name === q) rank = 1;
  else if (ticker.startsWith(q)) rank = 2;
  else if (name.startsWith(q + ' ')) rank = 3;
  else if (name.startsWith(q)) rank = 4;
  else if (name.includes(' ' + q + ' ')) rank = 5;
  else if (name.includes(q)) rank = 6;
  else if (ticker.includes(q)) rank = 7;
  if (instrument?.tracked) rank -= 0.4;
  if (instrument?.type === 'Azione') rank -= 0.2;
  return rank;
}

function sortSearchMatches(items, query) {
  return [...items].sort((a, b) => {
    const rankDiff = getInstrumentSearchRank(a, query) - getInstrumentSearchRank(b, query);
    if (rankDiff !== 0) return rankDiff;
    const nameLengthDiff = (a.name || '').length - (b.name || '').length;
    if (nameLengthDiff !== 0) return nameLengthDiff;
    return String(a.ticker || '').localeCompare(String(b.ticker || ''));
  });
}

function getAllInstruments() {
  return SECTORS.flatMap(s => s.instruments.map(i => ({
    ...i,
    sectorName: s.name.split('/')[0].split('&')[0].trim(),
    tracked: true
  })));
}

function getTrackedInstrumentByTicker(ticker) {
  const key = String(ticker || '').toUpperCase();
  return getAllInstruments().find(item => item.ticker === key) || null;
}

function getCatalogInstrumentByTicker(ticker) {
  const key = String(ticker || '').toUpperCase();
  const item = STOCK_UNIVERSE_MAP[key];
  if (!item) return null;
  const registryRow = getStockRegistryEntry(key);
  return {
    ticker: key,
    name: registryRow?.name || item.name || key,
    type: item.type || 'Azione',
    yahoo: key,
    notes: '',
    cik: item.cik,
    sectorName: !isUnclassifiedSectorLabel(registryRow?.sector || '') ? registryRow.sector : 'Catalogo generale',
    sources: registryRow?.sources || buildDefaultSources(key),
    tracked: false
  };
}

function getInstrumentByTicker(ticker) {
  return getTrackedInstrumentByTicker(ticker) || getCatalogInstrumentByTicker(ticker);
}

function getSearchableInstruments() {
  const tracked = getAllInstruments();
  const trackedTickers = new Set(tracked.map(item => item.ticker));
  const catalog = Object.values(STOCK_UNIVERSE_MAP)
    .filter(item => item.ticker && !trackedTickers.has(String(item.ticker).toUpperCase()))
    .map(item => {
      const ticker = String(item.ticker).toUpperCase();
      const registryRow = getStockRegistryEntry(ticker);
      return {
        ticker,
        name: registryRow?.name || item.name,
        type: item.type || 'Azione',
        yahoo: ticker,
        notes: '',
        cik: item.cik,
        sectorName: !isUnclassifiedSectorLabel(registryRow?.sector || '') ? registryRow.sector : 'Catalogo generale',
        tracked: false
      };
    });
  return [...tracked, ...catalog];
}

function buildDefaultSources(ticker, type) {
  const key = String(ticker || '').toUpperCase();
  const isEtf = (type || '').toUpperCase() === 'ETF';
  const labeled = [
    { label: '📈 Yahoo Finance',    url: `https://finance.yahoo.com/quote/${key}` },
    { label: '🔎 Perplexity AI',    url: `https://www.perplexity.ai/search?q=${encodeURIComponent(key + ' ' + (isEtf ? 'ETF analysis' : 'stock analysis'))}` },
    { label: '📊 Finviz',           url: `https://finviz.com/quote.ashx?t=${key}` },
    { label: '💹 Google Finance',   url: `https://www.google.com/finance/quote/${key}` },
    { label: '🐳 WhaleWisdom 13F',  url: `https://whalewisdom.com/stock/${key.toLowerCase()}` },
  ];
  if (!isEtf) {
    labeled.push(
      { label: '📋 OpenInsider Form 4',    url: `http://openinsider.com/search?q=${key}` },
      { label: '🏛️ SEC EDGAR Form 4',     url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${key}&type=4&dateb=&owner=include&count=20` }
    );
  } else {
    labeled.push(
      { label: '📊 ETF.com',              url: `https://www.etf.com/${key}` },
      { label: '🏛️ SEC EDGAR N-PORT',     url: `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(key)}%22&forms=N-PORT,N-CEN` }
    );
  }
  labeled.push(
    { label: '🔍 SEC Full Text Search',  url: `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(key)}%22&forms=4,13F-HR` }
  );
  // Return array of URLs for backward compat, with _labeled metadata
  const urls = labeled.map(s => s.url);
  urls._labeled = labeled;
  return urls;
}

function getSectorShortName(sectorObj) {
  return String(sectorObj?.name || '').split('/')[0].split('&')[0].trim();
}

function isUnclassifiedSectorLabel(value) {
  const x = normalizeSearchText(value || '');
  return !x || x === '-' || x === 'altro' || x.includes('nuove idee') || x.includes('da analizzare') || x === 'catalogo generale';
}

function ensureSectorExists(shortName, fullName, color, icon) {
  const existingIndex = SECTORS.findIndex(s => normalizeSearchText(getSectorShortName(s)) === normalizeSearchText(shortName));
  if (existingIndex >= 0) return existingIndex;
  SECTORS.push({ name: fullName, color, icon, instruments: [] });
  sectorWeights.push(0);
  instrumentWeights.push([]);
  saveSectors();
  saveWeights();
  return SECTORS.length - 1;
}

function getOnlineSectorInfo(ticker) {
  const key = String(ticker || '').toUpperCase();
  return ONLINE_SECTOR_MAP_DATA[key] || null;
}

function mapExternalSectorToLocalIndex(rawSectorLabel) {
  const txt = normalizeSearchText(rawSectorLabel);
  if (!txt) return -1;
  if (txt.includes('technology')) return ensureSectorExists('Tecnologia', 'Tecnologia / Software & AI', '#6366f1', '💻');
  if (txt.includes('financial')) return ensureSectorExists('Finanza', 'Finanza / Asset Management', '#14b8a6', '🏦');
  if (txt.includes('health')) return ensureSectorExists('Salute', 'Salute / Pharma & Biotech', '#22c55e', '🧬');
  if (txt.includes('energy')) return ensureSectorExists('Energia', 'Energia / Oil, Gas & Utilities', '#f59e0b', '⚡');
  if (txt.includes('real estate')) return ensureSectorExists('Immobiliare', 'Immobiliare / REIT & Property', '#0ea5e9', '🏢');
  if (txt.includes('consumer')) return ensureSectorExists('Consumi', 'Consumi / Consumer Discretionary & Staples', '#f97316', '🛍️');
  if (txt.includes('communication')) return ensureSectorExists('Comunicazioni', 'Comunicazioni / Media & Telecom', '#8b5cf6', '📡');
  if (txt.includes('utilities')) return ensureSectorExists('Utilities', 'Utilities / Servizi Pubblici', '#22d3ee', '🔌');
  if (txt.includes('basic materials')) return ensureSectorExists('Materie Prime', 'Materie Prime / Industriali', '#f87171', '🔴');
  return -1;
}

function inferSectorByKeywords(ticker, name) {
  const online = getOnlineSectorInfo(ticker);
  const source = normalizeSearchText(`${ticker || ''} ${name || ''} ${online?.sector || ''} ${online?.industry || ''} ${fundData[ticker]?.sector || ''}`);
  const rules = [
    { key: 'Semiconduttori', full: 'Semiconduttori / AI Hardware', color: '#818cf8', icon: '🔵', words: ['semiconductor', 'chip', 'nvidia', 'asml', 'micron', 'intel'] },
    { key: 'Finanza', full: 'Finanza / Asset Management', color: '#14b8a6', icon: '🏦', words: ['bank', 'financial', 'asset', 'fund', 'insurance', 'blackrock', 'jpmorgan', 'goldman'] },
    { key: 'Salute', full: 'Salute / Pharma & Biotech', color: '#22c55e', icon: '🧬', words: ['health', 'pharma', 'biotech', 'drug', 'medical'] },
    { key: 'Energia', full: 'Energia / Oil, Gas & Utilities', color: '#f59e0b', icon: '⚡', words: ['energy', 'oil', 'gas', 'utility'] },
    { key: 'Data Center', full: 'Data Center & Infrastruttura', color: '#38bdf8', icon: '🔷', words: ['data center', 'infrastructure', 'reit'] },
    { key: 'Consumi', full: 'Consumi / Consumer Discretionary & Staples', color: '#f97316', icon: '🛍️', words: ['consumer', 'auto', 'retail', 'restaurants', 'food'] },
    { key: 'Materie Prime', full: 'Materie Prime / Industriali', color: '#f87171', icon: '🔴', words: ['materials', 'mining', 'metals', 'steel', 'copper', 'industrial'] }
  ];
  const found = rules.find(r => r.words.some(w => source.includes(w)));
  if (!found) return ensureSectorExists('Industriali', 'Industriali / Settori Vari', '#ef4444', '🏭');
  return ensureSectorExists(found.key, found.full, found.color, found.icon);
}

function resolveSectorIndexForTicker(ticker, name = '') {
  const key = String(ticker || '').toUpperCase();
  const tracked = getTrackedInstrumentByTicker(key);
  if (tracked?.sectorName && !isUnclassifiedSectorLabel(tracked.sectorName)) {
    const idx = SECTORS.findIndex(s => normalizeSearchText(getSectorShortName(s)) === normalizeSearchText(tracked.sectorName));
    if (idx >= 0) return idx;
  }
  const registry = getStockRegistryEntry(key);
  if (registry?.sector && !isUnclassifiedSectorLabel(registry.sector)) {
    const mappedRegistry = mapExternalSectorToLocalIndex(registry.sector);
    if (mappedRegistry >= 0) return mappedRegistry;
  }
  const online = getOnlineSectorInfo(key);
  if (online?.sector) {
    const mappedOnline = mapExternalSectorToLocalIndex(online.sector);
    if (mappedOnline >= 0) return mappedOnline;
  }
  const fdSector = fundData[key]?.sector;
  if (fdSector) {
    const mappedFund = mapExternalSectorToLocalIndex(fdSector);
    if (mappedFund >= 0) return mappedFund;
  }
  return inferSectorByKeywords(key, name);
}

function resolveSectorNameForTicker(ticker, name = '') {
  const idx = resolveSectorIndexForTicker(ticker, name);
  return idx >= 0 ? getSectorShortName(SECTORS[idx]) : 'Industriali';
}

function syncAllSectorData() {
  if (didGlobalSectorSync) return;
  const moves = [];
  SECTORS.forEach((sector, si) => {
    (sector.instruments || []).forEach(inst => {
      const current = getSectorShortName(sector);
      if (!isUnclassifiedSectorLabel(current)) return;
      const target = resolveSectorIndexForTicker(inst.ticker, inst.name);
      if (target >= 0 && target !== si) moves.push({ from: si, to: target, ticker: inst.ticker });
    });
  });
  moves.forEach(move => {
    const fromList = SECTORS[move.from]?.instruments || [];
    const idx = fromList.findIndex(i => i.ticker === move.ticker);
    if (idx < 0) return;
    const [inst] = fromList.splice(idx, 1);
    if (!SECTORS[move.to].instruments.some(i => i.ticker === inst.ticker)) {
      SECTORS[move.to].instruments.push(inst);
      instrumentWeights[move.to].push(0);
    }
  });

  // Remove legacy "Nuove Idee" sectors after migration.
  for (let i = SECTORS.length - 1; i >= 0; i -= 1) {
    const shortName = normalizeSearchText(getSectorShortName(SECTORS[i]));
    if ((shortName.includes('nuove idee') || shortName.includes('da analizzare')) && !(SECTORS[i].instruments || []).length) {
      SECTORS.splice(i, 1);
      sectorWeights.splice(i, 1);
      instrumentWeights.splice(i, 1);
    }
  }

  let opChanged = 0;
  operazioni = operazioni.map(op => {
    const cur = op.settore || '';
    if (!isUnclassifiedSectorLabel(cur)) return op;
    const resolved = resolveSectorNameForTicker(op.ticker, op.nome || '');
    if (resolved === cur) return op;
    opChanged += 1;
    return { ...op, settore: resolved };
  });

  if (moves.length > 0) {
    saveSectors();
    saveWeights();
  }
  const registryCandidates = new Set([
    ...getAllInstruments().map(item => item.ticker),
    ...operazioni.map(op => op.ticker),
    ...Object.keys(fundData || {}),
    ...Object.keys(ONLINE_SECTOR_MAP_DATA || {})
  ]);
  registryCandidates.forEach(ticker => {
    if (!ticker) return;
    const instrument = getInstrumentByTicker(ticker);
    const resolved = resolveSectorNameForTicker(ticker, instrument?.name || '');
    ensureStockRegistryEntry(ticker, {
      name: instrument?.name || ticker,
      type: instrument?.type || 'Azione',
      sector: resolved,
      sources: buildDefaultSources(ticker),
      updatedBy: 'global-sync'
    }, false);
  });
  if (registryCandidates.size > 0) saveStockRegistry();
  if (opChanged > 0) saveOperazioni();
  didGlobalSectorSync = true;
}

function addCatalogInstrumentToWatchlist(ticker, sectorIndex, fallbackName = '') {
  let instrument = getInstrumentByTicker(ticker);
  if (!instrument) {
    const created = addOrUpdateStockCatalogEntry(ticker, fallbackName || ticker, 'Azione');
    instrument = created || getInstrumentByTicker(ticker);
  }
  if (!instrument) return false;
  if (getTrackedInstrumentByTicker(instrument.ticker)) return true;
  const targetIndex = Number.isInteger(sectorIndex) ? sectorIndex : resolveSectorIndexForTicker(instrument.ticker, instrument.name);
  SECTORS[targetIndex].instruments.push({
    name: instrument.name,
    ticker: instrument.ticker,
    type: instrument.type || 'Azione',
    yahoo: instrument.yahoo || instrument.ticker,
    notes: ''
  });
  instrumentWeights[targetIndex].push(0);
  stockStatus[instrument.ticker] = true;
  ensureStockRegistryEntry(instrument.ticker, {
    name: instrument.name,
    type: instrument.type || 'Azione',
    sector: getSectorShortName(SECTORS[targetIndex]),
    sources: buildDefaultSources(instrument.ticker),
    updatedBy: 'watchlist'
  });
  saveSectors();
  saveWeights();
  saveStockStatus();
  return true;
}

function buildStockMasterDataset() {
  const allRows = Object.values(STOCK_UNIVERSE_MAP);
  return allRows
    .filter(item => item?.ticker)
    .map(item => {
      const ticker = String(item.ticker || '').toUpperCase();
      const tracked = getTrackedInstrumentByTicker(ticker);
      const registry = getStockRegistryEntry(ticker);
      const online = getOnlineSectorInfo(ticker);
      const baseSector = tracked?.sectorName || registry?.sector || online?.sector || fundData[ticker]?.sector || '';
      return {
        ticker,
        name: registry?.name || item.name || ticker,
        type: item.type || registry?.type || 'Azione',
        cik: item.cik || null,
        settore: baseSector || 'N/D',
        industry: online?.industry || registry?.industry || '',
        tracked: !!tracked,
        sources: registry?.sources || buildDefaultSources(ticker)
      };
    })
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
}

function exportStockMasterFile() {
  const payload = {
    generatedAt: new Date().toISOString(),
    total: Object.keys(STOCK_UNIVERSE_MAP).length,
    tracked: getAllInstruments().length,
    items: buildStockMasterDataset()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `stock_master_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ─── Sync from reports/stock_master_latest.json ───
// Loads saved stock registry data (sector, name, sources) from the last script run.
// Works on HTTP server; silently falls back to embedded data on file://
function trySyncStockMasterJSON() {
  fetch('reports/stock_master_latest.json')
    .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(data => {
      const items = data.items || [];
      if (!items.length) return;
      let updated = 0;
      items.forEach(row => {
        if (!row.ticker) return;
        const existing = stockRegistry[row.ticker.toUpperCase()];
        // Only update if the JSON is newer or registry has no data
        if (!existing || (row.sector && !existing.sector)) {
          ensureStockRegistryEntry(row.ticker, {
            name: row.name || existing?.name || row.ticker,
            type: row.type || existing?.type || 'Azione',
            sector: row.sector || existing?.sector || '',
            industry: row.industry || existing?.industry || '',
            sources: row.sources || existing?.sources || buildDefaultSources(row.ticker),
            updatedBy: 'stock-master-json'
          }, false);
          updated++;
        }
      });
      if (updated > 0) {
        saveStockRegistry();
        rebuildStockUniverseMap();
        // Refresh catalog panel if it's open
        if (document.getElementById('portfolio-master-results')) renderPortfolioMasterCatalog();
      }
    })
    .catch(() => { /* Silently fall back to embedded data */ });
}

// ─── Sync from reports/online_sector_map_latest.json ───
// Loads the latest sector/industry mapping generated by update-online-sector-map.js
function trySyncOnlineSectorMapJSON() {
  fetch('reports/online_sector_map_latest.json')
    .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(data => {
      const map = data.map || {};
      if (!map || !Object.keys(map).length) return;
      // Merge into ONLINE_SECTOR_MAP_DATA if it's the same or newer
      const existing = ONLINE_SECTOR_MAP_DATA || {};
      let added = 0;
      Object.entries(map).forEach(([ticker, info]) => {
        if (!existing[ticker]) { existing[ticker] = info; added++; }
      });
      if (added > 0 && typeof syncAllSectorData === 'function') {
        didGlobalSectorSync = false; // Reset to allow re-sync with new data
        syncAllSectorData();
      }
    })
    .catch(() => { /* Silently fall back */ });
}
