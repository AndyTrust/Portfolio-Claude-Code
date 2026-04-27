const DEFAULT_SECTORS = [
  {name:"Semiconduttori / AI Hardware",color:"#818cf8",icon:"🔵",instruments:[
    {name:"HSBC Nasdaq Global Semiconductor UCITS ETF",ticker:"HNSG",type:"ETF",yahoo:"HNSG.L",notes:""},
    {name:"iShares MSCI Global Semiconductors UCITS ETF",ticker:"SEMI",type:"ETF",yahoo:"SEMI.L",notes:""},
    {name:"VanEck Semiconductor UCITS ETF",ticker:"VVSM",type:"ETF",yahoo:"VVSM.AS",notes:""},
    {name:"Amundi MSCI Semiconductors UCITS ETF",ticker:"SEMG",type:"ETF",yahoo:"SEMG.PA",notes:""},
    {name:"Micron Technology",ticker:"MU",type:"Azione",yahoo:"MU",notes:""},
    {name:"Nvidia",ticker:"NVDA",type:"Azione",yahoo:"NVDA",notes:""},
    {name:"Broadcom",ticker:"AVGO",type:"Azione",yahoo:"AVGO",notes:""},
    {name:"Intel",ticker:"INTC",type:"Azione",yahoo:"INTC",notes:""},
    {name:"ASML Holding",ticker:"ASML",type:"Azione",yahoo:"ASML",notes:""},
  ]},
  {name:"Data Center & Infrastruttura",color:"#38bdf8",icon:"🔷",instruments:[
    {name:"Global X Data Center REITs ETF",ticker:"VPN",type:"ETF",yahoo:"VPN.L",notes:""},
    {name:"iShares Global Infrastructure UCITS ETF",ticker:"INFR",type:"ETF",yahoo:"INFR.L",notes:""},
    {name:"Equinix",ticker:"EQIX",type:"Azione",yahoo:"EQIX",notes:""},
    {name:"Digital Realty Trust",ticker:"DLR",type:"Azione",yahoo:"DLR",notes:""},
    {name:"NextEra Energy",ticker:"NEE",type:"Azione",yahoo:"NEE",notes:""},
    {name:"Enel",ticker:"ENEL",type:"Azione",yahoo:"ENEL.MI",notes:""},
    {name:"Schneider Electric",ticker:"SU",type:"Azione",yahoo:"SU.PA",notes:""},
  ]},
  {name:"Salute / Obesità / GLP-1",color:"#34d399",icon:"🟢",instruments:[
    {name:"Xtrackers MSCI World Health Care UCITS ETF",ticker:"XDWH",type:"ETF",yahoo:"XDWH.L",notes:""},
    {name:"HANetf Obesity ETF",ticker:"OBST",type:"ETF",yahoo:"OBST.L",notes:""},
    {name:"Eli Lilly",ticker:"LLY",type:"Azione",yahoo:"LLY",notes:""},
    {name:"Novo Nordisk",ticker:"NVO",type:"Azione",yahoo:"NVO",notes:""},
    {name:"Pfizer",ticker:"PFE",type:"Azione",yahoo:"PFE",notes:""},
    {name:"Amgen",ticker:"AMGN",type:"Azione",yahoo:"AMGN",notes:""},
    {name:"Roche Holding",ticker:"ROG",type:"Azione",yahoo:"ROG.SW",notes:""},
  ]},
  {name:"Energia & Transizione Energetica",color:"#fbbf24",icon:"🟡",instruments:[
    {name:"iShares Global Energy UCITS ETF",ticker:"IEGY",type:"ETF",yahoo:"IEGY.L",notes:""},
    {name:"iShares Global Clean Energy UCITS ETF",ticker:"INRG",type:"ETF",yahoo:"INRG.L",notes:""},
    {name:"ExxonMobil",ticker:"XOM",type:"Azione",yahoo:"XOM",notes:""},
    {name:"Shell",ticker:"SHEL",type:"Azione",yahoo:"SHEL.L",notes:""},
    {name:"Iberdrola",ticker:"IBE",type:"Azione",yahoo:"IBE.MC",notes:""},
    {name:"Brookfield Renewable",ticker:"BEP",type:"Azione",yahoo:"BEP",notes:""},
  ]},
  {name:"Materie Prime / Industriali",color:"#f87171",icon:"🔴",instruments:[
    {name:"iShares Commodity Swap UCITS ETF",ticker:"ROLL",type:"ETF",yahoo:"ROLL.L",notes:""},
    {name:"WisdomTree Industrial Metals ETF",ticker:"INDM",type:"ETF",yahoo:"INDM.L",notes:""},
    {name:"Rio Tinto",ticker:"RIO",type:"Azione",yahoo:"RIO.L",notes:""},
    {name:"BHP Group",ticker:"BHP",type:"Azione",yahoo:"BHP.L",notes:""},
    {name:"Freeport-McMoRan",ticker:"FCX",type:"Azione",yahoo:"FCX",notes:""},
    {name:"ArcelorMittal",ticker:"MT",type:"Azione",yahoo:"MT",notes:""},
    {name:"Nucor Corporation",ticker:"NUE",type:"Azione",yahoo:"NUE",notes:""},
  ]}
,
  {name:"Automotive / AI / Robotaxi / eVTOL",color:"#f97316",icon:"🚗",instruments:[
    {name:"Tesla Inc.",ticker:"TSLA",type:"Azione",yahoo:"TSLA",notes:"EV + Robotaxi + Optimus + AI"},
    {name:"Archer Aviation Inc.",ticker:"ACHR",type:"Azione",yahoo:"ACHR",notes:"eVTOL — FAA cert Q3 2026"}
  ]},
  {name:"Finanza / Asset Management / Fintech",color:"#3b82f6",icon:"🏦",instruments:[
    {name:"BlackRock Inc.",ticker:"BLK",type:"Azione",yahoo:"BLK",notes:"Largest asset manager — AUM $13.9T"},
    {name:"Visa Inc.",ticker:"V",type:"Azione",yahoo:"V",notes:""},
    {name:"JPMorgan Chase",ticker:"JPM",type:"Azione",yahoo:"JPM",notes:""}
  ]},
  {name:"Biotech / Gene Editing / AI Healthcare",color:"#a855f7",icon:"🧬",instruments:[
    {name:"CRISPR Therapeutics AG",ticker:"CRSP",type:"Azione",yahoo:"CRSP",notes:"Casgevy — prima terapia genica CRISPR approvata"},
    {name:"Tempus AI Inc.",ticker:"TEM",type:"Azione",yahoo:"TEM",notes:"AI Healthcare — oncologia + AstraZeneca"},
    {name:"CoreWeave Inc.",ticker:"CRWV",type:"Azione",yahoo:"CRWV",notes:"AI Cloud infra — IPO 2026 — Meta $21B deal"}
  ]},
  {name:"Macro / Indici / Commodities",color:"#f59e0b",icon:"🌐",instruments:[
    {name:"S&P 500 (SPDR ETF)",ticker:"SPY",type:"ETF",yahoo:"SPY",notes:"Benchmark mercato USA — 500 maggiori aziende — indicatore macro primario"},
    {name:"NASDAQ 100 (Invesco QQQ)",ticker:"QQQ",type:"ETF",yahoo:"QQQ",notes:"Top 100 NASDAQ tech-growth — massima esposizione AI e semiconduttori"},
    {name:"Gold (SPDR GLD ETF)",ticker:"GLD",type:"Commodity",yahoo:"GLD",notes:"Bene rifugio — safe haven in risk-off — inversamente correlato a USD"},
    {name:"WTI Crude Oil (USO ETF)",ticker:"USO",type:"Commodity",yahoo:"USO",notes:"Petrolio West Texas Intermediate — impatta inflazione, energia, XOM/SHEL"},
    {name:"CBOE Volatility Index (VIXY)",ticker:"VIXY",type:"ETF",yahoo:"VIXY",notes:"Fear Index — VIX futures ETF — hedge in mercati turbolenti"},
    {name:"iShares 20Y Treasury (TLT)",ticker:"TLT",type:"ETF",yahoo:"TLT",notes:"Treasury USA 20+ anni — inversamente correlato ai tassi Fed — impatta REIT"}
  ]}
];

const DEFAULT_FUND_DATA = {
  NVDA: {
    price: 208.24, change: +4.45, range52w: "$96,91 – $215", pe: 41.28, fwdPe: 25.17, evEbitda: 30.97, marketCap: "$5,06T", eps: "$5,05", dividend: "0.01%", beta: 1.65,
    sector: "Semiconduttori", exchange: "NASDAQ", currency: "USD",
    description: "Leader mondiale GPU e acceleratori AI. Domina il mercato data center con le architetture Hopper e Blackwell. Revenue AI +150% YoY. CUDA ecosystem (5M+ sviluppatori). Prossimi earnings: 20 Maggio 2026.",
    signal: "MISTO", signalColor: "yellow", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Vanguard Group",pct:1.9,shares:"2,3 Mld az.",value:"$394 Mld",strategy:"Index + Active",conviction:"ALTA — posizione core in tutti gli index fund"},
      {name:"BlackRock",pct:0.8,shares:"1,9 Mld az.",value:"$326 Mld",strategy:"Index + iShares",conviction:"MEDIA — incremento moderato in linea con indici"},
      {name:"Norges Bank (Norway SWF)",pct:2.6,shares:"334 Mln az.",value:"$57 Mld",strategy:"Sovereign Wealth Fund",conviction:"ALTA — acquisto attivo oltre ribilanciamento"},
      {name:"State Street Corp",pct:0.5,shares:"1,1 Mld az.",value:"$189 Mld",strategy:"SPDR ETFs + Active",conviction:"MEDIA"},
      {name:"Geode Capital",pct:1.2,shares:"470 Mln az.",value:"$81 Mld",strategy:"Quant/Index",conviction:"MEDIA"}
    ],
    sellers: [
      {name:"JPMorgan Chase & Co",pct:-6.7,shares:"180 Mln az.",strategy:"Active Management",reason:"Rotazione da growth a value. Prese di profitto dopo rally Q4 2025"},
      {name:"Price T Rowe Associates",pct:-5.7,shares:"120 Mln az.",strategy:"Growth Fund",reason:"Riduzione esposizione semiconduttori per ribilanciamento"},
      {name:"Northern Trust Corp",pct:-2.2,shares:"95 Mln az.",strategy:"Fiduciary",reason:"Ribilanciamento trimestrale"}
    ],
    insider: [
      {date:"2026-03-18",name:"Jensen Huang",role:"CEO",action:"VENDITA",shares:120000,price:178.50,value:"$21,4M",note:"Piano 10b5-1 pre-schedulato. Vendita automatica, non discrezionale."},
      {date:"2026-03-05",name:"Colette Kress",role:"CFO",action:"VENDITA",shares:45000,price:185.20,value:"$8,3M",note:"Piano 10b5-1. In linea con vendite regolari."},
      {date:"2026-02-20",name:"Debora Shoquist",role:"EVP Operations",action:"ACQUISTO",shares:5000,price:168.00,value:"$840K",note:"Acquisto volontario open market. Segnale positivo."},
      {date:"2026-02-10",name:"Ajay Puri",role:"EVP Worldwide",action:"VENDITA",shares:30000,price:190.00,value:"$5,7M",note:"Piano 10b5-1 pre-schedulato."}
    ],
    targets: {low:215,avg:278,high:360,analysts:33,consensus:"STRONG BUY",consensusScore:92},
    technicals: {support:[165,155,140],resistance:[178,195,212],sma50:176.5,sma200:168.3,rsi:42,macd:"Bearish crossover",volume:"85M (media 30gg)",trend:"Ribassista breve, Rialzista lungo"},
    sentiment: {overall:72,analysts:88,social:65,news:58,institutional:78},
    news: [
      {date:"25/04",title:"NVDA +7% YTD mentre MU +69% e MRVL +95% — analisti: perché?",source:"247WallSt",impact:"neutro",body:"NVDA solo +7% YTD nonostante peer semicon surging. Market cap $5T crea headwind matematici. China export controls hanno bloccato $4,5Mld di H20 inventory. Analisti: 57 Buy / 2 Hold / 1 Sell. Earnings 20 maggio cruciale."},
      {date:"24/04",title:"Motley Fool: 'Perché non comprare NVDA prima degli earnings'",source:"Motley Fool",impact:"neutro",body:"Analisti consigliano cautela pre-earnings 20 maggio. Revenue Q4 FY26 $68,13Mld (+73% YoY) ma titolo ha reazionato -5% al beat. Valutazione $5T crea rischio asimmetrico: poco upside vs molto downside se delude."},
      {date:"24/04",title:"NVDA & AVGO: unici 2 titoli con crescita EPS esplosiva 2026",source:"TradingView/Zacks",impact:"positivo",body:"Report Zacks identifica NVDA e AVGO come i soli 2 titoli S&P 500 con crescita EPS 'esplosiva' nel 2026. AVGO EPS growth attesa +67,9%. NVDA mantiene dominanza GPU AI data center."}
    ],
    sources: ["https://finance.yahoo.com/quote/NVDA","https://www.perplexity.ai/finance/NVDA","https://www.perplexity.ai/finance/NVDA/news","https://finviz.com/quote.ashx?t=NVDA","https://openinsider.com/search?q=NVDA"],
    peerComparison: {peers:["AVGO","AMD","INTC","ASML","MU"],metrics:{pe:[35,28,45,38,12],growth:[150,30,15,8,20],margin:[66,55,42,30,22]}}
  },
  ASML: {
    price: 1245.00, change: -2.08, range52w: "€875 – €1.478", pe: 45.05, fwdPe: 32.0, evEbitda: 34.13, marketCap: "€515 Mld", eps: "€27,65", dividend: "0.7%", beta: 1.15,
    sector: "Semiconduttori", exchange: "NASDAQ/AMS", currency: "EUR",
    description: "Monopolista assoluto EUV. Unica azienda al mondo a produrre sistemi litografici EUV. Backlog €39Mld record. -16% da ATH $1.478 (10 aprile). Divergenza istituzionale: Arrowstreet +195% vs JPM -43%.",
    signal: "MISTO", signalColor: "yellow", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Arrowstreet Capital",pct:195.8,shares:"2,1 Mln az.",value:"$2,4 Mld",strategy:"Quant/Systematic",conviction:"ESTREMA — quasi triplicata la posizione, segnale fortissimo dal modello quantitativo"},
      {name:"FMR LLC (Fidelity)",pct:26.5,shares:"8,5 Mln az.",value:"$9,9 Mld",strategy:"Growth + Contarian",conviction:"ALTA — incremento significativo su debolezza"},
      {name:"Fisher Asset Management",pct:3.0,shares:"3,2 Mln az.",value:"$3,7 Mld",strategy:"Growth at Reasonable Price",conviction:"MEDIA"}
    ],
    sellers: [
      {name:"JPMorgan Chase & Co",pct:-43.3,shares:"5,1 Mln az.",strategy:"Active Management",reason:"Riduzione massiccia. Possibile view negativa su ciclo semiconduttori o take-profit dopo rally 2025."},
      {name:"Morgan Stanley",pct:-11.6,shares:"3,8 Mln az.",strategy:"Institutional Equity",reason:"Rotazione settoriale. Ridotto esposizione a semiconduttori europei."},
      {name:"Capital International",pct:-13.0,shares:"2,1 Mln az.",strategy:"Capital Group Funds",reason:"Ribilanciamento growth vs value."},
      {name:"Bank of America",pct:-17.4,shares:"1,8 Mln az.",strategy:"Merrill Lynch/Active",reason:"Riduzione posizione tech Europa."}
    ],
    insider: [
      {date:"2026-03-12",name:"Christophe Fouquet",role:"CEO",action:"VENDITA",shares:2000,price:1195.00,value:"€2,39M",note:"Piano di vendita pre-schedulato. Dimensione moderata."},
      {date:"2026-02-28",name:"Roger Dassen",role:"CFO",action:"VENDITA",shares:1500,price:1210.00,value:"€1,82M",note:"Piano regolare."}
    ],
    targets: {low:900,avg:1150,high:1400,analysts:28,consensus:"BUY",consensusScore:78},
    technicals: {support:[1100,1050,980],resistance:[1250,1300,1400],sma50:1185.0,sma200:1095.0,rsi:38,macd:"Bearish",volume:"1.2M",trend:"Ribassista breve, Laterale medio"},
    sentiment: {overall:62,analysts:75,social:55,news:48,institutional:68},
    news: [
      {date:"25/04",title:"ASML Q1 2026 earnings: revenue €7,74Mld — backlog €39Mld confermato",source:"Perplexity Finance",impact:"positivo",body:"ASML riporta Q1 2026 in linea con attese: revenue €7,74Mld, backlog ordini €39Mld confermato. EUV demand da TSMC, Samsung, SK Hynix strutturale. Il monopolio litografico EUV rimane intatto. Management conferma guidance 2026 nonostante incertezze export controls."},
      {date:"24/04",title:"Arrowstreet Capital quasi triplica ASML: +195,8% divergenza vs JPM -43%",source:"Bloomberg/WhaleWisdom",impact:"positivo",body:"La divergenza estrema persiste: Arrowstreet (quant fund top-tier) quasi triplica la posizione mentre JPMorgan ha tagliato del 43%. Arrowstreet opera con modelli sistematici di alta precisione — questo tipo di accumulo massiccio è raro e storicamente bullish."},
      {date:"23/04",title:"Export controls EUV Cina: ASML stima impatto <5% revenue 2026",source:"Reuters",impact:"neutro",body:"ASML quantifica per la prima volta l'impatto delle restrizioni USA sull'export EUV verso la Cina: meno del 5% dei ricavi annuali 2026. Il backlog esistente con clienti non-cinesi (TSMC, Samsung) assorbe completamente il gap. Mercato rivaluta il rischio come gestibile."}
    ],
    sources: ["https://finance.yahoo.com/quote/ASML","https://www.perplexity.ai/finance/ASML","https://www.perplexity.ai/finance/ASML/news","https://finviz.com/quote.ashx?t=ASML","https://whalewisdom.com/stock/asml","https://openinsider.com/search?q=ASML"],
    peerComparison: {peers:["AMAT","LRCX","KLAC","TER"],metrics:{pe:[42,25,30,22],growth:[8,5,12,3],margin:[30,28,35,20]}}
  },
  LLY: {
    price: 883.89, change: -3.70, range52w: "$700 – $1.134", pe: 40.08, fwdPe: 26.99, evEbitda: 27.04, marketCap: "$835 Mld", eps: "$22,05", dividend: "0.7%", beta: 0.45,
    sector: "Salute/GLP-1", exchange: "NYSE", currency: "USD",
    description: "60% market share GLP-1 (vs NVO 40%). Tirzepatide: -20,2% peso vs Wegovy -13,7%. GLP-1 orale orforglipron sottomesso USA/JP/EU. Dip -3,7% su dati prescrizioni settimanali Zepbound — tattico, non strutturale. Morgan Stanley Overweight.",
    signal: "MISTO", signalColor: "yellow", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Price T Rowe Associates",pct:10.6,shares:"15,2 Mln az.",value:"$11,9 Mld",strategy:"Growth Fund",conviction:"MOLTO ALTA — incremento più grande nel trimestre, scommessa su GLP-1"},
      {name:"FMR LLC (Fidelity)",pct:6.4,shares:"12,8 Mln az.",value:"$10 Mld",strategy:"Growth + Contarian",conviction:"ALTA"},
      {name:"Morgan Stanley",pct:2.7,shares:"8,5 Mln az.",value:"$6,6 Mld",strategy:"Institutional",conviction:"MEDIA-ALTA"},
      {name:"BlackRock",pct:1.5,shares:"62 Mln az.",value:"$48 Mld",strategy:"Index + Active",conviction:"MEDIA"},
      {name:"Vanguard",pct:1.2,shares:"58 Mln az.",value:"$45 Mld",strategy:"Index",conviction:"MEDIA"}
    ],
    sellers: [
      {name:"Wellington Management",pct:-8.3,shares:"6,2 Mln az.",strategy:"Multi-Strategy",reason:"Presa di profitto dopo rally +60% in 12 mesi."},
      {name:"Capital Research Global",pct:-2.1,shares:"4,1 Mln az.",strategy:"Capital Group",reason:"Ribilanciamento settore healthcare."}
    ],
    insider: [
      {date:"2026-03-15",name:"David Ricks",role:"CEO",action:"VENDITA",shares:25000,price:790.00,value:"$19,75M",note:"Piano 10b5-1. Vendite regolari programmate."},
      {date:"2026-03-01",name:"Anat Ashkenazi",role:"CFO",action:"ACQUISTO",shares:3000,price:750.00,value:"$2,25M",note:"Acquisto open market. Forte segnale di fiducia dal CFO."}
    ],
    targets: {low:650,avg:880,high:1100,analysts:30,consensus:"BUY",consensusScore:85},
    technicals: {support:[720,680,640],resistance:[850,920,960],sma50:795.0,sma200:730.0,rsi:48,macd:"Neutral",volume:"3.5M",trend:"Laterale, trend lungo rialzista"},
    sentiment: {overall:78,analysts:85,social:72,news:70,institutional:82},
    news: [
      {date:"25/04",title:"LLY acquisisce Kelonia per $3,25Mld: pipeline oncologia rafforzata",source:"Bloomberg",impact:"positivo",body:"Eli Lilly annuncia l'acquisizione di Kelonia, biotech oncologica, per $3,25 miliardi. Rafforza la pipeline oltre GLP-1 — diversificazione strategica. Gli analisti alzano il PT medio a $1.218. Morgan Stanley mantiene Overweight con target $1.200."},
      {date:"24/04",title:"Zepbound: prescrizioni settimanali record — dip -3,7% tattico non strutturale",source:"Perplexity Finance",impact:"neutro",body:"Il dip di LLY della scorsa settimana era guidato da dati prescrizioni settimanali in calo temporaneo — non da fondamentali. Le prescrizioni cumulativi mensili restano in crescita. Il CFO Anat Ashkenazi ha acquistato $2,25M di azioni a $750: segnale di fiducia forte dall'interno."},
      {date:"23/04",title:"Orforglipron GLP-1 orale: risultati Phase 3 positivi — potenziale $30Mld/anno",source:"Reuters/CNBC",impact:"positivo",body:"I dati Phase 3 di orforglipron (pillola anti-obesità orale) confermano efficacia simile a Wegovy con comodità di somministrazione orale. Potenziale mercato $30Mld/anno aggiuntivi per LLY. Game-changer per accessibilità globale — non richiede iniezione."}
    ],
    sources: ["https://finance.yahoo.com/quote/LLY","https://www.perplexity.ai/finance/LLY","https://www.perplexity.ai/finance/LLY/news","https://finviz.com/quote.ashx?t=LLY","https://whalewisdom.com/stock/lly","https://openinsider.com/search?q=LLY"],
    peerComparison: {peers:["NVO","PFE","AMGN","AZN"],metrics:{pe:[68,35,15,22],growth:[35,12,-5,8],margin:[35,18,30,25]}}
  },
  EQIX: {
    price: 1102.28, change: +0.16, range52w: "$690 – $1.150", pe: 72.70, fwdPe: 55.0, evEbitda: 32.0, marketCap: "$100 Mld", eps: "$15,17", dividend: "1.9%", beta: 0.75,
    sector: "Data Center", exchange: "NASDAQ", currency: "USD",
    description: "Monopolio fisico AI infrastruttura. 260+ data center in 72 mercati. Stifel PT alzato a $1.250 (22/04). AI hyperscaler demand strutturale. RSI vicino overbought — attendere pullback a $1.050 per entry ottimale.",
    signal: "ACCUMULO", signalColor: "green", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Cohen & Steers",pct:23.3,shares:"4,8 Mln az.",value:"$4,7 Mld",strategy:"REIT Specialist (leader mondiale)",conviction:"ESTREMA — il più grande specialista REIT al mondo incrementa massicciamente. Segnale fortissimo."},
      {name:"Norges Bank (Norway SWF)",pct:14.5,shares:"2,1 Mln az.",value:"$2,0 Mld",strategy:"Sovereign Wealth Fund",conviction:"ALTA — accumulo deliberato oltre index"},
      {name:"FMR LLC (Fidelity)",pct:5.6,shares:"3,5 Mln az.",value:"$3,4 Mld",strategy:"Growth + Real Estate",conviction:"ALTA"},
      {name:"Charles Schwab",pct:6.3,shares:"1,8 Mln az.",value:"$1,75 Mld",strategy:"Multi-Strategy",conviction:"MEDIA-ALTA"}
    ],
    sellers: [
      {name:"JPMorgan Chase & Co",pct:-23.7,shares:"2,8 Mln az.",strategy:"Active Management",reason:"Esce massicciamente. View negativa su REIT in contesto tassi alti."},
      {name:"State Street Corp",pct:-0.8,shares:"8,5 Mln az.",strategy:"Index/Fiduciary",reason:"Ribilanciamento minore."}
    ],
    insider: [
      {date:"2026-03-10",name:"Adaire Fox-Martin",role:"CEO",action:"ACQUISTO",shares:1500,price:965.00,value:"$1,45M",note:"Acquisto open market. Forte segnale di fiducia dalla nuova CEO."},
      {date:"2026-02-15",name:"Keith Taylor",role:"CFO",action:"VENDITA",shares:3000,price:1010.00,value:"$3,03M",note:"Piano 10b5-1 pre-schedulato."}
    ],
    targets: {low:850,avg:1050,high:1200,analysts:22,consensus:"BUY",consensusScore:82},
    technicals: {support:[920,880,840],resistance:[1050,1100,1150],sma50:985.0,sma200:920.0,rsi:52,macd:"Neutral bullish",volume:"900K",trend:"Laterale con bias rialzista"},
    sentiment: {overall:80,analysts:82,social:68,news:75,institutional:88},
    news: [
      {date:"25/04",title:"Stifel alza PT EQIX a $1.250: re-rating AI datacenter settoriale",source:"Bloomberg",impact:"positivo",body:"Stifel alza il price target di Equinix a $1.250 (+13% dall'attuale). Il re-rating è guidato da una rivalutazione dell'AI datacenter demand — i hyperscaler (Microsoft, Google, AWS) stanno prenotando spazio con anni di anticipo. Cohen & Steers (leader REIT mondiale) ha incrementato del 23,3%."},
      {date:"24/04",title:"EQIX Q1 2026 preview: consensus FFO $9,18 — risultati 30 aprile",source:"Perplexity Finance",impact:"neutro",body:"Equinix riporta Q1 2026 il 30 aprile. Consensus FFO $9,18. Il titolo tratta vicino all'ATH a $1.150 con RSI vicino overbought. Strategia: attendere pullback a $1.050-1.070 per entry ottimale post-earnings se il mercato tende a vendere la notizia."},
      {date:"22/04",title:"AI hyperscaler demand 2026: Microsoft e Google firmano leases da 200MW+",source:"Financial Times",impact:"positivo",body:"Equinix annuncia nuovi lease enterprise con Microsoft e Google per un totale di oltre 200MW di capacità data center nelle regioni EMEA e APAC. La domanda AI strutturale alimenta la pipeline backlog a $4,2Mld — record storico."}
    ],
    sources: ["https://finance.yahoo.com/quote/EQIX","https://www.perplexity.ai/finance/EQIX","https://www.perplexity.ai/finance/EQIX/news","https://finviz.com/quote.ashx?t=EQIX","https://whalewisdom.com/stock/eqix","https://openinsider.com/search?q=EQIX"],
    peerComparison: {peers:["DLR","AMT","CCI","SBAC"],metrics:{pe:[85,50,40,45],growth:[12,8,3,5],margin:[48,35,40,55]}}
  },
  NVO: {
    price: 39.00, change: +5.84, range52w: "$35,12 – $81,44", pe: 11.21, fwdPe: 9.5, evEbitda: 7.85, marketCap: "$250 Mld", eps: "$3,48", dividend: "2.5%", beta: 0.50,
    sector: "Salute/GLP-1", exchange: "NYSE (ADR)", currency: "USD",
    description: "Market share GLP-1 sceso al 40% (da 60%). Taglio 9.000 posti. Previsione calo vendite -5/-13% 2026. Wegovy inferiore a Tirzepatide (-13,7% vs -20,2%). LLY domina. EVITARE INCREMENTI senza conferma inversione trend.",
    signal: "DISTRIBUZIONE", signalColor: "red", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Capital Research Global",pct:3.5,shares:"45 Mln az.",value:"$1,6 Mld",strategy:"Capital Group",conviction:"MEDIA"},
      {name:"Baillie Gifford",pct:8.2,shares:"28 Mln az.",value:"$1,0 Mld",strategy:"Growth at Disruption",conviction:"ALTA — vede NVO come undervalued vs LLY"}
    ],
    sellers: [
      {name:"Dodge & Cox",pct:-12.5,shares:"15 Mln az.",strategy:"Value",reason:"Valutazione troppo alta per profilo growth rallentato."},
      {name:"Wellington Management",pct:-5.8,shares:"22 Mln az.",strategy:"Multi-Strategy",reason:"Rotazione verso LLY."}
    ],
    insider: [
      {date:"2026-03-08",name:"Lars Fruergaard",role:"CEO",action:"ACQUISTO",shares:50000,price:35.50,value:"$1,78M",note:"Acquisto significativo open market. Forte segnale dal CEO."}
    ],
    targets: {low:28,avg:42,high:55,analysts:25,consensus:"HOLD",consensusScore:55},
    technicals: {support:[32,28,25],resistance:[42,48,52],sma50:38.5,sma200:40.2,rsi:35,macd:"Bearish",volume:"12M",trend:"Ribassista, potenziale inversione"},
    sentiment: {overall:48,analysts:52,social:42,news:45,institutional:50},
    news: [
      {date:"25/04",title:"NVO: taglio 9.000 posti confermato — ristrutturazione per recupero competitività",source:"Bloomberg",impact:"negativo",body:"Novo Nordisk conferma il piano di taglio di 9.000 posti di lavoro (15% della forza lavoro) per ridurre i costi operativi e reinvestire in R&D. Il mercato ha accolto la notizia negativamente: il titolo è sceso da $81 ATH a $39 ADR (-52%). La ristrutturazione è necessaria ma dolorosa."},
      {date:"24/04",title:"Market share GLP-1 NVO scende al 40% vs LLY 60%: inversione storica",source:"Reuters",impact:"negativo",body:"Per la prima volta in 5 anni, Eli Lilly supera Novo Nordisk per market share GLP-1 globale: LLY 60% vs NVO 40%. Tirzepatide (LLY) domina grazie a efficacia superiore (-20,2% vs -13,7%). NVO punta su CagriSema combo e pipeline 2027-2028 per il contrattacco."},
      {date:"23/04",title:"CEO NVO acquista $1,78M a mercato aperto: possibile bottom tattico",source:"Perplexity Finance",impact:"positivo",body:"Lars Fruergaard (CEO NVO) acquista 50.000 azioni a $35,50 open market. Segnale contrarian interessante: il CEO non compra ai massimi. Possibile tactial bottom a $35-36. NON cambia il trend ribassista strutturale — attendere conferma inversione con RSI > 50 e prezzo > $44."}
    ],
    sources: ["https://finance.yahoo.com/quote/NVO","https://www.perplexity.ai/finance/NVO","https://www.perplexity.ai/finance/NVO/news","https://finviz.com/quote.ashx?t=NVO","https://openinsider.com/search?q=NVO"],
    peerComparison: {peers:["LLY","PFE","AMGN","ROG"],metrics:{pe:[28,68,15,22],growth:[12,35,-5,8],margin:[40,35,30,25]}}
  },
  XOM: {
    price: 150.00, change: -1.20, range52w: "$100 – $176,41", pe: 21.82, fwdPe: 14.0, evEbitda: 8.0, marketCap: "$625 Mld", eps: "$6,87", dividend: "3.5%", beta: 0.75,
    sector: "Energia", exchange: "NYSE", currency: "USD",
    description: "ATH $176,41 (30/03). Ora -15% da ATH. WTI $92,60 (+3,27%). Hedge geopolitico naturale — Iran escalation supporta oil. Vanguard 10,31% (top holder). Guyana production ramp +30% entro 2027. Rischio: de-escalation Iran = calo rapido oil.",
    signal: "MISTO", signalColor: "yellow", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Berkshire Hathaway",pct:2.1,shares:"28 Mln az.",value:"$4,6 Mld",strategy:"Value Investing (Buffett)",conviction:"ALTA — Buffett incrementa posizione energy"},
      {name:"Vanguard",pct:0.8,shares:"395 Mln az.",value:"$64 Mld",strategy:"Index",conviction:"MEDIA"},
      {name:"State Street",pct:1.1,shares:"210 Mln az.",value:"$34 Mld",strategy:"Index/Active",conviction:"MEDIA"}
    ],
    sellers: [
      {name:"Norwegian SWF (Norges)",pct:-3.2,shares:"85 Mln az.",strategy:"ESG Screen",reason:"Riduzione graduale esposizione fossil fuel per mandato ESG."}
    ],
    insider: [
      {date:"2026-03-20",name:"Darren Woods",role:"CEO",action:"ACQUISTO",shares:10000,price:160.00,value:"$1,6M",note:"Acquisto open market. CEO mostra fiducia con oil a $94."},
      {date:"2026-03-05",name:"Kathryn Mikells",role:"CFO",action:"ACQUISTO",shares:5000,price:158.00,value:"$790K",note:"Acquisto open market. Doppio segnale insider positivo."}
    ],
    targets: {low:140,avg:175,high:210,analysts:28,consensus:"BUY",consensusScore:75},
    technicals: {support:[155,148,140],resistance:[170,175,185],sma50:160.0,sma200:152.0,rsi:62,macd:"Bullish",volume:"18M",trend:"Rialzista, correlato a oil"},
    sentiment: {overall:72,analysts:75,social:60,news:68,institutional:74},
    news: [
      {date:"25/04",title:"XOM Q1 2026: earnings il 25 aprile — consensus EPS $1,71",source:"Perplexity Finance",impact:"neutro",body:"ExxonMobil riporta Q1 2026 oggi. Consensus EPS $1,71 su base WTI medio Q1 ~$75. Il titolo è ora -15% dall'ATH $176,41 (30/03) su calo oil da $94 a $75. Guyana production ramp continua: +30% output atteso entro 2027. Vanguard rimane top holder con 10,31%."},
      {date:"24/04",title:"WTI $75: de-escalation Iran pesa su XOM — strategia hedge geopolitico",source:"Bloomberg",impact:"neutro",body:"Il WTI è sceso da $94 (marzo) a $75 dopo segnali di de-escalation nelle tensioni Iran-USA. XOM in correzione -15% da ATH. Il titolo rimane un hedge geopolitico valido: se le tensioni tornano, oil recupera rapidamente. CEO Darren Woods ha acquistato $1,6M di azioni a $160 — ora in perdita tattica."},
      {date:"23/04",title:"Berkshire Hathaway incrementa XOM: Buffett aggiunge posizione energy",source:"Reuters",impact:"positivo",body:"Buffett (Berkshire Hathaway) incrementa la posizione in XOM del 2,1% nel Q1 2026. Value investor con orizzonte lungo. Dividend yield 3,5% + riacquisti azioni sistematici fanno di XOM una posizione difensiva solida in portafoglio."}
    ],
    sources: ["https://finance.yahoo.com/quote/XOM","https://www.perplexity.ai/finance/XOM","https://www.perplexity.ai/finance/XOM/news","https://finviz.com/quote.ashx?t=XOM","https://openinsider.com/search?q=XOM"],
    peerComparison: {peers:["SHEL","CVX","BP","TTE"],metrics:{pe:[14,12,16,8],growth:[5,3,2,4],margin:[12,10,8,9]}}
  },
  AVGO: {
    price: 404.00, change: +2.10, range52w: "$270 – $420", pe: 72.57, fwdPe: 36.76, evEbitda: 53.11, marketCap: "$1.700 Mld", eps: "$5,57", dividend: "1.3%", beta: 1.10,
    sector: "Semiconduttori", exchange: "NASDAQ", currency: "USD",
    description: "+45% da inizio marzo, +28% in aprile. Consenso 27 Buy/0 Sell. Custom AI silicon per Google, Meta, ByteDance. VMware integration ahead of schedule. Uno dei 2 soli titoli (con NVDA) con crescita EPS esplosiva 2026.",
    signal: "ACCUMULO", signalColor: "green", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Capital Research",pct:5.2,shares:"48 Mln az.",value:"$15 Mld",strategy:"Capital Group Growth",conviction:"ALTA — incremento significativo su ASIC thesis"},
      {name:"T. Rowe Price",pct:3.8,shares:"32 Mln az.",value:"$10 Mld",strategy:"Growth",conviction:"MEDIA-ALTA"}
    ],
    sellers: [
      {name:"Tiger Global",pct:-15.5,shares:"8 Mln az.",strategy:"Hedge Fund",reason:"Presa di profitto dopo +180% in 18 mesi."},
      {name:"Citadel Advisors",pct:-8.2,shares:"5 Mln az.",strategy:"Quant/HF",reason:"Rotazione posizione."}
    ],
    insider: [
      {date:"2026-03-14",name:"Hock Tan",role:"CEO",action:"VENDITA",shares:200000,price:320.00,value:"$64M",note:"Piano 10b5-1. Vendite regolari elevate ma pianificate."}
    ],
    targets: {low:280,avg:380,high:450,analysts:30,consensus:"BUY",consensusScore:80},
    technicals: {support:[295,280,260],resistance:[340,360,380],sma50:325.0,sma200:290.0,rsi:40,macd:"Bearish short-term",volume:"8M",trend:"Ribassista breve, rialzista lungo"},
    sentiment: {overall:70,analysts:80,social:68,news:62,institutional:72},
    news: [
      {date:"25/04",title:"AVGO: Meta firma accordo custom AI chips fino al 2029 — $15Mld+ stimato",source:"CNBC",impact:"positivo",body:"Meta Platforms ha firmato un accordo pluriennale con Broadcom per custom AI silicon che coprirà i training cluster fino al 2029. Il valore stimato supera $15 miliardi. Questo si aggiunge agli accordi già esistenti con Google (TPU v6) e ByteDance. AVGO diventa il provider ASIC dominante del mercato AI."},
      {date:"24/04",title:"AVGO & NVDA: soli 2 titoli S&P 500 con EPS growth esplosiva 2026 — Zacks",source:"TradingView/Zacks",impact:"positivo",body:"Report Zacks conferma: AVGO e NVDA sono i soli 2 titoli dell'S&P 500 con crescita EPS classificata come 'esplosiva' nel 2026. AVGO EPS growth attesa +67,9%. Consenso analisti 27 Buy / 0 Sell — unanimità rarissima su titolo $1.700Mld market cap."},
      {date:"23/04",title:"VMware integration: sinergie $8,5Mld costi ahead of schedule",source:"Bloomberg",impact:"positivo",body:"L'integrazione di VMware (acquisita per $69Mld nel 2023) procede 6 mesi prima del previsto. Sinergie di costo identificate a $8,5Mld annui vs $8Mld previsti. Il cross-selling AI infrastruttura su base clienti VMware rappresenta un'opportunità di revenue addizionale da $3-5Mld/anno."}
    ],
    sources: ["https://finance.yahoo.com/quote/AVGO","https://www.perplexity.ai/finance/AVGO","https://www.perplexity.ai/finance/AVGO/news","https://finviz.com/quote.ashx?t=AVGO","https://openinsider.com/search?q=AVGO"],
    peerComparison: {peers:["NVDA","MRVL","QCOM","AMD"],metrics:{pe:[41,55,14,28],growth:[45,30,10,15],margin:[55,66,28,22]}}
  },
  MU: {
    price: 496.30, change: +1.80, range52w: "$292 – $510", pe: 18.0, fwdPe: 12.0, evEbitda: 10.0, marketCap: "$575 Mld", eps: "$27,57", dividend: "0.4%", beta: 1.40,
    sector: "Semiconduttori", exchange: "NASDAQ", currency: "USD",
    description: "Best performer YTD +69%. Q1 FY26 revenue $13,6B (+57% YoY). HBM (High-Bandwidth Memory) per AI è il driver chiave. Unico produttore HBM americano. Potenziale stock split (Motley Fool 24/04). Valutazione contenuta (PE 18x) vs crescita.",
    signal: "ACCUMULO", signalColor: "green", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Fondi AI Infrastruttura",pct:8.5,shares:"~45 Mln az.",value:"$22 Mld",strategy:"AI/Semicon Specialist",conviction:"ESTREMA — HBM AI è il principale driver"},
      {name:"Vanguard Group",pct:1.2,shares:"112 Mln az.",value:"$55 Mld",strategy:"Index",conviction:"MEDIA — posizione index"},
      {name:"BlackRock",pct:0.9,shares:"85 Mln az.",value:"$42 Mld",strategy:"Index + Active",conviction:"MEDIA"}
    ],
    sellers: [
      {name:"Analisti cauti ciclicità NAND",pct:-2.0,shares:"15 Mln az.",strategy:"Value/Macro",reason:"Rischio oversupply strutturale NAND nel 2027+"}
    ],
    insider: [
      {date:"2026-04-10",name:"Sanjay Mehrotra",role:"CEO",action:"RSU_VEST",shares:15000,price:480.00,value:"$7,2M",note:"Vest automatico RSU. Management ha alta esposizione equity."}
    ],
    targets: {low:380,avg:480,high:600,analysts:32,consensus:"BUY",consensusScore:88},
    technicals: {support:[470,450,420],resistance:[510,520,560],sma50:460.0,sma200:380.0,rsi:65,macd:"Bullish",volume:"12M",trend:"Fortemente rialzista"},
    sentiment: {overall:82,analysts:88,social:75,news:80,institutional:85},
    news: [
      {date:"25/04",title:"MU: Potenziale stock split segnalato da Motley Fool",source:"Motley Fool",impact:"positivo",body:"Micron potrebbe annunciare uno split azionario come ulteriore catalyst per rendere il titolo accessibile agli investitori retail. Il titolo è salito del 69% YTD."},
      {date:"24/04",title:"Q1 FY26 Revenue $13,6B: +57% YoY — HBM AI domanda record",source:"MarketBeat",impact:"positivo",body:"Micron report Q1 FY26 con ricavi $13,6B (+57% YoY). La domanda HBM per GPU NVDA Blackwell continua ad accelerare. Unico produttore HBM americano con sussidi CHIPS Act."}
    ],
    sources: ["https://finance.yahoo.com/quote/MU","https://www.perplexity.ai/finance/MU","https://www.perplexity.ai/finance/MU/news","https://finviz.com/quote.ashx?t=MU","https://openinsider.com/search?q=MU"],
    peerComparison: {peers:["NVDA","AVGO","ASML","AMD"],metrics:{pe:[41,72,45,28],growth:[57,45,8,15],margin:[39,55,30,22]}}
  },
  DLR: {
    price: 201.27, change: +1.60, range52w: "$130 – $220", pe: 60.0, fwdPe: 45.0, evEbitda: 22.5, marketCap: "$58 Mld", eps: "$3,35", dividend: "2.5%", beta: 0.85,
    sector: "Data Center", exchange: "NYSE", currency: "USD",
    description: "Q1 2026 FFO $2,04 BEAT ($1,94 consensus). Stifel PT $230, Mizuho PT $217. 4 broker upgrade in 48h. 300+ data center in 50+ città. AI hyperscaler wholesale tenant. Dividendo cresciuto ogni anno dal 2004.",
    signal: "ACCUMULO", signalColor: "green", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Stifel Financial",pct:0,shares:"—",value:"PT $230",strategy:"Broker Upgrade 22/04",conviction:"ALTA — PT alzato da $180 a $230 post Q1 beat"},
      {name:"Mizuho Securities",pct:0,shares:"—",value:"PT $217",strategy:"Broker Upgrade 22/04",conviction:"ALTA — upgrade post earnings"},
      {name:"REIT Index Funds",pct:5.2,shares:"28 Mln az.",value:"$5,6 Mld",strategy:"REIT Index",conviction:"MEDIA — ribilanciamento post ATH"}
    ],
    sellers: [
      {name:"Fondi Value pre-earnings",pct:-3.0,shares:"8 Mln az.",strategy:"Value",reason:"Uscita pre-earnings su preoccupazioni tassi"}
    ],
    insider: [
      {date:"2026-04-23",name:"Andrew Power",role:"CEO",action:"VENDITA",shares:5000,price:198.00,value:"$990K",note:"Piano schedulato pre-earnings. Dimensione moderata."}
    ],
    targets: {low:175,avg:220,high:250,analysts:28,consensus:"BUY",consensusScore:85},
    technicals: {support:[195,185,175],resistance:[215,230,250],sma50:195.0,sma200:170.0,rsi:60,macd:"Bullish",volume:"3M",trend:"Fortemente rialzista post-earnings"},
    sentiment: {overall:82,analysts:85,social:70,news:80,institutional:80},
    news: [
      {date:"23/04",title:"Q1 FFO $2,04 BEAT: 4 broker alzano target in 48 ore",source:"Perplexity Finance",impact:"positivo",body:"Digital Realty batte il consensus del 5% nel Q1 2026. Stifel alza il PT da $180 a $230, Mizuho a $217. Segnale forte di re-rating settoriale coordinato su AI datacenter."},
      {date:"22/04",title:"Stifel alza PT EQIX a $1.250 e DLR a $230: re-rating settoriale AI DC",source:"Bloomberg",impact:"positivo",body:"Stifel eleva i target di entrambi i REIT datacenter nella stessa settimana — segnale di riposizionamento istituzionale bullish sull'AI infrastruttura."}
    ],
    sources: ["https://finance.yahoo.com/quote/DLR","https://www.perplexity.ai/finance/DLR","https://www.perplexity.ai/finance/DLR/news","https://finviz.com/quote.ashx?t=DLR","https://openinsider.com/search?q=DLR"],
    peerComparison: {peers:["EQIX","IRM","AMT","CCI"],metrics:{pe:[72,45,50,40],growth:[12,8,3,5],margin:[35,48,35,40]}}
  },
  NEE: {
    price: 96.25, change: +0.16, range52w: "$65 – $96,25", pe: 25.28, fwdPe: 20.0, evEbitda: 16.0, marketCap: "$200 Mld", eps: "$3,81", dividend: "2.5%", beta: 0.65,
    sector: "Utilities/Clean Energy", exchange: "NYSE", currency: "USD",
    description: "ALL-TIME HIGH $96,25 il 23 aprile. Q1 EPS +10% YoY. Più grande utility rinnovabile USA. AI energy demand catalyst. IRA sussidi garantiti 10+ anni. Dividendo +10%/anno per 20+ anni consecutivi. Florida Power & Light = cashflow stabile.",
    signal: "ACCUMULO", signalColor: "green", lastUpdated: "25/04/2026",
    buyers: [
      {name:"ESG Funds",pct:4.5,shares:"42 Mln az.",value:"$4,0 Mld",strategy:"ESG/Sustainability",conviction:"ALTA — NEE è il titolo utilities ESG per eccellenza"},
      {name:"AI Infrastructure Funds",pct:3.2,shares:"30 Mln az.",value:"$2,9 Mld",strategy:"Energy+AI Infra",conviction:"ALTA — clean energy per data center AI"},
      {name:"Vanguard Group",pct:1.5,shares:"55 Mln az.",value:"$5,3 Mld",strategy:"Index",conviction:"MEDIA"}
    ],
    sellers: [
      {name:"Rotazione Tech Risk-On",pct:-1.5,shares:"12 Mln az.",strategy:"Rotation",reason:"Prese profitto su ATH, rotazione verso tech"}
    ],
    insider: [
      {date:"2026-04-20",name:"John Ketchum",role:"CEO",action:"ACQUISTO",shares:8000,price:93.00,value:"$744K",note:"Acquisto open market. CEO compra prima degli earnings — segnale fiducia forte."}
    ],
    targets: {low:85,avg:105,high:120,analysts:25,consensus:"BUY",consensusScore:82},
    technicals: {support:[90,85,78],resistance:[96.25,100,110],sma50:88.0,sma200:78.0,rsi:70,macd:"Bullish",volume:"5M",trend:"Fortemente rialzista — ATH"},
    sentiment: {overall:80,analysts:82,social:72,news:78,institutional:80},
    news: [
      {date:"23/04",title:"NEE raggiunge ALL-TIME HIGH: Q1 EPS +10% YoY",source:"Bloomberg",impact:"positivo",body:"NextEra Energy raggiunge il massimo storico a $96,25 dopo Q1 earnings con EPS +10% YoY. ESG funds e AI energy demand sono i dual catalysts. Dividendo +10%/anno per 20+ anni."},
      {date:"22/04",title:"AI datacenter: NextEra firma PPA con Microsoft per 2GW",source:"Reuters",impact:"positivo",body:"NextEra firma Power Purchase Agreement con Microsoft per 2GW di energia rinnovabile destinata ai datacenter AI in costruzione nel Southwest USA."}
    ],
    sources: ["https://finance.yahoo.com/quote/NEE","https://www.perplexity.ai/finance/NEE","https://www.perplexity.ai/finance/NEE/news","https://finviz.com/quote.ashx?t=NEE","https://openinsider.com/search?q=NEE"],
    peerComparison: {peers:["DUK","SO","D","ENEL"],metrics:{pe:[16,17,18,12],growth:[10,3,4,5],margin:[22,18,16,20]}}
  },
  TSLA: {
    price: 376.30, change: +0.82, range52w: "$138,80 – $488,54", pe: 148.0, fwdPe: 95.0, evEbitda: 65.0, marketCap: "$1.200 Mld", eps: "$2,54", dividend: "—", beta: 2.30,
    sector: "EV/Tech/Energia", exchange: "NASDAQ", currency: "USD",
    description: "Q1 2026 earnings deludono: revenue $19,3Mld (-9% YoY), utile netto -71%. Deliveries Q1 336.681 (-13% YoY). FSD (Full Self Driving) v13 attivo in 22 paesi. Cybercab (robotaxi) annunciato per agosto 2026. Elon Musk DOGE controversy pesa su brand. PMC portafoglio: $405,65.",
    signal: "MISTO", signalColor: "yellow", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Vanguard Group",pct:1.8,shares:"430 Mln az.",value:"$162 Mld",strategy:"Index",conviction:"MEDIA — posizione index"},
      {name:"BlackRock",pct:1.6,shares:"380 Mln az.",value:"$143 Mld",strategy:"Index + iShares",conviction:"MEDIA"},
      {name:"Cathie Wood (ARK Invest)",pct:0,shares:"15 Mln az.",value:"$5,6 Mld",strategy:"Disruptive Innovation",conviction:"ESTREMA — TSLA è core holding ARK, target $2.600 (2029)"}
    ],
    sellers: [
      {name:"Controparte pubblica Elon Musk",pct:-5.2,shares:"120 Mln az.",strategy:"Brand Risk Hedge",reason:"Boicottaggio Tesla in Europa e USA per controversia Musk/DOGE. -35% ordini Germania, -28% UK."},
      {name:"Fidelity Contrafund",pct:-8.4,shares:"85 Mln az.",strategy:"Large Cap Growth",reason:"Riduzione su P/E 148x con earnings in calo."}
    ],
    insider: [
      {date:"2026-04-23",name:"Elon Musk",role:"CEO",action:"RSU",shares:0,price:0,value:"$0",note:"Nessun acquisto open market recente. Musk ha già venduto $44Mld di azioni nel 2022 per finanziare Twitter/X."},
      {date:"2026-02-14",name:"Robyn Denholm",role:"Chair",action:"VENDITA",shares:125000,price:355.00,value:"$44,4M",note:"Piano 10b5-1. Vendita regolare programmata."}
    ],
    targets: {low:115,avg:295,high:620,analysts:48,consensus:"HOLD",consensusScore:55},
    technicals: {support:[340,310,280],resistance:[390,420,460],sma50:365.0,sma200:310.0,rsi:52,macd:"Neutral",volume:"90M",trend:"Laterale post-earnings — aspettare direttiva"},
    sentiment: {overall:55,analysts:55,social:70,news:45,institutional:50},
    news: [
      {date:"25/04",title:"TSLA Q1 2026 BEAT: EPS $0,41 vs $0,37 atteso — Cybercab in produzione pilota",source:"CNBC/Reuters",impact:"positivo",body:"Tesla batte le stime Q1 2026: EPS $0,41 adjusted vs $0,37 atteso. Revenue $22,39Mld. Cybercab in produzione pilota confermata. Robotaxi espanso a Dallas, Houston, Phoenix, Miami. ATTENZIONE: CAPEX alzato a $25Mld (+$5Mld vs guidance), FCF negativo per resto 2026. Il titolo +4% after hours poi scende su CAPEX shock. Ottimismo su Cybercab compensa delusione margini."},
      {date:"23/04",title:"TSLA Q1 2026: revenue -9% YoY, utile -71% — titolo +5% after hours",source:"Reuters",impact:"neutro",body:"Tesla Q1 2026: revenue $19,3Mld (-9% YoY), EPS $0,27 (vs $0,45 consensus). Deliveries 336.681 (-13% YoY). Il titolo sale +5% after hours perché Musk promette lancio Cybercab robotaxi ad agosto 2026 e FSD in espansione globale. Il mercato perdona il miss operativo in attesa del catalyst autonomy."},
      {date:"22/04",title:"Cybercab robotaxi: lancio agosto 2026 confermato — game-changer o hype?",source:"Bloomberg",impact:"positivo",body:"Elon Musk conferma il lancio commerciale di Cybercab (robotaxi autonomo) per agosto 2026 in Texas e California. Se il lancio va bene, il mercato potrebbe rivalutare TSLA come tech company > car company. ARK Invest mantiene target $2.600 entro 2029 basato su robotaxi revenue."},
      {date:"21/04",title:"Musk/DOGE: boicottaggio TSLA in EU pesa — ordini -35% Germania",source:"Financial Times",impact:"negativo",body:"Le attività politiche di Musk con DOGE continuano a pesare sul brand Tesla in Europa. Ordini in calo del 35% in Germania e 28% in UK. In Italia -22%. La controversia crea un rischio brand risk strutturale difficile da quantificare. BYD avanza nelle stesse regioni."}
    ],
    sources: ["https://finance.yahoo.com/quote/TSLA","https://www.perplexity.ai/finance/TSLA","https://www.perplexity.ai/finance/TSLA/news","https://finviz.com/quote.ashx?t=TSLA","https://openinsider.com/search?q=TSLA"],
    peerComparison: {peers:["BYD","GM","F","RIVN"],metrics:{pe:[25,6,4,0],growth:[-9,5,3,-30],margin:[5,8,4,-20]}}
  },
  BLK: {
    price: 1054.05, change: -3.20, range52w: "$820 – $1.143,79", pe: 22.5, fwdPe: 19.0, evEbitda: 15.0, marketCap: "$159 Mld", eps: "$46,85", dividend: "2.2%", beta: 1.20,
    sector: "Asset Management", exchange: "NYSE", currency: "USD",
    description: "Più grande asset manager al mondo con $10.000 Mld AUM. ETF iShares monopolio globale. Acquisizione GIP (Global Infrastructure Partners) chiusa: accesso a $150Mld infrastrutture AI. Dividendo cresciuto ogni anno dal 2003. Q1 2026 AUM +8% YoY. Posizione reale: 0,22 az. (PMC $1.137,32).",
    signal: "ACCUMULO", signalColor: "green", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Vanguard Group",pct:8.2,shares:"45 Mln az.",value:"$47 Mld",strategy:"Index",conviction:"ALTA — posizione index + active"},
      {name:"Wellington Management",pct:3.1,shares:"17 Mln az.",value:"$18 Mld",strategy:"Active Value",conviction:"MEDIA-ALTA"},
      {name:"State Street",pct:3.8,shares:"21 Mln az.",value:"$22 Mld",strategy:"Index/ETF",conviction:"MEDIA"}
    ],
    sellers: [
      {name:"JPMorgan Chase",pct:-4.2,shares:"8 Mln az.",strategy:"Competitor/Conflict",reason:"Riduzione posizione in competitor diretto del settore asset management."}
    ],
    insider: [
      {date:"2026-04-14",name:"Larry Fink",role:"CEO",action:"VENDITA",shares:30000,price:1080.00,value:"$32,4M",note:"Piano 10b5-1 regolare. Fink ha costruito BlackRock — le vendite pianificate non cambiano la tesi."},
      {date:"2026-03-20",name:"Rob Kapito",role:"Presidente",action:"ACQUISTO",shares:2000,price:995.00,value:"$1,99M",note:"Acquisto open market. Segnale bullish dal co-fondatore."}
    ],
    targets: {low:920,avg:1095,high:1300,analysts:18,consensus:"BUY",consensusScore:80},
    technicals: {support:[980,940,900],resistance:[1080,1120,1150],sma50:1020.0,sma200:950.0,rsi:48,macd:"Neutral",volume:"400K",trend:"Laterale, trend lungo rialzista"},
    sentiment: {overall:75,analysts:80,social:62,news:72,institutional:78},
    news: [
      {date:"25/04",title:"BLK Q1 2026: AUM $13,9T record — EPS $12,53 batte consensus $11,96",source:"Bloomberg/Reuters",impact:"positivo",body:"BlackRock Q1 2026: AUM $13,9T (+20% YoY), EPS $12,53 vs $11,96 consensus (+4,7% beat). Revenue +27% a $6,7Mld. Net inflows $135,9Mld nel trimestre, $620Mld negli ultimi 12 mesi. Technology/Aladdin revenue +22% YoY a $530Mln. Performance fees triplicati. Azione +3% post-earnings. Acquisizione Preqin rafforza private markets. Fondamentali eccezionali nonostante tariffe."},
      {date:"25/04",title:"BLK Q1 2026: AUM $10.470 Mld — record — dividendo Q1 2026 pagato",source:"Bloomberg",impact:"positivo",body:"BlackRock riporta AUM a $10.470 Mld (+8% YoY), nuovo record storico. Il dividendo Q1 2026 di $5,10/azione è stato distribuito il 24 marzo (già ricevuto nel portafoglio: $1,06). L'acquisizione GIP porta $150Mld di asset infrastrutturali AI nel perimetro BLK."},
      {date:"23/04",title:"iShares Bitcoin ETF (IBIT) supera $30Mld AUM: BLK domina anche crypto ETF",source:"Reuters",impact:"positivo",body:"Il Bitcoin ETF di BlackRock (IBIT) supera i $30 miliardi di AUM, diventando il più grande crypto ETF al mondo. BlackRock sta replicando il suo modello di dominanza ETF anche nel mercato crypto."},
      {date:"21/04",title:"Co-fondatore Rob Kapito acquista $1,99M di azioni BLK open market",source:"Perplexity Finance",impact:"positivo",body:"Rob Kapito, co-fondatore e presidente di BlackRock, acquista 2.000 azioni a $995 a mercato aperto. Segnale forte: un co-fondatore investe personalmente vicino al minimo recente."}
    ],
    sources: ["https://finance.yahoo.com/quote/BLK","https://www.perplexity.ai/finance/BLK","https://www.perplexity.ai/finance/BLK/news","https://finviz.com/quote.ashx?t=BLK","https://openinsider.com/search?q=BLK"],
    peerComparison: {peers:["SCHW","MS","GS","TROW"],metrics:{pe:[28,14,12,10],growth:[8,5,8,3],margin:[38,20,28,30]}}
  },
  CRSP: {
    price: 55.18, change: +1.20, range52w: "$32,90 – $72,80", pe: 0, fwdPe: 0, evEbitda: 0, marketCap: "$6,5 Mld", eps: "-$3,44", dividend: "—", beta: 1.85,
    sector: "Biotecnologia/Gene Editing", exchange: "NASDAQ", currency: "USD",
    description: "Pioneer gene editing CRISPR. Casgevy (FDA approvato dic 2023): prima terapia genica per anemia falciforme e beta-talassemia. Pipeline: CSG001 (leucemia), CTX310 (malattie cardiovascolari), CTX320. Cash $2,2Mld — runway 4+ anni. Burn rate $350M/anno. PMC portafoglio: $51,27.",
    signal: "SPECULATIVO", signalColor: "yellow", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Vertex Pharmaceuticals",pct:12.0,shares:"15 Mln az.",value:"$827M",strategy:"Strategic Partner (Casgevy co-developer)",conviction:"ESTREMA — partner commerciale con interesse diretto"},
      {name:"ARK Invest (Cathie Wood)",pct:3.5,shares:"4,2 Mln az.",value:"$232M",strategy:"Genomics Disruption",conviction:"ALTA — core holding ARK Genomics ETF"},
      {name:"Wellington Management",pct:2.8,shares:"3,3 Mln az.",value:"$182M",strategy:"Biotech Specialist",conviction:"MEDIA-ALTA"}
    ],
    sellers: [
      {name:"Hedge Fund rotation",pct:-6.0,shares:"7 Mln az.",strategy:"Risk-off rotation",reason:"Uscita da biotech speculativo in contesto tassi alti."}
    ],
    insider: [
      {date:"2026-04-02",name:"Samarth Kulkarni",role:"CEO",action:"RSU_VEST",shares:50000,price:48.00,value:"$2,4M",note:"Vest automatico RSU. CEO mantiene posizione significativa."},
      {date:"2026-03-15",name:"Board Directors",role:"Board",action:"ACQUISTO",shares:25000,price:45.00,value:"$1,125M",note:"Multipli board members acquistano in contemporanea — segnale forte."}
    ],
    targets: {low:45,avg:72,high:110,analysts:14,consensus:"BUY",consensusScore:72},
    technicals: {support:[48,42,36],resistance:[58,65,72],sma50:50.0,sma200:45.0,rsi:60,macd:"Bullish",volume:"1,5M",trend:"Rialzista da minimi"},
    sentiment: {overall:65,analysts:72,social:60,news:62,institutional:65},
    news: [
      {date:"25/04",title:"CRSP: CEO Kulkarni — 'Seconda fase' con 6 readout pipeline nei prossimi 12 mesi",source:"MarketBeat/Needham",impact:"positivo",body:"CRISPR Therapeutics entra in 'seconda fase' post-Casgevy. Pipeline cardiovascolare CTX310/320/321 per mercati underserved enormi. 6 programmi clinici con readout attesi nei prossimi 6-12 mesi. Cash $2,5Mld garantisce runway. Analista Seeking Alpha Buy con PT $64,58. Commercial ramp Casgevy accelera — 93,5% pazienti liberi da crisi vasoocclusiva a 12 mesi. Collaborazione Vertex confermata forte."},
      {date:"25/04",title:"Casgevy: prime guarigioni anemia falciforme confermate — trial reale 12 mesi",source:"NEJM/Perplexity",impact:"positivo",body:"I dati a 12 mesi dei primi pazienti trattati con Casgevy (terapia genica CRISPR per anemia falciforme) mostrano il 93,5% dei pazienti liberi da crisi vasoocclusiva. Questo è un risultato storico per la medicina genica. Il mercato addressable solo USA è stimato a $5 miliardi."},
      {date:"23/04",title:"CRSP CTX310: dati cardiovascular Phase 1/2 — LDL -70% mantenuto",source:"Reuters",impact:"positivo",body:"La pipeline cardiovascolare CTX310 (editing PCSK9 per abbassare LDL colesterolo permanentemente) mostra -70% LDL sostenuto nei dati Phase 1/2 a 18 mesi. Mercato potenziale enorme: 80M pazienti USA con LDL elevato che necessitano trattamento cronico."},
      {date:"21/04",title:"CRSP -28% dai massimi: opportunità o risk reale? Cash runway 4+ anni",source:"Perplexity Finance",impact:"neutro",body:"CRSP è a -28% dall'ATH $72,80. Tuttavia, con $2,2Mld di cash e burn rate $350M/anno, la società ha oltre 4 anni di runway. Non c'è rischio dilution imminente. Il mercato sconta i rischi regolatori e competitivi. Investimento speculativo con asimmetria interessante."}
    ],
    sources: ["https://finance.yahoo.com/quote/CRSP","https://www.perplexity.ai/finance/CRSP","https://www.perplexity.ai/finance/CRSP/news","https://finviz.com/quote.ashx?t=CRSP","https://openinsider.com/search?q=CRSP"],
    peerComparison: {peers:["EDIT","NTLA","BEAM","VRTX"],metrics:{pe:[0,0,0,22],growth:[-5,-8,-3,18],margin:[-80,-90,-75,28]}}
  },
  ACHR: {
    price: 5.68, change: +0.05, range52w: "$2,80 – $9,92", pe: 0, fwdPe: 0, evEbitda: 0, marketCap: "$2,8 Mld", eps: "-$0,95", dividend: "—", beta: 2.50,
    sector: "eVTOL / Aviazione Autonoma", exchange: "NYSE", currency: "USD",
    description: "Leader mondiale eVTOL (electric Vertical TakeOff and Landing). Archer Midnight: certificazione FAA in corso. United Airlines ordine 100+ aeromobili. Partners: Stellantis (manifattura), United Airlines (commerciale). Cash $600M, burn rate $180M/anno — runway 3,3 anni. PMC portafoglio: $5,48.",
    signal: "SPECULATIVO", signalColor: "yellow", lastUpdated: "25/04/2026",
    buyers: [
      {name:"United Airlines Ventures",pct:5.0,shares:"—",value:"$140M",strategy:"Strategic Investment + Order",conviction:"ESTREMA — commitments su 100+ aeromobili"},
      {name:"Stellantis",pct:7.2,shares:"—",value:"$200M",strategy:"Manufacturing Partner",conviction:"ALTA — accordo manifattura"},
      {name:"ARK Invest",pct:1.8,shares:"—",value:"$50M",strategy:"Autonomous/Innovation",conviction:"MEDIA-ALTA"}
    ],
    sellers: [
      {name:"SPAC early investors",pct:-12.0,shares:"—",strategy:"SPAC de-SPAC exit",reason:"Uscita strutturale tipica dei SPAC. Non segnale fondamentale."}
    ],
    insider: [
      {date:"2026-04-10",name:"Adam Goldstein",role:"CEO",action:"ACQUISTO",shares:500000,price:5.40,value:"$2,7M",note:"Acquisto open market significativo dal CEO. Segnale forte di fiducia nelle prossime milestone FAA."}
    ],
    targets: {low:3,avg:7,high:15,analysts:8,consensus:"BUY",consensusScore:70},
    technicals: {support:[5.0,4.5,3.8],resistance:[6.5,7.8,9.0],sma50:5.2,sma200:5.8,rsi:55,macd:"Neutral bullish",volume:"8M",trend:"Laterale — attesa certificazione FAA"},
    sentiment: {overall:65,analysts:70,social:72,news:60,institutional:62},
    news: [
      {date:"25/04",title:"ACHR: 100% FAA Means of Compliance accettati — primo eVTOL a raggiungere milestone",source:"Simply Wall St / Archer IR",impact:"positivo",body:"Archer Aviation raggiunge il 100% di accettazione FAA su tutti i 797 Means of Compliance — primo eVTOL maker nella storia. TIA (Type Inspection Authorization) può iniziare nel 2026. Target: operazioni passeggeri H2 2026. ATTENZIONE: Q1 2026 EBITDA loss -$160/$180Mln, revenue $0 nel 2025. Tutto dipende dalla certificazione Type che sblocca commercializzazione. Programma White House eVTOL Integration confermato."},
      {date:"25/04",title:"ACHR: certificazione FAA Archer Midnight — timeline Q3 2026 confermata",source:"Bloomberg",impact:"positivo",body:"Archer Aviation conferma il timeline Q3 2026 per la certificazione FAA del Midnight eVTOL. Il management ha completato il 75% del processo di certificazione. United Airlines ha confermato l'ordine di 100+ aeromobili con opzione su 200. Il mercato AAM (Advanced Air Mobility) è stimato $1.000Mld entro 2040."},
      {date:"23/04",title:"CEO Goldstein acquista $2,7M di ACHR: segnale forte pre-certificazione",source:"Perplexity Finance",impact:"positivo",body:"Adam Goldstein (CEO) acquista 500.000 azioni a $5,40 open market — investimento personale significativo. Gli insider comprano prima di milestone importanti: la certificazione FAA potrebbe essere il catalyst per un re-rating del titolo verso $8-10."},
      {date:"21/04",title:"Stellantis partnership: produzione Midnight scalabile a 2.000 unità/anno",source:"Reuters",impact:"positivo",body:"Stellantis conferma la capacità produttiva dell'impianto di Covington (Georgia) per il Midnight eVTOL: scalabile fino a 2.000 unità/anno entro 2028. Il accordo di manifattura esclusiva con Stellantis elimina il rischio produttivo per Archer."}
    ],
    sources: ["https://finance.yahoo.com/quote/ACHR","https://www.perplexity.ai/finance/ACHR","https://www.perplexity.ai/finance/ACHR/news","https://finviz.com/quote.ashx?t=ACHR","https://openinsider.com/search?q=ACHR"],
    peerComparison: {peers:["JOBY","LILM","EVEX","UAL"],metrics:{pe:[0,0,0,8],growth:[-5,-8,-3,12],margin:[-85,-90,-75,8]}}
  },
  TEM: {
    price: 50.90, change: +0.45, range52w: "$28,60 – $72,35", pe: 0, fwdPe: 0, evEbitda: 0, marketCap: "$10 Mld", eps: "-$2,15", dividend: "—", beta: 2.20,
    sector: "AI Healthcare / Oncologia", exchange: "NASDAQ", currency: "USD",
    description: "AI-driven healthcare intelligence. Piattaforma AI per oncologia personalizzata. Partners: 900+ ospedali USA, AstraZeneca, Johnson & Johnson. Revenue +95% YoY Q4 2025. Eric Lefkofsky (co-fondatore Groupon) come CEO. IPO febbraio 2024. Cash $800M. PMC portafoglio: $42,36.",
    signal: "SPECULATIVO", signalColor: "yellow", lastUpdated: "25/04/2026",
    buyers: [
      {name:"AstraZeneca Strategic",pct:8.0,shares:"—",value:"$800M",strategy:"Healthcare AI Partnership",conviction:"ESTREMA — partner farmaceutico con pipeline AI integrata"},
      {name:"SoftBank Vision Fund",pct:5.5,shares:"—",value:"$550M",strategy:"AI Healthcare VC",conviction:"ALTA — mega-fund punta su AI healthcare"},
      {name:"Tiger Global",pct:2.8,shares:"—",value:"$280M",strategy:"Growth Fund",conviction:"MEDIA-ALTA"}
    ],
    sellers: [
      {name:"Early VC exit",pct:-15.0,shares:"—",strategy:"VC lock-up expiry",reason:"Scadenza lock-up periodo post-IPO. Non segnale fondamentale."}
    ],
    insider: [
      {date:"2026-04-15",name:"Eric Lefkofsky",role:"CEO",action:"ACQUISTO",shares:200000,price:48.00,value:"$9,6M",note:"CEO acquista significativamente open market. Lefkofsky è multi-miliardario — questo investimento è deliberato e segnale forte."}
    ],
    targets: {low:38,avg:65,high:100,analysts:12,consensus:"BUY",consensusScore:78},
    technicals: {support:[45,40,35],resistance:[55,62,72],sma50:48.0,sma200:42.0,rsi:62,macd:"Bullish",volume:"3M",trend:"Rialzista da minimi — uptrend"},
    sentiment: {overall:70,analysts:78,social:65,news:68,institutional:70},
    news: [
      {date:"25/04",title:"TEM: Gilead partnership espansa + 31 abstract AACR 2026 — $56,78 prezzo 20/04",source:"Investing.com/Yahoo",impact:"positivo",body:"Tempus AI: partnership Gilead espansa multi-year per oncologia R&D con real-world evidence e AI. 31 abstract accettati AACR Annual Meeting 2026 (17-22 aprile). Lancio Active Follow-Up service il 13 aprile — aggiorna genomic report automaticamente. Prezzo: $56,78 (20/04). AstraZeneca: $200Mln per data licensing + model AI oncologia. Gilead espansione: enorme validazione del modello data business di Tempus."},
      {date:"25/04",title:"TEM: AstraZeneca espande partnership AI oncologia — $200M additivi",source:"Bloomberg",impact:"positivo",body:"AstraZeneca espande la partnership con Tempus AI con un commitment aggiuntivo di $200 milioni per integrare l'AI di Tempus nell'intera pipeline oncologica. I farmaci sviluppati con AI Tempus hanno mostrato un tasso di successo clinico superiore del 35% rispetto ai farmaci sviluppati con metodi tradizionali."},
      {date:"23/04",title:"CEO Lefkofsky acquista $9,6M di TEM: segnale fortissimo",source:"Perplexity Finance",impact:"positivo",body:"Eric Lefkofsky (CEO, net worth $3Mld+) acquista 200.000 azioni a $48 — investimento personale di $9,6M. Un CEO miliardario che investe quasi $10M in open market acquist non lo fa senza forte convinzione nelle prossime milestone aziendali."},
      {date:"21/04",title:"Tempus AI revenue +95% YoY Q4 2025: hypergrowth confermata",source:"Reuters",impact:"positivo",body:"Tempus AI riporta Q4 2025 con revenue +95% YoY. La piattaforma di AI oncologica è attiva in 900+ ospedali USA con 2,5 milioni di profili genomici in database. Il vantaggio competitivo è il data moat: più dati = AI migliore = più clienti = più dati."}
    ],
    sources: ["https://finance.yahoo.com/quote/TEM","https://www.perplexity.ai/finance/TEM","https://www.perplexity.ai/finance/TEM/news","https://finviz.com/quote.ashx?t=TEM","https://openinsider.com/search?q=TEM"],
    peerComparison: {peers:["RXRX","CDNA","EXAS","VEEV"],metrics:{pe:[0,0,0,55],growth:[95,15,20,18],margin:[-45,-20,-15,25]}}
  },
  CRWV: {
    price: 115.16, change: -3.32, range52w: "$37,62 – $154,58", pe: 0, fwdPe: 0, evEbitda: 0, marketCap: "$40 Mld", eps: "-$2,80", dividend: "—", beta: 2.80,
    sector: "AI Cloud Infrastruttura", exchange: "NASDAQ", currency: "USD",
    description: "IPO marzo 2026 a $40 — ora +188% in 6 settimane. Nvidia-backed cloud GPU provider. Customer: Microsoft, Meta, OpenAI, Anthropic (accordo $11Mld annunciato). Revenue run-rate $3,4Mld (+450% YoY). GPU H100/H200 cluster da 250.000+ GPU. Il cloud AI puro-play più puro del mercato. PMC portafoglio: $118,48.",
    signal: "MISTO", signalColor: "yellow", lastUpdated: "25/04/2026",
    buyers: [
      {name:"Nvidia (strategic)",pct:6.0,shares:"—",value:"$2,4 Mld",strategy:"Strategic Investor",conviction:"ESTREMA — NVDA ha investito in CRWV: allineamento interessi"},
      {name:"Microsoft",pct:5.5,shares:"—",value:"$2,2 Mld",strategy:"Strategic Cloud",conviction:"ALTA — major customer + investor"},
      {name:"Magnetar Capital",pct:3.2,shares:"—",value:"$1,3 Mld",strategy:"Hedge Fund — AI Infrastructure",conviction:"ALTA"}
    ],
    sellers: [
      {name:"IPO lock-up holders",pct:-20.0,shares:"—",strategy:"Pre-IPO exit",reason:"Lock-up scade settembre 2026 — potenziale pressione vendite."}
    ],
    insider: [
      {date:"2026-04-10",name:"Michael Intrator",role:"CEO",action:"ACQUISTO",shares:100000,price:110.00,value:"$11M",note:"Acquisto post-IPO significativo. CEO compra dopo il rally — segnale di credenza in ulteriore upside."}
    ],
    targets: {low:80,avg:135,high:200,analysts:10,consensus:"BUY",consensusScore:80},
    technicals: {support:[100,90,78],resistance:[125,140,155],sma50:115.0,sma200:0,rsi:58,macd:"Bullish consolidation",volume:"5M",trend:"Consolidamento dopo IPO rally +188%"},
    sentiment: {overall:72,analysts:80,social:78,news:70,institutional:68},
    news: [
      {date:"25/04",title:"CRWV: Meta $21Mld deal 2027-2032 — il più grande contratto singolo della storia di CoreWeave",source:"TimothySykes/CNBC",impact:"positivo",body:"CoreWeave firma accordo $21Mld con Meta (2027-2032) — il più grande deal mai firmato. Totale commitment Meta supera $35Mld. NVIDIA investe $2Mld in CRWV a $87,20/az (vs prezzo attuale ~$120). Revenue Q1 2026 $5,13Mld con gross margin 71,7%. Accordo Anthropic per Claude AI workloads (+11% CRWV post-annuncio). ATTENZIONE: dipendenza da Microsoft (2/3 revenue), profit margin -23%, lock-up expiry settembre 2026."},
      {date:"25/04",title:"CRWV: accordo Anthropic $11Mld confermato — CoreWeave diventa cloud primario",source:"Bloomberg",impact:"positivo",body:"Anthropic firma contratto pluriennale con CoreWeave per $11 miliardi per accesso a GPU H200 cluster. CoreWeave diventa il cloud provider primario per il training e l'inference di Claude (i modelli Anthropic). Questo cementa CRWV come infrastruttura critica per l'AI di frontiera."},
      {date:"23/04",title:"CRWV -25% dai massimi $154: consolidamento normale post-IPO o debolezza?",source:"Perplexity Finance",impact:"neutro",body:"CoreWeave è ora a $115 da ATH $154 — correzione del 25%. Normale per un titolo IPO che ha fatto +188% in 6 settimane. I fondamentali rimangono solidi: revenue run-rate $3,4Mld (+450% YoY), backlog contratti $25Mld+. PMC portafoglio $118,48 — leggero underwater. Monitorare supporto $100."},
      {date:"21/04",title:"NVDA investe altri $1,2Mld in CoreWeave: partnership strategica rafforzata",source:"Reuters",impact:"positivo",body:"Nvidia annuncia un investimento aggiuntivo di $1,2 miliardi in CoreWeave, portando la partecipazione strategica totale a oltre $2,4 miliardi. L'allineamento di interessi è totale: CRWV compra GPU NVDA, NVDA investe in CRWV."}
    ],
    sources: ["https://finance.yahoo.com/quote/CRWV","https://www.perplexity.ai/finance/CRWV","https://www.perplexity.ai/finance/CRWV/news","https://finviz.com/quote.ashx?t=CRWV","https://openinsider.com/search?q=CRWV"],
    peerComparison: {peers:["AMZN","MSFT","GOOGL","NVDA"],metrics:{pe:[42,34,28,41],growth:[10,12,8,150],margin:[8,35,28,55]}}
  },

  // ═══════════════════════════════════════════════════
  // MACRO ASSETS — Indici, Commodities, Safe Haven
  // ═══════════════════════════════════════════════════

  SPY: {
    price: 565.20, change: +4.51, range52w: "$480 – $578", pe: 21.8, fwdPe: 20.1, evEbitda: null, marketCap: "$526 Mld (ETF AUM)", eps: null, dividend: "1.3%", beta: 1.0,
    sector: "Macro / Indice USA", exchange: "NYSE", currency: "USD",
    description: "SPDR S&P 500 ETF Trust — il più grande ETF del mondo per AUM ($526Mld+). Replica l'indice S&P 500, benchmark dei 500 titoli a maggiore capitalizzazione USA. Indicatore macro primario: quando SPY sale, il mercato è risk-on. Mercato raggiunge nuovo ATH il 25 aprile 2026 a 7.165,08 punti.",
    signal: "ACCUMULO", signalColor: "green", lastUpdated: "26/04/2026",
    buyers: [
      {name:"Vanguard Group",pct:9.1,shares:"~1,6 Mld az.",value:"$140 Mld",strategy:"Index Passive",conviction:"STRUTTURALE — holder permanente di ogni ETF S&P500"},
      {name:"BlackRock iShares",pct:7.8,shares:"~1,4 Mld az.",value:"$120 Mld",strategy:"ETF Provider",conviction:"STRUTTURALE"},
      {name:"State Street (SSGA)",pct:4.2,shares:"~745 Mln az.",value:"$64 Mld",strategy:"ETF Creator/Sponsor",conviction:"STRUTTURALE — SPDR è prodotto State Street"},
      {name:"Flusso retail 2026",pct:null,shares:"Record inflows",value:"+$45Mld YTD",strategy:"Retail + 401K",conviction:"ALTA — mercato risk-on post-Iran cessate-il-fuoco"}
    ],
    sellers: [
      {name:"Hedge funds (rotation)",pct:-2.1,shares:"Prese di profitto selettive",strategy:"Long/Short Equity",reason:"Rotazione da S&P broad verso small-cap e emerging market dopo ATH"},
      {name:"Macro funds risk-off",pct:-1.5,shares:"Hedging tattico",strategy:"Global Macro",reason:"Coperture temporanee su VIX elevato durante tensioni Iran (aprile)"}
    ],
    insider: [],
    targets: {low:520,avg:580,high:640,analysts:null,consensus:"LONG TERM BULLISH",consensusScore:80},
    technicals: {support:[540,510,480],resistance:[575,590,610],sma50:548.0,sma200:532.0,rsi:62,macd:"Bullish",volume:"80M/giorno",trend:"Rialzista — ATH confermato"},
    sentiment: {overall:75,analysts:80,social:72,news:78,institutional:75},
    news: [
      {date:"26/04",title:"S&P 500 a nuovo ATH 7.165 (+0,80%) — Mercato celebra cessate-il-fuoco Iran e earnings season positiva",source:"Bloomberg",impact:"positivo",body:"Il mercato USA raggiunge nuovi massimi storici. La settimana precedente ha visto S&P +4,5% e NASDAQ +6,2%, le migliori settimane del 2026. VIX sceso a 18,71, vicino ai minimi post-Iran. Earnings Q1 2026: 78% delle aziende S&P 500 ha battuto le stime di EPS."},
      {date:"25/04",title:"Flussi record verso ETF S&P 500: $45Mld in entrata YTD 2026",source:"Reuters",impact:"positivo",body:"I fondi passivi che replicano S&P 500 hanno attratto $45 miliardi netti nei primi 4 mesi del 2026. Il mercato retail continua a comprare i ribassi (buy-the-dip) e ora viene ricompensato con nuovi ATH."}
    ],
    sources: ["https://finance.yahoo.com/quote/SPY","https://www.perplexity.ai/finance","https://www.cboe.com","https://finviz.com"],
    peerComparison: {peers:["QQQ","DIA","IWM","VTI"],metrics:{pe:[21.8,27.5,18.2,20.1],growth:[12,18,8,11],margin:[null,null,null,null]}}
  },

  QQQ: {
    price: 480.55, change: +7.62, range52w: "$380 – $502", pe: 27.5, fwdPe: 23.8, evEbitda: null, marketCap: "$292 Mld (ETF AUM)", eps: null, dividend: "0.6%", beta: 1.22,
    sector: "Macro / NASDAQ 100 Tech", exchange: "NASDAQ", currency: "USD",
    description: "Invesco QQQ Trust — replica il NASDAQ-100, i 100 titoli non-finanziari maggiori del NASDAQ. Pesantemente esposto a tech e AI: Apple (9%), NVDA (8,5%), Microsoft (8%), Meta (5,5%), Amazon (5%). Massima esposizione al ciclo AI. +6,2% nell'ultima settimana — migliore performance del 2026.",
    signal: "ACCUMULO", signalColor: "green", lastUpdated: "26/04/2026",
    buyers: [
      {name:"Invesco (Sponsor)",pct:null,shares:"AUM $292Mld",value:"$292 Mld",strategy:"ETF Provider",conviction:"STRUTTURALE"},
      {name:"Flusso istituzionale AI",pct:null,shares:"Rotazione settoriale",value:"+$28Mld YTD",strategy:"Tech/Growth overweight",conviction:"ALTA — AI capex boom 2026 traina NASDAQ"},
      {name:"Retail momentum buyers",pct:null,shares:"Record volume",value:"Inflows post-dip",strategy:"Momentum / Buy-the-dip",conviction:"MEDIA"}
    ],
    sellers: [
      {name:"Value rotation",pct:-3.2,shares:"Riduzione tech",strategy:"Value/Defensive",reason:"Rotazione post-ATH da growth verso value e dividend stocks"},
      {name:"Macro hedge (Iran period)",pct:-1.8,shares:"Hedging tattico",strategy:"Global Macro",reason:"Coperture durante tensioni geopolitiche aprile — ora rientrate"}
    ],
    insider: [],
    targets: {low:420,avg:505,high:560,analysts:null,consensus:"BULLISH",consensusScore:76},
    technicals: {support:[450,420,390],resistance:[490,510,540],sma50:458.0,sma200:430.0,rsi:65,macd:"Bullish crossover",volume:"45M/giorno",trend:"Rialzista — recupero pieno post-Iran selloff"},
    sentiment: {overall:72,analysts:78,social:70,news:75,institutional:72},
    news: [
      {date:"26/04",title:"NASDAQ +1,63% · settimana migliore del 2026 (+6,2%) guidata da semiconduttori AI",source:"Bloomberg",impact:"positivo",body:"MU +69% YTD, MRVL +95%, AVGO +140% YoY. Il NASDAQ beneficia della rotazione verso custom silicon e memory AI. Morgan Stanley: NVDA, AVGO e ALAB top chip picks 2026. ASML ha alzato guidance 2026, confermando AI capex intatto."},
      {date:"24/04",title:"NASDAQ vs S&P 500: tech outperforma broad market del 2x nel Q1 2026",source:"CNBC",impact:"positivo",body:"Nel Q1 2026, QQQ ha sovraperformato SPY di circa 2 volte. Il driver è stato il ciclo AI con HBM4 demand, custom ASIC hyperscaler e data center buildout."}
    ],
    sources: ["https://finance.yahoo.com/quote/QQQ","https://www.perplexity.ai/finance","https://finviz.com","https://www.marketbeat.com"],
    peerComparison: {peers:["SPY","ARKK","SOXX","XLK"],metrics:{pe:[27.5,null,28.1,29.5],growth:[18,null,22,15],margin:[null,null,null,null]}}
  },

  GLD: {
    price: 315.40, change: +2.52, range52w: "$220 – $335", pe: null, fwdPe: null, evEbitda: null, marketCap: "$80 Mld (ETF AUM)", eps: null, dividend: "0%", beta: 0.05,
    sector: "Macro / Commodity / Safe Haven", exchange: "NYSE", currency: "USD",
    description: "SPDR Gold Shares ETF — 1 quota = ~0,093 oz oro fisico. Prezzo oro spot ~$3.340/oz (26/04/2026). L'oro è il safe haven per eccellenza: sale in risk-off, inflazione alta, crisi geopolitiche, svalutazione USD. Nel 2026 ha beneficiato di tensioni Iran, incertezza Fed e de-dollarizzazione da parte di banche centrali emergenti.",
    signal: "ACCUMULO", signalColor: "green", lastUpdated: "26/04/2026",
    buyers: [
      {name:"Banche Centrali Emergenti (Cina, India, Russia)",pct:null,shares:"~1.000 ton/anno",value:"$100+ Mld",strategy:"De-dollarizzazione / Riserve",conviction:"STRUTTURALE — trend pluriennale di accumulo oro fisico"},
      {name:"BlackRock/Vanguard (via GLD)",pct:null,shares:"AUM $80Mld",value:"$80 Mld",strategy:"ETF holder",conviction:"STRUTTURALE"},
      {name:"Hedge fund macro (geopolitica Iran)",pct:null,shares:"Posizioni long gold futures",value:"Aumentate Q1 2026",strategy:"Global Macro / Risk Hedge",conviction:"ALTA durante tensioni — ora riduzione tattica"},
      {name:"Retail safe-haven buyers",pct:null,shares:"Picco acquisti aprile 2026",value:"Inflows record",strategy:"Portfolio hedge",conviction:"MEDIA"}
    ],
    sellers: [
      {name:"Profit takers post-spike Iran",pct:-5.2,shares:"Vendite post-cessate-il-fuoco",strategy:"Momentum / Macro",reason:"Riduzione posizioni risk-off dopo accordo Iran. Gold scende leggermente da ATH $3.500+ durante crisi"},
      {name:"USD strength",pct:null,shares:"Correlazione negativa",strategy:"FX carry",reason:"Se USD si rafforza, gold in USD subisce pressione"}
    ],
    insider: [],
    targets: {low:2800,avg:3400,high:4000,analysts:null,consensus:"BULLISH LONG TERM",consensusScore:74},
    technicals: {support:[3100,2900,2600],resistance:[3400,3500,3800],sma50:3250.0,sma200:2980.0,rsi:58,macd:"Bullish",volume:"15M GLD/giorno",trend:"Rialzista strutturale — +35% in 12 mesi"},
    sentiment: {overall:70,analysts:72,social:65,news:68,institutional:74},
    news: [
      {date:"26/04",title:"Gold $3.340/oz — +35% in 12 mesi. Banche centrali record acquisti 2026",source:"Reuters",impact:"positivo",body:"L'oro continua il suo trend rialzista secolare. Le banche centrali (led da Cina, India) hanno acquistato oltre 1.000 tonnellate nel 2025-26. La de-dollarizzazione globale, l'inflazione residua e le tensioni geopolitiche mantengono il gold come asset strategico."},
      {date:"20/04",title:"Gold vs Bitcoin come safe haven: chi vince nel 2026?",source:"Bloomberg",impact:"neutro",body:"BTC a $94.200 (+2,1%) vs Gold $3.340. Nel selloff Iran, gold ha sovraperformato BTC come safe haven. Banche centrali non possono comprare BTC ma possono comprare oro. Gold rimane il safe haven istituzionale per eccellenza."}
    ],
    sources: ["https://finance.yahoo.com/quote/GLD","https://www.gold.org","https://www.perplexity.ai/finance","https://finviz.com"],
    peerComparison: {peers:["GDX","SLV","PDBC","USO"],metrics:{pe:[null,null,null,null],growth:[35,12,null,null],margin:[null,null,null,null]}}
  },

  USO: {
    price: 88.50, change: -1.34, range52w: "$68 – $105", pe: null, fwdPe: null, evEbitda: null, marketCap: "$4,2 Mld (ETF AUM)", eps: null, dividend: "0%", beta: 0.85,
    sector: "Macro / Commodity / Energia", exchange: "NYSE", currency: "USD",
    description: "United States Oil Fund — replica il prezzo futures WTI crude oil front-month. Prezzo WTI spot: $94,40/bbl (26/04/2026). Il petrolio è il termometro dell'economia globale: sale su crescita/geopolitica, scende su recessione/oversupply. Nel 2026 ha toccato $113/bbl durante picco tensioni Iran, poi corretto -25%. Alta correlazione con XOM, SHEL, inflazione CPI.",
    signal: "MISTO", signalColor: "yellow", lastUpdated: "26/04/2026",
    buyers: [
      {name:"NORGES BANK (Fondo Sovrano Norvegia)",pct:null,shares:"Indiretti via XOM/SHEL",value:"Accumulo energia",strategy:"Sovereign Wealth Fund",conviction:"MEDIA — Norvegia accumula energia come hedge naturale"},
      {name:"Energy hedge funds (geopolitica)",pct:null,shares:"Long oil futures",value:"Posizioni ridotte post-Iran",strategy:"Global Macro / Commodity",conviction:"MEDIA — riduzione dopo cessate-il-fuoco"},
      {name:"Traders momentum",pct:null,shares:"Posizioni long",value:"Attivi su range $85-100",strategy:"Commodity Trading",conviction:"BASSA — trading range, non trend"}
    ],
    sellers: [
      {name:"UBS Asset Management",pct:-70.4,shares:"-38,1M shares XOM proxy",strategy:"Active Management",reason:"Uscita massiccia energia Q4 2025. Segnale di cautela strutturale sull'oil."},
      {name:"Macro funds risk-off oil",pct:-25.0,shares:"Riduzione dopo ATH $113",strategy:"Global Macro",reason:"Oil sceso del 25% dai massimi $113 dopo accordo Iran. Pressione da offerta OPEC+ potenziale"},
      {name:"EV adoption trend",pct:null,shares:"Secular headwind",strategy:"Long-term structural",reason:"Transizione energetica riduce domanda petrolio strutturalmente a medio termine"}
    ],
    insider: [],
    targets: {low:75,avg:90,high:110,analysts:null,consensus:"NEUTRO / RANGE-BOUND",consensusScore:48},
    technicals: {support:[85,78,70],resistance:[96,105,113],sma50:92.0,sma200:88.5,rsi:44,macd:"Bearish",volume:"8M USO/giorno",trend:"Ribassista dal picco $113. Range $85-96 atteso"},
    sentiment: {overall:45,analysts:50,social:42,news:40,institutional:50},
    news: [
      {date:"26/04",title:"WTI $94,40 (-1,51%) — Oil scende del 25% dai massimi $113 post-accordo Iran",source:"Reuters",impact:"neutro",body:"Il cessate-il-fuoco Iran-USA ha rimosso il risk premium geopolitico dall'oil. WTI torna verso livelli pre-crisi. OPEC+ potrebbe tagliare produzione se price scende sotto $80. XOM/SHEL restano sotto pressione nonostante target analisti $182-185."},
      {date:"23/04",title:"Zacks: ExxonMobil upgrade a Strong Buy — ma oil price è il wild card",source:"Fox Business",impact:"neutro",body:"Analisti bullish su XOM (PT $182-185) ma l'oil price è il driver principale. Se WTI resta sopra $85, XOM ha upside del 20-25%. Se scende sotto $80, compressione multipla. NORGES BANK ha aggiunto +10,8% alla posizione — segnale long-term bullish."}
    ],
    sources: ["https://finance.yahoo.com/quote/USO","https://www.eia.gov","https://www.perplexity.ai/finance","https://finviz.com"],
    peerComparison: {peers:["XOM","SHEL","BP","BEP"],metrics:{pe:[null,null,null,null],growth:[null,null,null,null],margin:[null,null,null,null]}}
  }
};

const NEWS_DB = [
  // ── 26 APRILE 2026 ──────────────────────────────────────────────
  {id:20,date:"26/04/2026",title:"S&P 500 nuovo ATH 7.165 — NASDAQ +1,63%, VIX colla a 18,71",source:"Bloomberg",category:"macro",impact:"alto",
    tickers:["NVDA","AVGO","EQIX","MU","TSLA"],impactType:"positivo-broad",
    body:"S&P 500 raggiunge un nuovo massimo storico a 7.165,08 con il NASDAQ che guadagna +1,63%. Il VIX è crollato a 18,71, il livello più basso da gennaio. Il contesto è bullish con risk-on generalizzato favorito dal cessate-il-fuoco Iran/USA e dalla solidità degli earnings Q1.",
    analysis:"Il VIX sotto 20 indica mercato in equilibrio e assenza di stress sistemico. Con S&P a ATH, i titoli growth del portafoglio (NVDA, AVGO, EQIX) sono i più avvantaggiati. Il rally è guidato da: 1) de-escalation geopolitica, 2) earning season Q1 2026 positiva, 3) attese 1-2 tagli Fed nel H2 2026. L'oro a $3.340 (+0,8%) segnala che gli investitori mantengono un minimo hedge.",
    actions:"Contesto ideale per accumulare su pullback. NVDA: entry target $165-175 pre-earnings 20/05. AVGO: entry $295-305. EQIX: earnings 30/04 = catalyst imminente, posizione piena."},
  {id:19,date:"26/04/2026",title:"CRWV — Magnetar Financial (10%) vende $234M in 4 tranche: alert insider",source:"SEC Form 4 / OpenInsider",category:"insider",impact:"alto",
    tickers:["CRWV"],impactType:"negativo-insider",
    body:"Magnetar Financial LLC, 10% owner di CoreWeave (CRWV), ha depositato 4 Form 4 in data 24/04/2026 per vendite totali di circa $234M: $117M + $76M + $36M + $331K. Il prezzo medio è stato di $104-117 per azione. Si tratta di una vendita spot non pianificata.",
    analysis:"Una vendita di $234M da un 10% owner in un solo giorno è un segnale significativo. Magnetar è un hedge fund con approccio event-driven: la vendita potrebbe indicare redemption di fondi, riallocazione tattica, o view ribassista su CRWV. Da valutare: CRWV ha il deal Meta $21Mld (2027-2032) che rimane intatto. Tuttavia, senza acquirenti comparabili, la pressione di vendita è reale.",
    actions:"⚠️ Monitorare con attenzione. Non aumentare posizione fino a chiarimento motivazione Magnetar. Supporto tecnico: $95-100. Se tiene, accumulo tattico. Se rompe $90, uscita parziale."},
  {id:18,date:"26/04/2026",title:"EQIX Earnings 30/04 — Cohen & Steers +493K az confermato 13F Q4 2025",source:"SEC EDGAR / Cohen & Steers 13F",category:"insider",impact:"alto",
    tickers:["EQIX"],impactType:"positivo-accumulo",
    body:"Equinix riporta earnings il 30/04/2026. Cohen & Steers, il massimo specialista REIT al mondo, ha confermato con il 13F Q4 2025 un acquisto di +493.141 azioni EQIX, portando la posizione totale a 2.609.011 azioni (valore ~$2,6Mld). La CEO Adaire Fox-Martin ha acquistato azioni open market.",
    analysis:"Cohen & Steers è il fondo di riferimento per chi vuole capire dove si muove il settore REIT. Il loro accumulo su EQIX (+23,3% in un trimestre) è il segnale più forte disponibile per questo titolo. Con earnings il 30/04, il setup è ideale: se i numeri battono le stime (consensus: FFO +8% YoY), possibile squeeze verso $1.000+. EQIX beneficia direttamente dell'AI boom: ogni hyperscaler ha datacenter EQIX.",
    actions:"Posizione piena su EQIX. Target pre-earnings: $970. Target 12m: $1.050-1.100. Stop: $820 (sotto supporto chiave)."},
  {id:17,date:"26/04/2026",title:"NVDA Earnings 20 Maggio — Preview: Blackwell B200 sold out fino Q4 2026",source:"Morgan Stanley / NVIDIA IR",category:"sector",impact:"alto",
    tickers:["NVDA","AVGO","ASML"],impactType:"positivo-tech",
    body:"Con NVIDIA che riporta il 20/05, analisti di Morgan Stanley e Goldman Sachs evidenziano che i server Blackwell B200 sono esauriti fino al Q4 2026. Gli ordini da Microsoft, Google e Amazon superano la capacità produttiva. Il consensus earnings Q1 è di $0,98/azione (+78% YoY).",
    analysis:"NVDA è la posizione con più catalizzatori nel prossimo mese. Blackwell sold-out conferma domanda strutturale. Il consensus EPS è di $0,98 ma le stime whisper superano $1,05. Un beat + guidance positiva Q2 potrebbe portare NVDA verso $180-200. Risk principale: sell-the-news dopo il run-up recente. Strategia: accumulare pre-20/05, ridurre il giorno degli earnings per gestire la volatilità.",
    actions:"Entry: $165-175 con target $185-195 post-earnings. Posizione parziale ora, completare vicino agli earnings. Stop: $155 (rottura supporto medio)."},
  {id:16,date:"26/04/2026",title:"Gold $3.340 ATH — Inflazione persistente + Banche centrali accumula riserve",source:"World Gold Council / Reuters",category:"macro",impact:"medio",
    tickers:["GLD","XOM","TLT"],impactType:"misto-macro",
    body:"L'oro ha raggiunto un nuovo massimo storico a $3.340/oz (+0,8% oggi, +22% YTD). Il driver principale è il massiccio acquisto da parte delle banche centrali emergenti: Cina, India e Turchia hanno acquistato 1.037 tonnellate nel 2025. Il GLD ETF vede afflussi record.",
    analysis:"L'oro in ATH con VIX a 18 è apparentemente contraddittorio ma spiega bene il contesto: gli investitori sono bullish sulle azioni MA mantengono oro come hedge strutturale contro inflazione e de-dollarizzazione. Le banche centrali BRICS acquistano oro per ridurre dipendenza dal dollaro (US 10Y a 4,25%). GLD è un asset da monitorare nel portafoglio macro.",
    actions:"GLD come hedge strutturale. USO (WTI a $94,40) rimane in trend positivo sostenuto da tensioni Golfo. TLT sotto pressione da tassi alti (4,25% 10Y)."},
  // ── 02 APRILE 2026 ──────────────────────────────────────────────
  {id:11,date:"02/04/2026",title:"S&P 500 +2,91% / NASDAQ +3,83% — Rimbalzo forte su speranze pace",source:"Bloomberg",category:"macro",impact:"alto",
    tickers:["NVDA","ASML","AVGO","MU","EQIX"],impactType:"positivo-tech",
    body:"Mercati in deciso rimbalzo con S&P che guadagna quasi il 3% e NASDAQ che sale di quasi il 4%. Il VIX scende a 24,51 da 28+. Il risk-on favorisce i titoli growth del portafoglio. Oil vicino a $100 con leggera correzione.",
    analysis:"Il rimbalzo è guidato da segnali di de-escalation geopolitica e da dati macro migliori delle attese. La discesa del VIX sotto 25 è un segnale positivo: riduce il rischio di ulteriori sell-off forzati. I titoli growth con fondamentali solidi (NVDA, ASML, AVGO) sono i principali beneficiari.",
    actions:"Contesto favorevole all'accumulo graduale su NVDA (supporto $165), AVGO (supporto $295), MU (breakout verso $400). EQIX in zona ATH: attendere conferma sopra $1.000."},
  {id:12,date:"02/04/2026",title:"ASML +9,10% in una seduta: ordine SK Hynix da $7,97 miliardi",source:"Reuters",category:"sector",impact:"alto",
    tickers:["ASML"],impactType:"positivo-accumulo",
    body:"ASML Holding balza del 9,1% dopo che SK Hynix ha comunicato un ordine record per strumenti EUV per un valore di $7,97 miliardi attraverso il 2027. Morgan Stanley alza il target a €1.400 (+40% dal precedente).",
    analysis:"Questo conferma la domanda strutturale per i macchinari EUV di ASML. L'ordine SK Hynix è per HBM (High Bandwidth Memory) destinata alle GPU NVDA — il ciclo AI alimenta direttamente ASML. Con ordini record da Samsung, TSMC e SK Hynix, il backlog ordini supera €39 miliardi.",
    actions:"ASML in breakout tecnico sopra €1.300. Il target Morgan Stanley a €1.400 suggerisce ulteriore upside del 6% dall'attuale ADR a $1.320. Accumulare su eventuali pullback sopra $1.200."},
  {id:13,date:"02/04/2026",title:"Eli Lilly +3,99% dopo FDA approval Foundayo (pillola anti-obesità)",source:"CNBC",category:"sector",impact:"alto",
    tickers:["LLY","NVO"],impactType:"misto-pharma",
    body:"La FDA approva Foundayo, la pillola anti-obesità di Eli Lilly, con un impatto diretto sulle quote di mercato GLP-1. LLY supera +3,99% nel contesto di rimbalzo generale. L'approvazione rafforza la tesi bullish su LLY ma aumenta la pressione su NVO.",
    analysis:"LLY consolida la leadership nel mercato GLP-1 con ora tre prodotti approvati (Mounjaro, Zepbound, Foundayo). Il mercato totale obesità è stimato a $130Mld entro 2030. NVO risente della concorrenza crescente — da $130 a $36 ADR rappresenta una perdita di oltre il 70% dai massimi.",
    actions:"LLY: long su fondamentali con catalizzatore multipli. Target analisti a $1.195. NVO: posizione contrarian solo per profilo rischio elevato. Monitorare supporto $32."},
  {id:14,date:"02/04/2026",title:"MU (Micron) in breakout verso $370 — HBM AI demand explosion",source:"MarketBeat",category:"sector",impact:"medio",
    tickers:["MU"],impactType:"positivo-accumulo",
    body:"Micron Technology raggiunge $367,84 in breakout da area $337. La domanda di HBM (High Bandwidth Memory) per GPU AI è in crescita esponenziale con NVDA e AMD che aumentano gli ordini.",
    analysis:"MU è il principale produttore USA di DRAM e HBM. Con il ciclo memory in fase espansiva e la domanda AI strutturale, il titolo ha ancora upside significativo. I multipli rimangono contenuti (P/E ~15x) rispetto al potenziale di crescita. Ciclo DRAM storicamente correlato a 24-36 mesi di espansione.",
    actions:"Accumulare MU su eventuali pullback verso $320-330. Target medio analisti: $450-500. Stop: rottura di $280."},
  {id:1,date:"26/03/2026",title:"Iran rifiuta proposta di pace USA — Oil +4,3% a $94,20/bbl",source:"CNN Business",category:"geopolitica",impact:"alto",
    tickers:["XOM","SHEL","IBE"],impactType:"positivo-energia",
    body:"L'Iran ha respinto ufficialmente la proposta di cessate-il-fuoco avanzata dagli USA, aumentando il rischio di un'escalation nel Golfo Persico. Il WTI è balzato del 4,3% a $94,20 al barile, il livello più alto dal 2024.",
    analysis:"L'escalation geopolitica nel Golfo Persico è il driver principale del rialzo oil. Lo Stretto di Hormuz vede transitare il 20% del petrolio mondiale. Se la situazione peggiora, il WTI potrebbe raggiungere $100-106. Impatto diretto: XOM, SHEL, BP beneficiano. Impatto negativo: compagnie aeree, trasporto, tech (costi energia). Il VIX è salito a 28,14 riflettendo il risk-off generalizzato.",
    actions:"Monitorare: livello $95 oil come trigger per ulteriore upside XOM. Stop loss tech: NVDA sotto $165, ASML sotto €1.100. Considerare hedge con posizioni energia."},
  {id:2,date:"26/03/2026",title:"S&P -1,61%, NASDAQ -2,19%, VIX a 28,14 — Risk-Off generalizzato",source:"Bloomberg",category:"macro",impact:"alto",
    tickers:["NVDA","ASML","AVGO"],impactType:"negativo-tech",
    body:"Sell-off generalizzato sui mercati USA con il NASDAQ che perde oltre il 2%. Il VIX supera 28, segnalando stress elevato. Il risk-off colpisce principalmente i titoli growth ad alta beta.",
    analysis:"Il VIX a 28 è storicamente una zona critica. Sopra 30 = panico. Tuttavia, storicamente, VIX tra 25-35 ha spesso rappresentato opportunità di acquisto per posizioni a 6-12 mesi su titoli quality come NVDA ed ASML. Il sell-off è guidato da fattori esogeni (geopolitica) non fondamentali. I bilanci delle aziende tech in portafoglio restano solidi.",
    actions:"NON vendere in panico. VIX > 28 storicamente = zona di accumulo graduale per chi ha orizzonte > 6 mesi. Monitorare i supporti chiave. Opportunità di ingresso se NVDA tocca $165 o ASML €1.100."},
  {id:3,date:"26/03/2026",title:"Goldman Sachs: Iran war costing 10.000 US jobs/month",source:"Fox Business",category:"macro",impact:"medio",
    tickers:[],impactType:"negativo-macro",
    body:"Un report di Goldman Sachs stima che il conflitto Iran stia costando circa 10.000 posti di lavoro al mese all'economia USA, mettendo pressione sulla Fed per un eventuale taglio tassi.",
    analysis:"L'impatto occupazionale del conflitto potrebbe spingere la Fed verso un taglio preventivo, il che sarebbe positivo per growth e REIT. Tuttavia, l'inflazione da oil alto limita la capacità della Fed di tagliare. Siamo in una situazione di stagflazione mild: crescita rallenta + inflazione sale.",
    actions:"Monitorare prossimo FOMC (maggio). Se Fed segnala apertura a taglio: positivo per EQIX (REIT), tech growth (NVDA). Se conferma hold: pressione continua su growth."},
  {id:4,date:"25/03/2026",title:"JPMorgan esce massicciamente: ASML -43%, EQIX -24%, NVDA -7%",source:"Financial Times",category:"insider",impact:"alto",
    tickers:["ASML","EQIX","NVDA"],impactType:"negativo-distribuzione",
    body:"JPMorgan Chase ha ridotto drasticamente le posizioni su diversi titoli chiave nell'ultimo filing 13F. ASML vede il taglio più pesante con -43,3%, seguito da EQIX -23,7% e NVDA -6,7%.",
    analysis:"La distribuzione massiccia di JPMorgan è un segnale significativo ma va contextualizzato: 1) JPM è un player attivo che ruota spesso. 2) La controparte è che fondi come Fidelity, Arrowstreet e Cohen & Steers stanno comprando massicciamente gli stessi titoli. 3) La divergenza estrema (JPM vende ↔ Arrowstreet compra ASML +196%) crea alta volatilità ma anche opportunità.",
    actions:"Non seguire ciecamente JPMorgan. Valutare la qualità dei compratori: Cohen & Steers (specialista REIT #1 al mondo) su EQIX e Arrowstreet (quant fund top) su ASML sono segnali molto forti. La divergenza può essere un'opportunità."},
  {id:5,date:"25/03/2026",title:"Blackwell GPU: ordini record +40% da hyperscaler",source:"Reuters",category:"sector",impact:"medio",
    tickers:["NVDA","AVGO"],impactType:"positivo-tech",
    body:"Microsoft, Google e Amazon hanno incrementato del 40% gli ordini di GPU Blackwell B200 rispetto alle stime iniziali, confermando la domanda insaziabile per l'infrastruttura AI.",
    analysis:"Conferma che la domanda AI è strutturale e in accelerazione. NVDA guidance Q2 sarà probabilmente rivista al rialzo. Anche AVGO beneficia con custom chips per Google (TPU v6). Il capex hyperscaler 2026 è stimato a $200Mld+.",
    actions:"Accumulo graduale su NVDA sotto $170 e AVGO sotto $300. La domanda fondamentale non è cambiata, solo il sentiment di breve termine."},
  {id:6,date:"25/03/2026",title:"CEO e CFO ExxonMobil comprano azioni: doppio segnale insider",source:"Fox Business",category:"insider",impact:"medio",
    tickers:["XOM"],impactType:"positivo-insider",
    body:"Il CEO Darren Woods e la CFO Kathryn Mikells hanno entrambi acquistato azioni XOM a mercato aperto nella stessa settimana. Acquisti coordinati dei top executive sono considerati tra i segnali insider più affidabili.",
    analysis:"Storicamente, quando CEO e CFO acquistano contemporaneamente, il titolo ha sovraperformato il mercato nel 78% dei casi nei 6 mesi successivi. Con oil a $94 e upside da tensioni geopolitiche, il timing è coerente. Il dividend yield al 3,2% fornisce ulteriore supporto.",
    actions:"XOM in posizione di forza. Entry aggressivo sopra $160 con target $175-185. Stop sotto $150."},
  {id:7,date:"24/03/2026",title:"Bitcoin -3,87% a $68.539: risk-off crypto/tech correlato",source:"CNBC",category:"macro",impact:"basso",
    tickers:[],impactType:"negativo-risk",
    body:"Bitcoin perde quasi il 4% in linea con il risk-off generalizzato. La correlazione crypto/tech è tornata ai massimi del 2022.",
    analysis:"BTC conferma il risk-off. Correlazione alta con NASDAQ significa che una ripresa tech coinciderebbe con una ripresa crypto e viceversa. Indicatore leading per sentiment risk-on/risk-off.",
    actions:"Usare BTC come indicatore anticipato del sentiment. Se BTC recupera $70K, probabile rimbalzo tech."},
  {id:8,date:"24/03/2026",title:"Arrowstreet Capital quasi TRIPLICA posizione ASML: +195,8%",source:"Bloomberg",category:"insider",impact:"alto",
    tickers:["ASML"],impactType:"positivo-accumulo",
    body:"Il fondo quantitativo Arrowstreet Capital ha quasi triplicato la sua posizione in ASML Holding, con un incremento del 195,8%. Arrowstreet è uno dei più rispettati fondi sistematici al mondo.",
    analysis:"Arrowstreet opera con modelli quantitativi sofisticati. Un incremento del 196% è estremamente raro e indica che il modello ha identificato un'opportunità significativa. Questo contrasta con la vendita massiccia di JPMorgan (-43%). La divergenza suggerisce che il mercato non ha ancora raggiunto un consensus su ASML, creando potenziale volatilità ma anche opportunità.",
    actions:"ASML è il titolo con la divergenza più estrema. Chi ha orizzonte > 12 mesi potrebbe accumulare gradualmente su supporto €1.100. Chi è risk-averse dovrebbe attendere risoluzione della divergenza."},
  {id:9,date:"23/03/2026",title:"Mounjaro (LLY) batte Ozempic (NVO) nei dati Phase 3: -24% peso vs -17%",source:"CNBC",category:"sector",impact:"alto",
    tickers:["LLY","NVO"],impactType:"misto-pharma",
    body:"Nuovi dati Phase 3 confermano la superiorità di Mounjaro (tirzepatide) di Eli Lilly rispetto a Ozempic (semaglutide) di Novo Nordisk nella perdita di peso: -24% vs -17% del peso corporeo.",
    analysis:"LLY consolida la posizione di leader nel mercato obesità. NVO rimane un player importante ma perde il vantaggio competitivo. Il mercato GLP-1 è stimato a $100Mld+ entro 2030, sufficiente per entrambi, ma LLY cattura più valore. L'arrivo di orforglipron (GLP-1 orale di LLY) potrebbe essere il game-changer definitivo.",
    actions:"LLY: accumulo su debolezza sotto $780. NVO: monitorare supporto $32. Il CEO NVO ha comprato azioni — segnale di fiducia. Mantenere entrambi ma sovrappesare LLY."},
  {id:10,date:"22/03/2026",title:"USA valutano nuove restrizioni export EUV verso Cina",source:"Bloomberg",category:"geopolitica",impact:"medio",
    tickers:["ASML","NVDA","AVGO"],impactType:"negativo-geopolitica",
    body:"L'amministrazione USA sta valutando l'estensione delle restrizioni sull'export di macchinari litografici EUV di ASML e chip avanzati NVDA verso la Cina.",
    analysis:"Se implementate, nuove restrizioni potrebbero impattare il 10-15% del backlog ordini ASML. Per NVDA l'impatto è limitato (già in vigore restrizioni significative). Il mercato potrebbe reagire negativamente nel breve ma l'effetto a lungo termine è limitato: la domanda viene redirezionata, non eliminata.",
    actions:"Rischio noto e già parzialmente priced-in. Non cambia la tesi fondamentale su ASML (monopolista senza alternative). Monitorare sviluppi legislativi."}
];

const MARKET_DATA = {
  indices: [
    {name:"S&P 500",value:"7.165,08",change:"+0,80%",direction:"up"},
    {name:"NASDAQ",value:"24.836,60",change:"+1,63%",direction:"up"},
    {name:"VIX",value:"18,71",change:"-2,97%",direction:"down"},
    {name:"EUR/USD",value:"1,0800",change:"-0,12%",direction:"down"},
    {name:"Oil WTI",value:"$94,40",change:"-1,51%",direction:"down"},
    {name:"Gold",value:"$3.340",change:"+0,8%",direction:"up"},
    {name:"BTC",value:"$94.200",change:"+2,1%",direction:"up"},
    {name:"US 10Y",value:"4,25%",change:"+0,02",direction:"up"},
    {name:"S&P ATH",value:"7.165",change:"nuovo massimo storico",direction:"up"},
    {name:"Sentiment",value:"RISK-ON",change:"VIX < 20 · meglio delle aspettative",direction:"up"},
  ],
  sentiment: "RISK-ON BULLISH — S&P 500 ATH · Futures flat lunes",
  lastUpdated: "27/04/2026"
};

const GEOPOLITICAL_RISKS = [
  {name:"Conflitto Iran/USA — Golfo Persico",severity:9,probability:75,sectors:["Energia ▲▲","Tech ▼","Trasporto ▼▼"],
    detail:"L'Iran ha rifiutato il cessate-il-fuoco USA. Rischio blocco Stretto di Hormuz (20% oil mondiale). Scenario base: tensione alta ma no escalation militare diretta. Scenario peggiore: chiusura Hormuz → oil $120-140.",
    impact:"XOM/SHEL: +15-25% in scenario escalation. NVDA/ASML: -5-10% per risk-off. EQIX: neutro (infrastruttura critica)."},
  {name:"Restrizioni Export Chip USA→Cina",severity:6,probability:60,sectors:["Semiconduttori ▼","ASML ▼","Data Center ◆"],
    detail:"Nuove potenziali restrizioni su EUV e chip avanzati. Impatto limitato su ASML (già ristretto) ma sentiment negativo. La domanda viene ridirezionata, non eliminata.",
    impact:"ASML: -5% breve termine se implementate. NVDA: impatto limitato (già priced-in). Domanda redirezionata verso clienti non-Cina."},
  {name:"Tensione Taiwan — TSMC Supply Chain",severity:8,probability:15,sectors:["Semiconduttori ▼▼▼","Tech ▼▼","Globale ▼▼"],
    detail:"Rischio basso ma impatto catastrofico. TSMC produce il 90% dei chip avanzati mondiali. Qualsiasi disruption avrebbe impatto enorme su tutta la catena tech.",
    impact:"Scenario critico per tutto il portafoglio tech. Hedge: diversificazione geografica, ETF broad-market, gold."},
  {name:"Politica Monetaria Fed — Tassi e Inflazione",severity:5,probability:90,sectors:["REIT ▼ se tassi up","Growth ▼ se tassi up","Energia ◆"],
    detail:"Fed in bilico tra taglio (economia rallenta) e hold (inflazione da oil). Mercato prezza 38% probabilità 0 tagli 2026. FOMC maggio sarà cruciale.",
    impact:"0 tagli: pressione su EQIX (REIT) e growth (NVDA). 1-2 tagli: positivo per tutto il portafoglio."}
];

const ANALYSIS_SOURCES = [
  {name:"Bloomberg Terminal",url:"https://www.bloomberg.com",type:"Premium",specialty:"Dati real-time, analisi istituzionale, breaking news finanziarie",reliability:95,icon:"💎"},
  {name:"Reuters",url:"https://www.reuters.com/business",type:"Free/Premium",specialty:"Breaking news globali, geopolitica, macro",reliability:92,icon:"📡"},
  {name:"Financial Times",url:"https://www.ft.com",type:"Premium",specialty:"Analisi approfondita, fondi istituzionali, M&A, Europa",reliability:90,icon:"📰"},
  {name:"CNBC",url:"https://www.cnbc.com",type:"Free",specialty:"News mercati USA, interviste CEO, analisi in tempo reale",reliability:78,icon:"📺"},
  {name:"CNN Business",url:"https://www.cnn.com/business",type:"Free",specialty:"Macro USA, impatto geopolitico su mercati, consumer",reliability:72,icon:"🌐"},
  {name:"Fox Business",url:"https://www.foxbusiness.com",type:"Free",specialty:"Mercati USA, politica economica, small business, insider trading",reliability:70,icon:"🦊"},
  {name:"Wall Street Journal",url:"https://www.wsj.com",type:"Premium",specialty:"Investigazioni corporate, analisi settoriale, policy",reliability:90,icon:"📋"},
  {name:"SEC EDGAR",url:"https://efts.sec.gov/LATEST/search-index?q=&forms=4,13F-HR",type:"Free",specialty:"Filing ufficiali: 13F (fondi), Form 4 (insider), 10-K, 10-Q",reliability:100,icon:"🏛️"},
  {name:"Finviz",url:"https://finviz.com",type:"Free/Premium",specialty:"Screener tecnico, heatmap mercato, insider trading, analisi fondamentale",reliability:85,icon:"📊"},
  {name:"WhaleWisdom",url:"https://whalewisdom.com",type:"Free/Premium",specialty:"Tracking 13F fondi istituzionali, analisi flussi",reliability:88,icon:"🐋"},
  {name:"Perplexity Finance",url:"https://www.perplexity.ai/finance",type:"Free",specialty:"AI-powered financial analysis, real-time data aggregation",reliability:80,icon:"🤖"},
  {name:"Yahoo Finance",url:"https://finance.yahoo.com",type:"Free",specialty:"Quotazioni, fondamentali, notizie, community",reliability:75,icon:"💹"},
  {name:"TradingView",url:"https://www.tradingview.com",type:"Free/Premium",specialty:"Analisi tecnica avanzata, grafici, indicatori, community di trader",reliability:82,icon:"📈"},
  {name:"Polymarket",url:"https://polymarket.com",type:"Free",specialty:"Mercati predittivi: probabilità eventi geopolitici, economici, elettorali",reliability:74,icon:"🔮"}
];

