// ═══════════════════════════════════════════════════
// PORTFOLIO MODULE v4.0
// Builder + Real Positions from Operazioni + Risk Analysis + Rebalancing
// ═══════════════════════════════════════════════════

// ════════════════════════════════════════════════════
// BUILDER: sector allocation target
// ════════════════════════════════════════════════════
function renderSectorAlloc() {
  const c = document.getElementById('sector-alloc-rows'); c.innerHTML = '';
  SECTORS.forEach((s, i) => {
    const row = document.createElement('div'); row.className = 'sector-alloc-row';
    row.innerHTML = `<div class="sector-dot" style="background:${s.color}"></div>
      <div class="sector-name-lbl">${s.icon} ${s.name.split('/')[0].trim()}</div>
      <div class="sector-bar-wrap"><div class="sector-bar-fill" style="background:${s.color};width:${Math.min(sectorWeights[i],100)}%"></div></div>
      <input class="sector-pct-input" type="number" min="0" max="100" step="0.5" value="${sectorWeights[i]}" data-si="${i}"/>
      <span style="color:var(--dim);font-size:13px;">%</span>`;
    c.appendChild(row);
  });
  c.querySelectorAll('.sector-pct-input').forEach(input => {
    input.addEventListener('input', e => {
      sectorWeights[+e.target.dataset.si] = parseFloat(e.target.value) || 0;
      updateTotal(); updateCharts(); saveWeights();
      renderRebalanceSuggestions();
    });
  });
  updateTotal();
}

function updateTotal() {
  const total = sectorWeights.reduce((a,b)=>a+b,0);
  const el = document.getElementById('total-pct');
  el.textContent = total.toFixed(1) + '%';
  el.className = 'total-val ' + (total<99.9?'warn':total>100.1?'over':'ok');
}

function renderPortfolioMasterCatalog(rawQuery = '') {
  const container = document.getElementById('portfolio-master-results');
  const input = document.getElementById('portfolio-master-search');
  if (!container) return;
  const query = normalizeSearchText(rawQuery || input?.value || '');
  const totalCatalog = Object.keys(STOCK_UNIVERSE_MAP || {}).length;
  const totalTracked = getAllInstruments().length;
  if (!query) {
    container.innerHTML = `<div style="font-size:13px;color:var(--muted);padding:8px 0;">
      Catalogo disponibile: <strong>${totalCatalog}</strong> titoli. In watchlist: <strong>${totalTracked}</strong>.
      Cerca per ticker o nome per aggiungere e sincronizzare automaticamente settore/watchlist/operazioni/portfolio.
    </div>`;
    return;
  }

  const rows = sortSearchMatches(
    getSearchableInstruments().filter(item =>
      normalizeSearchText(item.ticker).includes(query) ||
      normalizeSearchText(item.name).includes(query)
    ),
    query
  ).slice(0, 12);

  if (!rows.length) {
    container.innerHTML = `<div style="font-size:13px;color:var(--muted);padding:8px 0;">
      Nessun risultato per "${query}". Usa "➕ Aggiungi" per inserirlo manualmente.
    </div>`;
    return;
  }

  container.innerHTML = `<table>
    <thead><tr><th>Ticker</th><th>Nome</th><th>Settore</th><th>Azione</th></tr></thead>
    <tbody>${rows.map(item => {
      const tracked = !!getTrackedInstrumentByTicker(item.ticker);
      const sector = tracked ? item.sectorName : resolveSectorNameForTicker(item.ticker, item.name);
      return `<tr>
        <td><span class="ticker-link" onclick="openStockModal('${item.ticker}')">${item.ticker}</span></td>
        <td style="font-size:13px;">${item.name}</td>
        <td style="font-size:12px;color:var(--dim);">${sector}</td>
        <td>${tracked
          ? '<span class="badge badge-accum">In Watchlist</span>'
          : `<button class="btn xs ghost" onclick="addCatalogResultToWatchlist('${item.ticker}')">➕ Watchlist</button>`}
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

function renderInstrumentAlloc() {
  const body = document.getElementById('instrument-alloc-body'); body.innerHTML = '';
  SECTORS.forEach((s, si) => {
    const sec = document.createElement('div');
    sec.innerHTML = `<div style="font-size:13px;font-weight:600;color:${s.color};margin:8px 0 4px;padding:4px 0;border-bottom:1px solid var(--border);">${s.icon} ${s.name.split('/')[0].trim()} <span style="color:var(--dim);font-weight:400;">(${sectorWeights[si]}%)</span></div>`;
    s.instruments.forEach((inst, ii) => {
      const row = document.createElement('div'); row.className = 'instr-row';
      row.innerHTML = `<div class="instr-ticker" style="color:${s.color}"><span class="ticker-link" onclick="openStockModal('${inst.ticker}')" style="color:${s.color};font-size:12px;">${inst.ticker}</span></div>
        <div class="instr-name">${inst.name}</div>
        <input class="instr-pct-input" type="number" min="0" max="100" step="0.1" value="${instrumentWeights[si]?.[ii]||0}" data-si="${si}" data-ii="${ii}"/>
        <span style="color:var(--dim);font-size:12px;">%</span>`;
      sec.appendChild(row);
    });
    body.appendChild(sec);
  });
  body.querySelectorAll('.instr-pct-input').forEach(input => {
    input.addEventListener('input', e => {
      if (!instrumentWeights[+e.target.dataset.si]) instrumentWeights[+e.target.dataset.si] = [];
      instrumentWeights[+e.target.dataset.si][+e.target.dataset.ii] = parseFloat(e.target.value)||0;
      updateCharts(); saveWeights();
    });
  });
}

function renderLegend() {
  document.getElementById('legend-body').innerHTML = SECTORS.map((s,i) =>
    `<div style="display:flex;align-items:center;gap:6px;"><div style="width:10px;height:10px;border-radius:50%;background:${s.color};flex-shrink:0;"></div>
    <span style="font-size:13px;">${s.name.split('/')[0].trim()}</span><span style="margin-left:auto;font-size:13px;font-weight:600;color:${s.color};">${sectorWeights[i].toFixed(1)}%</span></div>`
  ).join('');
}

function initCharts() {
  const ctx1 = document.getElementById('pie-chart')?.getContext('2d');
  const ctx2 = document.getElementById('bar-chart')?.getContext('2d');
  if (!ctx1 || !ctx2) return;
  if (pieChart) { pieChart.destroy(); pieChart = null; }
  if (barChart)  { barChart.destroy();  barChart  = null; }
  pieChart = new Chart(ctx1, {
    type:'doughnut',
    data:{ labels:[], datasets:[{data:[],backgroundColor:[],borderColor:[],borderWidth:2}] },
    options:{ responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'65%' }
  });
  barChart = new Chart(ctx2, {
    type:'bar',
    data:{ labels:[], datasets:[{data:[],backgroundColor:[],borderRadius:3}] },
    options:{ responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
      scales:{x:{ticks:{color:'#525a72',font:{size:8}},grid:{display:false}},
              y:{ticks:{color:'#525a72',callback:v=>v+'%'},grid:{color:'#2a2f48'}}}}
  });
}

function updateCharts() {
  if (pieChart) {
    // Show real portfolio distribution if data exists, else target
    const realPos = getRealPositions();
    if (realPos.total > 0) {
      // Sector-level real distribution
      const sectorTotals = {};
      realPos.positions.forEach(p => {
        const key = getPositionSectorName(p);
        sectorTotals[key] = (sectorTotals[key]||0) + p.investito;
      });
      const labels = Object.keys(sectorTotals);
      const data   = labels.map(k => +((sectorTotals[k]/realPos.total*100).toFixed(1)));
      const colors = labels.map(l => {
        const s = SECTORS.find(sec => sec.name.startsWith(l) || l.startsWith(sec.name.split('/')[0].trim()));
        return s ? s.color+'cc' : '#6366f1cc';
      });
      pieChart.data.labels = labels;
      pieChart.data.datasets[0].data = data;
      pieChart.data.datasets[0].backgroundColor = colors;
      pieChart.data.datasets[0].borderColor = colors.map(c=>c.replace('cc',''));
    } else {
      pieChart.data.labels = SECTORS.map(s=>s.name.split('/')[0].trim());
      pieChart.data.datasets[0].data = [...sectorWeights];
      pieChart.data.datasets[0].backgroundColor = SECTORS.map(s=>s.color+'cc');
      pieChart.data.datasets[0].borderColor = SECTORS.map(s=>s.color);
    }
    pieChart.update('none');
  }
  if (barChart) {
    barChart.data.datasets[0].data = SECTORS.flatMap((s,si)=>instrumentWeights[si]||[]);
    barChart.data.datasets[0].backgroundColor = SECTORS.flatMap(s=>s.instruments.map(()=>s.color+'cc'));
    barChart.data.labels = SECTORS.flatMap(s=>s.instruments.map(i=>i.ticker));
    barChart.update('none');
  }
  renderLegend(); renderSectorAlloc(); renderInstrumentAlloc(); renderPortfolioMasterCatalog();
}

function renderScenarioChips() {
  const row = document.getElementById('scenarios-row');
  document.getElementById('no-scenarios').style.display = Object.keys(scenarios).length?'none':'';
  row.querySelectorAll('.scenario-chip').forEach(c=>c.remove());
  Object.keys(scenarios).forEach(name => {
    const chip = document.createElement('span'); chip.className='scenario-chip'; chip.textContent=name;
    chip.addEventListener('click', ()=>{ const s=scenarios[name]; sectorWeights=[...s.sectorWeights]; instrumentWeights=s.instrumentWeights.map(a=>[...a]); updateCharts(); saveWeights(); });
    row.appendChild(chip);
    const del = document.createElement('span'); del.className='scenario-chip'; del.style.cssText='color:var(--red);border-color:var(--red);background:transparent;padding:3px 6px;'; del.textContent='×';
    del.addEventListener('click', e=>{ e.stopPropagation(); delete scenarios[name]; saveScenarios(); renderScenarioChips(); });
    row.appendChild(del);
  });
}

// ════════════════════════════════════════════════════
// REAL PORTFOLIO — from Operazioni
// ════════════════════════════════════════════════════
function getRealPositions() {
  function resolveOpSector(op) {
    if (!isUnclassifiedSectorLabel(op?.settore || '')) return op.settore;
    return resolveSectorNameForTicker(op?.ticker, op?.nome || '');
  }
  const pos = {};
  const sorted = [...operazioni].sort((a,b)=>(a.data||'').localeCompare(b.data||'')||a.id-b.id);
  sorted.forEach(op => {
    if (!pos[op.ticker]) pos[op.ticker]={qty:0,costo:0,nome:op.nome||op.ticker,settore:resolveOpSector(op),valuta:op.valuta||'EUR'};
    if (op.tipo==='ACQUISTO') {
      pos[op.ticker].qty   += op.qty;
      pos[op.ticker].costo += (op.totaleNetto || op.totale + op.comm);
    } else {
      const pmc = pos[op.ticker].qty>0 ? pos[op.ticker].costo/pos[op.ticker].qty : 0;
      pos[op.ticker].qty   -= op.qty;
      pos[op.ticker].costo  = pos[op.ticker].qty>0 ? pos[op.ticker].qty*pmc : 0;
    }
  });

  let total = 0;
  const positions = Object.entries(pos)
    .filter(([,p])=>p.qty>0)
    .map(([ticker,p])=>{
      const pmc = p.costo/p.qty;
      const fd  = fundData[ticker];
      const prezzoAtt = fd ? fd.price : null;
      const valAtt    = prezzoAtt ? prezzoAtt * p.qty : null;
      const pnlLat    = valAtt ? valAtt - p.costo : null;
      const pnlPct    = pnlLat !== null && p.costo>0 ? (pnlLat/p.costo*100) : null;
      total += p.costo;
      return { ticker, nome:p.nome, settore:p.settore, valuta:p.valuta, qty:p.qty, pmc, investito:p.costo, prezzoAtt, valAtt, pnlLat, pnlPct };
    });

  return { positions, total };
}

function renderRealPortfolio() {
  const tbody = document.getElementById('portfolio-real-tbody');
  const empty = document.getElementById('portfolio-real-empty');
  const kpiRow = document.getElementById('portfolio-kpi-row');
  if (!tbody) return;

  const { positions, total } = getRealPositions();

  // KPI row
  if (kpiRow) {
    const totalValAtt = positions.reduce((s,p)=>s+(p.valAtt||p.investito),0);
    const totalPnlLat = positions.reduce((s,p)=>s+(p.pnlLat||0),0);
    const numPos = positions.length;
    const pnlPct = total>0 ? (totalPnlLat/total*100) : 0;
    kpiRow.innerHTML = `
      <div class="report-kpi-item"><div class="kpi-val" style="color:var(--blue);">${numPos}</div><div class="kpi-label">Posizioni Aperte</div></div>
      <div class="report-kpi-item"><div class="kpi-val" style="color:var(--text);">€${total.toFixed(0)}</div><div class="kpi-label">Totale Investito</div></div>
      <div class="report-kpi-item"><div class="kpi-val" style="color:var(--accent2);">€${totalValAtt.toFixed(0)}</div><div class="kpi-label">Val. Attuale Stim.</div></div>
      <div class="report-kpi-item"><div class="kpi-val ${totalPnlLat>=0?'pnl-positive':'pnl-negative'}">${totalPnlLat>=0?'+':''}€${totalPnlLat.toFixed(0)} (${pnlPct.toFixed(1)}%)</div><div class="kpi-label">P&L Latente</div></div>`;
  }

  if (!positions.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = '';
    renderSectorDist(positions, total);
    renderRiskAnalysis(positions, total);
    renderRebalanceSuggestions();
    return;
  }
  if (empty) empty.style.display = 'none';

  // Sort by weight desc
  const sorted = [...positions].sort((a,b)=>b.investito-a.investito);

  tbody.innerHTML = sorted.map(p => {
    const peso    = total>0 ? (p.investito/total*100).toFixed(1) : '0.0';
    const active  = isStockActive(p.ticker);
    const curr    = p.valuta==='EUR'?'€':p.valuta==='GBP'?'£':'$';
    const prezzoAttStr = p.prezzoAtt ? `${curr}${p.prezzoAtt}` : `<span style="color:var(--muted);">N/D</span>`;
    const valAttStr    = p.valAtt    ? `€${p.valAtt.toFixed(0)}` : '—';
    const pnlStr = p.pnlLat!==null
      ? `<span class="${p.pnlLat>=0?'pnl-positive':'pnl-negative'}">${p.pnlLat>=0?'+':''}€${p.pnlLat.toFixed(0)}</span>`
      : '—';
    const pnlPctStr = p.pnlPct!==null
      ? `<span class="${p.pnlPct>=0?'pnl-positive':'pnl-negative'}">${p.pnlPct>=0?'+':''}${p.pnlPct.toFixed(1)}%</span>`
      : '—';

    // Weight bar
    const barW = Math.min(+peso, 100);
    const barColor = +peso > 25 ? 'var(--red)' : +peso > 15 ? 'var(--yellow)' : 'var(--green)';

    const fd = fundData[p.ticker];
    const signal = fd ? `<span class="badge badge-${fd.signalColor==='green'?'accum':fd.signalColor==='red'?'distrib':'neutro'}" style="font-size:10px;">${fd.signal}</span>` : '';

    return `<tr style="opacity:${active?'1':'0.55'};">
      <td><button class="status-toggle" onclick="toggleStockAndRender('${p.ticker}')" title="${active?'Attivo':'Disattivato'}">${active?'🟢':'🔴'}</button></td>
      <td><span class="ticker-link" onclick="openStockModal('${p.ticker}')" style="font-weight:800;">${p.ticker}</span>${signal}</td>
      <td style="font-size:13px;">${p.nome}</td>
      <td style="font-size:12px;color:var(--dim);">${p.settore||'—'}</td>
      <td style="font-family:monospace;font-weight:600;">${p.qty}</td>
      <td style="font-family:monospace;">${curr}${p.pmc.toFixed(2)}</td>
      <td style="font-family:monospace;">${prezzoAttStr}</td>
      <td style="font-family:monospace;">${curr}${p.investito.toFixed(2)}</td>
      <td style="font-family:monospace;">${valAttStr}</td>
      <td>${pnlStr}</td>
      <td>${pnlPctStr}</td>
      <td>
        <div style="display:flex;align-items:center;gap:4px;">
          <div style="width:50px;height:5px;background:var(--surface2);border-radius:3px;overflow:hidden;">
            <div style="width:${barW}%;height:100%;background:${barColor};border-radius:3px;"></div>
          </div>
          <span style="font-family:monospace;font-size:13px;font-weight:600;">${peso}%</span>
        </div>
      </td>
      <td style="font-size:11px;color:var(--dim);">${p.valuta||'EUR'}</td>
    </tr>`;
  }).join('');

  renderSectorDist(sorted, total);
  renderRiskAnalysis(sorted, total);
  renderRebalanceSuggestions();
  updateCharts();
}

function getPositionSectorName(position) {
  if (!position) return 'Industriali';
  if (!isUnclassifiedSectorLabel(position.settore || '')) return position.settore;
  return resolveSectorNameForTicker(position.ticker, position.nome || '');
}

// ════════════════════════════════════════════════════
// SECTOR DISTRIBUTION (real)
// ════════════════════════════════════════════════════
function renderSectorDist(positions, total) {
  const container = document.getElementById('portfolio-sector-dist');
  if (!container) return;

  if (!positions.length) {
    container.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:12px;">Nessuna posizione. Aggiungi operazioni di acquisto.</div>';
    return;
  }

  const sectorMap = {};
  positions.forEach(p => {
    const key = getPositionSectorName(p);
    if (!sectorMap[key]) sectorMap[key] = { investito:0, color:'#6366f1' };
    sectorMap[key].investito += p.investito;
    const sectorName = getPositionSectorName(p);
    const s = SECTORS.find(sec => sec.name.startsWith(sectorName || '') || (sectorName || '').includes(sec.name.split('/')[0].trim()));
    if (s) sectorMap[key].color = s.color;
  });

  container.innerHTML = Object.entries(sectorMap)
    .sort(([,a],[,b])=>b.investito-a.investito)
    .map(([name, data]) => {
      const pct = total>0 ? (data.investito/total*100) : 0;
      const barColor = pct>30?'var(--red)':pct>20?'var(--yellow)':data.color;
      return `<div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px;">
          <span style="color:${data.color};font-weight:600;">${name}</span>
          <span style="font-family:monospace;">€${data.investito.toFixed(0)} <strong>${pct.toFixed(1)}%</strong></span>
        </div>
        <div style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;">
          <div style="width:${Math.min(pct,100)}%;height:100%;background:${barColor};border-radius:3px;transition:width .4s;"></div>
        </div>
      </div>`;
    }).join('');
}

// ════════════════════════════════════════════════════
// RISK ANALYSIS
// ════════════════════════════════════════════════════
function renderRiskAnalysis(positions, total) {
  const container = document.getElementById('portfolio-risk-analysis');
  if (!container) return;

  if (!positions.length) {
    container.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:12px;">Nessun dato disponibile.</div>';
    return;
  }

  // HHI (Herfindahl-Hirschman Index) — concentration measure
  const weights = positions.map(p => total>0 ? p.investito/total : 0);
  const hhi = weights.reduce((s,w)=>s+w*w, 0);
  const hhiPct = (hhi*100).toFixed(1);
  const hhiRisk = hhi<0.1 ? ['🟢','Ottima diversificazione','var(--green)'] :
                  hhi<0.18? ['🟡','Diversificazione buona','var(--yellow)'] :
                  hhi<0.25? ['🟠','Concentrazione moderata','var(--orange)'] :
                             ['🔴','Portafoglio concentrato','var(--red)'];

  // Max position
  const maxPos = positions.reduce((m,p)=>p.investito>m.investito?p:m, positions[0]);
  const maxPct = total>0 ? (maxPos.investito/total*100).toFixed(1) : 0;

  // Count sectors
  const nSectors = [...new Set(positions.map(p => getPositionSectorName(p)))].length;

  // Beta-weighted risk (if available)
  const avgBeta = positions.reduce((s,p) => {
    const fd=fundData[p.ticker]; return s + (fd?fd.beta*(p.investito/total):0);
  }, 0);

  container.innerHTML = `
    <div class="stat-row"><span class="stat-label">📊 Indice HHI (concentrazione)</span>
      <span style="font-weight:700;color:${hhiRisk[2]};">${hhiRisk[0]} ${hhiPct}% — ${hhiRisk[1]}</span></div>
    <div class="stat-row"><span class="stat-label">🏆 Posizione più grande</span>
      <span style="font-family:monospace;font-weight:600;">${maxPos.ticker} = ${maxPct}% ${+maxPct>25?'⚠️':''}</span></div>
    <div class="stat-row"><span class="stat-label">🏭 Settori diversificati</span>
      <span style="font-family:monospace;font-weight:600;">${nSectors} settori${nSectors<3?' ⚠️ poca diversificazione':''}</span></div>
    <div class="stat-row"><span class="stat-label">📐 Beta portafoglio (pesato)</span>
      <span style="font-family:monospace;font-weight:600;">${avgBeta>0?avgBeta.toFixed(2):'N/D'}${avgBeta>1.5?' ⚠️ alto rischio':avgBeta>0&&avgBeta<0.8?' ✅ basso rischio':''}</span></div>
    <div class="stat-row"><span class="stat-label">💼 N° Posizioni aperte</span>
      <span style="font-family:monospace;font-weight:600;">${positions.length}${positions.length<5?' — considera di diversificare di più':''}</span></div>
    <div style="margin-top:12px;padding:10px;background:rgba(99,102,241,.06);border-radius:6px;border:1px solid rgba(99,102,241,.2);">
      <div style="font-size:12px;color:var(--accent2);font-weight:600;margin-bottom:4px;">🎯 REGOLA DEL RISCHIO OTTIMALE</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.6;">
        • Nessun singolo titolo > 20% del portafoglio<br>
        • Nessun settore > 35% del portafoglio<br>
        • Minimo 5 settori diversificati<br>
        • Beta portafoglio ideale: 0.8 – 1.3
      </div>
    </div>`;
}

// ════════════════════════════════════════════════════
// REBALANCING SUGGESTIONS
// ════════════════════════════════════════════════════
function renderRebalanceSuggestions() {
  const container = document.getElementById('portfolio-rebalance-body');
  if (!container) return;

  const { positions, total } = getRealPositions();
  if (!positions.length || total === 0) {
    container.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:12px;">Aggiungi operazioni per ottenere suggerimenti di ribilanciamento.</div>';
    return;
  }

  const suggestions = [];

  // Check each position weight vs target
  positions.forEach(p => {
    const pesoReale = (p.investito/total*100);

    // Find target for this stock's sector
    const sectorName = getPositionSectorName(p);
    const sIdx = SECTORS.findIndex(s => s.name.startsWith(sectorName || '') || (sectorName || '').includes(s.name.split('/')[0].trim()));
    const targetSector = sIdx>=0 ? sectorWeights[sIdx] : 0;
    const nInSector = sIdx>=0 ? SECTORS[sIdx].instruments.length : 1;
    const targetStock = nInSector>0 && targetSector>0 ? targetSector/nInSector : 0;

    // Concentration alerts
    if (pesoReale > 25) {
      suggestions.push({ type:'danger', ticker:p.ticker, msg:`Concentrazione elevata: ${pesoReale.toFixed(1)}% del portafoglio. Obiettivo: <20%.`, action:`Considera di vendere parte di ${p.ticker} o acquistare altri strumenti per diluire.` });
    } else if (pesoReale > 15 && pesoReale <= 25) {
      suggestions.push({ type:'warn', ticker:p.ticker, msg:`Peso significativo: ${pesoReale.toFixed(1)}%. Monitorare.`, action:`${p.ticker} è nella fascia di attenzione. OK se il settore è un core holding.` });
    }

    // Gap vs target
    if (targetStock > 0) {
      const gap = targetStock - pesoReale;
      if (gap > 5) {
        suggestions.push({ type:'buy', ticker:p.ticker, msg:`Sottopeso vs target: ${pesoReale.toFixed(1)}% (target ${targetStock.toFixed(1)}%). Gap: +${gap.toFixed(1)}%`, action:`Acquistare ${p.ticker} per ~€${(gap/100*total).toFixed(0)} per raggiungere il target.` });
      } else if (gap < -5) {
        suggestions.push({ type:'sell', ticker:p.ticker, msg:`Sovrappeso vs target: ${pesoReale.toFixed(1)}% (target ${targetStock.toFixed(1)}%). Gap: ${gap.toFixed(1)}%`, action:`Ridurre ${p.ticker} di ~€${(Math.abs(gap)/100*total).toFixed(0)} per rientrare nel target.` });
      }
    }
  });

  // Check for missing sectors (target > 0 but no position)
  SECTORS.forEach((s, si) => {
    if (sectorWeights[si] > 0) {
      const hasSector = positions.some(p => getPositionSectorName(p).includes(s.name.split('/')[0].trim()));
      if (!hasSector) {
        suggestions.push({ type:'missing', ticker:'', msg:`Settore "${s.name.split('/')[0].trim()}" ha target ${sectorWeights[si]}% ma nessuna posizione aperta.`, action:`Considera di acquistare strumenti del settore ${s.name.split('/')[0].trim()} per raggiungere il target.` });
      }
    }
  });

  if (!suggestions.length) {
    container.innerHTML = '<div style="color:var(--green);font-size:14px;text-align:center;padding:16px;font-weight:600;">✅ Portafoglio bilanciato rispetto ai target impostati nel Builder.</div>';
    return;
  }

  const icons = { danger:'🔴', warn:'🟡', buy:'🟢', sell:'🔴', missing:'⚪' };
  const colors = { danger:'var(--red)', warn:'var(--yellow)', buy:'var(--green)', sell:'var(--red)', missing:'var(--muted)' };

  container.innerHTML = `<div style="font-size:12px;color:var(--muted);margin-bottom:10px;">Basato sui pesi target impostati nel Builder sottostante. ${suggestions.length} suggerimento/i.</div>` +
    suggestions.map(s => `
      <div style="display:flex;gap:10px;align-items:flex-start;padding:10px;background:var(--surface2);border-radius:6px;margin-bottom:6px;border-left:3px solid ${colors[s.type]};">
        <span style="font-size:18px;flex-shrink:0;">${icons[s.type]}</span>
        <div>
          ${s.ticker ? `<div style="font-family:monospace;font-weight:700;color:${colors[s.type]};margin-bottom:2px;">${s.ticker}</div>` : ''}
          <div style="font-size:13px;font-weight:600;margin-bottom:3px;">${s.msg}</div>
          <div style="font-size:12px;color:var(--muted);">💡 ${s.action}</div>
        </div>
      </div>`).join('');
}

// ════════════════════════════════════════════════════
// EXPORT PORTFOLIO XLSX
// ════════════════════════════════════════════════════
function exportPortfolioXLSX() {
  if (typeof XLSX === 'undefined') { alert('Libreria XLSX non caricata'); return; }
  const { positions, total } = getRealPositions();
  const data = [['Ticker','Nome','Settore','Valuta','Lotti','PMC','Prezzo Att.','Investito','Val.Att.','P&L Lat.','P&L %','Peso %','Segnale','Stato']];
  positions.forEach(p => {
    const fd = fundData[p.ticker];
    data.push([
      p.ticker, p.nome, p.settore, p.valuta||'EUR', p.qty,
      +p.pmc.toFixed(2), fd?fd.price:'N/D',
      +p.investito.toFixed(2), p.valAtt?+p.valAtt.toFixed(2):'N/D',
      p.pnlLat!==null?+p.pnlLat.toFixed(2):'N/D',
      p.pnlPct!==null?+(p.pnlPct.toFixed(1)):'N/D',
      total>0?+((p.investito/total*100).toFixed(1)):0,
      fd?fd.signal:'N/D', isStockActive(p.ticker)?'Attivo':'Disattivato'
    ]);
  });
  const ws=XLSX.utils.aoa_to_sheet(data);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'Portafoglio');
  XLSX.writeFile(wb,'portafoglio_reale.xlsx');
}

// Public sync function (called from operazioni)
function syncPortfolioFromOp() { renderRealPortfolio(); }
