// StackOverflow theme config
export default {
  name: "stackoverflow",
  colors: {
    primary: "#F48225",      // SO Orange
    secondary: "#2D2D2D",
    accent: "#FDF7E7",       // SO Light Beige
    hoodie: "#BCBBBB",       // Desperate gray sweat hoodie
    hair: "#5C5C5C",
    skin: "#FDE047"
  },
  character: {
    frameSize: 32,
    scale: 2
  },
  behaviors: {
    idle: "sweat",           // Frantic eyes
    onPageLoad: "react",
    specialTrigger: "onAcceptedAnswerVisible"
  },
  speechBubbles: [
    "Closed as duplicate...",
    "Did you try turning it off?",
    "This worked in 2009.",
    "Downvoted: Not a real question.",
    "Show me your stack trace.",
    "Copy-pasting from page...",
    "Who downvoted my solution?!"
  ],
  collectible: "badge"
};
