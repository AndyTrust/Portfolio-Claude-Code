// ═══════════════════════════════════════════════════
// INTELLIGENCE REPORTS RENDERER v2.0
// Daily · Weekly · Monthly views + Calendar picker
// Aggiornato: 27/04/2026
// ═══════════════════════════════════════════════════

let currentReportIndex = 0;
let reportViewMode = 'daily'; // 'daily' | 'weekly' | 'monthly'
let calendarMonth = null; // {year, month} currently displayed

function renderReports() {
  if (typeof INTELLIGENCE_REPORTS === 'undefined' || !INTELLIGENCE_REPORTS.length) return;
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));

  // Init calendar to month of latest report
  if (!calendarMonth) {
    const latestDate = new Date(sorted[0].date);
    calendarMonth = { year: latestDate.getFullYear(), month: latestDate.getMonth() };
  }

  renderReportToolbar(sorted);
  renderCalendarPicker(sorted);

  if (reportViewMode === 'daily') {
    renderReportNav(sorted);
    renderReportContent(sorted[currentReportIndex]);
    renderReportSignalSummary(sorted[currentReportIndex]);
  } else if (reportViewMode === 'weekly') {
    renderWeeklyView(sorted);
  } else if (reportViewMode === 'monthly') {
    renderMonthlyView(sorted);
  }
}

// ─── Toolbar: Daily / Weekly / Monthly + stats ───
function renderReportToolbar(sorted) {
  let toolbar = document.getElementById('report-toolbar');
  if (!toolbar) {
    // Create if missing
    const nav = document.getElementById('report-date-nav');
    if (!nav) return;
    toolbar = document.createElement('div');
    toolbar.id = 'report-toolbar';
    nav.parentNode.insertBefore(toolbar, nav);
  }

  const modes = [
    { id: 'daily', icon: '📅', label: 'Giornaliero' },
    { id: 'weekly', icon: '📆', label: 'Settimanale' },
    { id: 'monthly', icon: '🗓️', label: 'Mensile' },
  ];

  // Stats
  const totalReports = sorted.length;
  const weeks = groupByWeek(sorted);
  const months = groupByMonth(sorted);

  toolbar.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px;">'
    + '<div style="display:flex;gap:6px;">'
    + modes.map(m => '<button class="filter-btn' + (reportViewMode === m.id ? ' active' : '') + '" onclick="setReportView(\'' + m.id + '\')" style="display:flex;align-items:center;gap:5px;">'
      + m.icon + ' ' + m.label + '</button>').join('')
    + '</div>'
    + '<div style="display:flex;gap:12px;font-size:12px;color:var(--dim);">'
    + '<span>📄 <b style="color:var(--muted);">' + totalReports + '</b> report</span>'
    + '<span>📆 <b style="color:var(--muted);">' + Object.keys(weeks).length + '</b> settimane</span>'
    + '<span>🗓️ <b style="color:var(--muted);">' + Object.keys(months).length + '</b> mesi</span>'
    + '<span style="color:var(--green);">🟢 Live: ' + sorted[0].date + '</span>'
    + '</div>'
    + '</div>';
}

function setReportView(mode) {
  reportViewMode = mode;
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));
  renderReportToolbar(sorted);
  renderCalendarPicker(sorted);
  if (mode === 'daily') {
    renderReportNav(sorted);
    renderReportContent(sorted[currentReportIndex]);
    renderReportSignalSummary(sorted[currentReportIndex]);
  } else if (mode === 'weekly') {
    renderWeeklyView(sorted);
  } else if (mode === 'monthly') {
    renderMonthlyView(sorted);
  }
}

// ─── Calendar picker ───
function renderCalendarPicker(sorted) {
  let cal = document.getElementById('report-calendar');
  if (!cal) {
    const nav = document.getElementById('report-date-nav');
    if (!nav) return;
    cal = document.createElement('div');
    cal.id = 'report-calendar';
    nav.parentNode.insertBefore(cal, nav);
  }

  const { year, month } = calendarMonth;
  const reportDates = new Set(sorted.map(r => r.date));
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0

  const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  const dayNames = ['Lu','Ma','Me','Gi','Ve','Sa','Do'];

  let cells = '';
  // Empty cells before first day
  for (let i = 0; i < startDow; i++) cells += '<div></div>';
  // Day cells
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const hasReport = reportDates.has(dateStr);
    const idx = sorted.findIndex(r => r.date === dateStr);
    const isSelected = idx === currentReportIndex && reportViewMode === 'daily';
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    cells += '<div onclick="' + (hasReport ? 'calJumpToReport(\'' + dateStr + '\')' : '') + '" '
      + 'style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:12px;'
      + (hasReport ? 'cursor:pointer;font-weight:700;' : 'color:var(--dim);')
      + (isSelected ? 'background:var(--accent);color:#fff;' : hasReport ? 'background:rgba(99,102,241,.18);color:var(--accent);' : '')
      + (isToday && !isSelected ? 'border:1px solid var(--accent);' : '')
      + '" title="' + (hasReport ? 'Report ' + dateStr : '') + '">'
      + d + (hasReport ? '' : '') + '</div>';
  }

  cal.innerHTML = '<div style="background:var(--surface2);border-radius:10px;padding:12px;margin-bottom:14px;border:1px solid var(--border);">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
    + '<button onclick="calPrevMonth()" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:16px;padding:0 6px;">◀</button>'
    + '<span style="font-size:13px;font-weight:700;color:var(--muted);">' + monthNames[month] + ' ' + year + '</span>'
    + '<button onclick="calNextMonth()" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:16px;padding:0 6px;">▶</button>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(7,28px);gap:2px;justify-content:center;">'
    + dayNames.map(d => '<div style="text-align:center;font-size:10px;color:var(--dim);font-weight:600;">' + d + '</div>').join('')
    + cells
    + '</div>'
    + '<div style="margin-top:8px;font-size:11px;color:var(--dim);text-align:center;">🟣 = report disponibile · clicca per aprire</div>'
    + '</div>';
}

function calPrevMonth() {
  calendarMonth.month--;
  if (calendarMonth.month < 0) { calendarMonth.month = 11; calendarMonth.year--; }
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));
  renderCalendarPicker(sorted);
}
function calNextMonth() {
  calendarMonth.month++;
  if (calendarMonth.month > 11) { calendarMonth.month = 0; calendarMonth.year++; }
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));
  renderCalendarPicker(sorted);
}
function calJumpToReport(dateStr) {
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));
  const idx = sorted.findIndex(r => r.date === dateStr);
  if (idx >= 0) {
    reportViewMode = 'daily';
    currentReportIndex = idx;
    renderReports();
  }
}

// ─── Daily nav (buttons list) ───
function renderReportNav(sorted) {
  const nav = document.getElementById('report-date-nav');
  if (!nav) return;
  // Group by month for display
  const byMonth = {};
  sorted.forEach((r, i) => {
    const d = new Date(r.date);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push({ r, i });
  });

  const monthNames = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  nav.innerHTML = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([key, entries]) => {
    const [y, m] = key.split('-');
    return '<div style="margin-bottom:6px;">'
      + '<div style="font-size:11px;color:var(--dim);font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em;">'
      + monthNames[parseInt(m) - 1] + ' ' + y + '</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:4px;">'
      + entries.map(({ r, i }) => {
          const d = new Date(r.date);
          const label = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
          const isLatest = i === 0;
          return '<button class="filter-btn ' + (i === currentReportIndex ? 'active' : '') + '" onclick="switchReport(' + i + ')" style="position:relative;font-size:12px;padding:4px 8px;">'
            + label + (isLatest ? ' <span class="tab-badge" style="position:static;margin-left:3px;font-size:9px;">LIVE</span>' : '')
            + '</button>';
        }).join('')
      + '</div></div>';
  }).join('');
}

function switchReport(idx) {
  currentReportIndex = idx;
  reportViewMode = 'daily';
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));
  renderReportNav(sorted);
  renderCalendarPicker(sorted);
  renderReportContent(sorted[idx]);
  renderReportSignalSummary(sorted[idx]);
}

// ─── Helper: group by ISO week ───
function groupByWeek(sorted) {
  const weeks = {};
  sorted.forEach((r, i) => {
    const d = new Date(r.date);
    // Get Monday of this week
    const day = d.getDay() === 0 ? 7 : d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - day + 1);
    const key = monday.toISOString().split('T')[0];
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push({ r, i });
  });
  return weeks;
}

// ─── Helper: group by month ───
function groupByMonth(sorted) {
  const months = {};
  sorted.forEach((r, i) => {
    const key = r.date.substring(0, 7); // YYYY-MM
    if (!months[key]) months[key] = [];
    months[key].push({ r, i });
  });
  return months;
}

// ─── Weekly view ───
function renderWeeklyView(sorted) {
  const nav = document.getElementById('report-date-nav');
  const mainContent = document.getElementById('report-main-content');
  const signalSummary = document.getElementById('report-signal-summary');
  if (!nav || !mainContent) return;

  const weeks = groupByWeek(sorted);
  const weekKeys = Object.keys(weeks).sort((a, b) => b.localeCompare(a));

  // Weekly nav
  nav.innerHTML = '<div style="margin-bottom:6px;font-size:11px;color:var(--dim);font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Seleziona Settimana</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:4px;">'
    + weekKeys.map((wk, wi) => {
        const monday = new Date(wk);
        const friday = new Date(wk);
        friday.setDate(monday.getDate() + 4);
        const label = monday.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
          + ' – ' + friday.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
        const reportCount = weeks[wk].length;
        return '<button class="filter-btn' + (wi === 0 ? ' active' : '') + '" onclick="showWeek(\'' + wk + '\')" style="font-size:12px;padding:4px 8px;">'
          + label + ' <span style="font-size:10px;color:var(--dim);">(' + reportCount + ')</span>'
          + '</button>';
      }).join('')
    + '</div>';

  // Show latest week by default
  if (weekKeys.length > 0) renderWeekContent(weekKeys[0], weeks, sorted);
  if (signalSummary) signalSummary.innerHTML = '';
}

function showWeek(weekKey) {
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));
  const weeks = groupByWeek(sorted);
  // Update active button
  document.querySelectorAll('#report-date-nav .filter-btn').forEach((btn, i) => {
    btn.classList.remove('active');
  });
  const weekKeys = Object.keys(weeks).sort((a, b) => b.localeCompare(a));
  const wi = weekKeys.indexOf(weekKey);
  const btns = document.querySelectorAll('#report-date-nav .filter-btn');
  if (btns[wi]) btns[wi].classList.add('active');
  renderWeekContent(weekKey, weeks, sorted);
}

function renderWeekContent(weekKey, weeks, sorted) {
  const mainContent = document.getElementById('report-main-content');
  if (!mainContent) return;
  const entries = weeks[weekKey] || [];
  const monday = new Date(weekKey);
  const friday = new Date(weekKey); friday.setDate(monday.getDate() + 4);

  // Collect all signals from the week's reports
  const weekSignals = {};
  const weekNews = [];
  entries.forEach(({ r }) => {
    // Extract tickers mentioned in report
    const tickerMatches = r.raw.match(/### ([A-Z]{2,5})\s*[—–-]/g) || [];
    tickerMatches.forEach(m => {
      const t = m.replace(/### /, '').replace(/\s*[—–-].*/, '').trim();
      if (!weekSignals[t]) weekSignals[t] = { dates: [], signals: [] };
      weekSignals[t].dates.push(r.date);
      // Extract signal line
      const signalMatch = r.raw.match(new RegExp(t + '[^\\n]*\\n[^\\n]*Segnale[^\\n]*:\\s*([^\\n]+)'));
      if (signalMatch) weekSignals[t].signals.push(signalMatch[1].trim());
    });
  });

  // Weekly summary header
  const weekLabel = monday.toLocaleDateString('it-IT', { day: '2-digit', month: 'long' })
    + ' – ' + friday.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

  let html = '<div style="background:var(--surface2);border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid var(--border);">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
    + '<h3 style="font-size:18px;color:var(--accent2);margin:0;">📆 Report Settimanale</h3>'
    + '<span style="font-size:13px;color:var(--dim);">' + weekLabel + '</span>'
    + '</div>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">'
    + '<span style="font-size:13px;color:var(--muted);">📄 ' + entries.length + ' report questa settimana</span>'
    + '<span style="font-size:13px;color:var(--muted);">🎯 ' + Object.keys(weekSignals).length + ' ticker analizzati</span>'
    + '</div></div>';

  // Days of the week grid
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:20px;">';
  const dayNames = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
  for (let i = 0; i < 5; i++) {
    const dayDate = new Date(weekKey);
    dayDate.setDate(monday.getDate() + i);
    const dateStr = dayDate.toISOString().split('T')[0];
    const dayReport = entries.find(e => e.r.date === dateStr);
    const dayLabel = dayDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });

    html += '<div style="background:var(--surface2);border-radius:10px;padding:12px;border:1px solid var(--border);'
      + (dayReport ? 'border-left:3px solid var(--accent);' : 'opacity:0.5;') + '">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">'
      + '<span style="font-size:13px;font-weight:700;color:var(--muted);">' + dayNames[i] + '</span>'
      + '<span style="font-size:12px;color:var(--dim);">' + dayLabel + '</span>'
      + '</div>';

    if (dayReport) {
      // Extract first paragraph of the report as summary
      const lines = dayReport.r.raw.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('>'));
      const summary = lines.slice(0, 2).join(' ').substring(0, 160) + '…';
      html += '<p style="font-size:12px;color:var(--dim);line-height:1.6;margin:0 0 8px;">' + summary + '</p>'
        + '<button class="filter-btn" onclick="switchReport(' + dayReport.i + ')" style="font-size:11px;padding:3px 8px;">📖 Apri report completo</button>';
    } else {
      html += '<p style="font-size:12px;color:var(--dim);">Nessun report</p>';
    }
    html += '</div>';
  }
  html += '</div>';

  // Weekly performance snapshot from reports
  html += '<div style="background:var(--surface2);border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid var(--border);">'
    + '<h4 style="font-size:15px;color:var(--accent);margin:0 0 10px;">📊 Ticker Analizzati nella Settimana</h4>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
  Object.entries(weekSignals).forEach(([t, data]) => {
    html += '<span class="ticker-link" onclick="openStockModal(\'' + t + '\')" style="font-size:13px;padding:4px 10px;">' + t
      + ' <span style="font-size:10px;color:var(--dim);">×' + data.dates.length + '</span></span>';
  });
  if (Object.keys(weekSignals).length === 0) html += '<span style="color:var(--dim);font-size:13px;">Estrai segnali dai report singoli</span>';
  html += '</div></div>';

  // Full reports for the week
  if (entries.length > 0) {
    html += '<h4 style="font-size:15px;color:var(--muted);margin:0 0 10px;">📋 Report Completi della Settimana</h4>';
    entries.sort((a, b) => b.r.date.localeCompare(a.r.date)).forEach(({ r, i }) => {
      const d = new Date(r.date);
      const label = d.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long' });
      html += '<details style="margin-bottom:10px;background:var(--surface2);border-radius:10px;padding:12px;border:1px solid var(--border);">'
        + '<summary style="cursor:pointer;font-size:14px;font-weight:700;color:var(--accent2);">📅 ' + label + '</summary>'
        + '<div style="margin-top:10px;">' + mdToHtml(r.raw) + '</div>'
        + '</details>';
    });
  }

  mainContent.innerHTML = html;
}

// ─── Monthly view ───
function renderMonthlyView(sorted) {
  const nav = document.getElementById('report-date-nav');
  const mainContent = document.getElementById('report-main-content');
  const signalSummary = document.getElementById('report-signal-summary');
  if (!nav || !mainContent) return;

  const months = groupByMonth(sorted);
  const monthKeys = Object.keys(months).sort((a, b) => b.localeCompare(a));
  const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

  // Monthly nav
  nav.innerHTML = '<div style="margin-bottom:6px;font-size:11px;color:var(--dim);font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Seleziona Mese</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:4px;">'
    + monthKeys.map((mk, mi) => {
        const [y, m] = mk.split('-');
        const count = months[mk].length;
        return '<button class="filter-btn' + (mi === 0 ? ' active' : '') + '" onclick="showMonth(\'' + mk + '\')" style="font-size:12px;padding:4px 10px;">'
          + monthNames[parseInt(m) - 1] + ' ' + y + ' <span style="font-size:10px;color:var(--dim);">(' + count + ')</span>'
          + '</button>';
      }).join('')
    + '</div>';

  if (monthKeys.length > 0) renderMonthContent(monthKeys[0], months, sorted, monthNames);
  if (signalSummary) signalSummary.innerHTML = '';
}

function showMonth(monthKey) {
  const sorted = [...INTELLIGENCE_REPORTS].sort((a, b) => b.date.localeCompare(a.date));
  const months = groupByMonth(sorted);
  const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  const monthKeys = Object.keys(months).sort((a, b) => b.localeCompare(a));
  document.querySelectorAll('#report-date-nav .filter-btn').forEach(btn => btn.classList.remove('active'));
  const mi = monthKeys.indexOf(monthKey);
  const btns = document.querySelectorAll('#report-date-nav .filter-btn');
  if (btns[mi]) btns[mi].classList.add('active');
  renderMonthContent(monthKey, months, sorted, monthNames);
}

function renderMonthContent(monthKey, months, sorted, monthNames) {
  const mainContent = document.getElementById('report-main-content');
  if (!mainContent) return;
  const entries = months[monthKey] || [];
  const [y, m] = monthKey.split('-');
  const monthLabel = monthNames[parseInt(m) - 1] + ' ' + y;

  // Collect all ticker signals and count
  const tickerCount = {};
  entries.forEach(({ r }) => {
    const tickerMatches = r.raw.match(/### ([A-Z]{2,5})\s*[—–-]/g) || [];
    tickerMatches.forEach(tm => {
      const t = tm.replace(/### /, '').replace(/\s*[—–-].*/, '').trim();
      tickerCount[t] = (tickerCount[t] || 0) + 1;
    });
  });
  const topTickers = Object.entries(tickerCount).sort((a, b) => b[1] - a[1]);

  // Weekly breakdown
  const weeks = {};
  entries.forEach(e => {
    const d = new Date(e.r.date);
    const day = d.getDay() === 0 ? 7 : d.getDay();
    const monday = new Date(d); monday.setDate(d.getDate() - day + 1);
    const wk = monday.toISOString().split('T')[0];
    if (!weeks[wk]) weeks[wk] = [];
    weeks[wk].push(e);
  });
  const weekKeys = Object.keys(weeks).sort();

  let html = '<div style="background:var(--surface2);border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid var(--border);">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
    + '<h3 style="font-size:18px;color:var(--accent2);margin:0;">🗓️ Report Mensile — ' + monthLabel + '</h3>'
    + '</div>'
    + '<div style="display:flex;gap:16px;flex-wrap:wrap;">'
    + '<div style="text-align:center;padding:10px 16px;background:var(--surface3);border-radius:8px;">'
    + '<div style="font-size:24px;font-weight:800;color:var(--accent);">' + entries.length + '</div>'
    + '<div style="font-size:11px;color:var(--dim);">Report pubblicati</div></div>'
    + '<div style="text-align:center;padding:10px 16px;background:var(--surface3);border-radius:8px;">'
    + '<div style="font-size:24px;font-weight:800;color:var(--green);">' + weekKeys.length + '</div>'
    + '<div style="font-size:11px;color:var(--dim);">Settimane coperte</div></div>'
    + '<div style="text-align:center;padding:10px 16px;background:var(--surface3);border-radius:8px;">'
    + '<div style="font-size:24px;font-weight:800;color:var(--yellow);">' + topTickers.length + '</div>'
    + '<div style="font-size:11px;color:var(--dim);">Ticker analizzati</div></div>'
    + '</div></div>';

  // Weekly breakdown cards
  html += '<h4 style="font-size:15px;color:var(--muted);margin:0 0 10px;">📆 Settimane del Mese</h4>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:20px;">';
  weekKeys.forEach(wk => {
    const wkEntries = weeks[wk];
    const monday = new Date(wk);
    const friday = new Date(wk); friday.setDate(monday.getDate() + 4);
    const wkLabel = monday.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
      + ' – ' + friday.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    html += '<div style="background:var(--surface2);border-radius:10px;padding:12px;border:1px solid var(--border);border-left:3px solid var(--accent);">'
      + '<div style="font-size:13px;font-weight:700;color:var(--accent2);margin-bottom:6px;">Sett. ' + wkLabel + '</div>'
      + '<div style="font-size:12px;color:var(--dim);margin-bottom:8px;">' + wkEntries.length + ' report pubblicati</div>'
      + wkEntries.map(({ r, i }) => {
          const d = new Date(r.date);
          return '<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">'
            + '<span style="color:var(--dim);">' + d.toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit' }) + '</span>'
            + '<button onclick="switchReport(' + i + ')" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:11px;padding:0;">📖</button>'
            + '</div>';
        }).join('')
      + '</div>';
  });
  html += '</div>';

  // Top tickers
  if (topTickers.length > 0) {
    html += '<div style="background:var(--surface2);border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid var(--border);">'
      + '<h4 style="font-size:15px;color:var(--accent);margin:0 0 10px;">📊 Ticker più Analizzati — ' + monthLabel + '</h4>'
      + '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    topTickers.forEach(([t, count]) => {
      html += '<div style="display:flex;align-items:center;gap:5px;background:var(--surface3);border-radius:20px;padding:4px 10px;">'
        + '<span class="ticker-link" onclick="openStockModal(\'' + t + '\')" style="font-size:13px;">' + t + '</span>'
        + '<span style="font-size:10px;color:var(--dim);">×' + count + '</span>'
        + '</div>';
    });
    html += '</div></div>';
  }

  // Monthly performance context (from market data)
  html += '<div style="background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.2);border-radius:10px;padding:14px;margin-bottom:16px;">'
    + '<h4 style="font-size:15px;color:var(--accent);margin:0 0 8px;">📈 Contesto Mercato — ' + monthLabel + '</h4>'
    + getMonthlyMarketContext(monthKey)
    + '</div>';

  // All reports expandable
  html += '<h4 style="font-size:15px;color:var(--muted);margin:0 0 10px;">📋 Tutti i Report del Mese</h4>';
  entries.sort((a, b) => b.r.date.localeCompare(a.r.date)).forEach(({ r, i }) => {
    const d = new Date(r.date);
    const label = d.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long' });
    html += '<details style="margin-bottom:8px;background:var(--surface2);border-radius:10px;padding:12px;border:1px solid var(--border);">'
      + '<summary style="cursor:pointer;font-size:14px;font-weight:700;color:var(--accent2);">📅 ' + label + '</summary>'
      + '<div style="margin-top:10px;">' + mdToHtml(r.raw) + '</div>'
      + '</details>';
  });

  mainContent.innerHTML = html;
}

// ─── Monthly market context (hardcoded per mesi disponibili) ───
function getMonthlyMarketContext(monthKey) {
  const contexts = {
    '2026-04': '<div class="grid-2" style="gap:10px;margin-top:6px;">'
      + '<div><div style="font-size:12px;color:var(--dim);">S&P 500 performance mese</div><div style="font-size:20px;font-weight:800;color:var(--green);">+8,70%</div></div>'
      + '<div><div style="font-size:12px;color:var(--dim);">NASDAQ performance mese</div><div style="font-size:20px;font-weight:800;color:var(--green);">+15,0%</div></div>'
      + '<div><div style="font-size:12px;color:var(--dim);">Evento chiave</div><div style="font-size:13px;color:var(--muted);">🕊️ Cessate il fuoco Iran/USA</div></div>'
      + '<div><div style="font-size:12px;color:var(--dim);">VIX medio</div><div style="font-size:13px;color:var(--muted);">~20-22 → sceso a 18,71</div></div>'
      + '<div><div style="font-size:12px;color:var(--dim);">Oil WTI</div><div style="font-size:13px;color:var(--muted);">$113 (picco crisi) → $94,40</div></div>'
      + '<div><div style="font-size:12px;color:var(--dim);">Gold</div><div style="font-size:13px;color:var(--muted);">$3.340 (+0,8% mese)</div></div>'
      + '<div><div style="font-size:12px;color:var(--dim);">Earnings season</div><div style="font-size:13px;color:var(--muted);">Q1 2026 · NVDA earnings 20 Maggio</div></div>'
      + '<div><div style="font-size:12px;color:var(--dim);">Fed</div><div style="font-size:13px;color:var(--muted);">HOLD 3,75% — FOMC 28-29 Apr</div></div>'
      + '</div>',
    '2026-03': '<div class="grid-2" style="gap:10px;margin-top:6px;">'
      + '<div><div style="font-size:12px;color:var(--dim);">S&P 500 trend</div><div style="font-size:15px;font-weight:700;color:var(--yellow);">Volatile — crisi Hormuz</div></div>'
      + '<div><div style="font-size:12px;color:var(--dim);">Evento chiave</div><div style="font-size:13px;color:var(--muted);">⚡ Escalation Iran · Oil +25%</div></div>'
      + '<div><div style="font-size:12px;color:var(--dim);">FOMC Marzo</div><div style="font-size:13px;color:var(--muted);">HOLD 3,75% · 1 taglio dot plot 2026</div></div>'
      + '<div><div style="font-size:12px;color:var(--dim);">Gold</div><div style="font-size:13px;color:var(--muted);">ATH $3.350 (safe haven)</div></div>'
      + '</div>',
  };
  return contexts[monthKey] || '<p style="font-size:13px;color:var(--dim);">Dati di contesto non disponibili per questo periodo.</p>';
}

// ─── Main content renderer ───
function renderReportContent(report) {
  const container = document.getElementById('report-main-content');
  if (!container || !report) return;

  const d = new Date(report.date);
  const label = d.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const isToday = report.date === new Date().toISOString().split('T')[0];

  container.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;">'
    + '<div style="display:flex;align-items:center;gap:10px;">'
    + '<h3 style="margin:0;font-size:17px;color:var(--accent2);">📅 ' + label + '</h3>'
    + (isToday ? '<span class="tab-badge">LIVE</span>' : '')
    + '</div>'
    + '<div style="display:flex;gap:6px;">'
    + (currentReportIndex < INTELLIGENCE_REPORTS.length - 1
        ? '<button class="filter-btn" onclick="switchReport(' + (currentReportIndex + 1) + ')" style="font-size:12px;">◀ Precedente</button>'
        : '')
    + (currentReportIndex > 0
        ? '<button class="filter-btn" onclick="switchReport(' + (currentReportIndex - 1) + ')" style="font-size:12px;">Successivo ▶</button>'
        : '')
    + '</div>'
    + '</div>'
    + mdToHtml(report.raw);
}

// ─── Signal summary cards (parsed from MD) ───
function renderReportSignalSummary(report) {
  const container = document.getElementById('report-signal-summary');
  if (!container || !report) return;

  const raw = report.raw;
  const tableMatch = raw.match(/## 📋 Riepilogo Segnali\n([\s\S]*?)(?:\n---|\n## |$)/);
  if (!tableMatch) { container.innerHTML = ''; return; }

  const tableRaw = tableMatch[1];
  const rows = tableRaw.trim().split('\n').filter(l => l.startsWith('|') && !l.match(/^\|[-| ]+\|$/));
  if (rows.length < 2) { container.innerHTML = ''; return; }

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
    return '<div class="stock-card" onclick="openStockModal(\'' + ticker + '\')" style="cursor:pointer;min-width:140px;max-width:180px;">'
      + '<div class="stock-ticker" style="color:' + signalColor + ';font-size:18px;">' + ticker + '</div>'
      + '<div style="font-size:13px;color:var(--muted);margin:2px 0;">' + price + '</div>'
      + '<span class="badge ' + badgeCls + '" style="font-size:11px;">' + signal + '</span>'
      + '<div style="font-size:15px;margin-top:6px;">' + stars + '</div>'
      + '</div>';
  }).join('');

  container.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start;">' + cards + '</div>';
}

// ─── Mini Markdown → HTML converter ───
function mdToHtml(md) {
  if (!md) return '';
  const lines = md.split('\n');
  let html = '';
  let inTable = false;
  let inList = false;
  let tableHeaders = [];

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

    if (inList && !trimmed.startsWith('-') && !trimmed.startsWith('*') && trimmed !== '') {
      html += '</ul>'; inList = false;
    }

    if (trimmed.startsWith('|')) {
      if (trimmed.match(/^\|[-| ]+\|$/)) {
        if (!inTable) {
          inTable = true;
          html += '<div style="overflow-x:auto;margin:10px 0;"><table>';
          if (tableHeaders.length) {
            html += '<thead><tr>' + tableHeaders.map(h => '<th>' + inlineFormat(h) + '</th>').join('') + '</tr></thead><tbody>';
            tableHeaders = [];
          }
        }
        continue;
      }
      const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
      if (!inTable) { tableHeaders = cells; }
      else { html += '<tr>' + cells.map(c => '<td>' + inlineFormat(c) + '</td>').join('') + '</tr>'; }
      continue;
    } else if (inTable) { html += '</tbody></table></div>'; inTable = false; }

    if (trimmed === '---' || trimmed === '***') { html += '<hr style="border-color:var(--border);margin:16px 0;"/>'; continue; }
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) { html += '<h2 class="report-h1" style="font-size:20px;color:var(--accent2);margin:16px 0 8px;">' + inlineFormat(trimmed.slice(2)) + '</h2>'; continue; }
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) { html += '<h3 class="report-h2" style="font-size:16px;color:var(--accent);margin:18px 0 8px;padding-top:8px;border-top:1px solid var(--border);">' + inlineFormat(trimmed.slice(3)) + '</h3>'; continue; }
    if (trimmed.startsWith('### ')) {
      const content = trimmed.slice(4);
      const tickerMatch = content.match(/^([A-Z]{2,5})\s*[—–-]/);
      const ticker = tickerMatch ? tickerMatch[1] : '';
      const styledContent = ticker
        ? content.replace(ticker, '<span class="ticker-link" onclick="openStockModal(\'' + ticker + '\')" style="font-family:monospace;font-size:17px;color:var(--accent2);">' + ticker + '</span>')
        : inlineFormat(content);
      html += '<h4 class="report-h3" style="font-size:15px;font-weight:700;margin:16px 0 6px;display:flex;align-items:center;gap:8px;">' + styledContent + '</h4>';
      continue;
    }
    if (trimmed.startsWith('#### ')) { html += '<h5 style="font-size:14px;color:var(--muted);margin:10px 0 4px;">' + inlineFormat(trimmed.slice(5)) + '</h5>'; continue; }
    if (trimmed.startsWith('> ')) { html += '<blockquote style="border-left:4px solid var(--accent);padding:10px 14px;margin:10px 0;background:rgba(99,102,241,.06);border-radius:0 8px 8px 0;font-size:14px;color:var(--muted);line-height:1.6;">' + inlineFormat(trimmed.slice(2)) + '</blockquote>'; continue; }
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) { html += '<ol style="margin:8px 0 8px 20px;font-size:15px;line-height:1.8;">'; inList = true; }
      html += '<li>' + inlineFormat(trimmed.replace(/^\d+\.\s/, '')) + '</li>'; continue;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { html += '<ul style="margin:8px 0 8px 18px;font-size:15px;line-height:1.8;">'; inList = true; }
      html += '<li>' + inlineFormat(trimmed.slice(2)) + '</li>'; continue;
    }
    if (trimmed === '') { if (inList) { html += '</ul>'; inList = false; } continue; }
    if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) { html += '<p style="font-size:13px;color:var(--dim);font-style:italic;margin:6px 0;">' + inlineFormat(trimmed) + '</p>'; continue; }
    html += '<p style="font-size:15px;line-height:1.8;margin:6px 0;color:var(--muted);">' + inlineFormat(trimmed) + '</p>';
  }

  if (inList) html += '</ul>';
  if (inTable) html += '</tbody></table></div>';
  return html;
}
