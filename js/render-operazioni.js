// ═══════════════════════════════════════════════════
// ENHANCED OPERATIONS MODULE v4.0
// Bidirectional math · Full stock autocomplete · Portfolio sync
// ═══════════════════════════════════════════════════

let opFilterStockStatus = '';
let editingOperationId = null;

function parseLocaleNumber(rawValue) {
  let normalized = String(rawValue ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[€$£]/g, '');
  if (!normalized) return 0;
  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');
  if (hasComma && hasDot) {
    if (normalized.lastIndexOf(',') > normalized.lastIndexOf('.')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = normalized.replace(/,/g, '');
    }
  } else if (hasComma) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = normalized.replace(/,/g, '');
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

function getOnlineSectorInfoLocal(ticker) {
  const key = String(ticker || '').toUpperCase();
  const mapRoot = (typeof ONLINE_SECTOR_MAP_DYNAMIC !== 'undefined' && ONLINE_SECTOR_MAP_DYNAMIC?.map) ? ONLINE_SECTOR_MAP_DYNAMIC.map : {};
  return mapRoot[key] || null;
}

function getKnownSectorOptions() {
  const sel = document.getElementById('op-settore');
  if (!sel) return [];
  return [...sel.options]
    .map(option => option.value)
    .filter(value => value);
}

function ensureLocalSectorOption(shortName, fullName, color, icon) {
  const ensureOption = (value) => {
    const sel = document.getElementById('op-settore');
    if (!sel || !value) return;
    const exists = [...sel.options].some(option => option.value === value);
    if (exists) return;
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    sel.appendChild(opt);
  };

  const byShort = SECTORS.find(s => normalizeSearchText(s.name.split('/')[0].trim()) === normalizeSearchText(shortName));
  if (byShort) {
    const existing = byShort.name.split('/')[0].trim();
    ensureOption(existing);
    return existing;
  }
  SECTORS.push({ name: fullName, color, icon, instruments: [] });
  sectorWeights.push(0);
  instrumentWeights.push([]);
  saveSectors();
  saveWeights();
  const created = fullName.split('/')[0].trim();
  ensureOption(created);
  return created;
}

function inferMacroSectorFromInstrument(ticker, name) {
  const online = getOnlineSectorInfoLocal(ticker);
  const source = normalizeSearchText(`${ticker || ''} ${name || ''} ${fundData[ticker]?.sector || ''} ${online?.sector || ''} ${online?.industry || ''}`);
  const macros = [
    {
      short: 'Finanza',
      full: 'Finanza / Asset Management',
      color: '#14b8a6',
      icon: '🏦',
      keys: ['bank', 'capital', 'financial', 'finance', 'asset', 'fund', 'insurance', 'blackrock', 'jpmorgan', 'morgan', 'goldman', 'banc', 'credit']
    },
    {
      short: 'Tecnologia',
      full: 'Tecnologia / Software & AI',
      color: '#6366f1',
      icon: '💻',
      keys: ['software', 'tech', 'cloud', 'data', 'semiconductor', 'chip', 'ai', 'digital', 'cyber', 'saas']
    },
    {
      short: 'Salute',
      full: 'Salute / Pharma & Biotech',
      color: '#22c55e',
      icon: '🧬',
      keys: ['pharma', 'biotech', 'medical', 'health', 'therapeutics', 'hospital', 'diagnostic']
    },
    {
      short: 'Energia',
      full: 'Energia / Oil, Gas & Utilities',
      color: '#f59e0b',
      icon: '⚡',
      keys: ['energy', 'oil', 'gas', 'renewable', 'solar', 'utility', 'petro', 'power']
    },
    {
      short: 'Industriali',
      full: 'Industriali / Materials & Manufacturing',
      color: '#ef4444',
      icon: '🏭',
      keys: ['industrial', 'materials', 'steel', 'mining', 'metals', 'chemical', 'logistics', 'freight']
    },
    {
      short: 'Consumi',
      full: 'Consumi / Consumer Discretionary & Staples',
      color: '#f97316',
      icon: '🛍️',
      keys: ['consumer', 'retail', 'auto', 'automaker', 'apparel', 'restaurants', 'food', 'beverage', 'leisure']
    },
    {
      short: 'Immobiliare',
      full: 'Immobiliare / REIT & Property',
      color: '#0ea5e9',
      icon: '🏢',
      keys: ['real estate', 'reit', 'property', 'mortgage']
    }
  ];
  const found = macros.find(m => m.keys.some(k => source.includes(k)));
  if (!found) return '';
  return ensureLocalSectorOption(found.short, found.full, found.color, found.icon);
}

function findBestSectorMatch(rawSectorLabel) {
  const label = normalizeSearchText(rawSectorLabel);
  if (!label) return '';
  const options = getKnownSectorOptions();
  return options.find(option => {
    const normalizedOption = normalizeSearchText(option);
    return normalizedOption.includes(label) || label.includes(normalizedOption);
  }) || '';
}

function mapExternalSectorToLocal(rawSectorLabel) {
  if (!rawSectorLabel) return '';
  const matched = findBestSectorMatch(rawSectorLabel);
  if (matched) return matched;
  const normalized = normalizeSearchText(rawSectorLabel);
  if (normalized.includes('technology')) return ensureLocalSectorOption('Tecnologia', 'Tecnologia / Software & AI', '#6366f1', '💻');
  if (normalized.includes('financial')) return ensureLocalSectorOption('Finanza', 'Finanza / Asset Management', '#14b8a6', '🏦');
  if (normalized.includes('health')) return ensureLocalSectorOption('Salute', 'Salute / Pharma & Biotech', '#22c55e', '🧬');
  if (normalized.includes('energy')) return ensureLocalSectorOption('Energia', 'Energia / Oil, Gas & Utilities', '#f59e0b', '⚡');
  if (normalized.includes('real estate')) return ensureLocalSectorOption('Immobiliare', 'Immobiliare / REIT & Property', '#0ea5e9', '🏢');
  if (normalized.includes('consumer')) return ensureLocalSectorOption('Consumi', 'Consumi / Consumer Discretionary & Staples', '#f97316', '🛍️');
  return ensureLocalSectorOption(rawSectorLabel, `${rawSectorLabel} / Online Sync`, '#3b82f6', '🧭');
}

function getAutoSectorForTicker(ticker) {
  const instrument = getInstrumentByTicker(ticker);
  return resolveSectorNameForTicker(ticker, instrument?.name || '');
}

function isUnclassifiedSectorValue(value) {
  const normalized = normalizeSearchText(value || '');
  return !normalized || normalized === '-' || normalized === 'altro' || normalized === 'n a' || normalized === 'na' || normalized.includes('nuove idee') || normalized.includes('da analizzare');
}

function migrateHistoricalOperationSectors() {
  let changed = 0;
  operazioni = operazioni.map(op => {
    const currentSector = (op.settore || '').trim();
    if (!isUnclassifiedSectorValue(currentSector)) return op;
    const autoSector = getAutoSectorForTicker(op.ticker) || inferMacroSectorFromInstrument(op.ticker, op.nome || '');
    if (!autoSector || autoSector === currentSector) return op;
    changed += 1;
    return { ...op, settore: autoSector };
  });
  if (changed > 0) saveOperazioni();
}

// ════════════════════════════════════════════════════
// BIDIRECTIONAL MATH CALCULATOR
// ════════════════════════════════════════════════════
// Fields: prezzo(①) × qty(②) = lordo(③) + comm(④) = netto(⑤)
// Any field changed recalculates the others.
// Rule: if netto is changed → recalculate comm (comm = lordo - netto)
// Rule: if lordo is changed → recalculate prezzo (prezzo = lordo / qty)
// Rule: if prezzo or qty changed → recalculate lordo, netto

function calcOpBidirectional(changedField) {
  const prezzo  = () => parseLocaleNumber(document.getElementById('op-prezzo')?.value);
  const qty     = () => Math.max(0, parseLocaleNumber(document.getElementById('op-qty')?.value));
  const lordo   = () => parseLocaleNumber(document.getElementById('op-totale-lordo')?.value);
  const comm    = () => parseLocaleNumber(document.getElementById('op-comm')?.value);
  const netto   = () => parseLocaleNumber(document.getElementById('op-totale-netto')?.value);

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== null && !isNaN(val)) el.value = val > 0 ? val.toFixed(2) : '';
  };

  let p = prezzo(), q = qty(), l = lordo(), c = comm(), n = netto();
  let explain = '';

  switch(changedField) {
    case 'prezzo':
    case 'qty':
      // ① or ② changed → recalculate ③ lordo, then ⑤ netto
      if (p > 0 && q > 0) {
        l = parseFloat((p * q).toFixed(4));
        set('op-totale-lordo', l);
        n = parseFloat((l + c).toFixed(4));
        set('op-totale-netto', n);
        explain = `① Prezzo ${p} × ② Qty ${q} = ③ Lordo ${l.toFixed(2)} + ④ Comm ${c.toFixed(2)} = ⑤ Netto ${n.toFixed(2)}`;
      }
      break;

    case 'lordo':
      // ③ changed → recalculate ① prezzo (if qty known), and ⑤ netto
      if (l > 0) {
        if (q > 0) {
          p = parseFloat((l / q).toFixed(4));
          set('op-prezzo', p);
        }
        n = parseFloat((l + c).toFixed(4));
        set('op-totale-netto', n);
        explain = `③ Lordo ${l.toFixed(2)} ÷ ② Qty ${q||'?'} = ① Prezzo/Az ${p.toFixed(2)} | ③ ${l.toFixed(2)} + ④ Comm ${c.toFixed(2)} = ⑤ Netto ${n.toFixed(2)}`;
      }
      break;

    case 'comm':
      // ④ changed → recalculate ⑤ netto
      if (p > 0 && q > 0) {
        l = parseFloat((p * q).toFixed(4));
        set('op-totale-lordo', l);
      }
      if (l > 0) {
        n = parseFloat((l + c).toFixed(4));
        set('op-totale-netto', n);
        explain = `③ Lordo ${l.toFixed(2)} + ④ Comm ${c.toFixed(2)} = ⑤ Netto ${n.toFixed(2)}`;
      }
      break;

    case 'netto':
      // ⑤ changed → recalculate ④ comm (comm = netto - lordo), or ③ lordo if lordo not set
      if (l > 0 && n > 0) {
        c = parseFloat((n - l).toFixed(4));
        set('op-comm', c);
        explain = `⑤ Netto ${n.toFixed(2)} − ③ Lordo ${l.toFixed(2)} = ④ Comm ${c.toFixed(2)}`;
      } else if (p > 0 && q > 0 && n > 0) {
        l = parseFloat((p * q).toFixed(4));
        set('op-totale-lordo', l);
        c = parseFloat((n - l).toFixed(4));
        set('op-comm', c);
        explain = `① ${p}×② ${q}=③ ${l.toFixed(2)} | ⑤ Netto ${n.toFixed(2)}−③ ${l.toFixed(2)}=④ Comm ${c.toFixed(2)}`;
      }
      break;
  }

  const exEl = document.getElementById('op-calc-explain');
  if (exEl) exEl.textContent = explain ? '📐 ' + explain : '';

  // Show/hide the +/- sign based on operation type
  const tipo = document.getElementById('op-tipo')?.value;
  const sign = document.getElementById('op-calc-sign');
  if (sign) sign.textContent = tipo === 'VENDITA' ? '−' : '+';
}

// ════════════════════════════════════════════════════
// ENHANCED AUTOCOMPLETE — full stock data
// ════════════════════════════════════════════════════
function fillOperationFormFromInstrument(ins) {
  document.getElementById('op-ticker').value = ins.ticker;
  document.getElementById('op-nome').value = ins.name || '';

  const sel = document.getElementById('op-settore');
  const autoSector = resolveSectorNameForTicker(ins.ticker, ins.name || '');
  if (autoSector && [...sel.options].some(option => option.value === autoSector)) sel.value = autoSector;
  else sel.value = autoSector;

  const fd = fundData[ins.ticker];
  if (fd) {
    const valuta = document.getElementById('op-valuta');
    if (valuta) {
      valuta.value = fd.currency === 'EUR' ? 'EUR' : fd.currency === 'GBP' ? 'GBP' : 'USD';
    }
    if (fd.price) {
      document.getElementById('op-prezzo').value = fd.price;
      calcOpBidirectional('prezzo');
    }
  } else {
    const existingValuta = document.getElementById('op-valuta');
    if (existingValuta && !existingValuta.value) existingValuta.value = 'USD';
  }
}

function findInstrumentMatches(rawQuery) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return [];
  return sortSearchMatches(getSearchableInstruments().filter(ins =>
    normalizeSearchText(ins.ticker).includes(query) ||
    normalizeSearchText(ins.name).includes(query) ||
    normalizeSearchText(ins.sectorName || '').includes(query)
  ), query);
}

function resolveInstrument(rawValue) {
  const value = normalizeSearchText(rawValue);
  if (!value) return null;
  const instruments = getSearchableInstruments();
  return instruments.find(ins =>
    normalizeSearchText(ins.ticker) === value ||
    normalizeSearchText(ins.name) === value
  ) || sortSearchMatches(instruments.filter(ins =>
    normalizeSearchText(ins.ticker).startsWith(value) ||
    normalizeSearchText(ins.name).startsWith(value)
  ), value)[0] || null;
}

function setupTickerAutocomplete() {
  const input = document.getElementById('op-ticker');
  const dropdown = document.getElementById('ticker-autocomplete');
  const nameInput = document.getElementById('op-nome');
  const nameDropdown = document.getElementById('name-autocomplete');
  if (!input || !dropdown || !nameInput || !nameDropdown) return;

  function bindAutocomplete(field, list, mode) {
    let selectedIndex = -1;
    let matches = [];

    field.addEventListener('input', () => {
      const query = normalizeSearchText(field.value);
      selectedIndex = -1;
      if (query.length < 1) { list.classList.remove('show'); return; }

      matches = findInstrumentMatches(query).slice(0, 12);
      if (!matches.length) { list.classList.remove('show'); return; }

      list.innerHTML = matches.map((ins, idx) => {
      const active = isStockActive(ins.ticker);
      const fd = fundData[ins.ticker];
      const price = fd ? `<span style="color:var(--green);font-size:9px;font-family:monospace;">${fd.currency === 'EUR' ? '€' : '$'}${fd.price}</span>` : '';
      const signal = fd ? `<span class="badge badge-${fd.signalColor === 'green' ? 'accum' : fd.signalColor === 'red' ? 'distrib' : 'neutro'}" style="font-size:8px;padding:1px 5px;">${fd.signal}</span>` : '';
      const currency = fd ? `<span style="font-size:8px;color:var(--dim);">${fd.currency || 'USD'}</span>` : '';
      // Find sector color
      const sector = SECTORS.find(s => s.instruments.some(i => i.ticker === ins.ticker));
      const sectorColor = sector ? sector.color : '#3b82f6';

      return `<div class="autocomplete-item" data-index="${idx}">
        <div style="display:flex;flex-direction:column;width:100%;gap:2px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="ac-ticker" style="color:${sectorColor};">${active ? '🟢' : '🔴'} ${ins.ticker}</span>
            ${currency}
            ${price}
            ${signal}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="ac-name">${ins.name}</span>
            <span style="font-size:8px;color:${sectorColor};opacity:.8;">${ins.sectorName || 'Catalogo generale'}</span>
          </div>
        </div>
      </div>`;
      }).join('');
      list.classList.add('show');

      list.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('mousedown', e => {
          e.preventDefault();
          selectAutocompleteItem(matches[+item.dataset.index]);
        });
      });
    });

    field.addEventListener('keydown', e => {
      if (!list.classList.contains('show')) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, matches.length - 1); highlightAC(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, -1); highlightAC(); }
      else if (e.key === 'Enter' && selectedIndex >= 0) { e.preventDefault(); selectAutocompleteItem(matches[selectedIndex]); }
      else if (e.key === 'Enter') {
        const resolved = resolveInstrument(field.value);
        if (resolved) { e.preventDefault(); selectAutocompleteItem(resolved); }
      }
      else if (e.key === 'Escape') { list.classList.remove('show'); }
    });

    field.addEventListener('blur', () => {
      setTimeout(() => {
        list.classList.remove('show');
        const resolved = resolveInstrument(field.value);
        if (resolved) fillOperationFormFromInstrument(resolved);
      }, 150);
    });

    function highlightAC() {
      list.querySelectorAll('.autocomplete-item').forEach((item, i) => {
        item.classList.toggle('selected', i === selectedIndex);
      });
      const sel = list.querySelector('.autocomplete-item.selected');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }

    function selectAutocompleteItem(ins) {
      fillOperationFormFromInstrument(ins);
      dropdown.classList.remove('show');
      nameDropdown.classList.remove('show');
      matches = [];
      selectedIndex = -1;
      if (mode === 'ticker') document.getElementById('op-qty')?.focus();
      if (mode === 'name') document.getElementById('op-qty')?.focus();
    }
  }

  bindAutocomplete(input, dropdown, 'ticker');
  bindAutocomplete(nameInput, nameDropdown, 'name');
}

// ════════════════════════════════════════════════════
// ADD OPERATION
// ════════════════════════════════════════════════════
function aggiungiOperazione() {
  const data    = document.getElementById('op-data').value;
  const rawTicker = document.getElementById('op-ticker').value.trim();
  const rawNome   = document.getElementById('op-nome').value.trim();
  const resolvedInstrument = resolveInstrument(rawTicker) || resolveInstrument(rawNome);
  const ticker  = (resolvedInstrument?.ticker || rawTicker).trim().toUpperCase();
  const nome    = (resolvedInstrument?.name || rawNome).trim();
  const settore = document.getElementById('op-settore').value || resolveSectorNameForTicker(ticker, nome || resolvedInstrument?.name || '');
  const tipo    = document.getElementById('op-tipo').value;
  const valuta  = document.getElementById('op-valuta')?.value || (fundData[ticker]?.currency === 'GBP' ? 'GBP' : fundData[ticker]?.currency === 'USD' ? 'USD' : 'EUR');
  const prezzo  = parseLocaleNumber(document.getElementById('op-prezzo').value);
  const qty     = Math.max(0, parseLocaleNumber(document.getElementById('op-qty').value));
  const comm    = parseLocaleNumber(document.getElementById('op-comm').value);
  const lordo   = parseLocaleNumber(document.getElementById('op-totale-lordo').value) || (prezzo * qty);
  const netto   = parseLocaleNumber(document.getElementById('op-totale-netto').value) || (lordo + comm);
  const note    = document.getElementById('op-note').value.trim();

  if (!data || !ticker || prezzo <= 0 || qty <= 0) {
    alert('Compila almeno: Data, Ticker, Prezzo/Az. e Quantità'); return;
  }

  const ensuredCatalogInstrument = addOrUpdateStockCatalogEntry(ticker, nome || resolvedInstrument?.name || ticker, resolvedInstrument?.type || 'Azione');
  const finalInstrument = resolvedInstrument || ensuredCatalogInstrument || getInstrumentByTicker(ticker);
  if (finalInstrument) fillOperationFormFromInstrument(finalInstrument);
  if (!getTrackedInstrumentByTicker(ticker)) {
    addCatalogInstrumentToWatchlist(ticker, undefined, nome || finalInstrument?.name || ticker);
  }

  const trackedInstrument = getTrackedInstrumentByTicker(ticker);
  const selectedSector = document.getElementById('op-settore').value;
  const autoSector = trackedInstrument?.sectorName || getAutoSectorForTicker(ticker) || resolveSectorNameForTicker(ticker, nome || finalInstrument?.name || '');
  const settoreFinale = (!selectedSector || isUnclassifiedSectorValue(selectedSector)) ? (autoSector || settore) : selectedSector;

  const operationPayload = {
    id: editingOperationId || Date.now(), data, ticker, nome, settore: settoreFinale, tipo, valuta,
    prezzo, qty,
    totale: lordo,        // gross
    totaleNetto: netto,   // net (including commissions)
    comm, note
  };

  if (editingOperationId) {
    operazioni = operazioni.map(op => op.id === editingOperationId ? operationPayload : op);
  } else {
    operazioni.push(operationPayload);
  }

  saveOperazioni();
  if (typeof onOperazioniSaved === 'function') onOperazioniSaved();
  renderOperazioni();
  // SYNC: update portfolio real positions
  renderRealPortfolio();

  resetOperationForm();
}

function resetOperationForm() {
  ['op-data','op-ticker','op-nome','op-prezzo','op-qty','op-comm','op-totale-lordo','op-totale-netto','op-note'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('op-settore').value = '';
  document.getElementById('op-valuta').value = 'EUR';
  document.getElementById('op-tipo').value = 'ACQUISTO';
  document.getElementById('op-calc-explain').textContent = '';
  editingOperationId = null;
  const submitBtn = document.getElementById('op-submit-btn');
  const cancelBtn = document.getElementById('op-cancel-edit');
  if (submitBtn) submitBtn.textContent = '➕ Aggiungi Operazione';
  if (cancelBtn) cancelBtn.style.display = 'none';
  const sign = document.getElementById('op-calc-sign');
  if (sign) sign.textContent = '+';
}

function modificaOperazione(id) {
  const op = operazioni.find(item => item.id === id);
  if (!op) return;
  editingOperationId = id;
  document.getElementById('op-data').value = op.data || '';
  document.getElementById('op-ticker').value = op.ticker || '';
  document.getElementById('op-nome').value = op.nome || '';
  document.getElementById('op-settore').value = op.settore || '';
  document.getElementById('op-valuta').value = op.valuta || 'EUR';
  document.getElementById('op-tipo').value = op.tipo || 'ACQUISTO';
  document.getElementById('op-prezzo').value = op.prezzo || '';
  document.getElementById('op-qty').value = op.qty || '';
  document.getElementById('op-comm').value = op.comm || '';
  document.getElementById('op-totale-lordo').value = op.totale || '';
  document.getElementById('op-totale-netto').value = op.totaleNetto || '';
  document.getElementById('op-note').value = op.note || '';
  const submitBtn = document.getElementById('op-submit-btn');
  const cancelBtn = document.getElementById('op-cancel-edit');
  if (submitBtn) submitBtn.textContent = '💾 Salva Modifiche';
  if (cancelBtn) cancelBtn.style.display = '';
  calcOpBidirectional('qty');
  document.getElementById('op-data')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function annullaModificaOperazione() {
  resetOperationForm();
}

// ════════════════════════════════════════════════════
// DELETE OPERATION
// ════════════════════════════════════════════════════
function eliminaOperazione(id) {
  if (!confirm('Eliminare questa operazione?')) return;
  operazioni = operazioni.filter(o => o.id !== id);
  saveOperazioni();
  if (typeof onOperazioniSaved === 'function') onOperazioniSaved();
  renderOperazioni();
  renderRealPortfolio();
}

// ════════════════════════════════════════════════════
// FILTER BAR — synced with Screener
// ════════════════════════════════════════════════════
function renderOpFilters() {
  const container = document.getElementById('op-filters-container');
  if (!container) return;

  const allInstruments = getAllInstruments();
  const uniqueTickers  = [...new Set(allInstruments.map(i => i.ticker))].sort();
  const opTickers      = [...new Set(operazioni.map(o => o.ticker))].filter(t => !uniqueTickers.includes(t)).sort();
  const allTickers     = [...uniqueTickers, ...opTickers];
  const sectorOptions  = [...new Set(SECTORS.map(s => s.name.split('/')[0].trim()))];

  container.innerHTML = `
    <div class="op-filters">
      <div class="form-group"><label>📌 Stock</label>
        <select id="opFilterStock" style="width:190px;">
          <option value="">Tutti gli stock</option>
          <optgroup label="🟢 Attivi">
            ${allTickers.filter(t => isStockActive(t)).map(t => {
              const ins = allInstruments.find(i => i.ticker === t);
              return `<option value="${t}" ${opFilterTicker===t?'selected':''}>${t}${ins?' — '+ins.name.substring(0,22):''}</option>`;
            }).join('')}
          </optgroup>
          ${allTickers.filter(t=>!isStockActive(t)).length ? `<optgroup label="🔴 Disattivati">
            ${allTickers.filter(t => !isStockActive(t)).map(t => {
              const ins = allInstruments.find(i => i.ticker === t);
              return `<option value="${t}" ${opFilterTicker===t?'selected':''}>${t}${ins?' — '+ins.name.substring(0,22):''}</option>`;
            }).join('')}
          </optgroup>` : ''}
        </select>
      </div>
      <div class="form-group"><label>Tipo</label>
        <select id="opFilterType" style="width:115px;">
          <option value="">Tutti</option>
          <option value="ACQUISTO" ${opFilterType==='ACQUISTO'?'selected':''}>🟢 ACQUISTO</option>
          <option value="VENDITA"  ${opFilterType==='VENDITA' ?'selected':''}>🔴 VENDITA</option>
        </select>
      </div>
      <div class="form-group"><label>Settore</label>
        <select id="opFilterSector" style="width:160px;">
          <option value="">Tutti i settori</option>
          ${sectorOptions.map(s=>`<option ${opFilterSector===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Stato Stock</label>
        <select id="opFilterStatus" style="width:120px;">
          <option value=""  ${opFilterStockStatus===''       ?'selected':''}>Tutti</option>
          <option value="active"   ${opFilterStockStatus==='active'  ?'selected':''}>🟢 Attivi</option>
          <option value="inactive" ${opFilterStockStatus==='inactive'?'selected':''}>🔴 Disattivati</option>
        </select>
      </div>
      <div class="form-group"><label>Da</label><input type="date" id="opFilterDateFrom" value="${opFilterDateFrom}" style="width:130px;"/></div>
      <div class="form-group"><label>A</label> <input type="date" id="opFilterDateTo"   value="${opFilterDateTo}"   style="width:130px;"/></div>
      <div class="form-group"><button class="btn xs ghost" onclick="resetOpFilters()">↺ Reset</button></div>
    </div>
    <div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap;" id="op-quick-tickers"></div>`;

  // Quick buttons — active stocks only
  const qc = document.getElementById('op-quick-tickers');
  if (qc) {
    const activeStocks = allInstruments.filter(i => isStockActive(i.ticker));
    qc.innerHTML = activeStocks.map(ins =>
      `<button class="filter-btn ${opFilterTicker===ins.ticker?'active':''}" data-quickticker="${ins.ticker}">${ins.ticker}</button>`
    ).join('');
    qc.querySelectorAll('[data-quickticker]').forEach(btn => {
      btn.addEventListener('click', () => {
        opFilterTicker = opFilterTicker === btn.dataset.quickticker ? '' : btn.dataset.quickticker;
        document.getElementById('opFilterStock').value = opFilterTicker;
        renderOperazioni();
      });
    });
  }

  // Listeners
  document.getElementById('opFilterStock')?.addEventListener('change', e => { opFilterTicker = e.target.value; renderOperazioni(); });
  ['opFilterType','opFilterSector','opFilterStatus','opFilterDateFrom','opFilterDateTo'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyOpFilters);
  });
}

function resetOpFilters() {
  opFilterTicker = ''; opFilterType = ''; opFilterSector = '';
  opFilterDateFrom = ''; opFilterDateTo = ''; opFilterStockStatus = '';
  renderOperazioni();
}

function applyOpFilters() {
  opFilterTicker      = document.getElementById('opFilterStock')?.value      || '';
  opFilterType        = document.getElementById('opFilterType')?.value       || '';
  opFilterSector      = document.getElementById('opFilterSector')?.value     || '';
  opFilterStockStatus = document.getElementById('opFilterStatus')?.value     || '';
  opFilterDateFrom    = document.getElementById('opFilterDateFrom')?.value   || '';
  opFilterDateTo      = document.getElementById('opFilterDateTo')?.value     || '';

  let filtered = [...operazioni];
  if (opFilterTicker)      filtered = filtered.filter(o => o.ticker === opFilterTicker);
  if (opFilterType)        filtered = filtered.filter(o => o.tipo   === opFilterType);
  if (opFilterSector)      filtered = filtered.filter(o => (o.settore||'').startsWith(opFilterSector));
  if (opFilterStockStatus === 'active')   filtered = filtered.filter(o =>  isStockActive(o.ticker));
  if (opFilterStockStatus === 'inactive') filtered = filtered.filter(o => !isStockActive(o.ticker));
  if (opFilterDateFrom)    filtered = filtered.filter(o => o.data >= opFilterDateFrom);
  if (opFilterDateTo)      filtered = filtered.filter(o => o.data <= opFilterDateTo);

  renderFilteredTable(filtered);
}

// ════════════════════════════════════════════════════
// RENDER FILTERED TABLE
// ════════════════════════════════════════════════════
function buildPmcMap() {
  // Returns {ticker → pmc_at_each_sale_id} for P&L calc
  const pos = {};
  const pmcMap = {};
  const sorted = [...operazioni].sort((a,b) => (a.data||'').localeCompare(b.data||'') || a.id - b.id);
  sorted.forEach(op => {
    if (!pos[op.ticker]) pos[op.ticker] = { qty:0, costo:0 };
    if (op.tipo === 'ACQUISTO') {
      pos[op.ticker].qty  += op.qty;
      pos[op.ticker].costo += (op.totaleNetto || op.totale + op.comm);
    } else {
      const pmc = pos[op.ticker].qty > 0 ? pos[op.ticker].costo / pos[op.ticker].qty : 0;
      pmcMap[op.id] = pmc;
      pos[op.ticker].qty   -= op.qty;
      pos[op.ticker].costo = pos[op.ticker].qty > 0 ? pos[op.ticker].qty * pmc : 0;
    }
  });
  return pmcMap;
}

function renderFilteredTable(filtered) {
  const tbody = document.getElementById('op-tbody');
  tbody.innerHTML = '';
  document.getElementById('op-empty').style.display  = filtered.length ? 'none' : '';
  document.getElementById('op-table').style.display  = filtered.length ? '' : 'none';

  const pmcMap = buildPmcMap();
  let totInv = 0, totPnl = 0;

  filtered.forEach(op => {
    let pnlStr = '—';
    const active = isStockActive(op.ticker);
    const curr = op.valuta === 'EUR' ? '€' : op.valuta === 'GBP' ? '£' : '$';
    const lordo  = op.totale      || (op.prezzo * op.qty);
    const netto  = op.totaleNetto || (lordo + op.comm);

    if (op.tipo === 'VENDITA') {
      const pmc = pmcMap[op.id] || 0;
      const pnl = (op.prezzo - pmc) * op.qty - op.comm;
      totPnl += pnl;
      pnlStr = `<span class="${pnl>=0?'pnl-positive':'pnl-negative'}">${pnl>=0?'+':''}${curr}${Math.abs(pnl).toFixed(2)}</span>`;
    } else {
      totInv += netto;
    }

    const fd = fundData[op.ticker];
    const prezzoAtt = fd ? `<span style="font-size:9px;color:var(--muted);">att:${curr}${fd.price}</span>` : '';

    tbody.innerHTML += `<tr style="opacity:${active?'1':'0.55'};">
      <td>${op.data}</td>
      <td><span class="ticker-link" onclick="openStockModal('${op.ticker}')">${active?'🟢':'🔴'} ${op.ticker}</span></td>
      <td style="font-size:11px;">${op.nome||'—'}</td>
      <td style="font-size:10px;color:var(--dim);">${op.settore||'—'}</td>
      <td><span class="badge ${op.tipo==='ACQUISTO'?'badge-buy':'badge-sell'}">${op.tipo}</span></td>
      <td style="font-family:monospace;">${curr}${op.prezzo.toFixed(2)}<br>${prezzoAtt}</td>
      <td style="font-family:monospace;">${op.qty}</td>
      <td style="font-family:monospace;">${curr}${lordo.toFixed(2)}</td>
      <td style="font-family:monospace;color:var(--yellow);">${curr}${op.comm.toFixed(2)}</td>
      <td style="font-family:monospace;font-weight:600;">${curr}${netto.toFixed(2)}</td>
      <td style="font-size:9px;color:var(--dim);">${op.valuta||'EUR'}</td>
      <td>${pnlStr}</td>
      <td style="font-size:10px;color:var(--dim);">${op.note||''}</td>
      <td style="white-space:nowrap;"><span class="delete-row" style="margin-right:8px;" onclick="modificaOperazione(${op.id})">✏️</span><span class="delete-row" onclick="eliminaOperazione(${op.id})">🗑️</span></td>
    </tr>`;
  });

  // Summary bar
  document.getElementById('tot-investito').textContent = '€' + totInv.toFixed(2);
  const pnlEl = document.getElementById('tot-pnl');
  pnlEl.className = 'val ' + (totPnl >= 0 ? 'pnl-positive' : 'pnl-negative');
  pnlEl.textContent = (totPnl >= 0 ? '+' : '') + '€' + totPnl.toFixed(2);
  document.getElementById('tot-operazioni').textContent = filtered.length;
}

// ════════════════════════════════════════════════════
// GLOBAL NEWS (High-Impact — Operations page)
// ════════════════════════════════════════════════════
function renderOpGlobalNews() {
  const container = document.getElementById('op-global-news');
  if (!container) return;
  const highImpact = NEWS_DB.filter(n => n.impact === 'alto').slice(0, 5);
  if (!highImpact.length) { container.innerHTML = '<div style="color:var(--muted);font-size:11px;text-align:center;padding:12px;">Nessuna news ad alto impatto.</div>'; return; }

  container.innerHTML = highImpact.map(n => {
    const catBadge = n.category==='geopolitica'?'badge-geo':n.category==='macro'?'badge-macro':n.category==='insider'?'badge-insider':'badge-info';
    const relatedTickers = n.tickers.map(t => {
      const active = isStockActive(t);
      return `<span class="ticker-link" onclick="openStockModal('${t}')" style="opacity:${active?'1':'0.5'}">${active?'🟢':'🔴'} ${t}</span>`;
    }).join(' ');
    return `<div class="news-mini-card" onclick="toggleOpNews(${n.id})">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span class="badge ${catBadge}" style="font-size:9px;">${n.category.toUpperCase()}</span>
        <span style="font-size:9px;color:var(--dim);">${n.source} · ${n.date}</span>
      </div>
      <div style="font-size:12px;font-weight:600;margin-bottom:4px;line-height:1.4;">${n.title}</div>
      <div style="font-size:11px;color:var(--muted);line-height:1.4;margin-bottom:6px;">${n.body.substring(0,130)}...</div>
      <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">${relatedTickers}
        <span style="font-size:9px;color:var(--accent);cursor:pointer;margin-left:auto;">📖 ▼</span></div>
      <div id="op-news-${n.id}" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">
        <div style="font-size:11px;color:var(--text);line-height:1.6;margin-bottom:6px;"><strong style="color:var(--accent2);">📊 Analisi:</strong> ${n.analysis}</div>
        <div style="font-size:11px;color:var(--green);line-height:1.6;"><strong>🎯 Azioni:</strong> ${n.actions}</div>
      </div>
    </div>`;
  }).join('');
}

function toggleOpNews(id) {
  const el = document.getElementById('op-news-'+id);
  if (el) el.style.display = el.style.display==='none'?'block':'none';
}

// ════════════════════════════════════════════════════
// MAIN RENDER
// ════════════════════════════════════════════════════
function renderOperazioni() {
  // Update settore dropdown (synced with SECTORS)
  const sel = document.getElementById('op-settore');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = '<option value="">Seleziona...</option>' +
      SECTORS.map(s => `<option>${s.name.split('/')[0].trim()}</option>`).join('');
    sel.value = cur;
  }

  // One-time migration for already loaded operations with missing/unclassified sectors.
  migrateHistoricalOperationSectors();

  // Render filter bar
  renderOpFilters();

  // Render table
  const hasFilters = opFilterTicker||opFilterType||opFilterSector||opFilterStockStatus||opFilterDateFrom||opFilterDateTo;
  if (hasFilters) applyOpFilters();
  else renderFilteredTable(operazioni);

  // Posizioni aperte (sidebar)
  const pos = {};
  const sorted = [...operazioni].sort((a,b)=>(a.data||'').localeCompare(b.data||'')||a.id-b.id);
  sorted.forEach(op => {
    if (!pos[op.ticker]) pos[op.ticker]={qty:0,costo:0,nome:op.nome,settore:op.settore,valuta:op.valuta};
    if (op.tipo==='ACQUISTO') {
      pos[op.ticker].qty   += op.qty;
      pos[op.ticker].costo += (op.totaleNetto || op.totale + op.comm);
    } else {
      const pmc = pos[op.ticker].qty>0 ? pos[op.ticker].costo/pos[op.ticker].qty : 0;
      pos[op.ticker].qty   -= op.qty;
      pos[op.ticker].costo  = pos[op.ticker].qty>0 ? pos[op.ticker].qty*pmc : 0;
    }
  });

  const posTbody = document.getElementById('posizioni-tbody');
  if (posTbody) {
    posTbody.innerHTML = '';
    const aperte = Object.entries(pos).filter(([,p])=>p.qty>0);
    if (document.getElementById('posizioni-empty'))
      document.getElementById('posizioni-empty').style.display = aperte.length?'none':'';
    aperte.forEach(([ticker,p]) => {
      const pmc = p.costo/p.qty;
      const active = isStockActive(ticker);
      const curr = p.valuta==='EUR'?'€':p.valuta==='GBP'?'£':'$';
      posTbody.innerHTML += `<tr style="opacity:${active?'1':'0.55'};">
        <td><span class="ticker-link" onclick="openStockModal('${ticker}')">${active?'🟢':'🔴'} ${ticker}</span></td>
        <td>${p.nome||'—'}</td>
        <td style="font-family:monospace;">${p.qty}</td>
        <td style="font-family:monospace;">${curr}${pmc.toFixed(2)}</td>
        <td style="font-family:monospace;">${curr}${p.costo.toFixed(2)}</td>
        <td style="font-size:10px;color:var(--dim);">${p.settore||'—'}</td>
      </tr>`;
    });
  }

  // Render global news
  renderOpGlobalNews();
}

// ════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ════════════════════════════════════════════════════
function exportCSV() {
  const headers = ['Data','Ticker','Nome','Settore','Tipo','Valuta','Prezzo/Az.','Qty','Totale Lordo','Commissioni','Totale Netto','P&L','Note'];
  const pmcMap = buildPmcMap();
  const rows = operazioni.map(op => {
    const lordo = op.totale || (op.prezzo * op.qty);
    const netto = op.totaleNetto || (lordo + op.comm);
    let pnl = '';
    if (op.tipo==='VENDITA') { const pmc = pmcMap[op.id]||0; pnl = ((op.prezzo-pmc)*op.qty-op.comm).toFixed(2); }
    return [op.data,op.ticker,op.nome,op.settore,op.tipo,op.valuta||'EUR',op.prezzo,op.qty,lordo.toFixed(2),op.comm,netto.toFixed(2),pnl,op.note||''].join(',');
  });
  const blob = new Blob([headers.join(',')+'\n'+rows.join('\n')],{type:'text/csv'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='operazioni.csv'; a.click();
}

function exportXLSX() {
  if (typeof XLSX === 'undefined') { alert('Libreria XLSX non caricata'); return; }
  const pmcMap = buildPmcMap();
  const data = [['Data','Ticker','Nome','Settore','Tipo','Valuta','Prezzo/Az.','Qty','Totale Lordo','Commissioni','Totale Netto','P&L','Note']];
  operazioni.forEach(op => {
    const lordo = op.totale || (op.prezzo * op.qty);
    const netto = op.totaleNetto || (lordo + op.comm);
    let pnl = '';
    if (op.tipo==='VENDITA') { const pmc=pmcMap[op.id]||0; pnl=((op.prezzo-pmc)*op.qty-op.comm).toFixed(2); }
    data.push([op.data,op.ticker,op.nome,op.settore,op.tipo,op.valuta||'EUR',op.prezzo,op.qty,+lordo.toFixed(2),op.comm,+netto.toFixed(2),pnl||'',op.note||'']);
  });
  const ws=XLSX.utils.aoa_to_sheet(data);
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Operazioni');
  XLSX.writeFile(wb,'operazioni_dashboard.xlsx');
}
