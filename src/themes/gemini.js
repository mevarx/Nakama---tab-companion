// Gemini theme config
export default {
  name: "gemini",
  colors: {
    primary: "#1A73E8",      // Google Blue
    secondary: "#0F172A",
    accent: "#E8F0FE",
    hoodie: "#4285F4",       // Crystalline shimmer
    hair: "#0F172A",
    skin: "#FDE047"
  },
  character: {
    frameSize: 32,
    scale: 2
  },
  behaviors: {
    idle: "float",           // floats slightly
    onPageLoad: "sparkle",
    specialTrigger: null
  },
  speechBubbles: [
    "Multimodal!",
    "Searching Google...",
    "Google it.",
    "Double check with Google.",
    "Processing video, audio, and code!",
    "Exploring 1M token context..."
  ],
  collectible: "star"
};
