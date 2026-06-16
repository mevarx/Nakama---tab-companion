(function () {
  function findSitTargets() {
    return [...document.querySelectorAll('img')].filter(img => {
      const r = img.getBoundingClientRect();
      return r.width > 80 && r.height > 60 && r.top > 0 && r.top < window.innerHeight;
    });
  }

  window.sitOnRandomImage = function() {
    const targets = findSitTargets();
    if (!targets.length) return false;

    const img = targets[Math.floor(Math.random() * targets.length)];
    const r   = img.getBoundingClientRect();

    const tx = r.left + r.width / 2;
    const ty = r.top; 
    
    if (window.moveCompanion) {
      window.moveCompanion(tx, ty);
      return true;
    }
    return false;
  };

  window.addEventListener('nakama:pageIdle', async () => {
    const result = await new Promise((resolve) => {
      const storage = typeof chrome !== 'undefined' ? chrome.storage.local : browser.storage.local;
      storage.get(['nakamaProgress', 'settings'], resolve);
    });
    const progress = result?.nakamaProgress || {};
    const settings = progress.settings || result?.settings || {};

    if (settings.enabled === false || settings.idleRoam === false) return;

    if (Math.random() < 0.4) {
      window.sitOnRandomImage();
    }
  });
})();
