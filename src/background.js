const ext = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

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
    speed: 1,
    spawnRate: 15,
    autoChase: true,
    idleRoam: true,
    pageReact: true
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

ext.runtime.onInstalled.addListener(async () => {
  try {
    const result = await ext.storage.local.get(['nakamaProgress']);
    if (!result || !result.nakamaProgress) {
      await ext.storage.local.set({ nakamaProgress: DEFAULT_STATE });
      console.log("Nakama initialized with default progression state.");
    } else {
      // Merge new settings keys into existing progress
      const merged = { ...DEFAULT_STATE, ...result.nakamaProgress };
      merged.settings = { ...DEFAULT_STATE.settings, ...merged.settings };
      await ext.storage.local.set({ nakamaProgress: merged });
    }
  } catch (err) {
    console.warn("Nakama: Failed to initialize state:", err);
  }
});

async function syncSettingsAndBroadcast() {
  if (!ext) return;
  try {
    const result = await ext.storage.local.get(['nakamaProgress', 'settings']);
    const progress = result.nakamaProgress || { settings: {} };
    const settings = result.settings || {};

    progress.settings = { ...progress.settings, ...settings };

    await ext.storage.local.set({ 
      nakamaProgress: progress,
      settings: progress.settings
    });

    const handler = (tabs) => {
      if (!tabs) return;
      tabs.forEach(tab => {
        ext.tabs.sendMessage(tab.id, { type: 'UPDATE_SETTINGS', state: progress }).catch(() => {});
      });
    };

    const q = ext.tabs.query({});
    if (q instanceof Promise) q.then(handler).catch(() => {});
    else ext.tabs.query({}, handler);
  } catch (err) {
    console.warn("Nakama: Failed to sync settings:", err);
  }
}

async function fetchDynamicLine(eventType, context) {
  try {
    const result = await ext.storage.local.get(['anthropicApiKey']);
    const apiKey = result.anthropicApiKey;
    if (!apiKey) {
      console.warn("Nakama: No Anthropic API Key found in storage.");
      return null;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: `You are Nakama, a tiny browser companion. Write ONE short, cute reaction line (max 8 words, no quotes) for this event: "${eventType}". Context: "${context}". Just the line, nothing else.`
        }]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text?.trim() ?? null;
  } catch (err) {
    console.error("Nakama: Error calling Anthropic API:", err);
    return null;
  }
}

ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_VERSION") {
    sendResponse({ version: "1.0.0" });
  } else if (message.type === "nakama:settingsChanged") {
    syncSettingsAndBroadcast().then(() => {
      sendResponse({ status: "ok" });
    });
    return true;
  } else if (message.type === "nakama:getDynamicLine") {
    fetchDynamicLine(message.eventType, message.context).then(line => {
      sendResponse({ line });
    }).catch(() => {
      sendResponse({ line: null });
    });
    return true;
  } else {
    sendResponse({ status: "acknowledged" });
  }
  return true;
});
