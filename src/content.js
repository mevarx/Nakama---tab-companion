(async function () {
  if (window.nakamaInjected) return;
  window.nakamaInjected = true;

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

  const STATE_LEVEL_LOCKS = {
    idle: 1, walk: 1, sit: 2, type: 2, sleep: 3, react: 1, special: 4
  };


  const getStorageAPI = () => {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) return browser.storage.local;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) return chrome.storage.local;
    return null;
  };

  let localMemoryState = { ...DEFAULT_STATE };

  async function getProgression() {
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
      return { ...localMemoryState };
    }
  }

  async function saveProgression(state) {
    localMemoryState = { ...state };
    const storage = getStorageAPI();
    if (storage) {
      return new Promise((resolve) => {
        storage.set({ nakamaProgress: state }, () => resolve(true));
      });
    }
    return true;
  }


  const THEME_REGISTRY = {
    default: {
      name: "default",
      characterStyle: "tanjiro",
      colors: { primary: "#4F46E5", secondary: "#1E293B", accent: "#F8FAFC", hoodie: "#4F46E5", hair: "#334155", skin: "#FDE047" },
      behaviors: { idle: "walk", onPageLoad: "react" },
      speechBubbles: ["Code is poetry.", "Coffee in, code out.", "Did it build?", "Works on my machine!", "Commit early, commit often.", "Refactoring in progress..."],
      collectible: "coin"
    },
    github: {
      name: "github",
      characterStyle: "tanjiro",
      colors: { primary: "#24292F", secondary: "#0D1117", accent: "#58A6FF", hoodie: "#1B1F23", hair: "#0D1117", skin: "#FDE047" },
      behaviors: { idle: "type", onPageLoad: "react", specialTrigger: "onPullRequestMerge" },
      speechBubbles: ["git push origin main", "Why won't this merge?", "LGTM! Approve it.", "Conflict in README.md...", "Rebasing with master...", "404: Sleep not found.", "Check out my commit graph!"],
      collectible: "wrench"
    },
    claude: {
      name: "claude",
      characterStyle: "itadori",
      colors: { primary: "#CC785C", secondary: "#191919", accent: "#F5E6D3", hoodie: "#CC785C", hair: "#3B2E2A", skin: "#FDE047" },
      behaviors: { idle: "think", onPageLoad: "react", specialTrigger: "onUserTyping" },
      speechBubbles: ["Thinking...", "Interesting prompt.", "Running inference...", "Need more context?", "Let me process that.", "Generating an elegant solution..."],
      collectible: "coffee"
    },
    chatgpt: {
      name: "chatgpt",
      characterStyle: "toji",
      colors: { primary: "#10A37F", secondary: "#202123", accent: "#ECECF1", hoodie: "#10A37F", hair: "#4A5568", skin: "#FDE047" },
      behaviors: { idle: "type", onPageLoad: "react", specialTrigger: "onWaitingResponse" },
      speechBubbles: ["GPT moment...", "Tokens loading...", "How can I help you today?", "Generating response...", "As an AI developed by...", "Context window: 128k!"],
      collectible: "bubble"
    },
    gemini: {
      name: "gemini",
      characterStyle: "gojo",
      colors: { primary: "#1A73E8", secondary: "#0F172A", accent: "#E8F0FE", hoodie: "#4285F4", hair: "#0F172A", skin: "#FDE047" },
      behaviors: { idle: "float", onPageLoad: "sparkle" },
      speechBubbles: ["Multimodal!", "Searching Google...", "Google it.", "Double check with Google.", "Processing video, audio, and code!", "Exploring 1M token context..."],
      collectible: "star"
    },
    stackoverflow: {
      name: "stackoverflow",
      characterStyle: "tanjiro",
      colors: { primary: "#F48225", secondary: "#2D2D2D", accent: "#FDF7E7", hoodie: "#BCBBBB", hair: "#5C5C5C", skin: "#FDE047" },
      behaviors: { idle: "sweat", onPageLoad: "react", specialTrigger: "onAcceptedAnswerVisible" },
      speechBubbles: ["Closed as duplicate...", "Did you try turning it off?", "This worked in 2009.", "Downvoted: Not a real question.", "Show me your stack trace.", "Copy-pasting from page...", "Who downvoted my solution?!"],
      collectible: "badge"
    },
    youtube: {
      name: "youtube",
      characterStyle: "sasuke",
      colors: { primary: "#FF0000", secondary: "#0F0F0F", accent: "#FEEBEB", hoodie: "#3F3F3F", hair: "#8E8E8E", skin: "#FDE047" },
      behaviors: { idle: "popcorn", onPageLoad: "react", specialTrigger: "onUserIdle60s" },
      speechBubbles: ["Just one more video...", "5 minute video = 40 min.", "Autoplay betrayed me.", "Lofi hip hop beats to code/relax to...", "Ad blocker detected? Oh no...", "Let me watch this coding tutorial..."],
      collectible: "popcorn"
    },
    reddit: {
      name: "reddit",
      characterStyle: "luffy",
      colors: { primary: "#FF4500", secondary: "#1A1A1B", accent: "#FFEBE5", hoodie: "#FF4500", hair: "#2D3748", skin: "#FDE047" },
      behaviors: { idle: "scroll", onPageLoad: "react", specialTrigger: "onUpvoteSlapped" },
      speechBubbles: ["This is the way.", "Based.", "Actually...", "Thanks for the gold, kind stranger!", "Infinite scrolling active.", "Downvoted into oblivion."],
      collectible: "upvote"
    },
    google: {
      name: "google",
      characterStyle: "aizen",
      colors: { primary: "#4285F4", secondary: "#34A853", accent: "#FBBC05", hoodie: "#4285F4", hair: "#5C3A21", skin: "#FDE047" },
      behaviors: { idle: "walk", onPageLoad: "react" },
      speechBubbles: ["Since when were you under the impression that you were searching?", "All according to plan.", "Google knows all.", "Shatter, Kyoka Suigetsu.", "I'm feeling lucky."],
      collectible: "coin"
    },
    mail: {
      name: "mail",
      characterStyle: "kira",
      colors: { primary: "#EA4335", secondary: "#1A1A1A", accent: "#EAEAEA", hoodie: "#EA4335", hair: "#4A3B32", skin: "#FDE047" },
      behaviors: { idle: "type", onPageLoad: "react" },
      speechBubbles: ["I am the god of the new world.", "Delete! Delete! Delete!", "Just as planned.", "I'll take a potato chip... and eat it!", "I've won."],
      collectible: "coin"
    },
    linkedin: {
      name: "linkedin",
      characterStyle: "ace",
      colors: { primary: "#0A66C2", secondary: "#FFFFFF", accent: "#E9E5DF", hoodie: "#0A66C2", hair: "#0F172A", skin: "#FDE047" },
      behaviors: { idle: "walk", onPageLoad: "react" },
      speechBubbles: ["I am thrilled to announce...", "Humbled and honored.", "Agree?", "Boost this post!", "Networking is key."],
      collectible: "badge"
    }
  };

  function detectTheme() {
    const host = window.location.hostname;
    if (host.includes("mail.google.com") || host.includes("outlook.live.com")) return "mail";
    if (host.includes("gemini.google.com")) return "gemini";
    if (host.includes("google.com")) return "google";
    if (host.includes("claude.ai")) return "claude";
    if (host.includes("chatgpt.com")) return "chatgpt";
    if (host.includes("github.com")) return "github";
    if (host.includes("stackoverflow.com")) return "stackoverflow";
    if (host.includes("youtube.com")) return "youtube";
    if (host.includes("linkedin.com")) return "linkedin";
    if (host.includes("reddit.com")) return "reddit";
    return "default";
  }


  function generateSpriteSheet(theme) {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const colors = theme.colors;

    for (let row = 0; row < 8; row++) {
      const states = ["idle", "walk_right", "walk_left", "sit", "type", "sleep", "react", "special"];
      const stateName = states[row] || "idle";
      const frameCounts = { idle: 4, walk_right: 6, walk_left: 6, sit: 2, type: 4, sleep: 3, react: 4, special: 6 };
      const numFrames = frameCounts[stateName] || 4;

      for (let frame = 0; frame < numFrames; frame++) {
        drawProceduralFrame(ctx, frame * 32, row * 32, stateName, frame, colors, theme.name, theme.characterStyle);
      }
    }
    return canvas;
  }

  function drawProceduralFrame(ctx, dx, dy, state, frame, colors, themeName, characterStyle) {
    ctx.save();
    ctx.translate(dx, dy);

    if (state === "walk_left") {
      ctx.translate(32, 0);
      ctx.scale(-1, 1);
    }

    let bobY = 0;
    let legCycle = 0;
    let eyeState = "open";
    let drawLaptop = false;
    let drawZ = false;
    let drawPopcorn = false;
    let handsState = "down";
    let jumpY = 0;
    let sweatState = false;
    let bubbleState = false;
    let sparkleState = false;

    if (state === "idle") {
      if (frame === 2 || frame === 3) bobY = 1;
      if (frame === 3) eyeState = "blink";
    } else if (state === "walk_right" || state === "walk_left") {
      legCycle = frame % 4;
      if (frame % 2 === 1) bobY = 1;
    } else if (state === "sit") {
      bobY = 2;
      legCycle = 4;
      if (frame === 1) eyeState = "blink";
    } else if (state === "type") {
      bobY = 2;
      legCycle = 4;
      drawLaptop = true;
      handsState = "type";
    } else if (state === "sleep") {
      bobY = 3;
      legCycle = 4;
      eyeState = "closed";
      drawZ = true;
    } else if (state === "react") {
      eyeState = "squint";
      handsState = "wave";
      if (frame === 1 || frame === 2) jumpY = -4;
    } else if (state === "special") {
      if (themeName === "github") {
        bobY = (frame % 2 === 0) ? 0 : 2;
        legCycle = frame % 4;
        handsState = "wave";
        sparkleState = true;
      } else if (themeName === "claude") {
        bobY = Math.sin(frame * Math.PI / 3) * 1.5;
        eyeState = (frame % 2 === 0) ? "squint" : "open";
        sparkleState = true;
      } else if (themeName === "chatgpt") {
        bobY = 2;
        legCycle = 4;
        drawLaptop = true;
        handsState = "type";
        bubbleState = true;
      } else if (themeName === "gemini") {
        bobY = -2 + Math.sin(frame * Math.PI / 3) * 3;
        legCycle = 4;
        sparkleState = true;
      } else if (themeName === "stackoverflow") {
        bobY = 2;
        legCycle = 4;
        eyeState = "squint";
        sweatState = true;
        handsState = "facepalm";
      } else if (themeName === "youtube") {
        bobY = 2;
        legCycle = 4;
        drawPopcorn = true;
        if (frame % 2 === 1) handsState = "eat";
      } else if (themeName === "reddit") {
        bobY = 2;
        legCycle = 4;
        handsState = "slap";
        bubbleState = true;
      } else {
        bobY = (frame % 2 === 0) ? -1 : 1;
        handsState = "wave";
      }
    }

    if (drawZ) {
      ctx.fillStyle = "#A5B4FC";
      const zOffset = (frame * 3) % 9;
      ctx.font = "8px 'Courier New', monospace";
      ctx.fillText("z", 22, 10 - zOffset);
    }

    if (sweatState && frame % 2 === 0) {
      ctx.fillStyle = "#60A5FA";
      ctx.fillRect(22, 16, 2, 2);
      ctx.fillRect(23, 19, 1, 2);
    }

    if (sparkleState) {
      ctx.fillStyle = colors.accent;
      if (frame % 3 === 0) {
        ctx.fillRect(6, 6, 2, 2);
        ctx.fillRect(24, 20, 2, 2);
      } else if (frame % 3 === 1) {
        ctx.fillRect(26, 8, 2, 2);
        ctx.fillRect(4, 22, 2, 2);
      }
    }

    if (bubbleState && frame % 2 === 0) {
      ctx.fillStyle = colors.primary;
      ctx.fillRect(24, 8, 4, 4);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(25, 9, 2, 2);
    }

    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(8, 29, 16, 2);

    const ox = 8;
    const oy = 8 + bobY + jumpY;
    const style = characterStyle || "default";

    let pantsColor = "#334155";
    if (style === "toji" || style === "aizen") pantsColor = "#F1F5F9";
    else if (style === "gojo" || style === "sasuke" || style === "tanjiro" || style === "itadori" || style === "ace") pantsColor = "#111827";
    else if (style === "kira") pantsColor = "#78716C";
    else if (style === "luffy") pantsColor = "#1D4ED8";

    ctx.fillStyle = pantsColor;
    if (legCycle === 0) {
      ctx.fillRect(ox + 3, oy + 19, 3, 2);
      ctx.fillRect(ox + 10, oy + 19, 3, 2);
    } else if (legCycle === 1) {
      ctx.fillRect(ox + 4, oy + 18, 3, 2);
      ctx.fillRect(ox + 9, oy + 19, 3, 2);
    } else if (legCycle === 2) {
      ctx.fillRect(ox + 3, oy + 19, 3, 2);
      ctx.fillRect(ox + 10, oy + 18, 3, 2);
    } else if (legCycle === 3) {
      ctx.fillRect(ox + 2, oy + 19, 3, 2);
      ctx.fillRect(ox + 11, oy + 19, 3, 2);
    } else if (legCycle === 4) {
      ctx.fillRect(ox + 1, oy + 19, 5, 2);
      ctx.fillRect(ox + 10, oy + 19, 5, 2);
    }


    if (style === "default") {
      ctx.fillStyle = colors.hoodie;
      ctx.fillRect(ox + 2, oy + 10, 12, 9);
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(ox + 7, oy + 10, 2, 9);
      ctx.fillStyle = colors.hoodie;
      ctx.fillRect(ox + 1, oy + 0, 14, 11);
      ctx.fillRect(ox + 0, oy + 2, 16, 7);
      ctx.fillStyle = colors.skin;
      ctx.fillRect(ox + 3, oy + 3, 10, 7);
      ctx.fillStyle = colors.hair || "#334155";
      ctx.fillRect(ox + 3, oy + 2, 10, 2);
      ctx.fillRect(ox + 3, oy + 4, 2, 3);
      ctx.fillRect(ox + 11, oy + 4, 2, 3);
    } else {
      ctx.fillStyle = colors.skin;
      ctx.fillRect(ox + 3, oy + 3, 10, 7);

      if (style === "itadori") {
        ctx.fillStyle = "#F472B6";
        ctx.fillRect(ox + 2, oy + 1, 12, 3);
        ctx.fillRect(ox + 1, oy + 3, 2, 4);
        ctx.fillRect(ox + 13, oy + 3, 2, 4);
        ctx.fillRect(ox + 4, oy, 2, 2);
        ctx.fillRect(ox + 10, oy, 2, 2);
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(ox + 2, oy + 10, 12, 3);
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(ox + 2, oy + 13, 12, 6);
      } else if (style === "toji") {
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(ox + 2, oy + 2, 12, 2);
        ctx.fillRect(ox + 3, oy + 4, 1, 2);
        ctx.fillRect(ox + 12, oy + 4, 1, 2);
        ctx.fillStyle = "#111827";
        ctx.fillRect(ox + 3, oy + 10, 10, 9);
        ctx.fillStyle = colors.skin;
        ctx.fillRect(ox + 1, oy + 10, 2, 5);
        ctx.fillRect(ox + 13, oy + 10, 2, 5);
      } else if (style === "gojo") {
        ctx.fillStyle = "#F8FAFC";
        ctx.fillRect(ox + 2, oy, 12, 3);
        ctx.fillRect(ox + 4, oy - 1, 8, 2);
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(ox + 2, oy + 4, 12, 3);
        ctx.fillStyle = "#111827";
        ctx.fillRect(ox + 2, oy + 10, 12, 9);
        ctx.fillRect(ox + 3, oy + 9, 10, 2);
      } else if (style === "sasuke") {
        ctx.fillStyle = "#1E1B4B";
        ctx.fillRect(ox + 2, oy + 1, 12, 3);
        ctx.fillRect(ox + 0, oy + 3, 3, 4);
        ctx.fillRect(ox + 13, oy + 3, 3, 4);
        ctx.fillStyle = "#F1F5F9";
        ctx.fillRect(ox + 2, oy + 10, 12, 6);
        ctx.fillStyle = colors.skin;
        ctx.fillRect(ox + 6, oy + 10, 4, 3);

        ctx.fillStyle = "#6B21A8";
        ctx.fillRect(ox + 1, oy + 16, 14, 3);
        ctx.fillRect(ox - 1, oy + 17, 3, 3);
      } else if (style === "aizen") {
        ctx.fillStyle = "#5C3A21";
        ctx.fillRect(ox + 3, oy + 1, 10, 3);
        ctx.fillRect(ox + 4, oy, 8, 2);
        ctx.fillRect(ox + 7, oy + 3, 2, 2);
        ctx.fillStyle = "#F8FAFC";
        ctx.fillRect(ox + 2, oy + 10, 12, 9);
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(ox + 2, oy + 15, 12, 2);
      } else if (style === "kira") {
        ctx.fillStyle = "#4A3B32";
        ctx.fillRect(ox + 2, oy + 1, 12, 3);
        ctx.fillRect(ox + 2, oy + 4, 2, 2);
        ctx.fillRect(ox + 12, oy + 4, 2, 2);
        ctx.fillStyle = "#D6D3D1";
        ctx.fillRect(ox + 2, oy + 10, 12, 9);
        ctx.fillStyle = "#DC2626";
        ctx.fillRect(ox + 7, oy + 10, 2, 5);
        ctx.fillStyle = "#111827";
        ctx.fillRect(ox + 1, oy + 13, 3, 4);
      } else if (style === "luffy") {
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(ox + 2, oy + 2, 12, 2);
        ctx.fillStyle = "#FDE047";
        ctx.fillRect(ox - 1, oy, 18, 2);
        ctx.fillRect(ox + 2, oy - 3, 12, 3);
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(ox + 2, oy - 1, 12, 1);
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(ox + 2, oy + 10, 12, 9);
        ctx.fillStyle = colors.skin;
        ctx.fillRect(ox + 5, oy + 10, 6, 9);
      } else if (style === "ace") {
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(ox + 2, oy + 2, 12, 2);
        ctx.fillRect(ox + 1, oy + 4, 2, 3);
        ctx.fillRect(ox + 13, oy + 4, 2, 3);
        ctx.fillStyle = "#F97316";
        ctx.fillRect(ox - 2, oy - 1, 20, 2);
        ctx.fillRect(ox + 2, oy - 4, 12, 4);
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(ox + 2, oy - 2, 12, 1);
        ctx.fillStyle = colors.skin;
        ctx.fillRect(ox + 2, oy + 10, 12, 9);
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(ox + 7, oy + 11, 2, 2);
      } else if (style === "tanjiro") {
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
      }
    }

    ctx.fillStyle = colors.hair || "#334155";
    if (eyeState === "open") {
      ctx.fillRect(ox + 5, oy + 5, 2, 2);
      ctx.fillRect(ox + 9, oy + 5, 2, 2);
    } else if (eyeState === "blink") {
      ctx.fillRect(ox + 5, oy + 6, 2, 1);
      ctx.fillRect(ox + 9, oy + 6, 2, 1);
    } else if (eyeState === "squint") {
      ctx.fillRect(ox + 5, oy + 5, 2, 1);
      ctx.fillRect(ox + 9, oy + 5, 2, 1);
      ctx.fillRect(ox + 6, oy + 6, 1, 1);
      ctx.fillRect(ox + 9, oy + 6, 1, 1);
    } else if (eyeState === "closed") {
      ctx.fillRect(ox + 5, oy + 6, 2, 1);
      ctx.fillRect(ox + 9, oy + 6, 2, 1);
    }

    ctx.fillStyle = colors.skin;
    if (handsState === "down") {
      ctx.fillRect(ox + 1, oy + 14, 2, 2);
      ctx.fillRect(ox + 13, oy + 14, 2, 2);
    } else if (handsState === "wave") {
      ctx.fillRect(ox + 1, oy + 14, 2, 2);
      ctx.fillRect(ox + 14, oy + 8, 2, 2);
    } else if (handsState === "type") {
      ctx.fillRect(ox + 4, oy + 13 + (frame % 2), 2, 2);
      ctx.fillRect(ox + 10, oy + 13 - (frame % 2), 2, 2);
    } else if (handsState === "facepalm") {
      ctx.fillRect(ox + 1, oy + 14, 2, 2);
      ctx.fillRect(ox + 7, oy + 6, 3, 3);
    } else if (handsState === "eat") {
      ctx.fillRect(ox + 1, oy + 14, 2, 2);
      ctx.fillRect(ox + 7, oy + 8, 2, 2);
    } else if (handsState === "slap") {
      ctx.fillRect(ox + 1, oy + 14, 2, 2);
      ctx.fillRect(ox + 13, oy + 11, 3, 2);
    }

    if (drawLaptop) {
      ctx.fillStyle = "#94A3B8";
      ctx.fillRect(ox + 3, oy + 14, 10, 2);
      ctx.fillStyle = "#CBD5E1";
      ctx.fillRect(ox + 11, oy + 9, 2, 6);
      ctx.fillStyle = "rgba(14, 165, 233, 0.4)";
      ctx.fillRect(ox + 7, oy + 8, 4, 5);
    }

    if (drawPopcorn) {
      ctx.fillStyle = "#EF4444";
      ctx.fillRect(ox + 11, oy + 13, 4, 5);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(ox + 12, oy + 13, 1, 5);
      ctx.fillRect(ox + 14, oy + 13, 1, 5);
      ctx.fillStyle = "#FEF08A";
      ctx.fillRect(ox + 10, oy + 11, 5, 2);
    }

    ctx.restore();
  }


  class MovementEngine {
    constructor(scale = 2, speed = 1) {
      this.x = 100;
      this.scale = scale;
      this.speed = speed;
      this.characterSize = 32 * this.scale;
      this.y = window.innerHeight - this.characterSize - 20;
      this.vx = 0.8;
      this.vy = 0;
      this.gravity = 0.5;
      this.direction = "right";
      this.isDragging = false;
      this.isFalling = false;
      this.floorY = window.innerHeight - this.characterSize - 20;
    }

    updateSettings(scale, speed) {
      this.scale = scale;
      this.speed = speed;
      this.characterSize = 32 * this.scale;
      this.floorY = window.innerHeight - this.characterSize - 20;
    }

    update(currentState, forceStateChange) {
      this.floorY = window.innerHeight - this.characterSize - 20;
      if (this.isDragging) return;

      if (this.y < this.floorY) {
        this.isFalling = true;
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx * this.speed;

        if (this.x >= window.innerWidth - this.characterSize) {
          this.x = window.innerWidth - this.characterSize;
          this.vx = -Math.abs(this.vx) * 0.6;
          this.direction = "left";
        } else if (this.x <= 0) {
          this.x = 0;
          this.vx = Math.abs(this.vx) * 0.6;
          this.direction = "right";
        }

        if (this.y >= this.floorY) {
          this.y = this.floorY;
          this.vy = 0;
          this.isFalling = false;
          forceStateChange("react", 1000);
          this.vx = this.direction === "right" ? 0.8 : -0.8;
        }
        return;
      }

      if (currentState === "walk") {
        this.vx = this.direction === "right" ? 0.8 : -0.8;
        this.x += this.vx * this.speed;

        if (this.x >= window.innerWidth - this.characterSize) {
          this.x = window.innerWidth - this.characterSize;
          this.direction = "left";
          this.vx = -0.8;
        } else if (this.x <= 0) {
          this.x = 0;
          this.direction = "right";
          this.vx = 0.8;
        }
      } else {
        this.vx = 0;
      }
    }
  }

  class StateMachineEngine {
    constructor(level = 1) {
      this.currentState = "idle";
      this.level = level;
      this.stateTimer = 4000;
      this.lockState = false;
    }

    setLevel(level) {
      this.level = level;
    }

    transitionTo(newState, duration = 0) {
      if (this.currentState === newState && duration === 0) return;
      this.currentState = newState;
      this.stateTimer = duration;
      this.lockState = duration > 0;
    }

    update(deltaTimeMs, idleSeconds, theme) {
      if (this.lockState) {
        this.stateTimer -= deltaTimeMs;
        if (this.stateTimer <= 0) {
          this.lockState = false;
          this.autoTransition(theme);
        }
        return;
      }

      if (idleSeconds >= 60 && this.level >= 3 && this.currentState !== "sleep") {
        this.transitionTo("sleep");
        return;
      }

      if (idleSeconds < 60 && this.currentState === "sleep") {
        this.transitionTo("idle");
        return;
      }

      this.stateTimer -= deltaTimeMs;
      if (this.stateTimer <= 0) {
        this.autoTransition(theme);
      }
    }

    autoTransition(theme) {
      const allowed = ["idle", "walk"];
      if (this.level >= 2) { allowed.push("sit"); allowed.push("type"); }
      if (this.level >= 4) { allowed.push("special"); }

      let chosen = "idle";
      const rand = Math.random();

      if (theme.name === "github" && allowed.includes("special") && rand < 0.25) {
        chosen = "special";
      } else if (theme.name === "claude" && allowed.includes("type") && rand < 0.3) {
        chosen = "type";
      } else if (theme.name === "youtube" && allowed.includes("sit") && rand < 0.4) {
        chosen = "sit";
      } else {
        if (rand < 0.35) chosen = "walk";
        else if (rand < 0.6) chosen = "idle";
        else if (rand < 0.75 && allowed.includes("sit")) chosen = "sit";
        else if (rand < 0.9 && allowed.includes("type")) chosen = "type";
        else if (allowed.includes("special")) chosen = "special";
      }

      this.currentState = chosen;
      this.stateTimer = 4000 + Math.random() * 6000;
    }
  }

  class CollectiblesEngine {
    constructor() {
      this.items = [];
      this.itemSize = 24;
      this.spawnTimer = 6000;
    }

    spawn(theme) {
      const x = 50 + Math.random() * (window.innerWidth - 100);
      const floorY = window.innerHeight - 34;
      this.items.push({
        id: Math.random().toString(36).substr(2, 9),
        type: theme.collectible || "coin",
        x: x,
        y: 0,
        floorY: floorY,
        vy: 1.5 + Math.random() * 1.5,
        bobTimer: Math.random() * Math.PI,
        isCollected: false,
        fade: 1.0,
        floatY: 0,
        color: theme.colors.primary,
        accentColor: theme.colors.accent
      });
    }

    update(deltaTimeMs, theme, companionRect, onCollect) {
      this.spawnTimer -= deltaTimeMs;
      if (this.spawnTimer <= 0) {
        this.spawn(theme);
        this.spawnTimer = 8000 + Math.random() * 10000;
      }

      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        if (item.isCollected) {
          item.floatY -= 1.0;
          item.fade -= 0.05;
          if (item.fade <= 0) this.items.splice(i, 1);
          continue;
        }

        if (item.y < item.floorY) {
          item.y += item.vy;
          if (item.y >= item.floorY) item.y = item.floorY;
        } else {
          item.bobTimer += 0.05;
          item.y = item.floorY + Math.sin(item.bobTimer) * 3;
        }

        const itemRect = { x: item.x, y: item.y, width: 24, height: 24 };
        if (
          companionRect.x < itemRect.x + itemRect.width &&
          companionRect.x + companionRect.width > itemRect.x &&
          companionRect.y < itemRect.y + itemRect.height &&
          companionRect.y + companionRect.height > itemRect.y
        ) {
          item.isCollected = true;
          onCollect(item.type);
        }
      }
    }

    draw(ctx) {
      ctx.save();
      for (const item of this.items) {
        ctx.save();
        ctx.translate(item.x, item.y + item.floatY);
        ctx.globalAlpha = item.fade;
        
        this.drawProceduralItem(ctx, item.type, item.color, item.accentColor);
        ctx.restore();
      }
      ctx.restore();
    }

    drawProceduralItem(ctx, type, primaryColor, accentColor) {
      ctx.imageSmoothingEnabled = false;

      if (type === "coin") {
        ctx.fillStyle = "#EAB308";
        ctx.fillRect(2, 6, 20, 12);
        ctx.fillRect(6, 2, 12, 20);
        ctx.fillStyle = "#FACC15";
        ctx.fillRect(4, 8, 16, 8);
        ctx.fillRect(8, 4, 8, 16);
        ctx.fillStyle = "#FEF08A";
        ctx.fillRect(6, 6, 4, 4);

        ctx.fillStyle = "#CA8A04";
        ctx.fillRect(10, 8, 4, 2);
        ctx.fillRect(10, 10, 2, 4);
        ctx.fillRect(10, 14, 4, 2);
      } 
      else if (type === "coffee") {
        ctx.fillStyle = "#A7F3D0";
        if (Math.sin(Date.now() / 150) > 0) {
          ctx.fillRect(8, 1, 2, 3);
          ctx.fillRect(13, 2, 2, 2);
        } else {
          ctx.fillRect(9, 2, 2, 2);
          ctx.fillRect(14, 1, 2, 3);
        }
        
        ctx.fillStyle = primaryColor;
        ctx.fillRect(6, 8, 12, 12);
        ctx.fillRect(8, 20, 8, 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(5, 11, 14, 5);

        ctx.fillStyle = primaryColor;
        ctx.fillRect(18, 10, 3, 2);
        ctx.fillRect(20, 11, 2, 5);
        ctx.fillRect(18, 15, 3, 2);
      } 
      else if (type === "bubble") {
        ctx.fillStyle = primaryColor;
        ctx.fillRect(2, 4, 20, 14);
        ctx.fillRect(4, 2, 16, 18);
        ctx.fillRect(6, 19, 3, 3);
        ctx.fillRect(5, 21, 2, 2);
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(4, 6, 16, 10);
        ctx.fillRect(6, 4, 12, 14);
        
        ctx.fillStyle = primaryColor;
        ctx.fillRect(7, 10, 2, 2);
        ctx.fillRect(11, 10, 2, 2);
        ctx.fillRect(15, 10, 2, 2);
      } 
      else if (type === "star") {
        ctx.fillStyle = "#F59E0B";
        ctx.fillRect(11, 2, 2, 20);
        ctx.fillRect(2, 11, 20, 2);

        ctx.fillStyle = "#FBBF24";
        ctx.fillRect(8, 8, 8, 8);

        ctx.fillRect(5, 5, 14, 14);
        ctx.fillStyle = "#FEF08A";
        ctx.fillRect(10, 10, 4, 4);
        ctx.fillRect(11, 6, 2, 12);
        ctx.fillRect(6, 11, 12, 2);
      } 
      else if (type === "wrench") {
        ctx.fillStyle = "#64748B";
        ctx.fillRect(4, 16, 4, 4);
        ctx.fillRect(6, 14, 4, 4);
        ctx.fillRect(8, 12, 4, 4);
        ctx.fillRect(10, 10, 4, 4);
        ctx.fillRect(12, 8, 4, 4);
        ctx.fillRect(14, 6, 4, 4);
        
        ctx.fillStyle = primaryColor;
        ctx.fillRect(14, 2, 8, 8);
        ctx.fillStyle = "#F1F5F9";
        ctx.fillRect(18, 2, 4, 4);
        
        ctx.fillStyle = "#475569";
        ctx.fillRect(2, 20, 4, 2);
      } 
      else if (type === "badge") {
        ctx.fillStyle = primaryColor;
        ctx.fillRect(4, 4, 16, 16);
        ctx.fillStyle = "#FFF7ED";
        ctx.fillRect(6, 6, 12, 12);

        ctx.fillStyle = primaryColor;
        ctx.fillRect(9, 8, 6, 2);
        ctx.fillRect(9, 11, 6, 2);
        ctx.fillRect(9, 14, 6, 2);
      } 
      else if (type === "popcorn") {
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(6, 8, 12, 14);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(8, 8, 2, 14);
        ctx.fillRect(12, 8, 2, 14);
        ctx.fillRect(16, 8, 1, 14);
        
        ctx.fillStyle = "#FEF08A";
        ctx.fillRect(5, 5, 14, 4);
        ctx.fillStyle = "#CA8A04";
        ctx.fillRect(7, 3, 2, 2);
        ctx.fillRect(11, 4, 3, 2);
        ctx.fillRect(15, 3, 2, 2);
      } 
      else if (type === "upvote") {
        ctx.fillStyle = "#FF4500";

        ctx.fillRect(11, 2, 2, 2);
        ctx.fillRect(10, 4, 4, 2);
        ctx.fillRect(9, 6, 6, 2);
        ctx.fillRect(8, 8, 8, 2);
        ctx.fillRect(7, 10, 10, 2);
        ctx.fillRect(6, 12, 12, 2);

        ctx.fillRect(9, 14, 6, 8);
      }
    }
  }


  let localState = await getProgression();
  const themeName = detectTheme();
  const theme = THEME_REGISTRY[themeName] || THEME_REGISTRY.default;

  const visitResult = await (async () => {
    localState.siteVisits[themeName] = (localState.siteVisits[themeName] || 0) + 1;
    let addedXP = 0;
    const today = new Date().toDateString();
    if (localState.lastDailyVisit !== today) {
      localState.lastDailyVisit = today;
      addedXP += 20;
    }
    if (localState.siteVisits[themeName] === 1) {
      addedXP += 10;
    }
    
    if (addedXP > 0) {
      localState.xp += addedXP;
      let targetLevel = localState.level;
      // Guard: max level is 8 to prevent infinite loop
      while (targetLevel < 8) {
        const required = LEVEL_THRESHOLDS[targetLevel + 1];
        if (required !== undefined && localState.xp >= required) targetLevel++;
        else break;
      }
      localState.level = targetLevel;
    }
    await saveProgression(localState);
    return { addedXP };
  })();


  const rootDiv = document.createElement("div");
  rootDiv.id = "devcompanion-root";
  rootDiv.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 2147483647;";
  document.body.appendChild(rootDiv);

  const shadow = rootDiv.attachShadow({ mode: "open" });


  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .companion-canvas {
      position: absolute;
      pointer-events: auto;
      cursor: grab;
      image-rendering: pixelated;
    }
    .companion-canvas.dragging {
      cursor: grabbing;
    }
    .speech-bubble {
      position: absolute;
      background: #FAF6E8;
      border: 2px solid #1E293B;
      box-shadow: 2px 2px 0 #1E293B;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      font-size: 11px;
      color: #1E293B;
      padding: 6px 10px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 2147483647;
      text-transform: none;
    }
    .speech-bubble::after {
      content: "";
      position: absolute;
      bottom: -6px;
      left: 20px;
      border-width: 6px 6px 0;
      border-style: solid;
      border-color: #FAF6E8 transparent;
      display: block;
      width: 0;
    }
    .speech-bubble::before {
      content: "";
      position: absolute;
      bottom: -8px;
      left: 19px;
      border-width: 7px 7px 0;
      border-style: solid;
      border-color: #1E293B transparent;
      display: block;
      width: 0;
      z-index: -1;
    }
    .floating-text {
      position: absolute;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      font-size: 12px;
      color: #22C55E;
      pointer-events: none;
      animation: floatUp 1.2s forwards;
      text-shadow: 1px 1px 0 #000000;
    }
    @keyframes floatUp {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-40px); }
    }
  `;
  shadow.appendChild(styleEl);

  const canvas = document.createElement("canvas");
  canvas.className = "companion-canvas";
  shadow.appendChild(canvas);

  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "speech-bubble";
  shadow.appendChild(bubbleDiv);


  const spriteSheet = generateSpriteSheet(theme);


  const movement = new MovementEngine(localState.settings.scale, localState.settings.speed);
  const stateMachine = new StateMachineEngine(localState.level);
  const collectibles = new CollectiblesEngine();


  function showFloatingText(text, x, y, color = "#22C55E") {
    const el = document.createElement("div");
    el.className = "floating-text";
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    shadow.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }


  if (visitResult.addedXP > 0) {
    setTimeout(() => {
      showFloatingText(`+${visitResult.addedXP} XP (Daily Visit)`, movement.x, movement.y - 20, "#38BDF8");
    }, 2000);
  }


  let lastTime = performance.now();
  let idleTime = 0;
  let animTimer = 0;
  let currentAnimFrame = 0;
  let speechTimer = 10000 + Math.random() * 10000;
  let speechBubbleDuration = 0;


  let isPointerDown = false;
  let pointerStart = { x: 0, y: 0 };
  let pointerCurrent = { x: 0, y: 0 };
  let releaseVelocity = { x: 0, y: 0 };
  let lastPointerPos = { x: 0, y: 0 };
  let lastPointerTime = 0;

  canvas.addEventListener("mousedown", (e) => {
    isPointerDown = true;
    canvas.classList.add("dragging");
    pointerStart.x = e.clientX - movement.x;
    pointerStart.y = e.clientY - movement.y;
    movement.isDragging = true;
    stateMachine.transitionTo("react", 999999);
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPointerDown) return;
    const now = performance.now();
    const dt = now - lastPointerTime;
    
    pointerCurrent.x = e.clientX - pointerStart.x;
    pointerCurrent.y = e.clientY - pointerStart.y;
    
    if (dt > 0) {
      releaseVelocity.x = (pointerCurrent.x - lastPointerPos.x) / (dt / 16);
      releaseVelocity.y = (pointerCurrent.y - lastPointerPos.y) / (dt / 16);
    }
    
    movement.x = Math.max(0, Math.min(pointerCurrent.x, window.innerWidth - movement.characterSize));
    movement.y = pointerCurrent.y;

    lastPointerPos.x = movement.x;
    lastPointerPos.y = movement.y;
    lastPointerTime = now;
    idleTime = 0;
  });

  window.addEventListener("mouseup", () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    canvas.classList.remove("dragging");
    

    movement.isDragging = false;
    movement.isFalling = true;
    movement.vx = Math.max(-5, Math.min(releaseVelocity.x || 0, 5));
    movement.vy = Math.max(-10, Math.min(releaseVelocity.y || 0, 5));
    stateMachine.lockState = false;
    stateMachine.transitionTo("idle");
  });


  window.addEventListener("keydown", () => {
    idleTime = 0;
    
    const active = document.activeElement;
    const isEditing = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable);
    
    if (isEditing && localState.level >= 2 && stateMachine.currentState !== "type") {
      stateMachine.transitionTo("type", 3000);
    }
  });




  const QUESTS_DATABASE = [
    { id: "first_coffee", title: "First Coffee", check: (s) => (s.siteCollected && s.siteCollected.claude >= 1), xp: 50, coins: 10 },
    { id: "git_push", title: "Ship It", check: (s) => (s.siteVisits && s.siteVisits.github >= 5), xp: 100, coins: 20 },
    { id: "stackoverflow_survivor", title: "Stackoverflow Survivor", check: (s) => (s.siteTime && s.siteTime.stackoverflow >= 600), xp: 150, coins: 30 },
    { id: "star_hunter", title: "Star Hunter", check: (s) => (s.siteCollected && s.siteCollected.gemini >= 10), xp: 120, coins: 25 },
    { id: "lofi_listener", title: "Chill Coder", check: (s) => (s.siteTime && s.siteTime.youtube >= 300), xp: 80, coins: 15 }
  ];

  const ACHIEVEMENTS_DATABASE = [
    { id: "hello_world", title: "Hello World", check: () => true },
    { id: "junior_developer", title: "Junior Developer", check: (s) => s.level >= 3 },
    { id: "senior_developer", title: "Senior Developer", check: (s) => s.level >= 5 },
    { id: "mischief_master", title: "Mischief Master", check: (s) => s.level >= 8 },
    { id: "coin_hoarder", title: "Coin Hoarder", check: (s) => s.totalCollected >= 100 },
    { id: "coffee_addict", title: "Coffee Addict", check: (s) => (s.siteCollected && s.siteCollected.claude >= 5) },
    { id: "git_master", title: "Git Master", check: (s) => (s.siteVisits && s.siteVisits.github >= 10) },
    { id: "stack_overflow_survivor", title: "Stack Overflow Survivor", check: (s) => (s.siteTime && s.siteTime.stackoverflow >= 1200) }
  ];

  const checkProgressionQuestsAndAchievements = async () => {
    let state = localState;
    if (!state.quests) state.quests = { active: [], completed: [] };
    if (!state.achievements) state.achievements = [];

    let updated = false;


    for (const q of QUESTS_DATABASE) {
      if (!state.quests.completed.includes(q.id)) {
        if (q.check(state)) {
          state.quests.completed.push(q.id);
          state.xp += q.xp;
          state.coins += q.coins;
          state.totalCollected += q.coins;
          updated = true;
          
          setTimeout(() => {
            showFloatingText(`QUEST COMPLETED: ${q.title}!`, movement.x - 20, movement.y - 30, "#FFD700");
            setTimeout(() => {
              showFloatingText(`+${q.xp} XP / +${q.coins} Coins`, movement.x - 10, movement.y - 45, "#FFD700");
            }, 500);
          }, 800);
        }
      }
    }


    for (const ach of ACHIEVEMENTS_DATABASE) {
      if (!state.achievements.includes(ach.id)) {
        if (ach.check(state)) {
          state.achievements.push(ach.id);
          updated = true;
          
          setTimeout(() => {
            showFloatingText(`ACHIEVEMENT UNLOCKED: ${ach.title}!`, movement.x - 30, movement.y - 25, "#A855F7");
          }, 1200);
        }
      }
    }

    if (updated) {
      let targetLevel = state.level;
      while (targetLevel < 8) {
        const required = LEVEL_THRESHOLDS[targetLevel + 1];
        if (required !== undefined && state.xp >= required) targetLevel++;
        else break;
      }
      const leveledUp = targetLevel > state.level;
      if (leveledUp) {
        state.level = targetLevel;
        stateMachine.setLevel(targetLevel);
        setTimeout(() => {
          showFloatingText("LEVEL UP!", movement.x, movement.y - 35, "#A855F7");
          stateMachine.transitionTo("react", 2000);
        }, 1500);
      }
      localState = state;
      await saveProgression(state);
    }
  };


  setTimeout(() => {
    checkProgressionQuestsAndAchievements();
  }, 1000);


  let timeTrackTimer = 0;
  setInterval(async () => {
    if (document.visibilityState === "visible" && localState.settings.enabled) {
      timeTrackTimer += 1;
      if (timeTrackTimer >= 10) {
        timeTrackTimer = 0;
        localState = await getProgression();
        localState.siteTime[themeName] = (localState.siteTime[themeName] || 0) + 10;
        await saveProgression(localState);
        

        checkProgressionQuestsAndAchievements();
      }
    }
  }, 1000);


  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function playRetroSound(soundType) {
    if (!localState.settings.sound) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();

      if (soundType === "collect") {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(587.33, actx.currentTime);
        osc.frequency.setValueAtTime(880.00, actx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.04, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + 0.15);
      } else if (soundType === "levelup") {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, actx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.03, actx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(actx.destination);
          osc.start(actx.currentTime + idx * 0.08);
          osc.stop(actx.currentTime + idx * 0.08 + 0.2);
        });
      }
    } catch (err) {
      console.warn("DevCompanion: Audio Context blocked:", err);
    }
  }


  let canvas2 = null;
  let movement2 = null;
  let stateMachine2 = null;
  let animTimer2 = 0;
  let currentAnimFrame2 = 0;


  const handleItemCollected = async (type) => {
    localState = await getProgression();
    localState.coins += 5;
    localState.totalCollected += 5;
    localState.xp += 5;
    if (!localState.siteCollected) localState.siteCollected = {};
    localState.siteCollected[themeName] = (localState.siteCollected[themeName] || 0) + 1;

    playRetroSound("collect");


    let targetLevel = localState.level;
    while (targetLevel < 8) {
      const required = LEVEL_THRESHOLDS[targetLevel + 1];
      if (required !== undefined && localState.xp >= required) targetLevel++;
      else break;
    }

    const leveledUp = targetLevel > localState.level;
    if (leveledUp) {
      localState.level = targetLevel;
      stateMachine.setLevel(targetLevel);
      playRetroSound("levelup");
    }

    await saveProgression(localState);

    showFloatingText(`+5 Coins`, movement.x + 10, movement.y, "#EAB308");
    setTimeout(() => {
      showFloatingText(`+5 XP`, movement.x - 5, movement.y - 15, "#22C55E");
      if (leveledUp) {
        setTimeout(() => {
          showFloatingText("LEVEL UP!", movement.x, movement.y - 30, "#A855F7");
          stateMachine.transitionTo("react", 2000);
        }, 500);
      }
      checkProgressionQuestsAndAchievements();
    }, 300);
  };


  function gameLoop(now) {
    const dt = now - lastTime;
    lastTime = now;

    if (!localState.settings.enabled) {
      rootDiv.style.display = "none";
      if (canvas2) canvas2.style.display = "none";
      requestAnimationFrame(gameLoop);
      return;
    } else {
      rootDiv.style.display = "block";
    }

    idleTime += dt / 1000;


    stateMachine.setLevel(localState.level);
    if (localState.level >= 7 && Math.abs(mouseY - movement.floorY) < 150 && stateMachine.currentState === "walk") {
      const diffX = mouseX - (movement.x + movement.characterSize / 2);
      if (Math.abs(diffX) > 15) {
        movement.direction = diffX > 0 ? "right" : "left";
        movement.vx = movement.direction === "right" ? 1.0 : -1.0;
      } else {
        movement.vx = 0;
      }
    }


    stateMachine.update(dt, idleTime, theme);
    movement.update(stateMachine.currentState, (s, d) => stateMachine.transitionTo(s, d));
    
    const companionRect = {
      x: movement.x,
      y: movement.y,
      width: movement.characterSize,
      height: movement.characterSize
    };
    
    collectibles.update(dt, theme, companionRect, handleItemCollected);


    animTimer += dt * movement.speed;
    const currentAnimRow = getAnimRow(stateMachine.currentState, movement);
    const maxFrames = getFramesForState(stateMachine.currentState);
    
    if (animTimer > 150) {
      animTimer = 0;
      currentAnimFrame = (currentAnimFrame + 1) % maxFrames;
    }


    if (localState.level >= 5) {
      speechTimer -= dt;
      if (speechTimer <= 0) {
        const dialogs = theme.speechBubbles || THEME_REGISTRY.default.speechBubbles;
        const line = dialogs[Math.floor(Math.random() * dialogs.length)];
        bubbleDiv.textContent = line;
        bubbleDiv.style.opacity = "1";
        speechBubbleDuration = 4000;
        speechTimer = 15000 + Math.random() * 15000;
      }
    }

    if (speechBubbleDuration > 0) {
      speechBubbleDuration -= dt;
      if (speechBubbleDuration <= 0) {
        bubbleDiv.style.opacity = "0";
      }
    }


    canvas.width = movement.characterSize;
    canvas.height = movement.characterSize;
    canvas.style.left = `${movement.x}px`;
    canvas.style.top = `${movement.y}px`;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;


    ctx.drawImage(
      spriteSheet,
      currentAnimFrame * 32,
      currentAnimRow * 32,
      32,
      32,
      0,
      0,
      movement.characterSize,
      movement.characterSize
    );


    bubbleDiv.style.left = `${movement.x}px`;
    bubbleDiv.style.top = `${movement.y - Math.max(35, Math.round(movement.characterSize * 0.55))}px`;


    if (localState.level >= 6) {
      if (!canvas2) {
        canvas2 = document.createElement("canvas");
        canvas2.className = "companion-canvas";
        shadow.appendChild(canvas2);


        const theme2 = JSON.parse(JSON.stringify(theme));
        theme2.colors.hoodie = "#8B5CF6";
        theme2.colors.secondary = "#4C1D95";
        
        canvas2.spriteSheet = generateSpriteSheet(theme2);

        movement2 = new MovementEngine(localState.settings.scale, localState.settings.speed);
        movement2.x = Math.max(0, movement.x - 100);
        movement2.vx = -0.7;
        movement2.direction = "left";
        stateMachine2 = new StateMachineEngine(localState.level);


        let drag2 = false;
        let start2 = { x: 0, y: 0 };
        canvas2.addEventListener("mousedown", (e) => {
          drag2 = true;
          canvas2.classList.add("dragging");
          start2.x = e.clientX - movement2.x;
          start2.y = e.clientY - movement2.y;
          movement2.isDragging = true;
          stateMachine2.transitionTo("react", 999999);
        });
        window.addEventListener("mousemove", (e) => {
          if (!drag2) return;
          movement2.x = Math.max(0, Math.min(e.clientX - start2.x, window.innerWidth - movement2.characterSize));
          movement2.y = e.clientY - start2.y;
          idleTime = 0;
        });
        window.addEventListener("mouseup", () => {
          if (!drag2) return;
          drag2 = false;
          canvas2.classList.remove("dragging");
          movement2.isDragging = false;
          movement2.isFalling = true;
          movement2.vx = 0;
          movement2.vy = 0;
          stateMachine2.lockState = false;
          stateMachine2.transitionTo("idle");
        });
      }

      canvas2.style.display = "block";
      movement2.updateSettings(localState.settings.scale, localState.settings.speed);
      stateMachine2.setLevel(localState.level);


      if (localState.level >= 7 && Math.abs(mouseY - movement2.floorY) < 150 && stateMachine2.currentState === "walk") {
        const diffX = mouseX - (movement2.x + movement2.characterSize / 2);
        if (Math.abs(diffX) > 15) {
          movement2.direction = diffX > 0 ? "right" : "left";
          movement2.vx = movement2.direction === "right" ? 0.9 : -0.9;
        } else {
          movement2.vx = 0;
        }
      }

      stateMachine2.update(dt, idleTime, theme);
      movement2.update(stateMachine2.currentState, (s, d) => stateMachine2.transitionTo(s, d));

      animTimer2 += dt * movement2.speed;
      const row2 = getAnimRow(stateMachine2.currentState, movement2);
      const max2 = getFramesForState(stateMachine2.currentState);
      if (animTimer2 > 150) {
        animTimer2 = 0;
        currentAnimFrame2 = (currentAnimFrame2 + 1) % max2;
      }

      canvas2.width = movement2.characterSize;
      canvas2.height = movement2.characterSize;
      canvas2.style.left = `${movement2.x}px`;
      canvas2.style.top = `${movement2.y}px`;

      const ctx2 = canvas2.getContext("2d");
      ctx2.imageSmoothingEnabled = false;
      ctx2.drawImage(
        canvas2.spriteSheet,
        currentAnimFrame2 * 32,
        row2 * 32,
        32,
        32,
        0,
        0,
        movement2.characterSize,
        movement2.characterSize
      );


      const companionRect2 = {
        x: movement2.x,
        y: movement2.y,
        width: movement2.characterSize,
        height: movement2.characterSize
      };
      for (const item of collectibles.items) {
        if (item.isCollected) continue;
        if (
          companionRect2.x < item.x + collectibles.itemSize &&
          companionRect2.x + companionRect2.width > item.x &&
          companionRect2.y < item.y + collectibles.itemSize &&
          companionRect2.y + companionRect2.height > item.y
        ) {
          item.isCollected = true;
          handleItemCollected(item.type);
        }
      }
    } else {
      if (canvas2) canvas2.style.display = "none";
    }


    let overlayCanvas = shadow.querySelector("#collectibles-overlay");
    if (!overlayCanvas) {
      overlayCanvas = document.createElement("canvas");
      overlayCanvas.id = "collectibles-overlay";
      overlayCanvas.style.cssText = "position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none;";
      shadow.appendChild(overlayCanvas);
    }
    overlayCanvas.width = window.innerWidth;
    overlayCanvas.height = window.innerHeight;
    const overlayCtx = overlayCanvas.getContext("2d");
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    collectibles.draw(overlayCtx);

    requestAnimationFrame(gameLoop);
  }

  function getAnimRow(state, mv) {
    const rows = { idle: 0, walk_right: 1, walk_left: 2, sit: 3, type: 4, sleep: 5, react: 6, special: 7 };
    if (state === "walk") {
      return mv.direction === "right" ? 1 : 2;
    }
    return rows[state] !== undefined ? rows[state] : 0;
  }

  function getFramesForState(state) {
    const frames = { idle: 4, walk: 6, sit: 2, type: 4, sleep: 3, react: 4, special: 6 };
    return frames[state] || 4;
  }


  const _ext = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);
  if (_ext && _ext.runtime && _ext.runtime.onMessage) {
    _ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "UPDATE_SETTINGS") {
        localState = message.state;
        movement.updateSettings(localState.settings.scale, localState.settings.speed);
        stateMachine.setLevel(localState.level);
        if (movement2) {
          movement2.updateSettings(localState.settings.scale, localState.settings.speed);
          stateMachine2.setLevel(localState.level);
        }
        sendResponse({ status: "ok" });
      }
      return true;
    });
  }


  requestAnimationFrame(gameLoop);
})();
