# Nakama

A Firefox/Chrome extension that spawns a pixel-art companion on every webpage you visit. The character reacts to the site you're on, walks around, collects items, and grows with you through a progression system — XP, levels, quests, and achievements.

All sprites are drawn procedurally at runtime via HTML5 Canvas. No external image files.

---

## Features

- **Site-aware characters** — each supported site gets a unique character (Tanjiro on GitHub, Gojo on Gemini, Luffy on Reddit, etc.)
- **Progression system** — earn XP and coins by browsing, collecting items, completing quests, and leveling up
- **Collectibles** — site-themed items (coffee, stars, coins, upvotes) drop and bounce on the floor for your companion to collect
- **Speech bubbles** — the companion talks at level 5+, with dialogue that matches the current site
- **Drag & throw** — grab the companion and fling it across the screen with realistic physics
- **Full dashboard** — a dedicated in-browser control panel (accessible from the popup) with overview, character select, settings, site stats, and achievements

---

## Repository Structure

```
nakama/
├── manifest.json             # Extension manifest (MV2), permissions, entry points
├── assets/                   # Toolbar icons (16px, 48px, 128px)
├── ui/
│   ├── popup.html/css/js     # Compact toolbar popup: XP, stats, quick settings
│   ├── dashboard.html/css/js # Full-page control panel (open via DASHBOARD button)
│   ├── settings.html/css/js  # Extension options page: site stats, quests, achievements
└── src/
    ├── background.js         # Initializes storage on install, handles runtime messages
    ├── content.js            # Injected into every page — runs the game loop and renders everything
    ├── engine/
    │   ├── collision.js      # AABB overlap check
    │   ├── items.js          # Collectible spawning, physics, and pixel-art drawing
    │   ├── movement.js       # Companion movement, gravity, drag-and-throw physics
    │   ├── sprite.js         # Procedural sprite sheet generation for all 8 animation states
    │   └── statemachine.js   # Behavior transitions (idle → walk → sit → type → sleep → special)
    ├── progression/
    │   ├── achievements.js   # Achievement definitions and unlock checks
    │   ├── quests.js         # Quest definitions, completion logic, and XP/coin rewards
    │   └── storage.js        # Extension storage read/write with state merging
    └── themes/
        ├── index.js          # Hostname-to-theme mapper and theme registry
        ├── default.js        # Default fallback theme
        ├── chatgpt.js
        ├── claude.js
        ├── gemini.js
        ├── github.js
        ├── reddit.js
        ├── stackoverflow.js
        └── youtube.js
```

---

## Supported Sites & Characters

| Site | Character | Collectible |
|------|-----------|-------------|
| Default / any | Tanjiro | Coin |
| github.com | Tanjiro | Wrench |
| claude.ai | Itadori | Coffee |
| chatgpt.com | Toji | Bubble |
| gemini.google.com | Gojo | Star |
| stackoverflow.com | Tanjiro | Badge |
| youtube.com | Sasuke | Popcorn |
| reddit.com | Luffy | Upvote |
| google.com | Aizen | Coin |
| mail.google.com / outlook | Kira | Coin |
| linkedin.com | Ace | Badge |

---

## Dashboard

Click **DASHBOARD** in the popup footer to open the full control panel. From there you can:

- Toggle the companion on/off
- Switch between **AUTO** (site-based) and **MANUAL** character selection
- Adjust scale and walk speed in real time
- Force the companion into any animation state (`react`, `special`)
- Spawn a collectible on the current tab
- View per-site stats, quests, and achievements
- Reset progress or settings

---

## Installation (Local)

1. Clone or download this repository.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…** and select `manifest.json`.
4. The companion will appear on any page you visit.

For Chrome: go to `chrome://extensions`, enable Developer Mode, then **Load unpacked** and select the folder.

---

## Adding a Custom Character

### 1. Create a theme file

Add `src/themes/mychar.js`:

```js
export default {
  name: "mychar",
  colors: {
    primary:   "#E11D48",
    secondary: "#1E293B",
    accent:    "#FBBF24",
    hoodie:    "#E11D48",
    hair:      "#0F172A",
    skin:      "#FDE047"
  },
  behaviors: { idle: "walk", onPageLoad: "react" },
  speechBubbles: ["Hello.", "Ready to code?"],
  collectible: "coin"
};
```

### 2. Register it

In `src/themes/index.js`, import and add it to the registry, then map a hostname in `detectTheme()`:

```js
import mycharTheme from './mychar.js';

const themes = { ..., mychar: mycharTheme };

export function detectTheme(hostname) {
  if (hostname.includes("mytool.com")) return "mychar";
  // ...
}
```

### 3. (Optional) Custom special animation

In `src/engine/sprite.js` inside the `state === "special"` block:

```js
} else if (themeName === "mychar") {
  bobY = 2;
  handsState = "wave";
  sparkleState = true;
}
```

---

## License

MIT © 2026
