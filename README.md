# Nakama

Nakama is a Firefox Extension that spawns a dynamic, procedurally drawn pixel-art companion directly on your web pages. The character changes behavior, visual aesthetics, and dialogue depending on the website you are currently browsing. It includes a built-in progression system tracking levels, XP, collectibles (like coffee and coins), quests, and achievements.

The graphics engine renders all sprites and animations on the fly using HTML5 Canvas APIs based on a simple theme palette config, meaning no external sprite sheet images are required.

---

## Repository Structure

```text
nakama/
├── manifest.json         # Extension manifest (v3) defining entry points and permissions
├── assets/               # Static icons for the extension popup and browser toolbar
├── ui/                   # Front-end user interfaces
│   ├── popup.html        # Small popover panel accessed from the extension toolbar icon
│   ├── popup.css         # Styling for the popover panel
│   ├── popup.js          # Controller managing popup rendering, progression display, and rendering loop
│   ├── settings.html     # Dedicated Options page for configuring settings and viewing full stats
│   ├── settings.css      # Styling for the options page
│   └── settings.js       # Controller managing saving/loading configuration and progression database
└── src/                  # Core extension logic and engine
    ├── background.js     # Background service worker coordinating extension initialization
    ├── content.js        # Entry script injected into webpages managing the loop and rendering
    ├── engine/           # Physics, movement, and visual rendering modules
    │   ├── collision.js  # Basic collision box check math
    │   ├── items.js      # Spawn behavior and drawing logic for collectibles (coffee, coins)
    │   ├── movement.js   # Movement simulator controlling physics, gravity, and velocities
    │   ├── sprite.js     # Canvas drawing logic rendering pixel-art sheets procedurally
    │   └── statemachine.js # Behavior manager controlling character state transitions
    ├── progression/      # XP, achievements, and quest tracking systems
    │   ├── achievements.js # Achievements database definitions and progression criteria
    │   ├── quests.js     # Quest definitions, tracking logic, and reward handling
    │   └── storage.js    # Interface managing state storage via Browser Extension Storage API
    └── themes/           # Character definitions and site mappings
        ├── index.js      # Central hub mapping hostnames to characters and exporting configurations
        ├── default.js    # Fallback/default character theme definition
        ├── chatgpt.js    # Character settings for ChatGPT
        ├── claude.js     # Character settings for Claude.ai
        ├── gemini.js     # Character settings for Gemini
        ├── github.js     # Character settings for GitHub
        ├── reddit.js     # Character settings for Reddit
        ├── stackoverflow.js # Character settings for Stack Overflow
        └── youtube.js    # Character settings for YouTube
```

---

## How to Add Your Own Character

You can clone this repository, modify it, and add custom characters. Adding a new character requires three main steps:

### 1. Create a Theme Configuration
Create a new file in `src/themes/<name>.js`. Use the following schema:

```javascript
export default {
  name: "custom_character",
  colors: {
    primary: "#E11D48",    // Main clothing / jacket color
    secondary: "#1E293B",  // Secondary trim / details color
    accent: "#FBBF24",     // Effect / highlight color
    hoodie: "#E11D48",     // Primary shirt/hoodie color
    hair: "#0F172A",       // Hair color
    skin: "#FDE047"        // Skin tone color
  },
  character: {
    frameSize: 32,
    scale: 2
  },
  behaviors: {
    idle: "think",
    onPageLoad: "react",
    specialTrigger: "onUserTyping"
  },
  speechBubbles: [
    "Hello developer.",
    "Ready to code?",
    "Let me inspect this tab."
  ],
  collectible: "coin"      // Item they like to collect (e.g., 'coffee' or 'coin')
};
```

### 2. (Optional) Customize the Draw Loop
If you want your character to have a unique posture, item, or secondary animation during its `special` behavior state, open `src/engine/sprite.js` and locate `drawFrame()`. Under the `state === "special"` branch, add custom drawing instructions targeting your theme's name:

```javascript
} else if (themeName === "custom_character") {
  // Add custom canvas draw instructions
  bobY = 2;
  legCycle = 4;
  eyeState = "squint";
  handsState = "wave";
  sparkleState = true; 
}
```

### 3. Register the Character to a Domain
Open `src/themes/index.js` to register your new theme:

1. Import your theme configuration at the top:
   ```javascript
   import customTheme from './custom_character.js';
   ```
2. Add your theme to the `themes` registry object:
   ```javascript
   const themes = {
     default: defaultTheme,
     custom_character: customTheme,
     // ...other themes
   };
   ```
3. Update the `detectTheme(hostname)` function to map specific target web addresses to your character name:
   ```javascript
   export function detectTheme(hostname) {
     const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : 'default');
     
     if (host.includes("myfavoritecodingtool.com")) return "custom_character";
     // ...other site checks
     
     return "default";
   }
   ```

---

## Local Development and Installation

To install your modified build locally in Mozilla Firefox:

1. Clone or download this repository.
2. Open Mozilla Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select the `manifest.json` file in the `nakama` root folder.
5. The extension will install, and your companion will spawn whenever you load a website. Click the extension icon in the toolbar or open options to inspect quests and stats.

---

## MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
