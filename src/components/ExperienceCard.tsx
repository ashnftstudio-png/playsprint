/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Flame, Star, Clock, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { Experience } from '../types';
import { GameThumbnail } from './GameThumbnail';

interface ExperienceCardProps {
  experience: Experience;
  onSelect: (experience: Experience) => void;
}

export const getColorClasses = (color: string) => {
  switch (color) {
    case 'indigo':
      return {
        text: 'text-indigo-400',
        bg: 'bg-indigo-500/5',
        border: 'border-indigo-500/10 hover:border-indigo-500/30',
        glow: 'shadow-indigo-500/5 group-hover:shadow-indigo-500/10',
        badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
        gradient: 'from-indigo-500/10 via-transparent to-transparent',
        accentGlow: 'bg-indigo-500/15'
      };
    case 'emerald':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/5',
        border: 'border-emerald-500/10 hover:border-emerald-500/30',
        glow: 'shadow-emerald-500/5 group-hover:shadow-emerald-500/10',
        badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        gradient: 'from-emerald-500/10 via-transparent to-transparent',
        accentGlow: 'bg-emerald-500/15'
      };
    case 'amber':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/5',
        border: 'border-amber-500/10 hover:border-amber-500/30',
        glow: 'shadow-amber-500/5 group-hover:shadow-amber-500/10',
        badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        gradient: 'from-amber-500/10 via-transparent to-transparent',
        accentGlow: 'bg-amber-500/15'
      };
    case 'rose':
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/5',
        border: 'border-rose-500/10 hover:border-rose-500/30',
        glow: 'shadow-rose-500/5 group-hover:shadow-rose-500/10',
        badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
        gradient: 'from-rose-500/10 via-transparent to-transparent',
        accentGlow: 'bg-rose-500/15'
      };
    case 'cyan':
      return {
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/5',
        border: 'border-cyan-500/10 hover:border-cyan-500/30',
        glow: 'shadow-cyan-500/5 group-hover:shadow-cyan-500/10',
        badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
        gradient: 'from-cyan-500/10 via-transparent to-transparent',
        accentGlow: 'bg-cyan-500/15'
      };
    case 'violet':
      return {
        text: 'text-violet-400',
        bg: 'bg-violet-500/5',
        border: 'border-violet-500/10 hover:border-violet-500/30',
        glow: 'shadow-violet-500/5 group-hover:shadow-violet-500/10',
        badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
        gradient: 'from-violet-500/10 via-transparent to-transparent',
        accentGlow: 'bg-violet-500/15'
      };
    case 'teal':
      return {
        text: 'text-teal-400',
        bg: 'bg-teal-500/5',
        border: 'border-teal-500/10 hover:border-teal-500/30',
        glow: 'shadow-teal-500/5 group-hover:shadow-teal-500/10',
        badge: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
        gradient: 'from-teal-500/10 via-transparent to-transparent',
        accentGlow: 'bg-teal-500/15'
      };
    case 'fuchsia':
      return {
        text: 'text-fuchsia-400',
        bg: 'bg-fuchsia-500/5',
        border: 'border-fuchsia-500/10 hover:border-fuchsia-500/30',
        glow: 'shadow-fuchsia-500/5 group-hover:shadow-fuchsia-500/10',
        badge: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
        gradient: 'from-fuchsia-500/10 via-transparent to-transparent',
        accentGlow: 'bg-fuchsia-500/15'
      };
    case 'sky':
      return {
        text: 'text-sky-400',
        bg: 'bg-sky-500/5',
        border: 'border-sky-500/10 hover:border-sky-500/30',
        glow: 'shadow-sky-500/5 group-hover:shadow-sky-500/10',
        badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
        gradient: 'from-sky-500/10 via-transparent to-transparent',
        accentGlow: 'bg-sky-500/15'
      };
    case 'orange':
      return {
        text: 'text-orange-400',
        bg: 'bg-orange-500/5',
        border: 'border-orange-500/10 hover:border-orange-500/30',
        glow: 'shadow-orange-500/5 group-hover:shadow-orange-500/10',
        badge: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
        gradient: 'from-orange-500/10 via-transparent to-transparent',
        accentGlow: 'bg-orange-500/15'
      };
    default:
      return {
        text: 'text-indigo-400',
        bg: 'bg-indigo-500/5',
        border: 'border-indigo-500/10 hover:border-indigo-500/30',
        glow: 'shadow-indigo-500/5 group-hover:shadow-indigo-500/10',
        badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
        gradient: 'from-indigo-500/10 via-transparent to-transparent',
        accentGlow: 'bg-indigo-500/15'
      };
  }
};

const getExperienceTagline = (id: string): string => {
  switch (id) {
    case 'reaction-rush':
      return 'Test your true human reaction speed!';
    case 'one-second-challenge':
      return 'Stop the clock at precisely 1.000s!';
    case 'color-panic':
      return 'Tap the color, NOT the word!';
    case 'catch-the-dot':
      return 'Tap the glowing dot before it teleports.';
    case 'lucky-button':
      return 'Press the glowing button for random surprises!';
    case 'dont-press-the-red-button':
      return 'Can you resist pressing the forbidden button?';
    case 'gravity-lab':
      return 'Create stars and control orbits of light.';
    case 'infinite-machine':
      return 'Connect spinning wheels to build a machine.';
    case 'time-warp':
      return 'Slow down or speed up time itself.';
    case 'planet-creator':
      return 'Design your very own custom worlds.';
    case 'light-playground':
      return 'Direct beams of light with simple mirrors.';
    case 'pixel-universe':
      return 'Watch colorful pixels grow and form patterns.';
    case 'decision-reactor':
      return 'Drop glowing marbles and watch them fall.';
    case 'color-lab':
      return 'Mix beautiful colors and make custom palettes.';
    case 'shadow-explorer':
      return 'Move objects to cast beautiful soft shadows.';
    case 'random-reality':
      return 'Create beautiful artwork with flowing paint.';
    default:
      return 'Tap to begin this interactive experience.';
  }
};

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const classes = getColorClasses(experience.themeColor);
  const tagline = getExperienceTagline(experience.id);

  return (
    <div 
      onClick={() => onSelect(experience)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-slate-950/40 p-5 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl cursor-pointer ${classes.border} ${classes.glow}`}
    >
      
      {/* Accent Background Gradient Flare */}
      <div className={`absolute top-0 left-0 h-28 w-full bg-gradient-to-b opacity-[0.07] group-hover:opacity-[0.14] transition-opacity duration-300 ${classes.gradient}`} />

      <div>
        
        {/* Live Animated Procedural Thumbnail */}
        <div className="relative mb-4 flex h-24 w-full items-center justify-center rounded-xl border border-slate-900 bg-slate-950 overflow-hidden">
          {/* Subtle moving particles in cards (styled via modern CSS) */}
          <div className={`absolute h-8 w-8 rounded-full blur-[22px] transition-all duration-500 group-hover:scale-150 ${classes.accentGlow}`} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,rgba(255,255,255,0.01),transparent)]" />
          
          {/* Live procedural simulation rendering representing the exact game */}
          <GameThumbnail 
            experienceId={experience.id} 
            themeColor={experience.themeColor} 
            isHovered={isHovered} 
          />

          {/* Semi-transparent protective scrim and dynamic tag overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent pt-6 pb-1 px-2.5 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-black font-mono tracking-widest text-slate-400 select-none uppercase truncate max-w-[130px]">
              {experience.title}
            </span>
            <span className="text-[9px] font-bold font-mono tracking-wider text-slate-500 uppercase bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800/40">
              {experience.difficulty}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-sans text-base font-bold text-white tracking-tight group-hover:text-slate-100 transition-colors">
          {experience.title}
        </h3>
        
        {/* Short Tagline */}
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed font-normal">
          {tagline}
        </p>
      </div>

      {/* Card Footer Play trigger */}
      <div className="mt-5 flex items-center justify-end border-t border-slate-900/40 pt-3">
        {/* Play Button */}
        <div className="flex h-8 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold bg-slate-900 group-hover:bg-white text-slate-300 group-hover:text-slate-950 transition-all duration-300">
          <span>Play</span>
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

    </div>
  );
};
