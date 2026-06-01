// GitHub theme config
export default {
  name: "github",
  colors: {
    primary: "#24292F",      // GitHub Dark Grey
    secondary: "#0D1117",    // Deep Navy/Black
    accent: "#58A6FF",       // Bright Blue
    hoodie: "#1B1F23",
    hair: "#0D1117",
    skin: "#FDE047"
  },
  character: {
    frameSize: 32,
    scale: 2
  },
  behaviors: {
    idle: "type",
    onPageLoad: "react",
    specialTrigger: "onPullRequestMerge"
  },
  speechBubbles: [
    "git push origin main",
    "Why won't this merge?",
    "LGTM! Approve it.",
    "Conflict in README.md...",
    "Rebasing with master...",
    "404: Sleep not found.",
    "Check out my commit graph!"
  ],
  collectible: "wrench"
};
