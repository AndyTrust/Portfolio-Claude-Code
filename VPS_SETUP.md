# 🖥️ VPS Setup — Portfolio Intelligence Dashboard

Guida completa per spostare tutto il monitoraggio automatico sulla VPS.

---

## Architettura

```
VPS (Linux)
├── Portfolio-Claude-Code/          ← clone del repo GitHub
│   ├── scripts/
│   │   ├── vps_setup.sh            ← installazione completa (run once)
│   │   ├── vps_hourly_monitor.py   ← prezzi + P&L ogni ora
│   │   ├── vps_social_geo_monitor.py ← Trump/X/news ogni ora
│   │   ├── vps_git_deploy.sh       ← commit + push su GitHub
│   │   └── fetch_all_daily.py      ← insider + 13F ogni 3 giorni
│   └── .env                        ← secrets (Telegram token, ecc.)
│
├── portfolio_venv/                 ← Python virtual environment
└── portfolio_logs/                 ← log files
        ├── hourly.log
        ├── social.log
        ├── insider.log
        └── deploy.log
```

**Flusso dati:**
```
VPS monitor → aggiorna data/*.json → git push → GitHub Pages
                                               ↓
                                    Dashboard aggiornata in ~1min
```

---

## Step 1 — Requisiti VPS

- Ubuntu 20.04 o 22.04 (o Debian 11+)
- RAM: minimo 512MB (1GB raccomandato)
- Disco: 2GB liberi
- Python 3.8+
- Accesso SSH alla VPS

**Provider consigliati:** Hetzner (€4/mese), DigitalOcean ($6/mese), Vultr ($6/mese)

---

## Step 2 — Setup iniziale (una sola volta)

```bash
# 1. Connettiti alla VPS
ssh root@IP_DELLA_TUA_VPS

# 2. Scarica e avvia lo script di setup
curl -O https://raw.githubusercontent.com/AndyTrust/Portfolio-Claude-Code/main/scripts/vps_setup.sh
bash vps_setup.sh
```

Lo script fa tutto automaticamente:
- Installa Python, pip, dipendenze
- Crea virtual environment
- Genera SSH key per GitHub
- Clona il repo
- Crea il file `.env`
- Installa il crontab

---

## Step 3 — Aggiungi Deploy Key su GitHub

Lo script genera una chiave SSH e mostra la chiave pubblica.
Vai su GitHub e aggiungila come **Deploy Key con permessi di scrittura**:

```
https://github.com/AndyTrust/Portfolio-Claude-Code/settings/keys
→ "Add deploy key"
→ Title: "VPS Deploy Key"
→ Incolla la chiave pubblica mostrata dallo script
→ ✅ Spunta "Allow write access"
```

---

## Step 4 — Configura Telegram (per le notifiche)

### 4a. Crea il bot
1. Apri Telegram → cerca `@BotFather`
2. Scrivi `/newbot`
3. Dai un nome (es: `PortfolioMonitorBot`)
4. Copia il **token API** (es: `7362891045:AAF_abc123xyz...`)

### 4b. Ottieni il tuo chat_id
1. Manda un messaggio qualsiasi al tuo bot appena creato
2. Vai su questo URL (sostituisci TOKEN):
   `https://api.telegram.org/botTOKEN/getUpdates`
3. Cerca `"chat": {"id": 123456789}` → quel numero è il tuo `chat_id`

### 4c. Configura .env
```bash
nano ~/Portfolio-Claude-Code/.env
```

```env
TELEGRAM_BOT_TOKEN=7362891045:AAF_abc123xyz...
TELEGRAM_CHAT_ID=123456789
PRICE_ALERT_THRESHOLD=2.0
```

---

## Step 5 — Test manuale

```bash
# Attiva virtual env
source ~/portfolio_venv/bin/activate

# Test prezzi + P&L
python ~/Portfolio-Claude-Code/scripts/vps_hourly_monitor.py

# Test social + geo monitor
python ~/Portfolio-Claude-Code/scripts/vps_social_geo_monitor.py

# Test git deploy
bash ~/Portfolio-Claude-Code/scripts/vps_git_deploy.sh

# Controlla log
tail -f ~/portfolio_logs/hourly.log
tail -f ~/portfolio_logs/social.log
```

---

## Crontab — Orario di funzionamento

| Script | Frequenza | Quando |
|--------|-----------|--------|
| `vps_hourly_monitor.py` | Ogni ora :00 | Mon-Fri, 06:00-01:59 |
| `vps_social_geo_monitor.py` | Ogni ora :05 | Mon-Fri, 06:00-01:59 |
| `fetch_all_daily.py` | Ogni 3 giorni 07:00 | Mon-Fri |
| `vps_git_deploy.sh` | Ogni ora :30 | Mon-Fri, 06:00-01:59 |
| Cleanup log | Settimanale | Domenica 03:00 |

**Ore escluse:** 02:00-05:59 (notte) + Sabato e Domenica

Controlla il crontab:
```bash
crontab -l
```

---

## Dati monitorati

### Prezzi (yfinance — Yahoo Finance, gratis)
| Simbolo | Descrizione |
|---------|-------------|
| TSLA, BLK, TEM, ACHR, CRSP, CRWV | Portfolio positions |
| NVDA | Watchlist |
| SPY, QQQ, ^VIX | Indici principali |
| GLD, USO, TLT, EURUSD=X, BTC-USD | Macro |

### Social & Geopolitica
| Fonte | Cosa monitora |
|-------|--------------|
| Truth Social API | @realDonaldTrump (post pubblici) |
| Nitter/X RSS | @realDonaldTrump, @elonmusk, @federalreserve |
| Google News RSS | iran+market, taiwan+escalation, trump+tariffs, fed+rates... |
| Reuters RSS | Business + World news |
| Financial Times RSS | Mercati |
| MarketWatch RSS | Stock market |

### Filtri keywords (escalation + mercato)
```
military:  war, attack, missile, strike, nuclear, invasion, nato...
geo:       iran, taiwan, china, russia, ukraine, israel, north korea...
market:    tariff, fed, interest rate, recession, gdp, oil, gold, bitcoin...
trump:     trump, tariff, deal, executive order, policy, trade...
```

---

## Struttura file JSON generati

```
data/
├── market_data.json      ← prezzi live (aggiornato ogni ora)
├── portfolio_pnl.json    ← P&L snapshot (aggiornato ogni ora)
├── geopolitical_data.json ← ultimi 100 items geo/social
├── insider_data.json     ← Form 4 + convergenza (ogni 3gg)
└── geo_alerts_cache.json ← cache per deduplicazione
```

---

## Claude Code su VPS (opzionale — per analisi avanzata)

Se vuoi usare Claude Code direttamente sulla VPS per analisi più profonde:

```bash
# Installa Claude Code
npm install -g @anthropic/claude-code

# Configura API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Lancia analisi
claude "Analizza i dati in data/geopolitical_data.json e scrivi un report in reports/"
```

**CLAUDE.md già configurato nel repo** — Claude Code riconoscerà automaticamente
il contesto del portfolio quando lanciato dalla directory `Portfolio-Claude-Code/`.

---

## Troubleshooting

**`yfinance` restituisce dati vuoti:**
```bash
pip install --upgrade yfinance
# Yahoo Finance a volte throttle — riprova tra 1 minuto
```

**Truth Social API non risponde:**
- Normale durante manutenzione — Google News e RSS sono fallback
- Controlla: `curl https://truthsocial.com/api/v1/accounts/lookup?acct=realDonaldTrump`

**Nitter non funziona:**
- Le istanze Nitter vanno e vengono — lo script prova più istanze automaticamente
- Aggiungi istanze nuove in `NITTER_INSTANCES` in `vps_social_geo_monitor.py`

**Git push fallisce:**
```bash
# Testa la connessione SSH
ssh -T git@github.com -i ~/.ssh/id_portfolio
# Rigenera la chiave se necessario
ssh-keygen -t ed25519 -f ~/.ssh/id_portfolio -N ""
cat ~/.ssh/id_portfolio.pub  # Aggiorna su GitHub Settings
```

**Telegram non riceve messaggi:**
```bash
# Test manuale
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_CHAT_ID}&text=Test+Portfolio+VPS"
```

---

## Sicurezza

- `.env` e `portfolio_trades.json` sono in `.gitignore` — mai pushati su GitHub
- Il repo è read-only per visitatori esterni (GitHub Pages)
- La deploy key SSH ha accesso solo a questo repo
- I dati personali del portafoglio restano sul tuo Mac e/o VPS privata

---

*Aggiornato: Aprile 2026 | Portfolio Intelligence Dashboard v4.0*
