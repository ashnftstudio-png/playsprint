/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

// =================================================================
// 1. DATA TYPES & INTERFACES
// =================================================================

export interface GlobalProfile {
  totalGamesPlayed: number;
  totalPlayTime: number; // in seconds
  totalWins: number;
  totalPerfectScores: number;
  highestComboEver: number;
  favoriteGame: string; // game ID with most plays
  lastPlayedGame: string; // game ID
  currentDailyStreak: number;
  longestDailyStreak: number;
  lastPlayDate: string; // YYYY-MM-DD
  totalClicks: number;
}

export interface GameHistoryItem {
  gameId: string;
  gameName: string;
  bestScore: number;
  lastScore: number;
  gamesPlayed: number;
  averageScore: number;
  fastestTime?: number; // reaction time in ms (smaller is better)
  longestCombo?: number; // highest combo achieved
  bestAccuracy?: number; // success rate (percentage)
}

export type GameHistory = Record<string, GameHistoryItem>;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'general' | 'reflex' | 'accuracy' | 'timing';
  unlockedAt: string | null;
}

export interface DailyChallenge {
  id: string;
  gameId: string;
  gameName: string;
  requirementText: string;
  targetValue: number;
  metric: 'score' | 'reactionTime' | 'combo' | 'errorMs';
  comparison: 'greater_or_equal' | 'less_or_equal';
  isCompleted: boolean;
  progress: number; // current value achieved
}

export interface PlayDetails {
  reactionTime?: number; // ms
  combo?: number;
  errorMs?: number; // ms
  clicksCount?: number;
  successClicksCount?: number;
  isPerfect?: boolean;
  survivalTime?: number;
  nearMisses?: number;
  powerupsCollected?: number;
  rank?: string;
  highestMultiplier?: number;
}

export interface GameResult {
  gameId: string;
  score: number;
  bestScore: number;
  isNewBest: boolean;
  coinsEarned: number;
  newAchievements: Achievement[];
  dailyChallengeCompletedNow: boolean;
  survivalTime?: number;
  nearMisses?: number;
  powerupsCollected?: number;
  rank?: string;
  highestMultiplier?: number;
}

// =================================================================
// 2. CONSTANTS
// =================================================================

export const ACHIEVEMENTS_LIST: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first-game',
    title: '🎮 First Game',
    description: 'Play any micro-game to begin your PlaySprint journey.',
    icon: 'Gamepad2',
    category: 'general'
  },
  {
    id: 'score-100-total',
    title: '🎯 Score 100 Total Points',
    description: 'Accumulate a total of 100 points across your game plays.',
    icon: 'Trophy',
    category: 'general'
  },
  {
    id: 'legendary-reaction',
    title: '⚡ Legendary Reaction',
    description: 'Achieve a lightning-fast reaction speed of under 180ms in Reaction Rush.',
    icon: 'Zap',
    category: 'reflex'
  },
  {
    id: 'streak-10',
    title: '🔥 10 Game Streak',
    description: 'Play 10 games to prove your unstoppable commitment.',
    icon: 'Flame',
    category: 'general'
  },
  {
    id: 'beat-pb',
    title: '🏆 Beat Your Personal Best',
    description: 'Push your limits and break your previous record in any game.',
    icon: 'Award',
    category: 'general'
  },
  {
    id: 'try-every-game',
    title: '🌈 Try Every Game',
    description: 'Play all four primary micro-games at least once.',
    icon: 'Sparkles',
    category: 'general'
  },
  {
    id: 'brain-master',
    title: '🧠 Brain Master',
    description: 'Reach a score of 20 or higher in Color Panic.',
    icon: 'Brain',
    category: 'general'
  },
  {
    id: 'clicks-500',
    title: '💯 500 Total Clicks',
    description: 'Interact 500 times with game controls or target dots.',
    icon: 'MousePointerClick',
    category: 'accuracy'
  },
  {
    id: 'perfect-timing',
    title: '⭐ Perfect Timing',
    description: 'Stop the stopwatch at exactly 1.000 seconds (0ms difference).',
    icon: 'Timer',
    category: 'timing'
  },
  {
    id: 'first-chain',
    title: '💥 First Chain',
    description: 'Trigger your first chain reaction explosion.',
    icon: 'Sparkles',
    category: 'general'
  },
  {
    id: 'orbs-50',
    title: '🔮 50 Orbs Destroyed',
    description: 'Destroy a total of 50 moving energy orbs in a single game of Chain Reaction.',
    icon: 'Trophy',
    category: 'reflex'
  },
  {
    id: 'orbs-100',
    title: '🌌 100 Orbs Destroyed',
    description: 'Destroy a total of 100 moving energy orbs in a single game of Chain Reaction.',
    icon: 'Flame',
    category: 'reflex'
  },
  {
    id: 'mega-chain',
    title: '⚡ Mega Chain',
    description: 'Create a single chain reaction of 30 or more orbs.',
    icon: 'Zap',
    category: 'reflex'
  },
  {
    id: 'reaction-master',
    title: '👑 Reaction Master',
    description: 'Pass Level 3 of Chain Reaction with high accuracy.',
    icon: 'Award',
    category: 'general'
  },
  {
    id: 'champion',
    title: '👑 PlaySprint Champion',
    description: 'Unlock all other achievements to be crowned the ultimate champion.',
    icon: 'Crown',
    category: 'general'
  }
];

const GAME_NAMES: Record<string, string> = {
  'catch-the-dot': 'Catch The Dot',
  'color-panic': 'Color Panic',
  'one-second-challenge': 'One Second Challenge',
  'reaction-rush': 'Reaction Rush',
  'lucky-button': 'Lucky Button',
  'dont-press-the-red-button': "Don't Press The Red Button",
  'find-the-fake-emoji': 'Find The Fake Emoji',
  'chain-reaction': 'Chain Reaction',
  'shape-switch': 'Shape Switch',
  'perfect-timing': 'Perfect Timing',
  'gravity-escape': 'Gravity Escape',
  'laser-maze': 'Laser Maze'
};

// =================================================================
// 3. STORAGE & STATE HELPERS
// =================================================================

const DEFAULT_PROFILE: GlobalProfile = {
  totalGamesPlayed: 0,
  totalPlayTime: 0,
  totalWins: 0,
  totalPerfectScores: 0,
  highestComboEver: 0,
  favoriteGame: 'None',
  lastPlayedGame: 'None',
  currentDailyStreak: 0,
  longestDailyStreak: 0,
  lastPlayDate: '',
  totalClicks: 0
};

const getInitialState = () => {
  try {
    const profileSaved = localStorage.getItem('playsprint_v2_profile');
    const profile: GlobalProfile = profileSaved ? JSON.parse(profileSaved) : { ...DEFAULT_PROFILE };

    const historySaved = localStorage.getItem('playsprint_v2_history');
    const history: GameHistory = historySaved ? JSON.parse(historySaved) : {};

    const achievementsSaved = localStorage.getItem('playsprint_v2_achievements');
    const unlockedIds: string[] = achievementsSaved ? JSON.parse(achievementsSaved) : [];
    
    const achievements: Achievement[] = ACHIEVEMENTS_LIST.map(item => ({
      ...item,
      unlockedAt: unlockedIds.includes(item.id) ? new Date().toISOString() : null
    }));

    return { profile, history, achievements };
  } catch (e) {
    return {
      profile: { ...DEFAULT_PROFILE },
      history: {},
      achievements: ACHIEVEMENTS_LIST.map(item => ({ ...item, unlockedAt: null }))
    };
  }
};

let globalState = getInitialState();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notify = () => {
  listeners.forEach(l => l());
};

const saveStateToStorage = () => {
  localStorage.setItem('playsprint_v2_profile', JSON.stringify(globalState.profile));
  localStorage.setItem('playsprint_v2_history', JSON.stringify(globalState.history));
  const unlockedIds = globalState.achievements
    .filter(a => a.unlockedAt !== null)
    .map(a => a.id);
  localStorage.setItem('playsprint_v2_achievements', JSON.stringify(unlockedIds));
};

// Determine Today's Daily Challenge Deterministically
export const getDailyChallenge = (): DailyChallenge => {
  const challenges: Omit<DailyChallenge, 'isCompleted' | 'progress'>[] = [
    {
      id: 'dc-reaction-rush-220',
      gameId: 'reaction-rush',
      gameName: 'Reaction Rush',
      requirementText: 'Beat 220ms in Reaction Rush',
      targetValue: 220,
      metric: 'reactionTime',
      comparison: 'less_or_equal'
    },
    {
      id: 'dc-catch-the-dot-30',
      gameId: 'catch-the-dot',
      gameName: 'Catch The Dot',
      requirementText: 'Score 30 points in Catch The Dot',
      targetValue: 30,
      metric: 'score',
      comparison: 'greater_or_equal'
    },
    {
      id: 'dc-color-panic-10',
      gameId: 'color-panic',
      gameName: 'Color Panic',
      requirementText: 'Reach Combo x10 in Color Panic',
      targetValue: 10,
      metric: 'combo',
      comparison: 'greater_or_equal'
    },
    {
      id: 'dc-one-second-20',
      gameId: 'one-second-challenge',
      gameName: 'One Second Challenge',
      requirementText: 'Complete One Second Challenge with <20ms error',
      targetValue: 20,
      metric: 'errorMs',
      comparison: 'less_or_equal'
    },
    {
      id: 'dc-catch-the-dot-25',
      gameId: 'catch-the-dot',
      gameName: 'Catch The Dot',
      requirementText: 'Score 25 points in Catch The Dot',
      targetValue: 25,
      metric: 'score',
      comparison: 'greater_or_equal'
    },
    {
      id: 'dc-reaction-rush-200',
      gameId: 'reaction-rush',
      gameName: 'Reaction Rush',
      requirementText: 'Get under 200ms in Reaction Rush',
      targetValue: 200,
      metric: 'reactionTime',
      comparison: 'less_or_equal'
    },
    {
      id: 'dc-color-panic-20',
      gameId: 'color-panic',
      gameName: 'Color Panic',
      requirementText: 'Score 20 points in Color Panic',
      targetValue: 20,
      metric: 'score',
      comparison: 'greater_or_equal'
    }
  ];

  const today = new Date();
  const dayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
  let hash = 0;
  for (let i = 0; i < dayString.length; i++) {
    hash = dayString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % challenges.length;
  const challenge = challenges[index];

  const isCompleted = localStorage.getItem(`playsprint_v2_dc_completed_${dayString}`) === 'true';
  const progress = parseFloat(localStorage.getItem(`playsprint_v2_dc_progress_${dayString}`) || '0');

  return {
    ...challenge,
    isCompleted,
    progress
  };
};

// =================================================================
// 4. THE CORE PLATFORM ENGINE
// =================================================================

export const gamePlatform = {
  // HUD state for realtime fixed overlay display
  hud: {
    score: 0,
    highScore: 0,
    lives: null as number | null,
    timer: null as number | null,
    combo: null as number | null,
    multiplier: null as number | null,
    level: null as number | null,
  },

  updateHud: (hudValues: Partial<{
    score: number;
    highScore: number;
    lives: number | null;
    timer: number | null;
    combo: number | null;
    multiplier: number | null;
    level: number | null;
  }>) => {
    gamePlatform.hud = { ...gamePlatform.hud, ...hudValues };
    notify();
  },

  resetHud: () => {
    gamePlatform.hud = {
      score: 0,
      highScore: 0,
      lives: null,
      timer: null,
      combo: null,
      multiplier: null,
      level: null,
    };
    notify();
  },

  // Get active states
  getProfile: () => globalState.profile,
  getHistory: () => globalState.history,
  getAchievements: () => globalState.achievements,
  getDailyChallenge: () => getDailyChallenge(),

  // Increment total playtime in background
  incrementPlayTime: (seconds: number) => {
    globalState.profile.totalPlayTime += seconds;
    saveStateToStorage();
    notify();
  },

  // Increment click count
  recordClick: () => {
    globalState.profile.totalClicks += 1;
    saveStateToStorage();
    notify();
    gamePlatform.checkAchievements();
  },

  // Setup the Shared Result overlay state
  activeResult: null as GameResult | null,
  setActiveResult: (res: GameResult | null) => {
    gamePlatform.activeResult = res;
    notify();
  },

  // Record a standard play session
  recordScore: (gameId: string, score: number, details: PlayDetails = {}): GameResult => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

    // 1. UPDATE STREAK
    let streak = globalState.profile.currentDailyStreak;
    let longestStreak = globalState.profile.longestDailyStreak;
    if (!globalState.profile.lastPlayDate) {
      streak = 1;
      longestStreak = Math.max(1, longestStreak);
    } else if (globalState.profile.lastPlayDate === yesterdayStr) {
      streak += 1;
      longestStreak = Math.max(streak, longestStreak);
    } else if (globalState.profile.lastPlayDate !== todayStr) {
      streak = 1;
    }

    // 2. GENERAL PROFILE ACCUMULATION
    globalState.profile.totalGamesPlayed += 1;
    globalState.profile.lastPlayedGame = gameId;
    globalState.profile.lastPlayDate = todayStr;
    globalState.profile.currentDailyStreak = streak;
    globalState.profile.longestDailyStreak = longestStreak;

    if (details.clicksCount) {
      globalState.profile.totalClicks += details.clicksCount;
    }
    if (details.combo && details.combo > globalState.profile.highestComboEver) {
      globalState.profile.highestComboEver = details.combo;
    }
    if (details.isPerfect) {
      globalState.profile.totalPerfectScores += 1;
    }

    // Determine Wins
    let isWin = false;
    if (gameId === 'catch-the-dot' && score >= 20) isWin = true;
    if (gameId === 'color-panic' && score >= 15) isWin = true;
    if (gameId === 'one-second-challenge' && details.errorMs !== undefined && details.errorMs <= 50) isWin = true;
    if (gameId === 'reaction-rush' && details.reactionTime !== undefined && details.reactionTime < 250) isWin = true;

    if (isWin) {
      globalState.profile.totalWins += 1;
    }

    // 3. CALCULATE GAME HISTORY
    const existingHistory = globalState.history[gameId] || {
      gameId,
      gameName: GAME_NAMES[gameId] || gameId,
      bestScore: 0,
      lastScore: 0,
      gamesPlayed: 0,
      averageScore: 0
    };

    const isNewBest = gameId === 'reaction-rush' 
      ? (existingHistory.bestScore === 0 || score < existingHistory.bestScore) // smaller reaction is best
      : (score > existingHistory.bestScore);

    const updatedBest = isNewBest ? score : existingHistory.bestScore;
    const updatedGamesPlayed = existingHistory.gamesPlayed + 1;
    const updatedAverage = Math.round(((existingHistory.averageScore * existingHistory.gamesPlayed) + score) / updatedGamesPlayed * 10) / 10;

    const updatedHistory: GameHistoryItem = {
      ...existingHistory,
      bestScore: updatedBest,
      lastScore: score,
      gamesPlayed: updatedGamesPlayed,
      averageScore: updatedAverage
    };

    // Specific game additions
    if (details.reactionTime !== undefined) {
      const prevFastest = existingHistory.fastestTime || 9999;
      updatedHistory.fastestTime = Math.min(prevFastest, details.reactionTime);
    }
    if (details.combo !== undefined) {
      const prevCombo = existingHistory.longestCombo || 0;
      updatedHistory.longestCombo = Math.max(prevCombo, details.combo);
    }
    if (details.clicksCount && details.successClicksCount) {
      const acc = Math.round((details.successClicksCount / details.clicksCount) * 100);
      const prevAcc = existingHistory.bestAccuracy || 0;
      updatedHistory.bestAccuracy = Math.max(prevAcc, acc);
    }

    globalState.history[gameId] = updatedHistory;

    // Recalculate Favorite Game (gameId with max plays)
    let maxPlays = 0;
    let favGame = globalState.profile.favoriteGame;
    Object.keys(globalState.history).forEach(id => {
      if (globalState.history[id].gamesPlayed > maxPlays) {
        maxPlays = globalState.history[id].gamesPlayed;
        favGame = GAME_NAMES[id] || id;
      }
    });
    globalState.profile.favoriteGame = favGame;

    // 4. FUTURE COINS SYSTEM
    // Base 5 coins + 1 coin per 2 points (or 10 coins for victory, etc)
    let coinsEarned = 5;
    if (gameId === 'one-second-challenge') {
      coinsEarned += (score * 5); // star reward
    } else if (gameId === 'reaction-rush') {
      if (score < 200) coinsEarned += 20;
      else if (score < 250) coinsEarned += 10;
      else coinsEarned += 5;
    } else {
      coinsEarned += Math.floor(score / 3);
    }

    // 5. DAILY CHALLENGE COMPARISON
    const dailyChallenge = getDailyChallenge();
    let dcCompletedNow = false;

    if (!dailyChallenge.isCompleted && dailyChallenge.gameId === gameId) {
      let currentVal = 0;
      if (dailyChallenge.metric === 'score') currentVal = score;
      if (dailyChallenge.metric === 'combo' && details.combo !== undefined) currentVal = details.combo;
      if (dailyChallenge.metric === 'reactionTime' && details.reactionTime !== undefined) currentVal = details.reactionTime;
      if (dailyChallenge.metric === 'errorMs' && details.errorMs !== undefined) currentVal = details.errorMs;

      // Save progress
      localStorage.setItem(`playsprint_v2_dc_progress_${todayStr}`, currentVal.toString());

      const satisfies = dailyChallenge.comparison === 'greater_or_equal'
        ? (currentVal >= dailyChallenge.targetValue && currentVal > 0)
        : (currentVal <= dailyChallenge.targetValue && currentVal > 0);

      if (satisfies) {
        localStorage.setItem(`playsprint_v2_dc_completed_${todayStr}`, 'true');
        dcCompletedNow = true;
      }
    }

    // 6. CALCULATE ACHIEVEMENT UNLOCKS
    const newlyUnlocked: Achievement[] = [];
    const checkAndUnlock = (id: string) => {
      const ach = globalState.achievements.find(a => a.id === id);
      if (ach && ach.unlockedAt === null) {
        ach.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(ach);
      }
    };

    // First Game
    if (globalState.profile.totalGamesPlayed >= 1) {
      checkAndUnlock('first-game');
    }

    // Score 100 Total Points
    let totalPointsAccumulated = 0;
    Object.keys(globalState.history).forEach(id => {
      const item = globalState.history[id];
      if (id !== 'reaction-rush' && id !== 'one-second-challenge') {
        // Points are additive
        totalPointsAccumulated += (item.averageScore * item.gamesPlayed);
      } else if (id === 'one-second-challenge') {
        // count stars as points
        totalPointsAccumulated += (item.averageScore * item.gamesPlayed * 10);
      }
    });
    if (totalPointsAccumulated >= 100 || score >= 100) {
      checkAndUnlock('score-100-total');
    }

    // Legendary Reaction (< 180ms)
    if (gameId === 'reaction-rush' && details.reactionTime && details.reactionTime < 180) {
      checkAndUnlock('legendary-reaction');
    }

    // 10 Game Streak (Total plays >= 10)
    if (globalState.profile.totalGamesPlayed >= 10) {
      checkAndUnlock('streak-10');
    }

    // Beat Personal Best
    if (isNewBest && existingHistory.gamesPlayed > 0) {
      checkAndUnlock('beat-pb');
    }

    // Try Every Game
    const mainGames = ['catch-the-dot', 'color-panic', 'reaction-rush', 'one-second-challenge'];
    const playedAll = mainGames.every(id => globalState.history[id] && globalState.history[id].gamesPlayed >= 1);
    if (playedAll) {
      checkAndUnlock('try-every-game');
    }

    // Brain Master
    if (gameId === 'color-panic' && score >= 20) {
      checkAndUnlock('brain-master');
    }

    // 500 Total Clicks
    if (globalState.profile.totalClicks >= 500) {
      checkAndUnlock('clicks-500');
    }

    // Perfect Timing
    if (gameId === 'one-second-challenge' && details.errorMs === 0) {
      checkAndUnlock('perfect-timing');
    }

    // Chain Reaction Achievements
    if (gameId === 'chain-reaction') {
      if (score >= 1) {
        checkAndUnlock('first-chain');
      }
      if (score >= 50) {
        checkAndUnlock('orbs-50');
      }
      if (score >= 100) {
        checkAndUnlock('orbs-100');
      }
      if (details.combo && details.combo >= 30) {
        checkAndUnlock('mega-chain');
      }
      if (score >= 35) {
        checkAndUnlock('reaction-master');
      }
    }

    // PlaySprint Champion (Check if all other are unlocked)
    const otherUnlocked = globalState.achievements
      .filter(a => a.id !== 'champion')
      .every(a => a.unlockedAt !== null);
    if (otherUnlocked) {
      checkAndUnlock('champion');
    }

    saveStateToStorage();
    notify();

    const resultObj: GameResult = {
      gameId,
      score,
      bestScore: updatedBest,
      isNewBest,
      coinsEarned,
      newAchievements: newlyUnlocked,
      dailyChallengeCompletedNow: dcCompletedNow,
      survivalTime: details.survivalTime,
      nearMisses: details.nearMisses,
      powerupsCollected: details.powerupsCollected,
      rank: details.rank,
      highestMultiplier: details.highestMultiplier
    };

    // Set active result globally so the unified GameOver modal shows up
    gamePlatform.setActiveResult(resultObj);

    return resultObj;
  },

  // Manual checker for generic clicks
  checkAchievements: () => {
    let unlockedAny = false;
    const newlyUnlocked: Achievement[] = [];
    const checkAndUnlock = (id: string) => {
      const ach = globalState.achievements.find(a => a.id === id);
      if (ach && ach.unlockedAt === null) {
        ach.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(ach);
        unlockedAny = true;
      }
    };

    if (globalState.profile.totalClicks >= 500) {
      checkAndUnlock('clicks-500');
    }

    const otherUnlocked = globalState.achievements
      .filter(a => a.id !== 'champion')
      .every(a => a.unlockedAt !== null);
    if (otherUnlocked) {
      checkAndUnlock('champion');
    }

    if (unlockedAny) {
      saveStateToStorage();
      notify();
      // Show notification/toast for newly unlocked achievements if there's any active play
      if (newlyUnlocked.length > 0) {
        const currentResult = gamePlatform.activeResult;
        if (currentResult) {
          gamePlatform.activeResult = {
            ...currentResult,
            newAchievements: [...currentResult.newAchievements, ...newlyUnlocked]
          };
          notify();
        }
      }
    }
  },

  // Launch a random game helper
  getRandomGameId: (currentGameId?: string): string => {
    const list = [
      'catch-the-dot', 
      'color-panic', 
      'one-second-challenge', 
      'reaction-rush', 
      'find-the-fake-emoji', 
      'chain-reaction', 
      'shape-switch', 
      'perfect-timing',
      'gravity-escape',
      'laser-maze'
    ];
    const filtered = currentGameId ? list.filter(id => id !== currentGameId) : list;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }
};

// =================================================================
// 5. CUSTOM REACT HOOK FOR REAL-TIME SYNC
// =================================================================

export const useGamePlatform = () => {
  const [state, setState] = useState(() => ({
    profile: globalState.profile,
    history: globalState.history,
    achievements: globalState.achievements,
    dailyChallenge: getDailyChallenge(),
    activeResult: gamePlatform.activeResult,
    hud: gamePlatform.hud
  }));

  useEffect(() => {
    return subscribe(() => {
      setState({
        profile: { ...globalState.profile },
        history: { ...globalState.history },
        achievements: [...globalState.achievements],
        dailyChallenge: getDailyChallenge(),
        activeResult: gamePlatform.activeResult,
        hud: { ...gamePlatform.hud }
      });
    });
  }, []);

  return {
    ...state,
    recordScore: gamePlatform.recordScore,
    recordClick: gamePlatform.recordClick,
    incrementPlayTime: gamePlatform.incrementPlayTime,
    setActiveResult: gamePlatform.setActiveResult,
    getRandomGameId: gamePlatform.getRandomGameId,
    updateHud: gamePlatform.updateHud,
    resetHud: gamePlatform.resetHud
  };
};
