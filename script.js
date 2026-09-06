/* ═══════ Milan Dahal — Portfolio Logic (data-driven) ═══════ */
'use strict';

/* ─── Helpers ─── */
const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, m =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

const D = window.PORTFOLIO_DATA;
const P = D.profile;
const EMAIL = P.email;
const GITHUB = P.github;
const LINKEDIN = P.linkedin;

/* ─── File model (maps "repo files" → rendered sections) ─── */
const FILES = [
  { name: 'index.html',        icon: 'html', lang: 'HTML',     title: 'Home' },
  { name: 'about.md',          icon: 'md',   lang: 'Markdown', title: 'About Me' },
  { name: 'experience.json',   icon: 'json', lang: 'JSON',     title: 'Work Experience' },
  { name: 'skills.json',       icon: 'json', lang: 'JSON',     title: 'Skills' },
  { name: 'projects.json',     icon: 'json', lang: 'JSON',     title: 'My Work' },
  { name: 'contact.html',      icon: 'html', lang: 'HTML',     title: 'Contact' },
];
const FILE_BY_NAME = Object.fromEntries(FILES.map(f => [f.name, f]));
const PANEL_BY_NAME = {
  'index.html': 'panel-home', 'about.md': 'panel-about',
  'experience.json': 'panel-experience', 'skills.json': 'panel-skills',
  'projects.json': 'panel-projects', 'contact.html': 'panel-contact',
};

/* ─── State ─── */
let currentFile = 'index.html';
let projFilter = 'All';
let notifications = [];
let palIndex = 0, palFiltered = [];
let liveAvatar = null;

/* ─── Themes ─── */
const THEMES = [
  { id:'blue',   name:'Blueprint',   accent:'#007acc', accent2:'#4fc1ff', status:'#007acc', hover:'#0069b1', select:'#04395e' },
  { id:'orange', name:'Ember',       accent:'#e67e22', accent2:'#f5b041', status:'#ca6f1e', hover:'#d3721d', select:'#5d2f0b' },
  { id:'purple', name:'Ambience',    accent:'#8e44ad', accent2:'#c9a8ff', status:'#7d3c99', hover:'#7a3b94', select:'#3b1d4b' },
  { id:'green',  name:'Grove',       accent:'#27ae60', accent2:'#7edda0', status:'#1e8443', hover:'#229954', select:'#0c3a20' },
  { id:'red',    name:'Lava',        accent:'#e74c3c', accent2:'#ff9e97', status:'#c0392b', hover:'#cf3a2b', select:'#4e120c' },
  { id:'cyan',   name:'Cyberspace',  accent:'#00a8a8', accent2:'#59d3d3', status:'#008c8c', hover:'#008e8e', select:'#033a3a' },
];

/* ─── Settings (persisted) ─── */
const SETTINGS_KEY = 'milan-portfolio-settings-v2';
const defaultSettings = { accent: 'blue', fontSize: 14, terminal: true, animations: true, darkMode: true };
let settings = loadSettings();

function loadSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch { return { ...defaultSettings }; }
}
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
}
function applySettings() {
  const t = THEMES.find(x => x.id === settings.accent) || THEMES[0];
  const dark = settings.darkMode !== false;
  /* light-mode variants for each accent (better contrast on light background) */
  const LIGHT = {
    blue:   { a2: '#1f8fd7', sel: '#cae6ff' },
    orange: { a2: '#c07a1d', sel: '#ffe0b0' },
    purple: { a2: '#8a5cc4', sel: '#e6d4ff' },
    green:  { a2: '#1e9149', sel: '#d2f2dd' },
    red:    { a2: '#cf5242', sel: '#ffd9d4' },
    cyan:   { a2: '#008f8f', sel: '#c9f2f2' },
  };
  const l = LIGHT[t.id] || LIGHT.blue;
  const r = document.documentElement.style;
  r.setProperty('--accent', t.accent);
  r.setProperty('--accent2', dark ? t.accent2 : l.a2);
  r.setProperty('--status', t.status);
  r.setProperty('--accent-hover', t.hover);
  r.setProperty('--select-bg', dark ? t.select : l.sel);
  document.documentElement.dataset.accent = t.id;
  r.setProperty('--fs', settings.fontSize + 'px');
  document.body.classList.toggle('no-anim', !settings.animations);
  toggleTerminal(settings.terminal);

  /* Dark / light mode */
  document.body.classList.toggle('light', !dark);
  const sm = $('#status-mode');
  if (sm) sm.textContent = dark ? '🌙 Dark' : '☀️ Light';
  const th = $('#btn-theme');
  if (th) th.title = dark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

/* ─── Notifications ─── */
function notify(type, title, message, file) {
  notifications.unshift({ id: Date.now() + Math.random(), type, title, message, file, read: false });
  if (notifications.length > 20) notifications.pop();
  renderNotifBadge();
  renderNotifList();
  toast(type, title);
}
function renderNotifBadge() {
  const unread = notifications.filter(n => !n.read).length;
  $('#notif-badge').textContent = unread > 0 ? unread : '';
  $('#notif-badge').style.display = unread ? 'block' : 'none';
}
function renderNotifList() {
  const list = $('#notif-list');
  if (!notifications.length) {
    list.innerHTML = '<li class="notif-empty">No notifications yet 🎉</li>';
    return;
  }
  list.innerHTML = notifications.map(n =>
    `<li class="notif-item ${n.read ? 'read' : ''}" data-id="${n.id}" ${n.file ? `data-nfile="${n.file}"` : ''}>
      <span class="notif-icon ${n.type}">${n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : 'ℹ'}</span>
      <div class="notif-txt"><b>${esc(n.title)}</b><span>${esc(n.message)}</span></div>
    </li>`).join('');
}

/* ─── Toasts ─── */
function toast(type, msg) {
  const box = document.createElement('div');
  box.className = 'toast ' + type;
  box.innerHTML = `<span class="toast-ico">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(box);
  requestAnimationFrame(() => box.classList.add('show'));
  setTimeout(() => { box.classList.remove('show'); setTimeout(() => box.remove(), 350); }, 4200);
}
/* ─── Sidebar ─── */
function buildSidebar() {
  $('#profile-card').innerHTML = `
    <div class="pc-avatar">${liveAvatar || esc(P.avatarEmoji)}</div>
    <div class="pc-meta">
      <div class="pc-name">${esc(P.name)}</div>
      <div class="pc-role">${esc((D.about || {}).role || 'Web Developer')}</div>
      <span class="pc-status ${P.status === 'Open to work' ? 'green' : ''}"><i></i>${esc(P.status)}</span>
    </div>`;


    $('#file-tree').innerHTML = FILES.map(f =>
    `<li class="file-item ${f.name === currentFile ? 'active' : ''}" data-file="${f.name}">
       <span class="dot ${f.icon}"></span>${f.name}</li>`).join('');

  $('#outline').innerHTML = FILES.map(f =>
    `<li class="file-item ${f.name === currentFile ? 'active' : ''}" data-file="${f.name}">
       <span class="dot ${f.icon}"></span>${esc(f.title)}</li>`).join('');

  $('#timeline').innerHTML = (D.commits || []).map(c =>
    `<li title="${esc(c.msg)}">✦ ${esc(c.msg)}<small>${esc(c.time)}</small></li>`).join('');

  $('#drawer-list').innerHTML = FILES.map(f =>
    `<li class="file-item ${f.name === currentFile ? 'active' : ''}" data-file="${f.name}">
       <span class="dot ${f.icon}"></span>${f.name} <small>— ${esc(f.title)}</small></li>`).join('');

  $('#explorer-badge').textContent = FILES.length;
}

/* ─── Tabs ─── */
function buildTabs() {
  $('#tabs').innerHTML = FILES.map(f =>
    `<button class="tab ${f.name === currentFile ? 'active' : ''}" data-file="${f.name}" title="Go to ${esc(f.title)}">
       <span class="dot ${f.icon}"></span>${f.name}
     </button>`).join('');
}

/* ─── Navigation — single-page scroll ─── */
function panelTop(name) {
  const panel = document.getElementById(PANEL_BY_NAME[name]);
  if (!panel) return 0;
  const vp = $('#viewport');
  return panel.getBoundingClientRect().top - vp.getBoundingClientRect().top + vp.scrollTop;
}
function openFile(name, smooth = true) {
  if (!FILE_BY_NAME[name]) return;
  currentFile = name;
  $('#viewport').scrollTo({ top: Math.max(0, panelTop(name) - 6), behavior: smooth ? 'smooth' : 'auto' });
  if (name === 'skills.json') renderSkills();
  if (name === 'projects.json') renderProjects();
  updateNav();
}
function nextTab(dir) {
  const i = FILES.findIndex(f => f.name === currentFile);
  const n = FILES[(i + dir + FILES.length) % FILES.length];
  if (n) openFile(n.name);
}
/* Active-section highlight (scroll spy) */
function updateNav() {
  buildTabs();
  buildSidebar();
  const f = FILE_BY_NAME[currentFile];
  if (!f) return;
  $('#breadcrumb').innerHTML =
    `milan_portfolio <span class="sep">›</span> <span class="crumb-active">${currentFile}</span>`;
  $('#status-lang').textContent = f.lang;
  document.title = `${f.title} — ${D.meta.name}`;
}
let spyQueued = false;
function updateActiveSection() {
  if (spyQueued) return;
  spyQueued = true;
  requestAnimationFrame(() => {
    spyQueued = false;
    const vp = $('#viewport');
    const vr = vp.getBoundingClientRect();
    const threshold = 120;
    let best = null;
    FILES.forEach(f => {
      const panel = document.getElementById(PANEL_BY_NAME[f.name]);
      if (!panel) return;
      const pr = panel.getBoundingClientRect();
      if (pr.top - vr.top <= threshold && pr.bottom - vr.top > 0) best = f.name;
    });
    if (!best) best = FILES[FILES.length - 1].name;
    if (best && best !== currentFile) { currentFile = best; updateNav(); }
  });
}
/* ─── Shared Contact CTA block (shown at the end of every section) ─── */
function ctaBlock() {
  return `
    <div class="panel-cta">
      <div class="panel-cta-text">
        <strong>Have a project in mind? Let's talk 🚀</strong>
        <span>Available for freelance &amp; full-time work in Kathmandu and remotely.</span>
      </div>
      <div class="panel-cta-btns">
        <button class="btn-primary" data-file="contact.html">Contact Me</button>
        <a class="btn-ghost" href="mailto:${EMAIL}">✉ ${EMAIL}</a>
      </div>
    </div>`;
}
/* ─── Render: Home (hero) ─── */
let typeTimer = null;
function renderHome() {
  const sec = $('#panel-home');
  const stats = (P.stats || []).map(s =>
    `<div class="stat"><b>${s.value}</b><span>${esc(s.label)}</span></div>`).join('');
  sec.innerHTML = `
    <div class="hero">
      <p class="hero-comment">${esc(P.hello)}</p>
      <h1 class="hero-name">${esc(P.name)} <span class="wave">${P.wave}</span></h1>
      <p class="hero-line">${esc(P.status)} / <span class="typewriter" id="typewriter"></span><span class="caret"></span></p>
      <p class="hero-desc">${esc(P.intro)}</p>
      <div class="hero-stats">${stats}</div>
      <div class="hero-actions">
        <button class="btn-primary" data-file="contact.html">Contact Me</button>
        <button class="btn-ghost" data-action="resume">⤓ Resume</button>
        <a class="btn-ghost" href="${GITHUB}" target="_blank" rel="noopener">GitHub</a>
        <a class="btn-ghost" href="${LINKEDIN}" target="_blank" rel="noopener">LinkedIn</a>
      </div>
      <p class="hero-footer">↓ navigate with the file explorer, tabs, search, or Ctrl+Shift+P</p>
      ${ctaBlock()}
    </div>`;
  startTypewriter();
}

/* ─── Typewriter ─── */
function startTypewriter() {
  const el = $('#typewriter');
  if (!el) return;
  let r = 0, c = 0, deleting = false;
  clearTimeout(typeTimer);
  (function tick() {
    const word = P.roles[r];
    if (el) el.textContent = word.slice(0, c);
    if (!deleting) {
      c++;
      if (c > word.length) { deleting = true; typeTimer = setTimeout(tick, 1800); return; }
    } else {
      c -= 1;
      if (c === 0) { deleting = false; r = (r + 1) % (P.roles || ['Developer']).length; }
    }
    typeTimer = setTimeout(tick, deleting ? 45 : 95);
  })();
}

/* ─── Render: About ─── */
function renderAbout() {
  const a = D.about;
  const langs = (a.languages || []).map(l =>
    `<li>${esc(l.name)} — ${esc(l.level)}</li>`).join('');
  const paras = (a.paragraphs || []).map(p => `<p class="md-body">${esc(p)}</p>`).join('');
  const tags = (a.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('');
  const sec = $('#panel-about');
  sec.innerHTML = `
    <p class="sec-comment">// about.md — rendered preview</p>
    <h2>About Me</h2>
    <p class="md-sub">${esc(a.heading)}</p>
    <h3 class="md-name"><span class="hash">#</span> ${esc(P.name)}</h3>
    <p class="md-sub role-line">${esc(a.role)}</p>
    ${paras}
    <div class="about-grid">
      <div><h4>▪ Languages</h4><ul>${langs}</ul></div>
      <div><h4>▪ Education</h4><ul>
        <li>${esc(a.education.degree)} — ${esc(a.education.institute)}</li>
        <li>${esc(a.education.city)}</li></ul></div>
      <div><h4>▪ Location</h4><ul>
        <li>${esc(a.location.city)} 🇳🇵</li>
        <li>Timezone — ${esc(a.location.tz)}</li></ul></div>
    </div>
    ${tags ? `<div class="about-tags"><h4>▪ Interests</h4><div class="chips">${tags}</div></div>` : ''}
    ${ctaBlock()}`;
}
/* ─── Render: Experience ─── */
function renderExperience() {
  const items = (D.experience || []).map(e => `
    <div class="t-item">
      <span class="t-dot"></span>
      <div class="t-card">
        <div class="t-period">${esc(e.period)}</div>
        <h3>${esc(e.role)}</h3>
        <div class="t-company">${esc(e.company)} · ${esc(e.location)}</div>
        <ul>${(e.bullets || []).map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        <div class="tags">${(e.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
      </div>
    </div>`).join('');
  $('#panel-experience').innerHTML = `
    <p class="sec-comment">// experience.json — work history</p>
    <h2>Work Experience</h2>
    <p class="md-sub">Developer with a passion for building things for the web</p>
    <div class="timeline">${items}</div>
    ${ctaBlock()}`;
}

/* ─── Render: Skills ─── */
function renderSkills() {
  const S = D.skills;
  const barGroup = (title, list, cls) => `
    <div class="skill-group">
      <h4>// ${title}</h4>
      <div class="skill-bars ${cls}">
        ${(list || []).map((s, i) => `
          <div class="sbar">
            <div class="sbar-head"><span>${esc(s.name)}</span><b>${s.level}%</b></div>
            <div class="sbar-track"><div class="sbar-fill" data-w="${s.level}" style="transition-delay:${i * 60}ms"></div></div>
          </div>`).join('')}
      </div>
    </div>`;
  const chipGroup = (title, list, cls) => `
    <div class="skill-group">
      <h4>// ${title}</h4>
      <div class="chips">
        ${(list || []).map(s => `<span class="chip ${cls}">${esc(s.name)}</span>`).join('')}
      </div>
    </div>`;
  $('#panel-skills').innerHTML = `
    <p class="sec-comment">// skills.json — tech stack</p>
    <h2>Skills</h2>
    <p class="md-sub">Under the hood: <em>Languages</em> with proficiency, plus the <em>tools</em> I use every day.</p>
    ${barGroup('Programming Languages', S.languages, 'lang')}
    ${chipGroup('Frontend', S.frontend, 'front')}
    ${chipGroup('Backend', S.backend, 'back')}
    ${chipGroup('Tools & Platforms', S.tools, 'tool')}
    ${ctaBlock()}`;
  animateBars();
}
function animateBars() {
  requestAnimationFrame(() => {
    $$('#panel-skills .sbar-fill').forEach((b) => { b.style.width = b.dataset.w + '%'; });
  });
}
/* ─── Render: Projects ─── */
function renderProjects() {
  // Handle loading state - if projects array is empty, show loading message
  if (!D.projects || D.projects.length === 0) {
    $('#panel-projects').innerHTML = `
      <p class="sec-comment">// projects.json — loading from GitHub...</p>
      <h2>My Work</h2>
      <p class="md-sub">Fetching your latest projects from GitHub...</p>
      <div class="cards">
        <p class="md-sub">Loading...</p>
      </div>
      ${ctaBlock()}
    `;
    return;
  }

  const cats = ['All', ...new Set((D.projects || []).map(p => p.category))];
  const shown = D.projects.filter(p => projFilter === 'All' || p.category === projFilter);
  const filterChips = cats.map(c =>
    `<button class="proj-filter ${c === projFilter ? 'active' : ''}" data-cat="${esc(c)}">
       ${esc(c)} <small>(${(c === 'All' ? D.projects : D.projects.filter(p => p.category === c)).length})</small>
     </button>`).join('');
  const cards = shown.map(p => `
    <article class="card" data-title="${esc(p.title)}" tabindex="0" role="button" aria-label="View ${esc(p.title)}">
      <div class="card-icon">${p.emoji}</div>
      <span class="card-cat">${esc(p.category)}</span>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.blurb)}</p>
      <div class="tags">${(p.tags || []).slice(0, 3).map(t => `<span>${esc(t)}</span>`).join('')}</div>
      <span class="learn-more">Learn more →</span>
    </article>`).join('');
  $('#panel-projects').innerHTML = `
    <p class="sec-comment">// projects.json — some of my work</p>
    <h2>My Work</h2>
    <p class="md-sub">Click any card for full details</p>
    <div class="proj-filters">${filterChips}</div>
    <div class="cards">
      ${cards || '<p class="md-sub">No projects in this category yet.</p>'}
    </div>
    ${ctaBlock()}`;
}

/* ─── Project detail modal ─── */
function openProject(title) {
  const p = (D.projects || []).find(x => x.title === title);
  if (!p) return;
  const links = [
    p.links.github ? `<a class="btn-ghost" href="${esc(p.links.github)}" target="_blank" rel="noopener">🐙 View source</a>` : '',
    p.links.live ? `<a class="btn-ghost" href="${esc(p.links.live)}" target="_blank" rel="noopener">🔗 Live demo</a>` : '',
    `<button class="btn-primary" data-action="contact">✉ Contact about this</button>`,
  ].filter(Boolean).join('');
  $('#project-body').innerHTML = `
    <div class="pm-head">
      <div class="pm-emoji">${p.emoji}</div>
      <div>
        <h3>${esc(p.title)}</h3>
        <span class="card-cat">${esc(p.category)}</span>
      </div>
    </div>
    <p class="pm-desc">${esc(p.description)}</p>
    <h4>✦ Features</h4>
    <ul class="pm-features">${(p.features || []).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    <h4>✦ Stack</h4>
    <div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
    <div class="pm-actions">${links}</div>`;
  $('#project-overlay').classList.add('open');
}
function closeProject() { $('#project-overlay').classList.remove('open'); }

/* ─── Render: Contact ─── */
function renderContact() {
  $('#panel-contact').innerHTML = `
    <p class="sec-comment">// contact.html — get in touch</p>
    <h2>Contact Me</h2>
    <p class="md-sub">Get in contact and let's work together 🚀</p>
    <form class="form" id="contact-form">
      <input type="hidden" name="access_key" value="1728634c-6458-4533-85b7-51489b1853a2" />
      <input type="checkbox" name="botcheck" id="cf-botcheck" style="display:none" tabindex="-1" autocomplete="off" />
      <div class="field"><label for="cf-name">const name =</label>
        <input id="cf-name" name="name" type="text" placeholder='"Your Name"' required /></div>
      <div class="field"><label for="cf-email">const email =</label>
        <input id="cf-email" name="email" type="email" placeholder='"you@example.com"' required /></div>
      <div class="field"><label for="cf-message">const message =</label>
        <textarea id="cf-message" name="message" placeholder='"Hi Milan, I have an opportunity for you..."' required></textarea></div>
      <button class="btn-primary" type="submit">Send Message ↵</button>
    </form>
    <div class="contact-alt">
      <span>📧 <a href="mailto:${EMAIL}">${EMAIL}</a></span>
      <button class="copy-btn" id="copy-email" type="button">copy email</button>
      <span>📍 ${esc(P.location)}</span>
      <span>🐙 <a href="${GITHUB}" target="_blank" rel="noopener">GitHub</a></span>
      <span>💼 <a href="${LINKEDIN}" target="_blank" rel="noopener">LinkedIn</a></span>
    </div>`;
}
/* ─── Search (Find in files) ─── */
let SEARCH_INDEX = [];
function buildSearchIndex() {
  const add = (file, text) => { if (text) SEARCH_INDEX.push({ file, text: text.toLowerCase(), raw: text }); };
  add('index.html', [P.name, P.status, P.location, P.intro, ...(P.roles||[])].join(' '));
  const a = D.about || {};
  add('about.md', [a.heading, a.role, ...(a.paragraphs||[]), ...(a.languages||[]).map(l=>l.name+' '+l.level), a.education?.degree, a.education?.institute].join(' '));
  (D.experience||[]).forEach(e =>
    add('experience.json', [e.role, e.company, e.location, ...(e.bullets||[]), ...(e.tags||[])].join(' ')));
  const S = D.skills || {};
  Object.values(S).forEach(list => (list||[]).forEach(s => add('skills.json', s.name + ' ' + s.level)));
  (D.projects||[]).forEach(p =>
    add('projects.json', [p.title, p.blurb, p.description, p.category, ...(p.tags||[])].join(' ')));
  add('contact.html', [EMAIL, P.location, GITHUB, LINKEDIN, 'contact hire email'].join(' '));
}

function openSearch() { $('#search-overlay').classList.add('open'); $('#search-input').value = ''; renderSearch(''); $('#search-input').focus(); }
function closeSearch() { $('#search-overlay').classList.remove('open'); }
function renderSearch(q) {
  const list = $('#search-results');
  const ql = q.toLowerCase().trim();
  const results = ql ? SEARCH_INDEX
    .filter(e => e.text.includes(ql))
    .map(e => ({ ...e, idx: e.text.indexOf(ql) }))
    .sort((x, y) => x.idx - y.idx)
    .slice(0, 15) : [];
  $('#search-count').textContent = ql ? `${results.length} result${results.length === 1 ? '' : 's'} (of ${SEARCH_INDEX.length} entries)` : 'Start typing to search…';
  list.innerHTML = results.length ? results.map(r => {
    const s = r.idx - 40 > 0 ? '…' : '';
    const snippet = s + r.raw.slice(Math.max(0, r.idx - 40), r.idx + 60);
    return `<li class="search-result" data-file="${r.file}">
      <span class="sf-ico"><span class="dot ${FILE_BY_NAME[r.file].icon}"></span></span>
      <div class="sf-main"><b>${esc(r.file)}</b><span class="sf-snippet">${esc(snippet)}</span></div>
      <span class="sf-go">→</span></li>`;
  }).join('') : (ql ? '<li class="search-empty">No matches found</li>' : '<li class="search-empty">Try "react", "backend", "university"…</li>');
}

/* ─── Command palette ─── */
function buildCommands() {
  const cmds = [];
  FILES.forEach(f => cmds.push({ label: `Go to ${f.name} — ${f.title}`, hint: 'file', run: () => openFile(f.name) }));
  cmds.push(
    { label: 'Toggle Terminal', hint: 'Ctrl+`', run: () => toggleTerminal() },
    { label: 'Toggle Sidebar', hint: 'Ctrl+B', run: () => document.body.classList.toggle('mini') },
    { label: settings.darkMode !== false ? 'Switch to Light Mode' : 'Switch to Dark Mode', hint: 'dark ⇄ light', run: toggleDark },
    { label: 'Find in Files', hint: 'Ctrl+F', run: openSearch },
    { label: 'Copy Email Address', hint: EMAIL, run: copyEmail },
    { label: 'Download Resume (.txt)', hint: 'pdf → txt', run: downloadResume },
    { label: 'Open GitHub Profile', hint: 'web', run: () => window.open(GITHUB, '_blank') },
    { label: 'Open LinkedIn Profile', hint: 'web', run: () => window.open(LINKEDIN, '_blank') },
    { label: 'Open Settings', hint: 'gear', run: openSettings },
    ...THEMES.map(t => ({ label: `Theme: ${t.name}`, hint: t.accent, run: () => setAccent(t.id) })),
    { label: 'Hire Milan Dahal', hint: '!', run: () => openFile('contact.html') },
    { label: '🥷 Matrix rain (terminal)', hint: 'easter egg', run: () => { toggleTerminal(true); matrixRain(); } },
    { label: 'Refresh Projects from GitHub', hint: '🔄', run: () => { fetchGitHubProjects(); } },
  );
  return cmds;
}
let PALETTE = [];
function openPalette() {
  PALETTE = buildCommands();
  palIndex = 0;
  $('#palette-overlay').classList.add('open');
  $('#palette-input').value = '';
  renderPalette(PALETTE);
  $('#palette-input').focus();
}
function closePalette() { $('#palette-overlay').classList.remove('open'); }
function renderPalette(list) {
  palFiltered = list;
  const el = $('#palette-list');
  el.innerHTML = palFiltered.map((c, i) =>
    `<li class="${i === palIndex ? 'selected' : ''}" data-i="${i}">
       <span>${esc(c.label)}</span><span class="cmd-hint">${esc(c.hint)}</span>
     </li>`).join('') || '<li class="search-empty">No matching commands</li>';
}
/* ─── Terminal ─── */
function tprint(text, cls = 'info') {
  const body = $('#terminal-body');
  if (!body) return;
  const line = document.createElement('div');
  line.className = `t-line ${cls}`;
  line.textContent = text;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}
function toggleTerminal(force) {
  const panel = $('#terminal-panel');
  const show = force !== undefined ? force : panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !show);
}
function runCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;
  tprint(`milan@portfolio:~$ ${raw}`, 'cmd');
  const p = D.profile;
  switch (cmd.split(' ')[0]) {
    case 'help': case '?':
      tprint('Available commands:');
      ['help      — show this list','whoami    — who is Milan?','about     — quick bio','experience— work history','skills    — tech stack','projects  — my work list','education — study background','email     — get email','socials   — GitHub / LinkedIn','resume    — download resume','theme <id>— blue|orange|purple|green|red|cyan | dark/light','hire      — open contact form','matrix    — 🥷 wake up...','clear     — clear terminal','date      — Kathmandu time'].forEach(l => tprint('  ' + l));
      break;
    case 'whoami': tprint(`${p.name} — ${D.about.role} from ${p.location} ${D.meta.flag}`, 'ok'); break;
    case 'about': (D.about.paragraphs || []).forEach(x => tprint(x, 'info')); break;
    case 'experience': (D.experience || []).forEach(e => tprint(`${e.period} — ${e.role} @ ${e.company}`, 'ok')); break;
    case 'skills': Object.entries(D.skills || {}).forEach(([g, list]) => tprint(`${g}: ${list.map(s => `${s.name} ${s.level}%`).join(' · ')}`, 'ok')); break;
    case 'projects': (D.projects || []).forEach(x => tprint(`${x.emoji} ${x.title} [${x.category}]`, 'ok')); break;
    case 'education': tprint(`${D.about.education.degree} — ${D.about.education.institute}, ${D.about.education.city}`, 'ok'); break;
    case 'email': tprint(EMAIL, 'ok'); break;
    case 'socials': tprint('GitHub: ' + GITHUB, 'ok'); tprint('LinkedIn: ' + LINKEDIN, 'ok'); break;
    case 'resume': tprint('Generating resume... 📄', 'info'); downloadResume(); break;
    case 'theme': {
      const arg = cmd.split(' ')[1];
      if (arg === 'dark' || arg === 'light') {
        settings.darkMode = (arg === 'dark');
        saveSettings(); applySettings(); renderSettings();
        tprint(`Mode set to ${arg} mode. ${arg === 'dark' ? '🌙' : '☀️'}`, 'ok');
      } else { setAccent(arg || settings.accent); }
      break;
    }
    case 'matrix': matrixRain(); break;
    case 'hire': tprint('Excellent choice! Opening contact form... 🚀', 'ok'); openFile('contact.html'); break;
    case 'clear': $('#terminal-body').innerHTML = ''; break;
    case 'date': tprint(kathmanduTime(), 'ok'); break;
    default: tprint(`command not found: ${cmd} — type 'help'`, 'err');
  }
}
function matrixRain() {
  const body = $('#terminal-body');
  body.innerHTML = '';
  let runs = 0;
  const iv = setInterval(() => {
    let row = '';
    for (let i = 0; i < 46; i++) row += Math.random() > 0.5 ? '1' : '0';
    const line = document.createElement('div');
    line.className = 't-line matrix'; line.textContent = row;
    body.appendChild(line); body.scrollTop = body.scrollHeight;
    if (++runs > 30) { clearInterval(iv); tprint('Wake up, Neo... ☕', 'ok'); }
  }, 70);
}
const kathmanduTime = () => new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit',
  day: '2-digit', month: 'short', year: 'numeric', hour12:false,
}).format(new Date());
/* ─── Copy email / Resume ─── */
function copyEmail() {
  navigator.clipboard.writeText(EMAIL).then(() => {
    toast('success', 'Email copied to clipboard');
    notify('success', 'Email copied', EMAIL);
  }).catch(() => tprint(EMAIL, 'info'));
}
function downloadResume() {
  const a = D.about;
  let txt = `${P.name.toUpperCase()}\n${'='.repeat(25)}\n${a.role}\n${P.location} · ${EMAIL}\nGitHub: ${GITHUB}\n\n`;
  txt += '▸ EXPERIENCE\n';
  (D.experience || []).forEach(e => {
    txt += `\n${e.period}   ${e.role}\n${e.company} — ${e.location}\n`;
    (e.bullets || []).forEach(b => txt += `   • ${b}\n`);
  });
  txt += '\n▸ SKILLS\n';
  Object.entries(D.skills || {}).forEach(([g, list]) => txt += `${g}: ${list.map(s => s.name).join(', ')}\n`);
  txt += '\n▸ PROJECTS\n';
  (D.projects || []).forEach(p => txt += `• ${p.title} — ${p.blurb}\n`);
  const blob = new Blob([txt], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Milan_Dahal_Resume.txt';
  link.click();
  URL.revokeObjectURL(link.href);
  toast('success', 'Resume downloaded: Milan_Dahal_Resume.txt');
  notify('success', 'Resume downloaded', 'Milan_Dahal_Resume.txt is ready 📄');
}

/* ─── Theme ─── */
function toggleDark() {
  settings.darkMode = (settings.darkMode !== false) ? false : true;
  saveSettings(); applySettings(); renderSettings();
  toast('success', settings.darkMode ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️');
}
function setAccent(id) {
  const t = THEMES.find(x => x.id === id);
  if (!t) { tprint(`Unknown theme: ${id}`, 'err'); return; }
  settings.accent = id;
  applySettings(); saveSettings();
  renderSettings();
  document.body.classList.add('pop');
  setTimeout(() => document.body.classList.remove('pop'), 400);
}

/* ─── Settings modal ─── */
function openSettings() {
  renderSettings();
  $('#settings-overlay').classList.add('open');
}
function closeSettings() { $('#settings-overlay').classList.remove('open'); }
function renderSettings() {
  const swatches = THEMES.map(t =>
    `<button class="theme-swatch ${t.id === settings.accent ? 'active' : ''}" data-theme="${t.id}" title="${t.name}"
       style="--sw: ${t.accent}"><i></i><span>${t.name}</span></button>`).join('');
  $('#settings-body').innerHTML = `
    <div class="set-block"><h4>Color Theme</h4><div class="theme-grid">${swatches}</div></div>
    <div class="set-block">
      <h4>Editor Font Size <b id="fs-val">${settings.fontSize}px</b></h4>
      <input type="range" min="12" max="18" step="1" value="${settings.fontSize}" id="fs-range" />
    </div>
    <div class="set-block toggles">
      <label><input type="checkbox" id="set-dark" ${settings.darkMode !== false ? 'checked' : ''}/> Dark mode (VS Code theme)</label>
      <label><input type="checkbox" id="set-terminal" ${settings.terminal ? 'checked' : ''}/> Show terminal panel</label>
      <label><input type="checkbox" id="set-anim" ${settings.animations ? 'checked' : ''}/> Enable animations</label>
      <button class="btn-ghost small" id="set-reset">Reset settings</button>
    </div>`;
}
/* ─── Global delegated clicks ─── */
function runAction(a) {
  return {
    resume: downloadResume,
    github: () => window.open(GITHUB, '_blank'),
    linkedin: () => window.open(LINKEDIN, '_blank'),
    settings: openSettings,
    search: openSearch,
    contact: () => openFile('contact.html'),
    copyEmail,
  }[a];
}
document.addEventListener('click', (e) => {
  // File open → scroll to section
  const fl = e.target.closest('[data-file]');
  if (fl) {
    if (fl.classList.contains('disabled')) return;
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    openFile(fl.dataset.file);
    return;
  }
  // Generic actions
  const ac = e.target.closest('[data-action]');
  if (ac) { const f = runAction(ac.dataset.action); if (f) f(); return; }
  // Project card
  const pc = e.target.closest('.card[data-title]');
  if (pc) { openProject(pc.dataset.title); return; }
  // Project filter
  const pf = e.target.closest('.proj-filter[data-cat]');
  if (pf) { projFilter = pf.dataset.cat; renderProjects(); return; }
  // Palette item
  const pi = e.target.closest('#palette-list li[data-i]');
  if (pi) { const c = palFiltered[+pi.dataset.i]; if (c) { closePalette(); c.run(); } return; }
  // Search result
  const sr = e.target.closest('.search-result[data-file]');
  if (sr) { closeSearch(); openFile(sr.dataset.file); return; }
  // Notification
  const nt = e.target.closest('.notif-item');
  if (nt) {
    const id = +nt.dataset.id;
    const n = notifications.find(x => x.id === id);
    if (n) { n.read = true; renderNotifBadge(); renderNotifList(); if (n.file) { $('#notif-center').classList.remove('open'); openFile(n.file); } }
    return;
  }
  // Theme swatch
  const ts = e.target.closest('.theme-swatch[data-theme]');
  if (ts) { setAccent(ts.dataset.theme); return; }
});

/* ─── Specific bindings ─── */
$('#btn-bell').addEventListener('click', (e) => {
  e.stopPropagation();
  $('#notif-center').classList.toggle('open');
});
$('#btn-theme').addEventListener('click', toggleDark);
$('#status-mode').addEventListener('click', toggleDark);
document.addEventListener('click', (e) => {
  if (!e.target.closest('#notif-center')) $('#notif-center').classList.remove('open');
});
$('#notif-clear').addEventListener('click', () => { notifications = []; renderNotifBadge(); renderNotifList(); });

$('#panel-close').addEventListener('click', () => toggleTerminal(false));
$$('.panel-tab').forEach(t => t.addEventListener('click', () => {
  $$('.panel-tab').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
}));
$('#terminal-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { runCommand(e.target.value); e.target.value = ''; }
});

$('#settings-close').addEventListener('click', closeSettings);
$('#settings-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeSettings(); });
$('#project-close').addEventListener('click', closeProject);
$('#project-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeProject(); });
$('#search-close').addEventListener('click', closeSearch);
$('#search-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeSearch(); });
$('#open-search').addEventListener('click', openSearch);

$$('.act-btn').forEach(btn => btn.addEventListener('click', () => {
  $$('.act-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const act = btn.dataset.act;
  if (act === 'search') { openSearch(); return; }
  if (act === 'settings') { openSettings(); return; }
  const msg = {
    explorer: 'Explorer is already open on the left →',
    git: 'branch: main* · everything up to date ✓',
    debug: 'No bugs found yet. Debugging life... 🐛',
    ext: 'Recommended: coffee.js, motivation@latest',
    account: `Signed in as ${P.name} <${EMAIL}>`,
  }[act];
  if (msg) tprint(msg, 'info');
}));

$('#search-input').addEventListener('input', (e) => renderSearch(e.target.value));
$('#search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const f = $('.search-result[data-file]');
    if (f) { closeSearch(); openFile(f.dataset.file); }
  }
});

$('#palette-input').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderPalette(buildCommands().filter(c => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q)));
  palIndex = 0;
});
$('#palette-input').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { palIndex = Math.min(palIndex + 1, palFiltered.length - 1); renderPalette(palFiltered); e.preventDefault(); }
  if (e.key === 'ArrowUp') { palIndex = Math.max(palIndex - 1, 0); renderPalette(palFiltered); e.preventDefault(); }
  if (e.key === 'Enter' && palFiltered[palIndex]) { const c = palFiltered[palIndex]; closePalette(); c.run(); e.preventDefault(); }
});
$('#palette-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closePalette(); });

/* ─── Settings controls ─── */
$('#settings-body').addEventListener('click', (e) => {
  if (e.target.id === 'set-reset') {
    settings = { ...defaultSettings }; saveSettings(); applySettings(); renderSettings();
    toast('info', 'Settings reset to defaults');
    return;
  }
  if (e.target.id === 'set-dark') { settings.darkMode = e.target.checked; saveSettings(); applySettings(); }
  if (e.target.id === 'set-terminal') { settings.terminal = e.target.checked; saveSettings(); applySettings(); }
  if (e.target.id === 'set-anim') { settings.animations = e.target.checked; saveSettings(); applySettings(); }
});
$('#settings-body').addEventListener('input', (e) => {
  if (e.target.id === 'fs-range') {
    settings.fontSize = +e.target.value; saveSettings();
    document.documentElement.style.setProperty('--fs', settings.fontSize + 'px');
    $('#fs-val').textContent = settings.fontSize + 'px';
  }
});
/* ─── Contact form → Web3Forms (sends to milandahal685@gmail.com) ─── */
const WEB3FORMS_KEY = '1728634c-6458-4533-85b7-51489b1853a2';
function bindContactForm() {
  const form = $('#contact-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    const original = btn.innerHTML;
    btn.textContent = 'Sending... ⏳';
    try {
      const fd = new FormData(form);
      const json = Object.fromEntries(fd.entries());
      json.access_key = WEB3FORMS_KEY;
      json.subject = `[Portfolio] Message from ${fd.get('name')}`;
      json.from_name = D.meta.name;
      json.replyto = fd.get('email');
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Message sent! I\'ll reply to your email soon 🚀');
        notify('success', 'Portfolio message sent',
          `${fd.get('name')} <${fd.get('email')}> sent a message — check your inbox.`);
        form.reset();
      } else {
        toast('error', data.message || 'Could not send the message. Please email me directly.');
      }
    } catch (err) {
      toast('error', `Network error — contact me directly at ${EMAIL}`);
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });
}

/* ─── Status bar ─── */
$('#go-live').addEventListener('click', () => {
  openFile('contact.html');
  tprint('Live server started → let\'s work together! 🚀', 'ok');
});
$('#status-branch').addEventListener('click', () =>
  tprint('branch: main* · all changes committed. clean working tree ✓', 'info'));
$('#status-problems').addEventListener('click', () =>
  tprint('0 errors, 0 warnings — clean code only ✨', 'ok'));

/* ─── Ln/Col + scroll-top ─── */
function updateScrollTop() {
  const vp = $('#viewport');
  $('#scroll-top').classList.toggle('show', vp.scrollTop > 320);
}
/* ─── Two-way sidebar ⇄ editor scroll sync ─── */
let syncing = false;
function syncSidebarFromView() {
  const vp = $('#viewport'), sb = $('#sidebar');
  const vpMax = vp.scrollHeight - vp.clientHeight;
  const sbMax = sb.scrollHeight - sb.clientHeight;
  if (vpMax <= 0 || sbMax <= 0 || syncing) return;
  syncing = true;
  sb.scrollTop = (vp.scrollTop / vpMax) * sbMax;
  syncing = false;
}
function syncViewFromSidebar() {
  const vp = $('#viewport'), sb = $('#sidebar');
  const vpMax = vp.scrollHeight - vp.clientHeight;
  const sbMax = sb.scrollHeight - sb.clientHeight;
  if (vpMax <= 0 || sbMax <= 0 || syncing) return;
  syncing = true;
  vp.scrollTop = (sb.scrollTop / sbMax) * vpMax;
  updateScrollTop();
  syncing = false;
}
let sbHovered = false, vpHovered = false;
$('#sidebar').addEventListener('mouseenter', () => { sbHovered = true; });
$('#sidebar').addEventListener('mouseleave', () => { sbHovered = false; });
$('#viewport').addEventListener('mouseenter', () => { vpHovered = true; });
$('#viewport').addEventListener('mouseleave', () => { vpHovered = false; });
/* Scrolling the editor → sidebar follows */
$('#viewport').addEventListener('scroll', () => { updateScrollTop(); if (!sbHovered) syncSidebarFromView(); updateActiveSection(); });
/* Scrolling the sidebar → editor follows */
$('#sidebar').addEventListener('scroll', () => { if (sbHovered && !vpHovered) syncViewFromSidebar(); });
$('#viewport').addEventListener('mousemove', (e) => {
  const rect = $('#viewport').getBoundingClientRect();
  const ln = Math.max(1, Math.round((e.clientY - rect.top + $('#viewport').scrollTop) / 20));
  const col = Math.max(1, Math.round((e.clientX - rect.left) / 9));
  $('#status-pos').textContent = `Ln ${ln}, Col ${col}`;
});
$('#scroll-top').addEventListener('click', () => $('#viewport').scrollTo({ top: 0, behavior: 'smooth' }));

/* ─── Mobile drawer ─── */
$('#mobile-fab').addEventListener('click', () => $('#drawer-overlay').classList.add('open'));
$('#drawer-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('open'); });

/* ─── Clock (Asia/Kathmandu) ─── */
function startClock() {
  const el = $('#status-time');
  const fmt = () => `🇳🇵 ${kathmanduTime()}`;
  el.textContent = fmt();
  setInterval(() => { el.textContent = fmt(); }, 1000);
}

/* ─── GitHub profile (live) ─── */
async function fetchGitHub() {
  try {
    const r = await fetch('https://api.github.com/users/milandahal1000', {
      headers: {
        'User-Agent': 'Milan-Portfolio/1.0'
      }
    });
    if (!r.ok) return;
    const u = await r.json();
    const av = $('.pc-avatar');
    if (av && u.avatar_url) { liveAvatar = `<img src="${u.avatar_url}" alt="GitHub avatar" onerror="this.style.display='none'"/>`; av.innerHTML = liveAvatar; }
    if (u.public_repos) {
      const stat = D.profile.stats || [];
      const i = stat.findIndex(s => s.label === 'Projects Built');
      if (i >= 0) stat[i].value = u.public_repos;
    }
  } catch { /* offline — fall back to emoji */ }
}

// Cache for GitHub projects to avoid excessive API calls
let githubProjectsCache = null;
let githubProjectsCacheTimestamp = 0;
const GITHUB_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/* ─── Fetch and transform GitHub repositories to projects ─── */
async function fetchGitHubProjects() {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    if (githubProjectsCache && (now - githubProjectsCacheTimestamp) < GITHUB_CACHE_DURATION) {
      // Use cached data
      window.PORTFOLIO_DATA.projects = githubProjectsCache;

      // Update the projects count in stats
      const stat = D.profile.stats || [];
      const i = stat.findIndex(s => s.label === 'Projects Built');
      if (i >= 0) stat[i].value = githubProjectsCache.length;

      // Re-render projects section with cached data
      renderProjects();

      // Notify user of cache usage
      notify('info', 'Projects loaded from cache', `Showing ${githubProjectsCache.length} cached projects from GitHub`, 'projects.json');
      return;
    }

    // Fetch fresh data from GitHub API
    const response = await fetch('https://api.github.com/users/milandahal1000/repos?sort=updated&direction=desc&per_page=100', {
      headers: {
        'User-Agent': 'Milan-Portfolio/1.0'
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch repos: ${response.status}`);

    const repos = await response.json();

    // Filter out forks and archived repositories
    const filteredRepos = repos.filter(repo =>
      !repo.fork &&
      !repo.archived
    );

    // Transform repos to project format
    const projects = filteredRepos.map(repo => {
      // Determine emoji based on primary language
      const emojiMap = {
        'JavaScript': '💻',
        'TypeScript': '💻',
        'Python': '🐍',
        'Java': '☕',
        'HTML': '🎨',
        'CSS': '🎨',
        'Go': '🐹',
        'Rust': '🦀',
        'PHP': '🐘',
        'Ruby': '💎',
        'C++': '⚙️',
        'C': '⚙️',
        'Shell': '💻',
        'Vue': '💚',
        'Svelte': '💙',
        'Dart': '🎯',
        'Kotlin': '🟣',
        'Swift': '🟧',
        'Default': '📁'
      };

      const language = repo.language || 'Default';
      const emoji = emojiMap[language] || emojiMap.Default;

      // Determine category based on topics and language
      const topics = repo.topics || [];
      let category = 'Other';

      // Check topics for category hints
      const topicString = topics.join(' ').toLowerCase();
      if (topicString.includes('frontend') || topicString.includes('ui') || topicString.includes('ux')) {
        category = 'Frontend';
      } else if (topicString.includes('backend') || topicString.includes('api') || topicString.includes('server')) {
        category = 'Backend';
      } else if (topicString.includes('fullstack') || topicString.includes('full-stack')) {
        category = 'Full-stack';
      } else if (topicString.includes('mobile') || topicString.includes('android') || topicString.includes('ios')) {
        category = 'Mobile';
      } else if (topicString.includes('data') || topicString.includes('analytics') || topicString.includes('machine learning') || topicString.includes('ai')) {
        category = 'Data Science';
      } else {
        // Fallback to language-based categorization
        const lang = (repo.language || '').toLowerCase();
        if (['javascript', 'typescript', 'html', 'css', 'vue', 'svelte'].includes(lang)) {
          category = 'Frontend';
        } else if (['python', 'java', 'go', 'rust', 'php', 'ruby', 'c', 'cpp', 'c#', 'dotnet'].includes(lang)) {
          category = 'Backend';
        } else {
          category = 'Full-stack'; // Default fallback
        }
      }

      // Create blurb (short description)
      const blurb = repo.description || `A ${language} project${repo.fork ? ' (fork)' : ''} hosted on GitHub`;

      // Create description (can be same as blurb or more detailed)
      const description = repo.description || `GitHub repository: ${repo.name}${repo.description ? ` - ${repo.description}` : ''}`;

      // Extract features from README or use placeholder
      // For now, we'll use some basic features based on repo properties
      const features = [];
      if (repo.language) features.push(`Built with ${repo.language}`);
      if (repo.stargazers_count > 0) features.push(`${repo.stargazers_count} ⭐ Stars`);
      if (repo.forks_count > 0) features.push(`${repo.forks_count} 🍴 Forks`);
      if (!repo.private) features.push('Publicly available');
      if (features.length === 0) features.push('Source code available');

      // Tags: language + topics
      const tags = [...(topics || []), repo.language].filter(Boolean);

      return {
        title: repo.name,
        emoji: emoji,
        category: category,
        blurb: blurb.substring(0, 150) + (blurb.length > 150 ? '...' : ''), // Limit blurb length
        description: description,
        features: features.slice(0, 4), // Limit to 4 features
        tags: tags,
        links: {
          github: repo.html_url,
          live: repo.homepage || '' // Use homepage if available
        }
      };
    });

    // Update cache
    githubProjectsCache = projects;
    githubProjectsCacheTimestamp = Date.now();

    // Update the projects data
    window.PORTFOLIO_DATA.projects = projects;

    // Update the projects count in stats
    const stat = D.profile.stats || [];
    const i = stat.findIndex(s => s.label === 'Projects Built');
    if (i >= 0) stat[i].value = projects.length;

    // Re-render projects section with actual data
    renderProjects();

    // Notify user of successful update
    notify('success', 'Projects updated', `Loaded ${projects.length} projects from GitHub`, 'projects.json');

  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
    // Notify user of error
    notify('error', 'Failed to load projects', 'Could not fetch projects from GitHub. Using cached data.', 'projects.json');
    // Re-render to show any cached data or empty state
    renderProjects();
  }
}

/* ─── Keyboard shortcuts ─── */
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if ((e.ctrlKey && e.shiftKey && k === 'p') || k === 'f1') {
    e.preventDefault();
    $('#palette-overlay').classList.contains('open') ? closePalette() : openPalette();
  }
  if (e.ctrlKey && k === 'f') { e.preventDefault(); openSearch(); }
  if (e.ctrlKey && k === '`') { e.preventDefault(); toggleTerminal(); }
  if (e.ctrlKey && k === 'b') { e.preventDefault(); document.body.classList.toggle('mini'); }
  if (e.ctrlKey && k === 'pagedown') { e.preventDefault(); nextTab(1); }
  if (e.ctrlKey && k === 'pageup') { e.preventDefault(); nextTab(-1); }
  if (e.key === 'Escape') {
    $$('.overlay.open').forEach(o => o.classList.remove('open'));
    $('#notif-center').classList.remove('open');
  }
});

/* ─── Loading splash ─── */
function hideLoading() {
  $('#loading').classList.add('hidden');
  setTimeout(() => $('#loading').remove(), 600);
}

/* ─── Init ─── */
function init() {
  applySettings();
  buildSearchIndex();
  buildSidebar();
  buildTabs();
  renderHome(); renderAbout();
  renderExperience(); renderSkills(); renderProjects(); renderContact();
  bindContactForm();
  $('#viewport').scrollTop = 0;
  currentFile = 'index.html';
  updateNav();
  startClock();
  fetchGitHub();
  fetchGitHubProjects(); // Fetch and load projects from GitHub
  tprint('Milan Dahal — Portfolio Terminal v2.0', 'ok');
  tprint("Type 'help' to see available commands.", 'info');
  notify('info', 'Welcome to my portfolio 👋', 'Scroll through my work, search (Ctrl+F), or press Ctrl+Shift+P.', 'index.html');
  setTimeout(hideLoading, 900);
}
init();