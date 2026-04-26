// ═══════════════════════════════════════════════════
// GEOPOLITICA & MACRO — Render completo v2.0
// Aprile 2026 — Dashboard 140 Grammi Portfolio
// ═══════════════════════════════════════════════════


// ── Sync badge (shared con render-intelligence.js) ──────────────
const GEO_LAST_UPDATED = "26/04/2026";
function geoBadge(section) {
  return '<div style="display:inline-flex;align-items:center;gap:5px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);border-radius:20px;padding:2px 10px;font-size:11px;color:var(--accent);margin-bottom:8px;">'
    + '<span style="width:6px;height:6px;border-radius:50%;background:var(--accent);display:inline-block;"></span>'
    + ' 🔄 Aggiornato: <strong style="margin-left:3px;">' + GEO_LAST_UPDATED + '</strong>'
    + (section ? ' &nbsp;·&nbsp; <span style="color:var(--dim);">' + section + '</span>' : '')
    + '</div>';
}

function renderGeopolitica() {
  renderRiskMonitor();
  renderConflicts();
  renderScenarioImpact();
  renderCentralBanks();
  renderCommodityMonitor();
  renderMacroCalendar();
  renderGeopoliticaWatchlist();
}

function renderRiskMonitor() {
  const c = document.getElementById('risk-monitor');
  c.innerHTML = geoBadge('Risk Monitor Globale — ' + GEOPOLITICAL_RISKS.length + ' rischi monitorati') + '<div class="grid-2">' + GEOPOLITICAL_RISKS.map(r => {
    const sevColor = r.severity >= 8 ? 'var(--red)' : r.severity >= 5 ? 'var(--yellow)' : 'var(--green)';
    return '<div style="padding:16px;background:var(--surface2);border-radius:10px;border-left:4px solid ' + sevColor + ';">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">'
      + '<div style="font-weight:700;font-size:15px;">' + r.name + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">'
      + '<span class="badge" style="background:' + sevColor + '22;color:' + sevColor + ';font-size:12px;">⚠️ Rischio: ' + r.severity + '/10</span>'
      + '<span class="badge" style="background:var(--surface3);color:var(--muted);font-size:12px;">📊 Prob: ' + r.probability + '%</span>'
      + '</div></div>'
      + '<div style="font-size:14px;color:var(--muted);margin-bottom:10px;line-height:1.6;">' + r.detail + '</div>'
      + '<div style="margin-bottom:8px;">'
      + '<div style="font-size:12px;color:var(--dim);margin-bottom:3px;">Probabilità materializzazione (3 mesi)</div>'
      + '<div class="gauge-wrap"><div class="gauge"><div class="gauge-fill" style="width:' + r.probability + '%;background:' + sevColor + ';"></div></div><span class="gauge-label" style="color:' + sevColor + ';">' + r.probability + '%</span></div>'
      + '</div>'
      + '<div style="font-size:13px;color:var(--dim);margin-bottom:6px;">Settori impattati: ' + r.sectors.join(' · ') + '</div>'
      + '<div style="font-size:13px;color:var(--muted);padding:8px;background:rgba(255,255,255,.04);border-radius:6px;line-height:1.5;">💡 <strong>Impatto portafoglio:</strong> ' + r.impact + '</div>'
      + '</div>';
  }).join('') + '</div>';
}

function renderConflicts() {
  const c = document.getElementById('conflicts-container');
  c.innerHTML = geoBadge('Conflitti attivi — analisi geopolitica 26/04/2026');
  const conflicts = [
    {
      status: 'CESSATE IL FUOCO — FRAGILE',
      statusColor: 'var(--yellow)',
      icon: '🟡',
      title: 'Conflitto Iran/USA — Accordo Parziale (Aprile 2026)',
      body: 'Dopo le tensioni del Golfo Persico di marzo-aprile 2026, USA e Iran hanno raggiunto un accordo di cessate il fuoco temporaneo mediato da Qatar e Turchia. Lo Stretto di Hormuz, che gestisce il 20% del petrolio mondiale, rimane formalmente aperto ma sotto sorveglianza militare potenziata. Il prezzo WTI è sceso da $113/bbl (picco crisi) a $94,40 (-25%) dopo l\'accordo. Tuttavia, le sanzioni USA sull\'Iran rimangono in vigore e le tensioni sottostanti non sono risolte. Il rischio di riesplode è reale: qualsiasi incidente navale nel Golfo potrebbe riportare il petrolio sopra $110.',
      impacts: [
        { t: 'XOM', v: '-8% da picco crisi', dir: 'down' },
        { t: 'NVDA', v: '+12% rimbalzo risk-on', dir: 'up' },
        { t: 'ASML', v: '+11% risk-on', dir: 'up' },
        { t: 'GLD', v: '-3% safe haven ridotto', dir: 'down' },
        { t: 'USO', v: '-25% da ATH $113', dir: 'down' }
      ],
      sources: [
        { label: 'Reuters — Iran deal', url: 'https://www.reuters.com/world/middle-east/' },
        { label: 'EIA — Oil market', url: 'https://www.eia.gov/petroleum/' },
        { label: 'Polymarket', url: 'https://polymarket.com' }
      ]
    },
    {
      status: 'ATTIVO — STALLO',
      statusColor: 'var(--red)',
      icon: '🔴',
      title: 'Guerra Russia-Ucraina — Anno 3 (2026)',
      body: 'Il conflitto prosegue con linee del fronte sostanzialmente stabili dopo i falliti accordi di pace del 2025. La Russia mantiene il controllo di circa il 20% del territorio ucraino. Le sanzioni occidentali hanno ridotto le esportazioni russe di gas del 75% verso l\'Europa, accelerando la transizione energetica UE. LNG americano e norvegese ha colmato il gap. Gli USA hanno stanziato $61Mld in aiuti militari e la NATO ha portato il GDP militare target al 3%. Impatto principale: inflazione energetica europea persistente, boom industria della difesa, accelerazione transizione energetica.',
      impacts: [
        { t: 'NEE', v: '+5% IRA energy', dir: 'up' },
        { t: 'GLD', v: '+20% safe haven 2026', dir: 'up' },
        { t: 'XOM', v: '+8% LNG demand USA', dir: 'up' },
        { t: 'ASML', v: 'neutro', dir: 'neutral' }
      ],
      sources: [
        { label: 'ISW — Daily maps', url: 'https://understandingwar.org' },
        { label: 'NATO posture', url: 'https://www.nato.int' },
        { label: 'FT Ukraine tracker', url: 'https://www.ft.com/ukraine' }
      ]
    },
    {
      status: 'ESCALATION GRADUALE',
      statusColor: 'var(--yellow)',
      icon: '🟡',
      title: 'Tensioni USA-Cina — Tech & Chip War',
      body: 'La guerra tecnologica USA-Cina si intensifica su più fronti: restrizioni export chip avanzati (H100, H800, A800), possibili nuove limitazioni EUV ASML, restrizioni cinesi su terre rare e materiali critici (gallium +320% prezzo, germanium +180%). NVIDIA ha perso $4,5Mld di revenue da blocco H20 per Cina. Il Pentagono ha aggiunto 50+ aziende cinesi tech alla lista nera. La Cina risponde con sostituzioni domestiche (Huawei Ascend 910B, SMIC 7nm). Rischio escalation se USA introduce nuove restrizioni post-elezioni novembre 2026.',
      impacts: [
        { t: 'NVDA', v: '-$4,5Mld revenue H20', dir: 'down' },
        { t: 'ASML', v: '-5% se nuove restrizioni', dir: 'down' },
        { t: 'MU', v: 'neutro (HBM non ristretto)', dir: 'neutral' },
        { t: 'AVGO', v: '+Custom ASIC USA/Taiwan', dir: 'up' }
      ],
      sources: [
        { label: 'BIS Export Controls', url: 'https://www.bis.doc.gov/index.php/policy-guidance/product-guidance/semiconductor-manufacturing' },
        { label: 'CSIS Tech Strategy', url: 'https://www.csis.org/programs/technology-policy-program' },
        { label: 'SEMI Industry', url: 'https://www.semi.org' }
      ]
    },
    {
      status: 'BASSA PROB. — ALTO IMPATTO',
      statusColor: 'var(--purple)',
      icon: '🟣',
      title: 'Taiwan — Rischio Esistenziale per Tech Supply Chain',
      body: 'La Cina ha aumentato le esercitazioni militari attorno a Taiwan del 340% vs 2023. TSMC produce il 90% dei chip avanzati mondiali. Probabilità invasione entro 5 anni: 15-20% (RAND Corporation). Uno scenario di blocco navale — anche senza invasione — causerebbe una crisi di supply chain senza precedenti: interruzione produzione AI chip per 24-36 mesi, perdite economiche $3-5 trilioni. TSMC sta costruendo fab in Arizona (N3E process, 2026), Germania (Dresden) e Giappone (Kumamoto) per de-rischiare. Hedge naturale: DLR e EQIX (infrastruttura USA), MU (fab Idaho/Virginia).',
      impacts: [
        { t: 'NVDA', v: '-60-80% scenario invasione', dir: 'down' },
        { t: 'ASML', v: '-40-60%', dir: 'down' },
        { t: 'GLD', v: '+50-100% safe haven', dir: 'up' },
        { t: 'MU', v: '-50% (fab parzialmente USA)', dir: 'down' },
        { t: 'DLR', v: '-8% (domanda ridotta)', dir: 'down' }
      ],
      sources: [
        { label: 'RAND — Taiwan analysis', url: 'https://www.rand.org/topics/taiwan.html' },
        { label: 'TSMC Investor IR', url: 'https://investor.tsmc.com' },
        { label: 'CFR Global Conflict', url: 'https://www.cfr.org/global-conflict-tracker' }
      ]
    }
  ];

  c.innerHTML = conflicts.map(function(con) {
    return '<div style="padding:16px;border-radius:10px;border:1px solid ' + con.statusColor + '33;margin-bottom:12px;background:' + con.statusColor + '08;">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">'
      + '<span style="font-size:20px;">' + con.icon + '</span>'
      + '<div style="flex:1;">'
      + '<div style="font-weight:700;font-size:15px;">' + con.title + '</div>'
      + '<span style="font-size:12px;font-weight:700;color:' + con.statusColor + ';background:' + con.statusColor + '22;padding:2px 8px;border-radius:4px;">' + con.status + '</span>'
      + '</div></div>'
      + '<div style="font-size:14px;color:var(--muted);margin-bottom:12px;line-height:1.65;">' + con.body + '</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">'
      + con.impacts.map(function(i) {
          return '<span style="font-size:12px;padding:3px 8px;border-radius:4px;background:var(--surface3);font-weight:600;">'
            + '<span class="ticker-link" onclick="openStockModal(\'' + i.t + '\')">' + i.t + '</span> '
            + '<span class="' + (i.dir === 'up' ? 'up' : i.dir === 'down' ? 'down' : '') + '">' + i.v + '</span>'
            + '</span>';
        }).join('')
      + '</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:6px;padding-top:8px;border-top:1px solid var(--border);">'
      + '<span style="font-size:12px;color:var(--dim);">📚 Fonti:</span>'
      + con.sources.map(function(s) {
          return '<a href="' + s.url + '" target="_blank" style="font-size:12px;color:var(--accent2);text-decoration:none;border:1px solid var(--border2);padding:1px 7px;border-radius:4px;">' + s.label + ' ↗</a>';
        }).join('')
      + '</div></div>';
  }).join('');
}

function renderScenarioImpact() {
  const c = document.getElementById('scenario-impact');
  c.innerHTML = geoBadge('Scenari Macro — impatto portafoglio · 26/04/2026');
  const scenarios = [
    { name: '🛢️ Oil > $110/bbl (Iran riesplode)', prob: '20%',
      tickers: { NVDA:'-5%', ASML:'-4%', LLY:'neutro', EQIX:'neutro', XOM:'+18%', AVGO:'-3%', MU:'-4%', DLR:'neutro', NEE:'+3%', SPY:'-2%', GLD:'+8%' } },
    { name: '✂️ Fed taglia 25bps (Maggio 2026)', prob: '25%',
      tickers: { NVDA:'+5%', ASML:'+4%', LLY:'+3%', EQIX:'+7%', XOM:'neutro', AVGO:'+5%', MU:'+6%', DLR:'+8%', NEE:'+6%', SPY:'+3%', GLD:'+2%' } },
    { name: '🇨🇳 Cina blocca Taiwan (escalation)', prob: '5%',
      tickers: { NVDA:'-60%', ASML:'-45%', LLY:'-5%', EQIX:'-10%', XOM:'+30%', AVGO:'-40%', MU:'-50%', DLR:'-8%', NEE:'+5%', SPY:'-25%', GLD:'+40%' } },
    { name: '🤖 AGI breakthrough announcement', prob: '10%',
      tickers: { NVDA:'+30%', ASML:'+20%', LLY:'neutro', EQIX:'+15%', XOM:'-5%', AVGO:'+25%', MU:'+35%', DLR:'+20%', NEE:'+10%', SPY:'+8%', GLD:'-3%' } },
    { name: '📉 Recessione USA (Q3 2026)', prob: '15%',
      tickers: { NVDA:'-20%', ASML:'-15%', LLY:'-5%', EQIX:'-12%', XOM:'-15%', AVGO:'-18%', MU:'-25%', DLR:'-10%', NEE:'-3%', SPY:'-18%', GLD:'+15%' } },
    { name: '💊 LLY — FDA approva GLP-1 orale', prob: '40%',
      tickers: { NVDA:'neutro', ASML:'neutro', LLY:'+20%', EQIX:'neutro', XOM:'neutro', AVGO:'neutro', MU:'neutro', DLR:'neutro', NEE:'neutro', SPY:'+0.5%', GLD:'neutro' } }
  ];

  const watchTickers = ['NVDA','ASML','LLY','EQIX','XOM','AVGO','MU','DLR','NEE','SPY','GLD'];
  let html = '<div style="overflow-x:auto;"><table><thead><tr>'
    + '<th style="min-width:220px;font-size:13px;">Scenario</th>'
    + '<th style="font-size:12px;color:var(--dim);">Prob.</th>'
    + watchTickers.map(function(t) {
        return '<th style="text-align:center;font-size:12px;"><span class="ticker-link" onclick="openStockModal(\'' + t + '\')">' + t + '</span></th>';
      }).join('')
    + '</tr></thead><tbody>';

  scenarios.forEach(function(s) {
    html += '<tr><td style="font-weight:600;font-size:13px;">' + s.name + '</td>'
      + '<td style="font-size:12px;color:var(--accent);">' + s.prob + '</td>'
      + watchTickers.map(function(t) {
          const v = s.tickers[t] || '—';
          const cls = v.startsWith('+') ? 'up' : v.startsWith('-') ? 'down' : '';
          return '<td style="text-align:center;font-size:12px;" class="' + cls + '">' + v + '</td>';
        }).join('')
      + '</tr>';
  });
  html += '</tbody></table></div>';
  html += '<div style="margin-top:10px;font-size:12px;color:var(--dim);padding:8px;background:var(--surface2);border-radius:6px;">'
    + '⚠️ <strong>Nota:</strong> Stime di impatto basate su correlazioni storiche e beta settoriali. Non costituiscono consulenza finanziaria. '
    + 'Fonti: <a href="https://polymarket.com" target="_blank" style="color:var(--accent2);">Polymarket</a> · '
    + '<a href="https://www.cfr.org" target="_blank" style="color:var(--accent2);">CFR</a> · '
    + '<a href="https://www.economist.com" target="_blank" style="color:var(--accent2);">The Economist</a>'
    + '</div>';
  c.innerHTML = html;
}

function renderCentralBanks() {
  const c = document.getElementById('central-banks');
  c.innerHTML = geoBadge('Banche Centrali — 5 monitorate · 26/04/2026');
  const banks = [
    {
      name: '🇺🇸 Federal Reserve (USA)', rate: '5,25–5,50%', next: '7 Maggio 2026',
      outlook: 'Hold (62%) · Taglio 25bps (25%) · Taglio 50bps (13%)', trend: '⬇️ In attesa dati CPI', color: '#3b82f6',
      detail: 'Il FOMC di maggio è il pivot point del 2026. Powell richiede 2-3 dati CPI favorevoli prima di tagliare. CPI marzo: +3,2% YoY (da +3,8%). Se CPI aprile < 3,0%, probabilità taglio giugno sale all\'80%. Impatto portafoglio: taglio FED = +8-12% REIT (EQIX, DLR, NEE) e +5-7% growth tech (NVDA, AVGO, MU).',
      sources: [
        { label: 'CME FedWatch', url: 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html' },
        { label: 'FOMC Calendar', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm' }
      ]
    },
    {
      name: '🇪🇺 Banca Centrale Europea (ECB)', rate: '3,75%', next: '6 Giugno 2026',
      outlook: 'Possibile taglio 25bps a giugno. 2° taglio del 2026', trend: '⬇️ Ciclo allentamento in corso', color: '#fbbf24',
      detail: 'La BCE ha già tagliato 2 volte nel 2025 (da 4,5% a 3,75%). Inflazione eurozona +2,4% YoY. Lagarde ha aperto a ulteriori tagli se l\'inflazione continua a scendere. Positivo per: ASML (riduce discount rate per growth), ENEL (utility), Schneider Electric. Euro debole vs USD favorisce export UE.',
      sources: [
        { label: 'ECB Policy', url: 'https://www.ecb.europa.eu/mopo/html/index.it.html' },
        { label: 'ECB Inflation', url: 'https://www.ecb.europa.eu/stats/macroeconomic_statistics/hicp/html/index.it.html' }
      ]
    },
    {
      name: '🇯🇵 Bank of Japan (BoJ)', rate: '0,25%', next: '1 Maggio 2026',
      outlook: 'Hold — possibile rialzo a 0,50% H2 2026', trend: '⬆️ Primo ciclo rialzista in 20+ anni', color: '#a855f7',
      detail: 'La BoJ ha alzato per la prima volta in 20 anni. Inflazione giapponese > 2% per 2 anni. Yen rafforzato da 155 a 145 $/¥. Carry trade parzialmente smontato. Attenzione: un rialzo aggressivo BoJ può innescare volatilità globale (vedi Flash Crash agosto 2024: Nikkei -13% in un giorno).',
      sources: [
        { label: 'BoJ Policy', url: 'https://www.boj.or.jp/en/mopo/index.htm' }
      ]
    },
    {
      name: '🇬🇧 Bank of England (BoE)', rate: '4,75%', next: '8 Maggio 2026',
      outlook: 'Probabile taglio 25bps. Inflazione UK +3,5%', trend: '⬇️ Allentamento graduale', color: '#10b981',
      detail: 'La BoE ha avviato un ciclo di tagli graduali nel 2025. Inflazione UK ancora sopra target ma in calo. Impatto diretto sul portafoglio limitato (titoli non UK), ma un BoE dovish contribuisce al sentiment risk-on globale. Positivo per SHEL, RIO (quotate a Londra).',
      sources: [
        { label: 'BoE Rate Decision', url: 'https://www.bankofengland.co.uk/monetary-policy' }
      ]
    },
    {
      name: '🇨🇳 People\'s Bank of China (PBoC)', rate: '3,45% (LPR 1Y)', next: '20 Maggio 2026',
      outlook: 'Possibile taglio 10bps — stimolo anti-deflazione', trend: '⬇️ Stimolo persistente vs deflazione', color: '#ef4444',
      detail: 'Cina in deflazione (-0,3% CPI). Crisi immobiliare residua (Evergrande, Country Garden). Il governo ha lanciato pacchetti stimolo $200Mld+ ma efficacia limitata. Un taglio PBoC è positivo per commodities (Cina = 60% domanda rame, 55% acciaio). FCX e RIO beneficiano da recovery cinese. Rischio: tensioni USA-Cina limitano recupero.',
      sources: [
        { label: 'PBoC Policy', url: 'http://www.pbc.gov.cn/en/3688229/index.html' },
        { label: 'China Outlook — IMF', url: 'https://www.imf.org/en/Countries/CHN' }
      ]
    }
  ];

  c.innerHTML = banks.map(function(b) {
    return '<div style="padding:14px;border-radius:10px;border:1px solid ' + b.color + '33;background:' + b.color + '08;margin-bottom:10px;">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:8px;">'
      + '<div><div style="font-weight:700;font-size:15px;">' + b.name + '</div>'
      + '<div style="font-size:12px;color:var(--dim);">' + b.trend + ' · Prossima: <strong>' + b.next + '</strong></div></div>'
      + '<div style="text-align:right;"><div style="font-family:monospace;font-size:20px;font-weight:700;color:' + b.color + ';">' + b.rate + '</div>'
      + '<div style="font-size:12px;color:var(--muted);">' + b.outlook + '</div></div>'
      + '</div>'
      + '<div style="font-size:13px;color:var(--muted);margin-bottom:8px;line-height:1.6;">' + b.detail + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;">'
      + b.sources.map(function(s) {
          return '<a href="' + s.url + '" target="_blank" style="font-size:12px;color:var(--accent2);text-decoration:none;border:1px solid var(--border2);padding:1px 7px;border-radius:4px;">' + s.label + ' ↗</a>';
        }).join('')
      + '</div></div>';
  }).join('');
}

function renderCommodityMonitor() {
  const c = document.getElementById('commodity-monitor');
  c.innerHTML = geoBadge('Commodity Monitor — 10 asset · WTI · Gold · 26/04/2026');
  const commodities = [
    { name:'WTI Crude Oil', price:'$94,40', change:'-1,51%', dir:'down', correlation:'XOM 0.85 · SHEL 0.80 · CPI', driver:'Post-Iran accord. Range atteso $85-105', ticker:'USO' },
    { name:'Brent Crude', price:'$97,80', change:'-1,3%', dir:'down', correlation:'SHEL 0.82 · BP 0.85', driver:'Spread Brent-WTI $3,4/bbl (normale)', ticker:null },
    { name:'Natural Gas (Henry Hub)', price:'$2,85', change:'+1,2%', dir:'up', correlation:'NEE 0.30 · XOM 0.45', driver:'LNG export USA record · AI datacenter demand', ticker:null },
    { name:'Gold', price:'$3.340', change:'+0,8%', dir:'up', correlation:'Risk-off · USD inverso · inflazione hedge', driver:'Banche centrali emergenti 1.000t/anno · de-dollarizzazione', ticker:'GLD' },
    { name:'Silver', price:'$31,20', change:'+1,4%', dir:'up', correlation:'Solar demand 0.65 · gold 0.82', driver:'EV + fotovoltaico boom. Green transition metal', ticker:null },
    { name:'Copper', price:'$4,65/lb', change:'+0,9%', dir:'up', correlation:'FCX 0.78 · RIO 0.65 · China PMI', driver:'AI datacenter copper wiring + recovery Cina', ticker:null },
    { name:'Uranium', price:'$92/lb', change:'+2,4%', dir:'up', correlation:'Nuclear power stocks', driver:'AI datacenter power demand → nuclear renaissance. SMR tech', ticker:null },
    { name:'Lithium Carbonate', price:'$14.200/t', change:'+3,1%', dir:'up', correlation:'EV stocks', driver:'Rimbalzo da -70% picco 2022. EV demand 2027 outlook', ticker:null },
    { name:'Wheat (CBOT)', price:'$540/bu', change:'-0,8%', dir:'down', correlation:'Inflazione alimentare', driver:'Corridoio Mar Nero rinnovato. Grano ucraino', ticker:null },
    { name:'US 10Y Treasury', price:'4,25%', change:'+0,02', dir:'up', correlation:'REIT inverso · growth inverso', driver:'FED hold. Rendimenti stabili ma elevated vs pre-2022', ticker:'TLT' }
  ];

  c.innerHTML = '<div class="grid-3">' + commodities.map(function(cm) {
    return '<div style="padding:12px;background:var(--surface2);border-radius:8px;border:1px solid var(--border);">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">'
      + '<div style="font-size:12px;color:var(--dim);text-transform:uppercase;letter-spacing:.05em;font-weight:600;">' + cm.name + '</div>'
      + (cm.ticker ? '<span class="ticker-link" style="font-size:11px;" onclick="openStockModal(\'' + cm.ticker + '\')">' + cm.ticker + '</span>' : '')
      + '</div>'
      + '<div style="font-size:18px;font-weight:700;margin:4px 0;" class="' + cm.dir + '">' + cm.price + ' <span style="font-size:13px;">' + cm.change + '</span></div>'
      + '<div style="font-size:12px;color:var(--dim);margin-bottom:3px;">Corr: ' + cm.correlation + '</div>'
      + '<div style="font-size:12px;color:var(--muted);">' + cm.driver + '</div>'
      + '</div>';
  }).join('') + '</div>'
  + '<div style="margin-top:10px;font-size:12px;color:var(--dim);">Fonti: '
  + '<a href="https://www.eia.gov/petroleum/" target="_blank" style="color:var(--accent2);">EIA</a> · '
  + '<a href="https://www.investing.com/commodities" target="_blank" style="color:var(--accent2);">Investing.com</a> · '
  + '<a href="https://www.gold.org" target="_blank" style="color:var(--accent2);">World Gold Council</a> · '
  + '<a href="https://www.lme.com" target="_blank" style="color:var(--accent2);">LME Metals</a>'
  + '</div>';
}

function renderMacroCalendar() {
  const calEl = document.getElementById('macro-calendar');
  if (!calEl) return;
  calEl.innerHTML = geoBadge('Calendario Macro & Earnings — prossimi eventi · 26/04/2026');
  const events = [
    { date:'07 Mag', event:'FOMC Meeting — FED rate decision', imp:'HIGH',
      impact:'Tutto il portafoglio. Hold atteso ma mercati guardano al forward guidance. Cut bias = rally generalizzato +5-8% per REIT e growth tech.',
      url:'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm' },
    { date:'14 Mag', event:'US CPI Aprile 2026', imp:'HIGH',
      impact:'CPI < 3%: boost FED cut probability → REIT e growth salgono. CPI > 3,5%: sell-off generalizzato. Dato più importante del mese.',
      url:'https://www.bls.gov/cpi/' },
    { date:'15 Mag', event:'Deadline SEC 13F Q1 2026', imp:'HIGH',
      impact:'Intelligence: tutti i fondi pubblicano posizioni Q1 2026. Leggere WhaleWisdom, Fintel, SEC EDGAR per flussi istituzionali aggiornati.',
      url:'https://efts.sec.gov/LATEST/search-index?q=&forms=13F-HR' },
    { date:'20 Mag', event:'NVDA Earnings Q1 FY2027', imp:'HIGH',
      impact:'NVDA, AVGO, ASML, MU, EQIX. Revenue atteso $43,3Mld (+68% YoY). Beat = rally semiconduttori +5-10%. Miss = sell-off.',
      url:'https://investor.nvidia.com' },
    { date:'01 Mag', event:'Bank of Japan — Rate decision', imp:'MED',
      impact:'JPY/USD carry trade. Volatilità globale se BoJ sorprende con rialzo 25bps inatteso.',
      url:'https://www.boj.or.jp/en' },
    { date:'08 Mag', event:'Bank of England — Rate decision', imp:'MED',
      impact:'Probabile taglio 25bps. Positivo per UK equities (SHEL, RIO). Contribuisce al sentiment risk-on globale.',
      url:'https://www.bankofengland.co.uk' },
    { date:'06 Giu', event:'ECB rate decision', imp:'MED',
      impact:'Probabile taglio 25bps. Positivo per ASML, ENEL, Schneider. Euro si indebolisce = export UE favorito.',
      url:'https://www.ecb.europa.eu' },
    { date:'Lug 2026', event:'Earnings Q2 2026 — DLR, EQIX, NEE', imp:'HIGH',
      impact:'DLR Q2 atteso FFO $2,10. EQIX FFO $9,18 consensus. NEE Q2 EPS $1,05. Catalizzatori per confermare trend accumulo.',
      url:'https://www.sec.gov/cgi-bin/browse-edgar' }
  ];
  const impColor = { HIGH:'var(--red)', MED:'var(--yellow)', LOW:'var(--green)' };
  calEl.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">' + events.map(function(e) {
    return '<div style="display:flex;gap:12px;padding:12px;background:var(--surface2);border-radius:8px;border-left:3px solid ' + (impColor[e.imp] || 'var(--dim)') + ';">'
      + '<div style="min-width:65px;text-align:center;">'
      + '<div style="font-size:13px;font-weight:700;color:var(--accent);">' + e.date + '</div>'
      + '<span style="font-size:11px;font-weight:700;color:' + (impColor[e.imp]) + ';background:' + (impColor[e.imp]) + '22;padding:1px 5px;border-radius:3px;">' + e.imp + '</span>'
      + '</div>'
      + '<div style="flex:1;">'
      + '<div style="font-weight:600;font-size:14px;margin-bottom:3px;">' + e.event + '</div>'
      + '<div style="font-size:13px;color:var(--muted);line-height:1.5;">' + e.impact + '</div>'
      + '</div>'
      + '<div style="align-self:center;">'
      + '<a href="' + e.url + '" target="_blank" style="font-size:12px;color:var(--accent2);text-decoration:none;border:1px solid var(--border2);padding:2px 7px;border-radius:4px;white-space:nowrap;">Fonte ↗</a>'
      + '</div></div>';
  }).join('') + '</div>';
}

function renderGeopoliticaWatchlist() {
  const el = document.getElementById('geopolitica-watchlist');
  if (!el) return;
  const watchItems = [
    { region:'🇸🇦 Arabia Saudita / OPEC+', watch:'Meeting OPEC+ 1 Giugno 2026 — decisione produzione', impact:'Oil price, XOM, SHEL. Tagli produzione → oil $100+. Aumento produzione → oil < $85.', urgency:'HIGH' },
    { region:'🇮🇱 Medio Oriente', watch:'Negoziati normalizzazione Israele-Arabia Saudita (mediati USA)', impact:'Riduzione premium geopolitico regionale. Oil -3-5% se accordo. Positivo risk-on globale.', urgency:'MED' },
    { region:'🇮🇳 India — AI & Semiconductor Hub', watch:'India CHIPS Act 2026. Samsung/TSMC fab India discussions', impact:'Diversificazione supply chain chip. Positivo per AVGO (custom). Riduce Taiwan concentration risk.', urgency:'MED' },
    { region:'🇪🇺 Europa — Difesa AI', watch:'European Defense Fund €500Mld. AI Sovereignty Act. Chips for Europe Initiative', impact:'ASML (EUV monopoly secured). Neutralizza alcune restrizioni USA-Cina export. Positivo lungo termine.', urgency:'MED' },
    { region:'🇧🇷 BRICS+ De-dollarizzazione', watch:'BRICS+ expansion. Tentativo de-dollarizzazione commercio petrolio e oro', impact:'USD pressure lungo termine. Gold beneficia (+safe haven demand). Impatto breve termine limitato.', urgency:'LOW' },
    { region:'🇲🇽 Messico — Nearshoring', watch:'Tesla Gigafactory Mexico + NVIDIA datacenter Mexico City', impact:'TSLA (produzione EV), NEE (energia rinnovabile Mexico), AVGO (supply chain diversificata).', urgency:'LOW' }
  ];
  const urgColor = { HIGH:'var(--red)', MED:'var(--yellow)', LOW:'var(--green)' };
  el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">' + watchItems.map(function(w) {
    return '<div style="padding:12px;background:var(--surface2);border-radius:8px;border:1px solid var(--border);display:flex;gap:12px;align-items:flex-start;">'
      + '<div style="min-width:160px;font-weight:600;font-size:14px;">' + w.region + '</div>'
      + '<div style="flex:1;">'
      + '<div style="font-size:13px;color:var(--text);margin-bottom:3px;font-weight:500;">👁 ' + w.watch + '</div>'
      + '<div style="font-size:13px;color:var(--muted);line-height:1.5;">💼 ' + w.impact + '</div>'
      + '</div>'
      + '<span style="font-size:12px;font-weight:700;color:' + (urgColor[w.urgency]) + ';background:' + (urgColor[w.urgency]) + '22;padding:2px 8px;border-radius:4px;white-space:nowrap;">' + w.urgency + '</span>'
      + '</div>';
  }).join('') + '</div>';
}
