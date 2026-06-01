// Claude theme config
export default {
  name: "claude",
  colors: {
    primary: "#CC785C",      // Claude Orange
    secondary: "#191919",
    accent: "#F5E6D3",       // Claude beige
    hoodie: "#CC785C",
    hair: "#3B2E2A",
    skin: "#FDE047"
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
    "Thinking...",
    "Interesting prompt.",
    "Running inference...",
    "Need more context?",
    "Let me process that.",
    "Generating an elegant solution..."
  ],
  collectible: "coffee"
};
