// ChatGPT theme config
export default {
  name: "chatgpt",
  colors: {
    primary: "#10A37F",      // OpenAI Green
    secondary: "#202123",    // ChatGPT Dark Gray
    accent: "#ECECF1",
    hoodie: "#10A37F",
    hair: "#4A5568",
    skin: "#FDE047"
  },
  character: {
    frameSize: 32,
    scale: 2
  },
  behaviors: {
    idle: "type",
    onPageLoad: "react",
    specialTrigger: "onWaitingResponse"
  },
  speechBubbles: [
    "GPT moment...",
    "Tokens loading...",
    "How can I help you today?",
    "Generating response...",
    "As an AI developed by...",
    "Context window: 128k!"
  ],
  collectible: "bubble"
};
