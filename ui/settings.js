const DEFAULT_STATE = {
  xp: 0,
  level: 1,
  coins: 0,
  totalCollected: 0,
  unlockedBehaviors: [],
  achievements: [],
  quests: { active: [], completed: [] },
  settings: { enabled: true, sound: false, scale: 2, speed: 1 },
  siteCollected: { default: 0, claude: 0, chatgpt: 0, gemini: 0, github: 0, stackoverflow: 0, youtube: 0, reddit: 0 },
  siteVisits: { default: 0, claude: 0, chatgpt: 0, gemini: 0, github: 0, stackoverflow: 0, youtube: 0, reddit: 0 },
  siteTime: { default: 0, claude: 0, chatgpt: 0, gemini: 0, github: 0, stackoverflow: 0, youtube: 0, reddit: 0 },
  lastDailyVisit: ""
};

const QUESTS_DATABASE = [
  { id: "first_coffee", title: "First Coffee", desc: "Collect 1 coffee on claude.ai", reward: "+50 XP, +10 Coins" },
  { id: "git_push", title: "Ship It", desc: "Visit GitHub 5 times", reward: "+100 XP, +20 Coins" },
  { id: "stackoverflow_survivor", title: "Stackoverflow Survivor", desc: "Spend 10 minutes on Stack Overflow", reward: "+150 XP, +30 Coins" },
  { id: "star_hunter", title: "Star Hunter", desc: "Collect 10 stars on gemini.google.com", reward: "+120 XP, +25 Coins" },
  { id: "lofi_listener", title: "Chill Coder", desc: "Spend 5 minutes on YouTube", reward: "+80 XP, +15 Coins" }
];

const ACHIEVEMENTS_DATABASE = [
  { id: "hello_world", title: "Hello World", desc: "Initialize your Nakama" },
  { id: "junior_developer", title: "Junior Developer", desc: "Reach Level 3" },
  { id: "senior_developer", title: "Senior Developer", desc: "Reach Level 5" },
  { id: "mischief_master", title: "Mischief Master", desc: "Reach Level 8" },
  { id: "coin_hoarder", title: "Coin Hoarder", desc: "Collect 100 coins total" },
  { id: "coffee_addict", title: "Coffee Addict", desc: "Collect 5 coffees on claude.ai" },
  { id: "git_master", title: "Git Master", desc: "Visit GitHub 10 times" },
  { id: "stack_overflow_survivor", title: "Stack Overflow Survivor", desc: "Spend 20 minutes on Stack Overflow" }
];

const getStorageAPI = () => {
  if (typeof browser !== 'undefined' && browser.storage?.local) return browser.storage.local;
  if (typeof chrome !== 'undefined' && chrome.storage?.local) return chrome.storage.local;
  return null;
};

async function getProgression() {
  const storage = getStorageAPI();
  if (!storage) return { ...DEFAULT_STATE };
  return new Promise((resolve) => {
    storage.get(['nakamaProgress'], (result) => {
      if (result?.nakamaProgress) {
        const s = result.nakamaProgress;
        const merged = { ...DEFAULT_STATE, ...s };
        merged.settings = { ...DEFAULT_STATE.settings, ...s.settings };
        merged.siteCollected = { ...DEFAULT_STATE.siteCollected, ...s.siteCollected };
        merged.siteVisits = { ...DEFAULT_STATE.siteVisits, ...s.siteVisits };
        merged.siteTime = { ...DEFAULT_STATE.siteTime, ...s.siteTime };
        resolve(merged);
      } else {
        resolve({ ...DEFAULT_STATE });
      }
    });
  });
}

async function saveProgression(state) {
  const storage = getStorageAPI();
  if (!storage) return true;
  return new Promise((resolve) => storage.set({ nakamaProgress: state }, () => resolve(true)));
}

function broadcastSettings(state) {
  const ext = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);
  if (!ext?.tabs) return;
  const handler = (tabs) => {
    if (!tabs) return;
    for (const tab of tabs) {
      ext.tabs.sendMessage(tab.id, { type: "UPDATE_SETTINGS", state }).catch(() => {});
    }
  };
  const result = ext.tabs.query({});
  if (result && typeof result.then === 'function') result.then(handler).catch(() => {});
  else ext.tabs.query({}, handler);
}

function formatSpentTime(seconds) {
  if (!seconds) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

async function drawDashboard() {
  const state = await getProgression();
  document.getElementById("setting-sound").checked = state.settings.sound;
  document.getElementById("setting-scale").value = state.settings.scale;
  document.getElementById("scale-indicator").textContent = `${state.settings.scale}x`;
  document.getElementById("setting-speed").value = state.settings.speed;
  document.getElementById("speed-indicator").textContent = `${state.settings.speed}x`;

  const sites = ["default", "claude", "chatgpt", "gemini", "github", "stackoverflow", "youtube", "reddit"];
  const tbody = document.getElementById("stats-table-body");
  tbody.innerHTML = "";

  for (const site of sites) {
    const visits = state.siteVisits[site] || 0;
    const collected = state.siteCollected[site] || 0;
    const time = state.siteTime[site] || 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight: bold; color: #06B6D4;">${site.toUpperCase()}</td>
      <td>${visits}</td>
      <td>${collected}</td>
      <td>${formatSpentTime(time)}</td>
    `;
    tbody.appendChild(tr);
  }

  const qContainer = document.getElementById("quests-container");
  qContainer.innerHTML = "";
  const completedQuests = state.quests && state.quests.completed ? state.quests.completed : [];

  for (const q of QUESTS_DATABASE) {
    const isCompleted = completedQuests.includes(q.id);
    const card = document.createElement("div");
    card.className = `quest-card ${isCompleted ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="quest-info">
        <div class="quest-title">${q.title}</div>
        <div class="quest-desc">${q.desc}</div>
        <div class="quest-rewards">REWARD: ${q.reward}</div>
      </div>
      <div class="quest-status ${isCompleted ? 'completed' : 'active'}">
        ${isCompleted ? 'COMPLETED' : 'ACTIVE'}
      </div>
    `;
    qContainer.appendChild(card);
  }

  const aContainer = document.getElementById("achievements-container");
  aContainer.innerHTML = "";
  const unlockedAchievements = state.achievements || [];

  for (const ach of ACHIEVEMENTS_DATABASE) {
    const isUnlocked = unlockedAchievements.includes(ach.id);
    const card = document.createElement("div");
    card.className = `ach-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <div class="ach-title">${isUnlocked ? '🏆 ' : '🔒 '}${ach.title}</div>
      <div class="ach-desc">${ach.desc}</div>
    `;
    aContainer.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  drawDashboard();
  document.getElementById("setting-sound").addEventListener("change", async (e) => {
    const state = await getProgression();
    state.settings.sound = e.target.checked;
    await saveProgression(state);
    broadcastSettings(state);
  });
  document.getElementById("setting-scale").addEventListener("input", async (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById("scale-indicator").textContent = `${val}x`;
    const state = await getProgression();
    state.settings.scale = val;
    await saveProgression(state);
    broadcastSettings(state);
  });
  document.getElementById("setting-speed").addEventListener("input", async (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById("speed-indicator").textContent = `${val}x`;
    const state = await getProgression();
    state.settings.speed = val;
    await saveProgression(state);
    broadcastSettings(state);
  });
  document.getElementById("btn-reset-full").addEventListener("click", async () => {
    if (confirm("WARNING: This will completely wipe all level progress, achievements, coin balances, and website activity statistics forever. Are you absolutely sure?")) {
      await saveProgression(DEFAULT_STATE);
      broadcastSettings(DEFAULT_STATE);
      drawDashboard();
    }
  });
});
