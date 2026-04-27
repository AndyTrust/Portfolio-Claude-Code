function openStockModal(ticker) {
  const fd = fundData[ticker];
  const instrument = getInstrumentByTicker(ticker);
  if (!fd && !instrument) { alert('Dati non disponibili per ' + ticker + '.'); return; }
  document.getElementById('modal-stock-title').innerHTML = `<span style="font-family:monospace;color:var(--accent2);">${ticker}</span> — ${fd?.description?.split('.')[0] || instrument?.name || 'Analisi Completa'}`;
  if (fd) renderStockModalContent(ticker, fd);
  else renderFallbackStockModal(ticker, instrument);
  openModal('modal-stock');
  // Tab switching
  document.querySelectorAll('#modal-stock-tabs .modal-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('#modal-stock-tabs .modal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('#modal-stock-body .modal-tab-content').forEach(tc => tc.classList.remove('active'));
      document.getElementById('mtab-' + tab.dataset.mtab)?.classList.add('active');
    };
  });
  document.querySelector('#modal-stock-tabs .modal-tab').click();
}

function renderFallbackStockModal(ticker, instrument) {
  const body = document.getElementById('modal-stock-body');
  const notes = stockNotes[ticker] || '';
  const tracked = !!getTrackedInstrumentByTicker(ticker);
  const instType = instrument?.type || 'Azione';
  const sources = buildDefaultSources(ticker, instType);
  const labeled = sources._labeled || sources.map(u => ({ label: u, url: u }));
  const isEtf = instType.toUpperCase() === 'ETF';

  // Build insider feed HTML from MONEY_FOLLOW_DATA if available
  let insiderFeedHtml = '';
  if (typeof MONEY_FOLLOW_DATA !== 'undefined' && !isEtf) {
    const acts = (MONEY_FOLLOW_DATA.insiderActivity || []).filter(a => a.ticker === ticker);
    if (acts.length) {
      insiderFeedHtml = '<div style="margin-top:10px;">' + acts.map(a => {
        const col = a.action === 'BUY' ? '#4ade80' : '#f87171';
        const arrow = a.action === 'BUY' ? '↑' : '↓';
        return `<div class="source-item" style="margin-bottom:6px;border-left:3px solid ${col};padding-left:8px;">
          <span style="color:${col};font-weight:700;">${arrow} ${a.action}</span>
          <span style="color:var(--dim);font-size:13px;margin-left:6px;">${a.date}</span>
          <span style="margin-left:6px;font-size:14px;">${a.insider}</span>
          <span style="margin-left:6px;color:${col};font-weight:600;">${a.value}</span>
          ${a.secUrl ? `<a href="${a.secUrl}" target="_blank" class="btn xs ghost" style="margin-left:6px;">SEC ↗</a>` : ''}
          ${a.note ? `<div style="font-size:12px;color:var(--dim);margin-top:3px;">${a.note}</div>` : ''}
        </div>`;
      }).join('') + '</div>';
    }
  }

  body.innerHTML = `
  <div class="modal-tab-content active" id="mtab-overview">
    <div class="report-section">
      <h5>Profilo Base</h5>
      <div class="report-text">
        <p><strong>Nome:</strong> ${instrument?.name || ticker}</p>
        <p><strong>Ticker:</strong> ${ticker}</p>
        <p><strong>Tipo:</strong> ${instType}</p>
        <p><strong>Catalogo:</strong> titolo disponibile per ricerca rapida e analisi esterna anche se non e ancora presente nel dataset approfondito.</p>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">
        ${tracked ? `<span class="badge badge-accum">Gia in watchlist</span>` : `<button class="btn sm ghost" onclick="quickAddToWatchlistFromModal('${ticker}', '${(instrument?.name || ticker).replace(/'/g, "\\'")}')">➕ Aggiungi a watchlist</button>`}
        <button class="btn sm ghost" onclick="copyAiResearchPrompt('${ticker}', '${(instrument?.name || ticker).replace(/'/g, "\\'")}')">🧠 Prompt AI</button>
      </div>
    </div>
    <div class="report-section">
      <h5>Link Rapidi</h5>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${labeled.map(s => `<a class="link-btn" href="${s.url}" target="_blank">${s.label}</a>`).join('')}
      </div>
    </div>
  </div>

  <div class="modal-tab-content" id="mtab-fondi">
    <div class="report-section"><div class="report-text"><p>Dati fondi non ancora presenti nel dataset locale per ${ticker}. Usa i link esterni e aggiungi il titolo alla watchlist se vuoi approfondirlo.</p></div></div>
  </div>

  <div class="modal-tab-content" id="mtab-insider">
    <div class="report-section">
      <h5>Insider Activity — ${ticker}</h5>
      ${isEtf
        ? `<div class="report-text"><p>Gli ETF non hanno insider individuali nel senso tradizionale. Usa SEC N-PORT per i movimenti del fondo.</p></div>`
        : `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            <a class="link-btn" href="http://openinsider.com/search?q=${ticker}" target="_blank" style="background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.4);color:#4ade80;">📋 OpenInsider ↗</a>
            <a class="link-btn" href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=4&dateb=&owner=include&count=20" target="_blank" style="background:rgba(99,102,241,.12);border-color:rgba(99,102,241,.4);color:#818cf8;">🏛️ SEC Form 4 ↗</a>
          </div>
          ${insiderFeedHtml || '<div class="report-text"><p>Nessuna transazione insider recente trovata nel dataset locale. Apri OpenInsider per i dati completi.</p></div>'}`
      }
    </div>
  </div>

  <div class="modal-tab-content" id="mtab-tecnica">
    <div class="report-section"><div class="report-text"><p>Analisi tecnica non disponibile nel dataset locale. Apri Yahoo o Finviz per prezzo, volumi, trend e livelli tecnici.</p></div></div>
  </div>

  <div class="modal-tab-content" id="mtab-news">
    <div class="report-section"><div class="report-text"><p>News locali non presenti per ${ticker}. Usa Perplexity o le fonti finanziarie collegate per avviare la ricerca specifica.</p></div></div>
  </div>

  <div class="modal-tab-content" id="mtab-report">
    <div class="report-section">
      <h5>Note Personali & Analisi</h5>
      <textarea id="stock-notes-input" style="width:100%;min-height:200px;font-size:14px;line-height:1.6;" placeholder="Scrivi qui le tue note di analisi per ${ticker}...">${notes}</textarea>
      <div style="margin-top:8px;display:flex;gap:6px;">
        <button class="btn sm" onclick="saveStockNote('${ticker}')">💾 Salva Note</button>
        <span style="font-size:12px;color:var(--dim);align-self:center;" id="note-save-status"></span>
      </div>
    </div>
  </div>

  <div class="modal-tab-content" id="mtab-fonti">
    <div class="report-section">
      <h5>Fonti Dati per ${ticker}</h5>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${labeled.map(s => `
        <div class="source-item" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:6px;background:var(--card2);border:1px solid var(--border);">
          <span style="font-size:15px;">${s.label}</span>
          <a href="${s.url}" target="_blank" class="btn xs ghost" style="min-width:60px;text-align:center;">↗ Apri</a>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function quickAddToWatchlistFromModal(ticker, fallbackName = '') {
  addCatalogInstrumentToWatchlist(ticker, undefined, fallbackName);
  closeModal('modal-stock');
  renderAll();
}

function renderStockModalContent(ticker, fd) {
  const body = document.getElementById('modal-stock-body');
  const notes = stockNotes[ticker] || '';
  const sentHtml = fd.sentiment ? Object.entries(fd.sentiment).map(([k, v]) =>
    `<div class="gauge-wrap" style="margin-bottom:4px;"><span style="font-size:12px;width:70px;color:var(--dim);text-transform:capitalize;">${k}</span><div class="gauge"><div class="gauge-fill" style="width:${v}%;background:${v >= 70 ? 'var(--green)' : v >= 50 ? 'var(--yellow)' : 'var(--red)'};"></div></div><span class="gauge-label" style="color:${v >= 70 ? 'var(--green)' : v >= 50 ? 'var(--yellow)' : 'var(--red)'};">${v}</span></div>`
  ).join('') : '';

  body.innerHTML = `
  <!-- OVERVIEW -->
  <div class="modal-tab-content active" id="mtab-overview">
    <div class="report-kpi">
      <div class="report-kpi-item"><div class="kpi-val" style="color:${fd.change >= 0 ? 'var(--green)' : 'var(--red)'};">${fd.currency === 'EUR' ? '€' : '$'}${fd.price}</div><div class="kpi-label">Prezzo <span class="info-i">i<span class="tooltip">Ultimo prezzo di chiusura disponibile.</span></span></div></div>
      <div class="report-kpi-item"><div class="kpi-val" class="${fd.change >= 0 ? 'up' : 'down'}">${fd.change >= 0 ? '+' : ''}${fd.change}%</div><div class="kpi-label">Variazione <span class="info-i">i<span class="tooltip">Variazione % rispetto alla chiusura precedente.</span></span></div></div>
      <div class="report-kpi-item"><div class="kpi-val">${fd.pe}</div><div class="kpi-label">P/E Ratio <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Price/Earnings Ratio</span>Rapporto prezzo/utili. Indica quanti anni di utili attuali servirebbero per "ripagare" il prezzo dell'azione.<span class="tooltip-formula">P/E = Prezzo / EPS (utile per azione)</span><span class="tooltip-note">P/E alto = mercato si aspetta crescita. P/E basso = titolo value o in difficoltà. Media S&P500 ≈ 22.</span></span></span></div></div>
      <div class="report-kpi-item"><div class="kpi-val">${fd.marketCap}</div><div class="kpi-label">Market Cap <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Capitalizzazione di Mercato</span>Valore totale di tutte le azioni in circolazione.<span class="tooltip-formula">Market Cap = Prezzo × Azioni in circolazione</span><span class="tooltip-note">Mega cap > $200B | Large > $10B | Mid > $2B</span></span></span></div></div>
      <div class="report-kpi-item"><div class="kpi-val">${fd.eps}</div><div class="kpi-label">EPS <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Earnings Per Share</span>Utile netto diviso per il numero di azioni. Misura la redditività per azione.<span class="tooltip-formula">EPS = Utile Netto / Azioni in circolazione</span></span></span></div></div>
      <div class="report-kpi-item"><div class="kpi-val">${fd.beta}</div><div class="kpi-label">Beta <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Beta</span>Misura la volatilità del titolo rispetto al mercato (S&P500).<span class="tooltip-formula">Beta > 1 = più volatile del mercato<br>Beta < 1 = meno volatile<br>Beta = 1 = in linea col mercato</span><span class="tooltip-note">NVDA β=1.65 significa che se il mercato scende 1%, NVDA tende a scendere 1,65%.</span></span></span></div></div>
    </div>
    <div class="report-section">
      <h5>📋 Descrizione & Tesi di Investimento</h5>
      <div class="report-text"><p>${fd.description}</p></div>
    </div>
    <div class="report-section">
      <h5>📊 Sentiment Aggregato <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Sentiment Score</span>Punteggio 0-100 aggregato da: analisti istituzionali, social media finanziari (StockTwits, Reddit), tono delle news, flussi fondi istituzionali.<span class="tooltip-formula">Score = Σ(fonte_score × peso_fonte) / Σ(pesi)</span></span></span></h5>
      ${sentHtml}
    </div>
    <div class="report-section">
      <h5>📰 News Recenti</h5>
      ${(fd.news || []).map(n => `<div style="padding:8px 0;border-bottom:1px solid var(--border);"><div style="font-size:12px;color:var(--dim);">${n.source} · ${n.date}</div><div style="font-weight:600;font-size:14px;margin:2px 0;">${n.title}</div><div style="font-size:13px;color:var(--muted);">${n.body}</div></div>`).join('')}
    </div>
  </div>

  <!-- FONDI -->
  <div class="modal-tab-content" id="mtab-fondi">
    <div class="report-section" style="border-color:rgba(52,211,153,.3);">
      <h5 style="color:var(--green);">🟢 Fondi Compratori (Accumulo) <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Fondi Compratori</span>Fondi istituzionali che hanno AUMENTATO la loro posizione nell'ultimo trimestre. Dati da SEC 13F filing.<span class="tooltip-note">La "conviction" indica quanto è significativo l'incremento rispetto al portafoglio totale del fondo.</span></span></span></h5>
      ${(fd.buyers || []).map(b => `<div style="padding:10px;background:var(--surface);border-radius:6px;border:1px solid var(--border);margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div><span style="font-weight:700;font-size:14px;">${b.name}</span> <span style="font-size:12px;color:var(--dim);">${b.strategy || ''}</span></div>
          <span style="font-weight:800;color:var(--green);font-family:monospace;font-size:16px;">+${b.pct}%</span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;">Shares: ${b.shares || '—'} · Valore: ${b.value || '—'}</div>
        ${b.conviction ? `<div style="font-size:12px;margin-top:4px;padding:4px 8px;background:rgba(52,211,153,.08);border-radius:4px;color:var(--green);">🎯 Conviction: ${b.conviction}</div>` : ''}
      </div>`).join('')}
    </div>
    <div class="report-section" style="border-color:rgba(248,113,113,.3);">
      <h5 style="color:var(--red);">🔴 Fondi Venditori (Distribuzione) <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Fondi Venditori</span>Fondi che hanno RIDOTTO la posizione. La "reason" spiega il contesto: rotazione settoriale, presa di profitto, o cambio di view.</span></span></span></h5>
      ${(fd.sellers || []).map(s => `<div style="padding:10px;background:var(--surface);border-radius:6px;border:1px solid var(--border);margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div><span style="font-weight:700;font-size:14px;">${s.name}</span> <span style="font-size:12px;color:var(--dim);">${s.strategy || ''}</span></div>
          <span style="font-weight:800;color:var(--red);font-family:monospace;font-size:16px;">${s.pct}%</span>
        </div>
        ${s.reason ? `<div style="font-size:12px;margin-top:4px;padding:4px 8px;background:rgba(248,113,113,.06);border-radius:4px;color:var(--red);">📌 ${s.reason}</div>` : ''}
      </div>`).join('')}
    </div>
  </div>

  <!-- INSIDER -->
  <div class="modal-tab-content" id="mtab-insider">
    <div class="report-section">
      <h5>🔍 Insider Trading — SEC Form 4 <span class="info-i">i<span class="tooltip"><span class="tooltip-title">SEC Form 4</span>Obbligatorio per insider (officer, director, azionisti >10%) entro 2 giorni lavorativi dall'operazione. Gli acquisti open market sono segnali molto più significativi delle vendite 10b5-1 (pre-programmate).<span class="tooltip-formula">Segnale forte: CEO/CFO acquista open market > $500K<br>Segnale debole: vendita piano 10b5-1 (automatica)</span></span></span></h5>
      <table><thead><tr><th>Data</th><th>Nome</th><th>Ruolo</th><th>Azione</th><th>Shares</th><th>Prezzo</th><th>Valore</th><th>Note</th></tr></thead>
      <tbody>${(fd.insider || []).map(ins =>
        `<tr><td style="font-size:13px;">${ins.date}</td><td style="font-size:13px;font-weight:600;">${ins.name}</td><td style="font-size:12px;color:var(--dim);">${ins.role}</td><td><span class="badge ${ins.action === 'ACQUISTO' ? 'badge-buy' : 'badge-sell'}">${ins.action}</span></td><td style="font-family:monospace;font-size:13px;">${ins.shares?.toLocaleString()}</td><td style="font-family:monospace;font-size:13px;">$${ins.price}</td><td style="font-family:monospace;font-size:13px;">${ins.value}</td><td style="font-size:12px;color:var(--muted);max-width:200px;">${ins.note || ''}</td></tr>`
      ).join('')}</tbody></table>
    </div>
  </div>

  <!-- TECNICA -->
  <div class="modal-tab-content" id="mtab-tecnica">
    <div class="report-kpi">
      <div class="report-kpi-item"><div class="kpi-val">${fd.technicals?.rsi || '—'}</div><div class="kpi-label">RSI (14) <span class="info-i">i<span class="tooltip"><span class="tooltip-title">RSI — Relative Strength Index</span>Oscillatore 0-100 che misura la velocità e il cambiamento dei movimenti di prezzo.<span class="tooltip-formula">RSI > 70 = Ipercomprato (possibile discesa)<br>RSI < 30 = Ipervenduto (possibile rimbalzo)<br>30-70 = Zona neutra</span></span></span></div></div>
      <div class="report-kpi-item"><div class="kpi-val">${fd.technicals?.sma50 || '—'}</div><div class="kpi-label">SMA 50 <span class="info-i">i<span class="tooltip"><span class="tooltip-title">SMA 50 — Media Mobile 50 Giorni</span>Media dei prezzi di chiusura degli ultimi 50 giorni. Indica il trend di medio termine.<span class="tooltip-formula">SMA50 = Σ(close_ultimi_50_giorni) / 50</span><span class="tooltip-note">Prezzo > SMA50 = trend rialzista. Prezzo < SMA50 = trend ribassista.</span></span></span></div></div>
      <div class="report-kpi-item"><div class="kpi-val">${fd.technicals?.sma200 || '—'}</div><div class="kpi-label">SMA 200 <span class="info-i">i<span class="tooltip"><span class="tooltip-title">SMA 200 — Media Mobile 200 Giorni</span>Media di lungo termine. Il "golden cross" (SMA50 incrocia sopra SMA200) è segnale rialzista. Il "death cross" (SMA50 sotto SMA200) è ribassista.<span class="tooltip-formula">SMA200 = Σ(close_ultimi_200_giorni) / 200</span></span></span></div></div>
      <div class="report-kpi-item"><div class="kpi-val" style="font-size:14px;">${fd.technicals?.macd || '—'}</div><div class="kpi-label">MACD <span class="info-i">i<span class="tooltip"><span class="tooltip-title">MACD</span>Moving Average Convergence Divergence. Indicatore di momentum e trend.<span class="tooltip-formula">MACD = EMA(12) - EMA(26)<br>Signal = EMA(9) del MACD<br>Bullish crossover = MACD incrocia sopra Signal</span></span></span></div></div>
    </div>
    <div class="report-section">
      <h5>📍 Livelli Tecnici Chiave <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Livelli Tecnici</span><strong>Supporto:</strong> livello di prezzo dove la domanda tende a essere sufficiente per fermare un calo.<br><strong>Resistenza:</strong> livello dove l'offerta tende a fermare un rialzo.<br><strong>Range 52W:</strong> prezzo minimo e massimo nell'ultimo anno.</span></span></span></h5>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;padding:10px;background:rgba(52,211,153,.06);border-radius:8px;border:1px solid rgba(52,211,153,.2);">
          <div style="font-size:12px;color:var(--green);font-weight:600;margin-bottom:6px;">SUPPORTI</div>
          ${(fd.technicals?.support || []).map((s, i) => `<div style="font-size:14px;padding:3px 0;${i === 0 ? 'font-weight:700;' : 'color:var(--muted);'}">S${i + 1}: ${fd.currency === 'EUR' ? '€' : '$'}${s}</div>`).join('')}
        </div>
        <div style="flex:1;min-width:200px;padding:10px;background:rgba(248,113,113,.06);border-radius:8px;border:1px solid rgba(248,113,113,.2);">
          <div style="font-size:12px;color:var(--red);font-weight:600;margin-bottom:6px;">RESISTENZE</div>
          ${(fd.technicals?.resistance || []).map((r, i) => `<div style="font-size:14px;padding:3px 0;${i === 0 ? 'font-weight:700;' : 'color:var(--muted);'}">R${i + 1}: ${fd.currency === 'EUR' ? '€' : '$'}${r}</div>`).join('')}
        </div>
      </div>
      <div style="margin-top:10px;font-size:13px;color:var(--muted);">📊 Range 52W: ${fd.range52w} · Volume medio: ${fd.technicals?.volume} · Trend: ${fd.technicals?.trend}</div>
    </div>
    <div class="report-section">
      <h5>🎯 Target Analisti <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Price Targets</span>Target di prezzo a 12 mesi degli analisti sell-side. Il "consensus" indica la raccomandazione media.<span class="tooltip-formula">Buy/Hold/Sell basato su media pesata dei target degli analisti coverage.</span><span class="tooltip-note">${fd.targets?.analysts || 0} analisti coprono questo titolo.</span></span></span></h5>
      <div class="report-kpi">
        <div class="report-kpi-item"><div class="kpi-val" style="color:var(--red);">${fd.currency === 'EUR' ? '€' : '$'}${fd.targets?.low}</div><div class="kpi-label">Target Basso</div></div>
        <div class="report-kpi-item"><div class="kpi-val" style="color:var(--accent2);">${fd.currency === 'EUR' ? '€' : '$'}${fd.targets?.avg}</div><div class="kpi-label">Target Medio</div></div>
        <div class="report-kpi-item"><div class="kpi-val" style="color:var(--green);">${fd.currency === 'EUR' ? '€' : '$'}${fd.targets?.high}</div><div class="kpi-label">Target Alto</div></div>
        <div class="report-kpi-item"><div class="kpi-val">${fd.targets?.consensusScore || '—'}</div><div class="kpi-label">Consensus Score</div></div>
      </div>
      <div style="margin-top:6px;"><span class="badge badge-strong">${fd.targets?.consensus || '—'}</span> <span style="font-size:12px;color:var(--dim);">(${fd.targets?.analysts || 0} analisti)</span></div>
    </div>
  </div>

  <!-- NEWS -->
  <div class="modal-tab-content" id="mtab-news">
    ${(fd.news || []).map(n =>
      `<div class="report-section"><h5>${n.impact === 'positivo' ? '🟢' : n.impact === 'negativo' ? '🔴' : '🟡'} ${n.title}</h5>
      <div style="font-size:12px;color:var(--dim);margin-bottom:6px;">${n.source} · ${n.date}</div>
      <div class="report-text"><p>${n.body}</p></div></div>`
    ).join('')}
    <div class="report-section">
      <h5>📡 Fonti Monitorate per ${ticker}</h5>
      <div style="font-size:13px;color:var(--muted);">Bloomberg, Reuters, CNBC, CNN Business, Fox Business, Financial Times, WSJ, SEC EDGAR, Finviz, WhaleWisdom, Perplexity Finance, TradingView</div>
    </div>
  </div>

  <!-- REPORT & NOTE -->
  <div class="modal-tab-content" id="mtab-report">
    <div class="report-section">
      <h5>📝 Note Personali & Analisi</h5>
      <textarea id="stock-notes-input" style="width:100%;min-height:200px;font-size:14px;line-height:1.6;" placeholder="Scrivi qui le tue note di analisi per ${ticker}...&#10;&#10;Suggerimenti:&#10;- Tesi di investimento&#10;- Livelli di ingresso/uscita&#10;- Catalizzatori da monitorare&#10;- Rischi specifici&#10;- Connessioni con altri titoli">${notes}</textarea>
      <div style="margin-top:8px;display:flex;gap:6px;">
        <button class="btn sm" onclick="saveStockNote('${ticker}')">💾 Salva Note</button>
        <button class="btn sm ghost" onclick="copyAiResearchPrompt('${ticker}', '${ticker}')">🧠 Prompt AI</button>
        <span style="font-size:12px;color:var(--dim);align-self:center;" id="note-save-status"></span>
      </div>
    </div>
    <div class="report-section">
      <h5>📊 Report Riepilogativo Automatico</h5>
      <div class="report-text">
        <p><strong>Segnale:</strong> <span class="badge badge-${fd.signalColor === 'green' ? 'accum' : fd.signalColor === 'red' ? 'distrib' : 'neutro'}">${fd.signal}</span></p>
        <p><strong>Fondi:</strong> ${(fd.buyers || []).length} compratori vs ${(fd.sellers || []).length} venditori. ${(fd.buyers || []).length > (fd.sellers || []).length ? 'Prevalenza di accumulo istituzionale.' : 'Attenzione: pressione vendite istituzionali.'}</p>
        <p><strong>Insider:</strong> ${(fd.insider || []).filter(i => i.action === 'ACQUISTO').length} acquisti, ${(fd.insider || []).filter(i => i.action === 'VENDITA').length} vendite. ${(fd.insider || []).filter(i => i.action === 'ACQUISTO' && !i.note?.includes('10b5-1')).length > 0 ? '⚡ Acquisti open market rilevati — segnale positivo.' : 'Vendite principalmente da piani pre-schedulati 10b5-1.'}</p>
        <p><strong>Tecnica:</strong> RSI a ${fd.technicals?.rsi || '—'}${fd.technicals?.rsi < 30 ? ' — IPERVENDUTO, potenziale rimbalzo.' : fd.technicals?.rsi > 70 ? ' — IPERCOMPRATO, cautela.' : ' — zona neutra.'}. Trend: ${fd.technicals?.trend || '—'}.</p>
        <p><strong>Target:</strong> Consensus ${fd.targets?.consensus || '—'} con target medio ${fd.currency === 'EUR' ? '€' : '$'}${fd.targets?.avg || '—'} (${fd.price < (fd.targets?.avg || 0) ? '+' + (((fd.targets?.avg || 0) - fd.price) / fd.price * 100).toFixed(1) + '% upside' : 'sotto target'}).</p>
      </div>
    </div>
  </div>

  <!-- FONTI -->
  <div class="modal-tab-content" id="mtab-fonti">
    <div class="report-section">
      <h5>🔗 Fonti Dati per ${ticker} <span class="info-i">i<span class="tooltip"><span class="tooltip-title">Fonti Dati</span>Elenco di tutte le fonti consultabili per questo titolo. Clicca "Apri" per visitare il sito. I dati della dashboard sono aggregati da queste fonti.</span></span></span></h5>
      ${(fd.sources || []).map(url =>
        `<div class="source-item"><span class="source-item-url">${url}</span><a href="${url}" target="_blank" class="btn xs ghost">↗ Apri</a></div>`
      ).join('')}
    </div>
    <div class="report-section">
      <h5>➕ Aggiungi Fonte Personalizzata</h5>
      <div class="form-row">
        <div class="form-group" style="flex:1;"><label>URL</label><input type="url" id="new-source-url" placeholder="https://..." style="width:100%;"/></div>
        <div class="form-group" style="justify-content:flex-end;"><button class="btn sm" onclick="addStockSource('${ticker}')">➕ Aggiungi</button></div>
      </div>
    </div>
  </div>`;
}

function saveStockNote(ticker) {
  const note = document.getElementById('stock-notes-input')?.value || '';
  stockNotes[ticker] = note; saveNotes();
  const status = document.getElementById('note-save-status');
  if (status) { status.textContent = '✅ Salvato!'; setTimeout(() => status.textContent = '', 2000); }
}
function addStockSource(ticker) {
  const url = document.getElementById('new-source-url')?.value?.trim();
  if (!url) return;
  if (!fundData[ticker]) fundData[ticker] = { sources: [] };
  if (!fundData[ticker].sources) fundData[ticker].sources = [];
  fundData[ticker].sources.push(url);
  ensureStockRegistryEntry(ticker, {
    name: getInstrumentByTicker(ticker)?.name || ticker,
    type: getInstrumentByTicker(ticker)?.type || 'Azione',
    sources: [...new Set([...(getStockRegistryEntry(ticker)?.sources || buildDefaultSources(ticker)), url])],
    updatedBy: 'modal-source'
  });
  saveFundData();
  openStockModal(ticker); // Refresh
}

function copyAiResearchPrompt(ticker, stockName = '') {
  const name = stockName || ticker;
  const prompt = [
    `Analizza il titolo ${ticker} (${name}).`,
    'Output richiesto in JSON:',
    '{',
    '  "ticker": "",',
    '  "nome": "",',
    '  "settore": "",',
    '  "thesis": "",',
    '  "catalizzatori_30_90g": [],',
    '  "rischi": [],',
    '  "holder_flow": "",',
    '  "azione_watchlist": "ADD|MONITOR|REMOVE",',
    '  "fonti": ["url1","url2","url3"]',
    '}',
    'Usa almeno queste fonti: Yahoo Finance, Google Finance, Perplexity Finance, SEC EDGAR, Finviz.',
    'Evita affermazioni senza fonte verificabile.'
  ].join('\n');
  navigator.clipboard.writeText(prompt)
    .then(() => alert(`Prompt AI copiato per ${ticker}.`))
    .catch(() => {
      const fallback = document.createElement('textarea');
      fallback.value = prompt;
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      document.body.removeChild(fallback);
      alert(`Prompt AI copiato per ${ticker}.`);
    });
}
