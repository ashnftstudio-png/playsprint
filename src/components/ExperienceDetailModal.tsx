/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, HelpCircle, GraduationCap, Clock, Trophy, CheckCircle, Heart, Star } from 'lucide-react';
import { Experience } from '../types';
import { getColorClasses } from './ExperienceCard';
import { InteractiveMiniToys } from './InteractiveMiniToys';
import { useGamePlatform, gamePlatform } from '../lib/gamePlatform';

interface ExperienceDetailModalProps {
  experience: Experience | null;
  onClose: () => void;
  onSelectExperience?: (exp: Experience | null) => void;
}

export const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({
  experience,
  onClose,
  onSelectExperience,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const { hud, resetHud } = useGamePlatform();

  // Reset play state and HUD when opening a new experience
  useEffect(() => {
    setIsPlaying(false);
    setShowInstructions(false);
    resetHud();
  }, [experience, resetHud]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (experience) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [experience]);

  if (!experience) return null;

  const classes = getColorClasses(experience.themeColor);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col h-full max-h-[100dvh] bg-slate-950 text-white font-sans select-none overflow-hidden">
        
        {/* Animated ambient background glows */}
        <div className="absolute top-1/4 left-1/4 h-[300px] sm:h-[500px] w-[300px] sm:w-[500px] rounded-full bg-cyan-500/10 blur-[100px] sm:blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] sm:h-[500px] w-[300px] sm:w-[500px] rounded-full bg-indigo-500/10 blur-[100px] sm:blur-[130px] pointer-events-none" />

        {/* TOP CONTROL NAVIGATION BAR */}
        <header className="relative z-30 w-full px-4 py-2 sm:px-6 sm:py-3 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-2xl">🎮</span>
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-tight uppercase text-slate-100 flex items-center gap-1.5">
                {experience.title}
                <span className="text-[9px] bg-slate-900 border border-slate-800 text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded-full uppercase">
                  {experience.category}
                </span>
              </h2>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest hidden sm:block">
                PlaySprint Signature Arcade Cabinet v1.1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Compact Help Button (Visible during gameplay or start) */}
            {isPlaying && (
              <button
                onClick={() => setShowInstructions((prev) => !prev)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono font-bold text-slate-300 transition-all cursor-pointer active:scale-95"
              >
                <HelpCircle size={11} className="text-indigo-400" />
                <span>{showInstructions ? 'Hide Help' : 'Help'}</span>
              </button>
            )}

            {/* Exit/Close Cabinet Button */}
            <button
              onClick={onClose}
              className="rounded-full bg-slate-900 border border-slate-800/80 p-1.5 sm:p-2 text-slate-400 hover:bg-white hover:text-slate-950 hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg"
              id={`close-${experience.id}`}
              title="Close cabinet"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 min-h-0 w-full flex flex-col items-center justify-center relative p-2 sm:p-4 overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!isPlaying ? (
              
              /* PRE-GAME INTERFACE SCREEN */
              <motion.div
                key="pre-game"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative shadow-2xl backdrop-blur-md z-20"
              >
                <div className={`w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shadow-lg mb-4`}>
                  ⚡
                </div>

                <h2 className="text-3xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-2">
                  {experience.title}
                </h2>
                
                <p className="text-xs text-slate-400 leading-relaxed max-w-md mb-6">
                  {experience.longDescription}
                </p>

                {/* Compact Metadata Rows */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6 text-slate-400 font-mono text-[11px]">
                  <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl py-2 flex flex-col items-center">
                    <Clock size={14} className="text-slate-500 mb-1" />
                    <span className="text-slate-500 font-bold">ESTIMATED TIME</span>
                    <span className="text-white font-black mt-0.5">{experience.duration}</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl py-2 flex flex-col items-center">
                    <Trophy size={14} className="text-slate-500 mb-1" />
                    <span className="text-slate-500 font-bold">DIFFICULTY</span>
                    <span className="text-white font-black mt-0.5">{experience.difficulty}</span>
                  </div>
                </div>

                {/* Collapse-by-default How to Play and Science panel */}
                <div className="w-full mb-6">
                  <button
                    onClick={() => setShowInstructions((prev) => !prev)}
                    className="flex items-center justify-center gap-1.5 mx-auto py-2 px-4 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono font-bold text-slate-300 transition-all cursor-pointer"
                  >
                    <HelpCircle size={13} className="text-indigo-400 animate-pulse" />
                    <span>{showInstructions ? '📖 Hide Instructions' : '📖 Read How to Play & Science'}</span>
                  </button>

                  <AnimatePresence>
                    {showInstructions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4 text-left font-mono"
                      >
                        <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-4 text-xs">
                          <div>
                            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block mb-1">🎮 How to Interact</span>
                            <p className="text-slate-400 leading-relaxed text-[11px]">{experience.howToPlay}</p>
                          </div>
                          <div className="border-t border-slate-800/60 pt-3">
                            <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block mb-1.5 flex items-center gap-1">
                              <GraduationCap size={13} />
                              Scientific & Logical Outcomes
                            </span>
                            <ul className="flex flex-col gap-1.5">
                              {experience.learningOutcomes.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                                  <CheckCircle size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Massive Pulsing Launch Button */}
                <button
                  onClick={() => {
                    resetHud();
                    setIsPlaying(true);
                    setShowInstructions(false);
                  }}
                  className="w-full max-w-sm flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-lg shadow-cyan-600/10 animate-pulse"
                >
                  <Play size={14} className="fill-white" />
                  START PLAYING
                </button>
              </motion.div>

            ) : (

              /* ACTIVE GAMEPLAY SCREEN */
              <motion.div
                key="active-game"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-4 z-20 overflow-hidden"
              >
                {/* Mid-game Instructions Overlay panel */}
                <AnimatePresence>
                  {showInstructions && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-16 left-1/2 -translate-x-1/2 max-w-md w-[90%] bg-slate-900/95 border border-indigo-500/40 p-4 rounded-2xl shadow-2xl z-40 text-left font-mono text-[11px] text-slate-300"
                    >
                      <h3 className="text-xs font-black text-white uppercase tracking-tight mb-2 flex items-center justify-between">
                        <span>HOW TO PLAY & CONTROLS</span>
                        <button
                          onClick={() => setShowInstructions(false)}
                          className="text-slate-500 hover:text-white cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </h3>
                      <p className="leading-relaxed bg-slate-950 p-2.5 rounded-xl mb-3 border border-slate-800 text-[10px]">
                        {experience.howToPlay}
                      </p>
                      <div className="border-t border-slate-800/60 pt-2">
                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">🎓 Educational Outcomes:</span>
                        <ul className="flex flex-col gap-1 text-[10px] text-slate-400">
                          {experience.learningOutcomes.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <CheckCircle size={10} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* COMPACT RESPONSIVE HUD (2-ROW GRID ON MOBILE, SINGLE ROW ON DESKTOP) */}
                <div className="w-full select-none bg-slate-900/90 border border-slate-800/60 p-2 sm:px-6 sm:py-2 rounded-xl sm:rounded-2xl grid grid-cols-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-1.5 sm:gap-4 font-mono text-[10px] sm:text-xs text-slate-400 shadow-xl shrink-0">
                  {/* Score */}
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-[8px] sm:text-[9px] text-cyan-500/80 font-black tracking-wider leading-none">SCORE</span>
                    <span className="text-xs sm:text-lg font-black text-cyan-400 tracking-wider mt-0.5">
                      {hud.score}
                    </span>
                  </div>

                  {/* Best Score */}
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-[8px] sm:text-[9px] text-amber-500/80 font-black tracking-wider leading-none">BEST</span>
                    <span className="text-xs sm:text-lg font-black text-amber-400 tracking-wider mt-0.5">
                      {hud.highScore !== null ? hud.highScore : '-'}
                    </span>
                  </div>

                  {/* Lives */}
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-[8px] sm:text-[9px] text-rose-500/80 font-black tracking-wider leading-none">LIVES</span>
                    <div className="flex items-center gap-0.5 text-rose-500 text-xs mt-0.5 font-bold">
                      {hud.lives !== null ? (
                        hud.lives <= 4 ? (
                          Array.from({ length: Math.max(0, hud.lives) }).map((_, idx) => (
                            <Heart key={idx} size={9} className="fill-rose-500 text-rose-500 shrink-0" />
                          ))
                        ) : (
                          `❤️×${hud.lives}`
                        )
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-[8px] sm:text-[9px] text-indigo-500/80 font-black tracking-wider leading-none">TIME</span>
                    <span className="text-xs sm:text-lg font-black text-indigo-400 tracking-wider mt-0.5">
                      {hud.timer !== null ? `${hud.timer}s` : '-'}
                    </span>
                  </div>

                  {/* Combo */}
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-[8px] sm:text-[9px] text-yellow-500/80 font-black tracking-wider leading-none">COMBO</span>
                    <span className="text-xs sm:text-lg font-black text-yellow-400 tracking-wider mt-0.5">
                      {hud.combo !== null && hud.combo > 0 ? `${hud.combo}x` : '-'}
                    </span>
                  </div>

                  {/* Multiplier */}
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-[8px] sm:text-[9px] text-pink-500/80 font-black tracking-wider leading-none">MULTI</span>
                    <span className="text-xs sm:text-lg font-black text-pink-400 tracking-wider mt-0.5">
                      {hud.multiplier !== null && hud.multiplier > 1 ? `x${hud.multiplier}` : '-'}
                    </span>
                  </div>

                  {/* Level */}
                  <div className="flex flex-col items-center sm:items-start col-span-2 sm:col-span-1">
                    <span className="text-[8px] sm:text-[9px] text-emerald-500/80 font-black tracking-wider leading-none">LEVEL</span>
                    <span className="text-xs sm:text-lg font-black text-emerald-400 tracking-wider mt-0.5">
                      {hud.level !== null ? `Lv.${hud.level}` : '-'}
                    </span>
                  </div>
                </div>

                {/* THE ARCADE CABINET CANVAS MONITOR GRID - FLEX EXPANSIBLE HEIGHT */}
                <div className="relative w-full flex-1 min-h-0 flex items-center justify-center bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                  
                  {/* Subtle Scanline Overlay to give retro cabinet CRT feel */}
                  <div className="absolute inset-0 bg-scanlines pointer-events-none z-10 opacity-[0.03]" />

                  {/* Interactive Game component mounts here */}
                  <div className="w-full h-full p-1">
                    <InteractiveMiniToys 
                      experienceId={experience.id} 
                      onClose={onClose}
                      onSelectExperience={onSelectExperience}
                    />
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </main>

        {/* FOOTER STATS TICKER - CONDENSED FOR MOBILE */}
        <footer className="relative z-30 w-full px-4 py-1.5 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider shrink-0">
          <span>SYSTEM INGRESS: ACTIVE</span>
          <span className="text-center hidden sm:block">Designed with fluid typography & physics canvas</span>
          <span>© PlaySprint Arcade Platform</span>
        </footer>

      </div>
    </AnimatePresence>
  );
};
