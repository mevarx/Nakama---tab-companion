// Reddit theme config
export default {
  name: "reddit",
  colors: {
    primary: "#FF4500",      // Reddit Orange-Red
    secondary: "#1A1A1B",    // Reddit Dark
    accent: "#FFEBE5",
    hoodie: "#FF4500",
    hair: "#2D3748",
    skin: "#FDE047"
  },
  character: {
    frameSize: 32,
    scale: 2
  },
  behaviors: {
    idle: "scroll",          // Infinite scroll animation
    onPageLoad: "react",
    specialTrigger: "onUpvoteSlapped"
  },
  speechBubbles: [
    "This is the way.",
    "Based.",
    "Actually...",
    "Thanks for the gold, kind stranger!",
    "Infinite scrolling active.",
    "Downvoted into oblivion."
  ],
  collectible: "upvote"
};
