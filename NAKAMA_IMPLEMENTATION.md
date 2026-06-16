# Nakama — Tab Companion: Implementation Guide
> Model: `claude-haiku-4-5-20251001` · All AI calls via Anthropic API

---

## Prerequisites

```
src/
├── content/
│   ├── companionAI.js        ← exists
│   ├── animations.js         ← exists
│   └── storage.js            ← exists
├── dashboard/
│   └── popup.html            ← exists
└── manifest.json             ← exists
```

Add to `manifest.json` → `content_scripts.js` array (in order):
```json
"content/objectSpawner.js",
"content/pageObserver.js",
"content/siteThemes.js",
"content/pageInteraction.js",
"content/dialogueEngine.js"
```

Add to `manifest.json` → `permissions`:
```json
"storage", "activeTab", "scripting"
```

---

## Phase 1 — Autonomous Object Spawning & Chasing

### `src/content/objectSpawner.js`

**What it does:** Randomly injects collectible DOM elements every 8–20 s, drifts them with CSS keyframes, fires a custom event when ready.

```js
// objectSpawner.js
import { getSiteTheme } from './siteThemes.js';

const SPAWN_INTERVAL = [8000, 20000];
let spawnTimer = null;

function randomBetween(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function spawnObject() {
  const theme = getSiteTheme();
  const item  = theme.items[Math.floor(Math.random() * theme.items.length)];

  const el = document.createElement('div');
  el.className  = 'nakama-object';
  el.dataset.id = crypto.randomUUID();
  el.dataset.type = item.type;
  el.textContent = item.emoji;

  // Random viewport position (avoid edges)
  el.style.cssText = `
    position: fixed;
    left: ${randomBetween(5, 90)}vw;
    top:  ${randomBetween(10, 85)}vh;
    font-size: 1.6rem;
    z-index: 2147483640;
    pointer-events: none;
    animation: nakamaDrift ${randomBetween(4, 8)}s ease-in-out infinite alternate;
    transition: opacity 0.3s;
    cursor: default;
  `;
  document.body.appendChild(el);

  // Notify companionAI
  window.dispatchEvent(new CustomEvent('nakama:objectSpawned', { detail: { id: el.dataset.id, el } }));

  // Auto-despawn after 30 s if not caught
  setTimeout(() => el.isConnected && el.remove(), 30_000);

  scheduleNext();
}

function scheduleNext() {
  clearTimeout(spawnTimer);
  spawnTimer = setTimeout(spawnObject, randomBetween(...SPAWN_INTERVAL));
}

// Inject CSS once
const style = document.createElement('style');
style.textContent = `
  @keyframes nakamaDrift {
    from { transform: translate(0,0) rotate(-5deg); }
    to   { transform: translate(${randomBetween(-30,30)}px, ${randomBetween(-20,20)}px) rotate(5deg); }
  }
`;
document.head.appendChild(style);

export function startSpawner() { scheduleNext(); }
export function stopSpawner()  { clearTimeout(spawnTimer); }
```

---

### `src/content/companionAI.js` — additions

Add these functions to your existing file (or replace the stub):

```js
// companionAI.js  — new sections to add

let chasing = false;
let roamTimer = null;

/* ── Pathfinding ─────────────────────────────────── */
function getNearestObject() {
  const objects = [...document.querySelectorAll('.nakama-object')];
  if (!objects.length) return null;

  const { x: cx, y: cy } = getCompanionCenter(); // your existing helper
  return objects.reduce((nearest, el) => {
    const r  = el.getBoundingClientRect();
    const dx = r.left - cx, dy = r.top - cy;
    const d  = Math.hypot(dx, dy);
    return d < nearest.d ? { el, d } : nearest;
  }, { el: null, d: Infinity }).el;
}

function chaseObject(targetEl) {
  if (chasing) return;
  chasing = true;
  clearTimeout(roamTimer);

  const step = () => {
    if (!targetEl.isConnected) { chasing = false; startIdleRoam(); return; }

    const r   = targetEl.getBoundingClientRect();
    const { x: cx, y: cy } = getCompanionCenter();
    const dx  = r.left - cx, dy = r.top - cy;
    const dist = Math.hypot(dx, dy);

    if (dist < 30) {
      catchObject(targetEl);
      return;
    }

    const speed = 3; // px per frame
    moveCompanion(cx + (dx / dist) * speed, cy + (dy / dist) * speed); // your existing move fn
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ── Catch ───────────────────────────────────────── */
function catchObject(el) {
  chasing = false;
  window.dispatchEvent(new CustomEvent('nakama:objectCaught', { detail: { type: el.dataset.type, id: el.dataset.id } }));
  el.remove();
  startIdleRoam();
}

/* ── Idle roam ───────────────────────────────────── */
function startIdleRoam() {
  clearTimeout(roamTimer);
  roamTimer = setTimeout(() => {
    const tx = Math.random() * (window.innerWidth  - 80);
    const ty = Math.random() * (window.innerHeight - 80);
    moveCompanion(tx, ty);
    startIdleRoam();
  }, 4000 + Math.random() * 4000);
}

/* ── Wiring ──────────────────────────────────────── */
window.addEventListener('nakama:objectSpawned', () => {
  const target = getNearestObject();
  if (target) chaseObject(target);
});
```

---

### `src/content/animations.js` — additions

```js
// animations.js — add these

export function playCatchBurst(x, y, emoji = '✨') {
  const burst = document.createElement('div');
  burst.style.cssText = `
    position: fixed; left: ${x}px; top: ${y}px;
    font-size: 2rem; z-index: 2147483647;
    animation: nakamaPoofOut 0.6s forwards;
    pointer-events: none;
  `;
  burst.textContent = emoji;
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 650);
}

export function showSpeechBubble(companionEl, text, durationMs = 2500) {
  const bubble = document.createElement('div');
  bubble.className = 'nakama-bubble';
  bubble.textContent = text;
  bubble.style.cssText = `
    position: absolute; bottom: 110%; left: 50%;
    transform: translateX(-50%);
    background: #fff; border: 2px solid #333; border-radius: 12px;
    padding: 4px 10px; font-size: 0.75rem; white-space: nowrap;
    box-shadow: 2px 2px 0 #333; z-index: 2147483647;
    animation: nakamaBubbleIn 0.2s ease;
  `;
  companionEl.style.position = 'relative';
  companionEl.appendChild(bubble);
  setTimeout(() => bubble.remove(), durationMs);
}

// Append keyframes once
document.head.insertAdjacentHTML('beforeend', `<style>
  @keyframes nakamaPoofOut {
    0%   { transform: scale(1);   opacity: 1; }
    60%  { transform: scale(2.2); opacity: 0.8; }
    100% { transform: scale(0);   opacity: 0; }
  }
  @keyframes nakamaBubbleIn {
    from { transform: translateX(-50%) scale(0.7); opacity: 0; }
    to   { transform: translateX(-50%) scale(1);   opacity: 1; }
  }
</style>`);
```

Wire into catch event in `companionAI.js`:
```js
window.addEventListener('nakama:objectCaught', (e) => {
  const { x, y } = getCompanionCenter();
  playCatchBurst(x, y);
  showSpeechBubble(companionEl, '✨ Got it!');
  incrementXP(10); // your existing XP fn
  logCatch(e.detail); // storage
});
```

---

## Phase 2 — Page Interaction Layer

### `src/content/pageObserver.js`

```js
// pageObserver.js
const EVENTS = {
  SCROLL_BOTTOM : 'nakama:scrollBottom',
  VIDEO_PLAY    : 'nakama:videoPlay',
  VIDEO_PAUSE   : 'nakama:videoPause',
  LONG_ARTICLE  : 'nakama:longArticle',
  PAGE_IDLE     : 'nakama:pageIdle',
};

/* Scroll depth */
let scrollFired = false;
window.addEventListener('scroll', () => {
  const pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
  if (pct > 0.92 && !scrollFired) {
    scrollFired = true;
    window.dispatchEvent(new CustomEvent(EVENTS.SCROLL_BOTTOM));
  }
});

/* Video play/pause */
document.addEventListener('play',  e => { if (e.target.tagName === 'VIDEO') window.dispatchEvent(new CustomEvent(EVENTS.VIDEO_PLAY)); },  true);
document.addEventListener('pause', e => { if (e.target.tagName === 'VIDEO') window.dispatchEvent(new CustomEvent(EVENTS.VIDEO_PAUSE)); }, true);

/* Long article (>2000 words) */
const wordCount = document.body.innerText.split(/\s+/).length;
if (wordCount > 2000) window.dispatchEvent(new CustomEvent(EVENTS.LONG_ARTICLE, { detail: { wordCount } }));

/* Page idle — 90 s no interaction */
let idleTimer;
const resetIdle = () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => window.dispatchEvent(new CustomEvent(EVENTS.PAGE_IDLE)), 90_000); };
['mousemove','keydown','scroll','click'].forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }));
resetIdle();
```

---

### `src/content/pageInteraction.js`

```js
// pageInteraction.js — sit on images

function findSitTargets() {
  return [...document.querySelectorAll('img')].filter(img => {
    const r = img.getBoundingClientRect();
    return r.width > 80 && r.height > 60 && r.top > 0;
  });
}

export function sitOnRandomImage() {
  const targets = findSitTargets();
  if (!targets.length) return false;

  const img = targets[Math.floor(Math.random() * targets.length)];
  const r   = img.getBoundingClientRect();

  // Walk companion to top-center of image
  const tx = r.left + r.width  / 2;
  const ty = r.top;                   // sit on top edge
  moveCompanion(tx, ty);              // your existing move fn
  return true;
}

// Trigger sit occasionally when idle
window.addEventListener('nakama:pageIdle', () => {
  if (Math.random() < 0.4) sitOnRandomImage();
});
```

---

### `src/content/siteThemes.js`

```js
// siteThemes.js

const THEMES = {
  'github.com':    { items: [{ type:'file', emoji:'📄' }, { type:'star', emoji:'⭐' }, { type:'bug', emoji:'🐛' }] },
  'youtube.com':   { items: [{ type:'star', emoji:'⭐' }, { type:'heart', emoji:'❤️' }, { type:'note', emoji:'🎵' }] },
  'reddit.com':    { items: [{ type:'upvote', emoji:'⬆️' }, { type:'award', emoji:'🏆' }, { type:'coin', emoji:'🪙' }] },
  'twitter.com':   { items: [{ type:'heart', emoji:'❤️' }, { type:'retweet', emoji:'🔁' }, { type:'star', emoji:'⭐' }] },
  'x.com':         { items: [{ type:'heart', emoji:'❤️' }, { type:'retweet', emoji:'🔁' }] },
  'stackoverflow.com': { items: [{ type:'answer', emoji:'✅' }, { type:'point', emoji:'🔷' }] },
  'default':       { items: [{ type:'gem', emoji:'💎' }, { type:'star', emoji:'⭐' }, { type:'coin', emoji:'🪙' }] },
};

export function getSiteTheme() {
  const host = location.hostname.replace('www.', '');
  return THEMES[host] ?? THEMES['default'];
}
```

---

### `src/content/dialogueEngine.js`

```js
// dialogueEngine.js — uses Haiku for dynamic speech lines

import { showSpeechBubble } from './animations.js';

const STATIC = {
  'nakama:scrollBottom' : ['You read it all! 📖', 'Knowledge absorbed! 🧠'],
  'nakama:videoPlay'    : ['Ooh, what are we watching? 🎬', 'Movie time! 🍿'],
  'nakama:videoPause'   : ['Taking a break? ☕'],
  'nakama:longArticle'  : ['This is a long one... 📜', 'Big read! Want a summary?'],
  'nakama:pageIdle'     : ['Still there? 👀', 'Zzzz... 💤'],
};

async function getDynamicLine(eventType, context = '') {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are Nakama, a tiny browser companion. Write ONE short, cute reaction line (max 8 words, no quotes) for this event: "${eventType}". Context: "${context}". Just the line, nothing else.`
        }]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text?.trim() ?? null;
  } catch { return null; }
}

let aiCallsThisSession = 0;

async function react(eventType, context = '') {
  let line;
  if (aiCallsThisSession < 2) {
    line = await getDynamicLine(eventType, context);
    if (line) aiCallsThisSession++;
  }
  if (!line) {
    const pool = STATIC[eventType] ?? ['👋'];
    line = pool[Math.floor(Math.random() * pool.length)];
  }
  showSpeechBubble(companionEl, line); // companionEl = your existing ref
}

Object.keys(STATIC).forEach(ev => {
  window.addEventListener(ev, (e) => react(ev, JSON.stringify(e.detail ?? {})));
});
```

> **Note:** `aiCallsThisSession` caps Haiku at 2 calls — same cap you use in NyayAI.

---

## Phase 3 — Dashboard "World" Tab

### `src/dashboard/world.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>World</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <section class="world-panel">
    <h2>🌍 World</h2>

    <div class="stat-grid">
      <div class="stat"><span id="totalCaught">0</span><label>Caught</label></div>
      <div class="stat"><span id="sitesVisited">0</span><label>Sites</label></div>
      <div class="stat"><span id="totalXP">0</span><label>XP</label></div>
    </div>

    <label>Spawn rate
      <input type="range" id="spawnRate" min="5" max="60" value="15" step="1">
      <span id="spawnRateVal">15s</span>
    </label>

    <div class="toggles">
      <label><input type="checkbox" id="autoChase" checked> Auto-chase objects</label>
      <label><input type="checkbox" id="idleRoam"  checked> Idle roaming</label>
      <label><input type="checkbox" id="pageReact" checked> Page reactions</label>
    </div>

    <h3>Recent Catches</h3>
    <ul id="catchFeed" class="catch-feed"></ul>
  </section>

  <script src="world.js" type="module"></script>
</body>
</html>
```

---

### `src/dashboard/world.js`

```js
// dashboard/world.js

const $ = id => document.getElementById(id);

/* ── Load stats ───────────────────────────────────── */
async function loadStats() {
  const data = await browser.storage.local.get(['totalCaught','sitesVisited','totalXP','catchHistory','settings']);

  $('totalCaught').textContent  = data.totalCaught  ?? 0;
  $('sitesVisited').textContent = data.sitesVisited ?? 0;
  $('totalXP').textContent      = data.totalXP      ?? 0;

  const history = data.catchHistory ?? [];
  const feed    = $('catchFeed');
  feed.innerHTML = '';
  history.slice(-20).reverse().forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.emoji ?? '📦'} ${entry.type} — ${entry.site} · ${timeAgo(entry.ts)}`;
    feed.appendChild(li);
  });

  const s = data.settings ?? {};
  $('spawnRate').value       = s.spawnRate ?? 15;
  $('spawnRateVal').textContent = `${s.spawnRate ?? 15}s`;
  $('autoChase').checked     = s.autoChase  ?? true;
  $('idleRoam').checked      = s.idleRoam   ?? true;
  $('pageReact').checked     = s.pageReact  ?? true;
}

/* ── Save settings ────────────────────────────────── */
function saveSettings() {
  browser.storage.local.set({ settings: {
    spawnRate : parseInt($('spawnRate').value),
    autoChase : $('autoChase').checked,
    idleRoam  : $('idleRoam').checked,
    pageReact : $('pageReact').checked,
  }});
  browser.runtime.sendMessage({ type: 'nakama:settingsChanged' });
}

$('spawnRate').addEventListener('input', () => {
  $('spawnRateVal').textContent = `${$('spawnRate').value}s`;
  saveSettings();
});
['autoChase','idleRoam','pageReact'].forEach(id => $( id).addEventListener('change', saveSettings));

/* ── Live updates ─────────────────────────────────── */
browser.storage.onChanged.addListener(loadStats);

/* ── Util ─────────────────────────────────────────── */
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

loadStats();
```

---

### `src/content/storage.js` — additions

```js
// storage.js — add these helpers

export async function logCatch({ type, id }) {
  const data  = await browser.storage.local.get(['totalCaught','totalXP','catchHistory','sitesVisited']);
  const host  = location.hostname.replace('www.','');
  const history = data.catchHistory ?? [];

  history.push({ type, id, site: host, ts: Date.now() });
  if (history.length > 200) history.shift();

  const sites = new Set((data.sitesVisitedList ?? []).concat(host));

  await browser.storage.local.set({
    totalCaught     : (data.totalCaught ?? 0) + 1,
    totalXP         : (data.totalXP ?? 0) + 10,
    catchHistory    : history,
    sitesVisited    : sites.size,
    sitesVisitedList: [...sites],
  });
}
```

---

## Architecture Summary

```
objectSpawner.js
  └─[CustomEvent nakama:objectSpawned]─► companionAI.js
                                              └─[nakama:objectCaught]─► animations.js
                                                                             └─ logCatch()─► storage.js

pageObserver.js
  └─[nakama:scroll/video/idle]──► dialogueEngine.js (Haiku API ≤2 calls)
                                └─► objectSpawner.js (optional bonus spawn)

siteThemes.js ──► objectSpawner.js (item pool)

storage.js ◄── all content scripts
   └── browser.storage.onChanged ──► dashboard/world.js (live feed)

browser.runtime.sendMessage ──► background.js (settings relay)
```

---

## VSCode Workflow

1. Open each file path from this guide, create it, paste the code.
2. Run **Extension: Reload Extension** (`Ctrl+Shift+P`) after each save.
3. Test in a new tab — open DevTools console and watch for `nakama:*` events.
4. Use **browser.storage.local** inspector (Firefox: about:debugging, Chrome: `chrome://extensions → Inspect`) to verify catch logs.

---

*All AI calls use `claude-haiku-4-5-20251001` · max 2 per session · no API key needed in extension (proxy via background.js fetch with your stored key in `browser.storage.local`)*
