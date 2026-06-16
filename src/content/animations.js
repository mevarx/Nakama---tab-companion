(function() {
  window.playCatchBurst = function(x, y, emoji = '✨') {
    const burst = document.createElement('div');
    burst.style.cssText = `
      position: fixed; left: ${x}px; top: ${y}px;
      font-size: 2.2rem; z-index: 2147483647;
      animation: nakamaPoofOut 0.6s forwards;
      pointer-events: none;
      user-select: none;
    `;
    burst.textContent = emoji;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 650);
  };

  window.showSpeechBubble = function(companionEl, text, durationMs = 2500) {
    if (window.showSpeechBubbleInternal) {
      window.showSpeechBubbleInternal(text, durationMs);
      return;
    }
    if (!companionEl) return;
    const bubble = document.createElement('div');
    bubble.className = 'nakama-bubble';
    bubble.textContent = text;
    bubble.style.cssText = `
      position: absolute; bottom: 110%; left: 50%;
      transform: translateX(-50%);
      background: #FAF6E8; border: 2px solid #1E293B; border-radius: 4px;
      padding: 4px 10px; font-size: 11px; white-space: nowrap;
      box-shadow: 2px 2px 0 #1E293B; z-index: 2147483647;
      animation: nakamaBubbleIn 0.2s ease;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      color: #1E293B;
    `;
    companionEl.style.position = 'relative';
    companionEl.appendChild(bubble);
    setTimeout(() => bubble.remove(), durationMs);
  };

  document.head.insertAdjacentHTML('beforeend', `<style>
    @keyframes nakamaPoofOut {
      0%   { transform: scale(1);   opacity: 1; }
      60%  { transform: scale(2.2); opacity: 0.8; }
      100% { transform: scale(0);   opacity: 0; }
    }
    @keyframes nakamaBubbleIn {
      from { transform: translateX(-50%) scale(0.7); opacity: 0; }
      to   { transform: translateX(-50%) scale(1);   opacity: 1; }
    }
  </style>`);
})();
