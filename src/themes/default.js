
export default {
  name: "default",
  colors: {
    primary: "#4F46E5",      // Indigo
    secondary: "#1E293B",    // Slate
    accent: "#F8FAFC",       // Off-white
    hoodie: "#4F46E5",
    hair: "#334155",
    skin: "#FDE047"
  },
  character: {
    frameSize: 32,
    scale: 2
  },
  behaviors: {
    idle: "walk",
    onPageLoad: "react",
    specialTrigger: null
  },
  speechBubbles: [
    "Code is poetry.",
    "Coffee in, code out.",
    "Did it build?",
    "Works on my machine!",
    "Commit early, commit often.",
    "Keep it simple, stupid.",
    "Refactoring in progress..."
  ],
  collectible: "coin"
};
