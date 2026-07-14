/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Home, Shuffle, Share2, Trophy, Coins, Sparkles, Check, Star, Award, Zap, Brain, Flame, Target } from 'lucide-react';
import { GameResult } from '../lib/gamePlatform';

interface SharedGameOverScreenProps {
  result: GameResult | null;
  onPlayAgain: () => void;
  onHome: () => void;
  onNextGame: () => void;
}

const getGameName = (id: string): string => {
  switch (id) {
    case 'catch-the-dot': return 'Catch The Dot';
    case 'color-panic': return 'Color Panic';
    case 'one-second-challenge': return 'One Second Challenge';
    case 'reaction-rush': return 'Reaction Rush';
    case 'find-the-fake-emoji': return 'Find The Fake Emoji';
    case 'chain-reaction': return 'Chain Reaction';
    case 'shape-switch': return 'Shape Switch';
    case 'perfect-timing': return 'Perfect Timing';
    case 'gravity-escape': return 'Gravity Escape';
    case 'laser-maze': return 'Laser Maze';
    default: return 'Quick Play Game';
  }
};

const getGameEmoji = (id: string): string => {
  switch (id) {
    case 'catch-the-dot': return '🎯';
    case 'color-panic': return '🎨';
    case 'one-second-challenge': return '⏱️';
    case 'reaction-rush': return '⚡';
    case 'find-the-fake-emoji': return '🔍';
    case 'chain-reaction': return '💥';
    case 'shape-switch': return '🔷';
    case 'perfect-timing': return '⭐';
    case 'gravity-escape': return '🚀';
    case 'laser-maze': return '🚨';
    default: return '🎮';
  }
};

export const SharedGameOverScreen: React.FC<SharedGameOverScreenProps> = ({
  result,
  onPlayAgain,
  onHome,
  onNextGame,
}) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const { gameId, score, bestScore, isNewBest, coinsEarned, newAchievements, dailyChallengeCompletedNow } = result;

  const handleShare = () => {
    const gameEmoji = getGameEmoji(gameId);
    const gameName = getGameName(gameId);
    
    let scoreText = '';
    if (gameId === 'reaction-rush') {
      scoreText = `${score}ms`;
    } else if (gameId === 'one-second-challenge') {
      // score is the stars, let's retrieve errorMs from history or display it
      scoreText = `${score} / 5 Stars`;
    } else {
      scoreText = `${score} pts`;
    }

    let text = `${gameEmoji} My final score in "${gameName}" is ${scoreText}!`;
    if (isNewBest) {
      text += ` 🏆 NEW PERSONAL BEST!`;
    }
    text += ` Play this game instantly inside PlaySprint: ${window.location.origin}${window.location.pathname}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Human-friendly representation of score
  const renderScoreValue = () => {
    if (gameId === 'reaction-rush') {
      return (
        <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-emerald-400">
          {score}
          <span className="text-xs font-semibold text-emerald-500/80 ml-1">ms</span>
        </span>
      );
    }
    if (gameId === 'one-second-challenge') {
      return (
        <div className="flex flex-col items-center">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={star <= score ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-slate-700'}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {score === 5 ? 'Perfect 1.000s Guess!' : `${score} Star Rating`}
          </span>
        </div>
      );
    }
    return (
      <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-cyan-400">
        {score}
        <span className="text-xs font-semibold text-cyan-500/80 ml-1">pts</span>
      </span>
    );
  };

  const renderBestValue = () => {
    if (gameId === 'reaction-rush') {
      return `${bestScore}ms`;
    }
    if (gameId === 'one-second-challenge') {
      return `${bestScore} Stars`;
    }
    return `${bestScore} pts`;
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/98 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto rounded-2xl border border-slate-900 shadow-2xl">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-cyan-500/5 blur-[50px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full flex flex-col items-center z-10"
      >
        {/* Game Title Header */}
        <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-widest uppercase mb-1">
          {getGameEmoji(gameId)} {getGameName(gameId)} • PLAY COMPLETE
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mb-6 flex items-center gap-2">
          SESSION SUMMARY
        </h2>

        {/* New Personal Best Badge */}
        {isNewBest && (
          <motion.div
            initial={{ scale: 0.8, rotate: -2 }}
            animate={{ scale: [0.8, 1.1, 1], rotate: [-2, 2, 0] }}
            className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 border border-amber-300/40 text-slate-950 font-bold font-sans text-[10px] tracking-widest uppercase px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <Sparkles size={11} className="animate-spin" />
            New Personal Best!
          </motion.div>
        )}

        {/* Daily Challenge Completed Notification */}
        {dailyChallengeCompletedNow && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 w-full bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-3 flex items-center gap-3 font-mono text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 text-lg">
              🏅
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider">DAILY CHALLENGE COMPLETE</div>
              <div className="text-[11px] text-slate-300">Unlocked your Golden Badge reward!</div>
            </div>
          </motion.div>
        )}

        {/* Score & Coins Dashboard Panel */}
        <div className="w-full bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-4 font-mono shadow-inner mb-6">
          <div className="flex flex-col items-center py-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">FINAL SCORE</span>
            {renderScoreValue()}
          </div>

          <div className="h-px bg-slate-800/40" />

          {(gameId === 'gravity-escape' || gameId === 'laser-maze') && (
            <>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase">⏱️ SURVIVAL TIME</span>
                  <span className="font-extrabold text-slate-200">{result.survivalTime ?? 0}s</span>
                </div>
                <div className="w-full h-px bg-slate-800/20" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase">☄️ NEAR MISSES</span>
                  <span className="font-extrabold text-cyan-400">{result.nearMisses ?? 0}</span>
                </div>
                <div className="w-full h-px bg-slate-800/20" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase">🔋 POWERUPS SAVED</span>
                  <span className="font-extrabold text-amber-400">{result.powerupsCollected ?? 0}</span>
                </div>
                <div className="w-full h-px bg-slate-800/20" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase">🔥 MAX MULTIPLIER</span>
                  <span className="font-extrabold text-rose-400">x{result.highestMultiplier ?? 1}</span>
                </div>
                <div className="w-full h-px bg-slate-800/20" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase">
                    {gameId === 'laser-maze' ? '🎖️ MAZE RANK' : '🎖️ PILOT RANK'}
                  </span>
                  <span className="font-extrabold text-indigo-300 uppercase tracking-wider">{result.rank ?? 'Rookie'}</span>
                </div>
              </div>
              <div className="h-px bg-slate-800/40" />
            </>
          )}

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="border-r border-slate-800/40 flex flex-col py-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">PERSONAL BEST</span>
              <span className="text-sm font-extrabold text-slate-200">{renderBestValue()}</span>
            </div>
            <div className="flex flex-col py-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">COINS EARNED</span>
              <span className="text-sm font-extrabold text-amber-400 flex items-center justify-center gap-1">
                <Coins size={12} className="text-amber-400" />
                +{coinsEarned}
              </span>
            </div>
          </div>
        </div>

        {/* Unlocked Achievements Section */}
        {newAchievements.length > 0 && (
          <div className="w-full mb-6">
            <h3 className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mb-2 text-left">
              🎉 Achievements Unlocked!
            </h3>
            <div className="flex flex-col gap-2">
              {newAchievements.map((ach) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 text-sm">
                    ✨
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-indigo-200">{ach.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono leading-tight">{ach.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS GRID */}
        <div className="flex flex-col gap-2.5 w-full">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onPlayAgain}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold tracking-wider uppercase cursor-pointer active:scale-95 transition-all shadow-md shadow-indigo-600/10"
              id={`result-play-again-${gameId}`}
            >
              <RotateCcw size={13} />
              Play Again
            </button>
            <button
              onClick={onNextGame}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-indigo-400 font-mono text-xs font-bold tracking-wider uppercase cursor-pointer active:scale-95 transition-all"
              id={`result-next-game-${gameId}`}
            >
              <Shuffle size={13} />
              Next Game
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onHome}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300 font-mono text-xs font-bold tracking-wider uppercase cursor-pointer active:scale-95 transition-all"
              id={`result-home-${gameId}`}
            >
              <Home size={13} />
              Home
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300 font-mono text-xs font-bold tracking-wider uppercase cursor-pointer active:scale-95 transition-all"
              id={`result-share-${gameId}`}
            >
              <Share2 size={13} />
              Share
            </button>
          </div>
        </div>
      </motion.div>

      {/* Copy notification overlay */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-6 z-50 bg-slate-900 border border-indigo-500/40 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-xl"
          >
            <Check className="text-indigo-400" size={14} />
            <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
              Copied to clipboard!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
