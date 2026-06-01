

const DEFAULT_STATE = {
  xp: 0,
  level: 1,
  coins: 0,
  totalCollected: 0,
  unlockedBehaviors: [],
  achievements: [],
  quests: {
    active: [],
    completed: []
  },
  settings: {
    enabled: true,
    sound: false,
    scale: 2,
    speed: 1
  },
  siteCollected: {
    default: 0,
    claude: 0,
    chatgpt: 0,
    gemini: 0,
    github: 0,
    stackoverflow: 0,
    youtube: 0,
    reddit: 0
  },
  siteVisits: {
    default: 0,
    claude: 0,
    chatgpt: 0,
    gemini: 0,
    github: 0,
    stackoverflow: 0,
    youtube: 0,
    reddit: 0
  },
  siteTime: {
    default: 0,
    claude: 0,
    chatgpt: 0,
    gemini: 0,
    github: 0,
    stackoverflow: 0,
    youtube: 0,
    reddit: 0
  },
  lastDailyVisit: ""
};

const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 2000,
  7: 4000,
  8: 8000
};

let memoryStore = { ...DEFAULT_STATE };



const getStorageAPI = () => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return chrome.storage.local;
  }
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
    return browser.storage.local;
  }
  return null;
};



export async function getProgression() {
  const storage = getStorageAPI();
  if (storage) {
    return new Promise((resolve) => {
      storage.get(['nakamaProgress'], (result) => {
        if (result && result.nakamaProgress) {
          const merged = { ...DEFAULT_STATE, ...result.nakamaProgress };
          merged.settings = { ...DEFAULT_STATE.settings, ...merged.settings };
          merged.siteCollected = { ...DEFAULT_STATE.siteCollected, ...merged.siteCollected };
          merged.siteVisits = { ...DEFAULT_STATE.siteVisits, ...merged.siteVisits };
          merged.siteTime = { ...DEFAULT_STATE.siteTime, ...merged.siteTime };
          resolve(merged);
        } else {
          resolve({ ...DEFAULT_STATE });
        }
      });
    });
  } else {
    return { ...memoryStore };
  }
}

export async function saveProgression(state) {
  const storage = getStorageAPI();
  if (storage) {
    return new Promise((resolve) => {
      storage.set({ nakamaProgress: state }, () => {
        resolve(true);
      });
    });
  } else {
    memoryStore = { ...state };
    return true;
  }
}

export function getXPForNextLevel(currentLevel) {
  const nextLevel = currentLevel + 1;
  return LEVEL_THRESHOLDS[nextLevel] !== undefined ? LEVEL_THRESHOLDS[nextLevel] : LEVEL_THRESHOLDS[8] * Math.pow(2, nextLevel - 8);
}

export function checkLevelUp(currentXP, currentLevel) {
  let targetLevel = currentLevel;
  while (targetLevel < 8) {
    const xpRequired = getXPForNextLevel(targetLevel);
    if (currentXP >= xpRequired) {
      targetLevel++;
    } else {
      break;
    }
  }
  return targetLevel;
}

export async function addXP(amount) {
  const state = await getProgression();
  state.xp += amount;
  
  const newLevel = checkLevelUp(state.xp, state.level);
  let leveledUp = false;
  if (newLevel > state.level) {
    state.level = newLevel;
    leveledUp = true;
  }
  
  await saveProgression(state);
  return { state, leveledUp };
}

export async function addCoins(amount) {
  const state = await getProgression();
  state.coins += amount;
  state.totalCollected += amount;
  await saveProgression(state);
  return state;
}

export async function recordVisit(siteKey) {
  const state = await getProgression();
  

  if (!state.siteVisits) state.siteVisits = { ...DEFAULT_STATE.siteVisits };
  
  state.siteVisits[siteKey] = (state.siteVisits[siteKey] || 0) + 1;
  
  let addedXP = 0;
  const today = new Date().toDateString();
  if (state.lastDailyVisit !== today) {
    state.lastDailyVisit = today;
    addedXP += 20;
  }
  
  if (state.siteVisits[siteKey] === 1) {
    addedXP += 10;
  }
  
  let leveledUp = false;
  if (addedXP > 0) {
    state.xp += addedXP;
    const newLevel = checkLevelUp(state.xp, state.level);
    if (newLevel > state.level) {
      state.level = newLevel;
      leveledUp = true;
    }
  }
  
  await saveProgression(state);
  return { state, addedXP, leveledUp };
}

export async function recordSiteTime(siteKey, seconds) {
  const state = await getProgression();
  if (!state.siteTime) state.siteTime = { ...DEFAULT_STATE.siteTime };
  state.siteTime[siteKey] = (state.siteTime[siteKey] || 0) + seconds;
  await saveProgression(state);
  return state;
}

export async function recordCollection(siteKey) {
  const state = await getProgression();
  if (!state.siteCollected) state.siteCollected = { ...DEFAULT_STATE.siteCollected };
  state.siteCollected[siteKey] = (state.siteCollected[siteKey] || 0) + 1;
  await saveProgression(state);
  return state;
}
