

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

const LEVEL_THRESHOLDS = {
  1: 0, 2: 100, 3: 250, 4: 500, 5: 1000, 6: 2000, 7: 4000, 8: 8000
};


const getStorageAPI = () => {
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) return browser.storage.local;
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) return chrome.storage.local;
  return null;
};


async function getProgression() {
  const storage = getStorageAPI();
  if (storage) {
    return new Promise((resolve) => {
      storage.get(['nakamaProgress'], (result) => {
        if (result && result.nakamaProgress) {
          const merged = { ...DEFAULT_STATE, ...result.nakamaProgress };
          merged.settings = { ...DEFAULT_STATE.settings, ...merged.settings };
          resolve(merged);
        } else {
          resolve({ ...DEFAULT_STATE });
        }
      });
    });
  }
  return { ...DEFAULT_STATE };
}


async function saveProgression(state) {
  const storage = getStorageAPI();
  if (storage) {
    return new Promise((resolve) => {
      storage.set({ nakamaProgress: state }, () => resolve(true));
    });
  }
  return true;
}


function broadcastSettings(state) {
  const _browser = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);
  if (!_browser || !_browser.tabs) return;
  const handler = (tabs) => {
    if (!tabs) return;
    for (const tab of tabs) {
      _browser.tabs.sendMessage(tab.id, { type: "UPDATE_SETTINGS", state }).catch(() => {});
    }
  };
  const result = _browser.tabs.query({});
  if (result && typeof result.then === 'function') {
    result.then(handler).catch(() => {});
  } else {
    _browser.tabs.query({}, handler);
  }
}


async function renderPanel() {
  const state = await getProgression();


  document.getElementById("level-tag").textContent = `LEVEL ${state.level} COD3R`;
  document.getElementById("coins-count").textContent = state.coins;
  document.getElementById("total-collected").textContent = state.totalCollected;


  const currentXP = state.xp;
  const currentLvl = state.level;
  const xpForCurrent = LEVEL_THRESHOLDS[currentLvl] || 0;
  const xpForNext = LEVEL_THRESHOLDS[currentLvl + 1] !== undefined ? LEVEL_THRESHOLDS[currentLvl + 1] : 8000;
  
  const xpRelative = currentXP - xpForCurrent;
  const rangeRequired = xpForNext - xpForCurrent;
  const progressPercent = Math.min(100, Math.max(0, (xpRelative / rangeRequired) * 100));

  document.getElementById("xp-text").textContent = `${currentXP} / ${xpForNext}`;
  document.getElementById("xp-bar").style.width = `${progressPercent}%`;


  document.getElementById("toggle-enabled").checked = state.settings.enabled;
  document.getElementById("slider-scale").value = state.settings.scale;
  document.getElementById("scale-value").textContent = `${state.settings.scale}x`;
  document.getElementById("slider-speed").value = state.settings.speed;
  document.getElementById("speed-value").textContent = `${state.settings.speed}x`;


  drawAvatarPreview(state.level);
}


let avatarFrame = 0;
let avatarInterval = null;

function drawAvatarPreview(level) {
  const canvas = document.getElementById("popup-avatar");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  if (avatarInterval) clearInterval(avatarInterval);

  avatarInterval = setInterval(() => {
    ctx.clearRect(0, 0, 48, 48);
    
    ctx.save();
    ctx.scale(1.5, 1.5);

    
    let bobY = (avatarFrame === 2 || avatarFrame === 3) ? 1 : 0;
    let eyeState = (avatarFrame === 3) ? "blink" : "open";
    

    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(8, 28, 16, 2);

    const ox = 8;
    const oy = 8 + bobY;


    ctx.fillStyle = "#111827";
    ctx.fillRect(ox + 3, oy + 19, 3, 2);
    ctx.fillRect(ox + 10, oy + 19, 3, 2);


    ctx.fillStyle = "#FDE047";
    ctx.fillRect(ox + 3, oy + 3, 10, 7);


    ctx.fillStyle = "#7A2828";
    ctx.fillRect(ox + 2, oy + 1, 12, 3);
    ctx.fillRect(ox + 2, oy + 4, 2, 3);
    ctx.fillRect(ox + 12, oy + 4, 2, 3);


    ctx.fillStyle = "#1C1917";
    ctx.fillRect(ox + 2, oy + 10, 12, 9);

    ctx.fillStyle = "#10B981";
    for (let cy = 0; cy < 9; cy+=3) {
      for (let cx = 0; cx < 14; cx+=3) {
        if (Math.floor((cx/3) + (cy/3)) % 2 === 0) {
          ctx.fillRect(ox + 1 + cx, oy + 10 + cy, 3, 3);
        }
      }
    }


    ctx.fillStyle = "#334155";
    if (eyeState === "open") {
      ctx.fillRect(ox + 5, oy + 5, 2, 2);
      ctx.fillRect(ox + 9, oy + 5, 2, 2);
    } else {
      ctx.fillRect(ox + 5, oy + 6, 2, 1);
      ctx.fillRect(ox + 9, oy + 6, 2, 1);
    }


    ctx.fillStyle = "#FDE047";
    ctx.fillRect(ox + 1, oy + 14, 2, 2);
    ctx.fillRect(ox + 13, oy + 14, 2, 2);

    ctx.restore();

    avatarFrame = (avatarFrame + 1) % 4;
  }, 250);
}


document.addEventListener("DOMContentLoaded", () => {
  renderPanel();


  document.getElementById("toggle-enabled").addEventListener("change", async (e) => {
    const state = await getProgression();
    state.settings.enabled = e.target.checked;
    await saveProgression(state);
    broadcastSettings(state);
  });


  document.getElementById("slider-scale").addEventListener("input", async (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById("scale-value").textContent = `${val}x`;
    const state = await getProgression();
    state.settings.scale = val;
    await saveProgression(state);
    broadcastSettings(state);
  });


  document.getElementById("slider-speed").addEventListener("input", async (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById("speed-value").textContent = `${val}x`;
    const state = await getProgression();
    state.settings.speed = val;
    await saveProgression(state);
    broadcastSettings(state);
  });


  document.getElementById("btn-reset").addEventListener("click", async () => {
    if (confirm("Reset developer companion levels, XP, and stats back to default?")) {
      await saveProgression(DEFAULT_STATE);
      broadcastSettings(DEFAULT_STATE);
      renderPanel();
    }
  });


  document.getElementById("btn-dashboard").addEventListener("click", () => {
    const _browser = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (_browser && _browser.tabs) {
      const url = _browser.runtime.getURL("ui/dashboard.html");
      _browser.tabs.create({ url });
    }
  });
});
