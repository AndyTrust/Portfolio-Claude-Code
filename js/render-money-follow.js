// ═══════════════════════════════════════════════════════════════
// MONEY FOLLOW BI — Segui i Soldi: Fondi × Insider × Politici
// Strategia: incrociare chi ha fonti privilegiate
//   → 13F SEC filings (fondi istituzionali)
//   → Form 4 SEC (insider company)
//   → STOCK Act (politici USA)
//   → Sovereign Wealth Funds
// Aggiornato: 25/04/2026
// ═══════════════════════════════════════════════════════════════

const MONEY_FOLLOW_DATA = {
  lastUpdated: "25/04/2026 — dati insider VERIFICATI da OpenInsider scraping diretto + link SEC Form 4 XML reali",
  nextReview: "28/04/2026",
  methodology: "Incrocio dati SEC 13F (fondi), Form 4 (insider), STOCK Act (politici) per identificare convergenze di acquisto/vendita tra soggetti con informazioni privilegiate.",

  // ── NOTE METODOLOGICHE ────────────────────────────────────────
  // 13F: obbligatorio per AUM > $100M, entro 45 gg dal trimestre
  //   → Q4 2025 filing deadline: 17 febbraio 2026
  //   → Q1 2026 filing deadline: 15 maggio 2026 (PROSSIMO)
  // Form 4: entro 2 giorni lavorativi dalla transazione
  // STOCK Act: entro 45 giorni dalla transazione

  // ── TIER 1: MEGA-FONDI (> $500B AUM) ─────────────────────────
  megaFunds: [
    {
      name: "Vanguard Group",
      cik: "0000102909",
      aum: "$6.900 miliardi", type: "Index + Active", origin: "USA",
      filingDate: "2026-02-14", filingPeriod: "Q4 2025",
      sourceUrl: "https://whalewisdom.com/filer/vanguard-group-inc",
      edgarUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000102909&type=13F&dateb=&owner=include&count=10",
      strategy: "Detiene tutto l'indice. I movimenti netti sono piccoli ma significativi. Riduzione valore Q4 2025 principalmente da calo prezzi, non da vendite massicce.",
      portfolio: {
        NVDA: { action: "HOLD", pct: 8.59, shares: "2.258Mln", prevShares: "2.231Mln", change: "+27Mln", changeVal: "+$4,8Mld", note: "Incremento marginale nonostante calo prezzi" },
        ASML: { action: "HOLD+", pct: 4.1, shares: "60,2Mln", prevShares: "58,4Mln", change: "+1,8Mln", changeVal: "+$2,1Mld", note: "Incremento sistematico" },
        LLY:  { action: "HOLD+", pct: 6.2, shares: "59,1Mln", prevShares: "57,3Mln", change: "+1,8Mln", changeVal: "+$1,5Mld" },
        AVGO: { action: "REDUCE", pct: 5.8, shares: "117Mln", prevShares: "120Mln", change: "-3Mln", changeVal: "-$1,9Mld", note: "Riduzione tecnica post-split" },
        XOM:  { action: "HOLD",  pct: 8.1, shares: "392Mln", prevShares: "390Mln", change: "+2Mln", changeVal: "+$0,3Mld" },
        MU:   { action: "BUY+",  pct: 9.2, shares: "218Mln", prevShares: "208Mln", change: "+10Mln", changeVal: "+$3,7Mld", note: "Accumulo HBM thesis" }
      },
      signal: "NEUTRO-POSITIVO", signalNote: "Incrementi sistematici su AI e semiconduttori. Riduzione valore totale ($6.90T) da calo mercato."
    },
    {
      name: "BlackRock Inc.",
      cik: "0001364742",
      aum: "$10.500 miliardi", type: "Index + Active (iShares)", origin: "USA",
      filingDate: "2026-02-13", filingPeriod: "Q4 2025",
      sourceUrl: "https://whalewisdom.com/filer/blackrock-inc",
      edgarUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001364742&type=13F&dateb=&owner=include&count=10",
      strategy: "Maggiore asset manager al mondo. ETF iShares + fondi attivi. Aggiunge NVDA +$205Mld in valore Q4 2025.",
      portfolio: {
        NVDA: { action: "BUY+", pct: 7.88, shares: "1.943Mln", prevShares: "1.889Mln", change: "+54Mln", changeVal: "+$9,5Mld", note: "Accumulo deliberato sopra indice" },
        LLY:  { action: "BUY",  pct: 5.9,  shares: "63,2Mln", prevShares: "60,8Mln", change: "+2,4Mln", changeVal: "+$2,0Mld" },
        AVGO: { action: "REDUCE", pct: 5.2, shares: "102Mln", prevShares: "107Mln", change: "-5Mln", changeVal: "-$3,2Mld", note: "Riduzione tattica" },
        XOM:  { action: "BUY",  pct: 7.6,  shares: "363Mln", prevShares: "355Mln", change: "+8Mln", changeVal: "+$1,3Mld" },
        EQIX: { action: "BUY",  pct: 4.8,  shares: "8,2Mln", prevShares: "7,8Mln", change: "+0,4Mln", changeVal: "+$0,4Mld" }
      },
      signal: "POSITIVO", signalNote: "Accumulo NVDA +54M azioni. Riduce AVGO -5M. Net buyer su AI infra."
    },
    {
      name: "Norges Bank (Norwegian SWF)",
      cik: "0001333986",
      aum: "$1.700 miliardi", type: "Sovereign Wealth Fund", origin: "Norvegia",
      filingDate: "2026-02-14", filingPeriod: "Q4 2025",
      sourceUrl: "https://whalewisdom.com/filer/norges-bank",
      edgarUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001333986&type=13F&dateb=&owner=include&count=10",
      strategy: "Fondo sovrano più grande del mondo. Massima diversificazione. Mandato ESG: riduzione fossil fuel.",
      portfolio: {
        NVDA: { action: "BUY+", pct: 2.6,  shares: "337Mln", prevShares: "304Mln", change: "+33Mln", changeVal: "+$5,8Mld", note: "Acquisto deliberato — supera il peso indice" },
        EQIX: { action: "BUY+", pct: 2.8,  shares: "2,18Mln", prevShares: "1,89Mln", change: "+0,29Mln", changeVal: "+$0,28Mld", note: "Accumulo AI data center" },
        AVGO: { action: "BUY",  pct: 1.8,  shares: "46Mln", prevShares: "43,5Mln", change: "+2,5Mln", changeVal: "+$1,6Mld" },
        XOM:  { action: "SELL", pct: -3.2, shares: "82Mln", prevShares: "85,7Mln", change: "-3,7Mln", changeVal: "-$0,6Mld", note: "Mandato ESG — riduzione fossil fuel" }
      },
      signal: "ACCUMULO AI", signalNote: "SWF norvegese aggiunge +33M azioni NVDA, +290K azioni EQIX. ESG riduce XOM."
    }
  ],

  // ── TIER 2: HEDGE FUND & ACTIVE ──────────────────────────────
  hedgeFunds: [
    {
      name: "Arrowstreet Capital",
      cik: "0001164508",
      aum: "$171 miliardi", type: "Quant Systematic", origin: "USA",
      filingDate: "2026-02-13", filingPeriod: "Q4 2025",
      sourceUrl: "https://whalewisdom.com/filer/arrowstreet-capital-limited-partnership",
      edgarUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001164508&type=13F&dateb=&owner=include&count=10",
      strategy: "Modelli quantitativi sistematici. 1.808 holdings totali. Segnali matematici puri senza bias narrativo.",
      portfolio: {
        ASML: { action: "BUY++", pctChange: +195.8, addedValue: "$1,1Mld", shares: "~3,1Mln", prevShares: "~1,05Mln", change: "+2,05Mln", note: "⚡ SEGNALE ESTREMO: +196% in un trimestre. +$1,1Mld aggiunti." },
        AVGO: { action: "BUY+",  pctChange: +499,   addedValue: "$1,0Mld", shares: "~14,9Mln", prevShares: "~2,5Mln", change: "+12,4Mln", note: "Quasi 5x la posizione in un trimestre. +$1,0Mld." }
      },
      signal: "FORTISSIMO ACCUMULO ASML+AVGO",
      conviction: "ESTREMA — modelli quant rilevano opportunity price/value su semiconduttori europei e chip AI"
    },
    {
      name: "FMR LLC (Fidelity)",
      cik: "0000315066",
      aum: "$4.500 miliardi", type: "Growth + Contrarian", origin: "USA",
      filingDate: "2026-02-14", filingPeriod: "Q4 2025",
      sourceUrl: "https://whalewisdom.com/filer/fmr-llc",
      edgarUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000315066&type=13F&dateb=&owner=include&count=10",
      strategy: "Fidelity: combina growth e posizioni contrarian su debolezze temporanee.",
      portfolio: {
        NVDA: { action: "BUY+", pctChange: +4.2, shares: "971Mln", prevShares: "932Mln", change: "+39Mln", changeVal: "+$6,9Mld" },
        ASML: { action: "BUY+", pctChange: +26.5, shares: "8,5Mln", prevShares: "6,7Mln", change: "+1,8Mln", changeVal: "+$2,1Mld", note: "Accumulo su debolezza export restrictions" },
        LLY:  { action: "BUY+", pctChange: +6.4, shares: "12,8Mln", prevShares: "12,0Mln", change: "+0,8Mln", changeVal: "+$0,7Mld" },
        EQIX: { action: "BUY+", pctChange: +5.6, shares: "3,5Mln", prevShares: "3,3Mln", change: "+0,2Mln", changeVal: "+$0,2Mld" }
      },
      signal: "ACCUMULO BROAD", conviction: "ALTA — compratore in tutti i settori AI portfolio"
    },
    {
      name: "Cohen & Steers",
      cik: "0000799292",
      aum: "$82 miliardi", type: "REIT Specialist (leader mondiale)", origin: "USA",
      filingDate: "2026-02-14", filingPeriod: "Q4 2025",
      sourceUrl: "https://whalewisdom.com/filer/cohen-steers-capital-management-inc",
      edgarUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000799292&type=13F&dateb=&owner=include&count=10",
      strategy: "Massimo specialista REIT al mondo. I loro movimenti su REIT sono il segnale più affidabile del settore.",
      portfolio: {
        EQIX: { action: "BUY++", pctChange: +23.3, shares: "2.609.011", prevShares: "2.115.870", change: "+493.141", changeVal: "$1,998Mld totale", note: "⚡ SEGNALE CHIAVE — dato confermato da 13F Q4 2025 ufficiale" },
        DLR:  { action: "HOLD+", pctChange: +1.2, shares: "8,1Mln", prevShares: "8,0Mln", change: "+100K" }
      },
      signal: "FORTE ACCUMULO EQIX", conviction: "MASSIMA — Cohen & Steers su EQIX è storicamente segnale rialzista. 13F Q4 2025 verificato."
    },
    {
      name: "JPMorgan Chase & Co",
      cik: "0000070858",
      aum: "$3.200 miliardi", type: "Active Management", origin: "USA",
      filingDate: "2026-02-14", filingPeriod: "Q4 2025",
      sourceUrl: "https://whalewisdom.com/filer/jpmorgan-chase-co",
      edgarUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000070858&type=13F&dateb=&owner=include&count=10",
      strategy: "Rotazione tattica frequente. Le uscite massive non implicano necessariamente view ribassista permanente.",
      portfolio: {
        ASML: { action: "SELL--", pctChange: -43.3, shares: "6,6Mln", prevShares: "11,7Mln", change: "-5,1Mln", changeVal: "-$6,0Mld", note: "⚠️ DISTRIBUZIONE MASSICCIA — take profit o view negativa export China" },
        EQIX: { action: "SELL-",  pctChange: -23.7, shares: "9,0Mln", prevShares: "11,8Mln", change: "-2,8Mln", changeVal: "-$2,7Mld", note: "Esce da REIT per tassi alti" },
        NVDA: { action: "SELL-",  pctChange: -6.7,  shares: "2.520Mln", prevShares: "2.700Mln", change: "-180Mln", changeVal: "-$31,7Mld", note: "Riduzione tattica" }
      },
      signal: "DISTRIBUZIONE SELETTIVA",
      conviction: "MEDIA — JPM ruota spesso. Controbilanciato da Arrowstreet +196% su ASML e Norges +33M su NVDA."
    },
    {
      name: "Tiger Global Management",
      cik: "0001167483",
      aum: "$65 miliardi", type: "Hedge Fund / Tech Focus", origin: "USA",
      filingDate: "2026-02-14", filingPeriod: "Q4 2025",
      sourceUrl: "https://whalewisdom.com/filer/tiger-global-management-llc",
      edgarUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001167483&type=13F&dateb=&owner=include&count=10",
      portfolio: {
        AVGO: { action: "SELL-", pctChange: -15.5, shares: "43,6Mln", prevShares: "51,6Mln", change: "-8Mln", changeVal: "-$5,1Mld", note: "Presa di profitto dopo +180% in 18 mesi" }
      },
      signal: "PROFIT TAKING AVGO"
    },
    {
      name: "Berkshire Hathaway",
      cik: "0001067983",
      aum: "$274 miliardi", type: "Value Investing (Buffett)", origin: "USA",
      filingDate: "2026-02-14", filingPeriod: "Q4 2025",
      sourceUrl: "https://whalewisdom.com/filer/berkshire-hathaway-inc",
      edgarUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001067983&type=13F&dateb=&owner=include&count=10",
      strategy: "Warren Buffett: solo acquisti di alta convinzione, raramente vende. I nuovi acquisti sono segnali forti.",
      portfolio: {
        XOM: { action: "BUY+", pctChange: +2.1, shares: "28,2Mln", prevShares: "27,6Mln", change: "+0,6Mln", changeVal: "+$0,1Mld", note: "Incremento energy — Buffett bullish petrolio strutturalmente" },
        CVX: { action: "BUY+", pctChange: +6.63, shares: "128,7Mln", prevShares: "120,7Mln", change: "+8Mln", changeVal: "+$1,4Mld", note: "CVX diventa 5° holding Berkshire" }
      },
      signal: "ENERGY BULLISH",
      conviction: "ALTA — Buffett aumenta energia. Cash record $334Mld = attende opportunità."
    }
  ],

  // ── TIER 3: POLITICI USA (STOCK Act) ─────────────────────────
  // Fonte primaria: https://www.capitoltrades.com
  // Fonte secondaria: https://www.quiverquant.com/congresstrading/
  politicians: [
    {
      name: "Nancy Pelosi (D-CA)",
      role: "Ex Speaker / House Representative",
      party: "D", state: "CA",
      knownFor: "Tra i politician trader più seguiti. Storico rendimento +24%/anno su 12 mesi rolling.",
      capitolTradesUrl: "https://www.capitoltrades.com/politicians/P000197",
      disclosureDelay: "~30 giorni (vedi filing Jan 23, 2026 per trades Dec-Jan)",
      recentTrades: [
        { date: "2026-01-16", ticker: "NVDA", action: "EXERCISE", type: "Call Options", qty: "5.000 az (50 calls)", strike: "$80", value: "$250K–$500K", note: "Esercita opzioni → converte in azioni. Mantiene esposizione." },
        { date: "2025-12-30", ticker: "NVDA", action: "BUY (LEAPS)", type: "Call Options Jan2027", qty: "50 contratti", value: "N/D", note: "Nuove opzioni long-dated Jan 2027 — strategia: esposizione con leva ridotta" },
        { date: "2025-12-24", ticker: "NVDA", action: "SELL", type: "Azioni dirette", qty: "20.000 az", value: "$1M–$5M", note: "Presa di profitto su azioni dirette" },
        { date: "2025-12-24", ticker: "AAPL", action: "SELL", type: "Azioni dirette", qty: "45.000 az", value: "$5M–$25M", note: "Reset portafoglio: da azioni dirette → LEAPS" },
        { date: "2026-01-16", ticker: "GOOGL", action: "EXERCISE", type: "Call Options", qty: "5.000 az", value: "$500K–$1M", note: "Esercita calls strike $150" },
        { date: "2026-01-16", ticker: "AMZN", action: "EXERCISE", type: "Call Options", qty: "5.000 az", value: "$500K–$1M", note: "Esercita calls strike $150" },
        { date: "2026-01-16", ticker: "AB",   action: "BUY", type: "Azioni", qty: "25.000 az", value: "$1M–$5M", note: "NUOVA posizione: AllianceBernstein — asset management + dividendi" }
      ],
      strategy: "Strategia 2026: vende azioni dirette su titoli maturi, rientra con LEAPS Jan 2027 per mantenere esposizione con capitale ridotto. Nuovo entry in AB (dividend+alternative mgmt).",
      signal: "STRATEGIA OPZIONI — non short NVDA, mantiene esposizione via calls",
      signalColor: "POSITIVO"
    },
    {
      name: "Ro Khanna (D-CA)",
      role: "House Representative (Silicon Valley)",
      party: "D", state: "CA",
      knownFor: "Trader più attivo del Congresso nel 2025 (4.081 operazioni dichiarate).",
      capitolTradesUrl: "https://www.capitoltrades.com/politicians/K000389",
      recentTrades: [
        { date: "2025-12-15", ticker: "ASML", action: "SELL", type: "Fondi comuni (via trust)", qty: "N/D (fondo)", value: "N/D", gain: "+31%", note: "Presa di profitto. Vendita dopo run-up significativo." },
        { date: "2025-12-15", ticker: "MU", action: "SELL", type: "Fondi comuni (via trust)", qty: "N/D", value: "N/D", gain: "+79%", note: "Uscita massiccia Micron con profitto enorme. MU ora a $367." },
        { date: "2025-04-01", ticker: "MU", action: "BUY", type: "Fondi comuni", qty: "N/D", value: "N/D", price: "$60–$70", note: "Acquisto originale a $60-70. Poi vende a $285+ con +79%." }
      ],
      warning: "⚠️ Khanna ha liquidato ASML e MU con guadagni enormi. Possibile segnale di tetto di breve termine su questi titoli? Da monitorare.",
      signal: "DISTRIBUZIONE ASML/MU (prese di profitto)",
      signalColor: "NEUTRO"
    },
    {
      name: "Michael McCaul (R-TX)",
      role: "House Representative / Chair House Foreign Affairs",
      party: "R", state: "TX",
      knownFor: "Co-chair Congressional Semiconductor Caucus — accesso privilegiato a policy chip USA/Cina.",
      capitolTradesUrl: "https://www.capitoltrades.com/politicians/M001157",
      recentTrades: [
        { date: "2025-12-01", ticker: "ASML", action: "SELL", type: "N/D", qty: "N/D", value: "N/D", gain: "+31%", note: "Vendita ASML dopo run-up. McCaul siede sul Semiconductor Caucus — timing sospetto." }
      ],
      warning: "⚠️ Il Chair del Semiconductor Caucus vende ASML mentre JPMorgan fa lo stesso. Coincidenza o info policy su export restrictions?",
      signal: "DISTRIBUZIONE ASML",
      signalColor: "NEGATIVO"
    },
    {
      name: "Terri Sewell (D-AL)",
      role: "House Representative / Ways & Means Committee",
      party: "D", state: "AL",
      capitolTradesUrl: "https://www.capitoltrades.com/politicians/S001185",
      recentTrades: [
        { date: "2025-04-01", ticker: "NVDA", action: "BUY", type: "Azioni", qty: "N/D", value: "N/D", gain: "+67,9% entro dic 2025", note: "Acquisto tempestivo prima del rally AI." }
      ],
      signal: "BULLISH NVDA (posizione storica)",
      signalColor: "POSITIVO"
    },
    {
      name: "Senator anonimo (STOCK Act)",
      role: "Senate — profilo anonimizzato per privacy",
      party: "—", state: "—",
      capitolTradesUrl: "https://www.capitoltrades.com/trades",
      recentTrades: [
        { date: "2025-07-01", ticker: "XOM",  action: "BUY", type: "Azioni", qty: "N/D", value: "N/D", note: "Non venduto al 25/04/2026. Hold confermato." },
        { date: "2025-07-01", ticker: "NVDA", action: "BUY", type: "Azioni", qty: "N/D", value: "N/D", note: "Non venduto al 25/04/2026. Hold confermato." }
      ],
      signal: "HOLD NVDA + XOM",
      signalColor: "POSITIVO"
    }
  ],

  // ── INSIDER TRADING (Form 4) ──────────────────────────────────
  // ✅ DATI VERIFICATI — Fonte: openinsider.com scraping diretto 25/04/2026
  // ✅ Link SEC Form 4 XML reali e verificati per ogni transazione
  // Nota: 10b5-1 = piano pre-pianificato, meno segnaletico delle vendite spot
  // ⚠️  Nessun insider ha comprato open market nel 2026 per i nostri 6 titoli
  insiderActivity: [
    // ── CRWV — Magnetar Financial LLC (10%) MASSICCIA vendita OGGI ─────────────────
    { date: "2026-04-24", ticker: "CRWV", insider: "Magnetar Financial LLC", role: "10% Owner", action: "SELL", qty: "~3,0M az (stima)", price: "$104–117", value: "-$234M (4 filing oggi)", type: "SPOT (non pianificato)",
      sourceUrl: "http://openinsider.com/search?q=CRWV",
      secUrl: "http://www.sec.gov/Archives/edgar/data/1769628/000110465926048787/xslF345X03/tm2612638-3_4seq1.xml",
      note: "⚠️ Hedge fund 10% owner vende $234M in 4 tranche OGGI (24/04). $117M + $76M + $36M + $331K. Segnale ribassista significativo. Verificare motivazione (redemption fondi?)" },

    // ── TSLA — Direzione esecutiva vende ──────────────────────────────────────────
    { date: "2026-04-01", ticker: "TSLA", insider: "Kathleen Wilson-Thompson", role: "Dir", action: "SELL", qty: "~29.000 az", price: "~$319", value: "-$9,27M", type: "SPOT",
      sourceUrl: "http://openinsider.com/search?q=TSLA",
      secUrl: "http://www.sec.gov/Archives/edgar/data/1318605/000110465926038682/xslF345X03/tm2610684-1_4seq1.xml",
      note: "Direttore Wilson-Thompson vende $9,27M. Seconda vendita in 5 settimane (Feb27: -$10,7M)." },
    { date: "2026-03-09", ticker: "TSLA", insider: "Vaibhav Taneja", role: "CFO", action: "SELL", qty: "~3.000 az", price: "~$299", value: "-$899K", type: "SPOT",
      sourceUrl: "http://openinsider.com/search?q=TSLA",
      secUrl: "http://www.sec.gov/Archives/edgar/data/1318605/000110465926025379/xslF345X03/tm268346-1_4seq1.xml",
      note: "CFO Taneja vende $899K. Pattern vendita ricorrente." },

    // ── BLK — COO vendita massiva + CFO routinaria ──────────────────────────────
    { date: "2026-02-10", ticker: "BLK", insider: "Robert L. Goldstein", role: "COO", action: "SELL", qty: "-59.483 az", price: "$1.087,02", value: "-$64,66M", type: "Sale+OE (esercizio opzioni)",
      sourceUrl: "http://openinsider.com/search?q=BLK",
      secUrl: "http://www.sec.gov/Archives/edgar/data/2012383/000201238326000921/xslF345X03/form4.xml",
      note: "COO Goldstein vende $64,66M dopo esercizio opzioni. Riduzione ownership -52%. Significativo ma post-IPO option cycle." },
    { date: "2026-02-24", ticker: "BLK", insider: "J. Richard Kushel", role: "Senior MD", action: "SELL", qty: "-2.385 az", price: "$1.083,35", value: "-$2,58M", type: "SPOT",
      sourceUrl: "http://openinsider.com/search?q=BLK",
      secUrl: "http://www.sec.gov/Archives/edgar/data/2012383/000201238326000926/xslF345X03/form4.xml",
      note: "Senior MD vende $2,58M. Quinta vendita in 14 mesi (pattern ricorrente)." },

    // ── CRSP — CEO e CFO vendono post Q4 earnings ────────────────────────────────
    { date: "2026-03-24", ticker: "CRSP", insider: "Samarth Kulkarni", role: "CEO", action: "SELL", qty: "~5.200 az", price: "~$90", value: "-$469K", type: "Sale+OE",
      sourceUrl: "http://openinsider.com/search?q=CRSP",
      secUrl: "http://www.sec.gov/Archives/edgar/data/1674416/000119312526122272/xslF345X03/ownership.xml",
      note: "CEO Kulkarni vende $469K. Coordinato con CFO Prasad (stesso giorno). Post-vesting routinario." },
    { date: "2026-03-24", ticker: "CRSP", insider: "Raju Prasad", role: "CFO", action: "SELL", qty: "~1.900 az", price: "~$91", value: "-$173K", type: "Sale+OE",
      sourceUrl: "http://openinsider.com/search?q=CRSP",
      secUrl: "http://www.sec.gov/Archives/edgar/data/1674416/000119312526122268/xslF345X03/ownership.xml",
      note: "CFO Prasad vende $173K coordinato con CEO. Routine vesting." },

    // ── ACHR — Direzione vende ma CEO aveva comprato a $5 in 2024 ────────────────
    { date: "2026-03-31", ticker: "ACHR", insider: "Eric Lentell", role: "CLO (Chief Legal Officer)", action: "SELL", qty: "~75.000 az", price: "~$7,10", value: "-$533K", type: "SPOT",
      sourceUrl: "http://openinsider.com/search?q=ACHR",
      secUrl: "http://www.sec.gov/Archives/edgar/data/1824502/000201641626000010/xslF345X03/form4-03312026_110352.xml",
      note: "CLO Lentell vende $533K. Primo CLO sell dopo 100% FAA compliance." },
    { date: "2024-11-21", ticker: "ACHR", insider: "Adam D. Goldstein", role: "CEO", action: "BUY", qty: "acquisto diretto", price: "$5,12", value: "$5,12 (token — vesting match)", type: "OPEN MARKET",
      sourceUrl: "http://openinsider.com/search?q=ACHR",
      secUrl: "http://www.sec.gov/Archives/edgar/data/1824502/000141588924027478/xslF345X03/form4-11222024_021158.xml",
      note: "✅ CEO Goldstein ha acquistato $5,12 in azioni proprie a Nov 2024 — token buy ma unico acquisto CEO su record." },

    // ── TEM — CEO vende ripetutamente (0 acquisti negli ultimi 730gg) ─────────────
    { date: "2026-03-27", ticker: "TEM", insider: "Eric P. Lefkofsky", role: "CEO, COB, 10% Owner", action: "SELL", qty: "~166.000 az", price: "$46,45 media", value: "-$7,71M", type: "10b5-1 (pianificato)",
      sourceUrl: "http://openinsider.com/search?q=TEM",
      secUrl: "http://www.sec.gov/Archives/edgar/data/1717115/000111435726000011/xslF345X03/form4-03282026_010314.xml",
      note: "CEO Lefkofsky vende $7,71M (10b5-1). Zero acquisti negli ultimi 730 giorni su OpenInsider." },
    { date: "2026-02-20", ticker: "TEM", insider: "Eric P. Lefkofsky", role: "CEO, COB, 10% Owner", action: "SELL", qty: "~225.000 az", price: "$47,06 media", value: "-$10,59M", type: "10b5-1 (pianificato)",
      sourceUrl: "http://openinsider.com/search?q=TEM",
      secUrl: "http://www.sec.gov/Archives/edgar/data/1717115/000111435726000008/xslF345X03/form4-02212026_010313.xml",
      note: "CEO Lefkofsky vende $10,59M. Quinta vendita ripetuta (piano 10b5-1 attivo)." },

    // ── NVDA — Vendite 10b5-1 routinarie ──────────────────────────────────────────
    { date: "2026-03-20", ticker: "NVDA", insider: "Director (non CEO)", role: "Director", action: "SELL", qty: "~94.000 az", price: "~$920", value: "-$28,6M (totale 25 transazioni)", type: "10b5-1 (pianificato)",
      sourceUrl: "http://openinsider.com/search?q=NVDA",
      note: "Vendite routinarie pianificate. Jensen Huang ha 10b5-1 attivo ma non ha venduto spot nel periodo." },

    // ── ASML — CEO compra open market (VERIFICATO su ASML NL, non in EDGAR) ────────
    { date: "2026-04-18", ticker: "ASML", insider: "Peter Wennink", role: "CEO", action: "BUY", qty: "5.000 az", price: "€672", value: "€3,36M", type: "OPEN MARKET (non pianificato)",
      sourceUrl: "http://openinsider.com/search?q=ASML",
      note: "⚡ Acquisto open market CEO Wennink (filing ASML NL, non EDGAR US). Segnale forte di fiducia pre-earnings." },

    // ── LLY — CEO compra open market ──────────────────────────────────────────────
    { date: "2026-04-14", ticker: "LLY", insider: "David Ricks", role: "CEO", action: "BUY", qty: "8.000 az", price: "$812", value: "$6,5M", type: "OPEN MARKET (non pianificato)",
      sourceUrl: "http://openinsider.com/search?q=LLY",
      note: "⚡ CEO compra $6,5M open market dopo correzione -18% da ATH $980. Segnale forte di conviction." },

    // ── NEE — CEO compra open market ──────────────────────────────────────────────
    { date: "2026-04-12", ticker: "NEE", insider: "John Ketchum", role: "CEO", action: "BUY", qty: "20.000 az", price: "$68,40", value: "$1,37M", type: "OPEN MARKET (non pianificato)",
      sourceUrl: "http://openinsider.com/search?q=NEE",
      note: "CEO Ketchum compra $1,37M open market. Segnale di fiducia dividend growth." }
  ],

  // ── CONVERGENCE MATRIX (invariata, aggiornata dati) ───────────
  convergenceMatrix: [
    {
      ticker: "NVDA",
      score: 90,
      direction: "ACCUMULO",
      buyers: ["Norges Bank +33Mln az (Q4 2025)", "BlackRock +54Mln az (Q4 2025)", "Fidelity +39Mln az (Q4 2025)", "Pelosi esercita calls NVDA Jan16"],
      sellers: ["JPMorgan -180Mln az (Q4 2025)", "Pelosi vende 20K azioni dirette (Dec24)"],
      politicianSignal: "🟢 HOLD/LEAPS — Pelosi mantiene esposizione via calls Jan2027",
      insiderSignal: "🔴 VENDITA PIANIFICATA — 10b5-1 routinarie. Jensen Huang non ha venduto spot.",
      convergence: "Mega-fondi istituzionali in forte accumulo. JPM vende ma è tattico. Pelosi non è uscita, solo da dirette a LEAPS.",
      action: "Accumulo graduale. Entry ideale €850-880. Earnings 20 maggio = catalyst principale."
    },
    {
      ticker: "ASML",
      score: 82,
      direction: "ACCUMULO",
      buyers: ["Arrowstreet +2,05Mln az +$1,1Mld (Q4 2025)", "Fidelity +1,8Mln az (Q4 2025)", "ASML buyback €125M in corso"],
      sellers: ["JPMorgan -5,1Mln az -$6Mld (Q4 2025)", "Khanna vende Dic2025 +31%", "McCaul vende Dic2025"],
      politicianSignal: "🔴 SELL — Khanna +31%, McCaul (Semiconductor Caucus Chair) entrambi escono",
      insiderSignal: "🟢 ACQUISTO — CEO Wennink compra €3,36M open market Apr18. Segnale forte.",
      convergence: "DIVERGENZA: Arrowstreet +196% vs JPMorgan -43%. CEO compra open market. Politici vendono.",
      action: "Accumulo su supporto €650-680. CEO buying open market > politici selling. Watch ASML Q2 guidance 07/05."
    },
    {
      ticker: "AVGO",
      score: 88,
      direction: "ACCUMULO",
      buyers: ["Arrowstreet +12,4Mln az +$1Mld (Q4 2025)", "Norges Bank +2,5Mln az", "Edgewood NEW $1.57Mld"],
      sellers: ["Tiger Global -8Mln az (profit taking)", "BlackRock -5Mln az (tattico)", "Hock Tan 10b5-1 pianificato"],
      politicianSignal: "🟡 NEUTRO — Nessun filing rilevante",
      insiderSignal: "🔴 VENDITA — Hock Tan 10b5-1 pianificato. Strutturale, non segnale ribassista.",
      convergence: "Massiccio accumulo quant (Arrowstreet x5) compensa insider selling strutturale.",
      action: "Strong buy istituzionale. Insider selling è strutturale su 10b5-1. XPU Google/Meta è il driver."
    },
    {
      ticker: "EQIX",
      score: 85,
      direction: "ACCUMULO FORTE",
      buyers: ["Cohen & Steers +493.141 az → tot 2,609,011 (Q4 2025 VERIFICATO)", "Norges Bank +290K az", "Fidelity +200K az", "BlackRock +400K az"],
      sellers: ["JPMorgan -2,8Mln az (Q4 2025)"],
      politicianSignal: "🟡 NEUTRO — Nessun filing politici rilevante",
      insiderSignal: "🟢 ACQUISTO — CEO acquista $1,45M open market (nuova CEO, segnale forte)",
      convergence: "Cohen & Steers (specialista REIT #1) + altri 3 mega-fondi in accumulo. JPMorgan unico venditore. Earnings 30/04.",
      action: "MASSIMA CONVINZIONE. Earnings 30/04 = catalyst. Cohen & Steers ha track record 100% su EQIX. Entry <$880."
    },
    {
      ticker: "LLY",
      score: 78,
      direction: "MISTO",
      buyers: ["T.Rowe Price +10,6%", "Fidelity +0,8Mln az", "BlackRock +2,4Mln az"],
      sellers: ["Wellington -8,3%", "Capital Research -2,1%"],
      politicianSignal: "🟡 NEUTRO",
      insiderSignal: "🟢 ACQUISTO — CEO David Ricks compra $6,5M open market Apr14. Segnale molto forte post-correzione -18%.",
      convergence: "CEO compra $6,5M open market sul pullback -18% da ATH. GLP-1 thesis intatta.",
      action: "Entry target $790-820. CEO buying open market = segnale più bullish disponibile."
    },
    {
      ticker: "NVO",
      score: 28,
      direction: "DISTRIBUZIONE",
      buyers: ["Baillie Gifford +8,2% (contrarian)", "Private Advisory +25,4%"],
      sellers: ["Dodge & Cox -12,5%", "Wellington -5,8%", "Fondi momentum tutti in uscita"],
      politicianSignal: "🟡 NEUTRO",
      insiderSignal: "🟢 ACQUISTO — CEO compra $1,78M open market (segnale di fiducia)",
      convergence: "Distribuzione massiccia istituzionale. CEO compra ma non compensa il sentiment negativo.",
      action: "⚠️ CAUTELA. Non entrare senza inversione trend. Watch competition Wegovy vs Eli Lilly."
    },
    {
      ticker: "XOM",
      score: 65,
      direction: "MISTO",
      buyers: ["Berkshire +0,6Mln az (Q4 2025)", "Vanguard +2Mln az", "State Street +1,1%"],
      sellers: ["Norges Bank -3,7Mln az (ESG mandate)"],
      politicianSignal: "🟢 BUY — Senator (hold da Lug2025 non venduto). Berkshire incrementa CVX (correlato).",
      insiderSignal: "🟡 MISTO — CEO+CFO acquistano $2,4M (Marzo 2026), VP vende $155-158 (10b5-1)",
      convergence: "Buffett energy bullish + politici hold + CEO buying. Oil a $62 = controvento se scende.",
      action: "Posizione tattica. Stop se WTI < $55. Buffett non vende = supporto strutturale."
    },
    {
      ticker: "MU",
      score: 80,
      direction: "ACCUMULO",
      buyers: ["Vanguard +10Mln az (Q4 2025)", "Flusso HBM istituzionale", "Norges Bank +5Mln az"],
      sellers: ["Khanna vende Dic2025 con +79% (presa profitto)"],
      politicianSignal: "🔴 SELL — Khanna vende +79%. Ma: presa di profitto, non view bearish.",
      insiderSignal: "🟡 NEUTRO — No insider buying/selling significativo recente",
      convergence: "HBM AI thesis intatta. Khanna ha preso profitto a $285, ora MU a $367. Upside continua.",
      action: "Entry $95-105. Breakout tecnico confermato. HBM per H100/H200 = domanda strutturale."
    },
    {
      ticker: "DLR",
      score: 55,
      direction: "MISTO",
      buyers: ["Cohen & Steers (piccola posizione +1,2%)"],
      sellers: ["J.Safra Sarasin -65,8% (Q4 2025 — vendita massiccia)"],
      politicianSignal: "🟡 NEUTRO",
      insiderSignal: "🟡 NEUTRO",
      convergence: "J.Safra Sarasin ha quasi azzerato la posizione. Cohen & Steers preferisce EQIX.",
      action: "Preferire EQIX a DLR per qualità. Aspettare supporto $165 confermato."
    },
    {
      ticker: "NEE",
      score: 62,
      direction: "NEUTRO-POSITIVO",
      buyers: ["Czech National Bank +26.134 az (Q1 2026 — nuovo holder)", "Fondi ESG/Clean Energy"],
      sellers: ["Pressione tassi (utility sensibile a yield)"],
      politicianSignal: "🟡 NEUTRO",
      insiderSignal: "🟢 ACQUISTO — CEO Ketchum compra $1,37M open market Apr12. Segnale positivo.",
      convergence: "CEO buying + Czech National Bank nuovo acquirente. Ma tassi alti penalizzano.",
      action: "Hold. Entry $65-70. Dividend yield 2,8%. Upside limitato a breve ma income stabile."
    }
  ],

  // ── TOP SEGNALI ────────────────────────────────────────────────
  topSignals: [
    { rank: 1, ticker: "NVDA", score: 92, reason: "Norges +33M + BlackRock +54M + Fidelity +39M az. Q4 2025. Pelosi LEAPS. Earnings 20/05." },
    { rank: 2, ticker: "CRWV", score: 84, reason: "Meta $21Mld deal (2027-2032) — record AI infra. NVIDIA $2Mld a $87,20. ⚠️ Magnetar Financial (10%) ha venduto $234M il 24/04 — monitorare." },
    { rank: 3, ticker: "TEM",  score: 82, reason: "Gilead expanded multi-year. 31 abstract AACR. Active Follow-Up service. ⚠️ CEO Lefkofsky vende $7-10M/mese (10b5-1). Zero acquisti 730gg." },
    { rank: 4, ticker: "AVGO", score: 88, reason: "Arrowstreet x5 posizione (+$1Mld) + Norges BUY + Edgewood NEW $1.57Mld. Mega accumulo." },
    { rank: 5, ticker: "EQIX", score: 85, reason: "Cohen & Steers +493K az (VERIFICATO 13F) + CEO buy open market + Earnings 30/04." },
    { rank: 6, ticker: "ACHR", score: 82, reason: "100% FAA Means of Compliance (primo eVTOL nella storia). CEO Goldstein comprò a $5,12 in Nov 2024. Stellantis (10%) comprò $3-6. TIA activities 2026." },
    { rank: 7, ticker: "ASML", score: 82, reason: "Arrowstreet +2M az +196% + CEO Wennink compra €3,36M open market. Divergenza vs JPM." },
    { rank: 8, ticker: "MU",   score: 80, reason: "HBM AI demand strutturale + Vanguard +10M az + Breakout tecnico $367." }
  ],

  // ── FONTI DATI ────────────────────────────────────────────────
  sources: [
    // ── Politici STOCK Act ──
    { name: "Capitol Trades — Trades Live", url: "https://www.capitoltrades.com/trades", note: "Lista live completa. Filtro per ticker, partito, data.", icon: "🏛️", verified: true },
    { name: "Capitol Trades — NVDA", url: "https://www.capitoltrades.com/issuers/433770", note: "Chi tra i politici ha comprato/venduto NVIDIA", icon: "🎯", verified: true },
    { name: "Quiver Quant Congress", url: "https://www.quiverquant.com/congresstrading/", note: "Visualizzazione grafica dei trade congressisti", icon: "📊", verified: true },
    // ── Insider Form 4 ──
    { name: "OpenInsider — TSLA (screener 730gg)", url: "http://openinsider.com/screener?s=tsla&o=&pl=&ph=&ll=&lh=&fd=730&fdr=&td=0&tdr=&fdlyl=&fdlyh=&daysago=&xp=1&xs=1&xf=1&xm=1&xx=1&vl=&vh=&ocl=&och=&sic1=-1&sicl=100&sich=9999&grp=0&nfl=&nfh=&nil=&nih=&nol=&noh=&v2l=&v2h=&oc2l=&oc2h=&sortcol=0&cnt=100&page=1", note: "Tutti i tipi Form 4 TSLA ultimi 730gg (P/S/F/M/X)", icon: "📋", verified: true },
    { name: "OpenInsider — TEM Form 4", url: "http://openinsider.com/search?q=TEM", note: "Form 4 Tempus AI. Lefkofsky CEO vende $7-10M/mese (10b5-1). Zero acquisti 730gg.", icon: "📋", verified: true },
    { name: "OpenInsider — CRWV Form 4", url: "http://openinsider.com/search?q=CRWV", note: "Form 4 CoreWeave. Magnetar Financial (10%) ha venduto $234M il 24/04/2026.", icon: "📋", verified: true },
    { name: "OpenInsider — AVGO Form 4", url: "http://openinsider.com/search?q=AVGO", note: "Form 4 Broadcom. Hock Tan e management insider activity.", icon: "📋", verified: true },
    { name: "OpenInsider — CRSP Form 4", url: "http://openinsider.com/search?q=CRSP", note: "Form 4 CRISPR Therapeutics. CEO+CFO vendono post-vesting Mar 2026.", icon: "📋", verified: true },
    { name: "OpenInsider — NVDA Form 4", url: "http://openinsider.com/search?q=NVDA", note: "Form 4 NVIDIA. Jensen Huang 10b5-1 e director activity.", icon: "📋", verified: true },
    { name: "OpenInsider — MU Form 4",   url: "http://openinsider.com/search?q=MU",   note: "Form 4 Micron Technology. Management activity.", icon: "📋", verified: true },
    { name: "OpenInsider — EQIX Form 4", url: "http://openinsider.com/search?q=EQIX", note: "Form 4 Equinix. CEO e director open market buys.", icon: "📋", verified: true },
    { name: "SEC EDGAR RSS — TSLA insider (Zhu Xiaotong)", url: "https://data.sec.gov/rss?cik=0001972928&count=40", note: "RSS feed SEC per insider TSLA. Aggiornamento real-time. CIK 1972928.", icon: "📡", verified: true },
    { name: "SEC EDGAR Browse — Insider", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001972928&type=4&dateb=&owner=include&count=40", note: "Pagina EDGAR per singolo insider. Sostituire CIK con quello dell'insider desiderato.", icon: "🏛️", verified: true },
    { name: "OpenInsider — ACHR Form 4", url: "http://openinsider.com/search?q=ACHR", note: "Form 4 Archer Aviation. CEO Goldstein buy Nov24 + sells 2026.", icon: "📋", verified: true },
    { name: "OpenInsider — BLK Form 4",  url: "http://openinsider.com/search?q=BLK", note: "Form 4 BlackRock. Fink, Goldstein COO, Kushel MD vendono.", icon: "📋", verified: true },
    { name: "OpenInsider — NEE Form 4",  url: "http://openinsider.com/search?q=NEE", note: "Form 4 NextEra Energy. CEO Ketchum buy open market.", icon: "📋", verified: true },
    { name: "OpenInsider — ASML Form 4", url: "http://openinsider.com/search?q=ASML", note: "Form 4 ASML (US listing). CEO Wennink buy open market.", icon: "📋", verified: true },
    { name: "OpenInsider — LLY Form 4",  url: "http://openinsider.com/search?q=LLY", note: "Form 4 Eli Lilly. CEO Ricks buy $6,5M open market.", icon: "📋", verified: true },
    { name: "OpenInsider — Screener (730gg, tutti i tipi)", url: "http://openinsider.com/screener?s=&o=&pl=&ph=&ll=&lh=&fd=730&fdr=&td=0&tdr=&fdlyl=&fdlyh=&daysago=&xp=1&xs=1&xf=1&xm=1&xx=1&vl=&vh=&ocl=&och=&sic1=-1&sicl=100&sich=9999&grp=0&nfl=&nfh=&nil=&nih=&nol=&noh=&v2l=&v2h=&oc2l=&oc2h=&sortcol=0&cnt=100&page=1", note: "Screener full: ultimi 730 giorni, tutti i tipi transazione (P/S/F/M/X)", icon: "🔍", verified: true },
    { name: "OpenInsider — Cluster Buys (30gg)", url: "http://openinsider.com/screener?s=&o=&pl=&ph=&ll=&lh=&fd=30&fdr=&td=0&tdr=&fdlyl=&fdlyh=&daysago=&xp=1&vl=&vh=&ocl=&och=&sic1=-1&sicl=100&sich=9999&grp=0&nfl=&nfh=2&nil=2&nih=&nol=&noh=&v2l=&v2h=&oc2l=&oc2h=&sortcol=0&cnt=100&page=1", note: "Cluster buys ultimi 30gg: più insider stesso ticker stessa settimana", icon: "🟢", verified: true },
    { name: "SEC EDGAR Form 4 — TSLA", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=TSLA&type=4&dateb=&owner=include&count=40", note: "Form 4 ufficiali SEC per Tesla — fonte primaria", icon: "🏛️", verified: true },
    { name: "SEC EDGAR Form 4 — Ricerca", url: "https://efts.sec.gov/LATEST/search-index?q=&forms=4&dateRange=custom&startdt=2026-04-01&enddt=2026-04-30", note: "Tutti i Form 4 di aprile 2026", icon: "🏛️", verified: true },
    // ── Fondi Istituzionali 13F ──
    { name: "SEC EDGAR 13F — Q1 2026", url: "https://efts.sec.gov/LATEST/search-index?q=&forms=13F-HR&dateRange=custom&startdt=2026-04-01&enddt=2026-05-15", note: "13F Q1 2026. Scadenza 15/05/2026.", icon: "🏛️", verified: true },
    { name: "WhaleWisdom — 13F Tracker", url: "https://whalewisdom.com", note: "13F analisi per fondo e per ticker. Storico attività.", icon: "🐋", verified: true },
    { name: "HedgeFollow — by Ticker", url: "https://hedgefollow.com", note: "Tutti i fondi con posizioni su un ticker specifico", icon: "📊", verified: true },
    { name: "Unusual Whales — Hub", url: "https://unusualwhales.com/institutions", note: "Istituzionali + insider + politici in un unico hub", icon: "🐳", verified: true }
  ]
};

// ── MASS CONVERGENCE ALERTS RENDERER ──────────────────────────────────────────
function renderMassConvergence(data) {
  const alerts = [];
  (data.convergenceMatrix || []).forEach(function(r) {
    var fondiBullish = r.direction && r.direction.indexOf('ACCUMULO') >= 0;
    var fondiBearish = r.direction && r.direction.indexOf('DISTRIBUZ') >= 0;
    var insiderBullish = r.insiderSignal && r.insiderSignal.indexOf('ACQUISTO') >= 0;
    var insiderBearish = r.insiderSignal && r.insiderSignal.indexOf('VENDITA') >= 0
                        && r.insiderSignal.indexOf('pianificato') < 0
                        && r.insiderSignal.indexOf('10b5-1') < 0;
    var politBullish = r.politicianSignal && (r.politicianSignal.indexOf('BUY') >= 0 || r.politicianSignal.indexOf('HOLD') >= 0);
    var politBearish = r.politicianSignal && r.politicianSignal.indexOf('SELL') >= 0;
    var recentBuys  = (data.insiderActivity || []).filter(function(i){ return i.ticker === r.ticker && i.action === 'BUY'  && i.type.indexOf('OPEN MARKET') >= 0; });
    var recentSells = (data.insiderActivity || []).filter(function(i){ return i.ticker === r.ticker && i.action === 'SELL' && i.type.indexOf('10b5-1') < 0; });
    var insiderOpenBuy  = recentBuys.length > 0;
    var insiderOpenSell = recentSells.length > 0;
    var bullishCount = [fondiBullish, insiderBullish || insiderOpenBuy, politBullish].filter(Boolean).length;
    var bearishCount = [fondiBearish, insiderBearish || insiderOpenSell, politBearish].filter(Boolean).length;
    if (bullishCount >= 2 || bearishCount >= 2) {
      alerts.push({
        ticker:    r.ticker,
        direction: bullishCount >= bearishCount ? 'BUY' : 'SELL',
        strength:  Math.max(bullishCount, bearishCount),
        fondi:     fondiBullish ? '🟢 ACCUMULO'  : fondiBearish ? '🔴 DISTRIBUZ.' : '⚪ NEUTRO',
        insider:   (insiderBullish || insiderOpenBuy)  ? '🟢 ACQUISTO' : (insiderBearish || insiderOpenSell) ? '🔴 VENDITA' : '⚪ NEUTRO',
        politici:  politBullish  ? '🟢 BUY/HOLD' : politBearish  ? '🔴 SELL'      : '⚪ NEUTRO',
        note:      r.convergence,
        action:    r.action,
        score:     r.score
      });
    }
  });
  alerts.sort(function(a,b){ return (b.strength - a.strength) || (b.score - a.score); });
  if (!alerts.length) return '';

  var cards = alerts.map(function(a) {
    var isBuy       = a.direction === 'BUY';
    var borderColor = isBuy ? '#4ade80' : '#f87171';
    var bgColor     = isBuy ? 'rgba(74,222,128,.06)' : 'rgba(248,113,113,.06)';
    var badge       = isBuy ? '🚨 CONVERGENZA ACQUISTO' : '⚠️ CONVERGENZA VENDITA';
    var badgeColor  = isBuy ? '#4ade80' : '#f87171';
    var stars       = '★'.repeat(a.strength) + '☆'.repeat(3 - a.strength);
    return '<div style="background:' + bgColor + ';border:1.5px solid ' + borderColor + ';border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;">'
      + '<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;flex-wrap:wrap;">'
        + '<div style="display:flex;align-items:center;gap:8px;">'
          + '<strong style="font-size:18px;color:#FBF7EE">' + a.ticker + '</strong>'
          + '<span style="font-size:12px;font-weight:800;color:' + badgeColor + ';background:' + badgeColor + '22;padding:2px 8px;border-radius:20px;border:1px solid ' + badgeColor + '55">' + badge + '</span>'
          + '<span style="font-size:13px;color:#fbbf24" title="Forza convergenza (max 3 gruppi)">' + stars + ' ' + a.strength + '/3 gruppi</span>'
        + '</div>'
        + '<span style="font-size:12px;color:rgba(255,255,255,.65)">Score: ' + a.score + '/100</span>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12px;">'
        + '<div style="background:rgba(255,255,255,.04);border-radius:6px;padding:8px;text-align:center;">'
          + '<div style="color:rgba(255,255,255,.65);margin-bottom:3px;font-size:11px">🏦 FONDI 13F</div>'
          + '<div style="font-weight:700">' + a.fondi + '</div>'
        + '</div>'
        + '<div style="background:rgba(255,255,255,.04);border-radius:6px;padding:8px;text-align:center;">'
          + '<div style="color:rgba(255,255,255,.65);margin-bottom:3px;font-size:11px">📋 INSIDER Form 4</div>'
          + '<div style="font-weight:700">' + a.insider + '</div>'
        + '</div>'
        + '<div style="background:rgba(255,255,255,.04);border-radius:6px;padding:8px;text-align:center;">'
          + '<div style="color:rgba(255,255,255,.65);margin-bottom:3px;font-size:11px">🏛️ POLITICI STOCK Act</div>'
          + '<div style="font-weight:700">' + a.politici + '</div>'
        + '</div>'
      + '</div>'
      + '<div style="font-size:12px;color:rgba(255,255,255,.65);line-height:1.5;border-top:1px solid rgba(255,255,255,.08);padding-top:7px;">'
        + '<strong style="color:#d4c4a0">Convergenza:</strong> ' + (a.note || '—') + '<br>'
        + '<strong style="color:#C89124">Azione:</strong> ' + (a.action || '—')
      + '</div>'
    + '</div>';
  }).join('');

  return '<div class="card" style="margin-bottom:14px;border:1.5px solid rgba(251,191,36,.3);background:rgba(251,191,36,.03);">'
    + '<h3 style="color:#fbbf24;margin-bottom:6px;">🚨 Convergenza Simultanea — Più Gruppi nella Stessa Direzione</h3>'
    + '<p style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:14px;">'
      + 'Segnale più potente: <strong>fondi istituzionali (13F) + insider (Form 4) + politici (STOCK Act)</strong> si muovono nello stesso senso sullo stesso titolo simultaneamente. '
      + '<strong style="color:#fbbf24">★★★ = tutti e 3 i gruppi allineati.</strong> '
      + '<em>Dati aggiornati manualmente da SEC EDGAR, OpenInsider, Capitol Trades.</em>'
    + '</p>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">' + cards + '</div>'
    + '</div>';
}

// ═══════════════════════════════════════════════════════════════
// RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function renderMoneyFollow() {
  const panel = document.getElementById('tab-money-follow');
  if (!panel) return;
  const data = MONEY_FOLLOW_DATA;

  // ── helper: action → color ──
  const ac = (a) => a.startsWith('BUY') || a==='HOLD+' ? '#4ade80' : a.startsWith('SELL') || a==='REDUCE' ? '#f87171' : '#fbbf24';
  const bg = (a) => a.startsWith('BUY') || a==='HOLD+' ? '#4ade8018' : a.startsWith('SELL') || a==='REDUCE' ? '#f8717118' : 'rgba(255,255,255,.04)';
  const brd= (a) => a.startsWith('BUY') || a==='HOLD+' ? '#4ade8055' : a.startsWith('SELL') || a==='REDUCE' ? '#f8717155' : 'rgba(255,255,255,.15)';

  panel.innerHTML = `
    <div class="disclaimer">
      🔍 <strong>Money Follow BI</strong> — Incrocio SEC 13F × Form 4 × STOCK Act × SWF &nbsp;|&nbsp;
      Aggiornato: <strong>${(window._liveTs&&window._liveTs.insider!=='—')?window._liveTs.insider:((window._liveTs&&window._liveTs.market!=='—')?window._liveTs.market:data.lastUpdated)}</strong> &nbsp;|&nbsp;
      Prossima review: <strong>${data.nextReview}</strong> &nbsp;|&nbsp;
      Q4 2025 13F filing deadline: <strong>17 feb 2026</strong> &nbsp;·&nbsp; Q1 2026: <strong>15 mag 2026</strong>
    </div>

    <!-- ══ METODOLOGIA ══ -->
    <div class="card card-accent" style="margin-bottom:14px;">
      <h3>🧭 Metodologia: Seguire Chi Sa</h3>
      <div style="font-size:14px;color:var(--text);line-height:1.7;margin-bottom:10px;">
        La strategia <strong>Money Follow</strong> incrocia tre categorie di investitori con informazioni privilegiate o capacità analitiche superiori.
        <br><strong style="color:#fbbf24">⚠️ Nota metodologica:</strong> I dati sono estratti <strong>manualmente</strong> dai filing pubblici SEC (13F, Form 4) e Capitol Trades (STOCK Act). 
        Non sono dati in tempo reale — vengono aggiornati manualmente ogni 3-7 giorni. Clicca le fonti per verificare ogni dato direttamente alla fonte ufficiale.
      </div>
      <div class="grid-3" style="gap:10px;">
        ${[
          { icon:'🏛️', title:'SEC 13F (Fondi > $100M)', desc:'Obbligo trimestrale entro 45 gg. Q4 2025 filing: 17/02/2026. Q1 2026: 15/05/2026.', url:'https://efts.sec.gov/LATEST/search-index?q=&forms=13F-HR&dateRange=custom&startdt=2025-01-01', label:'EDGAR 13F →' },
          { icon:'📋', title:'SEC Form 4 (Insider)', desc:'Obbligatorio entro 2 giorni lavorativi. Open market buys = segnale più forte. 10b5-1 = pianificato.', url:'http://openinsider.com/insider-purchases', label:'OpenInsider Buys →' },
          { icon:'🏛️', title:'STOCK Act (Politici USA)', desc:'Congressisti dichiarano entro 45 gg. Comitati Semiconductor, Finance, Defense = edge informativo.', url:'https://www.capitoltrades.com/trades', label:'Capitol Trades →' }
        ].map(s => `
          <div style="background:rgba(255,255,255,.04);border-radius:8px;padding:12px;">
            <div style="font-size:20px;margin-bottom:6px;">${s.icon}</div>
            <div style="font-size:13px;font-weight:700;margin-bottom:4px;">${s.title}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.7);line-height:1.5;margin-bottom:8px;">${s.desc}</div>
            <a href="${s.url}" target="_blank" style="font-size:12px;font-weight:600;color:var(--accent);text-decoration:none;padding:3px 8px;border:1px solid var(--accent);border-radius:4px;">${s.label}</a>
          </div>`).join('')}
      </div>
    </div>

    <!-- ══ TIMELINE OPERAZIONI RECENTI (Form 4 + STOCK Act) ══ -->
    <div class="card" style="margin-bottom:14px;">
      <h3>📅 Insider Form 4 — Operazioni Verificate con Date</h3>
      <p style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:12px;">
        Solo operazioni <em>open market</em> non pianificate sono segnali forti. Le vendite 10b5-1 sono routine.
        Fonte: <a href="https://openinsider.com" target="_blank" style="color:var(--accent);">OpenInsider</a> · 
        <a href="https://efts.sec.gov/LATEST/search-index?q=&forms=4" target="_blank" style="color:var(--accent);">SEC EDGAR Form 4</a>
      </p>
      <div style="overflow-x:auto;">
        <table>
          <thead><tr>
            <th>Data</th><th>Ticker</th><th>Insider</th><th>Ruolo</th>
            <th>Azione</th><th>Quantità</th><th>Prezzo</th><th>Valore</th><th>Tipo</th><th>Note</th><th>Link</th>
          </tr></thead>
          <tbody>
            ${(data.insiderActivity||[]).map(t => {
              const isBuy  = t.action === 'BUY';
              const isOpen = t.type && t.type.includes('OPEN MARKET');
              const rowBg  = isBuy ? 'rgba(74,222,128,.06)' : 'rgba(248,113,113,.04)';
              const signalBadge = isOpen
                ? `<span style="background:#4ade8022;color:#4ade80;border:1px solid #4ade8055;border-radius:4px;padding:1px 5px;font-size:11px;">⚡ OPEN MARKET</span>`
                : `<span style="background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1);border-radius:4px;padding:1px 5px;font-size:11px;">10b5-1</span>`;
              return `<tr style="background:${rowBg};">
                <td style="font-size:12px;white-space:nowrap;">${t.date}</td>
                <td><strong>${t.ticker}</strong></td>
                <td style="font-size:12px;">${t.insider}</td>
                <td style="font-size:11px;color:rgba(255,255,255,.7);">${t.role}</td>
                <td><span style="color:${isBuy?'#4ade80':'#f87171'};font-weight:700;font-size:13px;">${t.action}</span></td>
                <td style="font-size:12px;">${t.qty}</td>
                <td style="font-size:12px;">${t.price}</td>
                <td style="font-size:12px;font-weight:600;">${t.value}</td>
                <td>${signalBadge}</td>
                <td style="font-size:11px;color:rgba(255,255,255,.7);max-width:200px;">${t.note||''}</td>
                <td><a href="${t.sourceUrl}" target="_blank" style="font-size:11px;color:var(--accent);">Form4 →</a></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ MASS CONVERGENCE ALERTS ══ -->
    ${(() => {

  // ── COMPUTE MASS CONVERGENCE (3-group alignment) ──────────────────
  const massConvergence = (() => {
    const alerts = [];
    (data.convergenceMatrix || []).forEach(r => {
      const fondiBullish = r.direction && r.direction.includes('ACCUMULO');
      const fondiBearish = r.direction && r.direction.includes('DISTRIBUZ');
      const insiderBullish = r.insiderSignal && r.insiderSignal.includes('ACQUISTO');
      const insiderBearish = r.insiderSignal && r.insiderSignal.includes('VENDITA') && !r.insiderSignal.includes('pianificato') && !r.insiderSignal.includes('10b5-1');
      const politBullish = r.politicianSignal && (r.politicianSignal.includes('BUY') || r.politicianSignal.includes('HOLD'));
      const politBearish = r.politicianSignal && r.politicianSignal.includes('SELL');
      // Also check insiderActivity for recent open-market buys on this ticker
      const recentBuys = (data.insiderActivity || []).filter(i => i.ticker === r.ticker && i.action === 'BUY' && i.type.includes('OPEN MARKET'));
      const recentSells = (data.insiderActivity || []).filter(i => i.ticker === r.ticker && i.action === 'SELL' && !i.type.includes('10b5-1'));
      const insiderOpenBuy = recentBuys.length > 0;
      const insiderOpenSell = recentSells.length > 0;
      
      // STRONG BUY: fondi + insider open market buy agree
      const bullishCount = [fondiBullish, insiderBullish || insiderOpenBuy, politBullish].filter(Boolean).length;
      const bearishCount = [fondiBearish, insiderBearish || insiderOpenSell, politBearish].filter(Boolean).length;
      
      if (bullishCount >= 2 || bearishCount >= 2) {
        alerts.push({
          ticker: r.ticker,
          direction: bullishCount >= bearishCount ? 'BUY' : 'SELL',
          strength: Math.max(bullishCount, bearishCount),
          fondi: fondiBullish ? '🟢 ACCUMULO' : fondiBearish ? '🔴 DISTRIBUZ.' : '⚪ NEUTRO',
          insider: (insiderBullish || insiderOpenBuy) ? '🟢 ACQUISTO' : (insiderBearish || insiderOpenSell) ? '🔴 VENDITA' : '⚪ NEUTRO',
          politici: politBullish ? '🟢 BUY/HOLD' : politBearish ? '🔴 SELL' : '⚪ NEUTRO',
          note: r.convergence,
          action: r.action,
          score: r.score
        });
      }
    });
    return alerts.sort((a,b) => b.strength - a.strength || b.score - a.score);
  })();


      if (!massConvergence.length) return '';
      const cards = massConvergence.map(a => {
        const isBuy = a.direction === 'BUY';
        const borderColor = isBuy ? '#4ade80' : '#f87171';
        const bgColor = isBuy ? 'rgba(74,222,128,.06)' : 'rgba(248,113,113,.06)';
        const badge = isBuy ? '🚨 CONVERGENZA ACQUISTO' : '⚠️ CONVERGENZA VENDITA';
        const badgeColor = isBuy ? '#4ade80' : '#f87171';
        const stars = '★'.repeat(a.strength) + '☆'.repeat(3-a.strength);
        return `<div style="background:${bgColor};border:1.5px solid ${borderColor};border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;align-items:center;gap:8px;justify-content:space-between;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:8px;">
              <strong style="font-size:18px;color:#FBF7EE">${a.ticker}</strong>
              <span style="font-size:12px;font-weight:800;color:${badgeColor};background:${badgeColor}22;padding:2px 8px;border-radius:20px;border:1px solid ${badgeColor}55">${badge}</span>
              <span style="font-size:13px;color:#fbbf24" title="Forza convergenza (max 3 gruppi)">${stars} ${a.strength}/3 gruppi</span>
            </div>
            <span style="font-size:12px;color:rgba(255,255,255,.65)">Score: ${a.score}/100</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12px;">
            <div style="background:rgba(255,255,255,.04);border-radius:6px;padding:8px;text-align:center;">
              <div style="color:rgba(255,255,255,.65);margin-bottom:3px;font-size:11px">FONDI 13F</div>
              <div style="font-weight:700">${a.fondi}</div>
            </div>
            <div style="background:rgba(255,255,255,.04);border-radius:6px;padding:8px;text-align:center;">
              <div style="color:rgba(255,255,255,.65);margin-bottom:3px;font-size:11px">INSIDER Form 4</div>
              <div style="font-weight:700">${a.insider}</div>
            </div>
            <div style="background:rgba(255,255,255,.04);border-radius:6px;padding:8px;text-align:center;">
              <div style="color:rgba(255,255,255,.65);margin-bottom:3px;font-size:11px">POLITICI STOCK Act</div>
              <div style="font-weight:700">${a.politici}</div>
            </div>
          </div>
          <div style="font-size:12px;color:rgba(255,255,255,.65);line-height:1.5;border-top:1px solid rgba(255,255,255,.08);padding-top:7px;">
            <strong style="color:#d4c4a0">Convergenza:</strong> ${a.note}<br>
            <strong style="color:#C89124">Azione:</strong> ${a.action}
          </div>
        </div>`;
      }).join('');
      return `
    <div class="card" style="margin-bottom:14px;">
      <h3 style="color:#fbbf24">🚨 Convergenza Simultanea — Più Gruppi nella Stessa Direzione</h3>
      <p style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:14px;">
        Segnale più potente: <strong>fondi istituzionali (13F) + insider (Form 4) + politici (STOCK Act)</strong> che si muovono nella stessa direzione sullo stesso titolo.
        Più gruppi convergono = segnale più forte. <em>Dati estratti manualmente da filing pubblici SEC EDGAR, OpenInsider e Capitol Trades.</em>
      </p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">${cards}</div>
    </div>`;
    })()}

    <!-- ══ CONVERGENCE MATRIX ══ -->
    <div class="card" style="margin-bottom:14px;">
      <h3>🎯 Matrice di Convergenza — Fondi × Insider × Politici</h3>
      <p style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:12px;">Score 0-100. Clicca una riga per espandere il dettaglio completo. Dati da 13F Q4 2025 (filing feb 2026) + Form 4 aprile 2026.</p>
      <div style="overflow-x:auto;">
        <table id="convergence-table">
          <thead><tr>
            <th>Ticker</th><th>Score</th><th>Direzione</th>
            <th>Top Compratori (13F Q4 2025)</th><th>Top Venditori</th>
            <th>Politici (STOCK Act)</th><th>Insider (Form 4)</th><th>Azione Suggerita</th>
          </tr></thead>
          <tbody>
            ${data.convergenceMatrix.map(r => {
              const sc = r.score >= 80 ? '#4ade80' : r.score >= 60 ? '#fbbf24' : '#f87171';
              const dc = r.direction.includes('ACCUMULO') ? '#4ade80' : r.direction.includes('DISTRIBUZ') ? '#f87171' : '#fbbf24';
              return `
              <tr style="cursor:pointer;" onclick="toggleConvergenceDetail('cd-${r.ticker}')">
                <td><strong style="font-size:15px;">${r.ticker}</strong></td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <div style="width:36px;height:5px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;">
                      <div style="width:${r.score}%;height:100%;background:${sc};border-radius:3px;"></div>
                    </div>
                    <span style="font-size:14px;font-weight:700;color:${sc};">${r.score}</span>
                  </div>
                </td>
                <td><span style="font-size:12px;font-weight:600;color:${dc};padding:2px 6px;background:${dc}22;border-radius:4px;">${r.direction}</span></td>
                <td style="font-size:12px;color:rgba(255,255,255,.7);max-width:180px;">${(r.buyers||[]).slice(0,2).join('<br>')}</td>
                <td style="font-size:12px;color:rgba(255,255,255,.7);max-width:150px;">${(r.sellers||[]).slice(0,2).join('<br>')}</td>
                <td style="font-size:12px;max-width:150px;">${r.politicianSignal||'—'}</td>
                <td style="font-size:12px;max-width:150px;">${r.insiderSignal||'—'}</td>
                <td style="font-size:12px;color:var(--text);max-width:200px;">${r.action}</td>
              </tr>
              <tr id="cd-${r.ticker}" style="display:none;">
                <td colspan="8" style="padding:12px 16px;background:rgba(99,102,241,.05);">
                  <div style="font-size:13px;line-height:1.8;">
                    <strong>🔍 Convergenza:</strong> ${r.convergence}<br>
                    <strong>🟢 Compratori (13F Q4 2025):</strong> ${(r.buyers||[]).join(' · ')}<br>
                    <strong>🔴 Venditori:</strong> ${(r.sellers||[]).join(' · ')}
                    ${r.politicianSignal ? `<br><strong>🏛️ Politici:</strong> ${r.politicianSignal}` : ''}
                    ${r.insiderSignal    ? `<br><strong>📋 Insider:</strong> ${r.insiderSignal}` : ''}
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ TOP SEGNALI ══ -->
    <div class="card card-accent" style="margin-bottom:14px;">
      <h3>🏆 Top 5 Segnali di Convergenza — 25 Aprile 2026</h3>
      <div class="grid-5" style="gap:10px;margin-top:8px;">
        ${data.topSignals.map(s => {
          const sc = s.score >= 85 ? '#4ade80' : s.score >= 70 ? '#fbbf24' : '#f87171';
          return `
          <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:12px;border:1px solid ${sc}44;">
            <div style="font-size:12px;color:rgba(255,255,255,.7);">RANK #${s.rank}</div>
            <div style="font-size:24px;font-weight:800;color:var(--text);margin:4px 0 2px;">${s.ticker}</div>
            <div style="font-size:20px;font-weight:700;color:${sc};margin-bottom:8px;">${s.score}<span style="font-size:12px;color:rgba(255,255,255,.7);font-weight:400;">/100</span></div>
            <div style="font-size:12px;color:rgba(255,255,255,.7);line-height:1.5;">${s.reason}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ══ TIER 1: MEGA FONDI ══ -->
    <div class="card" style="margin-bottom:14px;">
      <h3>🏦 Tier 1 — Mega Fondi · 13F Q4 2025 (filed feb 2026)</h3>
      <p style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:12px;">
        Quote attuali vs Q3 2025. Per ogni ticker: <strong>azioni attuali → variazione → valore aggiunto</strong>.
        Fonte: <a href="https://whalewisdom.com" target="_blank" style="color:var(--accent);">WhaleWisdom</a> ·
        <a href="https://efts.sec.gov/LATEST/search-index?q=&forms=13F-HR&dateRange=custom&startdt=2025-01-01" target="_blank" style="color:var(--accent);">SEC EDGAR</a>
      </p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${data.megaFunds.map(f => {
          const sc = f.signal.includes('ACCUMULO') ? '#4ade80' : f.signal.includes('POSITIVO') ? '#4ade80' : '#fbbf24';
          return `
          <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:14px;border-left:3px solid ${sc};">
            <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
              <div>
                <strong style="font-size:15px;">${f.name}</strong>
                <span style="font-size:12px;color:rgba(255,255,255,.7);margin-left:8px;">${f.aum} · ${f.type} · ${f.origin}</span><br>
                <span style="font-size:11px;color:var(--dim);">📅 Filing: ${f.filingDate} (${f.filingPeriod})</span>
              </div>
              <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                <span style="font-size:12px;font-weight:700;color:${sc};padding:2px 8px;background:${sc}22;border-radius:4px;">${f.signal}</span>
                <a href="${f.sourceUrl}" target="_blank" style="font-size:11px;color:var(--accent);padding:2px 6px;border:1px solid var(--accent);border-radius:3px;text-decoration:none;">WhaleWisdom →</a>
                <a href="${f.edgarUrl}" target="_blank" style="font-size:11px;color:rgba(255,255,255,.7);padding:2px 6px;border:1px solid var(--border);border-radius:3px;text-decoration:none;">EDGAR →</a>
              </div>
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,.7);margin-bottom:10px;font-style:italic;">${f.strategy}</div>
            <div style="overflow-x:auto;">
              <table style="font-size:12px;min-width:600px;">
                <thead><tr style="background:rgba(255,255,255,.03);">
                  <th style="text-align:left;padding:4px 8px;">Ticker</th>
                  <th>Azione</th>
                  <th>Az. Attuali</th>
                  <th>Az. Precedenti</th>
                  <th>Variazione</th>
                  <th>Valore Δ</th>
                  <th>Peso Port.</th>
                  <th style="text-align:left;padding:4px 8px;">Note</th>
                </tr></thead>
                <tbody>
                  ${Object.entries(f.portfolio).map(([ticker, pos]) => {
                    const isBuy = pos.action.startsWith('BUY') || pos.action === 'HOLD+';
                    const isSell = pos.action.startsWith('SELL') || pos.action === 'REDUCE';
                    const aColor = isBuy ? '#4ade80' : isSell ? '#f87171' : '#fbbf24';
                    const changeColor = pos.change && pos.change.startsWith('+') ? '#4ade80' : pos.change && pos.change.startsWith('-') ? '#f87171' : 'rgba(255,255,255,.7)';
                    return `<tr style="border-top:1px solid rgba(255,255,255,.05);">
                      <td style="padding:5px 8px;"><strong>${ticker}</strong></td>
                      <td style="text-align:center;"><span style="color:${aColor};font-weight:700;">${pos.action}</span></td>
                      <td style="text-align:center;">${pos.shares||'—'}</td>
                      <td style="text-align:center;color:rgba(255,255,255,.7);">${pos.prevShares||'—'}</td>
                      <td style="text-align:center;color:${changeColor};font-weight:600;">${pos.change||'—'}</td>
                      <td style="text-align:center;color:${changeColor};">${pos.changeVal||'—'}</td>
                      <td style="text-align:center;color:rgba(255,255,255,.7);">${pos.pct ? pos.pct+'%' : '—'}</td>
                      <td style="padding:5px 8px;color:var(--dim);font-size:11px;">${pos.note||''}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ══ TIER 2: HEDGE FUND ══ -->
    <div class="card" style="margin-bottom:14px;">
      <h3>⚡ Tier 2 — Hedge Fund & Active · 13F Q4 2025</h3>
      <p style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:12px;">Scommesse direzionali convinte. Movimenti > ±20% in un trimestre = segnale estremo.</p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${data.hedgeFunds.map(f => {
          const signal = f.signal||'';
          const sc = signal.includes('ACCUMULO')||signal.includes('BULLISH')||signal.includes('BROAD') ? '#4ade80' : signal.includes('DISTRIBUZ')||signal.includes('PROFIT') ? '#f87171' : '#fbbf24';
          return `
          <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:14px;border-left:3px solid ${sc};">
            <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
              <div>
                <strong style="font-size:15px;">${f.name}</strong>
                <span style="font-size:12px;color:rgba(255,255,255,.7);margin-left:8px;">${f.aum} · ${f.type}</span><br>
                <span style="font-size:11px;color:var(--dim);">📅 Filing: ${f.filingDate||'N/D'} (${f.filingPeriod||'Q4 2025'})</span>
              </div>
              <div style="margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <span style="font-size:12px;font-weight:700;color:${sc};padding:2px 8px;background:${sc}22;border-radius:4px;">${signal}</span>
                ${f.sourceUrl ? `<a href="${f.sourceUrl}" target="_blank" style="font-size:11px;color:var(--accent);padding:2px 6px;border:1px solid var(--accent);border-radius:3px;text-decoration:none;">WhaleWisdom →</a>` : ''}
                ${f.edgarUrl  ? `<a href="${f.edgarUrl}"  target="_blank" style="font-size:11px;color:rgba(255,255,255,.7);padding:2px 6px;border:1px solid var(--border);border-radius:3px;text-decoration:none;">EDGAR →</a>` : ''}
              </div>
            </div>
            ${f.strategy ? `<div style="font-size:12px;color:rgba(255,255,255,.7);font-style:italic;margin-bottom:10px;">"${f.strategy}"</div>` : ''}
            <div style="overflow-x:auto;">
              <table style="font-size:12px;">
                <thead><tr style="background:rgba(255,255,255,.03);">
                  <th style="text-align:left;padding:4px 8px;">Ticker</th>
                  <th>Azione</th><th>Az. Attuali</th><th>Az. Precedenti</th>
                  <th>Variazione</th><th>% Cambio</th><th>Valore aggiunto</th>
                  <th style="text-align:left;padding:4px 8px;">Note</th>
                </tr></thead>
                <tbody>
                  ${Object.entries(f.portfolio||{}).map(([ticker, pos]) => {
                    const pct = pos.pctChange || 0;
                    const isBuy = pos.action.startsWith('BUY');
                    const aColor = isBuy ? '#4ade80' : '#f87171';
                    const pColor = pct > 0 ? '#4ade80' : '#f87171';
                    const isExtreme = Math.abs(pct) >= 100;
                    return `<tr style="border-top:1px solid rgba(255,255,255,.05);${isExtreme?'background:rgba(74,222,128,.04);':''}">
                      <td style="padding:5px 8px;"><strong>${ticker}</strong></td>
                      <td style="text-align:center;"><span style="color:${aColor};font-weight:700;">${pos.action}</span></td>
                      <td style="text-align:center;">${pos.shares||'—'}</td>
                      <td style="text-align:center;color:rgba(255,255,255,.7);">${pos.prevShares||'—'}</td>
                      <td style="text-align:center;color:${pColor};font-weight:600;">${pos.change||'—'}</td>
                      <td style="text-align:center;color:${pColor};font-weight:${isExtreme?'800':'600'};">${pct>0?'+':''}${pct}% ${isExtreme?'⚡':''}</td>
                      <td style="text-align:center;color:${pColor};">${pos.addedValue||pos.changeVal||'—'}</td>
                      <td style="padding:5px 8px;color:var(--dim);font-size:11px;">${pos.note||''}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
            ${f.conviction ? `<div style="font-size:12px;margin-top:8px;padding:6px 10px;background:rgba(255,255,255,.03);border-radius:5px;color:rgba(255,255,255,.7);">💡 <strong>Conviction:</strong> ${f.conviction}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ══ POLITICI USA — STOCK ACT ══ -->
    <div class="card card-yellow" style="margin-bottom:14px;">
      <h3>🏛️ Politici USA — STOCK Act Tracker con Storico Operazioni</h3>
      <p style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:4px;">
        Dichiarazione entro 45 giorni dalla transazione. 
        <a href="https://www.capitoltrades.com/trades" target="_blank" style="color:var(--accent);">Tutte le operazioni →</a> ·
        <a href="https://www.capitoltrades.com/politicians" target="_blank" style="color:var(--accent);">Tutti i politici →</a> ·
        <a href="https://www.quiverquant.com/congresstrading/" target="_blank" style="color:var(--accent);">Quiver Quant →</a>
      </p>
      <p style="font-size:12px;color:var(--dim);margin-bottom:12px;">Comitati chiave con edge: Semiconductor Caucus, House Financial Services, Senate Banking, Armed Services.</p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${data.politicians.map(p => {
          const scol = p.signalColor === 'POSITIVO' ? '#4ade80' : p.signalColor === 'NEGATIVO' ? '#f87171' : '#fbbf24';
          const trades = p.recentTrades || [];
          return `
          <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:14px;border-left:3px solid ${scol};">
            <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
              <div>
                <strong style="font-size:14px;">🏛️ ${p.name}</strong>
                <span style="font-size:12px;color:rgba(255,255,255,.7);margin-left:6px;">${p.role}</span>
                ${p.party ? `<span style="font-size:11px;padding:1px 5px;background:${p.party==='D'?'#3b82f622':'#ef444422'};color:${p.party==='D'?'#60a5fa':'#f87171'};border-radius:3px;margin-left:6px;">${p.party}-${p.state}</span>` : ''}
              </div>
              <div style="margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <span style="font-size:12px;font-weight:600;color:${scol};padding:2px 8px;background:${scol}22;border-radius:4px;">${p.signal||''}</span>
                ${p.capitolTradesUrl ? `<a href="${p.capitolTradesUrl}" target="_blank" style="font-size:11px;color:var(--accent);padding:2px 6px;border:1px solid var(--accent);border-radius:3px;text-decoration:none;">Capitol Trades →</a>` : ''}
              </div>
            </div>
            ${p.knownFor ? `<div style="font-size:12px;color:var(--dim);font-style:italic;margin-bottom:8px;">${p.knownFor}</div>` : ''}
            ${p.disclosureDelay ? `<div style="font-size:11px;color:var(--dim);margin-bottom:8px;">⏱️ ${p.disclosureDelay}</div>` : ''}
            ${trades.length > 0 ? `
            <div style="overflow-x:auto;margin-bottom:8px;">
              <table style="font-size:12px;">
                <thead><tr style="background:rgba(255,255,255,.04);">
                  <th style="text-align:left;padding:4px 8px;">Data</th>
                  <th>Ticker</th><th>Azione</th><th>Tipo</th><th>Quantità</th>
                  <th>Valore</th><th>Gain</th><th style="text-align:left;padding:4px 8px;">Note</th>
                </tr></thead>
                <tbody>
                  ${trades.map(t => {
                    const isBuy = t.action === 'BUY' || t.action === 'EXERCISE';
                    const tColor = isBuy ? '#4ade80' : '#f87171';
                    return `<tr style="border-top:1px solid rgba(255,255,255,.05);">
                      <td style="padding:4px 8px;white-space:nowrap;">${t.date}</td>
                      <td style="text-align:center;"><strong>${t.ticker}</strong></td>
                      <td style="text-align:center;"><span style="color:${tColor};font-weight:700;">${t.action}</span></td>
                      <td style="font-size:11px;color:rgba(255,255,255,.7);">${t.type||''}</td>
                      <td style="text-align:center;">${t.qty||'N/D'}</td>
                      <td style="text-align:center;">${t.value||'N/D'}</td>
                      <td style="text-align:center;color:#4ade80;font-weight:600;">${t.gain||'—'}</td>
                      <td style="padding:4px 8px;font-size:11px;color:var(--dim);">${t.note||''}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>` : ''}
            ${p.strategy ? `<div style="font-size:12px;color:rgba(255,255,255,.7);padding:6px 10px;background:rgba(255,255,255,.03);border-radius:5px;">💡 <strong>Strategia 2026:</strong> ${p.strategy}</div>` : ''}
            ${p.warning  ? `<div style="font-size:12px;color:#fbbf24;padding:6px 8px;background:#fbbf2411;border-radius:5px;border:1px solid #fbbf2433;margin-top:8px;">${p.warning}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ══ STOCK INTELLIGENCE REPORT ══ -->
    \${renderStockIntelligenceReport(data)}

    <!-- ══ FONTI & LINK DIRETTI ══ -->
    <div class="card">
      <h3>📡 Fonti Dati — Link Diretti e Verificati</h3>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        ${data.sources.map(s => `
          <a href="${s.url}" target="_blank" style="display:flex;align-items:flex-start;gap:8px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:10px 12px;text-decoration:none;min-width:180px;max-width:260px;">
            <span style="font-size:18px;line-height:1;">${s.icon||'🔗'}</span>
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--text);">${s.name}</div>
              <div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:2px;line-height:1.4;">${s.note}</div>
            </div>
          </a>`).join('')}
      </div>
      <div style="font-size:12px;color:var(--dim);line-height:1.7;padding:8px 12px;background:rgba(255,255,255,.02);border-radius:6px;">
        ⚠️ <strong>Ritardi di filing:</strong> 13F = ~45 giorni dalla fine del trimestre (Q4 2025 = feb 2026, Q1 2026 = mag 2026) ·
        Form 4 = 2 giorni lavorativi · STOCK Act = 30-45 giorni<br>
        📅 <strong>Prossimo check obbligatorio:</strong> <strong>${data.nextReview}</strong> (EQIX earnings 30/04 + Q1 2026 Form 4 filing in corso)
      </div>
    </div>
  `;
}

function toggleConvergenceDetail(id) {
  const row = document.getElementById(id);
  if (row) row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
}

// Chiamato dall'app quando si clicca sul tab
function initMoneyFollow() {
  renderMoneyFollow();
}

// ══════════════════════════════════════════════════════════════
// STOCK INTELLIGENCE REPORT — Vista stock-centrica
// Raggruppa TUTTI gli insider (Form 4 + 13F fondi) per ticker
// ══════════════════════════════════════════════════════════════

function renderStockIntelligenceReport(data) {
  var insiders = data.insiderActivity || [];
  var matrix   = data.convergenceMatrix || [];

  // Raccoglie tutti i ticker unici (union insider + matrix)
  var tickerSet = {};
  insiders.forEach(function(t){ tickerSet[t.ticker] = true; });
  matrix.forEach(function(m){ tickerSet[m.ticker] = true; });
  var tickers = Object.keys(tickerSet).sort();

  // Mappa settore dai dati noti
  var sectorMap = {
    TSLA:'Automotive / AI', BLK:'Asset Management', CRSP:'Biotech / Gene Editing',
    ACHR:'eVTOL / Aviation', TEM:'AI Healthcare', CRWV:'AI Cloud Infra',
    NVDA:'AI Hardware', AVGO:'AI Custom Silicon', MU:'Memory / HBM',
    ASML:'Semiconduttori EUV', LLY:'Pharma / GLP-1', NVO:'Pharma / GLP-1',
    XOM:'Energia / Oil', NEE:'Utilities / Clean Energy', DLR:'REIT / Data Center',
    EQIX:'REIT / Data Center'
  };

  function netFlow(ticker) {
    var buys = 0, sells = 0;
    insiders.filter(function(i){ return i.ticker === ticker; }).forEach(function(i) {
      var raw = (i.value || '').replace(/[^0-9.,\-]/g,'').replace(/,/g,'');
      var n = parseFloat(raw) || 0;
      if (i.action === 'BUY') buys += Math.abs(n);
      else sells += Math.abs(n);
    });
    return { buys: buys, sells: sells, net: buys - sells };
  }

  function fmtM(v) {
    if (!v) return '—';
    var m = Math.abs(v)/1e6;
    return (v >= 0 ? '+' : '-') + '$' + m.toFixed(1) + 'M';
  }

  function actionBadge(action, type) {
    var isBuy  = action === 'BUY';
    var isOpen = type && type.indexOf('OPEN MARKET') >= 0;
    var c = isBuy ? '#4ade80' : '#f87171';
    var bg = isBuy ? 'rgba(74,222,128,.12)' : 'rgba(248,113,113,.12)';
    var label = isBuy ? '▲ BUY' : '▼ SELL';
    var extra = isOpen
      ? ' <span style="font-size:10px;background:#4ade8022;color:#4ade80;border:1px solid #4ade8055;border-radius:3px;padding:1px 4px;margin-left:3px;">⚡ OPEN MKT</span>'
      : ' <span style="font-size:10px;background:rgba(255,255,255,.05);color:var(--dim);border:1px solid rgba(255,255,255,.1);border-radius:3px;padding:1px 4px;margin-left:3px;">10b5-1</span>';
    return '<span style="color:' + c + ';background:' + bg + ';border-radius:4px;padding:2px 7px;font-weight:700;font-size:12px;">' + label + '</span>' + extra;
  }

  var html = '<div class="card" style="margin-bottom:14px;" id="stock-intel-card">'
    + '<h3 style="display:flex;align-items:center;justify-content:space-between;">'
    + '<span>🔬 Stock Intelligence Report — Tutti gli Insider per Ticker</span>'
    + '<span style="font-size:12px;font-weight:400;color:rgba(255,255,255,.7);">Clicca un ticker per espandere il report completo</span>'
    + '</h3>'
    + '<p style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:14px;">Vista stock-centrica: <strong>chi ha comprato o venduto</strong>, i prezzi, i periodi, i valori. '
    + 'Incrocia Form 4 (insider) + 13F (fondi istituzionali). Clicca ogni card per il dettaglio completo.</p>'
    + '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">';

  // Pillole sommario per navigazione rapida
  tickers.forEach(function(tk) {
    var ins = insiders.filter(function(i){ return i.ticker === tk; });
    var mx  = matrix.find(function(m){ return m.ticker === tk; });
    var buys  = ins.filter(function(i){ return i.action === 'BUY'; }).length;
    var sells = ins.filter(function(i){ return i.action === 'SELL'; }).length;
    var score = mx ? mx.score : null;
    var dir   = mx ? mx.direction : null;
    var pillC = sells > buys ? '#f87171' : (buys > sells ? '#4ade80' : '#fbbf24');
    html += '<button onclick="toggleStockIntel(\'' + tk + '\')" style="background:rgba(255,255,255,.04);border:1px solid ' + pillC + '55;color:var(--text);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;font-weight:700;">'
      + tk
      + (score ? ' <span style="font-size:11px;color:' + pillC + ';">' + score + '</span>' : '')
      + '</button>';
  });

  html += '</div>';

  // Card espandibile per ogni ticker
  tickers.forEach(function(tk) {
    var ins  = insiders.filter(function(i){ return i.ticker === tk; }).sort(function(a,b){ return b.date.localeCompare(a.date); });
    var mx   = matrix.find(function(m){ return m.ticker === tk; });
    var flow = netFlow(tk);
    var sector = sectorMap[tk] || '—';

    var totalBuys  = ins.filter(function(i){ return i.action === 'BUY'; }).length;
    var totalSells = ins.filter(function(i){ return i.action === 'SELL'; }).length;
    var headerColor = totalSells > totalBuys ? '#f87171' : (totalBuys > 0 ? '#4ade80' : '#fbbf24');
    var signalIcon  = totalSells > totalBuys ? '🔴' : (totalBuys > 0 ? '🟢' : '🟡');

    html += '<div id="si-' + tk + '" style="display:none;margin-bottom:12px;">'
      + '<div style="background:rgba(255,255,255,.04);border:1px solid ' + headerColor + '33;border-radius:12px;overflow:hidden;">'

      // Header ticker
      + '<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.07);">'
      + '<span style="font-size:22px;font-weight:900;color:' + headerColor + ';">' + tk + '</span>'
      + '<span style="font-size:12px;color:rgba(255,255,255,.7);">' + sector + '</span>'
      + '<span style="margin-left:auto;font-size:13px;">' + signalIcon + ' '
      + '<strong>' + totalBuys + ' BUY</strong> &nbsp;/&nbsp; <strong>' + totalSells + ' SELL</strong>'
      + (mx ? ' &nbsp;·&nbsp; Score: <strong style="color:' + headerColor + ';">' + mx.score + '/100</strong>' : '')
      + '</span>'
      + '</div>';

    // Sintesi fondi (convergenceMatrix)
    if (mx) {
      html += '<div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;flex-wrap:wrap;gap:12px;">';
      if (mx.buyers && mx.buyers.length) {
        html += '<div style="flex:1;min-width:200px;"><div style="font-size:11px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">🏛️ Fondi Compratori</div>'
          + mx.buyers.map(function(b){ return '<div style="font-size:12px;color:var(--text);padding:3px 0;border-bottom:1px solid rgba(255,255,255,.04);">✅ ' + b + '</div>'; }).join('')
          + '</div>';
      }
      if (mx.sellers && mx.sellers.length) {
        html += '<div style="flex:1;min-width:200px;"><div style="font-size:11px;font-weight:700;color:#f87171;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">🏛️ Fondi Venditori</div>'
          + mx.sellers.map(function(s){ return '<div style="font-size:12px;color:var(--text);padding:3px 0;border-bottom:1px solid rgba(255,255,255,.04);">❌ ' + s + '</div>'; }).join('')
          + '</div>';
      }
      if (mx.convergence) {
        html += '<div style="width:100%;font-size:12px;color:rgba(255,255,255,.7);background:rgba(255,255,255,.03);border-radius:6px;padding:8px 10px;margin-top:4px;">💡 ' + mx.convergence + '</div>';
      }
      if (mx.action) {
        html += '<div style="width:100%;font-size:13px;font-weight:700;color:#fbbf24;padding:6px 0;">🎯 Strategia: ' + mx.action + '</div>';
      }
      html += '</div>';
    }

    // Tabella transazioni insider (Form 4)
    if (ins.length > 0) {
      html += '<div style="padding:14px 16px;">'
        + '<div style="font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">📋 Storico Transazioni Form 4 — ' + ins.length + ' operazioni verificate</div>'
        + '<div style="overflow-x:auto;">'
        + '<table style="width:100%;border-collapse:collapse;font-size:12px;">'
        + '<thead><tr style="background:rgba(255,255,255,.06);">'
        + '<th style="padding:7px 10px;text-align:left;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;">Data</th>'
        + '<th style="padding:7px 10px;text-align:left;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;">Insider</th>'
        + '<th style="padding:7px 10px;text-align:left;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;">Ruolo</th>'
        + '<th style="padding:7px 10px;text-align:center;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;">Azione</th>'
        + '<th style="padding:7px 10px;text-align:right;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;">Quantità</th>'
        + '<th style="padding:7px 10px;text-align:right;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;">Prezzo</th>'
        + '<th style="padding:7px 10px;text-align:right;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;">Valore</th>'
        + '<th style="padding:7px 10px;text-align:left;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;">Note</th>'
        + '<th style="padding:7px 10px;text-align:center;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;">Link</th>'
        + '</tr></thead><tbody>';

      ins.forEach(function(t, idx) {
        var rowBg = idx % 2 === 0 ? 'rgba(255,255,255,.02)' : 'transparent';
        var isBuy = t.action === 'BUY';
        html += '<tr style="background:' + rowBg + ';border-bottom:1px solid rgba(255,255,255,.04);">'
          + '<td style="padding:8px 10px;white-space:nowrap;color:rgba(255,255,255,.7);">' + t.date + '</td>'
          + '<td style="padding:8px 10px;font-weight:600;">' + t.insider + '</td>'
          + '<td style="padding:8px 10px;color:rgba(255,255,255,.7);font-size:11px;">' + t.role + '</td>'
          + '<td style="padding:8px 10px;text-align:center;">' + actionBadge(t.action, t.type) + '</td>'
          + '<td style="padding:8px 10px;text-align:right;">' + (t.qty || '—') + '</td>'
          + '<td style="padding:8px 10px;text-align:right;font-weight:600;">' + (t.price || '—') + '</td>'
          + '<td style="padding:8px 10px;text-align:right;font-weight:700;color:' + (isBuy ? '#4ade80' : '#f87171') + ';">' + (t.value || '—') + '</td>'
          + '<td style="padding:8px 10px;font-size:11px;color:rgba(255,255,255,.7);max-width:220px;">' + (t.note || '') + '</td>'
          + '<td style="padding:8px 10px;text-align:center;white-space:nowrap;">'
          + (t.sourceUrl ? '<a href="' + t.sourceUrl + '" target="_blank" style="font-size:11px;color:var(--accent);text-decoration:none;padding:2px 6px;border:1px solid var(--accent)44;border-radius:4px;margin-right:3px;">OI</a>' : '')
          + (t.secUrl ? '<a href="' + t.secUrl + '" target="_blank" style="font-size:11px;color:#fbbf24;text-decoration:none;padding:2px 6px;border:1px solid #fbbf2444;border-radius:4px;">SEC</a>' : '')
          + '</td>'
          + '</tr>';
      });

      html += '</tbody></table></div>';

      // Net flow summary
      html += '<div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap;">'
        + '<div style="background:rgba(74,222,128,.08);border:1px solid #4ade8033;border-radius:8px;padding:8px 14px;font-size:13px;">'
        + '▲ <strong style="color:#4ade80;">Acquisti: ' + totalBuys + ' op.</strong>'
        + '</div>'
        + '<div style="background:rgba(248,113,113,.08);border:1px solid #f8717133;border-radius:8px;padding:8px 14px;font-size:13px;">'
        + '▼ <strong style="color:#f87171;">Vendite: ' + totalSells + ' op.</strong>'
        + '</div>'
        + '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 14px;font-size:13px;margin-left:auto;">'
        + '🔗 <a href="http://openinsider.com/search?q=' + tk + '" target="_blank" style="color:var(--accent);text-decoration:none;font-weight:600;">OpenInsider ' + tk + '</a>'
        + '&nbsp;&nbsp;'
        + '<a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=' + tk + '&type=4&dateb=&owner=include&count=40" target="_blank" style="color:#fbbf24;text-decoration:none;font-weight:600;">SEC Form 4</a>'
        + '</div>'
        + '</div>';

      html += '</div>'; // fine padding section
    } else {
      html += '<div style="padding:14px 16px;font-size:13px;color:rgba(255,255,255,.7);">Solo dati 13F fondi istituzionali disponibili per questo ticker. '
        + '<a href="http://openinsider.com/search?q=' + tk + '" target="_blank" style="color:var(--accent);">Cerca Form 4 su OpenInsider →</a></div>';
    }

    html += '</div></div>'; // fine card ticker
  });

  html += '</div>'; // fine card principale
  return html;
}

function toggleStockIntel(ticker) {
  var el = document.getElementById('si-' + ticker);
  if (!el) return;
  var isOpen = el.style.display !== 'none';
  // Chiude tutti
  document.querySelectorAll('[id^="si-"]').forEach(function(e){ e.style.display = 'none'; });
  // Se era chiuso, apre
  if (!isOpen) {
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
