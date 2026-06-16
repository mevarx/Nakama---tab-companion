(function () {
  const THEMES = {
    'github.com':    { items: [{ type:'file', emoji:'📄' }, { type:'star', emoji:'⭐' }, { type:'bug', emoji:'🐛' }] },
    'youtube.com':   { items: [{ type:'star', emoji:'⭐' }, { type:'heart', emoji:'❤️' }, { type:'note', emoji:'🎵' }] },
    'reddit.com':    { items: [{ type:'upvote', emoji:'⬆️' }, { type:'award', emoji:'🏆' }, { type:'coin', emoji:'🪙' }] },
    'twitter.com':   { items: [{ type:'heart', emoji:'❤️' }, { type:'retweet', emoji:'🔁' }, { type:'star', emoji:'⭐' }] },
    'x.com':         { items: [{ type:'heart', emoji:'❤️' }, { type:'retweet', emoji:'🔁' }] },
    'stackoverflow.com': { items: [{ type:'answer', emoji:'✅' }, { type:'point', emoji:'🔷' }] },
    'default':       { items: [{ type:'gem', emoji:'💎' }, { type:'star', emoji:'⭐' }, { type:'coin', emoji:'🪙' }] },
  };

  window.getSiteTheme = function() {
    const host = window.location.hostname.replace('www.', '');
    return THEMES[host] ?? THEMES['default'];
  };
})();
