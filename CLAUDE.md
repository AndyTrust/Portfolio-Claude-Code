# Portfolio Intelligence Dashboard — CLAUDE.md
# Istruzioni per Claude Code (VPS e Mac)

> Leggi questo file per intero prima di qualsiasi azione sul progetto.

---

## Chi sono e cosa fa questo progetto

Sono **Andrea** (@ItaloMarziano su Telegram/X). Questo è un sistema di analisi finanziaria con **portfolio virtuale** da $10,000.
La dashboard è un sito statico su GitHub Pages che monitora automaticamente:
- **Portfolio virtuale $10K**: NVDA (4az), LLY (1az), AVGO (2az), XOM (5az) + $6,657 cash
- **Insider trading** (Form 4 SEC), **fondi 13F**, **politici STOCK Act**
- **Capital Flow Intelligence**: quantifica i capitali mossi dagli insider
- **Notizie geopolitiche** con impatto mercati
- **Prezzi live** aggiornati ogni ora dalla VPS via yfinance
- **Report X.com**: thread pronti + articoli long-form per pubblicazione

> ⚠️ Il portfolio è VIRTUALE (non reale). Non ci sono posizioni personali reali.
> I dati precedenti (TSLA/BLK/TEM/ACHR/CRSP/CRWV) sono stati rimossi il 18/05/2026.

---

## Struttura del progetto

```
~/Portfolio-Claude-Code/          ← repo GitHub Pages (v5.0)
├── index.html                   ← dashboard principale (overview mercati)
├── portfolio.html               ← portfolio virtuale $10K (posizioni + trade log)
├── screener.html                ← screener titoli
├── intelligence.html            ← insider + 13F + capital flow + geo (CONSOLIDATA)
├── reports.html                 ← report X.com thread + articoli + archivio
│
│   [redirect → pagine consolidate]
├── Protfolio.html               ← redirect → index.html
├── fondi.html                   ← redirect → intelligence.html
├── geopolitica.html             ← redirect → intelligence.html
├── money-follow.html            ← redirect → intelligence.html
│
├── css/styles.css               ← stili globali
├── js/                          ← renderer JS (data.js, intelligence-reports.js...)
├── shared/nav.js                ← navigazione v5.0 (4 voci clean)
├── data/
│   ├── virtual_portfolio.json   ← Portfolio $10K VIRTUALE (aggiornato ogni ora VPS)
│   ├── market_data.json         ← prezzi live NVDA/LLY/AVGO/XOM + indici
│   ├── insider_data.json        ← Form 4 + convergenza (ogni 3gg VPS)
│   ├── portfolio_pnl.json       ← P&L snapshot legacy (manteniamo per compatibilità)
│   └── geopolitical_data.json   ← notizie geo/social (ogni ora VPS)
├── scripts/
│   ├── vps_hourly_monitor.py    ← prezzi NVDA/LLY/AVGO/XOM + aggiorna virtual_portfolio.json
│   ├── vps_social_geo_monitor.py ← news geo monitor
│   ├── vps_git_deploy.sh        ← auto commit+push GitHub
│   ├── fetch_all_daily.py       ← insider Form 4 scraper
│   └── fetch_insider.py         ← insider per ticker
├── reports/                     ← report markdown intelligence
├── .env                         ← PRIVATO: Telegram token (in .gitignore)
└── CLAUDE.md                    ← questo file
```

---

## VPS — Accesso e operazioni

```
IP:    82.29.179.90
User:  root
```

```bash
# Connetti alla VPS
ssh root@82.29.179.90

# Directory principale
cd ~/Portfolio-Claude-Code

# Attiva virtual env Python
source ~/portfolio_venv/bin/activate
```

### Comandi operativi VPS

```bash
# Fetch prezzi live + P&L + Telegram alert
python scripts/vps_hourly_monitor.py

# Monitor geopolitica (Trump, Iran, X, RSS)
python scripts/vps_social_geo_monitor.py

# Insider + 13F scraper (ogni 3gg)
python scripts/fetch_all_daily.py

# Git commit + push su GitHub
bash scripts/vps_git_deploy.sh

# Controlla log
tail -f ~/portfolio_logs/hourly.log
tail -f ~/portfolio_logs/social.log
tail -f ~/portfolio_logs/deploy.log

# Verifica crontab attivo
crontab -l
```

---

## GitHub — Workflow commit e deploy

Il repo è: `git@github.com:AndyTrust/Portfolio-Claude-Code.git`
Il sito live è: `https://andytrust.github.io/Portfolio-Claude-Code/`

**MAI committare:**
- `data/portfolio_trades.json` (trade reali con prezzi/lotti)
- `data/real-trades.json`
- `.env` (Telegram token)
- `data/portfolio_storico.csv`

**Workflow corretto dalla VPS** (usa ssh key `~/.ssh/id_portfolio`):

```bash
# Auto-deploy (committà solo JSON aggiornati)
bash scripts/vps_git_deploy.sh

# Oppure manuale per modifiche al codice:
export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_portfolio -o StrictHostKeyChecking=no"
git add <files>
git commit -m "descrizione"
git push origin main
```

**Workflow dal Mac** (usa la deploy key in Desktop/Portfolio/.ssh/id_deploy):

```bash
cd ~/Desktop/Portfolio
GIT_SSH_COMMAND="ssh -i .ssh/id_deploy -o StrictHostKeyChecking=no" git push origin <hash>:refs/heads/main
```

---

## Portfolio Virtuale — $10,000 (avviato 18/05/2026)

Dati in `data/virtual_portfolio.json` (committato su GitHub — è virtuale, non privato):

| ID | Data | Ticker | Az. | Entry | Costo | Segnale |
|----|------|--------|-----|-------|-------|---------|
| VP001 | 18/05/2026 | NVDA | 4 | $225.32 | $901.28 | ACCUMULO |
| VP002 | 18/05/2026 | LLY  | 1 | $883.89 | $883.89 | ACCUMULO |
| VP003 | 18/05/2026 | AVGO | 2 | $404.00 | $808.00 | ACCUMULO |
| VP004 | 18/05/2026 | XOM  | 5 | $150.00 | $750.00 | ACCUMULO |

**Investito: $3,343.17 (33.4%)** | **Cash: $6,656.83 (66.6%)** | **Totale: $10,000**

**Watch Queue** (in attesa del trigger): ASML (<$1,100), EQIX (<$950), JPM (<$230)

**Strategia DCA multi-fase:**
- Fase 2: +$2,000 se S&P -5% o posizione -10%
- Fase 3: +$1,500 su nuovo segnale insider forte
- Cash minima sempre: 20%

---

## Telegram — Notifiche

```
Bot: @PortfolioClaude_bot
Chat ID: 320293500
Token: nel file .env (non condividere)
```

Alert automatici:
- Ogni ora: P&L + variazioni > 2%
- Alert urgente: Trump posts, escalation militare
- Market intel: notizie filtrate con impatto portfolio

---

## Crontab attivo (Mon-Fri 06:00-01:59)

```
0 0-1,6-23 * * 1-5   vps_hourly_monitor.py      # prezzi :00
5 0-1,6-23 * * 1-5   vps_social_geo_monitor.py  # geo :05
0 7 */3 * 1-5        fetch_all_daily.py          # insider 07:00
30 0-1,6-23 * * 1-5  vps_git_deploy.sh           # push :30
```

---

## Regole operative

1. **Non inventare dati** — solo fonti reali (OpenInsider, SEC EDGAR, Capitol Trades)
2. **Non committare dati sensibili** — portfolio_trades.json, .env sono privati
3. **Dopo ogni modifica HTML/JS** → push su GitHub → Pages si aggiorna in ~2min
4. **Per aggiungere un trade** → modifica `data/portfolio_trades.json` sulla VPS
5. **Per analisi insider** → usa `scripts/fetch_all_daily.py` che aggiorna `data/insider_data.json`
6. **Il sito è read-only per visitatori** — solo il proprietario può pushare

---

## Fonti dati principali

| Fonte | URL | Cosa fornisce |
|-------|-----|---------------|
| OpenInsider | `http://openinsider.com/search?q=TICKER` | Form 4 per ticker |
| SEC EDGAR | `https://efts.sec.gov/LATEST/search-index?q=%22TICKER%22&dateRange=custom&startdt=2026-01-01&forms=4` | Form 4 ufficiali |
| Capitol Trades | `https://www.capitoltrades.com/trades` | STOCK Act politici |
| WhaleWisdom | `https://whalewisdom.com` | 13F fondi |
| Truth Social API | `https://truthsocial.com/api/v1/accounts/lookup?acct=realDonaldTrump` | Trump posts |
| Reuters RSS | `https://feeds.reuters.com/reuters/businessNews` | Business news |
| Google News RSS | `https://news.google.com/rss/search?q=QUERY` | Notizie per keyword |
