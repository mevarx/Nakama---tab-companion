(function () {
  const EVENTS = {
    SCROLL_BOTTOM : 'nakama:scrollBottom',
    VIDEO_PLAY    : 'nakama:videoPlay',
    VIDEO_PAUSE   : 'nakama:videoPause',
    LONG_ARTICLE  : 'nakama:longArticle',
    PAGE_IDLE     : 'nakama:pageIdle',
  };

  /* Scroll depth */
  let scrollFired = false;
  window.addEventListener('scroll', () => {
    if (document.body.scrollHeight === 0) return;
    const pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
    if (pct > 0.92 && !scrollFired) {
      scrollFired = true;
      window.dispatchEvent(new CustomEvent(EVENTS.SCROLL_BOTTOM));
    }
  });

  /* Video play/pause */
  document.addEventListener('play',  e => { if (e.target.tagName === 'VIDEO') window.dispatchEvent(new CustomEvent(EVENTS.VIDEO_PLAY)); },  true);
  document.addEventListener('pause', e => { if (e.target.tagName === 'VIDEO') window.dispatchEvent(new CustomEvent(EVENTS.VIDEO_PAUSE)); }, true);

  /* Long article (>2000 words) */
  const wordCount = (document.body.innerText || "").split(/\s+/).length;
  if (wordCount > 2000) {
    window.dispatchEvent(new CustomEvent(EVENTS.LONG_ARTICLE, { detail: { wordCount } }));
  }

  /* Page idle — 90 s no interaction */
  let idleTimer;
  const resetIdle = () => { 
    clearTimeout(idleTimer); 
    idleTimer = setTimeout(() => window.dispatchEvent(new CustomEvent(EVENTS.PAGE_IDLE)), 90_000); 
  };
  ['mousemove','keydown','scroll','click'].forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }));
  resetIdle();
})();
