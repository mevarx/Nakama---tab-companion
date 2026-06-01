

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


browser.runtime.onInstalled.addListener(async () => {
  try {
    const result = await browser.storage.local.get(['nakamaProgress']);
    if (!result || !result.nakamaProgress) {
      await browser.storage.local.set({ nakamaProgress: DEFAULT_STATE });
      console.log("Nakama initialized with default progression state.");
    }
  } catch (err) {
    console.warn("Nakama: Failed to initialize state:", err);
  }
});


browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_VERSION") {
    sendResponse({ version: "1.0.0" });
  } else {
    // Notify or handle site-visit progression in background if needed
    sendResponse({ status: "acknowledged" });
  }
  return true;
});

