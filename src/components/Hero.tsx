/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Search, X, Compass, Flame, Sparkles } from 'lucide-react';

interface HeroProps {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchText,
  setSearchText,
  selectedTag,
  setSelectedTag,
}) => {
  const trendingTags = ['Physics', 'Optics', 'Cosmos', 'Chaos', 'Design', 'Logic'];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);

    // Node state definitions
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const colors = ['rgba(129, 140, 248, 0.45)', 'rgba(167, 139, 250, 0.45)', 'rgba(236, 72, 153, 0.45)'];
    const nodeCount = Math.min(25, Math.floor((width * height) / 18000) + 10);

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.lineWidth = 0.55;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.12 * (1 - dist / 110)})`;
            ctx.stroke();
          }
        }
      }

      // Draw floating nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = n.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(draw);
    };

    // Use IntersectionObserver to stop calculations when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            draw();
          } else {
            cancelAnimationFrame(animationId);
          }
        });
      },
      { threshold: 0.01 }
    );

    observer.observe(canvas);

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag('');
      setSearchText('');
    } else {
      setSelectedTag(tag);
      setSearchText(tag);
    }
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 py-16 sm:py-24 border-b border-slate-900/40">
      {/* Premium Animated Cyber Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 -z-10 h-full w-full opacity-40 mix-blend-screen pointer-events-none"
      />

      {/* Premium Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 -z-20 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 -z-20 h-[350px] w-[500px] translate-x-1/2 rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        
        {/* Animated Badge */}
        <div className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-xs font-mono text-indigo-300">
          <Sparkles size={11} className="text-indigo-400" />
          <span>Interactive Sandbox Engine v1.0</span>
        </div>

        {/* Display Typography */}
        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Play. Explore.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Discover.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-slate-400 leading-relaxed">
          Welcome to <span className="text-white font-semibold">PlaySprint</span>, a curated sanctuary of tactile browser-based physics simulators, optical toys, and logic generators. Designed for curious minds.
        </p>

        {/* Search Console Input */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5 shadow-2xl backdrop-blur-sm transition-all focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/15">
            <div className="flex items-center">
              <Search className="ml-3 h-5 w-5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search exoplanets, physics, logic engines..."
                className="w-full bg-transparent py-2.5 pl-3 pr-10 text-sm text-white placeholder-slate-500 outline-none"
              />
              {searchText && (
                <button
                  onClick={() => {
                    setSearchText('');
                    setSelectedTag('');
                  }}
                  className="mr-2 p-1 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Search Tags */}
          <div className="mt-4 flex flex-wrap justify-center items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1 mr-1 text-[10px] uppercase tracking-wider text-slate-600">
              <Flame size={11} /> Trending Tech:
            </span>
            {trendingTags.map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`rounded-lg px-2.5 py-1 transition-all duration-200 border ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40 font-semibold'
                      : 'bg-slate-900/40 text-slate-400 border-slate-900 hover:text-white hover:border-slate-800'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
