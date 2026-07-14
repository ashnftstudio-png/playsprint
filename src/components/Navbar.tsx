/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Terminal, Compass, Layers } from 'lucide-react';

export const Navbar: React.FC = () => {
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-900/80 bg-slate-950/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex cursor-pointer items-center gap-2.5 group transition-all"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/15 group-hover:scale-105 transition-all duration-300">
            <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-base font-extrabold tracking-tight text-white bg-clip-text">
              PlaySprint
            </span>
            <span className="text-[9px] font-mono tracking-widest text-indigo-400 uppercase leading-none">
              Play. Explore. Discover
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <button 
            onClick={() => handleScroll('featured-section')}
            className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"
          >
            <Compass size={13} />
            Featured
          </button>
          <button 
            onClick={() => handleScroll('categories-section')}
            className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"
          >
            <Layers size={13} />
            Categories
          </button>
          <button 
            onClick={() => handleScroll('experiences-grid')}
            className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"
          >
            <Terminal size={13} />
            Sandbox Lab
          </button>
        </div>

        {/* Live Indicator Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-mono text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>LIVE OPERATIONAL</span>
          </div>
        </div>

      </div>
    </nav>
  );
};
