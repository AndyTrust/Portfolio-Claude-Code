/**
 * AI Portfolio Manager — Strategic Portfolio v4.0
 * Budget: $3,500 USD | Aggiornato: 25 Aprile 2026
 */

const AI_PORTFOLIO_VERSION = "4.0";
const AI_PORTFOLIO_DATE = "25/04/2026";

// ─── EUR/USD rate ──────────────────────────────────────────────────────────────
let EUR_USD_RATE = 1.08; // aggiornare manualmente o via API

// ─── Budget & Allocation ──────────────────────────────────────────────────────
const AI_BUDGET_TOTAL = 3500; // USD

// ─── Active Positions ─────────────────────────────────────────────────────────
const AI_POSITIONS = [
  {
    ticker: "AVGO",
    name: "Broadcom Inc.",
    sector: "Semiconduttori / AI Custom Silicon",
    shares: 2,
    entryPrice: 404.00,
    currentPrice: 404.00,
    targetPartial: 450,
    targetFull: 520,
    stopLoss: 340,
    entryDate: "25/04/2026",
    signal: "ACCUMULO",
    signalColor: "green",
    conviction: "ALTA",
    reasoning: `Broadcom è l'unico player capace di progettare chip AI custom (ASIC) per i 3 maggiori hyperscaler mondiali (Google TPU, Meta MTIA, ByteDance XPU). A differenza di NVDA che vende GPU universali, AVGO vende chip su misura con switching cost elevatissimo. Consenso analisti 27 Buy / 0 Sell — unanime. +45% in 2 mesi dimostra momentum istituzionale confermato. Identificato insieme a NVDA come uno dei 2 soli titoli con crescita EPS esplosiva nel 2026.`,
    sellReasoning: `Vendita parziale a $450 (resistenza + +11%). Vendita totale a $500-520 (consensus target). Stop loss a $340 se rompe SMA200 (-16%).`,
    catalysts: ["Earnings Q2 FY26 (giugno 2026)", "Annunci nuovi contratti ASIC hyperscaler", "VMware subscription conversion rate"],
    risks: ["PE 72x molto elevato", "Presidente ha venduto 30.175 azioni (piano schedulato)", "Concentrazione su pochi clienti"],
    peerPE: { AVGO: 72.57, MRVL: 55, NVDA: 41.28, INTC: 45 },
    sources: ["https://finance.yahoo.com/quote/AVGO", "https://openinsider.com/search?q=AVGO"],
    lastCheck: "25/04/2026"
  },
  {
    ticker: "NEE",
    name: "NextEra Energy Inc.",
    sector: "Utilities / Energia Rinnovabile",
    shares: 8,
    entryPrice: 96.25,
    currentPrice: 96.25,
    targetPartial: 105,
    targetFull: 118,
    stopLoss: 82,
    entryDate: "25/04/2026",
    signal: "ACCUMULO",
    signalColor: "green",
    conviction: "ALTA",
    reasoning: `NEE è la utility con la crescita più alta degli USA (EPS +10% YoY vs settore +3-5%). Ha raggiunto un nuovo ATH il 23 aprile dopo Q1 beat. È il doppio beneficiario del mega-trend AI: (1) fornitore di energia pulita ai data center AI e (2) infrastruttura rinnovabile potenziata da sussidi IRA. Dividendo +10%/anno per 20+ anni consecutivi. Beta 0.65 = volatilità bassa = alta qualità risk-adjusted.`,
    sellReasoning: `Vendita parziale a $105 (+9%). Vendita totale a $115-120 (+20-25%). Stop a $82 se rompe SMA200.`,
    catalysts: ["Power Purchase Agreements nuovi con AI hyperscaler", "Fed rate cut (boost REIT/utilities)", "Earnings Q2 (luglio 2026)"],
    risks: ["RSI ~70 vicino overbought dopo ATH", "Rotazione verso tech in mercati risk-on", "Tassi Fed più alti del previsto"],
    peerPE: { NEE: 25.28, DUK: 16, SO: 17, D: 18 },
    sources: ["https://finance.yahoo.com/quote/NEE", "https://openinsider.com/search?q=NEE"],
    lastCheck: "25/04/2026"
  },
  {
    ticker: "DLR",
    name: "Digital Realty Trust",
    sector: "REIT / Data Center",
    shares: 3,
    entryPrice: 201.00,
    currentPrice: 201.00,
    targetPartial: 225,
    targetFull: 252,
    stopLoss: 170,
    entryDate: "25/04/2026",
    signal: "ACCUMULO",
    signalColor: "green",
    conviction: "ALTA",
    reasoning: `DLR ha dato il segnale più forte della settimana: Q1 FFO $2,04 vs consensus $1,94 (+5% beat) + 4 broker che alzano il target in 48 ore (Stifel $230, Mizuho $217, Morgan Stanley, Raymond James). Questo pattern combinato — beat + upgrade multipli coordinati — è storicamente associato a performance +15-25% nei 6 mesi successivi. AI datacenter demand garantita per anni. Dividendo 2,5% mentre si aspetta il target.`,
    sellReasoning: `Vendita parziale a $225 (+12%) dopo il target Stifel $230. Vendita totale a $250-255 (+24%). Stop $170.`,
    catalysts: ["Earnings Q2 2026 (luglio): conferma guidance", "Pre-leasing AI hyperscaler annunci", "Fed rate cut"],
    risks: ["Tassi alti = costo del debito elevato per REIT", "Potenziale oversupply datacenter 2027-2028"],
    peerPE: { DLR: 60, EQIX: 72.7, IRM: 45 },
    sources: ["https://finance.yahoo.com/quote/DLR", "https://openinsider.com/search?q=DLR"],
    lastCheck: "25/04/2026"
  },
  {
    ticker: "NVDA",
    name: "Nvidia Corporation",
    sector: "Semiconduttori / AI Hardware",
    shares: 1,
    entryPrice: 208.24,
    currentPrice: 208.24,
    targetPartial: 250,
    targetFull: 290,
    stopLoss: 170,
    entryDate: "25/04/2026",
    signal: "MISTO",
    signalColor: "yellow",
    conviction: "MEDIA",
    reasoning: `NVDA è il titolo "picks and shovels" dell'AI: qualsiasi modello AI usa GPU NVDA. Dominanza CUDA (5M+ sviluppatori), architettura Blackwell, roadmap Rubin fino 2028. Tengo 1 azione piccola come esposizione core al mega-trend AI in attesa degli earnings del 20 maggio come catalizzatore principale. Se EPS > $5 e guidance positiva → re-rating verso $240+.`,
    sellReasoning: `Target parziale $250 (+20%). Target totale $280-290 (+35%). Stop $170 se rompe SMA200. ATTENZIONE: insider selling $208M recente e distribuzione marginale fondi. Position size piccola per questo motivo.`,
    catalysts: ["Earnings 20 Maggio 2026: EPS atteso >$5", "GTC 2026: roadmap Rubin", "Blackwell B200 ordini update"],
    risks: ["Insider selling $208M recente", "2375 fondi in riduzione vs 2920 in aumento (margine si restringe)", "Export controls Cina H20", "Valutazione PE 41x molto estesa"],
    peerPE: { NVDA: 41.28, AMD: 28, INTC: 45, AVGO: 72.57 },
    sources: ["https://finance.yahoo.com/quote/NVDA", "https://openinsider.com/search?q=NVDA"],
    lastCheck: "25/04/2026"
  },
  {
    ticker: "XOM",
    name: "ExxonMobil Corporation",
    sector: "Energia / Oil & Gas",
    shares: 2,
    entryPrice: 150.00,
    currentPrice: 150.00,
    targetPartial: 165,
    targetFull: 176,
    stopLoss: 132,
    entryDate: "25/04/2026",
    signal: "MISTO",
    signalColor: "yellow",
    conviction: "MEDIA",
    reasoning: `XOM è il hedge naturale del portafoglio contro rischio geopolitico e inflazione. Con WTI a $92,60 (+3,27% oggi) per le tensioni Iran, XOM beneficia direttamente. Pioneer acquisition ha creato vantaggio competitivo duraturo (costo produzione Permian ~$35/barile). Guyana production ramp +30% entro 2027. Dividendo 3,5% (Dividend Aristocrat 40+ anni) offre floor di rendimento.`,
    sellReasoning: `Target parziale $165 (+10%). Target totale $175-176 (ritorno ATH). Stop $132 (-12%) se WTI crolla su de-escalation Iran.`,
    catalysts: ["Tensioni Iran (bidirezionale)", "Guyana production milestone", "OPEC+ meeting decisioni"],
    risks: ["De-escalation Iran → calo WTI → pressione XOM", "Transizione energetica lungo periodo", "Tassi alti = CAPEX costoso"],
    peerPE: { XOM: 21.82, CVX: 15, SHEL: 10, TTE: 9 },
    sources: ["https://finance.yahoo.com/quote/XOM", "https://openinsider.com/search?q=XOM"],
    lastCheck: "25/04/2026"
  }
];

// ─── Watchlist ─────────────────────────────────────────────────────────────────
const AI_WATCHLIST = [
  {
    ticker: "MU",
    name: "Micron Technology",
    currentPrice: 496.30,
    entryTarget: 465,
    entryTargetHigh: 470,
    targetPrice: 560,
    stopLoss: 410,
    priority: "ALTA",
    budget: 465,
    reason: `MU è il titolo più sottovalutato del portafoglio: PE 18x vs settore 28x, EV/EBITDA 10x vs 18x medio, ma Q1 revenue +57% YoY e +69% YTD. Unico produttore HBM (High-Bandwidth Memory) americano. Domanda HBM per NVDA Blackwell garantita 18-24 mesi. Aspetto pullback a $465-470 (SMA50) per entry con miglior risk/reward.`,
    condition: "Pullback a SMA50 (~$460-470)",
    lastCheck: "25/04/2026"
  },
  {
    ticker: "LLY",
    name: "Eli Lilly",
    currentPrice: 883.89,
    entryTarget: 850,
    entryTargetHigh: 865,
    targetPrice: 1100,
    stopLoss: 790,
    priority: "MEDIA",
    budget: 870,
    reason: `LLY detiene il 60% del mercato GLP-1 (in crescita vs NVO al 40%). Tirzepatide superiore clinicamente. GLP-1 orale (orforglipron) in arrivo. Morgan Stanley Overweight. CFO ha comprato open-market a $750 (segnale interno forte). Il dip attuale (-3,7%) su prescrizioni settimanali è tattico, non strutturale.`,
    condition: "Ulteriore dip a $850 (SMA200)",
    lastCheck: "25/04/2026"
  },
  {
    ticker: "EQIX",
    name: "Equinix Inc.",
    currentPrice: 1102.28,
    entryTarget: 1050,
    entryTargetHigh: 1070,
    targetPrice: 1300,
    stopLoss: 950,
    priority: "MEDIA",
    budget: 1060,
    reason: `EQIX è il monopolio "fisico" dell'AI infrastruttura mondiale. 260 data center in 72 mercati, 10.000+ clienti. Stifel PT alzato a $1.250 il 22/04. RSI vicino overbought a $1.102 — aspetto pullback al SMA50 ($1.050) per miglior risk/reward.`,
    condition: "Pullback a SMA50 (~$1.050-1.070)",
    lastCheck: "25/04/2026"
  },
  {
    ticker: "ASML",
    name: "ASML Holding",
    currentPrice: 1245,
    entryTarget: 1180,
    entryTargetHigh: 1200,
    targetPrice: 1600,
    stopLoss: 1050,
    priority: "BASSA",
    budget: 1190,
    reason: `ASML ha il monopolio assoluto EUV. Backlog €39Mld record. Ma il prezzo unitario ($1.245) è incompatibile con il budget corrente ($811 cash). Da monitorare per budget futuro o dopo un significativo stock split.`,
    condition: "Disponibilità budget + pullback a $1.180",
    lastCheck: "25/04/2026"
  }
];

// ─── Performance Calculator ───────────────────────────────────────────────────
function calcPortfolioStats(positions, totalBudget) {
  const invested = positions.reduce((sum, p) => sum + p.shares * p.entryPrice, 0);
  const currentValue = positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
  const cash = totalBudget - invested;
  const totalCurrent = currentValue + cash;
  const pnl = currentValue - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
  const totalPnlPct = (totalCurrent / totalBudget - 1) * 100;

  return {
    invested,
    currentValue,
    cash,
    totalCurrent,
    pnl,
    pnlPct,
    totalPnlPct,
    cashPct: (cash / totalBudget) * 100
  };
}

function calcPositionStats(pos) {
  const cost = pos.shares * pos.entryPrice;
  const value = pos.shares * pos.currentPrice;
  const pnl = value - cost;
  const pnlPct = (pnl / cost) * 100;
  const toTarget = ((pos.targetPartial / pos.currentPrice) - 1) * 100;
  const toStop = ((pos.stopLoss / pos.currentPrice) - 1) * 100;
  const riskReward = Math.abs(toTarget / toStop);
  return { cost, value, pnl, pnlPct, toTarget, toStop, riskReward };
}

function usdToEur(usd) {
  return usd / EUR_USD_RATE;
}

function formatCurrency(val, currency = 'USD') {
  if (currency === 'EUR') {
    return '€' + usdToEur(val).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Real Position Targets (for Analisi Operativa) ───────────────────────────
const REAL_POS_TARGETS = {
  TSLA: { exitPartial: 420, exitFull: 460, stopLoss: 330, signal: 'HOLD', action: 'Attendere Cybercab agosto 2026 come catalyst principale. RSI neutro — nessuna urgenza.', monitor: 'Lancio Cybercab, dati consegne Q2, brand risk Musk/DOGE' },
  BLK:  { exitPartial: 1180, exitFull: 1260, stopLoss: 940, signal: 'HOLD', action: 'In perdita tattica -7,3%. Fondamentali solidi: AUM record $13,9T (+20% YoY), EPS Q1 $12,53 beat. Possibile mediare se cade a $1.000.', monitor: 'AUM mensile, Fed rate decision, iShares flow data' },
  CRSP: { exitPartial: 62, exitFull: 75, stopLoss: 42, signal: 'HOLD', action: 'In profitto +7,6%. Tenere — Casgevy dati 18 mesi e pipeline CTX310 sono catalyst imminenti.', monitor: 'Casgevy prescriptions data, CTX310 trial update, cash runway' },
  ACHR: { exitPartial: 7, exitFull: 9.50, stopLoss: 4.20, signal: 'HOLD', action: 'Piccolo profitto +3,6%. Attendere certificazione FAA Midnight (Q3 2026) per re-rating.', monitor: 'FAA certification progress, United Airlines confirming order, Stellantis production ramp' },
  TEM:  { exitPartial: 58, exitFull: 72, stopLoss: 38, signal: 'TENERE FORTE', action: 'In forte profitto +20,2%. NON vendere prematuramente — AstraZeneca +$200M e CEO acquista $9,6M sono segnali di accelerazione.', monitor: 'Nuovi partner farmaceutici, Q2 earnings revenue growth, espansione ospedali' },
  CRWV: { exitPartial: 135, exitFull: 158, stopLoss: 95, signal: 'HOLD', action: 'Leggermente underwater -2,8%. Consolidamento normale post-IPO rally +188%. Supporto critico $100 — monitorare.', monitor: 'Lock-up expiry settembre 2026, accordo Anthropic revenue recognition, competizione AWS/Azure' }
};

// ─── Analisi Operativa Section ────────────────────────────────────────────────
function renderAnalisiOperativaSection(showEur) {
  const prices = (typeof loadLivePrices === 'function') ? loadLivePrices() : {};
  const trades = (typeof loadRealTrades === 'function') ? loadRealTrades() : [];
  const { positions } = (typeof calcRealPositions === 'function') ? calcRealPositions(trades, prices) : { positions: [] };
  const fmtV = (v) => showEur ? '€' + (v/EUR_USD_RATE).toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2}) : '$' + v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const pct = (v) => (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
  const fmtShares = (n) => n < 1 ? n.toFixed(4) : n.toFixed(2);
  const signalPill = (s) => {
    if (s === 'TENERE FORTE') return '<span style="background:#16a34a;color:#fff;padding:1px 7px;border-radius:4px;font-size:12px;font-weight:700">TENERE FORTE</span>';
    if (s === 'HOLD') return '<span style="background:#f59e0b;color:#1a0e00;padding:1px 7px;border-radius:4px;font-size:12px;font-weight:700">HOLD</span>';
    if (s === 'BUY') return '<span style="background:#C89124;color:#fff;padding:1px 7px;border-radius:4px;font-size:12px;font-weight:700">BUY</span>';
    return '<span style="background:#ef4444;color:#fff;padding:1px 7px;border-radius:4px;font-size:12px;font-weight:700">'+s+'</span>';
  };

  // Calculate available cash from real positions vs AI budget
  const totalRealInvested = positions.reduce((s, p) => s + p.totalCost, 0);
  const availableCash = Math.max(0, AI_BUDGET_TOTAL - totalRealInvested);

  const posRows = positions.map(p => {
    const tgt = REAL_POS_TARGETS[p.ticker] || {};
    const ep = tgt.exitPartial || 0;
    const ef = tgt.exitFull || 0;
    const sl = tgt.stopLoss || 0;
    const toEp = ep ? pct(((ep/p.currentPrice)-1)*100) : '—';
    const toEf = ef ? pct(((ef/p.currentPrice)-1)*100) : '—';
    const toSl = sl ? pct(((sl/p.currentPrice)-1)*100) : '—';
    const sig = tgt.signal || 'HOLD';
    const pnlColor = p.pnl >= 0 ? '#4ade80' : '#f87171';
    const plink = `https://www.perplexity.ai/finance/${p.ticker}`;
    // Shares buyable with remaining budget at current price
    const buyable = availableCash > 0 && p.currentPrice > 0 ? Math.floor(availableCash / p.currentPrice) : 0;
    return `
      <tr style="border-bottom:1px solid rgba(200,145,36,.08)">
        <td style="padding:7px 8px">
          <a href="${plink}" target="_blank" style="color:#FBF7EE;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:.02em">${p.ticker || '—'}</a>
          ${p.name ? `<div style="font-size:12px;color:#8c7a5a;margin-top:1px">${p.name}</div>` : ''}
        </td>
        <td style="padding:7px 8px;color:#d4c4a0;font-size:13px;text-align:right">
          <span style="font-weight:700;color:#FBF7EE">${fmtShares(p.shares)}</span><br>
          <span style="color:#6b7280;font-size:11px">+${buyable} acquistabili</span>
        </td>
        <td style="padding:7px 8px;color:#d4c4a0;text-align:right">${fmtV(p.pmc)}</td>
        <td style="padding:7px 8px;color:#FBF7EE;text-align:right">${fmtV(p.currentPrice)}</td>
        <td style="padding:7px 8px;color:${pnlColor};font-weight:700;text-align:right">
          ${p.pnl >= 0 ? '+' : ''}${fmtV(p.pnl)}<br>
          <small>${pct(p.pnlPct)}</small>
        </td>
        <td style="padding:7px 8px;color:#C89124;text-align:right">${ep ? fmtV(ep) : '—'}<br><small style="opacity:.7">${toEp}</small></td>
        <td style="padding:7px 8px;color:#86efac;text-align:right">${ef ? fmtV(ef) : '—'}<br><small style="opacity:.7">${toEf}</small></td>
        <td style="padding:7px 8px;color:#f87171;text-align:right">${sl ? fmtV(sl) : '—'}<br><small style="opacity:.7">${toSl}</small></td>
        <td style="padding:7px 8px;text-align:center">${signalPill(sig)}</td>
        <td style="padding:7px 8px;font-size:12px;max-width:200px;line-height:1.4;color:#d4c4a0">${tgt.action || '—'}</td>
        <td style="padding:7px 8px;text-align:center">
          <button onclick="openQuickSellModal('${p.ticker}', ${p.currentPrice.toFixed(2)}, ${p.shares.toFixed(6)})"
            style="background:#ef4444;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:700;white-space:nowrap">
            💰 VENDI
          </button>
        </td>
      </tr>`;
  }).join('');

  const wlRows = AI_WATCHLIST.map(w => {
    const livePrice = prices[w.ticker] || w.currentPrice;
    const gap = ((w.entryTarget / livePrice) - 1) * 100;
    const prioColor = w.priority === 'ALTA' ? '#ef4444' : w.priority === 'MEDIA' ? '#f59e0b' : '#6b7280';
    const buyableShares = livePrice > 0 ? Math.floor(availableCash / livePrice) : 0;
    const atEntry = w.entryTarget > 0 ? Math.floor(availableCash / w.entryTarget) : 0;
    return `
      <tr style="border-bottom:1px solid rgba(200,145,36,.08)">
        <td style="padding:7px 8px">
          <a href="https://www.perplexity.ai/finance/${w.ticker}" target="_blank" style="color:#FBF7EE;text-decoration:none;font-weight:800;font-size:15px">${w.ticker || '—'}</a>
          ${w.name ? `<div style="font-size:12px;color:#8c7a5a;margin-top:1px">${w.name}</div>` : ''}
        </td>
        <td style="padding:7px 8px;color:#FBF7EE;text-align:right">${fmtV(livePrice)}</td>
        <td style="padding:7px 8px;color:#C89124;text-align:right">${fmtV(w.entryTarget)} – ${fmtV(w.entryTargetHigh)}</td>
        <td style="padding:7px 8px;${gap < 0 ? 'color:#f87171' : 'color:#4ade80'};text-align:right">${pct(gap)}</td>
        <td style="padding:7px 8px;color:#86efac;text-align:right">${fmtV(w.targetPrice)}</td>
        <td style="padding:7px 8px;color:#f87171;text-align:right">${fmtV(w.stopLoss)}</td>
        <td style="padding:7px 8px;text-align:center"><span style="background:${prioColor};color:#fff;padding:1px 7px;border-radius:4px;font-size:12px;font-weight:700">${w.priority}</span></td>
        <td style="padding:7px 8px;font-size:12px;color:#4ade80;text-align:right">
          <strong>${atEntry}</strong> az. a target<br>
          <span style="color:#8c7a5a">${buyableShares} az. ora</span>
        </td>
        <td style="padding:7px 8px;font-size:12px;color:#d4c4a0">${w.condition}</td>
      </tr>`;
  }).join('');

  const calendarItems = [
    { date: '29/04', event: 'NVDA export controls update — atteso dopo market close', ticker: 'NVDA', type: 'alert' },
    { date: '30/04', event: 'EQIX Q1 2026 Earnings (FFO consensus $9,18)', ticker: 'EQIX', type: 'earnings' },
    { date: '01/05', event: 'XOM Q1 2026 Earnings (EPS consensus $1,71)', ticker: 'XOM', type: 'earnings' },
    { date: '20/05', event: 'NVDA Q1 FY27 Earnings — EPS atteso >$5 (CATALYST CHIAVE)', ticker: 'NVDA', type: 'earnings' },
    { date: 'Q2/26', event: 'AVGO Q2 FY26 Earnings — nuovi contratti ASIC attesi', ticker: 'AVGO', type: 'earnings' },
    { date: 'Q3/26', event: 'ACHR — Certificazione FAA Midnight (game-changer)', ticker: 'ACHR', type: 'milestone' },
    { date: 'Ago/26', event: 'TSLA Cybercab robotaxi lancio commerciale', ticker: 'TSLA', type: 'milestone' },
    { date: 'Set/26', event: 'CRWV — Lock-up expiry pre-IPO holders (rischio vendite)', ticker: 'CRWV', type: 'alert' },
  ];
  const typeColor = { earnings: '#C89124', milestone: '#4ade80', alert: '#f87171' };
  const calHtml = calendarItems.map(c => `
    <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(200,145,36,.1)">
      <div style="background:${typeColor[c.type]};color:#1a0e00;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:700;white-space:nowrap;min-width:50px;text-align:center">${c.date}</div>
      <div style="flex:1">
        <span style="font-size:12px;font-weight:700;color:${typeColor[c.type]};margin-right:6px">${c.ticker}</span>
        <span style="font-size:14px;color:#d4c4a0">${c.event}</span>
      </div>
    </div>`).join('');

  return `
  <div style="background:linear-gradient(135deg,#1a0e00 0%,#2A1810 100%);border:1px solid rgba(200,145,36,.3);border-radius:12px;padding:24px;margin-bottom:24px">
    <!-- Header -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
      <div style="width:3px;height:28px;background:#C89124;border-radius:2px"></div>
      <div>
        <div style="font-size:17px;font-weight:800;color:#C89124;letter-spacing:.05em">📋 ANALISI OPERATIVA — PIANO D'AZIONE</div>
        <div style="font-size:13px;color:#8c7a5a;margin-top:2px">Aggiornato: 25/04/2026 · Tutte le posizioni reali + watchlist · Prezzi live via Perplexity Finance</div>
      </div>
    </div>

    <!-- Budget bar -->
    <div style="background:rgba(200,145,36,.1);border:1px solid rgba(200,145,36,.25);border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div style="font-size:13px;color:#8c7a5a;font-weight:700;text-transform:uppercase;letter-spacing:.05em">💰 Budget</div>
      <div style="font-size:14px;color:#d4c4a0">Totale: <strong style="color:#FBF7EE">${fmtV(AI_BUDGET_TOTAL)}</strong></div>
      <div style="font-size:14px;color:#d4c4a0">Investito: <strong style="color:#f87171">${fmtV(totalRealInvested)}</strong></div>
      <div style="font-size:14px;color:#d4c4a0">Cash libero: <strong style="color:#4ade80">${fmtV(availableCash)}</strong></div>
      <div style="flex:1;background:rgba(0,0,0,.3);border-radius:4px;height:6px;min-width:80px">
        <div style="height:6px;border-radius:4px;background:linear-gradient(90deg,#C89124,#f59e0b);width:${Math.min(100,(totalRealInvested/AI_BUDGET_TOTAL*100)).toFixed(1)}%"></div>
      </div>
      <div style="font-size:13px;color:#C89124;font-weight:700">${(totalRealInvested/AI_BUDGET_TOTAL*100).toFixed(1)}% allocato</div>
    </div>

    <!-- Real Positions Table -->
    <div style="margin-bottom:24px;background:rgba(74,222,128,.04);border:1.5px solid rgba(74,222,128,.25);border-radius:12px;padding:16px 14px">
      <div style="margin-bottom:12px">
        <div style="font-size:15px;font-weight:800;color:#4ade80;text-transform:uppercase;letter-spacing:.08em;display:flex;align-items:center;gap:8px">
          <span style="display:inline-block;width:10px;height:10px;background:#4ade80;border-radius:50%;flex-shrink:0"></span>
          💼 POSIZIONI REALI — Capitale investito oggi
        </div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;padding-left:18px">
          Questi sono gli stock che <strong style="color:#d4c4a0">possiedi con denaro reale</strong>.
          Ogni riga rappresenta soldi veri già investiti — monitorare PMC, P&L e segnali di uscita.
        </div>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#d4c4a0">
          <thead>
            <tr style="color:#8c7a5a;font-size:12px;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid rgba(200,145,36,.2)">
              <th style="text-align:left;padding:6px 8px">Ticker</th>
              <th style="text-align:right;padding:6px 8px">Qty / Acquistabili</th>
              <th style="text-align:right;padding:6px 8px">PMC</th>
              <th style="text-align:right;padding:6px 8px">Prezzo</th>
              <th style="text-align:right;padding:6px 8px">P&L $ / %</th>
              <th style="text-align:right;padding:6px 8px">Exit Parziale</th>
              <th style="text-align:right;padding:6px 8px">Exit Totale</th>
              <th style="text-align:right;padding:6px 8px">Stop Loss</th>
              <th style="text-align:center;padding:6px 8px">Segnale</th>
              <th style="text-align:left;padding:6px 8px">Note operative</th>
              <th style="padding:6px 8px"></th>
            </tr>
          </thead>
          <tbody>
            ${posRows || '<tr><td colspan="11" style="text-align:center;color:#8c7a5a;padding:16px">Caricamento posizioni…</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    </div><!-- /real positions card -->

    <!-- Watchlist Table -->
    <div style="margin-bottom:24px;background:rgba(99,102,241,.05);border:1.5px solid rgba(99,102,241,.3);border-radius:12px;padding:16px 14px">
      <div style="margin-bottom:12px">
        <div style="font-size:15px;font-weight:800;color:#818cf8;text-transform:uppercase;letter-spacing:.08em;display:flex;align-items:center;gap:8px">
          <span style="display:inline-block;width:10px;height:10px;background:#818cf8;border-radius:50%;flex-shrink:0"></span>
          🎯 WATCHLIST — Titoli da acquistare
        </div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;padding-left:18px">
          Questi stock <strong style="color:#d4c4a0">non sono ancora in portafoglio</strong>.
          Monitorati per un futuro acquisto quando raggiungono la condizione di ingresso.
          Cash disponibile: <span style="color:#4ade80;font-weight:700">${fmtV(availableCash)}</span>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#d4c4a0">
          <thead>
            <tr style="color:#8c7a5a;font-size:12px;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid rgba(200,145,36,.2)">
              <th style="text-align:left;padding:6px 8px">Ticker</th>
              <th style="text-align:right;padding:6px 8px">Prezzo Att.</th>
              <th style="text-align:right;padding:6px 8px">Entry Target</th>
              <th style="text-align:right;padding:6px 8px">Gap%</th>
              <th style="text-align:right;padding:6px 8px">Target</th>
              <th style="text-align:right;padding:6px 8px">Stop</th>
              <th style="text-align:center;padding:6px 8px">Priorità</th>
              <th style="text-align:right;padding:6px 8px">Acquistabili</th>
              <th style="text-align:left;padding:6px 8px">Condizione</th>
            </tr>
          </thead>
          <tbody>${wlRows}</tbody>
        </table>
      </div>
    </div>

    </div><!-- /watchlist card -->

    <!-- Calendar -->
    <div>
      <div style="font-size:13px;font-weight:700;color:#C89124;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px">
        📅 CALENDARIO CATALYST — PROSSIMI 60 GIORNI
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px">
        ${calHtml}
      </div>
    </div>
  </div>`;
}

// ─── Render AI Portfolio Tab ──────────────────────────────────────────────────
function renderAIPortfolio() {
  const container = document.getElementById('ai-portfolio-root');
  if (!container) return;

  // Load current prices from state if available
  const livePositions = AI_POSITIONS.map(p => {
    const livePrice = (window.APP_STATE && window.APP_STATE.livePrices && window.APP_STATE.livePrices[p.ticker]) || p.currentPrice;
    return { ...p, currentPrice: livePrice };
  });

  const stats = calcPortfolioStats(livePositions, AI_BUDGET_TOTAL);
  const showEur = document.getElementById('ai-currency-toggle')?.checked;

  const fmtVal = (v) => showEur ? formatCurrency(v, 'EUR') : formatCurrency(v, 'USD');

  container.innerHTML = `
    <!-- Header Banner -->
    <div class="ai-portfolio-header">
      <div class="ai-pf-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span>AI Portfolio Manager</span>
        <span class="ai-pf-badge">PRO</span>
      </div>
      <div class="ai-pf-meta">
        <span>Aggiornato: ${AI_PORTFOLIO_DATE}</span>
        <label class="ai-currency-switch">
          <input type="checkbox" id="ai-currency-toggle" ${showEur ? 'checked' : ''} onchange="renderAIPortfolio()">
          <span class="ai-currency-label">USD</span>
          <span class="ai-currency-pill">EUR</span>
        </label>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="ai-kpi-row">
      <div class="ai-kpi-card">
        <div class="ai-kpi-label">Budget Totale</div>
        <div class="ai-kpi-value">${fmtVal(AI_BUDGET_TOTAL)}</div>
      </div>
      <div class="ai-kpi-card">
        <div class="ai-kpi-label">Investito</div>
        <div class="ai-kpi-value">${fmtVal(stats.invested)}</div>
        <div class="ai-kpi-sub">${(100 - stats.cashPct).toFixed(1)}% allocato</div>
      </div>
      <div class="ai-kpi-card">
        <div class="ai-kpi-label">Valore Attuale</div>
        <div class="ai-kpi-value">${fmtVal(stats.currentValue)}</div>
        <div class="ai-kpi-sub ${stats.pnl >= 0 ? 'pos' : 'neg'}">${stats.pnl >= 0 ? '+' : ''}${fmtVal(stats.pnl)} (${stats.pnlPct.toFixed(2)}%)</div>
      </div>
      <div class="ai-kpi-card highlight">
        <div class="ai-kpi-label">Cash Disponibile</div>
        <div class="ai-kpi-value">${fmtVal(stats.cash)}</div>
        <div class="ai-kpi-sub">${stats.cashPct.toFixed(1)}% del portfolio</div>
      </div>
    </div>

    <!-- ═══ ANALISI OPERATIVA ═══ -->
    ${renderAnalisiOperativaSection(showEur)}

    <!-- Active Positions -->
    <div class="ai-section-title">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
      Posizioni Attive <span class="ai-count-badge">${livePositions.length}</span>
    </div>

    <div class="ai-positions-grid">
      ${livePositions.map(p => {
        const s = calcPositionStats(p);
        const signalClass = p.signal === 'ACCUMULO' ? 'signal-green' : p.signal === 'DISTRIBUZIONE' ? 'signal-red' : 'signal-yellow';
        return `
        <div class="ai-position-card" data-ticker="${p.ticker}">
          <div class="ai-pos-header">
            <div class="ai-pos-ticker">${p.ticker}</div>
            <div class="ai-pos-name">${p.name}</div>
            <div class="ai-pos-signal ${signalClass}">${p.signal}</div>
          </div>

          <div class="ai-pos-price-row">
            <div>
              <div class="ai-pos-label">Prezzo Ingresso</div>
              <div class="ai-pos-val">$${p.entryPrice.toFixed(2)}</div>
            </div>
            <div>
              <div class="ai-pos-label">Prezzo Attuale</div>
              <div class="ai-pos-val">${p.currentPrice !== p.entryPrice ? '<span class="live-tag">LIVE</span>' : ''} $${p.currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <div class="ai-pos-label">Azioni</div>
              <div class="ai-pos-val">${p.shares} az.</div>
            </div>
            <div>
              <div class="ai-pos-label">P&L</div>
              <div class="ai-pos-val ${s.pnl >= 0 ? 'pos' : 'neg'}">${s.pnl >= 0 ? '+' : ''}${fmtVal(s.pnl)}<br><small>${s.pnl >= 0 ? '+' : ''}${s.pnlPct.toFixed(2)}%</small></div>
            </div>
          </div>

          <div class="ai-pos-levels">
            <div class="ai-level target-partial">
              <span class="ai-level-label">Target Parziale</span>
              <span class="ai-level-val">$${p.targetPartial} <small class="pos">+${s.toTarget.toFixed(1)}%</small></span>
            </div>
            <div class="ai-level target-full">
              <span class="ai-level-label">Target Totale</span>
              <span class="ai-level-val">$${p.targetFull} <small class="pos">+${(((p.targetFull/p.currentPrice)-1)*100).toFixed(1)}%</small></span>
            </div>
            <div class="ai-level stop">
              <span class="ai-level-label">Stop Loss</span>
              <span class="ai-level-val">$${p.stopLoss} <small class="neg">${s.toStop.toFixed(1)}%</small></span>
            </div>
            <div class="ai-level rr">
              <span class="ai-level-label">Risk/Reward</span>
              <span class="ai-level-val ${s.riskReward >= 2 ? 'pos' : s.riskReward >= 1.5 ? '' : 'neg'}">${s.riskReward.toFixed(1)}x</span>
            </div>
          </div>

          <details class="ai-pos-details">
            <summary>📋 Analisi dettagliata</summary>
            <div class="ai-pos-reasoning">
              <div class="ai-reasoning-section">
                <strong>🎯 Perché comprato:</strong>
                <p>${p.reasoning}</p>
              </div>
              <div class="ai-reasoning-section">
                <strong>📤 Quando vendere:</strong>
                <p>${p.sellReasoning}</p>
              </div>
              <div class="ai-reasoning-section">
                <strong>⚡ Catalizzatori prossimi:</strong>
                <ul>${p.catalysts.map(c => `<li>${c}</li>`).join('')}</ul>
              </div>
              <div class="ai-reasoning-section">
                <strong>⚠️ Rischi:</strong>
                <ul>${p.risks.map(r => `<li>${r}</li>`).join('')}</ul>
              </div>
              <div class="ai-reasoning-section ai-peer-pe">
                <strong>📊 PE Comparativa:</strong>
                <div class="peer-bars">
                  ${Object.entries(p.peerPE).map(([t, pe]) => `
                    <div class="peer-bar-item ${t === p.ticker ? 'current' : ''}">
                      <div class="peer-bar-label">${t}</div>
                      <div class="peer-bar-bg"><div class="peer-bar-fill" style="width:${Math.min(pe/80*100,100)}%"></div></div>
                      <div class="peer-bar-val">${pe}x</div>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="ai-reasoning-section">
                <a href="${p.sources[0]}" target="_blank" class="ai-source-link">📈 Yahoo Finance</a>
                <a href="${p.sources[1]}" target="_blank" class="ai-source-link">🏛️ SEC Form 4</a>
                <a href="http://openinsider.com/search?q=${p.ticker}" target="_blank" class="ai-source-link" style="background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.3);color:#4ade80;">📋 OpenInsider</a>
                <span class="ai-last-check">Verificato: ${p.lastCheck}</span>
              </div>
              ${(() => {
                if (typeof MONEY_FOLLOW_DATA === 'undefined') return '';
                const acts = (MONEY_FOLLOW_DATA.insiderActivity || []).filter(a => a.ticker === p.ticker);
                if (!acts.length) return '';
                return '<div class="ai-reasoning-section" style="margin-top:8px;padding:8px;background:rgba(10,8,4,.4);border-radius:6px;border:1px solid rgba(200,145,36,.2);">'
                  + '<strong style="font-size:12px;color:#C89124;display:block;margin-bottom:6px;">📋 INSIDER FEED — Form 4 SEC VERIFICATO</strong>'
                  + acts.map(a => {
                      const isBuy = a.action === 'BUY';
                      const col = isBuy ? '#4ade80' : '#f87171';
                      const secLnk = a.secUrl ? `<a href="${a.secUrl}" target="_blank" style="color:#818cf8;font-size:11px;margin-left:6px;text-decoration:none;" title="SEC Form 4 XML originale">SEC Form 4 ↗</a>` : '';
                      return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px;">
                        <span style="color:${col};font-weight:700;min-width:40px;">${isBuy ? '↑ BUY' : '↓ SELL'}</span>
                        <span style="color:var(--muted);">${a.date}</span>
                        <span style="color:var(--text);">${a.insider} (${a.role})</span>
                        <span style="color:${col};font-weight:600;margin-left:auto;">${a.value}</span>
                        ${secLnk}
                      </div>`;
                    }).join('')
                  + '</div>';
              })()}
            </div>
          </details>
        </div>
      `}).join('')}
    </div>

    <!-- Watchlist -->
    <div class="ai-section-title" style="margin-top:28px">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      Watchlist — Entry Pianificato <span class="ai-count-badge">${AI_WATCHLIST.length}</span>
    </div>

    <div class="ai-watchlist-grid">
      ${AI_WATCHLIST.map(w => {
        const prio = w.priority === 'ALTA' ? 'prio-red' : w.priority === 'MEDIA' ? 'prio-yellow' : 'prio-green';
        const gap = ((w.currentPrice / w.entryTarget) - 1) * 100;
        return `
        <div class="ai-watchlist-card">
          <div class="ai-wl-top">
            <span class="ai-wl-ticker">${w.ticker}</span>
            <span class="ai-wl-name">${w.name}</span>
            <span class="ai-wl-prio ${prio}">Priorità ${w.priority}</span>
          </div>
          <div class="ai-wl-prices">
            <div>
              <div class="ai-pos-label">Prezzo Attuale</div>
              <div class="ai-pos-val">$${w.currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <div class="ai-pos-label">Entry Target</div>
              <div class="ai-pos-val">$${w.entryTarget} – $${w.entryTargetHigh}</div>
            </div>
            <div>
              <div class="ai-pos-label">Gap all'Entry</div>
              <div class="ai-pos-val neg">–${gap.toFixed(1)}%</div>
            </div>
            <div>
              <div class="ai-pos-label">Budget Previsto</div>
              <div class="ai-pos-val">${fmtVal(w.budget)}</div>
            </div>
          </div>
          <div class="ai-wl-condition">
            <span class="ai-wl-cond-label">⏳ Condizione:</span> ${w.condition}
          </div>
          <details class="ai-pos-details">
            <summary>📋 Motivazione</summary>
            <p style="padding:10px 0;font-size:15px;color:var(--text-secondary,#666)">${w.reason}</p>
            <span class="ai-last-check">Verificato: ${w.lastCheck}</span>
          </details>
        </div>
      `}).join('')}
    </div>

    <!-- Allocation Chart (CSS-based) -->
    <div class="ai-section-title" style="margin-top:28px">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
      Allocazione Portfolio
    </div>
    <div class="ai-allocation-bars">
      ${[...livePositions.map(p => ({
        label: p.ticker,
        value: p.shares * p.currentPrice,
        pct: (p.shares * p.currentPrice / AI_BUDGET_TOTAL * 100),
        color: p.signal === 'ACCUMULO' ? 'var(--brand-ochre, #C89124)' : 'var(--color-amber, #f59e0b)'
      })), { label: 'CASH', value: stats.cash, pct: stats.cashPct, color: '#6b7280' }]
      .sort((a, b) => b.pct - a.pct)
      .map(item => `
        <div class="ai-alloc-row">
          <div class="ai-alloc-label">${item.label}</div>
          <div class="ai-alloc-bar-bg">
            <div class="ai-alloc-bar-fill" style="width:${item.pct.toFixed(1)}%;background:${item.color}"></div>
          </div>
          <div class="ai-alloc-pct">${item.pct.toFixed(1)}%</div>
          <div class="ai-alloc-val">${fmtVal(item.value)}</div>
        </div>
      `).join('')}
    </div>

    <div class="ai-portfolio-footer">
      <span>📅 Prossima revisione: 28 Aprile 2026</span>
      <span>📁 <a href="memory/portfolio_strategy.md" target="_blank">Strategia completa</a></span>
      <span>🔄 Tasso EUR/USD: ${EUR_USD_RATE}</span>
    </div>
  `;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  // Render when the portfolio tab is shown
  const observer = new MutationObserver(() => {
    if (document.getElementById('ai-portfolio-root') &&
        document.getElementById('ai-portfolio-root').offsetParent !== null) {
      renderAIPortfolio();
    }
  });
  observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

  // Also render on tab click
  document.querySelectorAll('.tab[data-tab="portfolio"]').forEach(el => {
    el.addEventListener('click', () => setTimeout(renderAIPortfolio, 100));
  });

  // Initial render if already on portfolio tab
  setTimeout(renderAIPortfolio, 300);
});

// Export for external use
window.AI_PORTFOLIO = {
  positions: AI_POSITIONS,
  watchlist: AI_WATCHLIST,
  budget: AI_BUDGET_TOTAL,
  render: renderAIPortfolio,
  stats: () => calcPortfolioStats(AI_POSITIONS, AI_BUDGET_TOTAL)
};
