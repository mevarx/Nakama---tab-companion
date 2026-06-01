

export const STATE_LEVEL_LOCKS = {
  idle: 1,
  walk: 1,
  sit: 2,
  type: 2,
  sleep: 3,
  react: 1,
  special: 4
};

export class CompanionStateMachine {
  constructor(initialState = "idle", level = 1) {
    this.currentState = initialState;
    this.level = level;
    this.stateTimer = 0;
    this.lockState = false;
  }

  setLevel(level) {
    this.level = level;
  }

  isStateUnlocked(state) {
    const requiredLevel = STATE_LEVEL_LOCKS[state] || 1;
    return this.level >= requiredLevel;
  }


  transitionTo(newState, duration = 0) {

    if (this.currentState === newState && duration === 0) return;

    this.currentState = newState;
    this.stateTimer = duration;
    this.lockState = duration > 0;
  }

  update(deltaTimeMs, userIdleTimeSeconds, themeConfig) {
    if (this.lockState) {
      this.stateTimer -= deltaTimeMs;
      if (this.stateTimer <= 0) {
        this.lockState = false;
        this.autoTransition(themeConfig);
      }
      return;
    }


    if (userIdleTimeSeconds >= 60 && this.isStateUnlocked("sleep") && this.currentState !== "sleep") {
      this.transitionTo("sleep");
      return;
    }


    if (userIdleTimeSeconds < 60 && this.currentState === "sleep") {
      this.transitionTo("idle");
      return;
    }


    this.stateTimer -= deltaTimeMs;
    if (this.stateTimer <= 0) {
      this.autoTransition(themeConfig);
    }
  }

  autoTransition(themeConfig) {

    const possibleStates = ["idle", "walk"];
    
    if (this.isStateUnlocked("sit")) possibleStates.push("sit");
    if (this.isStateUnlocked("type")) possibleStates.push("type");
    if (this.isStateUnlocked("special")) possibleStates.push("special");


    let chosenState = "idle";
    const rand = Math.random();

    if (themeConfig.name === "github" && possibleStates.includes("special") && rand < 0.25) {
      chosenState = "special";
    } else if (themeConfig.name === "claude" && possibleStates.includes("type") && rand < 0.3) {
      chosenState = "type";
    } else if (themeConfig.name === "youtube" && possibleStates.includes("sit") && rand < 0.4) {
      chosenState = "sit";
    } else {

      if (rand < 0.35) {
        chosenState = "walk";
      } else if (rand < 0.6) {
        chosenState = "idle";
      } else if (rand < 0.75 && possibleStates.includes("sit")) {
        chosenState = "sit";
      } else if (rand < 0.9 && possibleStates.includes("type")) {
        chosenState = "type";
      } else if (possibleStates.includes("special")) {
        chosenState = "special";
      }
    }


    const duration = 4000 + Math.random() * 6000;
    this.currentState = chosenState;
    this.stateTimer = duration;
  }
}
