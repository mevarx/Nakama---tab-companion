
import defaultTheme from './default.js';
import githubTheme from './github.js';
import claudeTheme from './claude.js';
import chatgptTheme from './chatgpt.js';
import geminiTheme from './gemini.js';
import stackoverflowTheme from './stackoverflow.js';
import youtubeTheme from './youtube.js';
import redditTheme from './reddit.js';

const themes = {
  default: defaultTheme,
  github: githubTheme,
  claude: claudeTheme,
  chatgpt: chatgptTheme,
  gemini: geminiTheme,
  stackoverflow: stackoverflowTheme,
  youtube: youtubeTheme,
  reddit: redditTheme
};

export function detectTheme(hostname) {
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : 'default');
  
  if (host.includes("claude.ai"))               return "claude";
  if (host.includes("chatgpt.com"))             return "chatgpt";
  if (host.includes("gemini.google.com"))       return "gemini";
  if (host.includes("github.com"))              return "github";
  if (host.includes("stackoverflow.com"))       return "stackoverflow";
  if (host.includes("youtube.com"))             return "youtube";
  if (host.includes("reddit.com"))              return "reddit";
  
  return "default";
}

export function getTheme(name) {
  return themes[name] || themes.default;
}

export function getThemeForHost(hostname) {
  const themeName = detectTheme(hostname);
  return getTheme(themeName);
}
