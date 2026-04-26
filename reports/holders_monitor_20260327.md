# Holders Monitor - 2026-03-27

## Obiettivo

Monitorare in modo continuo segnali anticipatori da:
- insider
- istituzionali
- politici

con focus su movimenti rilevanti che possono anticipare trend prezzo/catalizzatori.

## Stato accesso fonti Perplexity (TSLA)

- URL politicians: `https://www.perplexity.ai/finance/TSLA/holders?tab=politicians&page=1`
- URL insiders: `https://www.perplexity.ai/finance/TSLA/holders?tab=insiders`
- URL institutional: `https://www.perplexity.ai/finance/TSLA/holders?tab=institutional`

Esito automazione del 2026-03-27:
- `politicians`: bloccata da verifica Cloudflare
- `insiders`: bloccata da verifica Cloudflare
- `institutional`: timeout/accesso non completato

Conclusione:
- usare Perplexity come fonte manuale/interattiva
- mantenere pipeline automatica su fonti alternative ufficiali

## Evidenze primarie disponibili (SEC)

Fonte: `https://data.sec.gov/submissions/CIK0001318605.json` (Tesla, CIK 1318605)

Form 4 recenti rilevati:
- 2026-03-09 - 0001104659-26-025379
- 2026-02-27 - 0001104659-26-021746
- 2026-01-12 - 0001972928-26-000001
- 2026-01-06 - 0001104659-26-001460

Nota:
- il dettaglio buy/sell per insider va verificato nel singolo filing

## Fonti monitor operative

- Insider: SEC Form 4, Nasdaq insider activity
- Institutional: SEC 13F, Nasdaq institutional holdings
- Politicians: House Financial Disclosure, Senate EFD

## Playbook operativo sintetico

1. Aggiornamento settimanale:
- estrarre nuovi filing Form 4 (TSLA + top watchlist ticker)
- registrare variazioni insider buy/sell

2. Aggiornamento mensile:
- verificare nuovi filing 13F per trend istituzionale
- confrontare accumulo/distribuzione vs prezzo

3. Alert prioritari:
- insider buy ripetuti da CEO/CFO
- riduzioni massicce da top holders istituzionali
- trade politici allineati a news regolatorie/contratti

4. Sincronizzazione app:
- aggiornare `HOLDER_FLOW_TRACKER` in `js/data.js`
- verificare render in tab Intelligence (`holder-flow-monitor`)
