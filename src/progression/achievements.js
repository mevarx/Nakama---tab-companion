

export const ACHIEVEMENTS_DATABASE = [
  {
    id: "hello_world",
    title: "Hello World",
    description: "Initialize your Nakama",
    check: () => true
  },
  {
    id: "junior_developer",
    title: "Junior Developer",
    description: "Reach Level 3",
    check: (state) => state.level >= 3
  },
  {
    id: "senior_developer",
    title: "Senior Developer",
    description: "Reach Level 5",
    check: (state) => state.level >= 5
  },
  {
    id: "mischief_master",
    title: "Mischief Master",
    description: "Reach Level 8",
    check: (state) => state.level >= 8
  },
  {
    id: "coin_hoarder",
    title: "Coin Hoarder",
    description: "Collect 100 coins total",
    check: (state) => state.totalCollected >= 100
  },
  {
    id: "coffee_addict",
    title: "Coffee Addict",
    description: "Collect 5 coffees on claude.ai",
    check: (state) => (state.siteCollected && state.siteCollected.claude >= 5)
  },
  {
    id: "git_master",
    title: "Git Master",
    description: "Visit GitHub 10 times",
    check: (state) => (state.siteVisits && state.siteVisits.github >= 10)
  },
  {
    id: "stack_overflow_survivor",
    title: "Stack Overflow Survivor",
    description: "Spend 20 minutes on Stack Overflow",
    check: (state) => (state.siteTime && state.siteTime.stackoverflow >= 1200)
  }
];

export function checkAchievements(state) {
  if (!state.achievements) {
    state.achievements = [];
  }

  const newlyUnlocked = [];

  for (const ach of ACHIEVEMENTS_DATABASE) {
    if (!state.achievements.includes(ach.id)) {
      if (ach.check(state)) {
        state.achievements.push(ach.id);
        newlyUnlocked.push({
          id: ach.id,
          title: ach.title,
          description: ach.description
        });
      }
    }
  }

  return { state, newlyUnlocked };
}
