# 📊 Portfolio Intelligence Dashboard — PRO v4.0

Dashboard personale di analisi degli investimenti, costruita con Claude in Cowork mode.
Aggiornamento **giornaliero automatico** tramite Claude Code + GitHub Actions.

## 🌐 Live Demo

**[→ Apri il Dashboard](https://andytrust.github.io/Portfolio-Claude-Code/)**

---

## 🎯 Filosofia

Il dashboard **non è limitato a una lista fissa di titoli**. Ogni giorno analizza i migliori stock sulla base di:
- **Insider activity** — Form 4 SEC, cluster buys, movimenti sospetti
- **Fondi istituzionali** — 13F filing, posizioni hedge fund, sovereign wealth
- **News e sentiment** — Reuters, Bloomberg, FT, Perplexity Finance
- **Analisi tecnica** — supporti/resistenze, gap prezzo, trend
- **Valutazione** — titoli sotto/sopravvalutati rispetto al settore
- **Politici USA (STOCK Act)** — Capitol Trades, 45gg dalla transazione

Il portafoglio speculativo viene aggiornato automaticamente da Claude Code ogni giorno, con ricerche incrociate su tutte le fonti per identificare opportunità. I titoli monitorati cambiano nel tempo seguendo i flussi di capitale.

---

## 📁 Pagine del Dashboard

| Pagina | Descrizione |
|--------|-------------|
| **Portfolio** | Gestione storico trade: inserimento acquisti/vendite/dividendi, P&L live, export Excel |
| **Screener** | Screener titoli multi-settore, filtri per momentum/valutazione/insider |
| **Intelligence** | Market pulse, news aggregate, sentiment, Polymarket, eventi macro |
| **Geopolitica** | Risk monitor globale, conflitti, banche centrali, commodity, calendario macro |
| **Reports** | Intelligence reports giornalieri/settimanali/mensili con calendario interattivo |
| **Money Follow** | Form 4 insider daily, 13F fondi istituzionali, STOCK Act politici USA, convergenza smart money |
| **Fondi** | Heatmap fondi × titoli, posizioni hedge fund, analyst targets, 13F quarterly |

---

## 📡 Fonti Dati — Link Diretti e Verificati

### 🏛️ SEC EDGAR — Ufficiale
| Fonte | Link | Tipo |
|-------|------|------|
| Form 4 TSLA | [edgar.sec.gov](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=TSLA&type=4&dateb=&owner=include&count=40) | Insider activity ufficiale |
| Form 4 — Ricerca custom | [EFTS API](https://efts.sec.gov/LATEST/search-index?q=&forms=4&dateRange=custom&startdt=2026-04-01&enddt=2026-04-30) | Tutti i Form 4 per periodo |
| 13F Q1 2026 | [EFTS 13F](https://efts.sec.gov/LATEST/search-index?q=&forms=13F-HR&dateRange=custom&startdt=2026-04-01&enddt=2026-05-15) | Fondi istituzionali trimestrale |
| RSS Insider feed | [SEC RSS](https://data.sec.gov/rss?cik=0001972928&count=40) | Real-time insider filings |

### 📋 OpenInsider — Form 4 per Ticker
| Ticker | Link OpenInsider |
|--------|-----------------|
| TSLA | [openinsider.com/screener?s=tsla](http://openinsider.com/screener?s=tsla&fd=730&xp=1&xs=1&xf=1&xm=1&xx=1&cnt=100) |
| BLK | [openinsider.com/search?q=BLK](http://openinsider.com/search?q=BLK) |
| CRSP | [openinsider.com/search?q=CRSP](http://openinsider.com/search?q=CRSP) |
| ACHR | [openinsider.com/search?q=ACHR](http://openinsider.com/search?q=ACHR) |
| TEM | [openinsider.com/search?q=TEM](http://openinsider.com/search?q=TEM) |
| CRWV | [openinsider.com/search?q=CRWV](http://openinsider.com/search?q=CRWV) |
| NVDA | [openinsider.com/search?q=NVDA](http://openinsider.com/search?q=NVDA) |
| AVGO | [openinsider.com/search?q=AVGO](http://openinsider.com/search?q=AVGO) |
| MU | [openinsider.com/search?q=MU](http://openinsider.com/search?q=MU) |
| ASML | [openinsider.com/search?q=ASML](http://openinsider.com/search?q=ASML) |
| LLY | [openinsider.com/search?q=LLY](http://openinsider.com/search?q=LLY) |
| NVO | [openinsider.com/search?q=NVO](http://openinsider.com/search?q=NVO) |
| XOM | [openinsider.com/search?q=XOM](http://openinsider.com/search?q=XOM) |
| NEE | [openinsider.com/search?q=NEE](http://openinsider.com/search?q=NEE) |
| DLR | [openinsider.com/search?q=DLR](http://openinsider.com/search?q=DLR) |
| EQIX | [openinsider.com/search?q=EQIX](http://openinsider.com/search?q=EQIX) |
| **Cluster Buys 30gg** | [screener cluster](http://openinsider.com/screener?fd=30&xp=1&nfh=2&nil=2&cnt=100) |
| **Full Screener 730gg** | [screener full](http://openinsider.com/screener?fd=730&xp=1&xs=1&xf=1&xm=1&xx=1&cnt=100) |

### 🏛️ Politici USA — STOCK Act
| Fonte | Link | Descrizione |
|-------|------|-------------|
| Capitol Trades Live | [capitoltrades.com/trades](https://www.capitoltrades.com/trades) | Lista live completa, filtro ticker/partito/data |
| Capitol Trades — NVDA | [issuers/433770](https://www.capitoltrades.com/issuers/433770) | Chi tra i politici ha operato su NVIDIA |
| Quiver Quant Congress | [quiverquant.com](https://www.quiverquant.com/congresstrading/) | Visualizzazione grafica trade congressisti |
| Unusual Whales Hub | [unusualwhales.com](https://unusualwhales.com/institutions) | Istituzionali + insider + politici hub |

### 🏦 Fondi Istituzionali — 13F Analysis
| Fonte | Link | Tipo |
|-------|------|------|
| WhaleWisdom | [whalewisdom.com](https://whalewisdom.com/) | 13F per fondo e per ticker, storico attività |
| HedgeFollow | [hedgefollow.com](https://hedgefollow.com/) | Tutti i fondi con posizioni su ticker specifico |
| Unusual Whales | [unusualwhales.com](https://unusualwhales.com/institutions) | Istituzionali + insider in un unico hub |

### 📈 Finance per Ticker
Ogni ticker include link diretti a:
- `https://finance.yahoo.com/quote/{TICKER}` — dati fondamentali e opzioni
- `https://www.perplexity.ai/finance/{TICKER}` — AI finance analysis
- `https://www.perplexity.ai/finance/{TICKER}/news` — news aggregate AI
- `https://finviz.com/quote.ashx?t={TICKER}` — analisi tecnica, short float, screener
- `https://openinsider.com/search?q={TICKER}` — Form 4 insider diretto

---

## 🤖 Aggiornamenti Automatici

| Frequenza | Cosa si aggiorna |
|-----------|-----------------|
| **Ogni giorno** (08:00 CET, lun-ven) | Form 4 da OpenInsider + SEC · Trade politici Capitol Trades · Prezzi mercato e indici · Intelligence report giornaliero |
| **Ogni lunedì** | Report settimanale — riepilogo movimenti + outlook settimana |
| **Ogni trimestre** | 13F fondi istituzionali (45gg dalla fine trimestre) |
| **Ogni 3 giorni** | Analisi convergenza smart money, crosscheck fondi/insider |

### Script `scripts/fetch_all_daily.py`
Eseguito ogni mattina da Claude Code:
1. Scraping OpenInsider per tutti i ticker monitorati (ultimi 30gg)
2. API pubblica SEC EDGAR EFTS per Form 4 ufficiali
3. Scraping Capitol Trades per trade politici
4. Calcolo convergenza smart money (strongBuy / strongSell / neutral)
5. Aggiornamento `data/insider_data.json` e `data/market_data.json`
6. Generazione `reports/intelligence_YYYYMMDD.md` se non esiste
7. Commit + push su GitHub via SSH deploy key automatico

---

## 🎯 Titoli Monitorati

Il dashboard **non è limitato** a questi titoli — vengono aggiornati man mano che emergono segnali.

**Posizioni aperte:** TSLA · BLK · CRSP · ACHR · TEM · CRWV

**Watchlist attiva:** NVDA · AVGO · MU · ASML · LLY · NVO · XOM · NEE · DLR · EQIX

**Macro e indici:** SPY · QQQ · GLD · USO · TLT · EUR/USD · US10Y · VIX

**Materie prime:** Petrolio WTI · Gas Naturale · Oro · Rame · Uranio · Grano

**Monitorati per opportunità:** qualsiasi stock con segnale insider + convergenza istituzionale + catalizzatore identificato

---

## 🏗️ Architettura Tecnica

```
Portfolio/
├── Protfolio.html              # App principale multi-tab
├── portfolio.html              # Storico trade + export Excel
├── intelligence.html           # Market pulse + Polymarket
├── geopolitica.html            # Rischio geopolitico globale
├── reports.html                # Reports (daily/weekly/monthly + calendario)
├── money-follow.html           # Form 4 + 13F + STOCK Act
├── fondi.html                  # Heatmap fondi + analyst targets
├── data/
│   ├── insider_data.json       # Transazioni insider (aggiornato giornalmente)
│   ├── market_data.json        # Prezzi e indici (aggiornato giornalmente)
│   ├── portfolio_trades.json   # Storico trade personale
│   └── sources.json            # Catalogo completo fonti verificate
├── reports/
│   ├── intelligence_YYYYMMDD.md      # Report giornalieri
│   ├── intelligence_weekly_*.md      # Report settimanali
│   └── intelligence_monthly_*.md     # Report mensili
├── scripts/
│   └── fetch_all_daily.py      # Scraper OpenInsider/SEC/CapitolTrades
├── shared/nav.js               # Navigazione condivisa auto-inject
├── js/                         # Renderer JS per ogni pagina
└── css/styles.css              # Design system 140 Grammi
```

Dashboard **statico HTML/JS** — nessun backend, nessuna API key esposta pubblicamente.
Deploy automatico via GitHub Pages + GitHub Actions.

---

## ⚠️ Disclaimer

Strumento di analisi personale per @ItaloMarziano. Non costituisce consulenza finanziaria.
I dati sono a scopo informativo. Investire comporta rischi.

*Costruito con [Claude](https://claude.ai) in Cowork mode · 140 Grammi Design System*
