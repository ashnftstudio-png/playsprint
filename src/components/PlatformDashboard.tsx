/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Flame, Clock, Activity, Award, Star, Gamepad2, Sparkles, 
  Zap, Coins, Crown, MousePointerClick, ChevronDown, ChevronUp, User, 
  History, Shuffle, CheckCircle2, Lock, FlameKindling
} from 'lucide-react';
import { useGamePlatform, gamePlatform } from '../lib/gamePlatform';
import { Experience } from '../types';
import { EXPERIENCES } from '../data/experiences';

interface PlatformDashboardProps {
  onSelectExperience: (exp: Experience | null) => void;
}

export const PlatformDashboard: React.FC<PlatformDashboardProps> = ({ onSelectExperience }) => {
  const { profile, history, achievements, dailyChallenge, getRandomGameId } = useGamePlatform();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'history'>('profile');

  // Human play time helper
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleRandomPlay = () => {
    // Select random game
    const randomId = getRandomGameId();
    const gameExp = EXPERIENCES.find(exp => exp.id === randomId);
    if (gameExp) {
      onSelectExperience(gameExp);
    }
  };

  const handlePlayChallenge = () => {
    const gameExp = EXPERIENCES.find(exp => exp.id === dailyChallenge.gameId);
    if (gameExp) {
      onSelectExperience(gameExp);
    }
  };

  const getUnlocksCount = () => {
    return achievements.filter(a => a.unlockedAt !== null).length;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8" id="platform-dashboard">
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        
        {/* Toggle Bar */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 active:bg-slate-800/40 transition-all select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <Crown size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider font-sans">
                  Player Hub & Achievements
                </h3>
                {profile.currentDailyStreak > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 animate-pulse">
                    <Flame size={12} className="fill-orange-500" />
                    {profile.currentDailyStreak}D Streak
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {getUnlocksCount()} / {achievements.length} Badges Unlocked • Total Games: {profile.totalGamesPlayed}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Random Game Launcher */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRandomPlay();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-all active:scale-95"
              id="dashboard-random-play-btn"
            >
              <Shuffle size={11} />
              Random Launch
            </button>
            <div className="text-slate-400">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="border-t border-slate-800/50 overflow-hidden"
            >
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT SIDE: Daily Challenge widget (Takes 4 cols on large screens) */}
                <div className="lg:col-span-4 bg-slate-950/60 border border-slate-800/60 rounded-xl p-5 flex flex-col justify-between font-mono relative overflow-hidden">
                  {/* Backdrop subtle challenge art */}
                  <div className="absolute -right-6 -bottom-6 text-slate-900 pointer-events-none opacity-40 select-none">
                    <Trophy size={110} />
                  </div>

                  <div className="z-10">
                    <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase flex items-center gap-1">
                      <Sparkles size={11} className="animate-pulse" />
                      Featured Daily Challenge
                    </span>
                    <h4 className="text-md font-black text-white uppercase tracking-tight mt-1 mb-3">
                      {dailyChallenge.requirementText}
                    </h4>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Target: {dailyChallenge.targetValue}
                          {dailyChallenge.metric === 'reactionTime' && 'ms'}
                          {dailyChallenge.metric === 'errorMs' && 'ms'}
                          {dailyChallenge.metric === 'score' && ' pts'}
                        </span>
                        <span className="font-bold text-slate-200">
                          {dailyChallenge.isCompleted ? 'COMPLETED 🏅' : `Active Progress`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            dailyChallenge.isCompleted ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-indigo-500'
                          }`}
                          style={{ width: dailyChallenge.isCompleted ? '100%' : `${Math.min(100, (dailyChallenge.progress / dailyChallenge.targetValue) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="z-10 flex gap-2.5 mt-2">
                    <button
                      onClick={handlePlayChallenge}
                      className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                      id="dashboard-play-challenge-btn"
                    >
                      <Zap size={11} className="fill-slate-950 text-slate-950" />
                      Play Challenge
                    </button>
                    <button
                      onClick={handleRandomPlay}
                      className="sm:hidden py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-indigo-400 font-bold text-[10px] tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Shuffle size={11} />
                      Random
                    </button>
                  </div>
                </div>

                {/* RIGHT SIDE: Navigation tab panels (Takes 8 cols) */}
                <div className="lg:col-span-8 flex flex-col">
                  
                  {/* Dashboard Tab Buttons */}
                  <div className="flex border-b border-slate-800/80 mb-4 font-mono text-xs">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`pb-2.5 px-3 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        activeTab === 'profile' 
                          ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Profile & Stats
                    </button>
                    <button
                      onClick={() => setActiveTab('achievements')}
                      className={`pb-2.5 px-3 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        activeTab === 'achievements' 
                          ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Badges ({getUnlocksCount()})
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`pb-2.5 px-3 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        activeTab === 'history' 
                          ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Game Logs
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="flex-1 min-h-[220px]">
                    
                    {/* TAB 1: PROFILE & STATS */}
                    {activeTab === 'profile' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl flex flex-col font-mono text-left">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <Gamepad2 size={11} /> Played
                          </span>
                          <span className="text-xl font-black text-slate-100">{profile.totalGamesPlayed}</span>
                          <span className="text-[10px] text-slate-500 mt-1">Total play sessions</span>
                        </div>
                        
                        <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl flex flex-col font-mono text-left">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <Clock size={11} /> Play Time
                          </span>
                          <span className="text-xl font-black text-slate-100">{formatTime(profile.totalPlayTime)}</span>
                          <span className="text-[10px] text-slate-500 mt-1">Total active play</span>
                        </div>

                        <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl flex flex-col font-mono text-left">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <Trophy size={11} /> Total Wins
                          </span>
                          <span className="text-xl font-black text-slate-100">{profile.totalWins}</span>
                          <span className="text-[10px] text-slate-500 mt-1">Perfect & Victories</span>
                        </div>

                        <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl flex flex-col font-mono text-left">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <Activity size={11} /> Max Combo
                          </span>
                          <span className="text-xl font-black text-slate-100">x{profile.highestComboEver}</span>
                          <span className="text-[10px] text-slate-500 mt-1">Color Panic combo</span>
                        </div>

                        {/* Extra metrics */}
                        <div className="col-span-2 bg-slate-900/30 border border-slate-800/50 p-3 px-4 rounded-xl flex items-center justify-between font-mono text-left">
                          <div>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">FAVORITE GAME</span>
                            <span className="text-xs font-extrabold text-indigo-400 uppercase truncate max-w-[150px] inline-block">{profile.favoriteGame}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 text-right">Most Played</span>
                        </div>

                        <div className="col-span-2 bg-slate-900/30 border border-slate-800/50 p-3 px-4 rounded-xl flex items-center justify-between font-mono text-left">
                          <div>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">LAST PLAYED</span>
                            <span className="text-xs font-extrabold text-indigo-400 uppercase truncate max-w-[150px] inline-block">
                              {profile.lastPlayedGame === 'None' ? 'None' : (profile.lastPlayedGame.replace(/-/g, ' '))}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500 text-right">Recent Session</span>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: ACHIEVEMENTS hub */}
                    {activeTab === 'achievements' && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {achievements.map((ach) => {
                          const unlocked = ach.unlockedAt !== null;
                          return (
                            <div 
                              key={ach.id}
                              className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center relative group transition-all duration-200 select-none ${
                                unlocked 
                                  ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-200' 
                                  : 'bg-slate-950/40 border-slate-900 text-slate-500'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-md mb-1.5 transition-all duration-300 ${
                                unlocked ? 'bg-indigo-500/10 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]' : 'bg-slate-900'
                              }`}>
                                {unlocked ? (
                                  <span>✨</span>
                                ) : (
                                  <Lock size={12} className="text-slate-700" />
                                )}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-tight truncate w-full">
                                {ach.title.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '')}
                              </span>
                              
                              {/* Hover tooltips */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl p-2.5 text-[9px] font-mono leading-tight shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all z-50">
                                <div className="font-bold text-indigo-400 mb-0.5">{ach.title}</div>
                                <div>{ach.description}</div>
                                {unlocked && (
                                  <div className="text-[8px] text-slate-500 mt-1 font-sans">
                                    Unlocked: {new Date(ach.unlockedAt!).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* TAB 3: GAME HISTORY & LOGS */}
                    {activeTab === 'history' && (
                      <div className="w-full max-h-[220px] overflow-y-auto pr-1">
                        {Object.keys(history).length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 font-mono text-slate-500 text-xs">
                            <History size={18} className="mb-1 text-slate-700" />
                            No matches logged yet. Play any game above!
                          </div>
                        ) : (
                          <div className="w-full text-left font-mono text-[10px] border border-slate-800/60 rounded-xl overflow-hidden">
                            <table className="w-full bg-slate-950/20">
                              <thead>
                                <tr className="bg-slate-900/50 text-slate-500 border-b border-slate-800/60">
                                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold">GAME NAME</th>
                                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">PLAYS</th>
                                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">BEST SCORE</th>
                                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">AVERAGE</th>
                                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">METRICS</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-900">
                                {Object.keys(history).map((id) => {
                                  const item = history[id];
                                  return (
                                    <tr key={id} className="hover:bg-slate-900/20 text-slate-300">
                                      <td className="py-2 px-3 font-bold text-indigo-400">{item.gameName}</td>
                                      <td className="py-2 px-3 text-center text-slate-400 font-bold">{item.gamesPlayed}</td>
                                      <td className="py-2 px-3 text-center text-emerald-400 font-extrabold">
                                        {id === 'reaction-rush' ? `${item.bestScore}ms` : id === 'one-second-challenge' ? `${item.bestScore}★` : `${item.bestScore} pts`}
                                      </td>
                                      <td className="py-2 px-3 text-center">{item.averageScore}</td>
                                      <td className="py-2 px-3 text-center text-[9px] text-slate-500">
                                        {item.fastestTime && `Best Speed: ${item.fastestTime}ms `}
                                        {item.longestCombo && `Max Combo: x${item.longestCombo} `}
                                        {item.bestAccuracy && `Accuracy: ${item.bestAccuracy}%`}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
