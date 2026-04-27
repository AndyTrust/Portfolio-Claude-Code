# Portfolio Intelligence Dashboard — CLAUDE.md
# Istruzioni per Claude Code (VPS e Mac)

> Leggi questo file per intero prima di qualsiasi azione sul progetto.

---

## Chi sono e cosa fa questo progetto

Sono **Andrea** (@ItaloMarziano su Telegram/X). Questo è il mio portfolio di investimento personale.
La dashboard è un sito statico su GitHub Pages che monitora automaticamente:
- I miei **6 titoli reali**: TSLA, BLK, TEM, ACHR, CRSP, CRWV
- **Insider trading** (Form 4 SEC), **fondi 13F**, **politici STOCK Act**
- **Notizie geopolitiche** con impatto mercati (Trump, Iran, Taiwan, Fed...)
- **Prezzi live** aggiornati ogni ora dalla VPS via yfinance

---

## Struttura del progetto

```
~/Portfolio-Claude-Code/          ← repo GitHub
├── Protfolio.html               ← dashboard principale (typo intenzionale)
├── portfolio.html               ← gestione trade + P&L
├── screener.html                ← screener titoli
├── fondi.html                   ← insider + 13F fondi
├── money-follow.html            ← follow the money
├── intelligence.html            ← report intelligence
├── geopolitica.html             ← monitor geopolitico
├── reports.html                 ← report storici
├── css/styles.css               ← stili globali
├── js/                          ← tutti i renderer JS
├── shared/nav.js                ← navigazione condivisa
├── data/
│   ├── market_data.json         ← prezzi live (aggiornato ogni ora VPS)
│   ├── insider_data.json        ← Form 4 + convergenza (ogni 3gg)
│   ├── portfolio_pnl.json       ← P&L snapshot (ogni ora VPS)
│   ├── geopolitical_data.json   ← notizie geo/social (ogni ora VPS)
│   ├── sources.json             ← fonti verificate
│   └── portfolio_trades.json    ← PRIVATO (in .gitignore, solo VPS/Mac)
├── scripts/
│   ├── vps_hourly_monitor.py    ← prezzi + P&L + Telegram alert
│   ├── vps_social_geo_monitor.py ← Trump/X/news geo monitor
│   ├── vps_git_deploy.sh        ← auto commit+push GitHub
│   ├── fetch_all_daily.py       ← insider + 13F scraper
│   └── vps_setup.sh             ← installer VPS (run once)
├── reports/                     ← report markdown intelligence
├── .env                         ← PRIVATO: Telegram token (in .gitignore)
├── CLAUDE.md                    ← questo file
├── SKILL.md                     ← skill portfolio (Cowork)
└── VPS_SETUP.md                 ← guida VPS completa
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

## Portfolio — Trade reali

8 trade reali nel file `data/portfolio_trades.json` (solo VPS/Mac, non su GitHub):

| ID | Data | Tipo | Ticker | Azioni | Prezzo | Totale |
|----|------|------|--------|--------|--------|--------|
| T001 | 2025-11-07 | BUY | TSLA | 1.016 | $437.60 | $444.55 |
| T002 | 2026-01-22 | BUY | BLK | 0.220 | $1137.32 | $250.00 |
| T003 | 2026-03-24 | DIVIDEND | BLK | — | — | $1.06 |
| T004 | 2026-03-30 | BUY | TEM | 3.022 | $42.36 | $128.00 |
| T005 | 2026-04-09 | BUY | ACHR | 28.285 | $5.48 | $155.00 |
| T006 | 2026-04-09 | BUY | CRSP | 4.018 | $51.27 | $206.00 |
| T007 | 2026-04-15 | BUY | CRWV | 1.000 | $118.48 | $118.50 |
| T008 | 2026-04-23 | BUY | TSLA | 1.002 | $373.24 | $374.00 |

**Costo totale investito: $1,676.05** | Broker: Interactive Brokers / Freetrade

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
