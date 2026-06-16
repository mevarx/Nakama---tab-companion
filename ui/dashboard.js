const DEFAULT_STATE = {
  xp: 0, level: 1, coins: 0, totalCollected: 0,
  unlockedBehaviors: [], achievements: [], quests: { active: [], completed: [] },
  settings: { enabled: true, sound: false, scale: 2, speed: 1, character: null, characterMode: 'auto' },
  siteCollected: { default:0, claude:0, chatgpt:0, gemini:0, github:0, stackoverflow:0, youtube:0, reddit:0 },
  siteVisits:    { default:0, claude:0, chatgpt:0, gemini:0, github:0, stackoverflow:0, youtube:0, reddit:0 },
  siteTime:      { default:0, claude:0, chatgpt:0, gemini:0, github:0, stackoverflow:0, youtube:0, reddit:0 },
  lastDailyVisit: ""
};

const LEVEL_THRESHOLDS = { 1:0, 2:100, 3:250, 4:500, 5:1000, 6:2000, 7:4000, 8:8000 };

const CHARACTERS = [
  { id:'tanjiro', label:'TANJIRO', theme:'default',       colors:{ hoodie:'#7A2828', secondary:'#1C1917', skin:'#FDE047', hair:'#334155', primary:'#4F46E5' }},
  { id:'itadori', label:'ITADORI', theme:'claude',        colors:{ hoodie:'#F472B6', secondary:'#EF4444', skin:'#FDE047', hair:'#3B2E2A', primary:'#CC785C' }},
  { id:'toji',    label:'TOJI',    theme:'chatgpt',       colors:{ hoodie:'#111827', secondary:'#111827', skin:'#FDE047', hair:'#0F172A', primary:'#10A37F' }},
  { id:'gojo',    label:'GOJO',    theme:'gemini',        colors:{ hoodie:'#4285F4', secondary:'#0F172A', skin:'#FDE047', hair:'#0F172A', primary:'#1A73E8' }},
  { id:'sasuke',  label:'SASUKE',  theme:'youtube',       colors:{ hoodie:'#1E1B4B', secondary:'#F1F5F9', skin:'#FDE047', hair:'#0F0F0F', primary:'#FF0000' }},
  { id:'aizen',   label:'AIZEN',   theme:'google',        colors:{ hoodie:'#F8FAFC', secondary:'#0F172A', skin:'#FDE047', hair:'#5C3A21', primary:'#4285F4' }},
  { id:'kira',    label:'KIRA',    theme:'mail',          colors:{ hoodie:'#D6D3D1', secondary:'#DC2626', skin:'#FDE047', hair:'#4A3B32', primary:'#EA4335' }},
  { id:'luffy',   label:'LUFFY',   theme:'reddit',        colors:{ hoodie:'#EF4444', secondary:'#1D4ED8', skin:'#FDE047', hair:'#2D3748', primary:'#FF4500' }},
  { id:'ace',     label:'ACE',     theme:'linkedin',      colors:{ hoodie:'#F97316', secondary:'#EF4444', skin:'#FDE047', hair:'#0F172A', primary:'#0A66C2' }},
];

const THEMES_META = {
  default:       { emoji:'💻', label:'DEFAULT',       quote:'Code is poetry.' },
  github:        { emoji:'🐙', label:'GITHUB',        quote:'git push origin main' },
  claude:        { emoji:'🤖', label:'CLAUDE.AI',     quote:'Thinking...' },
  chatgpt:       { emoji:'💬', label:'CHATGPT',       quote:'How can I help you today?' },
  gemini:        { emoji:'✨', label:'GEMINI',         quote:'Multimodal!' },
  stackoverflow: { emoji:'📚', label:'STACKOVERFLOW', quote:'Closed as duplicate...' },
  youtube:       { emoji:'▶️', label:'YOUTUBE',        quote:'Just one more video...' },
  reddit:        { emoji:'🤘', label:'REDDIT',         quote:'This is the way.' },
  google:        { emoji:'🔍', label:'GOOGLE',         quote:'Google knows all.' },
  mail:          { emoji:'📧', label:'MAIL',           quote:'Just as planned.' },
  linkedin:      { emoji:'💼', label:'LINKEDIN',       quote:'Humbled and honored.' },
};

const QUESTS_DATABASE = [
  { id:'first_coffee',           title:'First Coffee',  icon:'☕', check:(s) => s.siteCollected?.claude >= 1,       xp:50,  coins:10 },
  { id:'git_push',               title:'Ship It',       icon:'🚀', check:(s) => s.siteVisits?.github >= 5,          xp:100, coins:20 },
  { id:'stackoverflow_survivor', title:'SO Survivor',   icon:'💀', check:(s) => s.siteTime?.stackoverflow >= 600,   xp:150, coins:30 },
  { id:'star_hunter',            title:'Star Hunter',   icon:'⭐', check:(s) => s.siteCollected?.gemini >= 10,      xp:120, coins:25 },
  { id:'lofi_listener',          title:'Chill Coder',   icon:'🎵', check:(s) => s.siteTime?.youtube >= 300,         xp:80,  coins:15 },
];

const ACHIEVEMENTS_DATABASE = [
  { id:'hello_world',            title:'Hello World',           icon:'🌍', check:()  => true },
  { id:'junior_developer',       title:'Junior Developer',      icon:'👶', check:(s) => s.level >= 3 },
  { id:'senior_developer',       title:'Senior Developer',      icon:'🧠', check:(s) => s.level >= 5 },
  { id:'mischief_master',        title:'Mischief Master',       icon:'😈', check:(s) => s.level >= 8 },
  { id:'coin_hoarder',           title:'Coin Hoarder',          icon:'💰', check:(s) => s.totalCollected >= 100 },
  { id:'coffee_addict',          title:'Coffee Addict',         icon:'☕', check:(s) => s.siteCollected?.claude >= 5 },
  { id:'git_master',             title:'Git Master',            icon:'🐙', check:(s) => s.siteVisits?.github >= 10 },
  { id:'stack_overflow_survivor',title:'SO Survivor',           icon:'💀', check:(s) => s.siteTime?.stackoverflow >= 1200 },
];

const SITE_KEYS  = ['default','claude','chatgpt','gemini','github','stackoverflow','youtube','reddit'];
const SITE_EMOJIS = { default:'💻', claude:'🤖', chatgpt:'💬', gemini:'✨', github:'🐙', stackoverflow:'📚', youtube:'▶️', reddit:'🤘' };

// ── Storage ──────────────────────────────────────────────────────────────────

function getStorageAPI() {
  if (typeof browser !== 'undefined' && browser?.storage?.local) return browser.storage.local;
  if (typeof chrome  !== 'undefined' && chrome?.storage?.local)  return chrome.storage.local;
  return null;
}

async function getProgression() {
  const storage = getStorageAPI();
  if (!storage) return { ...DEFAULT_STATE };
  return new Promise((resolve) => {
    storage.get(['nakamaProgress'], (result) => {
      if (result?.nakamaProgress) {
        const s = result.nakamaProgress;
        const merged = { ...DEFAULT_STATE, ...s };
        merged.settings      = { ...DEFAULT_STATE.settings,      ...s.settings };
        merged.siteCollected = { ...DEFAULT_STATE.siteCollected, ...s.siteCollected };
        merged.siteVisits    = { ...DEFAULT_STATE.siteVisits,    ...s.siteVisits };
        merged.siteTime      = { ...DEFAULT_STATE.siteTime,      ...s.siteTime };
        resolve(merged);
      } else {
        resolve({ ...DEFAULT_STATE });
      }
    });
  });
}

async function saveProgression(state) {
  const storage = getStorageAPI();
  if (!storage) return;
  return new Promise((resolve) => storage.set({ nakamaProgress: state }, resolve));
}

function broadcastSettings(state) {
  const ext = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);
  if (!ext?.tabs) return;
  const handler = (tabs) => {
    if (!tabs) return;
    tabs.forEach(tab => ext.tabs.sendMessage(tab.id, { type: 'UPDATE_SETTINGS', state }).catch(() => {}));
  };
  const q = ext.tabs.query({});
  if (q instanceof Promise) q.then(handler).catch(() => {});
  else ext.tabs.query({}, handler);
}

function sendToActiveTabs(message) {
  const ext = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);
  if (!ext?.tabs) return;
  const handler = (tabs) => {
    if (!tabs) return;
    tabs.forEach(tab => ext.tabs.sendMessage(tab.id, message).catch(() => {}));
  };
  const q = ext.tabs.query({ active: true });
  if (q instanceof Promise) q.then(handler).catch(() => {});
  else ext.tabs.query({ active: true }, handler);
}

// ── Toast ─────────────────────────────────────────────────────────────────────

let toastTimeout = null;

function showToast(msg, type = 'info') {
  const toastEl = document.getElementById('toast');
  toastEl.textContent = msg;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

// ── Navigation ────────────────────────────────────────────────────────────────

const PANELS = ['overview', 'character', 'settings', 'stats', 'achievements', 'world'];

function switchPanel(id) {
  PANELS.forEach(p => {
    document.getElementById(`panel-${p}`)?.classList.toggle('active', p === id);
    document.getElementById(`nav-${p}`)?.classList.toggle('active', p === id);
  });
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
});

// ── Pixel art rendering ───────────────────────────────────────────────────────

function drawCharacterMini(ctx, size, charId, frame = 0) {
  const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
  const c = char.colors;
  const scale = size / 32;

  ctx.save();
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = false;

  const ox = 8;
  const bobY = (frame === 2 || frame === 3) ? 1 : 0;
  const oy = 8 + bobY;
  const blink = frame === 3;

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(8, 29, 16, 2);

  ctx.fillStyle = '#334155';
  ctx.fillRect(ox+3, oy+19, 3, 2);
  ctx.fillRect(ox+10, oy+19, 3, 2);

  drawCharStyle(ctx, charId, ox, oy, c);

  ctx.fillStyle = c.hair || '#334155';
  if (blink) {
    ctx.fillRect(ox+5, oy+6, 2, 1);
    ctx.fillRect(ox+9, oy+6, 2, 1);
  } else {
    ctx.fillRect(ox+5, oy+5, 2, 2);
    ctx.fillRect(ox+9, oy+5, 2, 2);
  }

  ctx.fillStyle = c.skin;
  ctx.fillRect(ox+1, oy+14, 2, 2);
  ctx.fillRect(ox+13, oy+14, 2, 2);

  ctx.restore();
}

function drawCharStyle(ctx, style, ox, oy, c) {
  if (style === 'tanjiro') {
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+3, oy+3, 10, 7);
    ctx.fillStyle = '#7A2828';    ctx.fillRect(ox+2, oy+1, 12, 3); ctx.fillRect(ox+2, oy+4, 2, 3); ctx.fillRect(ox+12, oy+4, 2, 3);
    ctx.fillStyle = '#1C1917';    ctx.fillRect(ox+2, oy+10, 12, 9);
    ctx.fillStyle = '#10B981';
    for (let cy = 0; cy < 9; cy += 3)
      for (let cx = 0; cx < 14; cx += 3)
        if (Math.floor((cx/3) + (cy/3)) % 2 === 0) ctx.fillRect(ox+1+cx, oy+10+cy, 3, 3);
  } else if (style === 'itadori') {
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+3, oy+3, 10, 7);
    ctx.fillStyle = '#F472B6';    ctx.fillRect(ox+2, oy+1, 12, 3); ctx.fillRect(ox+1, oy+3, 2, 4); ctx.fillRect(ox+13, oy+3, 2, 4); ctx.fillRect(ox+4, oy, 2, 2); ctx.fillRect(ox+10, oy, 2, 2);
    ctx.fillStyle = '#EF4444';    ctx.fillRect(ox+2, oy+10, 12, 3);
    ctx.fillStyle = '#1E293B';    ctx.fillRect(ox+2, oy+13, 12, 6);
  } else if (style === 'toji') {
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+3, oy+3, 10, 7);
    ctx.fillStyle = '#0F172A';    ctx.fillRect(ox+2, oy+2, 12, 2); ctx.fillRect(ox+3, oy+4, 1, 2); ctx.fillRect(ox+12, oy+4, 1, 2);
    ctx.fillStyle = '#111827';    ctx.fillRect(ox+3, oy+10, 10, 9);
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+1, oy+10, 2, 5); ctx.fillRect(ox+13, oy+10, 2, 5);
  } else if (style === 'gojo') {
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+3, oy+3, 10, 7);
    ctx.fillStyle = '#F8FAFC';    ctx.fillRect(ox+2, oy, 12, 3); ctx.fillRect(ox+4, oy-1, 8, 2);
    ctx.fillStyle = '#0F172A';    ctx.fillRect(ox+2, oy+4, 12, 3);
    ctx.fillStyle = '#111827';    ctx.fillRect(ox+2, oy+10, 12, 9); ctx.fillRect(ox+3, oy+9, 10, 2);
  } else if (style === 'sasuke') {
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+3, oy+3, 10, 7);
    ctx.fillStyle = '#1E1B4B';    ctx.fillRect(ox+2, oy+1, 12, 3); ctx.fillRect(ox+0, oy+3, 3, 4); ctx.fillRect(ox+13, oy+3, 3, 4);
    ctx.fillStyle = '#F1F5F9';    ctx.fillRect(ox+2, oy+10, 12, 6);
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+6, oy+10, 4, 3);
    ctx.fillStyle = '#6B21A8';    ctx.fillRect(ox+1, oy+16, 14, 3); ctx.fillRect(ox-1, oy+17, 3, 3);
  } else if (style === 'aizen') {
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+3, oy+3, 10, 7);
    ctx.fillStyle = '#5C3A21';    ctx.fillRect(ox+3, oy+1, 10, 3); ctx.fillRect(ox+4, oy, 8, 2); ctx.fillRect(ox+7, oy+3, 2, 2);
    ctx.fillStyle = '#F8FAFC';    ctx.fillRect(ox+2, oy+10, 12, 9);
    ctx.fillStyle = '#0F172A';    ctx.fillRect(ox+2, oy+15, 12, 2);
  } else if (style === 'kira') {
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+3, oy+3, 10, 7);
    ctx.fillStyle = '#4A3B32';    ctx.fillRect(ox+2, oy+1, 12, 3); ctx.fillRect(ox+2, oy+4, 2, 2); ctx.fillRect(ox+12, oy+4, 2, 2);
    ctx.fillStyle = '#D6D3D1';    ctx.fillRect(ox+2, oy+10, 12, 9);
    ctx.fillStyle = '#DC2626';    ctx.fillRect(ox+7, oy+10, 2, 5);
    ctx.fillStyle = '#111827';    ctx.fillRect(ox+1, oy+13, 3, 4);
  } else if (style === 'luffy') {
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+3, oy+3, 10, 7);
    ctx.fillStyle = '#0F172A';    ctx.fillRect(ox+2, oy+2, 12, 2);
    ctx.fillStyle = '#FDE047';    ctx.fillRect(ox-1, oy, 18, 2); ctx.fillRect(ox+2, oy-3, 12, 3);
    ctx.fillStyle = '#EF4444';    ctx.fillRect(ox+2, oy-1, 12, 1); ctx.fillRect(ox+2, oy+10, 12, 9);
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+5, oy+10, 6, 9);
  } else if (style === 'ace') {
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+3, oy+3, 10, 7);
    ctx.fillStyle = '#0F172A';    ctx.fillRect(ox+2, oy+2, 12, 2); ctx.fillRect(ox+1, oy+4, 2, 3); ctx.fillRect(ox+13, oy+4, 2, 3);
    ctx.fillStyle = '#F97316';    ctx.fillRect(ox-2, oy-1, 20, 2); ctx.fillRect(ox+2, oy-4, 12, 4);
    ctx.fillStyle = '#EF4444';    ctx.fillRect(ox+2, oy-2, 12, 1);
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+2, oy+10, 12, 9);
    ctx.fillStyle = '#EF4444';    ctx.fillRect(ox+7, oy+11, 2, 2);
  } else {
    ctx.fillStyle = c.skin;       ctx.fillRect(ox+3, oy+3, 10, 7);
    ctx.fillStyle = c.hoodie;     ctx.fillRect(ox+2, oy+10, 12, 9);
  }
}

// ── Animation state ───────────────────────────────────────────────────────────

let sidebarFrame = 0;
let currentCharId = 'tanjiro';
let charPreviewFrame = 0;
let charPreviewAnimation = null;

function startSidebarAnimation() {
  const canvas = document.getElementById('sidebar-avatar');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  setInterval(() => {
    ctx.clearRect(0, 0, 64, 64);
    drawCharacterMini(ctx, 64, currentCharId, sidebarFrame);
    sidebarFrame = (sidebarFrame + 1) % 4;
  }, 250);
}

function startCharPreviewAnimation(charId) {
  const canvas = document.getElementById('char-preview');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  clearInterval(charPreviewAnimation);
  charPreviewFrame = 0;
  charPreviewAnimation = setInterval(() => {
    ctx.clearRect(0, 0, 96, 96);
    drawCharacterMini(ctx, 96, charId, charPreviewFrame);
    charPreviewFrame = (charPreviewFrame + 1) % 4;
  }, 200);
}

// ── Render ────────────────────────────────────────────────────────────────────

function el(id) { return document.getElementById(id); }

async function renderAll() {
  const state = await getProgression();
  renderOverview(state);
  renderCharacterPanel(state);
  renderSettings(state);
  renderSiteStats(state);
  renderAchievements(state);
  renderSidebarStatus(state);
  renderWorld(state);
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

async function renderWorld(state) {
  const storage = getStorageAPI();
  const data = storage ? await new Promise((resolve) => {
    storage.get(['totalCaught','sitesVisited','totalXP','catchHistory','settings','anthropicApiKey'], resolve);
  }) : {};

  document.getElementById('world-totalCaught').textContent  = data.totalCaught  ?? state.totalCaught ?? 0;
  document.getElementById('world-sitesVisited').textContent = data.sitesVisited ?? state.sitesVisited ?? 0;
  document.getElementById('world-totalXP').textContent      = data.totalXP      ?? state.xp      ?? 0;

  const history = data.catchHistory ?? state.catchHistory ?? [];
  const feed    = document.getElementById('catchFeed');
  if (feed) {
    feed.innerHTML = '';
    history.slice(-20).reverse().forEach(entry => {
      const li = document.createElement('li');
      li.style.borderBottom = '1px dashed rgba(255, 255, 255, 0.05)';
      li.style.paddingBottom = '4px';
      li.textContent = `${entry.emoji ?? '📦'} ${entry.type} — ${entry.site} · ${timeAgo(entry.ts)}`;
      feed.appendChild(li);
    });
  }

  const s = data.settings ?? state.settings ?? {};
  
  const spawnRateEl = document.getElementById('spawnRate');
  if (spawnRateEl) {
    spawnRateEl.value = s.spawnRate ?? 15;
  }
  const spawnRateValEl = document.getElementById('spawnRateVal');
  if (spawnRateValEl) {
    spawnRateValEl.textContent = `${s.spawnRate ?? 15}s`;
  }
  
  const autoChaseEl = document.getElementById('autoChase');
  if (autoChaseEl) {
    autoChaseEl.checked = s.autoChase !== false;
  }
  const idleRoamEl = document.getElementById('idleRoam');
  if (idleRoamEl) {
    idleRoamEl.checked = s.idleRoam !== false;
  }
  const pageReactEl = document.getElementById('pageReact');
  if (pageReactEl) {
    pageReactEl.checked = s.pageReact !== false;
  }

  const apiKeyEl = document.getElementById('anthropic-api-key');
  if (apiKeyEl && data.anthropicApiKey) {
    apiKeyEl.value = data.anthropicApiKey;
  }
}

function renderOverview(state) {
  const lvl   = state.level;
  const xpCur = state.xp;
  const xpPrev = LEVEL_THRESHOLDS[lvl] || 0;
  const xpNext = LEVEL_THRESHOLDS[lvl + 1] ?? 8000;
  const pct    = Math.min(100, Math.max(0, ((xpCur - xpPrev) / (xpNext - xpPrev)) * 100));

  el('level-badge').textContent  = `LVL ${lvl}`;
  el('xp-bar').style.width       = `${pct}%`;
  el('xp-bar-glow').style.width  = `${pct}%`;
  el('xp-current').textContent   = xpCur;
  el('xp-next').textContent      = xpNext;
  el('stat-coins').textContent   = state.coins;
  el('stat-total').textContent   = state.totalCollected;
  el('stat-level').textContent   = state.level;
  el('stat-sites').textContent   = Object.values(state.siteVisits || {}).reduce((a, b) => a + b, 0);

  const questList = el('quests-list');
  const pending   = QUESTS_DATABASE.filter(q => !state.quests?.completed?.includes(q.id));
  const done      = QUESTS_DATABASE.filter(q =>  state.quests?.completed?.includes(q.id));

  questList.innerHTML = '';
  pending.forEach(q => {
    questList.insertAdjacentHTML('beforeend', `
      <div class="quest-item">
        <span class="quest-icon">${q.icon}</span>
        <span class="quest-name">${q.title}</span>
        <span class="quest-reward">+${q.xp}XP / +${q.coins}🪙</span>
      </div>`);
  });
  done.forEach(q => {
    questList.insertAdjacentHTML('beforeend', `
      <div class="quest-item" style="opacity:0.5">
        <span class="quest-icon">${q.icon}</span>
        <span class="quest-name">${q.title}</span>
        <span class="quest-done">✓ DONE</span>
      </div>`);
  });
  if (pending.length === 0 && done.length === 0) {
    questList.innerHTML = '<div class="empty-state">No quests</div>';
  }
}

function renderCharacterPanel(state) {
  const mode         = state.settings?.characterMode || 'auto';
  const selectedChar = state.settings?.character || 'tanjiro';

  document.getElementById('mode-auto').classList.toggle('active', mode === 'auto');
  document.getElementById('mode-manual').classList.toggle('active', mode === 'manual');

  const grid = el('character-grid');
  grid.innerHTML = '';

  CHARACTERS.forEach(char => {
    const isSelected = mode === 'manual' && char.id === selectedChar;
    const card = document.createElement('div');
    card.className = 'char-card' + (isSelected ? ' selected' : '');
    card.dataset.charId = char.id;

    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    canvas.style.imageRendering = 'pixelated';
    drawCharacterMini(canvas.getContext('2d'), 48, char.id, 0);

    card.appendChild(canvas);
    card.insertAdjacentHTML('beforeend', `
      <div class="char-card-name">${char.label}</div>
      <div class="char-card-theme">${char.theme}</div>
      ${isSelected ? '<div class="char-card-badge">SELECTED</div>' : ''}
    `);

    card.addEventListener('click', async () => {
      if (mode !== 'manual') { showToast('Switch to MANUAL mode first', 'info'); return; }
      const st = await getProgression();
      st.settings.character = char.id;
      await saveProgression(st);
      broadcastSettings(st);
      currentCharId = char.id;
      renderCharacterPanel(st);
      updateCurrentChar(char);
      showToast(`Character set to ${char.label}`, 'success');
    });

    grid.appendChild(card);
  });

  const current = CHARACTERS.find(c => c.id === selectedChar) || CHARACTERS[0];
  updateCurrentChar(current);
  currentCharId = current.id;
  startCharPreviewAnimation(current.id);
}

function updateCurrentChar(char) {
  const theme = THEMES_META[char.theme] || THEMES_META.default;
  el('current-char-name').textContent  = char.label;
  el('current-char-theme').textContent = `Theme: ${char.theme} — ${theme.emoji} ${theme.label}`;
  el('current-char-quote').textContent = `"${theme.quote}"`;
}

function renderSettings(state) {
  document.getElementById('toggle-enabled').checked = !!state.settings?.enabled;
  document.getElementById('toggle-sound').checked   = !!state.settings?.sound;
  const scale = state.settings?.scale ?? 2;
  const speed = state.settings?.speed ?? 1;
  document.getElementById('slider-scale').value = scale;
  document.getElementById('slider-speed').value = speed;
  el('scale-val').textContent = `${scale}x`;
  el('speed-val').textContent = `${speed}x`;
}

function renderSidebarStatus(state) {
  const enabled = !!state.settings?.enabled;
  document.getElementById('status-dot').classList.toggle('active', enabled);
  document.getElementById('status-label').textContent = enabled ? 'COMPANION ACTIVE' : 'COMPANION OFFLINE';
  const btn = document.getElementById('master-toggle');
  btn.textContent = enabled ? 'DISABLE' : 'ENABLE';
  btn.classList.toggle('is-on', !enabled);
}

function renderSiteStats(state) {
  const grid = el('site-stats-grid');
  grid.innerHTML = '';
  SITE_KEYS.forEach(key => {
    const emoji  = SITE_EMOJIS[key] || '🌐';
    const visits = state.siteVisits?.[key]    || 0;
    const items  = state.siteCollected?.[key] || 0;
    const mins   = Math.floor((state.siteTime?.[key] || 0) / 60);
    grid.insertAdjacentHTML('beforeend', `
      <div class="site-stat-card">
        <div class="site-name"><span class="site-emoji">${emoji}</span>${key.toUpperCase()}</div>
        <div class="site-metrics">
          <div class="site-metric"><div class="metric-lbl">VISITS</div><div class="metric-val">${visits}</div></div>
          <div class="site-metric"><div class="metric-lbl">ITEMS</div><div class="metric-val">${items}</div></div>
          <div class="site-metric"><div class="metric-lbl">TIME</div><div class="metric-val">${mins}m</div></div>
        </div>
      </div>`);
  });
}

function renderAchievements(state) {
  const grid = el('achievements-grid');
  grid.innerHTML = '';
  ACHIEVEMENTS_DATABASE.forEach(ach => {
    const unlocked = state.achievements?.includes(ach.id);
    grid.insertAdjacentHTML('beforeend', `
      <div class="ach-card ${unlocked ? 'unlocked' : ''}">
        <div class="ach-icon">${unlocked ? ach.icon : '🔒'}</div>
        <div class="ach-title">${ach.title}</div>
        <div class="ach-status ${unlocked ? 'done' : 'locked'}">${unlocked ? '✓ UNLOCKED' : 'LOCKED'}</div>
      </div>`);
  });
}

// ── Events ────────────────────────────────────────────────────────────────────

document.getElementById('master-toggle').addEventListener('click', async () => {
  const state = await getProgression();
  state.settings.enabled = !state.settings.enabled;
  await saveProgression(state);
  broadcastSettings(state);
  renderSidebarStatus(state);
  showToast(state.settings.enabled ? 'Companion enabled' : 'Companion disabled', state.settings.enabled ? 'success' : 'info');
});

document.getElementById('toggle-enabled').addEventListener('change', async (e) => {
  const state = await getProgression();
  state.settings.enabled = e.target.checked;
  await saveProgression(state);
  broadcastSettings(state);
  renderSidebarStatus(state);
});

document.getElementById('toggle-sound').addEventListener('change', async (e) => {
  const state = await getProgression();
  state.settings.sound = e.target.checked;
  await saveProgression(state);
  broadcastSettings(state);
  showToast(`Sound ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
});

document.getElementById('slider-scale').addEventListener('input', async (e) => {
  const val = parseFloat(e.target.value);
  el('scale-val').textContent = `${val}x`;
  const state = await getProgression();
  state.settings.scale = val;
  await saveProgression(state);
  broadcastSettings(state);
});

document.getElementById('slider-speed').addEventListener('input', async (e) => {
  const val = parseFloat(e.target.value);
  el('speed-val').textContent = `${val}x`;
  const state = await getProgression();
  state.settings.speed = val;
  await saveProgression(state);
  broadcastSettings(state);
});

document.getElementById('mode-auto').addEventListener('click', async () => {
  const state = await getProgression();
  state.settings.characterMode = 'auto';
  await saveProgression(state);
  broadcastSettings(state);
  renderCharacterPanel(state);
  showToast('Character mode: AUTO (site-based)', 'info');
});

document.getElementById('mode-manual').addEventListener('click', async () => {
  const state = await getProgression();
  state.settings.characterMode = 'manual';
  if (!state.settings.character) state.settings.character = 'tanjiro';
  await saveProgression(state);
  broadcastSettings(state);
  renderCharacterPanel(state);
  showToast('MANUAL mode — pick a character below', 'info');
});

document.getElementById('btn-force-react').addEventListener('click', () => {
  sendToActiveTabs({ type: 'FORCE_STATE', state: 'react', duration: 2000 });
  showToast('Forced REACT animation!', 'success');
});

document.getElementById('btn-force-special').addEventListener('click', () => {
  sendToActiveTabs({ type: 'FORCE_STATE', state: 'special', duration: 3000 });
  showToast('Forced SPECIAL animation!', 'success');
});

document.getElementById('btn-spawn-item').addEventListener('click', () => {
  sendToActiveTabs({ type: 'SPAWN_ITEM' });
  showToast('Spawned a collectible!', 'success');
});

document.getElementById('btn-add-xp').addEventListener('click', async () => {
  const state = await getProgression();
  state.xp += 10;
  let lvl = state.level;
  while (lvl < 8 && state.xp >= (LEVEL_THRESHOLDS[lvl + 1] ?? Infinity)) lvl++;
  const leveled = lvl > state.level;
  state.level = lvl;
  await saveProgression(state);
  broadcastSettings(state);
  renderOverview(state);
  renderSidebarStatus(state);
  showToast(leveled ? `+10 XP — LEVEL UP to ${state.level}! 🎉` : '+10 XP added!', 'success');
});

document.getElementById('btn-reset-progress').addEventListener('click', async () => {
  if (!confirm('⚠ This will permanently wipe all XP, coins, levels, and stats. Continue?')) return;
  const fresh = { ...DEFAULT_STATE };
  await saveProgression(fresh);
  broadcastSettings(fresh);
  await renderAll();
  showToast('All progress reset.', 'info');
});

document.getElementById('btn-reset-settings').addEventListener('click', async () => {
  if (!confirm('Reset all settings to defaults?')) return;
  const state = await getProgression();
  state.settings = { ...DEFAULT_STATE.settings };
  await saveProgression(state);
  broadcastSettings(state);
  renderSettings(state);
  renderSidebarStatus(state);
  showToast('Settings reset.', 'info');
});

async function saveWorldSettings() {
  const storage = getStorageAPI();
  if (!storage) return;

  const state = await getProgression();
  const settings = state.settings || {};

  settings.spawnRate = parseInt(document.getElementById('spawnRate').value);
  settings.autoChase = document.getElementById('autoChase').checked;
  settings.idleRoam  = document.getElementById('idleRoam').checked;
  settings.pageReact = document.getElementById('pageReact').checked;

  state.settings = settings;
  await saveProgression(state);
  
  await new Promise(r => storage.set({ 
    settings: settings,
    nakamaProgress: state
  }, r));

  const ext = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);
  if (ext && ext.runtime && ext.runtime.sendMessage) {
    ext.runtime.sendMessage({ type: 'nakama:settingsChanged' }).catch(() => {});
  }
}

const spawnRateEl = document.getElementById('spawnRate');
if (spawnRateEl) {
  spawnRateEl.addEventListener('input', (e) => {
    const valEl = document.getElementById('spawnRateVal');
    if (valEl) valEl.textContent = `${e.target.value}s`;
    saveWorldSettings();
  });
}

['autoChase', 'idleRoam', 'pageReact'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', saveWorldSettings);
});

const saveKeyBtn = document.getElementById('btn-save-key');
if (saveKeyBtn) {
  saveKeyBtn.addEventListener('click', async () => {
    const keyEl = document.getElementById('anthropic-api-key');
    const key = keyEl ? keyEl.value.trim() : '';
    const storage = getStorageAPI();
    if (storage) {
      await new Promise(r => storage.set({ anthropicApiKey: key }, r));
      showToast('API Key saved successfully!', 'success');
    }
  });
}

const api = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null);
if (api && api.storage && api.storage.onChanged) {
  api.storage.onChanged.addListener(async () => {
    const state = await getProgression();
    renderWorld(state);
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────

(async () => {
  await renderAll();
  startSidebarAnimation();
})();
