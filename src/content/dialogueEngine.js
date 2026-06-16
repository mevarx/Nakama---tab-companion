(function () {
  const STATIC = {
    'nakama:scrollBottom' : ['You read it all! 📖', 'Knowledge absorbed! 🧠'],
    'nakama:videoPlay'    : ['Ooh, what are we watching? 🎬', 'Movie time! 🍿'],
    'nakama:videoPause'   : ['Taking a break? ☕'],
    'nakama:longArticle'  : ['This is a long one... 📜', 'Big read! Want a summary?'],
    'nakama:pageIdle'     : ['Still there? 👀', 'Zzzz... 💤'],
  };

  let aiCallsThisSession = 0;

  async function getDynamicLine(eventType, context = '') {
    try {
      return await new Promise((resolve, reject) => {
        const ext = typeof chrome !== 'undefined' ? chrome : browser;
        ext.runtime.sendMessage({ 
          type: 'nakama:getDynamicLine', 
          eventType, 
          context 
        }, (res) => {
          if (ext.runtime.lastError) reject(ext.runtime.lastError);
          else resolve(res);
        });
      });
    } catch (err) {
      console.warn("DialogueEngine: API call failed, falling back to static lines:", err);
      return null;
    }
  }

  async function react(eventType, context = '') {
    const result = await new Promise((resolve) => {
      const storage = typeof chrome !== 'undefined' ? chrome.storage.local : browser.storage.local;
      storage.get(['nakamaProgress', 'settings'], resolve);
    });
    const progress = result?.nakamaProgress || {};
    const settings = progress.settings || result?.settings || {};

    if (settings.enabled === false || settings.pageReact === false) return;

    let line = null;
    if (aiCallsThisSession < 2) {
      const data = await getDynamicLine(eventType, context);
      line = data?.line || null;
      if (line) aiCallsThisSession++;
    }
    
    if (!line) {
      const pool = STATIC[eventType] ?? ['👋'];
      line = pool[Math.floor(Math.random() * pool.length)];
    }

    if (window.showSpeechBubble) {
      const root = document.getElementById('devcompanion-root');
      const companionEl = root?.shadowRoot?.querySelector('.companion-canvas');
      window.showSpeechBubble(companionEl, line);
    }
  }

  Object.keys(STATIC).forEach(ev => {
    window.addEventListener(ev, (e) => {
      react(ev, JSON.stringify(e.detail ?? {}));
    });
  });
})();
