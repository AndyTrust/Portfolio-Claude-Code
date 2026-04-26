// ═══════════════════════════════════════════════════
// INTELLIGENCE REPORTS RENDERER
// Renders INTELLIGENCE_REPORTS (from intelligence-reports.js) as rich HTML
// ═══════════════════════════════════════════════════

let currentReportIndex = 0; // index into INTELLIGENCE_REPORTS (latest first)

function renderReports() {
  if (typeof INTELLIGENCE_REPORTS === 'undefined' || !INTELLIGENCE_REPORTS.length) return;
  // Sort descending by date (latest first)
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));
  renderReportNav(sorted);
  renderReportContent(sorted[currentReportIndex]);
  renderReportSignalSummary(sorted[currentReportIndex]);
}

function renderReportNav(sorted) {
  const nav = document.getElementById('report-date-nav');
  if (!nav) return;
  nav.innerHTML = sorted.map((r, i) => {
    const d = new Date(r.date);
    const label = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
    const isLatest = i === 0;
    return `<button class="filter-btn ${i === currentReportIndex ? 'active' : ''}" onclick="switchReport(${i})" style="position:relative;">
      ${label}${isLatest ? ' <span class="tab-badge" style="position:static;margin-left:4px;">LIVE</span>' : ''}
    </button>`;
  }).join('');
}

function switchReport(idx) {
  currentReportIndex = idx;
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));
  renderReportNav(sorted);
  renderReportContent(sorted[idx]);
  renderReportSignalSummary(sorted[idx]);
}

// ─── Main content renderer ───
function renderReportContent(report) {
  const container = document.getElementById('report-main-content');
  if (!container || !report) return;
  container.innerHTML = mdToHtml(report.raw);
}

// ─── Signal summary cards (parsed from MD) ───
function renderReportSignalSummary(report) {
  const container = document.getElementById('report-signal-summary');
  if (!container || !report) return;

  // Extract the signals table from the markdown
  const raw = report.raw;
  const tableMatch = raw.match(/## 📋 Riepilogo Segnali\n([\s\S]*?)(?:\n---|\n## |$)/);
  if (!tableMatch) { container.innerHTML = ''; return; }

  const tableRaw = tableMatch[1];
  const rows = tableRaw.trim().split('\n').filter(l => l.startsWith('|') && !l.match(/^\|[-| ]+\|$/));
  if (rows.length < 2) { container.innerHTML = ''; return; }

  const headers = rows[0].split('|').map(h => h.trim()).filter(Boolean);
  const dataRows = rows.slice(1);

  const cards = dataRows.map(row => {
    const cols = row.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 3) return '';
    const ticker = cols[0] || '';
    const price = cols[1] || '';
    const signal = cols[2] || '';
    const conviction = cols[3] || '';
    const signalLower = signal.toLowerCase();
    const signalColor = signalLower.includes('accumulo') ? 'var(--green)' :
      signalLower.includes('distrib') ? 'var(--red)' : 'var(--yellow)';
    const badgeCls = signalLower.includes('accumulo') ? 'badge-accum' :
      signalLower.includes('distrib') ? 'badge-distrib' : 'badge-neutro';
    const stars = conviction.replace(/[^⭐]/g, '');
    return `<div class="stock-card" onclick="openStockModal('${ticker}')" style="cursor:pointer;min-width:140px;max-width:180px;">
      <div class="stock-ticker" style="color:${signalColor};font-size:18px;">${ticker}</div>
      <div style="font-size:13px;color:var(--muted);margin:2px 0;">${price}</div>
      <span class="badge ${badgeCls}" style="font-size:11px;">${signal}</span>
      <div style="font-size:15px;margin-top:6px;">${stars}</div>
    </div>`;
  }).join('');

  container.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start;">${cards}</div>`;
}

// ─── Mini Markdown → HTML converter ───
function mdToHtml(md) {
  if (!md) return '';
  const lines = md.split('\n');
  let html = '';
  let inTable = false;
  let inList = false;
  let tableHeaders = [];
  let isFirstTableRow = true;

  const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const inlineFormat = s => {
    return s
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/⭐/g, '<span style="color:#fbbf24;">⭐</span>')
      .replace(/🔴/g, '<span>🔴</span>')
      .replace(/🟡/g, '<span>🟡</span>')
      .replace(/🟢/g, '<span>🟢</span>')
      .replace(/⚠️/g, '<span>⚠️</span>')
      .replace(/⚡/g, '<span>⚡</span>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Close list if not a list item
    if (inList && !trimmed.startsWith('-') && !trimmed.startsWith('*') && trimmed !== '') {
      html += '</ul>';
      inList = false;
    }

    // Table row
    if (trimmed.startsWith('|')) {
      if (trimmed.match(/^\|[-| ]+\|$/)) {
        // separator row
        if (!inTable) {
          inTable = true;
          html += '<div style="overflow-x:auto;margin:10px 0;"><table>';
          // Emit the header we saved
          if (tableHeaders.length) {
            html += '<thead><tr>' + tableHeaders.map(h => `<th>${inlineFormat(h)}</th>`).join('') + '</tr></thead><tbody>';
            tableHeaders = [];
          }
        }
        continue;
      }
      const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
      if (!inTable) {
        // This is the header row before separator
        tableHeaders = cells;
      } else {
        html += '<tr>' + cells.map(c => `<td>${inlineFormat(c)}</td>`).join('') + '</tr>';
      }
      continue;
    } else if (inTable) {
      html += '</tbody></table></div>';
      inTable = false;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      html += '<hr style="border-color:var(--border);margin:16px 0;"/>';
      continue;
    }

    // h1
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      html += `<h2 class="report-h1" style="font-size:20px;color:var(--accent2);margin:16px 0 8px;">${inlineFormat(trimmed.slice(2))}</h2>`;
      continue;
    }
    // h2
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      html += `<h3 class="report-h2" style="font-size:16px;color:var(--accent);margin:18px 0 8px;padding-top:8px;border-top:1px solid var(--border);">${inlineFormat(trimmed.slice(3))}</h3>`;
      continue;
    }
    // h3 (stock sections — highlight ticker)
    if (trimmed.startsWith('### ')) {
      const content = trimmed.slice(4);
      // Try to extract ticker from "### TICKER — ..."
      const tickerMatch = content.match(/^([A-Z]{2,5})\s*[—–-]/);
      const ticker = tickerMatch ? tickerMatch[1] : '';
      const styledContent = ticker
        ? content.replace(ticker, `<span class="ticker-link" onclick="openStockModal('${ticker}')" style="font-family:monospace;font-size:17px;color:var(--accent2);">${ticker}</span>`)
        : inlineFormat(content);
      html += `<h4 class="report-h3" style="font-size:15px;font-weight:700;margin:16px 0 6px;display:flex;align-items:center;gap:8px;">${styledContent}</h4>`;
      continue;
    }
    // h4
    if (trimmed.startsWith('#### ')) {
      html += `<h5 style="font-size:14px;color:var(--muted);margin:10px 0 4px;">${inlineFormat(trimmed.slice(5))}</h5>`;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      html += `<blockquote style="border-left:4px solid var(--accent);padding:10px 14px;margin:10px 0;background:rgba(99,102,241,.06);border-radius:0 8px 8px 0;font-size:14px;color:var(--muted);line-height:1.6;">${inlineFormat(trimmed.slice(2))}</blockquote>`;
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) { html += '<ol style="margin:8px 0 8px 20px;font-size:15px;line-height:1.8;">'; inList = true; }
      html += `<li>${inlineFormat(trimmed.replace(/^\d+\.\s/, ''))}</li>`;
      continue;
    }
    // Bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { html += '<ul style="margin:8px 0 8px 18px;font-size:15px;line-height:1.8;">'; inList = true; }
      html += `<li>${inlineFormat(trimmed.slice(2))}</li>`;
      continue;
    }

    // Blank line / paragraph break
    if (trimmed === '') {
      if (inList) { html += '</ul>'; inList = false; }
      continue;
    }

    // Italic-only lines (notes/sources at bottom)
    if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) {
      html += `<p style="font-size:13px;color:var(--dim);font-style:italic;margin:6px 0;">${inlineFormat(trimmed)}</p>`;
      continue;
    }

    // Regular paragraph
    html += `<p style="font-size:15px;line-height:1.8;margin:6px 0;color:var(--muted);">${inlineFormat(trimmed)}</p>`;
  }

  if (inList) html += '</ul>';
  if (inTable) html += '</tbody></table></div>';

  return html;
}
