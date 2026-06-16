(function () {
  let spawnTimer = null;
  let _driftSeq = 0;

  function randomBetween(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function injectDriftKeyframe(id) {
    const dx = randomBetween(-25, 25);
    const styleEl = document.createElement('style');
    styleEl.dataset.driftId = id;
    styleEl.textContent = `
      @keyframes nakamaDrift${id} {
        from { transform: translateX(0px) scale(1); }
        to   { transform: translateX(${dx}px) scale(1.08); }
      }
    `;
    document.head.appendChild(styleEl);
    return styleEl;
  }

  async function spawnObject() {
    const result = await new Promise((resolve) => {
      const storage = typeof chrome !== 'undefined' ? chrome.storage.local : browser.storage.local;
      storage.get(['nakamaProgress', 'settings'], resolve);
    });
    const progress = result?.nakamaProgress || {};
    const settings = progress.settings || result?.settings || {};

    if (settings.enabled === false) {
      scheduleNext();
      return;
    }

    const theme = window.getSiteTheme ? window.getSiteTheme() : { items: [{ type: 'coin', emoji: '🪙' }] };
    const item  = theme.items[Math.floor(Math.random() * theme.items.length)];

    // Create a unique drift animation ID for this specific element.
    const driftId = ++_driftSeq;
    const driftStyleEl = injectDriftKeyframe(driftId);
    const duration = randomBetween(3, 6);

    const el = document.createElement('div');
    el.className  = 'nakama-object';
    el.dataset.id = crypto.randomUUID();
    el.dataset.type = item.type;
    el.textContent = item.emoji;

    // Spawn at floor level so the companion (which walks along the bottom) can
    // always reach and collect the item. Horizontal position is randomized.
    const spawnLeftVw = randomBetween(5, 90);
    el.style.cssText = `
      position: fixed;
      left: ${spawnLeftVw}vw;
      bottom: 12px;
      font-size: 2rem;
      z-index: 2147483640;
      pointer-events: none;
      animation: nakamaDrift${driftId} ${duration}s ease-in-out infinite alternate;
      transition: opacity 0.3s;
      cursor: default;
      user-select: none;
    `;

    document.body.appendChild(el);

    // Notify content.js (2 animation frames later so getBoundingClientRect() is valid)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('nakama:objectSpawned', { detail: { id: el.dataset.id, el } }));
      });
    });

    // Auto-despawn after 25 s if companion didn't catch it.
    setTimeout(() => {
      if (el.isConnected) {
        el.style.opacity = '0';
        setTimeout(() => {
          el.remove();
          driftStyleEl.remove(); // clean up injected keyframe
        }, 300);
      } else {
        driftStyleEl.remove();
      }
    }, 25_000);

    scheduleNext();
  }

  async function scheduleNext() {
    clearTimeout(spawnTimer);

    const result = await new Promise((resolve) => {
      const storage = typeof chrome !== 'undefined' ? chrome.storage.local : browser.storage.local;
      storage.get(['nakamaProgress', 'settings'], resolve);
    });
    const progress = result?.nakamaProgress || {};
    const settings = progress.settings || result?.settings || {};

    const rateSec = settings.spawnRate || 15;
    const intervalMs = rateSec * 1000;
    const min = Math.max(3000, intervalMs * 0.7);
    const max = intervalMs * 1.3;

    spawnTimer = setTimeout(spawnObject, randomBetween(min, max));
  }

  window.startSpawner  = function() { scheduleNext(); };
  window.stopSpawner   = function() { clearTimeout(spawnTimer); };
  window.spawnDOMObject = spawnObject;

  window.startSpawner();
})();
