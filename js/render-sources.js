/**
 * Sources Monitor — renders verified data sources from data/sources.json
 * Usage: renderSourcesMonitor(sourcesData, containerId, categories?)
 * Categories: ['insider', 'funds', 'politicians', 'market_data', 'commodities', 'news_sentiment']
 */

function renderSourcesMonitor(sourcesData, containerId, filterCategories) {
  const c = document.getElementById(containerId);
  if (!c) return;

  // Collect all sources
  const allSections = [
    { key: 'insider_form4',     label: '📋 Form 4 & OpenInsider',     cat: 'insider',    color: 'var(--accent)' },
    { key: 'sec_edgar',         label: '🏛️ SEC EDGAR — Ufficiale',     cat: 'insider',    color: 'var(--blue)' },
    { key: 'politicians',       label: '🏛️ STOCK Act — Politici USA',   cat: 'politicians',color: 'var(--purple)' },
    { key: 'institutional_funds',label:'🏦 Fondi Istituzionali 13F',    cat: 'funds',      color: 'var(--green)' },
    { key: 'market_data',       label: '📈 Market Data & Finance',      cat: 'market_data',color: 'var(--cyan)' },
    { key: 'commodities',       label: '🛢️ Materie Prime & Macro',      cat: 'commodities',color: 'var(--yellow)' },
    { key: 'news_sentiment',    label: '📰 News & Sentiment',           cat: 'news_sentiment',color:'var(--pink)' },
  ];

  const upd = sourcesData.lastUpdated
    ? new Date(sourcesData.lastUpdated).toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' })
    : '—';

  let html = '<div style="display:inline-flex;align-items:center;gap:5px;background:rgba(30,143,78,.1);border:1px solid rgba(30,143,78,.25);border-radius:20px;padding:2px 10px;font-size:11px;color:var(--green);margin-bottom:14px;">'
    + '<span style="width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;"></span>'
    + ' Aggiornato: <strong style="margin-left:3px;">' + upd + '</strong></div>';

  // Tab navigation
  const visibleSections = allSections.filter(s =>
    !filterCategories || filterCategories.includes(s.cat)
  );

  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;" id="src-tabs">';
  visibleSections.forEach((sec, i) => {
    const count = (sourcesData[sec.key] || []).length;
    if (!count) return;
    html += `<button onclick="srcSwitchTab('${sec.key}')" id="srctab-${sec.key}"
      style="padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid ${sec.color}33;background:${i===0?sec.color+'22':'transparent'};color:${i===0?sec.color:'var(--dim)'};transition:all 150ms;"
      onmouseover="if(this.dataset.active!='1')this.style.background='${sec.color}11'"
      onmouseout="if(this.dataset.active!='1')this.style.background='transparent'"
      ${i===0?'data-active="1"':''}>
      ${sec.label} <span style="opacity:.7">(${count})</span>
    </button>`;
  });
  html += '</div>';

  // Source panels
  visibleSections.forEach((sec, i) => {
    const sources = sourcesData[sec.key] || [];
    if (!sources.length) return;
    html += `<div id="srcpanel-${sec.key}" style="display:${i===0?'block':'none'};">`;
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">';
    sources.forEach(src => {
      const relColor = src.reliability >= 95 ? 'var(--green)' : src.reliability >= 80 ? 'var(--yellow)' : 'var(--red)';
      const freqBadge = {
        'real-time': '⚡ Real-time',
        'daily':     '🔄 Daily',
        'quarterly': '📆 Trimestrale',
        'monthly':   '📅 Mensile',
        'weekly':    '📋 Weekly',
      }[src.frequency] || src.frequency || '';
      html += `<div style="padding:12px;background:var(--surface2);border-radius:10px;border:1px solid var(--border);border-left:3px solid ${sec.color};transition:box-shadow 150ms;"
        onmouseover="this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.boxShadow='none'">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px;">
          <div style="font-size:13px;font-weight:700;color:var(--text);flex:1;line-height:1.3;">
            ${src.icon || '🔗'} ${src.name}
          </div>
          ${src.ticker ? `<span style="padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700;background:var(--brand-ochre-wash);color:var(--brand-ochre-deep);white-space:nowrap;">${src.ticker}</span>` : ''}
        </div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:8px;line-height:1.4;">${src.desc || ''}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
            ${freqBadge ? `<span style="font-size:10px;color:var(--dim);">${freqBadge}</span>` : ''}
            ${src.reliability ? `<span style="font-size:10px;font-weight:700;color:${relColor};">●  ${src.reliability}% affidabilità</span>` : ''}
          </div>
          <a href="${src.url}" target="_blank" rel="noopener noreferrer"
            style="padding:4px 10px;background:${sec.color}18;color:${sec.color};border:1px solid ${sec.color}33;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;transition:all 120ms;"
            onmouseover="this.style.background='${sec.color}33'" onmouseout="this.style.background='${sec.color}18'">
            Apri ↗
          </a>
        </div>
      </div>`;
    });
    html += '</div></div>';
  });

  c.innerHTML = html;

  // Wire up tab switching
  window.srcSwitchTab = function(key) {
    const allSecs = document.querySelectorAll('[id^="srcpanel-"]');
    allSecs.forEach(el => el.style.display = 'none');
    const target = document.getElementById('srcpanel-' + key);
    if (target) target.style.display = 'block';

    // Update tab styles
    const allTabs = document.querySelectorAll('[id^="srctab-"]');
    allTabs.forEach(el => {
      el.dataset.active = '0';
      el.style.background = 'transparent';
      el.style.color = 'var(--dim)';
    });
    const tab = document.getElementById('srctab-' + key);
    if (tab) {
      tab.dataset.active = '1';
      // Find section color
      const sec = visibleSections.find(s => s.key === key);
      if (sec) {
        tab.style.background = sec.color + '22';
        tab.style.color = sec.color;
      }
    }
  };
}
