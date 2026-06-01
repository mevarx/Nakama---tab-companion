

export const QUESTS_DATABASE = [
  {
    id: "first_coffee",
    title: "First Coffee",
    description: "Collect 1 coffee on claude.ai",
    rewardXP: 50,
    rewardCoins: 10,
    check: (state) => (state.siteCollected && state.siteCollected.claude >= 1)
  },
  {
    id: "git_push",
    title: "Ship It",
    description: "Visit GitHub 5 times",
    rewardXP: 100,
    rewardCoins: 20,
    check: (state) => (state.siteVisits && state.siteVisits.github >= 5)
  },
  {
    id: "stackoverflow_survivor",
    title: "Stackoverflow Survivor",
    description: "Spend 10 minutes on Stack Overflow",
    rewardXP: 150,
    rewardCoins: 30,
    check: (state) => (state.siteTime && state.siteTime.stackoverflow >= 600)
  },
  {
    id: "star_hunter",
    title: "Star Hunter",
    description: "Collect 10 stars on gemini.google.com",
    rewardXP: 120,
    rewardCoins: 25,
    check: (state) => (state.siteCollected && state.siteCollected.gemini >= 10)
  },
  {
    id: "lofi_listener",
    title: "Chill Coder",
    description: "Spend 5 minutes on YouTube",
    rewardXP: 80,
    rewardCoins: 15,
    check: (state) => (state.siteTime && state.siteTime.youtube >= 300)
  }
];

export function checkQuestsCompletion(state) {
  if (!state.quests) {
    state.quests = { active: [], completed: [] };
  }

  const newlyCompleted = [];
  
  for (const quest of QUESTS_DATABASE) {

    if (!state.quests.completed.includes(quest.id)) {
      if (quest.check(state)) {
        state.quests.completed.push(quest.id);
        state.xp += quest.rewardXP;
        state.coins += quest.rewardCoins;
        state.totalCollected += quest.rewardCoins;
        
        newlyCompleted.push({
          id: quest.id,
          title: quest.title,
          rewardXP: quest.rewardXP,
          rewardCoins: quest.rewardCoins
        });
      }
    }
  }

  return { state, newlyCompleted };
}
