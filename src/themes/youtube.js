// YouTube theme config
export default {
  name: "youtube",
  colors: {
    primary: "#FF0000",      // YouTube Red
    secondary: "#0F0F0F",    // YouTube Black
    accent: "#FEEBEB",
    hoodie: "#3F3F3F",       // Pajama/blanket dark gray
    hair: "#8E8E8E",
    skin: "#FDE047"
  },
  character: {
    frameSize: 32,
    scale: 2
  },
  behaviors: {
    idle: "popcorn",         // kicks feet up, eats popcorn
    onPageLoad: "react",
    specialTrigger: "onUserIdle60s" // sleep if idle 60s
  },
  speechBubbles: [
    "Just one more video...",
    "5 minute video = 40 min.",
    "Autoplay betrayed me.",
    "Lofi hip hop beats to code/relax to...",
    "Ad blocker detected? Oh no...",
    "Let me watch this coding tutorial..."
  ],
  collectible: "popcorn"
};
