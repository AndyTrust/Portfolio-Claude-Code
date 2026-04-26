---
name: perplexity-watchlist-ops
description: Guida operativa per scouting, aggiornamento e pulizia watchlist con Perplexity e sincronizzazione completa tra Screener, Operazioni e Portfolio. Include sistema completo Data Engine per export Excel, scraping, analisi giornaliera, tracker fondi/insider ogni 3 giorni.
---

# Portfolio Skill — Guida Operativa Completa

> **OBBLIGATORIO: Leggere per intero prima di qualsiasi modifica, analisi o esecuzione script.**

---

## PARTE 1 — REGOLA OPERATIVA

Prima di qualsiasi azione ogni agente deve:

1. Leggere interamente questo file
2. Verificare i file chiave in "Mappa File"
3. Confermare che la modifica mantiene la sincronizzazione tra moduli

---

## PARTE 2 — MAPPA FILE (architettura reale)

- App principale: `/Users/andrea140grammi/Desktop/Portfolio/Protfolio.html`
- Stato condiviso e dataset: `/Users/andrea140grammi/Desktop/Portfolio/js/state.js`
- Screener/watchlist: `/Users/andrea140grammi/Desktop/Portfolio/js/render-screener.js`
- Operazioni e storico: `/Users/andrea140grammi/Desktop/Portfolio/js/render-operazioni.js`
- Portfolio reale e KPI: `/Users/andrea140grammi/Desktop/Portfolio/js/render-portfolio.js`
- Modale analisi stock: `/Users/andrea140grammi/Desktop/Portfolio/js/render-modal.js`
- Intelligence/news: `/Users/andrea140grammi/Desktop/Portfolio/js/render-intelligence.js`
- Tracker fondi: `/Users/andrea140grammi/Desktop/Portfolio/js/render-fondi.js`
- Catalogo titoli esteso: `/Users/andrea140grammi/Desktop/Portfolio/js/stock-universe.js`
- Holder flow (generato): `/Users/andrea140grammi/Desktop/Portfolio/js/holder-flow-tracker.js`
- Settori online (generato): `/Users/andrea140grammi/Desktop/Portfolio/js/online-sector-map.js`
- Dati seed: `/Users/andrea140grammi/Desktop/Portfolio/js/data.js`
- Entrypoint: `/Users/andrea140grammi/Desktop/Portfolio/js/app.js`
- Stili: `/Users/andrea140grammi/Desktop/Portfolio/css/styles.css`
- File master: `/Users/andrea140grammi/Desktop/Portfolio/reports/stock_master_latest.json`

### Script (DATA ENGINE — nuovi)
- Bridge stato: `/Users/andrea140grammi/Desktop/Portfolio/scripts/state-bridge.js`
- Export Excel: `/Users/andrea140grammi/Desktop/Portfolio/scripts/export-xlsx.js`
- Scraping link: `/Users/andrea140grammi/Desktop/Portfolio/scripts/scrape-stock-links.js`
- Analisi giornaliera: `/Users/andrea140grammi/Desktop/Portfolio/scripts/daily-intelligence.js`
- Scanner fondi/insider: `/Users/andrea140grammi/Desktop/Portfolio/scripts/fund-insider-scan.js`
- Sync dati → HTML: `/Users/andrea140grammi/Desktop/Portfolio/scripts/sync-back.js`
- Job giornaliero: `/Users/andrea140grammi/Desktop/Portfolio/scripts/run-daily.sh`
- Job ogni 3 giorni: `/Users/andrea140grammi/Desktop/Portfolio/scripts/run-3days.sh`
- Installer daily launchd: `/Users/andrea140grammi/Desktop/Portfolio/scripts/install-daily-job.sh`
- Installer 3days launchd: `/Users/andrea140grammi/Desktop/Portfolio/scripts/install-3days-job.sh`

---

## PARTE 3 — ARCHITETTURA DATA ENGINE (flusso completo)

```
┌─────────────────────────────────────────────────────────────────┐
│                       Protfolio.html                            │
│  (Browser — localStorage: operazioni, fundData, sectors,        │
│   stockNotes, sourceUrls, sectorWeights, etc.)                  │
│                                                                 │
│  Pulsante "📤 Esporta Stato" → chiama exportStateToFile()       │
└────────────────────┬────────────────────────────────────────────┘
                     │ Download JSON
                     ▼
        reports/state_export_latest.json
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   export-xlsx.js        scrape-stock-links.js
   (storico Excel)       (scraping URL per stock)
          │                     │
          ▼                     ▼
  reports/storico_       reports/scraped_
  movimenti.xlsx         YYYYMMDD.json
                               │
          ┌────────────────────┘
          │
          ▼
   daily-intelligence.js ◄── WebSearch / Perplexity API
          │
          ▼
   reports/intelligence_YYYYMMDD.md
   reports/intelligence_YYYYMMDD.json
          │
          ▼
   fund-insider-scan.js ◄── SEC EDGAR 13F + Form 4
          │
          ▼
   reports/fund_insider_YYYYMMDD.md
   reports/holders_monitor_latest.json
   js/holder-flow-tracker.js (aggiornato)
          │
          ▼
   sync-back.js → aggiorna js/data.js NEWS_DB
                → aggiorna js/holder-flow-tracker.js
                → Protfolio.html ricarica dati live
```

---

## PARTE 4 — SINCRONIZZAZIONE MODULI HTML

### Screener → Operazioni
- I ticker presenti nei settori sono ricercabili in Operazioni.
- Lo stato stock (attivo/disattivo) influenza filtri e visualizzazione.

### Operazioni → Portfolio Reale
- Ogni acquisto/vendita aggiorna posizioni aperte, PMC, investito, P&L.
- Le modifiche operazione devono rigenerare subito tabella e KPI.

### Catalogo esteso → Screener/Operazioni
- Titoli non presenti in watchlist devono essere comunque ricercabili.
- Se un titolo viene usato in operazioni, classificazione settore automatica.

### Modale stock → Ricerca/analisi
- Se manca fundData completo, usare fallback con fonti esterne.
- Campo "🔗 Link Analisi" → si salva in sourceUrls[ticker] → usato da scrape-stock-links.js

### Intelligence → Portfolio
- NEWS_DB aggiornato da daily-intelligence.js via sync-back.js
- HOLDER_FLOW aggiornato da fund-insider-scan.js via sync-back.js
- Icone alert sui ticker in watchlist con forte movimento istituzionale

---

## PARTE 5 — WORKFLOW OPERATIVI

### 5A. Export Storico Excel (ON DEMAND)
```
1. Dashboard → clicca "📤 Esporta Stato"
2. Salva il file scaricato in reports/state_export_latest.json
3. node scripts/export-xlsx.js
4. → reports/storico_movimenti.xlsx
   Sheet "Tutti i Movimenti" · Sheet per ticker · Sheet "Portfolio Aperto" · Sheet "Statistiche"
```

### 5B. Scraping Link per Stock (ON DEMAND o GIORNALIERO)
```
1. Modal stock → inserire URL nel campo "🔗 Link Analisi"
2. Export stato (step 5A 1-2)
3. node scripts/scrape-stock-links.js [--ticker=TSLA]
4. → reports/scraped_YYYYMMDD.json
5. sync-back.js aggiorna fundData nel js/data.js
```

### 5C. Analisi Giornaliera Intelligenza (OGNI GIORNO — ore 07:00)
```
bash scripts/run-daily.sh
oppure manuale: node scripts/daily-intelligence.js --tickers=TSLA,NVDA,...

Cerca per ogni ticker attivo:
  · News ultime 24h
  · Movimenti insider (Form 4 SEC)
  · Revisioni analisti
  · Catalyst events
  · Earnings prossimi

Output:
  · reports/intelligence_YYYYMMDD.md
  · reports/intelligence_YYYYMMDD.json
  · js/data.js NEWS_DB aggiornato via sync-back.js
```

### 5D. Analisi Fondi & Insider (OGNI 3 GIORNI — ore 06:00)
```
bash scripts/run-3days.sh
oppure manuale: node scripts/fund-insider-scan.js --tickers=TSLA,NVDA,...

Il script:
  · Scarica 13F filings SEC (posizioni fondi trimestrali)
  · Scarica Form 4 (movimenti insider recenti)
  · Incrocia: quali fondi stanno comprando/vendendo
  · Identifica cluster acquisti/vendite istituzionali
  · Cross-reference con portfolio: evidenzia i ticker con forte movimento

Output:
  · reports/fund_insider_YYYYMMDD.md
  · reports/holders_monitor_YYYYMMDD.md
  · reports/holders_monitor_latest.json
  · js/holder-flow-tracker.js aggiornato
```

---

## PARTE 6 — WORKFLOW WATCHLIST (Perplexity)

1. Definisci tema e periodo (default 2-6 settimane).
2. Esegui ricerca Perplexity su catalizzatori, revisioni, insider, flussi.
3. Applica score (0-5): catalizzatori, qualita, liquidita, rischio, tesi.
4. Classifica:
   - `ADD`: score medio >= 3.5 e catalizzatore concreto
   - `MONITOR`: 2.5-3.4
   - `REMOVE`: < 2.5 o tesi invalidata
5. Aggiorna watchlist nei file UI, mantenendo coerenza settoriale.
6. Verifica ricerca ticker/nome e compilazione automatica in Operazioni.

### Query Perplexity consigliate
- `<TICKER> earnings guidance last 30 days`
- `<TICKER> institutional buying selling latest quarter`
- `<TICKER> insider buying Form 4 recent`
- `<SETTORE> best stocks momentum last month`
- `<THEME> winners losers this quarter`

---

## PARTE 7 — AUTOMAZIONE HOLDER FLOW (settimanale — esistente)

Script aggiornamento SEC:
```bash
node /Users/andrea140grammi/Desktop/Portfolio/scripts/update-holder-flow-sec.js --tickers=TSLA,NVDA,ASML,LLY,NVO,XOM,AVGO,EQIX,BLK
```

Installer job settimanale macOS:
```bash
bash /Users/andrea140grammi/Desktop/Portfolio/scripts/install-holder-flow-job.sh
```

---

## PARTE 8 — REGOLE ADD / REMOVE WATCHLIST

### ADD
- Almeno 2 fonti indipendenti coerenti
- Trigger monitorabile (30-90 giorni)
- Miglioramento reale della copertura opportunità

### REMOVE
- Nessun catalizzatore per >= 60 giorni
- Tesi smentita da dati aggiornati
- Rischio non coerente con obiettivo
- Duplicazione con titolo migliore già presente

---

## PARTE 9 — GUARDRAIL TECNICI

- Non introdurre nuove feature non richieste.
- Non rompere sincronizzazione tra Screener, Operazioni, Portfolio.
- Non lasciare titoli classificabili in `Altro` se mappabili.
- Non modificare struttura localStorage senza aggiornare state-bridge.js.
- Ogni script deve gestire il caso state_export_latest.json assente.
- Non sovrascrivere report storici (usare sempre YYYYMMDD nel nome).
- Prima di sync-back.js: backup automatico di js/data.js.
- Validare sempre: ricerca per nome/ticker, salvataggio operazione, aggiornamento KPI.

---

## PARTE 10 — DIPENDENZE NPM

```bash
cd /Users/andrea140grammi/Desktop/Portfolio
npm init -y
npm install xlsx node-fetch@2 cheerio
```
