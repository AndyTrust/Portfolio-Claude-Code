---
name: portfolio
description: >
  Gestisce il Portfolio Intelligence Dashboard 140 Grammi
  (VPS ~/Portfolio-Claude-Code / GitHub Pages). Usare SEMPRE per:
  "aggiorna portfolio", "aggiorna insider", "aggiorna dashboard",
  "aggiorna segnali", "aggiorna news", "aggiorna geopolitica",
  "aggiorna report intelligence", "aggiungi transazione", "log trade",
  "check insider", "portfolio status", "/portfolio". Sa: struttura completa
  VPS, come aggiornare TUTTI i contenuti del sito (data.js, intelligence-reports.js,
  GEOPOLITICAL_RISKS, NEWS_DB, MARKET_DATA), gestione git con VPS auto-commits,
  push su GitHub Pages, calcolo P&L reale, insider data SEC/OpenInsider.
---

# Portfolio Intelligence Skill — VPS Edition

Dashboard di investimento personale su GitHub Pages. Leggi tutto prima di agire.

## Repo e Paths

```
VPS: ~/Portfolio-Claude-Code/          ← repo git principale
GitHub Pages: https://andytrust.github.io/Portfolio-Claude-Code/
Dashboard: Protfolio.html (typo intenzionale)
```

## Struttura file JS — cosa aggiornare e dove

```
js/
├── data.js                  ← MARKET_DATA + NEWS_DB + GEOPOLITICAL_RISKS + segnali stock
├── intelligence-reports.js  ← Array INTELLIGENCE_REPORTS (report giornalieri markdown)
├── app.js                   ← _syncLiveData() — carica JSON live e aggiorna timestamp
├── render-geopolitica.js    ← legge GEOPOLITICAL_RISKS da data.js
├── render-reports.js        ← legge INTELLIGENCE_REPORTS, mostra "Live: YYYY-MM-DD"
├── render-intelligence.js   ← legge MARKET_DATA + NEWS_DB
└── render-money-follow.js   ← legge insider_data.json live

data/
├── market_data.json         ← prezzi live (aggiornato ogni ora VPS, struttura: {indices:[{symbol,name,price,value,change,direction}]})
├── insider_data.json        ← Form 4 + convergenza (ogni 3gg VPS)
├── portfolio_pnl.json       ← P&L snapshot (ogni ora VPS, struttura: {positions:{TSLA:{current_price,...}}, summary:{}})
└── geopolitical_data.json   ← news geo/social (ogni ora VPS, struttura: {items:[...]})
```

## Stock monitorati

**6 POSIZIONI REALI:**
| Ticker | Azioni | PMC | Costo totale |
|--------|--------|-----|-------------|
| TSLA | 2.018 az | ~$405 medio | $818.55 (T001+T008) |
| BLK | 0.220 az | $1,137.32 | $250.00 |
| TEM | 3.022 az | $42.36 | $128.00 |
| ACHR | 28.285 az | $5.48 | $155.00 |
| CRSP | 4.018 az | $51.27 | $206.00 |
| CRWV | 1.000 az | $118.48 | $118.50 |

**Investito totale: $1,676.05**

**10 WATCHLIST:** NVDA, AVGO, MU, ASML, LLY, NVO, XOM, NEE, DLR, EQIX

---

## PROCEDURA AGGIORNAMENTO COMPLETO (usa questa ogni sessione)

### Step 1 — Leggi i dati live dai JSON VPS

```python
import json

# Prezzi correnti
with open('data/market_data.json') as f: mkt = json.load(f)
for idx in mkt['indices']:
    print(f"{idx['name']}: {idx['value']} ({idx['change']})")
print("lastUpdated:", mkt['lastUpdated'])

# P&L posizioni
with open('data/portfolio_pnl.json') as f: pnl = json.load(f)
positions = pnl['positions']  # dict keyed by ticker
# Calcola P&L reale (portfolio_pnl.json spesso non ha pnl_pct)
PMC = {'TSLA':444.55+374.00, 'BLK':250.00, 'TEM':128.00, 'ACHR':155.00, 'CRSP':206.00, 'CRWV':118.50}
SHARES = {'TSLA':2.018, 'BLK':0.220, 'TEM':3.022, 'ACHR':28.285, 'CRSP':4.018, 'CRWV':1.000}
for t,shares in SHARES.items():
    price = positions.get(t, {}).get('current_price', 0)
    value = shares * price
    pnl_usd = value - PMC[t]
    pnl_pct = (pnl_usd/PMC[t])*100
    print(f"{t}: ${price:.2f} | P&L: ${pnl_usd:.2f} ({pnl_pct:.1f}%)")

# Insider data
with open('data/insider_data.json') as f: ins = json.load(f)
conv = ins.get('convergence', {})
print("StrongBuy:", conv.get('strongBuy'))
print("StrongSell:", conv.get('strongSell'))
for tx in ins.get('transactions', [])[:10]:
    print(f"  {tx.get('date')} {tx.get('ticker')} {tx.get('insider_name','?')} {tx.get('transaction_type','?')} qty:{tx.get('qty','?')} @${tx.get('price','?')}")
```

### Step 2 — Aggiorna i segnali in js/data.js

Per ogni ticker aggiorna:
- `signal`: "ACCUMULO" | "MISTO" | "DISTRIBUZIONE" | "SPECULATIVO"
- `signalColor`: "green" | "yellow" | "red"
- `lastUpdated`: data odierna ("DD/MM/YYYY")
- `description`: aggiorna con news recenti
- `insider[]`: aggiungi transazioni reali verificate

**Aggiorna tutti i lastUpdated in bulk:**
```bash
sed -i 's/lastUpdated: "25\/04\/2026"/lastUpdated: "DD\/MM\/YYYY"/g' js/data.js
# oppure qualsiasi data precedente
```

**Regole segnali basate su insider:**
- CEO/CFO compra open market → ACCUMULO (segnale forte)
- CEO/major shareholder vende open market (non 10b5-1) → DISTRIBUZIONE o MISTO
- Vendita 10b5-1 pianificata → non cambia segnale
- Multipli insider vendono simultaneamente → DISTRIBUZIONE

### Step 3 — Aggiorna MARKET_DATA in js/data.js

```javascript
// Usa i valori da market_data.json (leggili al Step 1)
const MARKET_DATA = {
  indices: [
    {name:"S&P 500",value:"$711.69",change:"-0.49%",direction:"down"},
    {name:"NASDAQ",value:"$657.55",change:"-1.01%",direction:"down"},
    {name:"VIX",value:"$17.90",change:"+0.39%",direction:"up"},
    {name:"EUR/USD",value:"$1.171",change:"+0.3%",direction:"up"},
    {name:"Oil WTI",value:"$139.60",change:"+3.62%",direction:"up"},
    {name:"Gold",value:"$421.91",change:"-0.5%",direction:"down"},
    {name:"BTC",value:"$77.034",change:"-1.2%",direction:"down"},
    {name:"US 10Y",value:"$86.37",change:"-0.1%",direction:"down"},
    // evento macro del giorno:
    {name:"FOMC",value:"HOLD",change:"29 apr — tassi invariati",direction:"up"},
    {name:"Sentiment",value:"RISK-ON",change:"descrizione breve",direction:"up"},
  ],
  sentiment: "RISK-ON BULLISH — descrizione sentiment del giorno",
  lastUpdated: "YYYY-MM-DDTHH:MM:SSZ"   // ISO format come il JSON VPS
};
```

**NOTA:** `_syncLiveData()` in app.js sostituisce `MARKET_DATA.indices` con il JSON live.
Il fallback hardcoded in data.js serve solo prima del fetch. Il `lastUpdated` ISO è quello mostrato nel badge.

### Step 4 — Aggiorna GEOPOLITICAL_RISKS in js/data.js

```javascript
const GEOPOLITICAL_RISKS = [
  {
    name: "Nome Rischio — Subtitle",
    severity: 9,          // 1-10
    probability: 75,      // %
    sectors: ["Energia ▲▲", "Tech ▼", "Trasporto ▼▼"],
    detail: "Descrizione aggiornata con dati di oggi. Citare numeri reali.",
    impact: "XOM: +X%. NVDA: -Y%. Impatto specifico per titolo."
  },
  // ...4 rischi totali
];
```

**Regola:** Aggiorna `detail` e `probability` con notizie di oggi. Il renderer mostra esattamente `GEOPOLITICAL_RISKS.length + " rischi monitorati"`.

### Step 5 — Aggiorna NEWS_DB in js/data.js

```javascript
// Aggiungi in cima all'array (id crescente, date decrescenti)
const NEWS_DB = [
  // ── DD MESE YYYY ──────────────────────────────────────────────
  {
    id: 30,                              // incrementa sempre
    date: "29/04/2026",                  // formato italiano
    title: "Titolo notizia",
    source: "Bloomberg|Reuters|SEC Form 4|Federal Reserve|...",
    category: "macro|geopolitica|insider|sector",
    impact: "alto|medio|basso",
    tickers: ["TSLA","BLK"],             // ticker impattati
    impactType: "positivo-broad|negativo-insider|positivo-energia|...",
    body: "Descrizione della notizia...",
    analysis: "Analisi dell'impatto sul portfolio...",
    actions: "Azione consigliata..."
  },
  // news precedenti...
];
```

### Step 6 — Aggiorna intelligence-reports.js con report di oggi

```python
import json

# Leggi il report markdown generato oggi
with open('reports/intelligence_YYYYMMDD.md') as f:
    raw_content = f.read()

# Aggiungi alla fine dell'array nel JS
with open('js/intelligence-reports.js', 'r') as f:
    content = f.read()

new_entry = ',\n  ' + json.dumps({"date": "YYYY-MM-DD", "raw": raw_content}, ensure_ascii=False)
new_content = content.replace('\n];', new_entry + '\n];')

with open('js/intelligence-reports.js', 'w') as f:
    f.write(new_content)

# Verifica
import re
dates = re.findall(r'"date": "\d{4}-\d{2}-\d{2}"', new_content)
print("Date presenti:", sorted(set(dates)))
```

**Il report markdown DEVE avere questa sezione per i segnali:**
```markdown
## 📋 Riepilogo Segnali

| Ticker | Prezzo | Segnale | Conviction |
|--------|--------|---------|------------|
| TSLA | $376.02 | 🟡 MISTO | ⭐⭐ |
| BLK | $1,049.76 | 🟡 MISTO | ⭐⭐ |
...
```
**NON mettere P&L come prezzo** — il renderer `renderReportSignalSummary()` mostra `cols[1]` come prezzo nella card. Usa il prezzo corrente del titolo.

### Step 7 — Syntax check e push

```bash
node --check js/data.js && echo "data.js OK"
node --check js/intelligence-reports.js && echo "intelligence-reports.js OK"
```

**Push con gestione VPS auto-commits:**

Il VPS fa auto-commit ogni :30 su `data/*.json` e `reports/*.md`. Se il push viene rifiutato:

```bash
# STRATEGIA: soft reset + riapplica i tuoi file
git stash  # salva modifiche unstaged

export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_portfolio -o StrictHostKeyChecking=no"
git fetch origin main
git reset --soft origin/main  # mantiene working tree, allinea HEAD

# Rimuovi dal staging i file privati
git restore --staged data/portfolio_trades.json scripts/crontab_vps.txt scripts/telegram_bot.py 2>/dev/null

# I tuoi file JS restano staged — verifica
git status --short | grep '^[MARD]'

git stash pop  # ripristina modifiche unstaged

# Commit + push
git commit -m "messaggio"
git push origin main
```

**File DA COMMITTARE:** `js/data.js`, `js/intelligence-reports.js`, `reports/intelligence_*.md`, `data/market_data.json`, `data/insider_data.json`, `data/portfolio_pnl.json`, `data/geopolitical_data.json`

**File MAI da committare:** `data/portfolio_trades.json`, `.env`, `data/real-trades.json`

---

## Aggiornamento segnali stock in data.js — struttura entry

```javascript
TICKER: {
  price: 376.02,              // prezzo corrente
  change: -2.65,              // variazione assoluta giornaliera
  range52w: "$290 – $490",
  pe: 75.4,
  fwdPe: 50.0,
  evEbitda: 60.0,
  marketCap: "$760 Mld",
  eps: "$4,99",
  dividend: "—",
  beta: 2.30,
  sector: "EV / Autonomous / AI",
  exchange: "NASDAQ",
  currency: "USD",
  description: "Aggiornato con news recenti. Citare eventi specifici (earnings, partnership, ecc.)",
  signal: "ACCUMULO",         // "ACCUMULO" | "MISTO" | "DISTRIBUZIONE" | "SPECULATIVO"
  signalColor: "green",       // "green" | "yellow" | "red"
  lastUpdated: "29/04/2026",  // aggiorna sempre alla data corrente
  buyers: [...],
  sellers: [...],
  insider: [
    {
      date: "2026-04-22",
      name: "David Ricks",
      role: "CEO",
      action: "ACQUISTO",     // "ACQUISTO" | "VENDITA"
      shares: 5000,
      price: 820.00,
      value: "$4,1M",
      note: "Acquisto open market. Segnale forte..."
    }
  ],
  targets: {low:700, avg:1050, high:1350, analysts:20, consensus:"BUY", consensusScore:85},
  technicals: {support:[340,310], resistance:[400,430], sma50:360, sma200:350, rsi:45, macd:"Neutral", volume:"80M", trend:"Laterale"}
}
```

---

## Come aggiornare Insider Data (OpenInsider + SEC Form 4)

**URL OpenInsider per singolo ticker:**
```
http://openinsider.com/search?q=TICKER
```

**Screener globale (730 giorni, tutti i tipi):**
```
http://openinsider.com/screener?s=TICKER&fd=730&xp=1&xs=1&xf=1&xm=1&xx=1&cnt=100
```

**SEC EDGAR Form 4 (ultimi N giorni):**
```
https://efts.sec.gov/LATEST/search-index?q=%22TICKER%22&forms=4&dateRange=custom&startdt=YYYY-MM-DD&enddt=YYYY-MM-DD
```

**Regole dati insider:**
- **Non inventare mai** dati insider. Solo da OpenInsider/SEC verificati.
- OPEN MARKET = segnale forte (discrezionale)
- 10b5-1 = pianificato, meno segnaletico
- CEO/CFO compra = ACCUMULO forte
- CEO/major shareholder vende open market = DISTRIBUZIONE o downgrade

---

## Come leggere P&L reale (portfolio_pnl.json ha struttura dict non list)

```python
import json
with open('data/portfolio_pnl.json') as f: pnl = json.load(f)
positions = pnl['positions']  # {TICKER: {current_price: ...}}
# ATTENZIONE: positions è un DICT, non una lista!
for ticker, pos in positions.items():
    print(f"{ticker}: ${pos.get('current_price', 0)}")
```

---

## Script VPS — comandi operativi

```bash
cd ~/Portfolio-Claude-Code
source ~/portfolio_venv/bin/activate

# Prezzi live + P&L + Telegram
python3 scripts/vps_hourly_monitor.py

# Monitor geopolitica
python3 scripts/vps_social_geo_monitor.py

# Insider + 13F (ogni 3gg)
python3 scripts/fetch_all_daily.py

# Auto-deploy (commit solo JSON modificati)
bash scripts/vps_git_deploy.sh

# Push manuale modifiche JS/HTML
export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_portfolio -o StrictHostKeyChecking=no"
git add js/data.js js/intelligence-reports.js
git commit -m "messaggio"
git push origin main
```

---

## Fonti dati primarie

| Fonte | URL | Cosa fornisce |
|-------|-----|---------------|
| OpenInsider | `http://openinsider.com/search?q=TICKER` | Form 4 per ticker |
| SEC EDGAR Form 4 | `https://efts.sec.gov/LATEST/search-index?q=%22TICKER%22&forms=4` | Filing ufficiali |
| SEC EDGAR RSS | `https://data.sec.gov/rss?cik=CIK&count=40` | Feed real-time |
| WhaleWisdom | `https://whalewisdom.com` | 13F fondi |
| Capitol Trades | `https://www.capitoltrades.com/trades` | STOCK Act politici |
| YFinance (VPS) | via `vps_hourly_monitor.py` | Prezzi live ogni ora |

---

## Checklist aggiornamento completo (copia-incolla ogni sessione)

```
[ ] 1. Leggi market_data.json → prezzi correnti
[ ] 2. Leggi portfolio_pnl.json → P&L posizioni
[ ] 3. Leggi insider_data.json → transazioni recenti + convergenza
[ ] 4. Aggiorna segnali ticker in js/data.js (signal, signalColor, description, insider[])
[ ] 5. Aggiorna lastUpdated di tutti i ticker → sed bulk
[ ] 6. Aggiorna MARKET_DATA.indices con prezzi di oggi
[ ] 7. Aggiorna GEOPOLITICAL_RISKS con eventi macro recenti
[ ] 8. Aggiungi NEWS_DB entries per oggi (id incrementale, date italiane)
[ ] 9. Genera/aggiorna report markdown in reports/intelligence_YYYYMMDD.md
      - Tabella "Riepilogo Segnali" con PREZZI REALI (non P&L!)
      - Sezione Portfolio P&L con calcoli corretti
      - Alert insider recenti
[ ] 10. Aggiungi report a js/intelligence-reports.js (Python script)
[ ] 11. node --check js/data.js && node --check js/intelligence-reports.js
[ ] 12. git add js/data.js js/intelligence-reports.js reports/intelligence_YYYYMMDD.md
[ ] 13. git commit + push (usa strategia soft-reset se rejected)
[ ] 14. Attendi ~2 min e verifica su GitHub Pages
```

---

## Errori comuni da evitare

1. **P&L come prezzo nella tabella Riepilogo Segnali** → mostra "$-8,739" invece di "$1,049.76". Il renderer legge `cols[1]` dalla tabella MD.
2. **`portfolio_pnl.json` positions è un dict**, non una lista → `for ticker, pos in positions.items()`
3. **Push rejected** → VPS auto-commit ogni :30. Usa `git reset --soft origin/main` (non rebase).
4. **intelligence-reports.js: file enorme** → Non aprire con Read, usa grep/python per modifiche.
5. **lastUpdated non aggiornati** → usa `sed -i` bulk per aggiornare tutte le date in data.js.
6. **GEOPOLITICAL_RISKS hardcoded** → Il renderer legge l'array JS, non il JSON. Aggiorna data.js.
7. **NEWS_DB è hardcoded** → Stesso: aggiorna in data.js, non nei JSON VPS.
