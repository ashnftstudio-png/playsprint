/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  Flame, 
  Compass, 
  Eye, 
  Sliders, 
  RefreshCw, 
  Check, 
  Copy,
  Info,
  Layers,
  Zap,
  Globe,
  Share2,
  History,
  Timer,
  Trophy,
  Star
} from 'lucide-react';
import { gamePlatform, useGamePlatform } from '../lib/gamePlatform';
import { SharedGameOverScreen } from './SharedGameOverScreen';
import { EXPERIENCES } from '../data/experiences';
import { FindTheFakeEmojiToy } from './FindTheFakeEmojiToy';
import { ChainReactionToy } from './ChainReactionToy';
import { ShapeSwitchToy } from './ShapeSwitchToy';
import { PerfectTimingToy } from './PerfectTimingToy';
import { GravityEscapeToy } from './GravityEscapeToy';
import { LaserMazeToy } from './LaserMazeToy';

interface MiniToyProps {
  experienceId: string;
  onClose?: () => void;
  onSelectExperience?: (exp: any | null) => void;
}

// -----------------------------------------------------------------
// 1. GRAVITY LAB MINI TOY
// -----------------------------------------------------------------
const GravityLabToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gravity, setGravity] = useState<number>(0.15);
  const [particlesCount, setParticlesCount] = useState<number>(150);
  const [friction, setFriction] = useState<number>(1.0); // 1.0 = vacuum (no drag), < 1 = atmospheric drag
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hoveredWellIdx, setHoveredWellIdx] = useState<number | null>(null);

  // Core attractors list state. Each attractor has { id, x, y, mass, radius }
  const [attractors, setAttractors] = useState<{ id: string; x: number; y: number; mass: number; radius: number }[]>([
    { id: 'initial-well', x: 250, y: 180, mass: 2000, radius: 15 }
  ]);

  // Dimensions ref & state for high-definition responsive drawing
  const [dimensions, setDimensions] = useState({ width: 500, height: 360 });
  const dimensionsRef = useRef(dimensions);
  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; size: number }[]>([]);

  // Helper: Generate a single particle with stable tangential orbit if attractors exist
  const generateOneParticle = (
    w: number,
    h: number,
    wells: typeof attractors,
    colorPalette: string[]
  ) => {
    const colors = colorPalette || ['#00f2fe', '#f35588', '#fffb54', '#a254ff', '#05dfd7', '#ff2e93'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 0.8 + Math.random() * 2;

    if (wells.length > 0) {
      // Choose a random well to orbit
      const well = wells[Math.floor(Math.random() * wells.length)];
      
      // Orbiting parameters
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 150;
      const px = well.x + Math.cos(angle) * radius;
      const py = well.y + Math.sin(angle) * radius;

      // Tangential orbital velocity: v = sqrt(G * M / r)
      const baseG = gravity;
      const speed = Math.sqrt((baseG * well.mass) / radius) * (0.8 + Math.random() * 0.4);

      // Direction: perpendicular to the angle vector
      const vx = -Math.sin(angle) * speed;
      const vy = Math.cos(angle) * speed;

      return { x: px, y: py, vx, vy, color, size };
    } else {
      // Spawn completely random floating dust
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        color,
        size
      };
    }
  };

  // Update particles array when target count changes
  useEffect(() => {
    const target = particlesCount;
    const current = particlesRef.current.length;
    const colors = ['#00f2fe', '#f35588', '#fffb54', '#a254ff', '#05dfd7', '#ff2e93'];

    if (current < target) {
      // Spawn more
      const needed = target - current;
      for (let i = 0; i < needed; i++) {
        particlesRef.current.push(generateOneParticle(dimensions.width, dimensions.height, attractors, colors));
      }
    } else if (current > target) {
      // Prune excess
      particlesRef.current = particlesRef.current.slice(0, target);
    }
  }, [particlesCount, dimensions, attractors]);

  // Setup ResizeObserver to adjust container width automatically
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const finalWidth = width > 0 ? Math.floor(width) : 500;
        setDimensions({
          width: finalWidth,
          height: 360
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Main Canvas Animation and Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Draw spacetime warped fabric grid
    const drawSpacetimeGrid = (width: number, height: number, wells: typeof attractors) => {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1;
      const step = 25;

      // Draw horizontal lines with spacetime well distortions
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
          let dy_disp = 0;
          let dx_disp = 0;
          
          wells.forEach((well) => {
            const dx = well.x - x;
            const dy = well.y - y;
            const distSq = dx * dx + dy * dy + 1600;
            const dist = Math.sqrt(distSq);
            // Distortion pull proportional to mass
            const pull = (well.mass * 0.12) / dist;
            dx_disp += (dx / dist) * pull;
            dy_disp += (dy / dist) * pull;
          });

          if (x === 0) {
            ctx.moveTo(x + dx_disp, y + dy_disp);
          } else {
            ctx.lineTo(x + dx_disp, y + dy_disp);
          }
        }
        ctx.stroke();
      }

      // Draw vertical lines with distortions
      for (let x = step; x < width; x += step) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 10) {
          let dy_disp = 0;
          let dx_disp = 0;

          wells.forEach((well) => {
            const dx = well.x - x;
            const dy = well.y - y;
            const distSq = dx * dx + dy * dy + 1600;
            const dist = Math.sqrt(distSq);
            const pull = (well.mass * 0.12) / dist;
            dx_disp += (dx / dist) * pull;
            dy_disp += (dy / dist) * pull;
          });

          if (y === 0) {
            ctx.moveTo(x + dx_disp, y + dy_disp);
          } else {
            ctx.lineTo(x + dx_disp, y + dy_disp);
          }
        }
        ctx.stroke();
      }
    };

    const runFrame = () => {
      const { width, height } = dimensionsRef.current;
      
      // Clear canvas with deep space trailing effect
      ctx.fillStyle = 'rgba(8, 8, 16, 0.2)'; 
      ctx.fillRect(0, 0, width, height);

      // 1. Draw relativistic warped grids
      drawSpacetimeGrid(width, height, attractors);

      // 2. Draw Orbit / Attraction Range rings around hovered wells
      if (hoveredWellIdx !== null && attractors[hoveredWellIdx]) {
        const well = attractors[hoveredWellIdx];
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(well.x, well.y, 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Tap to remove indicator tooltip
        ctx.fillStyle = '#ef4444';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TAP WELL TO REMOVE', well.x, well.y - well.radius - 8);
      }

      // 3. Update and draw glowing dust particles
      const particles = particlesRef.current;
      particles.forEach((p) => {
        if (!isPaused) {
          let ax = 0;
          let ay = 0;

          // Compute Keplerian gravitational pull from each well
          attractors.forEach((well) => {
            const dx = well.x - p.x;
            const dy = well.y - p.y;
            const distSq = dx * dx + dy * dy + 400; // soft factor to prevent infinite slingshots
            const dist = Math.sqrt(distSq);

            // G * M / r^2
            const force = (gravity * well.mass) / distSq;
            ax += (dx / dist) * force;
            ay += (dy / dist) * force;
          });

          // Accelerate particle
          p.vx += ax;
          p.vy += ay;

          // Apply user-controlled atmospheric friction drag
          p.vx *= friction;
          p.vy *= friction;

          // Impose a sensible speed limit to ensure realistic orbit visualization
          const speedSq = p.vx * p.vx + p.vy * p.vy;
          const maxSpeed = 12;
          if (speedSq > maxSpeed * maxSpeed) {
            const speed = Math.sqrt(speedSq);
            p.vx = (p.vx / speed) * maxSpeed;
            p.vy = (p.vy / speed) * maxSpeed;
          }

          // Advance coordinate vectors
          p.x += p.vx;
          p.y += p.vy;

          // Boundary wrapping/pullback
          const pad = 80;
          if (p.x < -pad) p.x = width + pad;
          if (p.x > width + pad) p.x = -pad;
          if (p.y < -pad) p.y = height + pad;
          if (p.y > height + pad) p.y = -pad;
        }

        // Render particle with gorgeous glow structure
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Render tiny outer glow for premium aesthetic
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 4. Draw massive gravity wells
      attractors.forEach((well, idx) => {
        // Multi-layered pulsing visual effect
        const pulse = 1 + Math.sin(Date.now() * 0.003 + idx) * 0.12;
        const currentRadius = well.radius * pulse;

        // Gravity well outer accretion halo
        const outerGlow = ctx.createRadialGradient(well.x, well.y, currentRadius * 0.2, well.x, well.y, currentRadius * 2.5);
        if (hoveredWellIdx === idx) {
          outerGlow.addColorStop(0, '#ef4444');
          outerGlow.addColorStop(0.3, 'rgba(239, 68, 68, 0.4)');
          outerGlow.addColorStop(0.7, 'rgba(239, 68, 68, 0.1)');
          outerGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else {
          outerGlow.addColorStop(0, '#ffffff');
          outerGlow.addColorStop(0.2, 'rgba(129, 140, 248, 0.75)');
          outerGlow.addColorStop(0.5, 'rgba(79, 70, 229, 0.35)');
          outerGlow.addColorStop(1, 'rgba(79, 70, 229, 0)');
        }

        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(well.x, well.y, currentRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Event Horizon center body
        ctx.fillStyle = hoveredWellIdx === idx ? '#ef4444' : '#1e1b4b';
        ctx.strokeStyle = hoveredWellIdx === idx ? '#f87171' : '#818cf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(well.x, well.y, currentRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Singularity core bead
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(well.x, well.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Show spacetime instructions if no wells are placed
      if (attractors.length === 0) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '11px font-mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VACUUM STATE: TAP ANYWHERE TO INJECT A GRAVITY WELL', width / 2, height / 2);
      }

      animId = requestAnimationFrame(runFrame);
    };

    runFrame();

    return () => cancelAnimationFrame(animId);
  }, [gravity, attractors, friction, isPaused, hoveredWellIdx]);

  // Handle tap or click interaction to place/remove gravity wells
  const handleInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Scale client coordinate offsets to the internal canvas viewport sizing
    const x = ((clientX - rect.left) / rect.width) * dimensions.width;
    const y = ((clientY - rect.top) / rect.height) * dimensions.height;

    // Detect if clicking on an existing well to trigger removal
    const clickedWellIdx = attractors.findIndex((well) => {
      const dist = Math.hypot(well.x - x, well.y - y);
      return dist <= well.radius + 15; // with a generous clickable padding
    });

    if (clickedWellIdx !== -1) {
      // Remove clicked well
      setAttractors(attractors.filter((_, idx) => idx !== clickedWellIdx));
      setHoveredWellIdx(null);
    } else {
      // Add multiple gravity wells (limit up to 8 max bodies to prevent physics overload)
      if (attractors.length < 8) {
        const newWell = {
          id: `well-${Date.now()}-${Math.random()}`,
          x,
          y,
          mass: 1500 + Math.random() * 1000,
          radius: 12 + Math.random() * 6
        };
        setAttractors([...attractors, newWell]);
      }
    }
  };

  // Hover detection to highlight existing wells
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * dimensions.width;
    const y = ((e.clientY - rect.top) / rect.height) * dimensions.height;

    const idx = attractors.findIndex((well) => {
      const dist = Math.hypot(well.x - x, well.y - y);
      return dist <= well.radius + 15;
    });

    setHoveredWellIdx(idx !== -1 ? idx : null);
  };

  const handleMouseLeave = () => {
    setHoveredWellIdx(null);
  };

  // Manual burst particle injector
  const injectParticleBurst = () => {
    const colors = ['#00f2fe', '#f35588', '#fffb54', '#a254ff', '#05dfd7', '#ff2e93'];
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push(generateOneParticle(dimensions.width, dimensions.height, attractors, colors));
    }
    setParticlesCount(particlesRef.current.length);
  };

  const resetSimulation = () => {
    // Standard starting point: 1 center well with stable orbiting cloud
    const defaultWell = { id: 'initial-well', x: dimensions.width / 2 || 250, y: dimensions.height / 2 || 180, mass: 2000, radius: 15 };
    setAttractors([defaultWell]);
    setGravity(0.15);
    setFriction(1.0);
    setIsPaused(false);
    setHoveredWellIdx(null);
    
    // Clear particles and re-initialize orbiting layout
    const colors = ['#00f2fe', '#f35588', '#fffb54', '#a254ff', '#05dfd7', '#ff2e93'];
    particlesRef.current = [];
    for (let i = 0; i < particlesCount; i++) {
      particlesRef.current.push(generateOneParticle(dimensions.width, dimensions.height, [defaultWell], colors));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 60 FPS Tactile Vacuum Sandbox chamber */}
      <div 
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border border-indigo-500/20 bg-slate-950/80 group-hover:border-indigo-500/40 transition-colors duration-300 shadow-2xl"
      >
        <canvas 
          ref={canvasRef} 
          width={dimensions.width} 
          height={dimensions.height} 
          onClick={(e) => handleInteraction(e.clientX, e.clientY)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={(e) => {
            if (e.touches[0]) {
              handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className="w-full h-[360px] cursor-crosshair block bg-slate-950"
        />
        
        {/* Realtime Status HUD */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none select-none">
          <div className="bg-slate-900/95 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-indigo-400 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span>SIMULATION: {isPaused ? 'PAUSED' : '60FPS ACTIVE'}</span>
          </div>
          <div className="bg-slate-900/95 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-300">
            WELLS: {attractors.length}/8
          </div>
          <div className="bg-slate-900/95 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-300">
            PARTICLES: {particlesRef.current.length}
          </div>
        </div>

        {/* Tactile Mode instruction card */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-400 pointer-events-none max-w-[240px] leading-tight">
          💡 <span className="text-white font-medium">Tap empty space</span> to place a well. <span className="text-red-400 font-medium">Tap a well</span> to collapse/remove it.
        </div>
      </div>

      {/* Control Console Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        {/* Gravity strength */}
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <Sliders size={12} className="text-indigo-400" /> 
            Gravity Pull
          </span>
          <input 
            type="range" 
            min="0.02" 
            max="0.6" 
            step="0.02"
            value={gravity} 
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-indigo-300">{(gravity * 100).toFixed(0)}x G-Force</span>
        </div>

        {/* Particles density */}
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <Layers size={12} className="text-indigo-400" /> 
            Dust Density
          </span>
          <input 
            type="range" 
            min="20" 
            max="400" 
            step="10"
            value={particlesCount} 
            onChange={(e) => setParticlesCount(parseInt(e.target.value))}
            className="accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-indigo-300">{particlesCount} dust bodies</span>
        </div>

        {/* Orbit Decay / friction */}
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <RefreshCw size={12} className="text-indigo-400" /> 
            Atmosphere Drag
          </span>
          <input 
            type="range" 
            min="0.98" 
            max="1.0" 
            step="0.001"
            value={friction} 
            onChange={(e) => setFriction(parseFloat(e.target.value))}
            className="accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-indigo-300">
            {friction === 1.0 ? 'Perfect Vacuum (0%)' : `${((1.0 - friction) * 1000).toFixed(1)}% air resistance`}
          </span>
        </div>
      </div>

      {/* Button Console */}
      <div className="flex flex-wrap gap-2 justify-between items-center bg-slate-900/20 p-3 border border-slate-800/60 rounded-xl">
        <div className="flex gap-2">
          {/* Pause/Resume simulation button */}
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isPaused ? 'bg-indigo-500 text-slate-950 hover:bg-indigo-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            {isPaused ? <Play size={12} className="fill-current" /> : <Pause size={12} className="fill-current" />}
            {isPaused ? 'Resume Physics' : 'Pause'}
          </button>

          {/* Spawn 50 Dust particles */}
          <button 
            onClick={injectParticleBurst}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-indigo-400 transition-colors"
          >
            <Sparkles size={12} /> Inject +50 Dust
          </button>

          {/* Clear Wells */}
          <button 
            onClick={() => setAttractors([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-red-400 transition-colors"
            title="Clear all gravity wells"
          >
            Collapse All Wells
          </button>
        </div>

        {/* Reset button */}
        <button 
          onClick={resetSimulation}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 transition-colors hover:border-slate-700"
        >
          <RotateCcw size={12} /> Reset System
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 2. INFINITE MACHINE MINI TOY
// -----------------------------------------------------------------
const InfiniteMachineToy: React.FC = () => {
  const [speed, setSpeed] = useState<number>(1);
  const [connectedGears, setConnectedGears] = useState<number>(3);
  const animationRef = useRef<number | null>(null);
  const angleRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGear = (cx: number, cy: number, radius: number, teeth: number, angle: number, color: string) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Draw core circle
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(15, 15, 25, 0.9)';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw gear teeth
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const theta = (i * Math.PI * 2) / teeth;
        const outerX = Math.cos(theta) * (radius + 6);
        const outerY = Math.sin(theta) * (radius + 6);
        const innerX1 = Math.cos(theta - 0.08) * radius;
        const innerY1 = Math.sin(theta - 0.08) * radius;
        const innerX2 = Math.cos(theta + 0.08) * radius;
        const innerY2 = Math.sin(theta + 0.08) * radius;

        if (i === 0) {
          ctx.moveTo(innerX1, innerY1);
        } else {
          ctx.lineTo(innerX1, innerY1);
        }
        ctx.lineTo(outerX - (outerX - innerX1) * 0.2, outerY - (outerY - innerY1) * 0.2);
        ctx.lineTo(outerX - (outerX - innerX2) * 0.2, outerY - (outerY - innerY2) * 0.2);
        ctx.lineTo(innerX2, innerY2);
      }
      ctx.closePath();
      ctx.fill();

      // Inner details
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      // Spokes
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      for (let j = 0; j < 4; j++) {
        const spokeAngle = (j * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(spokeAngle) * (radius - 5), Math.sin(spokeAngle) * (radius - 5));
        ctx.stroke();
      }

      // Center shaft
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const tick = () => {
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.04)';
      for (let i = 20; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      angleRef.current += 0.015 * speed;

      // Draw 3 primary gears, or more based on state
      // Gear 1 (Primary driver)
      const gear1X = 110;
      const gear1Y = 130;
      const r1 = 45;
      const teeth1 = 18;
      drawGear(gear1X, gear1Y, r1, teeth1, angleRef.current, '#f59e0b');

      // Gear 2 (Interconnected medium)
      const r2 = 30;
      const teeth2 = 12;
      const gear2X = gear1X + r1 + r2 - 1.5;
      const gear2Y = gear1Y;
      // Inverse rotation speed based on teeth ratio
      const angle2 = -angleRef.current * (teeth1 / teeth2) + Math.PI / teeth2;
      drawGear(gear2X, gear2Y, r2, teeth2, angle2, '#fbbf24');

      // Gear 3 (Interconnected small or vertical)
      if (connectedGears >= 3) {
        const r3 = 20;
        const teeth3 = 8;
        const gear3X = gear2X + r2 + r3 - 1.5;
        const gear3Y = gear2Y;
        const angle3 = angleRef.current * (teeth1 / teeth3);
        drawGear(gear3X, gear3Y, r3, teeth3, angle3, '#fef08a');
      }

      // Gear 4 (Sub gear connected vertically)
      if (connectedGears >= 4) {
        const r4 = 25;
        const teeth4 = 10;
        const gear4X = gear2X;
        const gear4Y = gear2Y - r2 - r4 + 1.5;
        const angle4 = -angle2 * (teeth2 / teeth4) + Math.PI / teeth4;
        drawGear(gear4X, gear4Y, r4, teeth4, angle4, '#d97706');
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [speed, connectedGears]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-xl overflow-hidden border border-amber-500/20 bg-slate-950/80">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={260} 
          className="w-full block"
        />
        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-amber-400">
          Transmission Status: ACTIVE
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 flex items-center gap-1"><RefreshCw size={12} /> Drive Velocity</span>
          <input 
            type="range" 
            min="0.2" 
            max="3" 
            step="0.1"
            value={speed} 
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="accent-amber-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-slate-500">{speed.toFixed(1)}x rpm</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 flex items-center gap-1"><Plus size={12} /> Gear Train Depth</span>
          <div className="flex gap-2 mt-1">
            <button 
              onClick={() => setConnectedGears(3)}
              className={`flex-1 py-1 text-[10px] font-semibold rounded ${connectedGears === 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
            >
              3 Gears
            </button>
            <button 
              onClick={() => setConnectedGears(4)}
              className={`flex-1 py-1 text-[10px] font-semibold rounded ${connectedGears === 4 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
            >
              4 Gears
            </button>
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-400">
        Observe how gear size ratios directly dictate proportional rotation speeds and vector directions.
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 3. TIME WARP MINI TOY
// -----------------------------------------------------------------
const TimeWarpToy: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [gravityWave, setGravityWave] = useState<number>(20);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; originalY: number; speed: number; phase: number; length: number }[] = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push({
        x,
        y,
        originalY: y,
        speed: 1.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        length: 15 + Math.random() * 25
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(11, 8, 20, 0.2)'; // deep purple trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw temporal grid distortion
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
      ctx.lineWidth = 1;
      const gridSpacing = 25;
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath();
        for (let y = 0; y < canvas.height; y += 5) {
          // distort grid based on timeScale
          const warp = Math.sin(y * 0.02 + timeRef.current * 0.02) * gravityWave * (1 - timeScale);
          ctx.lineTo(x + warp, y);
        }
        ctx.stroke();
      }

      // Update time clock
      timeRef.current += 1 * timeScale;

      // Draw Particles (Light rays)
      particles.forEach((p) => {
        // Move particle
        p.x += p.speed * timeScale;
        
        // Relativistic wave distortion
        const wave = Math.sin(p.x * 0.015 + p.phase) * (gravityWave * 1.5);
        p.y = p.originalY + wave * (1.1 - timeScale);

        if (p.x > canvas.width) {
          p.x = -p.length;
          p.originalY = Math.random() * canvas.height;
        } else if (p.x < -p.length) {
          p.x = canvas.width;
          p.originalY = Math.random() * canvas.height;
        }

        // Color shifts based on velocity
        let color = '#a78bfa'; // violet base
        if (timeScale > 1.8) {
          color = '#f472b6'; // redshift / blueshift style
        } else if (timeScale < 0.3) {
          color = '#818cf8';
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.length * Math.max(0.1, timeScale), p.y);
        ctx.stroke();

        // Particle head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x + p.length * Math.max(0.1, timeScale), p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central gravity anomaly visual representation
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.beginPath();
      ctx.arc(200, 130, 45 + Math.sin(timeRef.current * 0.02) * 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(139, 92, 246, 0.05)';
      ctx.beginPath();
      ctx.arc(200, 130, 15 + Math.sin(timeRef.current * 0.05) * 2, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [timeScale, gravityWave]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-xl overflow-hidden border border-violet-500/20 bg-slate-950/80">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={260} 
          className="w-full block"
        />
        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-violet-400">
          DILATION FACTOR: {timeScale.toFixed(2)}x
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
          <span className="text-slate-400 flex items-center gap-1"><Sliders size={12} /> Temporal Speed Slider</span>
          <input 
            type="range" 
            min="-0.5" 
            max="2.5" 
            step="0.1"
            value={timeScale} 
            onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            className="accent-violet-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-slate-500">
            {timeScale === 0 ? 'Frozen Time' : timeScale < 0 ? 'Negative Space' : `${timeScale.toFixed(1)}x Speed`}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
          <span className="text-slate-400 flex items-center gap-1"><Zap size={12} /> Gravitational Warp</span>
          <input 
            type="range" 
            min="5" 
            max="50" 
            step="5"
            value={gravityWave} 
            onChange={(e) => setGravityWave(parseInt(e.target.value))}
            className="accent-violet-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-slate-500">{gravityWave} Warp Units</span>
        </div>
      </div>
      <div className="text-xs text-slate-400">
        Slowing down light rays allows you to see quantum wave fluctuations. Accelerating them induces blueshift spectrum.
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 4. PLANET CREATOR MINI TOY
// -----------------------------------------------------------------
const PlanetCreatorToy: React.FC = () => {
  const [atmosphere, setAtmosphere] = useState<number>(65); // percentage
  const [moons, setMoons] = useState<number>(1);
  const [temp, setTemp] = useState<number>(24); // celsius
  const [rings, setRings] = useState<boolean>(true);

  // Calculate habitability rating based on parameters
  // Perfect params: temp around 15-25C, atmosphere 70-80%, rings and moons don't hurt!
  const getHabitability = () => {
    let score = 100;
    
    // Atmosphere penalty
    const diffAtm = Math.abs(atmosphere - 75);
    score -= diffAtm * 0.8;

    // Temp penalty
    const diffTemp = Math.abs(temp - 18);
    score -= diffTemp * 1.2;

    // Moons sweet spot is 1 or 2
    if (moons === 0) score -= 10;
    if (moons === 3) score -= 5;

    return Math.max(2, Math.min(100, Math.round(score)));
  };

  const habitability = getHabitability();

  const getEcosystemName = () => {
    if (habitability > 85) return 'Earth-like Biosphere (Class M)';
    if (temp > 60) return 'Scorched Obsidian desert';
    if (temp < -20) return 'Frozen Cryo-tundra';
    if (atmosphere < 20) return 'Barren Vacuum wasteland';
    if (atmosphere > 85) return 'Dense Greenhouse hyper-giant';
    return 'Marginal Sub-temperate zone';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Interactive Visual Planet representation */}
      <div className="relative rounded-xl overflow-hidden border border-cyan-500/20 bg-slate-950/80 p-6 flex flex-col items-center justify-center min-h-[180px]">
        
        {/* Dynamic Glowing atmosphere layer */}
        <div 
          className="absolute transition-all duration-300 rounded-full flex items-center justify-center"
          style={{
            width: `${100 + atmosphere * 0.4}px`,
            height: `${100 + atmosphere * 0.4}px`,
            background: `radial-gradient(circle, transparent 40%, rgba(34, 211, 238, ${atmosphere * 0.005}) 70%, rgba(34, 211, 238, 0) 100%)`,
            filter: 'blur(3px)',
          }}
        />

        {/* Planet Core Ball */}
        <div 
          className="w-24 h-24 rounded-full relative z-10 transition-all duration-500 overflow-hidden shadow-2xl shadow-cyan-500/10"
          style={{
            background: temp > 40 
              ? 'radial-gradient(circle at 30% 30%, #ef4444 0%, #7f1d1d 60%, #1a0505 100%)' // Hot planet
              : temp < 0
              ? 'radial-gradient(circle at 30% 30%, #e2e8f0 0%, #38bdf8 50%, #0369a1 100%)' // Ice planet
              : 'radial-gradient(circle at 30% 30%, #06b6d4 0%, #0891b2 40%, #0f172a 100%)', // Temperate water world
          }}
        >
          {/* Surface texture detail lines using absolute CSS */}
          <div className="absolute top-4 left-6 w-12 h-6 bg-cyan-400/20 rounded-full blur-[2px] rotate-12" />
          <div className="absolute bottom-6 left-3 w-16 h-8 bg-indigo-500/30 rounded-full blur-[4px] -rotate-6" />
          {temp > 40 && (
            <div className="absolute top-8 left-4 w-6 h-6 bg-yellow-400/30 rounded-full blur-[1px]" />
          )}
        </div>

        {/* Planetary Rings */}
        {rings && (
          <div 
            className="absolute border-[6px] border-cyan-500/10 border-t-cyan-400/40 border-b-cyan-500/20 rounded-full pointer-events-none z-20 transition-all duration-300"
            style={{
              width: '180px',
              height: '42px',
              transform: 'rotate(-15deg)',
            }}
          />
        )}

        {/* Orbiting Moons */}
        {moons > 0 && Array.from({ length: moons }).map((_, idx) => (
          <div 
            key={idx}
            className="absolute border border-slate-800/20 rounded-full pointer-events-none"
            style={{
              width: `${160 + idx * 40}px`,
              height: `${50 + idx * 15}px`,
              transform: 'rotate(10deg)',
            }}
          >
            {/* Spinning Moon sphere wrapper */}
            <div 
              className="w-2 h-2 rounded-full bg-slate-400 absolute"
              style={{
                animation: `spin ${6 + idx * 3}s linear infinite`,
                offsetPath: `ellipse(${(160 + idx * 40)/2}px, ${(50 + idx * 15)/2}px)`,
                offsetRotate: '0deg'
              }}
            />
          </div>
        ))}

        {/* Live Environment readout HUD overlay */}
        <div className="absolute top-3 right-3 text-[10px] font-mono text-cyan-400 bg-slate-900/90 border border-slate-800/80 px-2.5 py-1 rounded-lg flex flex-col gap-0.5">
          <span className="flex items-center gap-1"><Globe size={10} /> HABITABILITY</span>
          <span className="text-sm font-bold text-white">{habitability}%</span>
        </div>

        <div className="absolute bottom-2 left-3 text-[9px] font-mono text-slate-400">
          Ecosystem: <span className="text-cyan-300">{getEcosystemName()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-col gap-1">
          <span className="text-slate-400 flex items-center gap-1"><Sliders size={12} /> Atmosphere Bar</span>
          <input 
            type="range" 
            min="5" 
            max="100" 
            step="5"
            value={atmosphere} 
            onChange={(e) => setAtmosphere(parseInt(e.target.value))}
            className="accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-slate-500">{atmosphere}% density</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-slate-400 flex items-center gap-1"><Flame size={12} /> Core Temperature</span>
          <input 
            type="range" 
            min="-50" 
            max="120" 
            step="2"
            value={temp} 
            onChange={(e) => setTemp(parseInt(e.target.value))}
            className="accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-slate-500">{temp}°C</span>
        </div>

        <div className="flex flex-col gap-1 mt-1.5">
          <span className="text-slate-400">Asteroid Ring</span>
          <button 
            onClick={() => setRings(!rings)}
            className={`py-1 text-[10px] font-semibold rounded transition-colors ${rings ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
          >
            {rings ? 'Ring Enabled' : 'No Rings'}
          </button>
        </div>

        <div className="flex flex-col gap-1 mt-1.5">
          <span className="text-slate-400">Satellites / Moons</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((num) => (
              <button 
                key={num}
                onClick={() => setMoons(num)}
                className={`flex-1 py-1 text-[10px] font-semibold rounded ${moons === num ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 5. LIGHT PLAYGROUND MINI TOY
// -----------------------------------------------------------------
const LightPlaygroundToy: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prismAngle, setPrismAngle] = useState<number>(0);
  const [prismX, setPrismX] = useState<number>(200);
  const [laserY, setLaserY] = useState<number>(130);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawPrism = (x: number, y: number, side: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Draw glass triangular prism
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      const h = side * (Math.sqrt(3) / 2);
      ctx.moveTo(0, -h / 2); // Top vertex
      ctx.lineTo(side / 2, h / 2); // Bottom right
      ctx.lineTo(-side / 2, h / 2); // Bottom left
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      // Background darkroom
      ctx.fillStyle = '#090d0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.03)';
      for (let i = 25; i < canvas.width; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // 1. Draw Laser Source
      ctx.fillStyle = '#10b981';
      ctx.fillRect(10, laserY - 10, 20, 20);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(26, laserY, 3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Calculate Ray intersections
      const laserStartX = 30;
      const laserStartY = laserY;

      // Laser path before hitting prism
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      ctx.moveTo(laserStartX, laserStartY);
      ctx.lineTo(prismX - 10, laserY);
      ctx.stroke();

      // Inside prism refraction line
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(prismX - 10, laserY);
      const internalEndY = laserY + 12 + Math.sin(prismAngle) * 15;
      ctx.lineTo(prismX + 15, internalEndY);
      ctx.stroke();

      // Chromatic Dispersion rainbow output rays from the other side of the prism!
      const outColors = [
        '#ef4444', // Red
        '#f97316', // Orange
        '#eab308', // Yellow
        '#22c55e', // Green
        '#3b82f6', // Blue
        '#8b5cf6'  // Violet
      ];

      ctx.shadowBlur = 10;
      outColors.forEach((color, idx) => {
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.moveTo(prismX + 15, internalEndY);
        // Each wavelength refracts at a slightly different angle (dispersion math)
        const dispersionFactor = 0.04 * (idx - 2.5);
        const finalAngle = prismAngle * 0.4 + dispersionFactor;
        const targetX = canvas.width;
        const targetY = internalEndY + (canvas.width - prismX) * Math.sin(finalAngle) + (idx * 3);
        
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
      });

      // Clear shadow effect for next renderings
      ctx.shadowBlur = 0;

      // 3. Draw Prism
      drawPrism(prismX, laserY + 10, 50, prismAngle);
    };

    render();
  }, [prismAngle, prismX, laserY]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-xl overflow-hidden border border-emerald-500/20 bg-slate-950/80">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={260} 
          className="w-full block"
        />
        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-emerald-400">
          Laser Spectrum Optic Lab
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 flex items-center gap-1"><Sliders size={12} /> Prism Rotation Angle</span>
          <input 
            type="range" 
            min="-1.2" 
            max="1.2" 
            step="0.05"
            value={prismAngle} 
            onChange={(e) => setPrismAngle(parseFloat(e.target.value))}
            className="accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-slate-500">{(prismAngle * (180 / Math.PI)).toFixed(0)}° degrees</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 flex items-center gap-1"><Sliders size={12} /> Emitter Altitude</span>
          <input 
            type="range" 
            min="60" 
            max="200" 
            step="5"
            value={laserY} 
            onChange={(e) => setLaserY(parseInt(e.target.value))}
            className="accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-slate-500">Y-axis: {laserY}px</span>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 6. PIXEL UNIVERSE MINI TOY
// -----------------------------------------------------------------
const PixelUniverseToy: React.FC = () => {
  const size = 15;
  const [grid, setGrid] = useState<boolean[][]>(() => {
    // Start with beautiful glider preset
    const initial = Array(size).fill(null).map(() => Array(size).fill(false));
    initial[3][4] = true;
    initial[4][5] = true;
    initial[5][3] = true;
    initial[5][4] = true;
    initial[5][5] = true;
    return initial;
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const runSimulation = () => {
    if (!isRunningRef.current) return;

    setGrid((g) => {
      const next = g.map((row) => [...row]);
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          let neighbors = 0;
          const dirs = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
          ];
          dirs.forEach(([dr, dc]) => {
            const nr = (r + dr + size) % size;
            const nc = (c + dc + size) % size;
            if (g[nr][nc]) neighbors++;
          });

          if (g[r][c]) {
            if (neighbors < 2 || neighbors > 3) {
              next[r][c] = false; // Undercrowded or overcrowded
            }
          } else {
            if (neighbors === 3) {
              next[r][c] = true; // Reproduction
            }
          }
        }
      }
      return next;
    });

    setTimeout(runSimulation, 300);
  };

  useEffect(() => {
    if (isRunning) {
      runSimulation();
    }
  }, [isRunning]);

  const toggleCell = (r: number, c: number) => {
    const next = grid.map((row, ri) => 
      row.map((cell, ci) => (ri === r && ci === c ? !cell : cell))
    );
    setGrid(next);
  };

  const clearGrid = () => {
    setGrid(Array(size).fill(null).map(() => Array(size).fill(false)));
    setIsRunning(false);
  };

  const randomizeGrid = () => {
    const next = Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => Math.random() > 0.7)
    );
    setGrid(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center bg-slate-950/90 rounded-xl p-4 border border-rose-500/20">
        <div className="grid grid-cols-15 gap-[2px]">
          {grid.map((row, r) => 
            row.map((active, c) => (
              <button 
                key={`${r}-${c}`}
                onClick={() => toggleCell(r, c)}
                className={`w-4 h-4 rounded-sm transition-all duration-150 ${active ? 'bg-rose-500 shadow-sm shadow-rose-500/50 scale-105' : 'bg-slate-900 border border-slate-800/50 hover:bg-slate-800'}`}
              />
            ))
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-800 text-xs font-mono">
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-950 font-semibold transition-colors ${isRunning ? 'bg-amber-500' : 'bg-rose-500'}`}
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} />}
          {isRunning ? 'Halt Matrix' : 'Run Matrix'}
        </button>
        <button 
          onClick={randomizeGrid}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
        >
          <Sparkles size={12} /> Random Seed
        </button>
        <button 
          onClick={clearGrid}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
        >
          <RotateCcw size={12} /> Wipe
        </button>
      </div>
      <div className="text-xs text-slate-400">
        Tap tiles to paint seeds, then click **Run Matrix** to activate cell generation loops.
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 7. DECISION REACTOR MINI TOY
// -----------------------------------------------------------------
const DecisionReactorToy: React.FC = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; settled: boolean; bin?: number }[]>([]);
  const [bins, setBins] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Trigger cascade marble drop
  const dropMarble = () => {
    const id = Date.now() + Math.random();
    const newParticle = {
      id,
      x: 150 + Math.random() * 4,
      y: 10,
      vx: 0,
      vy: 1.5,
      settled: false
    };
    setParticles((prev) => [...prev, newParticle]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        if (prev.length === 0) return prev;
        
        let binsUpdated = false;
        const nextBins = [...bins];

        const updated = prev.map((p) => {
          if (p.settled) return p;

          let nx = p.x + p.vx;
          let ny = p.y + p.vy;
          let nvy = p.vy + 0.15; // Gravity acceleration
          let nvx = p.vx;

          // Pegs rows for collision simulation
          const rows = [
            { y: 50, xs: [75, 125, 175, 225] },
            { y: 90, xs: [50, 100, 150, 200, 250] },
            { y: 130, xs: [75, 125, 175, 225] }
          ];

          rows.forEach((row) => {
            if (Math.abs(ny - row.y) < 6) {
              row.xs.forEach((pegX) => {
                const dx = nx - pegX;
                if (Math.abs(dx) < 8) {
                  // Collision bounce
                  nvy = 1.0;
                  nvx = dx > 0 ? 1.4 + Math.random() * 0.4 : -1.4 - Math.random() * 0.4;
                }
              });
            }
          });

          // Settling in bottom bins
          if (ny >= 195) {
            const binIdx = Math.max(0, Math.min(6, Math.floor(nx / (300 / 7))));
            nextBins[binIdx] += 1;
            binsUpdated = true;
            return { ...p, settled: true, bin: binIdx, y: 195, x: nx };
          }

          return { ...p, x: nx, y: ny, vx: nvx, vy: nvy };
        }).filter((p) => !p.settled); // Filter out settled to keep simulation lightweight

        if (binsUpdated) {
          setBins(nextBins);
        }

        return updated;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [bins]);

  const resetReactor = () => {
    setBins([0, 0, 0, 0, 0, 0, 0]);
    setParticles([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div ref={containerRef} className="relative w-full h-[230px] border border-fuchsia-500/20 bg-slate-950/80 rounded-xl overflow-hidden p-2">
        
        {/* Draw Galton Pegs visually */}
        <div className="absolute top-[50px] left-0 w-full flex justify-around px-8">
          {[1,2,3,4].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-slate-700/80" />)}
        </div>
        <div className="absolute top-[90px] left-0 w-full flex justify-around px-4">
          {[1,2,3,4,5].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-slate-700/80" />)}
        </div>
        <div className="absolute top-[130px] left-0 w-full flex justify-around px-8">
          {[1,2,3,4].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-slate-700/80" />)}
        </div>

        {/* Draw active marbles */}
        {particles.map((p) => (
          <div 
            key={p.id}
            className="absolute w-2 h-2 rounded-full bg-fuchsia-400 shadow-md shadow-fuchsia-500/60"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              transform: 'translate(-50%, -50%)',
              transition: 'left 0.03s linear, top 0.03s linear'
            }}
          />
        ))}

        {/* Draw bin barriers */}
        <div className="absolute bottom-0 left-0 w-full h-[35px] flex justify-between px-1 border-t border-slate-800">
          {bins.map((val, idx) => (
            <div key={idx} className="w-[12%] flex flex-col justify-end items-center">
              {/* Fill bar */}
              <div 
                className="w-full bg-fuchsia-500/40 border border-fuchsia-500/50 rounded-t-sm transition-all duration-300"
                style={{ height: `${Math.min(30, val * 3)}px` }}
              />
              <span className="text-[7px] text-slate-500 mt-1 font-mono">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-800 text-xs font-mono">
        <button 
          onClick={dropMarble}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-fuchsia-500 hover:bg-fuchsia-600 text-slate-950 font-bold transition-all"
        >
          <Plus size={14} /> Drop Logic Node
        </button>
        <button 
          onClick={resetReactor}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
        >
          <RotateCcw size={12} /> Reset Stats
        </button>
      </div>
      <div className="text-xs text-slate-400">
        Witness gravity-guided decision chains forming a beautiful normal Gaussian distribution curve.
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 8. COLOR LAB MINI TOY
// -----------------------------------------------------------------
const ColorLabToy: React.FC = () => {
  const [hue, setHue] = useState<number>(180);
  const [saturation, setSaturation] = useState<number>(80);
  const [lightness, setLightness] = useState<number>(50);
  const [copied, setCopied] = useState<boolean>(false);

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const primaryHex = hslToHex(hue, saturation, lightness);
  const complementaryHex = hslToHex((hue + 180) % 360, saturation, lightness);
  const triadHex1 = hslToHex((hue + 120) % 360, saturation, lightness);
  const triadHex2 = hslToHex((hue + 240) % 360, saturation, lightness);

  // Accessibility WCAG 2.0 readability analyzer (mock formula)
  const getReadability = () => {
    if (lightness < 20 || lightness > 85) return { score: '4.2', rating: 'Pass (AA)', class: 'text-amber-400' };
    if (lightness >= 40 && lightness <= 70) return { score: '8.4', rating: 'Pass (AAA)', class: 'text-emerald-400' };
    return { score: '2.1', rating: 'Marginal Fail', class: 'text-rose-400' };
  };

  const readRes = getReadability();

  const handleCopy = () => {
    navigator.clipboard.writeText(primaryHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2">
        <div 
          className="col-span-4 h-24 rounded-xl flex flex-col justify-end p-3 relative shadow-inner"
          style={{ backgroundColor: primaryHex }}
        >
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-950 bg-white/70 px-2 py-0.5 rounded w-max">
            Active Spectrum
          </span>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-sm font-bold font-mono text-slate-950 mix-blend-difference filter invert">{primaryHex}</span>
            <button 
              onClick={handleCopy}
              className="p-1 rounded bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Harmony Swatches */}
        <div className="flex flex-col gap-1 text-center">
          <div className="h-8 rounded" style={{ backgroundColor: complementaryHex }} />
          <span className="text-[8px] font-mono text-slate-400">Complement</span>
        </div>
        <div className="flex flex-col gap-1 text-center">
          <div className="h-8 rounded" style={{ backgroundColor: triadHex1 }} />
          <span className="text-[8px] font-mono text-slate-400">Triad 1</span>
        </div>
        <div className="flex flex-col gap-1 text-center">
          <div className="h-8 rounded" style={{ backgroundColor: triadHex2 }} />
          <span className="text-[8px] font-mono text-slate-400">Triad 2</span>
        </div>
        <div className="flex flex-col gap-1 text-center bg-slate-900/40 border border-slate-800 rounded px-1 justify-center">
          <span className="text-[10px] font-bold text-white leading-tight">{readRes.score}:1</span>
          <span className={`text-[8px] font-bold leading-none ${readRes.class}`}>{readRes.rating}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-xs font-mono bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-col gap-1">
          <span className="text-slate-400">Hue Angle ({hue}°)</span>
          <input 
            type="range" 
            min="0" 
            max="360" 
            value={hue} 
            onChange={(e) => setHue(parseInt(e.target.value))}
            className="accent-teal-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-slate-400">Saturation ({saturation}%)</span>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={saturation} 
            onChange={(e) => setSaturation(parseInt(e.target.value))}
            className="accent-teal-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-slate-400">Lightness ({lightness}%)</span>
          <input 
            type="range" 
            min="15" 
            max="85" 
            value={lightness} 
            onChange={(e) => setLightness(parseInt(e.target.value))}
            className="accent-teal-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 9. SHADOW EXPLORER MINI TOY
// -----------------------------------------------------------------
const ShadowExplorerToy: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lightPos, setLightPos] = useState<{ x: number; y: number }>({ x: 200, y: 80 });
  const [boxPos, setBoxPos] = useState<{ x: number; y: number }>({ x: 200, y: 160 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas with dark spatial background
      ctx.fillStyle = '#060a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Define Box parameters
      const boxSize = 40;
      const bLeft = boxPos.x - boxSize / 2;
      const bRight = boxPos.x + boxSize / 2;
      const bTop = boxPos.y - boxSize / 2;
      const bBottom = boxPos.y + boxSize / 2;

      // Box corners
      const corners = [
        { x: bLeft, y: bTop },
        { x: bRight, y: bTop },
        { x: bRight, y: bBottom },
        { x: bLeft, y: bBottom }
      ];

      // Cast Ray shadow polygons
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();

      // Find the shadow projection from light source past the box bounds
      corners.forEach((corner, i) => {
        const nextCorner = corners[(i + 1) % 4];

        // Ray vector
        const dx1 = corner.x - lightPos.x;
        const dy1 = corner.y - lightPos.y;
        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

        const dx2 = nextCorner.x - lightPos.x;
        const dy2 = nextCorner.y - lightPos.y;
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        // Project far away beyond canvas edge
        const projX1 = corner.x + (dx1 / len1) * 800;
        const projY1 = corner.y + (dy1 / len1) * 800;
        const projX2 = nextCorner.x + (dx2 / len2) * 800;
        const projY2 = nextCorner.y + (dy2 / len2) * 800;

        ctx.beginPath();
        ctx.moveTo(corner.x, corner.y);
        ctx.lineTo(projX1, projY1);
        ctx.lineTo(projX2, projY2);
        ctx.lineTo(nextCorner.x, nextCorner.y);
        ctx.closePath();
        ctx.fill();
      });

      // Ambient light glow radial gradient around source
      const glowGrad = ctx.createRadialGradient(lightPos.x, lightPos.y, 10, lightPos.x, lightPos.y, 250);
      glowGrad.addColorStop(0, 'rgba(14, 165, 233, 0.45)');
      glowGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
      glowGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      
      // Paint lighting glow overlay (screen mode so it brightens)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Draw obstacle box
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.fillRect(bLeft, bTop, boxSize, boxSize);
      ctx.strokeRect(bLeft, bTop, boxSize, boxSize);

      // Light source bulb
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(lightPos.x, lightPos.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    render();
  }, [lightPos, boxPos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Constrain to canvas limits
    if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
      setLightPos({ x, y });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-xl overflow-hidden border border-sky-500/20 bg-slate-950/80">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={260} 
          onMouseMove={handleMouseMove}
          className="w-full cursor-none block"
        />
        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-sky-400">
          Move cursor to steer Light Ray Source
        </div>
      </div>
      <div className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-slate-900/40 p-2 border border-slate-800 rounded-lg">
        <Info size={12} className="text-sky-400 shrink-0" />
        <span>Raycasting maps lines from the vector source past corners to define the shadow bounds.</span>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 10. RANDOM REALITY MINI TOY
// -----------------------------------------------------------------
const RandomRealityToy: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [formula, setFormula] = useState<string>('sine'); // sine | vortex | chaos
  const [speed, setSpeed] = useState<number>(1.2);
  const [density, setDensity] = useState<number>(100);
  const animationRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; color: string }[] = [];

    const initParticles = () => {
      particles = [];
      const colors = ['#f97316', '#fdba74', '#ea580c', '#ffedd5', '#f97316'];
      for (let i = 0; i < density; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    initParticles();

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 8, 5, 0.12)'; // Orange trailing
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      offsetRef.current += 0.02 * speed;

      particles.forEach((p) => {
        let angle = 0;

        if (formula === 'sine') {
          // Flow field based on pure sine curves
          angle = Math.sin(p.x * 0.015 + offsetRef.current) * Math.PI * 1.5;
        } else if (formula === 'vortex') {
          // Circular orbits around center
          const dx = 200 - p.x;
          const dy = 130 - p.y;
          angle = Math.atan2(dy, dx) + Math.PI / 2 + Math.sin(offsetRef.current) * 0.2;
        } else if (formula === 'chaos') {
          // Highly random wave interference patterns
          angle = (Math.sin(p.x * 0.02) + Math.cos(p.y * 0.02 + offsetRef.current)) * Math.PI;
        }

        // Apply velocities based on force angle
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Reset if off-bounds
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
        }

        // Render particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [formula, speed, density]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-xl overflow-hidden border border-orange-500/20 bg-slate-950/80">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={260} 
          className="w-full block"
        />
        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-orange-400">
          Flow Wave Equation: {formula.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <span className="text-slate-400">Turbulence Model</span>
          <div className="flex gap-1.5 mt-1">
            {['sine', 'vortex', 'chaos'].map((item) => (
              <button 
                key={item}
                onClick={() => setFormula(item)}
                className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors uppercase ${formula === item ? 'bg-orange-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <span className="text-slate-400 flex items-center gap-1"><Sliders size={12} /> Flow Speed</span>
          <input 
            type="range" 
            min="0.5" 
            max="3" 
            step="0.1"
            value={speed} 
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="accent-orange-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-right text-slate-500">{speed.toFixed(1)} rad/s</span>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 11. LUCKY BUTTON MINI TOY (50+ SURPRISING CHAOTIC EVENTS)
// -----------------------------------------------------------------
const LuckyButtonToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [presses, setPresses] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('lucky_presses_count') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [history, setHistory] = useState<{ id: string; name: string; emoji: string; desc: string; timestamp: string }[]>(() => {
    try {
      const saved = localStorage.getItem('lucky_presses_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ id: 'intro', name: 'The Monolith Awakens', emoji: '✨', desc: 'Ready for dynamic activation commands.', timestamp: '12:00:00' }];
  });

  const [currentEvent, setCurrentEvent] = useState<{ id: string; name: string; emoji: string; description: string; color: string; accent: string }>({
    id: 'intro',
    name: 'The Monolith Awakens',
    emoji: '✨',
    description: 'Press the giant glowing button to trigger unpredictable physics and visual anomalies.',
    color: 'orange',
    accent: '#f97316'
  });

  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [buttonScaleClass, setButtonScaleClass] = useState<string>('scale-100 hover:scale-105 active:scale-95');
  const [isRainbow, setIsRainbow] = useState<boolean>(false);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  // Responsive dimension state
  const [dimensions, setDimensions] = useState({ width: 500, height: 320 });
  const dimensionsRef = useRef(dimensions);
  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  // Cursor coordinates tracking ref
  const cursorPosRef = useRef<{ x: number; y: number }>({ x: 250, y: 160 });

  // 51 Custom modeled unique surprising cosmic events
  const EVENTS = [
    { id: 'confetti', name: 'Confetti Explosion', emoji: '🎉', description: 'A glorious burst of colorful spinning paper flakes!', color: 'rose', accent: '#f43f5e' },
    { id: 'screen-shake', name: 'Tectonic Screen Shake', emoji: '🫨', description: 'An intense seismic rumble that shakes the entire interface!', color: 'amber', accent: '#f59e0b' },
    { id: 'rainbow-mode', name: 'Psychedelic Rainbow Mode', emoji: '🌈', description: 'Color waves sweeping across the button and canvas!', color: 'indigo', accent: '#6366f1' },
    { id: 'meteor-shower', name: 'Fiery Meteor Shower', emoji: '☄️', description: 'Blazing cosmic fireballs streaking down from the heavens!', color: 'orange', accent: '#ff7849' },
    { id: 'floating-emojis', name: 'Emoji Parade', emoji: '🎈', description: 'Dozens of playful faces and bubbles drifting upwards!', color: 'teal', accent: '#0d9488' },
    { id: 'fireworks', name: 'Midnight Fireworks', emoji: '🎆', description: 'Crackling multi-layered sparks illuminating the dark sky!', color: 'fuchsia', accent: '#d946ef' },
    { id: 'snow', name: 'Glacial Snowfall', emoji: '❄️', description: 'Soft, gentle white crystals swaying in the breeze!', color: 'sky', accent: '#0ea5e9' },
    { id: 'bubble-storm', name: 'Prismatic Bubble Storm', emoji: '🫧', description: 'Floating holographic soap bubbles that pop on contact!', color: 'cyan', accent: '#06b6d4' },
    { id: 'gravity-inversion', name: 'Gravity Inversion', emoji: '🙃', description: 'Physics flipped upside down! Particles fall upwards!', color: 'violet', accent: '#8b5cf6' },
    { id: 'neon-matrix', name: 'Cyber Neon Grid', emoji: '🌐', description: 'A futuristic cyber grid glowing in deep electric lime!', color: 'emerald', accent: '#10b981' },
    { id: 'giant-button', name: 'Colossal Giant Button', emoji: '🔘', description: 'The button morphs and swells to a massive layout!', color: 'rose', accent: '#f43f5e' },
    { id: 'tiny-button', name: 'Sub-Atomic Tiny Button', emoji: '•', description: 'The button shrinks into a miniature micro-dot!', color: 'slate', accent: '#64748b' },
    { id: 'slow-motion', name: 'Slow Motion Relativity', emoji: '⏳', description: 'Spacetime slows to 0.2x speed with infinite trails!', color: 'cyan', accent: '#06b6d4' },
    { id: 'speed-mode', name: 'Warp-Speed Hyperdrive', emoji: '🚀', description: 'Particles accelerate to light speed creating star-lines!', color: 'amber', accent: '#eab308' },
    { id: 'laser-beams', name: 'Neon Laser Sweep', emoji: '⚡', description: 'Intense flashing laser beams crossing the sandbox!', color: 'rose', accent: '#f43f5e' },
    { id: 'pixel-rain', name: 'Retro Pixel Code Rain', emoji: '👾', description: 'Green digital code cascades dripping down like old arcades!', color: 'emerald', accent: '#10b981' },
    { id: 'floating-stars', name: 'Twinkling Constellation', emoji: '⭐', description: 'Four-pointed sparkling stars shining across space!', color: 'violet', accent: '#a78bfa' },
    { id: 'coin-rain', name: 'Golden Coin Rain', emoji: '🪙', description: 'Shining gold coins spinning and leaving sparkle trails!', color: 'amber', accent: '#fbbf24' },
    { id: 'happy-face-explosion', name: 'Happy Face Explosion', emoji: '😄', description: 'Dozens of high-bouncing smileys popping in a cluster!', color: 'teal', accent: '#14b8a6' },
    { id: 'mystery-glitch', name: 'Glitch scanline anomaly', emoji: '📺', description: 'A horizontal CRT scanline static distortion filter!', color: 'slate', accent: '#475569' },
    { id: 'cyber-grid-warp', name: 'Cyber Space-Time Warp', emoji: '🌀', description: 'A dynamic perspective grid that warps around gravity!', color: 'indigo', accent: '#6366f1' },
    { id: 'neon-spiral', name: 'Golden Fibonacci Spiral', emoji: '🐚', description: 'Particles tracing the perfect geometry of nature!', color: 'rose', accent: '#f43f5e' },
    { id: 'black-hole-gravity', name: 'Supermassive Black Hole', emoji: '🕳️', description: 'A crushing gravity singular well pulling everything inside!', color: 'indigo', accent: '#312e81' },
    { id: 'disco-strobe', name: 'Synthwave Disco Strobe', emoji: '🪩', description: 'Flashing neon backdrops and pulsing bass wave rings!', color: 'fuchsia', accent: '#ec4899' },
    { id: 'matrix-code-fall', name: 'Binary Digital Rain', emoji: '💻', description: 'Cascading digital symbols running down the screen!', color: 'emerald', accent: '#059669' },
    { id: 'quantum-entanglement', name: 'Quantum Laser Webbing', emoji: '⚛️', description: 'Energetic links connecting close-proximity particles!', color: 'violet', accent: '#8b5cf6' },
    { id: 'bubble-wrap-mode', name: 'Bubble Wrap Pop', emoji: '🧼', description: 'Click anywhere to pop mini pressurized bubbles!', color: 'sky', accent: '#38bdf8' },
    { id: 'volcano-eruption', name: 'Magmatic Volcano Spew', emoji: '🌋', description: 'Fiery magma embers erupting from the core upwards!', color: 'orange', accent: '#f97316' },
    { id: 'magnet-pull', name: 'Magnetic Force Field', emoji: '🧲', description: 'All active particles magnetically orbit directly around your cursor!', color: 'rose', accent: '#fb7185' },
    { id: 'supernova', name: 'Supernova Shockwave', emoji: '💥', description: 'A white-hot celestial blast pushing all dust to the margins!', color: 'orange', accent: '#fdba74' },
    { id: 'dna-double-helix', name: 'DNA Double Helix', emoji: '🧬', description: 'Dust particles organizing into a beautiful vertical helix!', color: 'sky', accent: '#0ea5e9' },
    { id: 'jellyfish-float', name: 'Bioluminescent Jellyfish', emoji: '🪼', description: 'Translucent alien jellyfish drifting up the chamber!', color: 'cyan', accent: '#22d3ee' },
    { id: 'cyber-glitched-scanlines', name: 'Horizontal Noise Glitch', emoji: '⚠️', description: 'Thick horizontal static scanline rolling bars!', color: 'slate', accent: '#94a3b8' },
    { id: 'shooting-stars', name: 'Hypersonic Shooting Stars', emoji: '💫', description: 'Extreme-speed shooting stars blazing horizontally!', color: 'white', accent: '#ffffff' },
    { id: 'golden-coin-spin', name: 'Spinning Wealth Sovereign', emoji: '💰', description: 'A massive rotating solid gold coin in the center!', color: 'amber', accent: '#fbbf24' },
    { id: 'electric-storm', name: 'Lightning Strike Storm', emoji: '⛈️', description: 'Sudden electric discharges branching to random dust!', color: 'violet', accent: '#c084fc' },
    { id: 'popcorn-bounce', name: 'Thermal Popcorn Bouncer', emoji: '🍿', description: 'White kernels jumping on the floor and popping into clouds!', color: 'amber', accent: '#fef08a' },
    { id: 'ping-pong', name: 'Orbital Ping Pong Balls', emoji: '🏓', description: 'Large dense white spheres bouncing perfectly off wall bounds!', color: 'slate', accent: '#cbd5e1' },
    { id: 'hearts-orbit', name: 'Pulsing Hearts Orbit', emoji: '💖', description: 'Spawns sweet pink hearts that circle around the screen!', color: 'rose', accent: '#f43f5e' },
    { id: 'lava-lamp-bubble', name: 'Blooping Lava Blobs', emoji: '🏮', description: 'Amorphous slow lava bubbles rising and merging organically!', color: 'orange', accent: '#f97316' },
    { id: 'sonic-ripple', name: 'Sonic Shock Waves', emoji: '🔈', description: 'Concentric high-intensity blue circles expanding smoothly!', color: 'cyan', accent: '#67e8f9' },
    { id: 'aurora-borealis', name: 'Solar Aurora Curtains', emoji: '🌌', description: 'Draped green and violet curtains dancing in cosmic winds!', color: 'emerald', accent: '#34d399' },
    { id: 'constellation-web', name: 'Constellation Mesh Web', emoji: '🕸️', description: 'Draws silver connecting webs between all active stars!', color: 'slate', accent: '#94a3b8' },
    { id: 'butterfly-swarm', name: 'Bioluminescent Butterflies', emoji: '🦋', description: 'Ethereal neon insects flapping wings in lazy loops!', color: 'indigo', accent: '#818cf8' },
    { id: 'vortex-spin', name: 'Supercellular Vortex Whirl', emoji: '🌪️', description: 'A violent orbital centrifuge pulling everything into circles!', color: 'sky', accent: '#38bdf8' },
    { id: 'rainstorm', name: 'Tropical Torrent Storm', emoji: '🌧️', description: 'Heavy raindrops streaming down splashing at the floor!', color: 'cyan', accent: '#06b6d4' },
    { id: 'super-bouncy-balls', name: 'Hyper-Elastic Orbs', emoji: '⚽', description: 'Bouncing circles that gain kinetic energy from wall hits!', color: 'emerald', accent: '#10b981' },
    { id: 'hologram-projection', name: 'Holographic Scanner Ring', emoji: '📀', description: 'A glowing cyan 3D scanner ring reading the chamber!', color: 'cyan', accent: '#06b6d4' },
    { id: 'ghostly-trails', name: 'Infinite Painting Trails', emoji: '🖌️', description: 'Frictionless dust that paints continuous flowing vectors!', color: 'fuchsia', accent: '#f472b6' },
    { id: 'binary-streams', name: 'Algorithmic Binary Stream', emoji: '🔢', description: 'Infinite arrays of green 1s and 0s falling down!', color: 'emerald', accent: '#34d399' },
    { id: 'cosmic-nebula', name: 'Stellar Gaseous Nebula', emoji: '🪐', description: 'Soft clouds of gaseous cosmic dust floating calmly!', color: 'violet', accent: '#c084fc' }
  ];

  interface LuckyParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    life: number;
    maxLife: number;
    extra?: any;
  }

  const particlesRef = useRef<LuckyParticle[]>([]);
  const activeEventIdRef = useRef<string>('intro');
  const frameIndexRef = useRef<number>(0);

  // Sync refs to prevent animation stuttering
  useEffect(() => {
    activeEventIdRef.current = currentEvent.id;
  }, [currentEvent]);

  // Handle localStorage state commits
  useEffect(() => {
    localStorage.setItem('lucky_presses_count', presses.toString());
  }, [presses]);

  useEffect(() => {
    localStorage.setItem('lucky_presses_history', JSON.stringify(history));
  }, [history]);

  // ResizeObserver for canvas responsiveness
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const finalWidth = width > 0 ? Math.floor(width) : 500;
        setDimensions({
          width: finalWidth,
          height: 320
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Primary animation framework
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const runFrame = () => {
      frameIndexRef.current++;
      const frameIdx = frameIndexRef.current;
      const { width, height } = dimensionsRef.current;
      const eventId = activeEventIdRef.current;

      // 1. CLEAR CANVAS WITH DIFFERENT TRAIL SPEEDS
      if (eventId === 'ghostly-trails') {
        ctx.fillStyle = 'rgba(8, 8, 16, 0.015)'; // extremely long trails!
      } else if (eventId === 'slow-motion') {
        ctx.fillStyle = 'rgba(8, 8, 16, 0.04)';
      } else if (eventId === 'disco-strobe') {
        const hue = (frameIdx * 3) % 360;
        ctx.fillStyle = `hsla(${hue}, 40%, 8%, 0.18)`;
      } else {
        ctx.fillStyle = 'rgba(8, 8, 16, 0.12)'; // default trailing clear
      }
      ctx.fillRect(0, 0, width, height);

      // 2. RENDER THEME BACKDROP ANOMALIES
      // Draw grid backgrounds for specific events
      if (eventId === 'neon-matrix' || eventId === 'cyber-grid-warp') {
        ctx.strokeStyle = eventId === 'neon-matrix' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(99, 102, 241, 0.07)';
        ctx.lineWidth = 1;
        const step = 25;
        const warp = frameIdx * 0.015;

        for (let x = -step; x < width + step; x += step) {
          ctx.beginPath();
          for (let y = 0; y < height; y += 10) {
            let dx = 0;
            if (eventId === 'cyber-grid-warp') {
              dx = Math.sin(y * 0.015 + warp) * 18;
            }
            if (y === 0) ctx.moveTo(x + dx, y);
            else ctx.lineTo(x + dx, y);
          }
          ctx.stroke();
        }

        for (let y = -step; y < height + step; y += step) {
          ctx.beginPath();
          for (let x = 0; x < width; x += 10) {
            let dy = 0;
            if (eventId === 'cyber-grid-warp') {
              dy = Math.cos(x * 0.015 - warp) * 10;
            }
            if (x === 0) ctx.moveTo(x, y + dy);
            else ctx.lineTo(x, y + dy);
          }
          ctx.stroke();
        }
      }

      // 3D Wireframe projection
      if (eventId === 'hologram-projection') {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.lineWidth = 1;
        const cx = width / 2;
        const cy = height / 2;
        const radius = 80;
        const angleRot = frameIdx * 0.015;

        for (let lat = 0.2; lat < Math.PI; lat += Math.PI / 6) {
          ctx.beginPath();
          for (let lon = 0; lon <= Math.PI * 2 + 0.1; lon += 0.2) {
            const x3d = radius * Math.sin(lat) * Math.cos(lon + angleRot);
            const y3d = radius * Math.cos(lat);
            if (lon === 0) ctx.moveTo(cx + x3d, cy + y3d);
            else ctx.lineTo(cx + x3d, cy + y3d);
          }
          ctx.stroke();
        }
      }

      // Bioluminescent Aurora borealis waving curtains
      if (eventId === 'aurora-borealis') {
        const time = frameIdx * 0.006;
        for (let layer = 0; layer < 3; layer++) {
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, layer === 0 ? 'rgba(52, 211, 153, 0.06)' : 'rgba(139, 92, 246, 0.05)');
          gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.02)');
          gradient.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(0, height * 0.1);
          for (let x = 0; x <= width; x += 20) {
            const yOffset = height * 0.35 + 
              Math.sin(x * 0.008 + time + layer * 1.5) * 40 + 
              Math.cos(x * 0.004 - time) * 15;
            ctx.lineTo(x, yOffset);
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Sweeping Laser Beams
      if (eventId === 'laser-beams') {
        const sweepPos = (Math.sin(frameIdx * 0.04) * 0.5 + 0.5) * width;
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sweepPos, 0);
        ctx.lineTo(width - sweepPos, height);
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sweepPos, 0);
        ctx.lineTo(width - sweepPos, height);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // CRT Anomaly rolling lines
      if (eventId === 'mystery-glitch' || eventId === 'cyber-glitched-scanlines') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        for (let y = 0; y < height; y += 3) {
          if (Math.random() < 0.12) {
            ctx.fillRect(0, y + (frameIdx % 9), width, 1.2);
          }
        }
        if (frameIdx % 45 < 4) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.06)';
          ctx.fillRect((frameIdx % 8) - 4, 0, width, height);
        }
      }

      // Sonic Expanding ripples
      if (eventId === 'sonic-ripple' && frameIdx % 25 === 0) {
        particlesRef.current.push({
          x: width / 2,
          y: height / 2,
          vx: 0,
          vy: 0,
          size: 5,
          color: 'rgba(6, 182, 212, 0.6)',
          alpha: 1.0,
          life: 0,
          maxLife: 80,
          extra: { isRipple: true }
        });
      }

      // Electric lightning discharges
      if (eventId === 'electric-storm' && Math.random() < 0.07) {
        ctx.strokeStyle = '#c084fc';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let lx = Math.random() * width;
        let ly = 0;
        ctx.moveTo(lx, ly);
        while (ly < height) {
          lx += (Math.random() - 0.5) * 35;
          ly += Math.random() * 25 + 5;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 3. PASSIVE CONTINUOUS PARTICLE REGENERATORS
      // For persistent modes, keep a minimum count active in the sandbox
      const particles = particlesRef.current;
      const colors = ['#00f2fe', '#f35588', '#fffb54', '#a254ff', '#05dfd7', '#ff2e93'];

      if (eventId === 'snow' && particles.length < 90) {
        particles.push({
          x: Math.random() * width,
          y: -10,
          vx: (Math.random() - 0.5) * 1.0,
          vy: 0.8 + Math.random() * 1.5,
          size: 1.5 + Math.random() * 2.5,
          color: '#ffffff',
          alpha: 0.5 + Math.random() * 0.5,
          life: 0,
          maxLife: 200,
          extra: { sway: Math.random() * Math.PI, swaySpeed: 0.01 + Math.random() * 0.015 }
        });
      }

      if (eventId === 'rainstorm' && particles.length < 130) {
        particles.push({
          x: Math.random() * width,
          y: -20,
          vx: -1.5 - Math.random() * 1.0,
          vy: 8 + Math.random() * 5,
          size: 1 + Math.random() * 1.5,
          color: '#38bdf8',
          alpha: 0.4 + Math.random() * 0.4,
          life: 0,
          maxLife: 80,
          extra: { isRain: true }
        });
      }

      if ((eventId === 'matrix-code-fall' || eventId === 'pixel-rain') && particles.length < 75) {
        const charList = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&*+-/=?';
        particles.push({
          x: Math.random() * width,
          y: -20,
          vx: 0,
          vy: 2 + Math.random() * 3,
          size: eventId === 'pixel-rain' ? 3 + Math.random() * 3 : 10 + Math.random() * 4,
          color: eventId === 'pixel-rain' ? '#10b981' : '#34d399',
          alpha: 0.6 + Math.random() * 0.4,
          life: 0,
          maxLife: 120,
          extra: {
            char: charList[Math.floor(Math.random() * charList.length)],
            updateTimer: 0,
            isCode: true
          }
        });
      }

      if (eventId === 'binary-streams' && particles.length < 80) {
        particles.push({
          x: Math.random() * width,
          y: -15,
          vx: 0,
          vy: 1.5 + Math.random() * 2.5,
          size: 11,
          color: '#34d399',
          alpha: 0.7 + Math.random() * 0.3,
          life: 0,
          maxLife: 140,
          extra: {
            char: Math.random() > 0.5 ? '1' : '0',
            updateTimer: 0,
            isCode: true
          }
        });
      }

      if (eventId === 'bubble-storm' && particles.length < 65) {
        particles.push({
          x: Math.random() * width,
          y: height + 15,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -1.0 - Math.random() * 1.8,
          size: 4 + Math.random() * 8,
          color: 'rgba(6, 182, 212, 0.45)',
          alpha: 0.6 + Math.random() * 0.4,
          life: 0,
          maxLife: 180,
          extra: { isBubble: true, swayOffset: Math.random() * Math.PI * 2 }
        });
      }

      if (eventId === 'floating-emojis' && particles.length < 35) {
        const list = ['🎈', '🥳', '🔥', '✨', '😄', '😎', '🦄', '⭐', '💫', '🎉'];
        particles.push({
          x: Math.random() * width,
          y: height + 20,
          vx: (Math.random() - 0.5) * 1.0,
          vy: -1.2 - Math.random() * 1.5,
          size: 16 + Math.random() * 10,
          color: '#ffffff',
          alpha: 1.0,
          life: 0,
          maxLife: 160,
          extra: { isEmoji: true, text: list[Math.floor(Math.random() * list.length)] }
        });
      }

      if (eventId === 'cosmic-nebula' && particles.length < 50) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: 25 + Math.random() * 35,
          color: Math.random() > 0.5 ? 'rgba(192, 132, 252, 0.04)' : 'rgba(244, 114, 182, 0.03)',
          alpha: 0.3 + Math.random() * 0.4,
          life: 0,
          maxLife: 150,
          extra: { isCloud: true }
        });
      }

      if (eventId === 'lava-lamp-bubble' && particles.length < 7) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size: 35 + Math.random() * 25,
          color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
          alpha: 0.45,
          life: 0,
          maxLife: 9999,
          extra: { isLavaBlob: true }
        });
      }

      if (eventId === 'jellyfish-float' && particles.length < 5) {
        particles.push({
          x: Math.random() * width,
          y: height + 30,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.5 - Math.random() * 0.6,
          size: 20 + Math.random() * 15,
          color: 'rgba(34, 211, 238, 0.4)',
          alpha: 0.7,
          life: 0,
          maxLife: 400,
          extra: { isJellyfish: true, floatPhase: Math.random() * Math.PI }
        });
      }

      if (eventId === 'butterfly-swarm' && particles.length < 25) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 5 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.8,
          life: 0,
          maxLife: 200,
          extra: { isButterfly: true, flapPhase: Math.random() * Math.PI }
        });
      }

      if (eventId === 'shooting-stars' && particles.length < 6 && Math.random() < 0.05) {
        particles.push({
          x: width + 20,
          y: Math.random() * (height * 0.7),
          vx: -12 - Math.random() * 6,
          vy: 2 + Math.random() * 2,
          size: 2 + Math.random() * 1.5,
          color: '#ffffff',
          alpha: 1.0,
          life: 0,
          maxLife: 60,
          extra: { isShootingStar: true }
        });
      }

      // 4. UPDATE AND DRAW INDIVIDUAL PARTICLES
      const speedMult = eventId === 'slow-motion' ? 0.22 : (eventId === 'speed-mode' ? 3.0 : 1.0);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += speedMult;

        // Force remove expired ones
        if (p.life >= p.maxLife && p.maxLife !== 9999) {
          particles.splice(i, 1);
          continue;
        }

        // Custom behaviors per particle category
        if (p.extra) {
          // Gravity inverted forces
          if (eventId === 'gravity-inversion') {
            p.vy -= 0.05 * speedMult;
          }

          // Rain behavior
          if (p.extra.isRain) {
            p.y += p.vy * speedMult;
            p.x += p.vx * speedMult;
            if (p.y > height) {
              // Splash burst
              ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(p.x, height - 2, 4, 0, Math.PI, true);
              ctx.stroke();
              particles.splice(i, 1);
              continue;
            }
          }

          // Code cascade text
          else if (p.extra.isCode) {
            p.y += p.vy * speedMult;
            p.extra.updateTimer += speedMult;
            if (p.extra.updateTimer > 8) {
              const charList = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&*+-/=?';
              p.extra.char = charList[Math.floor(Math.random() * charList.length)];
              p.extra.updateTimer = 0;
            }
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife);
            ctx.font = `${p.size}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(p.extra.char, p.x, p.y);
            ctx.globalAlpha = 1.0;
            continue;
          }

          // Floating emojis text
          else if (p.extra.isEmoji) {
            p.y += p.vy * speedMult;
            p.x += Math.sin(p.life * 0.03) * 0.5 * speedMult;
            ctx.globalAlpha = 1 - p.life / p.maxLife;
            ctx.font = `${p.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(p.extra.text, p.x, p.y);
            ctx.globalAlpha = 1.0;
            if (p.y < -30) {
              particles.splice(i, 1);
            }
            continue;
          }

          // Sonic concentric ripple rings
          else if (p.extra.isRipple) {
            p.size += 2.5 * speedMult;
            p.alpha = 1 - p.life / p.maxLife;
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
            if (p.life >= p.maxLife) {
              particles.splice(i, 1);
            }
            continue;
          }

          // Cosmic clouds gaseous blobs
          else if (p.extra.isCloud) {
            p.x += p.vx * speedMult;
            p.y += p.vy * speedMult;
            const gradient = ctx.createRadialGradient(p.x, p.y, p.size * 0.1, p.x, p.y, p.size);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(0.6, 'rgba(129, 140, 248, 0.005)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            continue;
          }

          // Lava blobs bouncers
          else if (p.extra.isLavaBlob) {
            p.x += p.vx * speedMult;
            p.y += p.vy * speedMult;

            // Bounce off edges smoothly
            if (p.x < p.size || p.x > width - p.size) p.vx *= -1;
            if (p.y < p.size || p.y > height - p.size) p.vy *= -1;

            const radGlow = ctx.createRadialGradient(p.x, p.y, p.size * 0.1, p.x, p.y, p.size * 1.5);
            radGlow.addColorStop(0, p.color);
            radGlow.addColorStop(0.3, p.color === '#f97316' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(239, 68, 68, 0.2)');
            radGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = radGlow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
            ctx.fill();
            continue;
          }

          // Bioluminescent Jellyfish
          else if (p.extra.isJellyfish) {
            p.extra.floatPhase += 0.02 * speedMult;
            // Swim push
            const swimStroke = Math.sin(p.extra.floatPhase);
            if (swimStroke > 0.6) {
              p.y += p.vy * 1.8 * speedMult;
            } else {
              p.y += p.vy * 0.4 * speedMult;
            }
            p.x += Math.sin(p.extra.floatPhase * 0.6) * 0.3 * speedMult;

            // Draw umbrella cap
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, Math.PI, 0);
            ctx.fill();

            // Draw simple waving tentacles
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            for (let t = -3; t <= 3; t += 2) {
              ctx.beginPath();
              ctx.moveTo(p.x + (t * (p.size / 4)), p.y);
              const tx = p.x + (t * (p.size / 4)) + Math.sin(p.extra.floatPhase * 2 + t) * 6;
              const ty = p.y + p.size * 1.2;
              ctx.lineTo(tx, ty);
              ctx.stroke();
            }
            ctx.globalAlpha = 1.0;
            if (p.y < -p.size * 2) particles.splice(i, 1);
            continue;
          }

          // Butterflies
          else if (p.extra.isButterfly) {
            p.x += p.vx * speedMult;
            p.y += p.vy * speedMult;
            p.extra.flapPhase += 0.15 * speedMult;

            // Bounce off bounds
            if (p.x < 10 || p.x > width - 10) p.vx *= -1;
            if (p.y < 10 || p.y > height - 10) p.vy *= -1;

            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            // Draw left/right flapping wing dots
            const flap = Math.abs(Math.sin(p.extra.flapPhase)) * p.size;
            ctx.beginPath();
            ctx.arc(p.x - flap / 2, p.y, p.size * 0.7, 0, Math.PI * 2);
            ctx.arc(p.x + flap / 2, p.y, p.size * 0.7, 0, Math.PI * 2);
            ctx.fill();

            // Body
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(p.x - 1, p.y - p.size, 2, p.size * 2);
            ctx.globalAlpha = 1.0;
            continue;
          }

          // Shooting stars with long trails
          else if (p.extra.isShootingStar) {
            p.x += p.vx * speedMult;
            p.y += p.vy * speedMult;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = p.size;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 1.8, p.y - p.vy * 1.8);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
            ctx.fill();
            continue;
          }

          // Gold coins flipping
          else if (p.id === 'coin') {
            p.y += p.vy * speedMult;
            p.x += p.vx * speedMult;
            p.vy += 0.08 * speedMult; // gravity pull

            p.extra.rotY += 0.06 * speedMult;
            const aspectX = Math.abs(Math.cos(p.extra.rotY));

            ctx.fillStyle = p.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.size * aspectX, p.size, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#b45309';
            ctx.font = `${p.size * 1.1}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', p.x, p.y);
            continue;
          }

          // Rotating stars
          else if (p.extra.rotSpeed !== undefined) {
            p.extra.rot += p.extra.rotSpeed * speedMult;
          }
          // Gravity pull elements
          if (p.extra.gravity) {
            p.vy += p.extra.gravity * speedMult;
          }
          // Soft snow swaying
          if (p.extra.swaySpeed) {
            p.extra.sway += p.extra.swaySpeed * speedMult;
            p.x += Math.cos(p.extra.sway) * 0.4 * speedMult;
            p.y += p.vy * speedMult;
          }
          // Bubbles swaying
          if (p.extra.isBubble) {
            p.y += p.vy * speedMult;
            p.x += Math.sin(p.life * 0.04 + p.extra.swayOffset) * 0.6 * speedMult;
            
            ctx.strokeStyle = p.color;
            ctx.fillStyle = 'rgba(6, 182, 212, 0.03)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Bubble shining reflex bead
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x - p.size * 0.4, p.y - p.size * 0.4, 1.2, 0, Math.PI * 2);
            ctx.fill();
            if (p.y < -20) particles.splice(i, 1);
            continue;
          }
        }

        // Active general gravity modifiers
        if (eventId === 'black-hole-gravity') {
          // Pull toward center
          const dx = width / 2 - p.x;
          const dy = height / 2 - p.y;
          const distSq = dx * dx + dy * dy + 300;
          const dist = Math.sqrt(distSq);
          p.vx += (dx / dist) * 0.2 * speedMult;
          p.vy += (dy / dist) * 0.2 * speedMult;
        }

        if (eventId === 'magnet-pull') {
          // Orbit/Pull toward cursor coordinates
          const dx = cursorPosRef.current.x - p.x;
          const dy = cursorPosRef.current.y - p.y;
          const distSq = dx * dx + dy * dy + 250;
          const dist = Math.sqrt(distSq);
          p.vx += (dx / dist) * 0.3 * speedMult;
          p.vy += (dy / dist) * 0.3 * speedMult;
        }

        if (eventId === 'vortex-spin') {
          const dx = width / 2 - p.x;
          const dy = height / 2 - p.y;
          const dist = Math.hypot(dx, dy) + 1;
          const angle = Math.atan2(dy, dx) + Math.PI / 2 + 0.1;
          const pull = 0.5;
          p.vx = (p.vx * 0.85) + (Math.cos(angle) * 3 + (dx / dist) * pull) * speedMult;
          p.vy = (p.vy * 0.85) + (Math.sin(angle) * 3 + (dy / dist) * pull) * speedMult;
        }

        // DNA Double Helix arrangement override
        if (eventId === 'dna-double-helix') {
          const time = frameIdx * 0.03;
          const spacingY = height / 60;
          const particleIdx = i % 60;
          const side = i % 2 === 0 ? 1 : -1;
          p.y = particleIdx * spacingY;
          p.x = width / 2 + Math.sin(p.y * 0.03 + time * side) * 55 * side;
          p.vx = 0;
          p.vy = 0;
          p.size = 2.5 + Math.cos(p.y * 0.03 + time * side) * 1.5;
        }

        // Apply friction drag to typical free sparks
        if (eventId !== 'super-bouncy-balls' && !p.extra?.isRain && !p.extra?.isBubble && !p.extra?.isJellyfish) {
          p.vx *= 0.975;
          p.vy *= 0.975;
        }

        // Basic physics translation
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;

        // Custom elastic boundaries
        if (eventId === 'super-bouncy-balls') {
          if (p.x < p.size || p.x > width - p.size) {
            p.vx *= -1.02; // speed up slightly on hit
            p.x = p.x < p.size ? p.size : width - p.size;
          }
          if (p.y < p.size || p.y > height - p.size) {
            p.vy *= -1.02;
            p.y = p.y < p.size ? p.size : height - p.size;
          }
        } else if (eventId === 'ping-pong' && p.extra?.isBall) {
          if (p.x < p.size || p.x > width - p.size) {
            p.vx *= -1;
            p.x = p.x < p.size ? p.size : width - p.size;
          }
          if (p.y < p.size || p.y > height - p.size) {
            p.vy *= -1;
            p.y = p.y < p.size ? p.size : height - p.size;
          }
        }

        // Draw normal particle bead
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife);

        ctx.beginPath();
        if (p.extra?.rot !== undefined) {
          // Draw spinning star/rect
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.extra.rot);
          if (eventId === 'confetti') {
            ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
          } else {
            // Draw four pointed star
            ctx.beginPath();
            for (let j = 0; j < 4; j++) {
              ctx.lineTo(0, -p.size * 1.2);
              ctx.rotate(Math.PI / 4);
              ctx.lineTo(0, -p.size * 0.3);
              ctx.rotate(Math.PI / 4);
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      // 5. DRAW CONSTELATION CONNECTOR WEBS
      if (eventId === 'constellation-web' || eventId === 'quantum-entanglement') {
        ctx.lineWidth = 0.5;
        const maxDist = eventId === 'constellation-web' ? 50 : 80;
        ctx.strokeStyle = eventId === 'constellation-web' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(167, 139, 250, 0.25)';

        for (let j = 0; j < particles.length; j++) {
          for (let k = j + 1; k < particles.length; k++) {
            const p1 = particles[j];
            const p2 = particles[k];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = dx * dx + dy * dy;
            if (dist < maxDist * maxDist) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw massive event black hole core
      if (eventId === 'black-hole-gravity') {
        const pulse = 1 + Math.sin(frameIdx * 0.05) * 0.1;
        const radius = 25 * pulse;
        
        // Accretion disk glow
        const glow = ctx.createRadialGradient(width / 2, height / 2, radius * 0.3, width / 2, height / 2, radius * 2.5);
        glow.addColorStop(0, '#ffffff');
        glow.addColorStop(0.1, '#f43f5e');
        glow.addColorStop(0.3, '#312e81');
        glow.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Absorb core
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Draw Spinning wealth solid gold coin
      if (eventId === 'golden-coin-spin') {
        const cx = width / 2;
        const cy = height / 2;
        const rotY = frameIdx * 0.04;
        const aspectX = Math.abs(Math.cos(rotY));
        const coinSize = 40;

        // Metallic golden gradient
        const metallic = ctx.createRadialGradient(cx, cy, 2, cx, cy, coinSize);
        metallic.addColorStop(0, '#fef08a');
        metallic.addColorStop(0.6, '#fbbf24');
        metallic.addColorStop(1, '#b45309');

        ctx.save();
        ctx.fillStyle = metallic;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, coinSize * aspectX, coinSize, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.font = `bold ${coinSize * 1.1}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // scale text with flip
        ctx.scale(aspectX, 1);
        ctx.fillText('$', cx / (aspectX || 1), cy);
        ctx.restore();
      }

      animId = requestAnimationFrame(runFrame);
    };

    runFrame();
    return () => cancelAnimationFrame(animId);
  }, [dimensions]);

  // Handle giant button presses
  const triggerEvent = () => {
    // 1. Increment stats presses count
    const nextCount = presses + 1;
    setPresses(nextCount);

    // 2. Select a truly random event different from the current one to guarantee surprise!
    let nextEvent = currentEvent;
    while (nextEvent.id === currentEvent.id) {
      nextEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    }

    // 3. Set dynamic states
    setCurrentEvent(nextEvent);
    activeEventIdRef.current = nextEvent.id;

    // Apply button visual morphology parameters
    if (nextEvent.id === 'giant-button') {
      setButtonScaleClass('scale-[1.3] hover:scale-[1.35] active:scale-[1.25] shadow-rose-500/50');
    } else if (nextEvent.id === 'tiny-button') {
      setButtonScaleClass('scale-[0.5] hover:scale-[0.55] active:scale-[0.45] shadow-slate-500/50');
    } else {
      setButtonScaleClass('scale-100 hover:scale-105 active:scale-95');
    }

    setIsRainbow(nextEvent.id === 'rainbow-mode');

    // Tectonic shake toggle
    if (nextEvent.id === 'screen-shake' || nextEvent.id === 'supernova' || nextEvent.id === 'volcano-eruption') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }

    // 4. Instantiate specific particles for the new event
    const { width, height } = dimensionsRef.current;
    const list: LuckyParticle[] = [];

    // Confetti flakes
    if (nextEvent.id === 'confetti') {
      for (let i = 0; i < 110; i++) {
        list.push({
          x: width / 2 + (Math.random() - 0.5) * 40,
          y: height / 2 + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 8 - 3,
          size: 3 + Math.random() * 4,
          color: `hsl(${Math.random() * 360}, 95%, 65%)`,
          alpha: 1.0,
          life: 0,
          maxLife: 90 + Math.random() * 50,
          extra: { rot: Math.random() * Math.PI, rotSpeed: (Math.random() - 0.5) * 0.15 }
        });
      }
    }
    // Fireworks multi explosion
    else if (nextEvent.id === 'fireworks') {
      for (let f = 0; f < 3; f++) {
        const fx = width * 0.2 + Math.random() * (width * 0.6);
        const fy = height * 0.2 + Math.random() * (height * 0.4);
        const baseHue = Math.random() * 360;
        for (let j = 0; j < 35; j++) {
          const ang = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 4.5;
          list.push({
            x: fx,
            y: fy,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            size: 1.5 + Math.random() * 1.5,
            color: `hsl(${baseHue + (Math.random() - 0.5) * 35}, 95%, 65%)`,
            alpha: 1.0,
            life: 0,
            maxLife: 45 + Math.random() * 30,
            extra: { gravity: 0.05 }
          });
        }
      }
    }
    // Volcano eruption embers
    else if (nextEvent.id === 'volcano-eruption') {
      for (let i = 0; i < 85; i++) {
        list.push({
          x: width / 2 + (Math.random() - 0.5) * 20,
          y: height,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 9 - 4,
          size: 2 + Math.random() * 3,
          color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
          alpha: 1.0,
          life: 0,
          maxLife: 80 + Math.random() * 40,
          extra: { gravity: 0.12 }
        });
      }
    }
    // Gold coins showering
    else if (nextEvent.id === 'coin-rain') {
      for (let i = 0; i < 40; i++) {
        list.push({
          x: Math.random() * width,
          y: -20 - Math.random() * 150,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 2 + Math.random() * 3,
          size: 7 + Math.random() * 3,
          color: '#fbbf24',
          alpha: 1.0,
          life: 0,
          maxLife: 180,
          extra: { rotY: Math.random() * Math.PI, rotSpeed: 0.04 }
        });
      }
    }
    // Happy smiles spew
    else if (nextEvent.id === 'happy-face-explosion') {
      const faces = ['😄', '😂', '😎', '🚀', '🌟', '🦄', '🎉', '🔥'];
      for (let i = 0; i < 28; i++) {
        list.push({
          x: width / 2,
          y: height / 2,
          vx: (Math.random() - 0.5) * 7,
          vy: -Math.random() * 6 - 2,
          size: 20,
          color: '#ffffff',
          alpha: 1.0,
          life: 0,
          maxLife: 100,
          extra: { isEmoji: true, text: faces[Math.floor(Math.random() * faces.length)] }
        });
      }
    }
    // Hearts orbiting paths
    else if (nextEvent.id === 'hearts-orbit') {
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 3;
        list.push({
          x: width / 2,
          y: height / 2,
          vx: Math.cos(angle) * sp,
          vy: Math.sin(angle) * sp,
          size: 6 + Math.random() * 4,
          color: '#f43f5e',
          alpha: 1.0,
          life: 0,
          maxLife: 140,
          extra: { isEmoji: true, text: '💖' }
        });
      }
    }
    // Meteor strike sparks
    else if (nextEvent.id === 'meteor-shower') {
      for (let i = 0; i < 15; i++) {
        list.push({
          x: width * 0.4 + Math.random() * (width * 0.7),
          y: -50 - Math.random() * 150,
          vx: -5 - Math.random() * 4,
          vy: 6 + Math.random() * 5,
          size: 3 + Math.random() * 3,
          color: '#ff7849',
          alpha: 1.0,
          life: 0,
          maxLife: 100,
          extra: { gravity: 0.05 }
        });
      }
    }
    // Supermassive shockwave
    else if (nextEvent.id === 'supernova') {
      for (let i = 0; i < 120; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 6 + Math.random() * 6;
        list.push({
          x: width / 2,
          y: height / 2,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          size: 2 + Math.random() * 3,
          color: `hsl(${30 + Math.random() * 30}, 95%, 65%)`,
          alpha: 1.0,
          life: 0,
          maxLife: 40 + Math.random() * 20
        });
      }
    }
    // Standard elastic ball bouncy mode
    else if (nextEvent.id === 'super-bouncy-balls') {
      for (let i = 0; i < 40; i++) {
        list.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          size: 4 + Math.random() * 6,
          color: `hsl(${Math.random() * 360}, 90%, 60%)`,
          alpha: 1.0,
          life: 0,
          maxLife: 200
        });
      }
    }
    // Ping pong bouncer balls
    else if (nextEvent.id === 'ping-pong') {
      for (let i = 0; i < 8; i++) {
        list.push({
          x: 50 + Math.random() * (width - 100),
          y: 50 + Math.random() * (height - 100),
          vx: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3),
          vy: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3),
          size: 15,
          color: '#cbd5e1',
          alpha: 1.0,
          life: 0,
          maxLife: 400,
          extra: { isBall: true }
        });
      }
    }
    // Otherwise spawn random color spark dust
    else {
      for (let i = 0; i < 60; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 6;
        list.push({
          x: width / 2,
          y: height / 2,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          size: 1.2 + Math.random() * 2.5,
          color: nextEvent.accent,
          alpha: 1.0,
          life: 0,
          maxLife: 40 + Math.random() * 40
        });
      }
    }

    particlesRef.current = list;

    // 5. Append new item to historical logs list (maintain max 10 elements)
    const stamp = new Date().toLocaleTimeString();
    const logItem = {
      id: `${nextEvent.id}-${Date.now()}`,
      name: nextEvent.name,
      emoji: nextEvent.emoji,
      desc: nextEvent.description,
      timestamp: stamp
    };
    setHistory([logItem, ...history.slice(0, 9)]);
  };

  // Tracking mouse coordinate offsets inside the canvas element
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    cursorPosRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * dimensions.width,
      y: ((e.clientY - rect.top) / rect.height) * dimensions.height
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    cursorPosRef.current = {
      x: ((e.touches[0].clientX - rect.left) / rect.width) * dimensions.width,
      y: ((e.touches[0].clientY - rect.top) / rect.height) * dimensions.height
    };
  };

  // Share Streak Message copy to Clipboard
  const handleShare = () => {
    const text = `Press the Lucky Button! 🍀 I have pressed it ${presses} times and triggered "${currentEvent.emoji} ${currentEvent.name}". Can you beat my cosmic streak? Try it at ${window.location.origin}/lucky-button`;
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  // Reset counters & historical records
  const handleReset = () => {
    setPresses(0);
    const defaultEvent = {
      id: 'intro',
      name: 'The Monolith Awakens',
      emoji: '✨',
      description: 'Press the giant glowing button to trigger unpredictable physics and visual anomalies.',
      color: 'orange',
      accent: '#f97316'
    };
    setCurrentEvent(defaultEvent);
    activeEventIdRef.current = defaultEvent.id;
    setHistory([defaultEvent as any]);
    setButtonScaleClass('scale-100 hover:scale-105 active:scale-95');
    setIsRainbow(false);
    particlesRef.current = [];
  };

  // Color classes helper based on active event color
  const getGlowStyles = (color: string) => {
    switch (color) {
      case 'rose': return { text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/40 border-rose-500 bg-rose-950/40 text-rose-300' };
      case 'amber': return { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/40 border-amber-500 bg-amber-950/40 text-amber-300' };
      case 'indigo': return { text: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10', glow: 'shadow-indigo-500/40 border-indigo-500 bg-indigo-950/40 text-indigo-300' };
      case 'orange': return { text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/40 border-orange-500 bg-orange-950/40 text-orange-300' };
      case 'teal': return { text: 'text-teal-400', border: 'border-teal-500/20', bg: 'bg-teal-500/10', glow: 'shadow-teal-500/40 border-teal-500 bg-teal-950/40 text-teal-300' };
      case 'fuchsia': return { text: 'text-fuchsia-400', border: 'border-fuchsia-500/20', bg: 'bg-fuchsia-500/10', glow: 'shadow-fuchsia-500/40 border-fuchsia-500 bg-fuchsia-950/40 text-fuchsia-300' };
      case 'sky': return { text: 'text-sky-400', border: 'border-sky-500/20', bg: 'bg-sky-500/10', glow: 'shadow-sky-500/40 border-sky-500 bg-sky-950/40 text-sky-300' };
      case 'cyan': return { text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10', glow: 'shadow-cyan-500/40 border-cyan-500 bg-cyan-950/40 text-cyan-300' };
      case 'violet': return { text: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/10', glow: 'shadow-violet-500/40 border-violet-500 bg-violet-950/40 text-violet-300' };
      case 'emerald': return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/40 border-emerald-500 bg-emerald-950/40 text-emerald-300' };
      default: return { text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/40 border-orange-500 bg-orange-950/40 text-orange-300' };
    }
  };

  const themeClasses = getGlowStyles(currentEvent.color);

  return (
    <div className="flex flex-col gap-4 w-full h-full select-none">
      
      {/* Top micro header with title, counter, and actions */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase">
            Lucky Button v2.0
          </span>
        </div>

        {/* Action controls right in the header for sleek space saving */}
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-2.5 py-1 text-[11px] font-mono text-orange-400 font-bold tracking-wider">
            PRESSES: {presses}
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 active:scale-95 transition-all cursor-pointer"
            title="Reset history and presses"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-mono font-bold tracking-wider uppercase active:scale-95 transition-all shadow-lg shadow-orange-600/20 cursor-pointer"
          >
            <Share2 size={11} /> Share
          </button>
        </div>
      </div>

      {/* Main Chamber Container (holds canvas & centered button) */}
      <motion.div 
        ref={containerRef}
        animate={isShaking ? {
          x: [-4, 4, -4, 4, 0],
          y: [-2, 2, -2, 2, 0],
          rotate: [-1, 1, -1, 1, 0]
        } : {}}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group flex items-center justify-center min-h-[380px] h-[380px]"
      >
        <canvas 
          ref={canvasRef} 
          width={dimensions.width} 
          height={dimensions.height} 
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="absolute inset-0 w-full h-full block cursor-pointer z-0"
        />

        {/* Chamber scanner glow vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/40 pointer-events-none z-10" />

        {/* Interactive Centered Giant Glowing Monolith Button */}
        <div className="relative z-20 flex flex-col items-center justify-center pointer-events-auto">
          <motion.button 
            onClick={triggerEvent}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full font-bold uppercase select-none transition-all duration-300 flex flex-col items-center justify-center relative cursor-pointer focus:outline-none border-[3px] shadow-[0_0_40px_rgba(0,0,0,0.6)] ${themeClasses.glow}`}
            style={{
              borderColor: currentEvent.accent,
              boxShadow: `0 0 35px ${currentEvent.accent}66, inset 0 0 20px ${currentEvent.accent}33`,
            }}
          >
            {/* Glossy top reflection highlight */}
            <div className="absolute top-1 left-4 right-4 h-6 bg-white/10 rounded-full blur-[2px]" />
            
            {/* Spinning radar perimeter ring */}
            <div 
              className="absolute -inset-[6px] rounded-full border border-dashed opacity-40 animate-[spin_10s_linear_infinite]"
              style={{ borderColor: currentEvent.accent }}
            />

            {/* Glowing active core */}
            <div 
              className="absolute inset-2 rounded-full opacity-60 animate-pulse"
              style={{
                background: `radial-gradient(circle, ${currentEvent.accent} 0%, rgba(0,0,0,0) 80%)`
              }}
            />

            {/* Tap icon/label overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-1 text-white">
              <Zap size={28} className="animate-bounce text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
              <span className="text-[12px] font-mono tracking-widest font-extrabold text-white drop-shadow-md">LUCKY</span>
              <span className="text-[9px] font-mono tracking-wider opacity-75 text-slate-200 font-semibold drop-shadow-sm">PRESS ME</span>
            </div>
          </motion.button>
          
          {/* Circular Microtext underneath the button */}
          <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mt-4 select-none animate-pulse">
            ★ Press and see micro-anomaly ★
          </span>
        </div>

        {/* Real-time active event bubble */}
        <div className="absolute bottom-3 inset-x-3 bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 flex items-center gap-3 select-none transition-all duration-300 shadow-lg z-20 pointer-events-none">
          <span className="text-3xl filter drop-shadow animate-[bounce_2s_infinite]">{currentEvent.emoji}</span>
          <div className="flex-1 min-w-0">
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${themeClasses.text} truncate`}>
              {currentEvent.name}
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
              {currentEvent.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tiny strip: recent history emojis */}
      <div className="flex items-center justify-between bg-slate-900/30 border border-slate-800/40 rounded-xl p-2 px-3 text-[10px] font-mono">
        <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Recent Sparks:</span>
        <div className="flex items-center gap-2">
          {history.slice(0, 7).map((log) => (
            <div 
              key={log.id} 
              className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              title={`${log.emoji} ${log.name}`}
            >
              <span className="text-sm select-none">{log.emoji}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share clipboard notification toast */}
      <AnimatePresence>
        {showCopied && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3 shadow-2xl max-w-sm"
          >
            <Check className="text-emerald-400 shrink-0" size={18} />
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase">Streak Copied!</span>
              <span className="text-[10px] text-slate-400">Share with friends to challenge their luck.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// -----------------------------------------------------------------
// 12. DON'T PRESS THE RED BUTTON MINI TOY
// -----------------------------------------------------------------
const DontPressRedButtonToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorPosRef = useRef({ x: 0, y: 0 });
  const dimensionsRef = useRef({ width: 400, height: 350 });

  // Game state
  const [presses, setPresses] = useState<number>(0);
  const [currentEvent, setCurrentEvent] = useState<any>({
    id: 'none',
    name: 'Standby Alert 🚨',
    emoji: '🚨',
    desc: 'Strictly DO NOT press the giant red button in the center.',
    accent: '#ef4444'
  });
  const [history, setHistory] = useState<any[]>([]);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [isRainbow, setIsRainbow] = useState<boolean>(false);
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const [tauntText, setTauntText] = useState<string>("DO NOT PRESS THE RED BUTTON.");
  
  // Custom modifiers
  const [buttonOffset, setButtonOffset] = useState({ x: 0, y: 0 });
  const [buttonScale, setButtonScale] = useState<number>(1.0);
  const [isGhost, setIsGhost] = useState<boolean>(false);
  const [activeRansom, setActiveRansom] = useState<boolean>(false);
  const [activeNuclear, setActiveNuclear] = useState<boolean>(false);
  const [nuclearCountdown, setNuclearCountdown] = useState<number>(3);
  const [upsideDownActive, setUpsideDownActive] = useState<boolean>(false);

  // Particle list
  const particlesRef = useRef<any[]>([]);
  const activeEventRef = useRef<string>('none');
  const [dimensions, setDimensions] = useState({ width: 400, height: 350 });

  const RED_BUTTON_EVENTS = [
    { id: 'confetti', name: 'Illegal Celebration 🎉', emoji: '🎉', desc: 'Who authorized this party?!', accent: '#f43f5e' },
    { id: 'screenshake', name: 'Violent Earthquakes 🫨', emoji: '🫨', desc: 'You rattled the structural foundations!', accent: '#ef4444' },
    { id: 'runaway', name: 'Button Escapes! 🏃‍♂️', emoji: '🏃‍♂️', desc: 'The button got scared and ran away!', accent: '#fbbf24' },
    { id: 'clones', name: 'Button Multiplication! 👥', emoji: '👥', desc: 'Oh no, they are multiplying!', accent: '#ec4899' },
    { id: 'emoji-storm', name: 'Clown Uprising 🤡', emoji: '🤡', desc: 'You clicked so much, clowns invaded.', accent: '#a855f7' },
    { id: 'giant', name: 'Button Gigantism! 🦍', emoji: '🦍', desc: 'Absolute absolute absolute unit.', accent: '#ef4444' },
    { id: 'tiny', name: 'Button Shrinkage! 🐜', emoji: '🐜', desc: 'Where did it go? Grab the magnifying glass.', accent: '#10b981' },
    { id: 'fake-loading', name: 'System Breach! 💾', emoji: '💾', desc: 'Installing "TotallyNotAVirus.exe"...', accent: '#3b82f6' },
    { id: 'alien', name: 'UFO Beam Inbound! 🛸', emoji: '🛸', desc: 'They want to study your finger clicking habits.', accent: '#06b6d4' },
    { id: 'glitch', name: 'Cyberpunk Glitch! 👾', emoji: '👾', desc: 'Spooky screen hardware malfunction.', accent: '#14b8a6' },
    { id: 'rainbow', name: 'RGB Rave Mode 🌈', emoji: '🌈', desc: 'High-frequency visual spectrum active!', accent: '#ec4899' },
    { id: 'reverse', name: 'Drunken Controls 🌀', emoji: '🌀', desc: 'Everything is spinning and inverted!', accent: '#8b5cf6' },
    { id: 'gravity', name: 'Gravity Inversion! 🎈', emoji: '🎈', desc: 'Things fall up, rules do not apply.', accent: '#6366f1' },
    { id: 'meteor', name: 'Cosmic Meteor Shower ☄️', emoji: '☄️', desc: 'Dodge the incoming blazing space rocks!', accent: '#f97316' },
    { id: 'portal', name: 'Vortex Anomaly 🌀', emoji: '🌀', desc: 'Sucking all particles into the void.', accent: '#d946ef' },
    { id: 'laser', name: 'Security Laser Sweep 🚨', emoji: '🚨', desc: 'Do not trigger the lasers... wait too late.', accent: '#f43f5e' },
    { id: 'cats', name: 'Raining Kittens! 🐱', emoji: '🐱', desc: 'The internet is 99% cats. Including here.', accent: '#eab308' },
    { id: 'cake', name: 'Sweet Rainfall 🍩', emoji: '🍩', desc: 'It is raining delicious donuts and cake!', accent: '#f472b6' },
    { id: 'sparks', name: 'Short Circuit! ⚡', emoji: '⚡', desc: 'High voltage electrical malfunction!', accent: '#38bdf8' },
    { id: 'water', name: 'Submarine Bubble Zone 🫧', emoji: '🫧', desc: 'Drowning in beautiful bouncy bubbles.', accent: '#0ea5e9' },
    { id: 'ghost', name: 'Spectral Phaseout 👻', emoji: '👻', desc: 'The button became a ghost. Booo!', accent: '#94a3b8' },
    { id: 'matrix', name: 'Digital Matrix Grid 💻', emoji: '💻', desc: 'Wake up, Neo... select another button.', accent: '#22c55e' },
    { id: 'fireworks', name: 'Victory Fireworks 🎆', emoji: '🎆', desc: 'You successfully disobeyed instructions!', accent: '#e11d48' },
    { id: 'pixel-rain', name: '8-Bit Retro Rain 👾', emoji: '👾', desc: 'Chunky low-resolution square precipitation.', accent: '#f59e0b' },
    { id: 'ransom', name: 'Cute Hostage Popup 🍪', emoji: '🍪', desc: 'Pay 1 imaginary cookie to unlock screen.', accent: '#ea580c' },
    { id: 'slow-motion', name: 'Slow-Mo Time Bubble ⏳', emoji: '⏳', desc: 'Relativity slows everything down.', accent: '#3b82f6' },
    { id: 'fast-forward', name: 'Ludicrous Speed! 🚀', emoji: '🚀', desc: 'Hyperdrive throttle is pinned down.', accent: '#ef4444' },
    { id: 'magnet', name: 'Cursor Singularity 🧲', emoji: '🧲', desc: 'Cursor is emitting super magnetic force.', accent: '#d946ef' },
    { id: 'boring', name: 'Plain Dull Button 😑', emoji: '😑', desc: 'Boring mode engaged. Highly uninteresting.', accent: '#64748b' },
    { id: 'upside-down', name: 'Upside-Down Flip! 🤸‍♀️', emoji: '🤸‍♀️', desc: 'A literal shift in perspective.', accent: '#ec4899' },
    { id: 'nuclear', name: 'Self Destruct Sequence! ☢️', emoji: '☢️', desc: 'Evacuate immediately! This is not a drill.', accent: '#ef4444' },
    { id: 'confused-cat', name: 'Confused Cat Wanders 🐈', emoji: '🐈', desc: 'A lost kitten wanders across the panel.', accent: '#fb923c' }
  ];

  const TAUNTS = [
    "Do not press this button.",
    "Hey! Stop clicking me!",
    "Seriously, don't.",
    "What part of DO NOT didn't you understand?",
    "Self destruct sequence initialized...",
    "Ok, that didn't work. Please stop.",
    "Every click makes the button angrier.",
    "I'm going to run away if you click again!",
    "Seriously, I will teleport!",
    "Stop! You are breaking the spacetime continuum!",
    "You are very stubborn, aren't you?",
    "A cosmic anomaly is opening!",
    "Your mouse feels heavier...",
    "How about some reverse psychology? PRESS ME! Go on!",
    "Wait... don't do that.",
    "Sending passive-aggressive email to your boss... 📧",
    "Deleting your internet history in 3... 2...",
    "Evacuating all pixels...",
    "Fine. Click all you want. I don't care.",
    "That tickles! Ahaha! 😂",
    "Your self control is officially zero.",
    "Are you still here? Go press something else!",
    "Alert! Button temp rising! 🔥",
    "Warning: Extreme cute cats detected!",
    "Is this a joke to you?",
    "Please walk away slowly.",
    "Stop clicking! My screen is dusty.",
    "You clicked! A kitten is slightly confused.",
    "Click counter is rising. Are you proud?",
    "Danger! Do not click!",
    "Please touch grass."
  ];

  // Monitor canvas size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      const w = Math.max(width, 100);
      const h = Math.max(height, 100);
      setDimensions({ width: w, height: h });
      dimensionsRef.current = { width: w, height: h };
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 60FPS Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameIdx = 0;

    const runFrame = () => {
      frameIdx++;
      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);

      // Base background gradient
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Vortex background ring
      const eventId = activeEventRef.current;
      if (eventId === 'portal') {
        ctx.strokeStyle = 'rgba(217, 70, 239, 0.15)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 70 + Math.sin(frameIdx * 0.05) * 15, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 100 + Math.cos(frameIdx * 0.05) * 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Matrix Digital grid effect background
      if (eventId === 'matrix') {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
        for (let x = 10; x < width; x += 30) {
          ctx.fillRect(x, (frameIdx * 1.5 + x) % height, 2, 20);
        }
      }

      // Rainbow RGB Rave pulsing glow
      if (eventId === 'rainbow') {
        const hue = (frameIdx * 2) % 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 10%, 0.15)`;
        ctx.fillRect(0, 0, width, height);
      }

      // Security lasers sweeping
      if (eventId === 'laser') {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.lineWidth = 2;
        const lx = width / 2 + Math.sin(frameIdx * 0.03) * (width / 2);
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(width - lx, height);
        ctx.stroke();

        const ly = height / 2 + Math.cos(frameIdx * 0.03) * (height / 2);
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(width, height - ly);
        ctx.stroke();
      }

      // Render & Update particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life > p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Custom update math per category
        if (p.extra?.isBubble) {
          p.y += p.vy;
          p.x += Math.sin(p.life * 0.04 + p.extra.sway) * 0.5;
          ctx.strokeStyle = p.color;
          ctx.fillStyle = 'rgba(14, 165, 233, 0.03)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          continue;
        }

        if (p.extra?.isEmoji) {
          p.y += p.vy;
          p.x += Math.sin(p.life * 0.03) * 0.4;
          ctx.font = `${p.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.globalAlpha = 1 - p.life / p.maxLife;
          ctx.fillText(p.extra.text, p.x, p.y);
          ctx.globalAlpha = 1.0;
          continue;
        }

        if (p.extra?.isMatrix) {
          p.y += p.vy;
          ctx.font = `${p.size}px monospace`;
          ctx.fillStyle = p.color;
          ctx.textAlign = 'center';
          ctx.globalAlpha = 1 - p.life / p.maxLife;
          ctx.fillText(p.extra.char, p.x, p.y);
          ctx.globalAlpha = 1.0;
          if (p.y > height + 20) p.y = -20;
          continue;
        }

        if (p.extra?.isVortex) {
          const dx = width / 2 - p.x;
          const dy = height / 2 - p.y;
          const dist = Math.hypot(dx, dy) + 1;
          const angle = Math.atan2(dy, dx) + Math.PI / 2 + 0.1;
          p.vx = p.vx * 0.9 + Math.cos(angle) * 1.5 + (dx / dist) * 0.5;
          p.vy = p.vy * 0.9 + Math.sin(angle) * 1.5 + (dy / dist) * 0.5;
        }

        if (p.extra?.isClone) {
          p.x += p.vx;
          p.y += p.vy;
          // Bounce off boundary edges
          if (p.x < p.size || p.x > width - p.size) p.vx *= -1;
          if (p.y < p.size || p.y > height - p.size) p.vy *= -1;

          // Draw small bouncing buttons
          ctx.fillStyle = '#ef4444';
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('NO', p.x, p.y);
          continue;
        }

        if (p.extra?.isCat) {
          p.x += p.vx;
          p.y += p.vy;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.extra.rot);
          ctx.font = `${p.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🐈', 0, 0);
          ctx.restore();
          continue;
        }

        // Apply general magnet attraction
        if (eventId === 'magnet') {
          const dx = cursorPosRef.current.x - p.x;
          const dy = cursorPosRef.current.y - p.y;
          const dist = Math.hypot(dx, dy) + 10;
          p.vx += (dx / dist) * 0.4;
          p.vy += (dy / dist) * 0.4;
        }

        // Normal spark translation
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(runFrame);
    };

    runFrame();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Capture mouse cords
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    cursorPosRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * dimensions.width,
      y: ((e.clientY - rect.top) / rect.height) * dimensions.height
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    cursorPosRef.current = {
      x: ((e.touches[0].clientX - rect.left) / rect.width) * dimensions.width,
      y: ((e.touches[0].clientY - rect.top) / rect.height) * dimensions.height
    };
  };

  // Runaway button mouse hover trigger
  const handleButtonMouseEnter = () => {
    if (currentEvent.id === 'runaway') {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        // Teleport to random spot within borders
        const rx = (Math.random() - 0.5) * (rect.width - 150);
        const ry = (Math.random() - 0.5) * (rect.height - 180);
        setButtonOffset({ x: rx, y: ry });
        
        // Spawn sparks trail of escape
        const { width, height } = dimensionsRef.current;
        const list = particlesRef.current;
        for (let i = 0; i < 20; i++) {
          list.push({
            x: width / 2 + buttonOffset.x,
            y: height / 2 + buttonOffset.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: 2 + Math.random() * 2,
            color: '#fbbf24',
            life: 0,
            maxLife: 30 + Math.random() * 20
          });
        }
      }
    }
  };

  // Big Button Core trigger logic
  const triggerEvent = () => {
    // 1. Increment presses
    const nextPresses = presses + 1;
    setPresses(nextPresses);

    // 2. Select a truly random event different from current
    let nextEvent = currentEvent;
    while (nextEvent.id === currentEvent.id || nextEvent.id === 'none') {
      nextEvent = RED_BUTTON_EVENTS[Math.floor(Math.random() * RED_BUTTON_EVENTS.length)];
    }

    // 3. Select random funny taunting warning string
    const nextTaunt = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
    setTauntText(nextTaunt);

    // 4. Reset modifiers
    setButtonOffset({ x: 0, y: 0 });
    setButtonScale(1.0);
    setIsGhost(false);
    setIsRainbow(false);
    setIsGlitching(false);
    setActiveRansom(false);
    setActiveNuclear(false);
    setUpsideDownActive(false);

    // Update active reference
    activeEventRef.current = nextEvent.id;
    setCurrentEvent(nextEvent);

    // 5. Apply event custom modifiers
    const { width, height } = dimensionsRef.current;
    const list: any[] = [];

    if (nextEvent.id === 'screenshake' || nextEvent.id === 'nuclear') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }

    if (nextEvent.id === 'glitch') {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 600);
    }

    if (nextEvent.id === 'giant') {
      setButtonScale(1.7);
    }

    if (nextEvent.id === 'tiny') {
      setButtonScale(0.35);
    }

    if (nextEvent.id === 'ghost') {
      setIsGhost(true);
    }

    if (nextEvent.id === 'rainbow') {
      setIsRainbow(true);
    }

    if (nextEvent.id === 'upside-down') {
      setUpsideDownActive(true);
    }

    if (nextEvent.id === 'ransom') {
      setActiveRansom(true);
    }

    if (nextEvent.id === 'nuclear') {
      setActiveNuclear(true);
      setNuclearCountdown(3);
    }

    // 6. Spawn specific particles in ref
    if (nextEvent.id === 'confetti') {
      for (let i = 0; i < 90; i++) {
        list.push({
          x: width / 2,
          y: height / 2,
          vx: (Math.random() - 0.5) * 10,
          vy: -Math.random() * 8 - 3,
          size: 3 + Math.random() * 4,
          color: `hsl(${Math.random() * 360}, 95%, 65%)`,
          life: 0,
          maxLife: 100 + Math.random() * 50
        });
      }
    } else if (nextEvent.id === 'emoji-storm') {
      const emojis = ['🤡', '💩', '👻', '🤪', '🔥', '💥', '👀', '🤐'];
      for (let i = 0; i < 30; i++) {
        list.push({
          x: width / 2,
          y: height / 2,
          vx: (Math.random() - 0.5) * 6,
          vy: -2 - Math.random() * 5,
          size: 18 + Math.random() * 10,
          color: '#ffffff',
          life: 0,
          maxLife: 120,
          extra: { isEmoji: true, text: emojis[Math.floor(Math.random() * emojis.length)] }
        });
      }
    } else if (nextEvent.id === 'meteor') {
      for (let i = 0; i < 20; i++) {
        list.push({
          x: Math.random() * width + 50,
          y: -40,
          vx: -4 - Math.random() * 3,
          vy: 5 + Math.random() * 5,
          size: 3 + Math.random() * 3,
          color: '#f97316',
          life: 0,
          maxLife: 100
        });
      }
    } else if (nextEvent.id === 'cats') {
      for (let i = 0; i < 15; i++) {
        list.push({
          x: Math.random() * width,
          y: -50 - Math.random() * 100,
          vx: (Math.random() - 0.5) * 3,
          vy: 2 + Math.random() * 3,
          size: 24 + Math.random() * 8,
          color: '#ffffff',
          life: 0,
          maxLife: 180,
          extra: { isCat: true, rot: (Math.random() - 0.5) * 1.5 }
        });
      }
    } else if (nextEvent.id === 'cake') {
      const sweets = ['🍩', '🧁', '🍰', '🍪', '🍬', '🍫', '🍦'];
      for (let i = 0; i < 25; i++) {
        list.push({
          x: Math.random() * width,
          y: -40 - Math.random() * 120,
          vx: (Math.random() - 0.5) * 2,
          vy: 3 + Math.random() * 3,
          size: 20 + Math.random() * 6,
          color: '#ffffff',
          life: 0,
          maxLife: 150,
          extra: { isEmoji: true, text: sweets[Math.floor(Math.random() * sweets.length)] }
        });
      }
    } else if (nextEvent.id === 'water') {
      for (let i = 0; i < 40; i++) {
        list.push({
          x: Math.random() * width,
          y: height + 20,
          vx: 0,
          vy: -1.5 - Math.random() * 2,
          size: 4 + Math.random() * 8,
          color: '#38bdf8',
          life: 0,
          maxLife: 220,
          extra: { isBubble: true, sway: Math.random() * Math.PI }
        });
      }
    } else if (nextEvent.id === 'matrix') {
      const charSet = '0123456789ABCDEF$#@%&*';
      for (let i = 0; i < 35; i++) {
        list.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          vx: 0,
          vy: 1.5 + Math.random() * 2,
          size: 10 + Math.random() * 5,
          color: '#22c55e',
          life: 0,
          maxLife: 300,
          extra: { isMatrix: true, char: charSet[Math.floor(Math.random() * charSet.length)] }
        });
      }
    } else if (nextEvent.id === 'clones') {
      for (let i = 0; i < 4; i++) {
        list.push({
          x: 50 + Math.random() * (width - 100),
          y: 50 + Math.random() * (height - 100),
          vx: (Math.random() > 0.5 ? 2 : -2) * (1.5 + Math.random() * 2.5),
          vy: (Math.random() > 0.5 ? 2 : -2) * (1.5 + Math.random() * 2.5),
          size: 20,
          color: '#ef4444',
          life: 0,
          maxLife: 400,
          extra: { isClone: true }
        });
      }
    } else if (nextEvent.id === 'portal') {
      for (let i = 0; i < 70; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 120 + Math.random() * 150;
        list.push({
          x: width / 2 + Math.cos(a) * r,
          y: height / 2 + Math.sin(a) * r,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 1.5 + Math.random() * 2,
          color: `hsl(${280 + Math.random() * 40}, 95%, 65%)`,
          life: 0,
          maxLife: 150,
          extra: { isVortex: true }
        });
      }
    } else if (nextEvent.id === 'fireworks') {
      for (let j = 0; j < 3; j++) {
        const fx = width * 0.2 + Math.random() * (width * 0.6);
        const fy = height * 0.2 + Math.random() * (height * 0.4);
        const hue = Math.random() * 360;
        for (let i = 0; i < 40; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = 1.5 + Math.random() * 4.5;
          list.push({
            x: fx,
            y: fy,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s,
            size: 1.5 + Math.random() * 1.5,
            color: `hsl(${hue}, 95%, 65%)`,
            life: 0,
            maxLife: 40 + Math.random() * 30
          });
        }
      }
    } else if (nextEvent.id === 'sparks') {
      for (let i = 0; i < 60; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 3 + Math.random() * 6;
        list.push({
          x: width / 2,
          y: height / 2,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          size: 1.2 + Math.random() * 2,
          color: '#38bdf8',
          life: 0,
          maxLife: 30 + Math.random() * 20
        });
      }
    } else if (nextEvent.id === 'pixel-rain') {
      for (let i = 0; i < 40; i++) {
        list.push({
          x: Math.random() * width,
          y: -20 - Math.random() * 100,
          vx: 0,
          vy: 3 + Math.random() * 3,
          size: 5 + Math.random() * 4,
          color: `hsl(${20 + Math.random() * 25}, 95%, 60%)`,
          life: 0,
          maxLife: 120
        });
      }
    } else {
      // General fallbacks (sparks)
      for (let i = 0; i < 45; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 4;
        list.push({
          x: width / 2,
          y: height / 2,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          size: 1.5 + Math.random() * 2,
          color: nextEvent.accent,
          life: 0,
          maxLife: 40 + Math.random() * 30
        });
      }
    }

    particlesRef.current = list;

    // 7. Update logs strip
    const logItem = {
      id: `${nextEvent.id}-${Date.now()}`,
      name: nextEvent.name,
      emoji: nextEvent.emoji,
      desc: nextEvent.description || nextEvent.desc,
      timestamp: new Date().toLocaleTimeString()
    };
    setHistory([logItem, ...history.slice(0, 9)]);
  };

  // Nuclear Countdown Loop trigger
  useEffect(() => {
    if (!activeNuclear || nuclearCountdown <= 0) {
      if (activeNuclear && nuclearCountdown === 0) {
        // Boom! Flash and reset
        setIsShaking(true);
        setIsGlitching(true);
        setTimeout(() => {
          setIsShaking(false);
          setIsGlitching(false);
          setActiveNuclear(false);
          setTauntText("Indestructible Button! System reboot completed.");
          // Erupt a golden donut shower
          const list = particlesRef.current;
          const { width, height } = dimensionsRef.current;
          for (let i = 0; i < 50; i++) {
            list.push({
              x: width / 2,
              y: height / 2,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              size: 4 + Math.random() * 4,
              color: '#f43f5e',
              life: 0,
              maxLife: 80
            });
          }
        }, 1000);
      }
      return;
    }

    const timer = setTimeout(() => {
      setNuclearCountdown(nuclearCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeNuclear, nuclearCountdown]);

  // Share Streak
  const handleShare = () => {
    const text = `⚠️ WARNING! I disobeyed rules and pressed the Forbidden Red Button ${presses} times! I triggered: "${currentEvent.emoji} ${currentEvent.name}". Can your self-control beat mine? Try not to press it at: ${window.location.origin}/dont-press-the-red-button`;
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  // Reset Console
  const handleReset = () => {
    setPresses(0);
    const defaultEvent = {
      id: 'none',
      name: 'Standby Alert 🚨',
      emoji: '🚨',
      desc: 'Strictly DO NOT press the giant red button in the center.',
      accent: '#ef4444'
    };
    setCurrentEvent(defaultEvent);
    activeEventRef.current = defaultEvent.id;
    setHistory([]);
    setButtonOffset({ x: 0, y: 0 });
    setButtonScale(1.0);
    setIsGhost(false);
    setIsRainbow(false);
    setIsGlitching(false);
    setActiveRansom(false);
    setActiveNuclear(false);
    setUpsideDownActive(false);
    setTauntText("DO NOT PRESS THE RED BUTTON.");
    particlesRef.current = [];
  };

  // Ransom Cookie Payoff
  const payRansomCookie = () => {
    setActiveRansom(false);
    setTauntText("Yum! Cookie accepted. Button unlocked.");
    
    // Spawn digital gold cookie sparks
    const { width, height } = dimensionsRef.current;
    const list = particlesRef.current;
    for (let i = 0; i < 40; i++) {
      list.push({
        x: width / 2,
        y: height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 8 - 2,
        size: 16 + Math.random() * 8,
        color: '#ffffff',
        life: 0,
        maxLife: 100,
        extra: { isEmoji: true, text: '🍪' }
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full select-none">
      
      {/* Mini top header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">
            SENSITIVE COMPONENT: DO NOT TOUCH
          </span>
        </div>

        {/* Counter & Action Controls */}
        <div className="flex items-center gap-3">
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg px-2.5 py-1 text-[11px] font-mono text-rose-400 font-bold tracking-wider">
            VIOLATIONS: {presses}
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 active:scale-95 transition-all cursor-pointer"
            title="Reset violations log"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-mono font-bold tracking-wider uppercase active:scale-95 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <Share2 size={11} /> Share
          </button>
        </div>
      </div>

      {/* Main Container Playground */}
      <motion.div
        ref={containerRef}
        animate={isShaking ? {
          x: [-5, 5, -5, 5, 0],
          y: [-3, 3, -3, 3, 0],
          rotate: [-1.2, 1.2, -1.2, 1.2, 0]
        } : {}}
        transition={{ duration: 0.4 }}
        style={{ filter: isGlitching ? 'hue-rotate(90deg) invert(0.1) saturate(2)' : 'none' }}
        className={`relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center min-h-[380px] h-[380px] transition-transform duration-300 ${upsideDownActive ? 'rotate-180' : ''}`}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="absolute inset-0 w-full h-full block cursor-pointer z-0"
        />

        {/* Ambient warning stripes at top/bottom border */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-stripes pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-stripes pointer-events-none z-10" />

        {/* Dynamic warning taunt label */}
        <div className="absolute top-4 inset-x-4 flex flex-col items-center justify-center z-20 pointer-events-none text-center">
          <motion.div 
            key={tauntText}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-950/80 backdrop-blur-md border border-rose-500/30 rounded-full px-4 py-1.5 text-[11px] font-mono font-bold text-rose-300 tracking-wide shadow-md uppercase"
          >
            ⚠️ {tauntText}
          </motion.div>
        </div>

        {/* Giant Red Button Element */}
        <div 
          className="relative z-20 flex flex-col items-center justify-center transition-all duration-300 ease-out"
          style={{
            transform: `translate(${buttonOffset.x}px, ${buttonOffset.y}px) scale(${buttonScale})`,
            opacity: isGhost ? 0.15 : 1.0,
          }}
        >
          <motion.button
            onClick={triggerEvent}
            onMouseEnter={handleButtonMouseEnter}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.88 }}
            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full font-extrabold uppercase transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer focus:outline-none border-[4px] border-rose-600 bg-rose-700 shadow-[0_0_50px_rgba(239,68,68,0.5)] select-none hover:bg-rose-600 active:bg-rose-800"
            style={{
              boxShadow: `0 0 45px rgba(239, 68, 68, 0.65), inset 0 0 25px rgba(255,255,255,0.25)`,
            }}
          >
            {/* Reflective shine dome */}
            <div className="absolute top-1.5 left-5 right-5 h-8 bg-white/20 rounded-full blur-[2px]" />

            {/* Pulsing warning aura ring */}
            <div className="absolute -inset-[8px] rounded-full border border-dashed border-rose-500/50 animate-[spin_12s_linear_infinite]" />

            {/* Radial glow gradient */}
            <div className="absolute inset-2 rounded-full opacity-50 bg-[radial-gradient(circle,white_0%,transparent_70%)]" />

            {/* In-button labeling */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 text-white">
              <span className="text-[14px] font-mono tracking-widest font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">DO NOT</span>
              <span className="text-[16px] font-mono tracking-wider font-black text-rose-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">PRESS</span>
            </div>
          </motion.button>

          {/* Optional microtext */}
          <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase mt-4 select-none animate-pulse">
            ☠️ Self-control recommended ☠️
          </span>
        </div>

        {/* Cyber Hostage Cookie Prompt overlay */}
        <AnimatePresence>
          {activeRansom && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-4 z-30 bg-slate-950/95 backdrop-blur-md border border-amber-500/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="text-4xl animate-bounce">🍪</div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">SCREEN HELD FOR COOKIE RANSOM</span>
                <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed mt-1">
                  You clicked the forbidden button and triggered our digital cookie snatcher. Hand over 1 imaginary cookie to regain access immediately!
                </p>
              </div>
              <button
                onClick={payRansomCookie}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-[10px] tracking-widest uppercase cursor-pointer active:scale-95 transition-all shadow-lg shadow-amber-600/20"
              >
                Submit Cookie 🍪
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Self-Destruct Nuclear Countdown Overlay */}
        <AnimatePresence>
          {activeNuclear && nuclearCountdown > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-rose-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center gap-2 pointer-events-none"
            >
              <span className="text-5xl animate-ping text-rose-500 font-bold mb-3 font-mono">{nuclearCountdown}</span>
              <span className="text-xs font-mono font-extrabold text-rose-400 uppercase tracking-widest animate-pulse">⚠️ CRITICAL THERMAL CORE FAILURE ⚠️</span>
              <span className="text-[10px] text-rose-300/80 font-mono">SELF-DESTRUCT INITIATED. STAND AWAY FROM MAIN CONSOLE.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic active event footer badge overlay */}
        <div className="absolute bottom-3 inset-x-3 bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 flex items-center gap-3 select-none transition-all duration-300 shadow-lg z-20 pointer-events-none">
          <span className="text-3xl filter drop-shadow animate-bounce">{currentEvent.emoji}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 truncate">
              {currentEvent.name}
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
              {currentEvent.desc}
            </p>
          </div>
        </div>

      </motion.div>

      {/* Small History Log strip */}
      <div className="flex items-center justify-between bg-slate-900/30 border border-slate-800/40 rounded-xl p-2 px-3 text-[10px] font-mono">
        <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Chaos Timeline:</span>
        <div className="flex items-center gap-2">
          {history.length === 0 ? (
            <span className="text-[9px] text-slate-600 italic">No events triggered yet...</span>
          ) : (
            history.slice(0, 7).map((log) => (
              <div 
                key={log.id} 
                className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                title={`${log.emoji} ${log.name}`}
              >
                <span className="text-sm select-none">{log.emoji}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Copy notification toast */}
      <AnimatePresence>
        {showCopied && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3 shadow-2xl max-w-sm"
          >
            <Check className="text-emerald-400 shrink-0" size={18} />
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase">Violation Stats Copied!</span>
              <span className="text-[10px] text-slate-400">Challenge your friends to disobey!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// -----------------------------------------------------------------
// 13. CATCH THE DOT MINI TOY
// -----------------------------------------------------------------
const CatchTheDotToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game states
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [bestScore, setBestScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  // Refs for the high-performance 60fps canvas render & physics loop
  const scoreRef = useRef<number>(0);
  const isGameOverRef = useRef<boolean>(false);
  const timeLeftRef = useRef<number>(30);
  const lastInteractTimeRef = useRef<number>(0);
  const dotRef = useRef<{ x: number, y: number, radius: number }>({ x: 150, y: 150, radius: 28 });
  const particlesRef = useRef<any[]>([]);
  const ripplesRef = useRef<any[]>([]);
  const shakeRef = useRef<number>(0);
  const flashRef = useRef<number>(0);
  
  // Color shifting tracking
  const bgColorRef = useRef<{ r: number, g: number, b: number }>({ r: 2, g: 6, b: 23 });
  const targetBgColorRef = useRef<{ r: number, g: number, b: number }>({ r: 2, g: 6, b: 23 });
  
  // Speed / automatic teleport tracking
  const lastJumpTimeRef = useRef<number>(0);
  const dimensionsRef = useRef({ width: 600, height: 400 });

  const COLOR_VALUES = [
    { r: 2, g: 6, b: 23 },    // Slate Blue
    { r: 15, g: 5, b: 45 },   // Cosmos Purple
    { r: 2, g: 30, b: 20 },   // Dark Forest
    { r: 35, g: 5, b: 20 },   // Ruby Void
    { r: 5, g: 25, b: 35 },   // Deep Ocean
    { r: 35, g: 20, b: 5 },   // Amber Void
  ];

  // Helper sound synthesizers
  const playSound = (type: 'tap' | 'miss' | 'levelUp' | 'gameOver') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'tap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'miss') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === 'levelUp') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'gameOver') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {
      console.warn('AudioContext blocked/failed:', e);
    }
  };

  // Safe dot position generator inside dimensions
  const teleportDot = () => {
    const s = scoreRef.current;
    const radius = Math.max(12, 28 - Math.floor(s / 5) * 2);
    const { width, height } = dimensionsRef.current;
    const padding = radius + 40;

    const minX = padding;
    const maxX = width - padding;
    const minY = padding;
    const maxY = height - padding;

    const rx = minX < maxX ? minX + Math.random() * (maxX - minX) : width / 2;
    const ry = minY < maxY ? minY + Math.random() * (maxY - minY) : height / 2;

    dotRef.current = { x: rx, y: ry, radius };
    lastJumpTimeRef.current = performance.now();
  };

  // Difficulty parameters based on score
  const getAutoJumpDelay = (s: number) => {
    const stage = Math.floor(s / 5);
    return Math.max(500, 1600 * Math.pow(0.9, stage));
  };

  // Load high score
  useEffect(() => {
    const stored = localStorage.getItem('catch_the_dot_best');
    if (stored) {
      setBestScore(parseInt(stored, 10));
    }
    // Start game immediately by setting last teleport time
    lastJumpTimeRef.current = performance.now();
  }, []);

  // HUD Synchronization effect
  useEffect(() => {
    timeLeftRef.current = timeLeft;
    gamePlatform.updateHud({
      score,
      highScore: bestScore,
      lives: null,
      timer: timeLeft,
      combo: null,
      multiplier: null,
      level: 1,
    });
  }, [score, bestScore, timeLeft]);

  // Sync gameover ref
  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  // Game over checks and countdown timer
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver]);

  // Effect to handle actual Game Over logic cleanly outside state updates
  useEffect(() => {
    if (timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
      playSound('gameOver');
      
      // Save high score at end
      const stored = localStorage.getItem('catch_the_dot_best');
      const numericBest = stored ? parseInt(stored, 10) : 0;
      const finalScore = scoreRef.current;
      if (finalScore > numericBest) {
        localStorage.setItem('catch_the_dot_best', finalScore.toString());
        setBestScore(finalScore);
      }
      
      // Register with shared game platform
      gamePlatform.recordScore('catch-the-dot', finalScore, {
        clicksCount: finalScore + 5,
        successClicksCount: finalScore,
        isPerfect: finalScore >= 35
      });
    }
  }, [timeLeft, isGameOver]);

  // Monitor element resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      const w = Math.max(width, 100);
      const h = Math.max(height, 100);
      dimensionsRef.current = { width: w, height: h };
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
      }
      
      // Seed first dot inside correct dimensions
      if (dotRef.current.x === 150 && dotRef.current.y === 150) {
        teleportDot();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 60FPS Game loop (draw glow, particles, click feedback, LERP background)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderFrame = () => {
      const { width, height } = dimensionsRef.current;
      
      // 1. Calculate screen shake
      let dx = 0;
      let dy = 0;
      if (shakeRef.current > 0.1) {
        dx = (Math.random() - 0.5) * shakeRef.current;
        dy = (Math.random() - 0.5) * shakeRef.current;
        shakeRef.current *= 0.85; // quickly decay shake
      }

      ctx.save();
      ctx.translate(dx, dy);

      // 2. Smoothly LERP background colors
      bgColorRef.current.r += (targetBgColorRef.current.r - bgColorRef.current.r) * 0.1;
      bgColorRef.current.g += (targetBgColorRef.current.g - bgColorRef.current.g) * 0.1;
      bgColorRef.current.b += (targetBgColorRef.current.b - bgColorRef.current.b) * 0.1;

      ctx.fillStyle = `rgb(${Math.round(bgColorRef.current.r)}, ${Math.round(bgColorRef.current.g)}, ${Math.round(bgColorRef.current.b)})`;
      ctx.fillRect(0, 0, width, height);

      // 3. Grid overlay lines for a retro synthwave cyber aesthetic
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 4. Auto-teleport dot if lifetime expires
      if (!isGameOverRef.current) {
        const now = performance.now();
        const currentDelay = getAutoJumpDelay(scoreRef.current);
        if (now - lastJumpTimeRef.current > currentDelay) {
          teleportDot();
          shakeRef.current = 4; // slight shake for missed time
        }
        
        // Render a subtle circular timer rings around the dot indicating lifetime
        const percentLeft = Math.max(0, 1 - (now - lastJumpTimeRef.current) / currentDelay);
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.1 + percentLeft * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(dotRef.current.x, dotRef.current.y, dotRef.current.radius + 6, -Math.PI / 2, -Math.PI / 2 + percentLeft * Math.PI * 2);
        ctx.stroke();
      }

      // 5. Draw Glowing Dot (glowing blue plasma)
      if (!isGameOverRef.current) {
        ctx.save();
        
        // Multi-layered glow
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#06b6d4'; // Cyan glow
        
        const radGrad = ctx.createRadialGradient(
          dotRef.current.x - dotRef.current.radius * 0.2, 
          dotRef.current.y - dotRef.current.radius * 0.2, 
          1, 
          dotRef.current.x, 
          dotRef.current.y, 
          dotRef.current.radius
        );
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.2, '#67e8f9'); // Light cyan
        radGrad.addColorStop(0.8, '#0891b2'); // Dark cyan
        radGrad.addColorStop(1, '#0e7490');
        
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(dotRef.current.x, dotRef.current.y, dotRef.current.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

      // 6. Draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Draw click ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.life += r.speed;

        if (r.life >= 1.0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = r.success ? `rgba(34, 211, 238, ${1 - r.life})` : `rgba(239, 68, 68, ${1 - r.life})`;
        ctx.lineWidth = 3 * (1 - r.life);
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.maxRadius * r.life, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 8. Screen Flash Effect on level boundaries (multiple of 10 score)
      if (flashRef.current > 0.01) {
        ctx.fillStyle = `rgba(34, 211, 238, ${flashRef.current})`;
        ctx.fillRect(0, 0, width, height);
        flashRef.current *= 0.85; // decay rapidly
      }

      ctx.restore(); // restore translated shake offset

      animId = requestAnimationFrame(renderFrame);
    };

    renderFrame();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Handle successful hit clicks
  const handleHit = (x: number, y: number) => {
    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);

    // Trigger hit sound
    playSound('tap');

    // Live highscore tracking
    const stored = localStorage.getItem('catch_the_dot_best');
    const numericBest = stored ? parseInt(stored, 10) : 0;
    let nextBest = numericBest;
    if (newScore > numericBest) {
      localStorage.setItem('catch_the_dot_best', newScore.toString());
      setBestScore(newScore);
      nextBest = newScore;
    }

    // Synchronize HUD instantly
    gamePlatform.updateHud({
      score: newScore,
      highScore: nextBest,
      lives: null,
      timer: timeLeftRef.current,
      combo: null,
      multiplier: null,
      level: 1,
    });

    // Hit click ripple
    ripplesRef.current.push({
      x,
      y,
      life: 0,
      maxRadius: dotRef.current.radius * 2.2,
      success: true,
      speed: 0.06
    });

    // Score Milestone Multipliers
    if (newScore % 10 === 0 && newScore > 0) {
      // Satisfying screen flash & massive shockwave particles
      flashRef.current = 0.35;
      playSound('levelUp');
      
      // Cycle target dark background color
      const colorIdx = Math.floor(newScore / 10) % COLOR_VALUES.length;
      targetBgColorRef.current = COLOR_VALUES[colorIdx];

      // Spawn heavy shockwave loop
      for (let i = 0; i < 65; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8;
        particlesRef.current.push({
          x: dotRef.current.x,
          y: dotRef.current.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.5 + Math.random() * 3.5,
          color: '#22d3ee', // Cyan
          life: 1.0,
          decay: 0.015 + Math.random() * 0.015
        });
      }
    } else {
      // Normal particle explosion
      for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4.5;
        particlesRef.current.push({
          x: dotRef.current.x,
          y: dotRef.current.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 2,
          color: '#38bdf8', // Blueish
          life: 1.0,
          decay: 0.02 + Math.random() * 0.03
        });
      }
    }

    // Teleport dot instantly
    teleportDot();
  };

  // Handle missed clicks
  const handleMiss = (x: number, y: number) => {
    const newScore = Math.max(-99, scoreRef.current - 1);
    scoreRef.current = newScore;
    setScore(newScore);

    playSound('miss');

    // Miss screen shake
    shakeRef.current = 10;

    // Synchronize HUD instantly
    gamePlatform.updateHud({
      score: newScore,
      highScore: bestScore,
      lives: null,
      timer: timeLeftRef.current,
      combo: null,
      multiplier: null,
      level: 1,
    });

    // Miss click ripple
    ripplesRef.current.push({
      x,
      y,
      life: 0,
      maxRadius: 30,
      success: false,
      speed: 0.08
    });

    // Spawn minor gray smoke particles
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 1.5,
        color: '#64748b', // Slate
        life: 0.8,
        decay: 0.04
      });
    }
  };

  // Centralized click/touch handler to check hit vs miss
  const handleInteract = (clientX: number, clientY: number) => {
    if (isGameOverRef.current) return;
    
    const now = performance.now();
    if (now - lastInteractTimeRef.current < 150) {
      // Prevent duplicate scoring from a single tap
      return;
    }
    lastInteractTimeRef.current = now;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * dimensionsRef.current.width;
    const y = ((clientY - rect.top) / rect.height) * dimensionsRef.current.height;

    const dist = Math.hypot(x - dotRef.current.x, y - dotRef.current.y);
    // Hitbox increased by around 18% without changing visible dot size
    const hitboxRadius = (dotRef.current.radius + 10) * 1.18;
    if (dist <= hitboxRadius) {
      handleHit(x, y);
    } else {
      handleMiss(x, y);
    }
  };

  // Restart game back to start
  const handleRestart = () => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(30);
    timeLeftRef.current = 30;
    setIsGameOver(false);
    lastInteractTimeRef.current = 0;
    particlesRef.current = [];
    ripplesRef.current = [];
    shakeRef.current = 0;
    flashRef.current = 0;
    targetBgColorRef.current = COLOR_VALUES[0];
    bgColorRef.current = { r: 2, g: 6, b: 23 };
    teleportDot();

    // Synchronize HUD instantly
    gamePlatform.updateHud({
      score: 0,
      highScore: bestScore,
      lives: null,
      timer: 30,
      combo: null,
      multiplier: null,
      level: 1,
    });
  };

  // Share high score to clipboard
  const handleShare = () => {
    const text = `🎯 I scored ⭐ ${score} points in "Catch The Dot"! Can you beat my High Score of 🏆 ${bestScore}? Play now: ${window.location.origin}/catch-the-dot`;
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center select-none overflow-hidden rounded-2xl border border-slate-900/40 bg-slate-950">
      
      {/* 1. SCOREBOARD (Score top left, Time left top right, Best bottom) */}
      {!isGameOver && (
        <>
          {/* Top Left Score */}
          <div className="absolute top-6 left-6 z-30 flex flex-col pointer-events-none">
            <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest font-semibold">SCORE</span>
            <span className="text-3xl font-mono font-black text-cyan-400 tracking-wider">
              {score}
            </span>
          </div>

          {/* Top Right Timer */}
          <div className="absolute top-6 right-6 z-30 flex flex-col items-end pointer-events-none">
            <span className="text-[10px] font-mono text-rose-500/60 uppercase tracking-widest font-semibold">TIME</span>
            <span className="text-3xl font-mono font-black text-rose-400 tracking-wider">
              {timeLeft}s
            </span>
          </div>

          {/* Bottom High Score */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
              BEST SCORE: <span className="text-cyan-400/80 font-black">{bestScore}</span>
            </span>
          </div>
        </>
      )}

      {/* 2. THE GAMEPLAY PLAYGROUND CANVAS */}
      <div 
        ref={containerRef}
        className="w-full h-full min-h-[380px] flex items-center justify-center relative cursor-crosshair"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          handleInteract(e.clientX, e.clientY);
        }}
        onMouseDown={(e) => {
          handleInteract(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          if (e.cancelable) {
            e.preventDefault();
          }
          if (e.touches && e.touches[0]) {
            handleInteract(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onClick={(e) => {
          handleInteract(e.clientX, e.clientY);
        }}
      >
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />
      </div>

      {/* 3. GAME OVER OVERLAY SCREEN */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full flex flex-col items-center"
            >
              <div className="text-5xl mb-6 animate-bounce">🏆</div>
              
              <h2 className="text-3xl font-black text-white tracking-tight font-sans uppercase">
                TIME UP!
              </h2>
              
              <div className="my-8 flex flex-col gap-3 w-full bg-slate-900/60 border border-slate-800 p-5 rounded-2xl font-mono">
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">⭐ Final Score</span>
                  <span className="text-2xl font-black text-cyan-400">{score}</span>
                </div>
                <div className="h-px bg-slate-800/60 my-1" />
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">🏆 Best Score</span>
                  <span className="text-2xl font-black text-amber-400">{bestScore}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold tracking-widest uppercase cursor-pointer active:scale-95 transition-all shadow-lg shadow-cyan-600/10"
                >
                  <RotateCcw size={14} /> Play Again
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs font-bold tracking-widest uppercase cursor-pointer active:scale-95 transition-all"
                >
                  <Share2 size={14} /> Share Score
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. COPIED TOAST NOTIFICATION */}
      <AnimatePresence>
        {showCopied && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-6 z-50 bg-slate-900 border border-cyan-500/40 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-xl"
          >
            <Check className="text-cyan-400" size={14} />
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Score copied to clipboard!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// -----------------------------------------------------------------
// 14. COLOR PANIC MINI TOY
// -----------------------------------------------------------------
const ColorPanicToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core configurations
  const ALL_COLORS = [
    { name: 'RED', value: '#ef4444', textClass: 'text-red-500', bgClass: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30', activeBg: 'bg-red-500', particleColor: '#ef4444' },
    { name: 'BLUE', value: '#3b82f6', textClass: 'text-blue-500', bgClass: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30', activeBg: 'bg-blue-500', particleColor: '#3b82f6' },
    { name: 'GREEN', value: '#22c55e', textClass: 'text-green-500', bgClass: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30', activeBg: 'bg-green-500', particleColor: '#22c55e' },
    { name: 'YELLOW', value: '#eab308', textClass: 'text-yellow-500', bgClass: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30', activeBg: 'bg-yellow-500', particleColor: '#eab308' },
    // Level up colors
    { name: 'PURPLE', value: '#a855f7', textClass: 'text-purple-500', bgClass: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30', activeBg: 'bg-purple-500', particleColor: '#a855f7' },
    { name: 'PINK', value: '#ec4899', textClass: 'text-pink-500', bgClass: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30', activeBg: 'bg-pink-500', particleColor: '#ec4899' },
    { name: 'ORANGE', value: '#f97316', textClass: 'text-orange-500', bgClass: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30', activeBg: 'bg-orange-500', particleColor: '#f97316' },
  ];

  // Game States
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [bestScore, setBestScore] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [longestCombo, setLongestCombo] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  // Stroop Question States
  const [currentWord, setCurrentWord] = useState<string>('');
  const [currentTextColorItem, setCurrentTextColorItem] = useState<typeof ALL_COLORS[0] | null>(null);
  const [options, setOptions] = useState<typeof ALL_COLORS>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [comboCelebration, setComboCelebration] = useState<string | null>(null);
  const [shake, setShake] = useState<number>(0);

  // Refs for performance, animations and particle calculations
  const scoreRef = useRef<number>(0);
  const isGameOverRef = useRef<boolean>(false);
  const particlesRef = useRef<any[]>([]);
  const dimensionsRef = useRef({ width: 600, height: 400 });

  // Difficulty limit based on score
  const getQuestionLimit = (s: number) => {
    if (s < 10) return 2500;
    if (s < 20) return 2000;
    if (s < 30) return 1600;
    if (s < 40) return 1300;
    return 1000; // insanely fast!
  };

  const playSound = (type: 'tap' | 'miss' | 'levelUp' | 'gameOver') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'tap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'miss') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'levelUp') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.08); // C#5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.16); // E5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'gameOver') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn('AudioContext blocked/failed:', e);
    }
  };

  // Setup first/next question
  const setupNextQuestion = (currentScore: number) => {
    const pool = currentScore >= 15 ? ALL_COLORS : ALL_COLORS.slice(0, 4);

    // Random displayed word and display color
    const wordItem = pool[Math.floor(Math.random() * pool.length)];
    let colorItem = pool[Math.floor(Math.random() * pool.length)];

    // 80% chance of making sure word and color are different
    if (Math.random() < 0.8 && pool.length > 1) {
      while (colorItem.name === wordItem.name) {
        colorItem = pool[Math.floor(Math.random() * pool.length)];
      }
    }

    // Combine correct option + up to 3 random distinct ones
    const optionsList: typeof ALL_COLORS = [colorItem];
    const remaining = pool.filter(c => c.name !== colorItem.name);
    const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(3, shuffledRemaining.length); i++) {
      optionsList.push(shuffledRemaining[i]);
    }

    // Shuffle the final 4 options so positions are random
    const finalOptions = [...optionsList].sort(() => Math.random() - 0.5);

    setCurrentWord(wordItem.name);
    setCurrentTextColorItem(colorItem);
    setOptions(finalOptions);
    setQuestionIndex(prev => prev + 1);
  };

  // Sync refs and load best scores on mount
  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  useEffect(() => {
    const stored = localStorage.getItem('color_panic_best');
    if (stored) {
      setBestScore(parseInt(stored, 10));
    }
    setupNextQuestion(0);
  }, []);

  // HUD Synchronization effect
  useEffect(() => {
    const levelVal = score < 10 ? 1 : score < 20 ? 2 : score < 35 ? 3 : 4;
    const multVal = currentCombo >= 15 ? 4 : currentCombo >= 10 ? 3 : currentCombo >= 5 ? 2 : 1;
    gamePlatform.updateHud({
      score,
      highScore: bestScore,
      lives: null,
      timer: timeLeft,
      combo: currentCombo,
      multiplier: multVal,
      level: levelVal,
    });
  }, [score, bestScore, timeLeft, currentCombo]);

  // Update score state and ref together
  const updateScoreAndRef = (val: number | ((prev: number) => number)) => {
    setScore(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      scoreRef.current = next;
      return next;
    });
  };

  // Handle auto timeout when question timer bar runs out
  const handleTimeout = () => {
    if (isGameOverRef.current) return;
    playSound('miss');
    updateScoreAndRef(prev => Math.max(-99, prev - 1));
    setCurrentCombo(0);
    setShake(10);
    setTimeout(() => setShake(0), 150);
    spawnParticles('#64748b', 12);
    setupNextQuestion(scoreRef.current);
  };

  // Listen for question Index changes and count down to timeout
  useEffect(() => {
    if (isGameOver) return;
    const currentLimit = getQuestionLimit(score);
    const timer = setTimeout(() => {
      handleTimeout();
    }, currentLimit);
    return () => clearTimeout(timer);
  }, [questionIndex, isGameOver]);

  // Overall 45s game timer countdown
  useEffect(() => {
    if (isGameOver) return;
    const gameTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          playSound('gameOver');

          // Check for new Best Score
          const stored = localStorage.getItem('color_panic_best');
          const numericBest = stored ? parseInt(stored, 10) : 0;
          const finalScore = scoreRef.current;
          if (finalScore > numericBest) {
            localStorage.setItem('color_panic_best', finalScore.toString());
            setBestScore(finalScore);
          }

          // Register with shared game platform
          gamePlatform.recordScore('color-panic', finalScore, {
            combo: longestCombo,
            clicksCount: finalScore + 5,
            successClicksCount: finalScore,
            isPerfect: finalScore >= 20
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(gameTimer);
  }, [isGameOver]);

  // ResizeObserver for canvas particles size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      const w = Math.max(width, 100);
      const h = Math.max(height, 100);
      dimensionsRef.current = { width: w, height: h };
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Canvas particle loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.glow ? 15 : 0;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Emit interactive particles on answer
  const spawnParticles = (color: string, count: number, isCombo: boolean = false) => {
    const { width, height } = dimensionsRef.current;
    const x = width / 2;
    const y = height / 3.2; // Spawn directly over the display word area

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isCombo ? (4 + Math.random() * 12) : (2 + Math.random() * 7);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isCombo ? (3.5 + Math.random() * 4) : (2 + Math.random() * 3),
        color,
        life: 1.0,
        decay: isCombo ? (0.01 + Math.random() * 0.015) : (0.02 + Math.random() * 0.035),
        glow: true
      });
    }
  };

  // Answer handler
  const handleAnswer = (selectedColorItem: typeof ALL_COLORS[0]) => {
    if (isGameOver) return;
    const correct = selectedColorItem.name === currentTextColorItem?.name;

    if (correct) {
      playSound('tap');
      const newScore = score + 1;
      updateScoreAndRef(newScore);

      const newCombo = currentCombo + 1;
      setCurrentCombo(newCombo);
      if (newCombo > longestCombo) {
        setLongestCombo(newCombo);
      }

      spawnParticles(currentTextColorItem.particleColor, 18);

      // Check combo milestones of 5
      if (newCombo % 5 === 0) {
        playSound('levelUp');
        setComboCelebration(`+${newCombo} COMBO!`);
        spawnParticles('#eab308', 35, true); // Golden burst
        setTimeout(() => setComboCelebration(null), 1200);
      }
    } else {
      playSound('miss');
      updateScoreAndRef(prev => Math.max(-99, prev - 1));
      setCurrentCombo(0);
      setShake(10);
      setTimeout(() => setShake(0), 150);
      spawnParticles('#ef4444', 15); // Alarm red burst
    }

    setupNextQuestion(scoreRef.current);
  };

  const handleRestart = () => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(45);
    setCurrentCombo(0);
    setLongestCombo(0);
    setIsGameOver(false);
    particlesRef.current = [];
    setShake(0);
    setupNextQuestion(0);
  };

  const handleShare = () => {
    const text = `🎨 I reached ⭐ ${score} points and a 🔥 ${longestCombo} longest combo in "Color Panic"! Can you beat my highscore? Play now: ${window.location.origin}/color-panic`;
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  // Background style based on score ranges
  const getContainerBg = () => {
    if (score < 10) return 'from-slate-950 to-slate-900 border-slate-900';
    if (score < 20) return 'from-indigo-950/40 to-slate-950 border-indigo-900/30';
    if (score < 30) return 'from-emerald-950/40 to-slate-950 border-emerald-900/30';
    if (score < 40) return 'from-rose-950/40 to-slate-950 border-rose-900/30';
    return 'from-amber-950/40 to-slate-950 border-amber-900/30';
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full min-h-[460px] flex flex-col justify-between p-6 sm:p-8 select-none overflow-hidden rounded-2xl border bg-gradient-to-b transition-all duration-500 ${getContainerBg()}`}
    >
      {/* 60fps canvas particles overlay */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-10"
      />

      {/* 1. TOP SCOREBAR */}
      {!isGameOver && (
        <div className="flex justify-between items-start w-full z-20 pointer-events-none">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest font-semibold">SCORE</span>
            <span className="text-3xl font-mono font-black text-cyan-400 tracking-wider">
              {score}
            </span>
            {currentCombo > 0 && (
              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 mt-0.5 animate-pulse">
                <Flame size={12} className="fill-amber-500/20" /> {currentCombo} COMBO
              </span>
            )}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-rose-500/60 uppercase tracking-widest font-semibold">TIME LEFT</span>
            <span className="text-3xl font-mono font-black text-rose-400 tracking-wider">
              {timeLeft}s
            </span>
          </div>
        </div>
      )}

      {/* 2. MAIN CENTERED GAMEPLAY SCREEN */}
      {!isGameOver && (
        <motion.div
          animate={shake > 0 ? { x: [0, -10, 10, -8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 0.15 }}
          className="flex-1 flex flex-col items-center justify-center relative my-4 z-20 w-full"
        >
          {/* Combo Floating Announcement */}
          <AnimatePresence>
            {comboCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1.2, y: -50 }}
                exit={{ opacity: 0, scale: 0.8, y: -80 }}
                className="absolute z-30 font-sans font-black text-2xl text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] uppercase tracking-widest flex items-center gap-1.5"
              >
                <Zap className="fill-yellow-500 text-yellow-400" size={24} />
                {comboCelebration}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Central word box */}
          <div className="flex flex-col items-center justify-center min-h-[140px] text-center max-w-md w-full relative">
            <h1 
              className={`text-5xl sm:text-6xl font-black tracking-widest font-sans uppercase transition-all duration-100 ${currentTextColorItem ? currentTextColorItem.textClass : 'text-white'}`}
              style={{ textShadow: currentTextColorItem ? `0 0 30px ${currentTextColorItem.value}60` : undefined }}
            >
              {currentWord}
            </h1>
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mt-4">
              TAP THE ACTUAL COLOR OF THE TEXT
            </span>
          </div>

          {/* Fast Question Timer Bar */}
          <div className="w-full max-w-sm bg-slate-950/60 h-1.5 rounded-full overflow-hidden mt-6 mb-8 border border-slate-900/40">
            <motion.div
              key={questionIndex}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: getQuestionLimit(score) / 1000, ease: 'linear' }}
              className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
            />
          </div>

          {/* 4 Colored Options buttons */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {options.map((opt) => (
              <button
                key={opt.name}
                onClick={() => handleAnswer(opt)}
                className={`relative py-4 rounded-2xl border text-xs font-mono font-extrabold uppercase tracking-widest transition-all duration-150 cursor-pointer overflow-hidden group active:scale-95 flex items-center justify-center gap-2 ${opt.bgClass}`}
              >
                {/* Inner glowing color dot */}
                <div className={`h-2.5 w-2.5 rounded-full shadow-md ${opt.activeBg} ring-4 ring-white/10`} />
                <span className="text-white group-hover:scale-105 transition-all">{opt.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 3. GAME OVER OVERLAY SCREEN */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full flex flex-col items-center"
            >
              <div className="text-5xl mb-6 animate-bounce">🎨</div>
              
              <h2 className="text-3xl font-black text-white tracking-tight font-sans uppercase">
                TIME'S UP!
              </h2>
              
              <div className="my-8 flex flex-col gap-3 w-full bg-slate-900/60 border border-slate-800 p-5 rounded-2xl font-mono">
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">⭐ Final Score</span>
                  <span className="text-2xl font-black text-cyan-400">{score}</span>
                </div>
                <div className="h-px bg-slate-800/60 my-1" />
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">🏆 Best Score</span>
                  <span className="text-2xl font-black text-amber-400">{bestScore}</span>
                </div>
                <div className="h-px bg-slate-800/60 my-1" />
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">🔥 Longest Combo</span>
                  <span className="text-2xl font-black text-orange-400">{longestCombo}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold tracking-widest uppercase cursor-pointer active:scale-95 transition-all shadow-lg shadow-rose-600/10"
                >
                  <RotateCcw size={14} /> Play Again
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs font-bold tracking-widest uppercase cursor-pointer active:scale-95 transition-all"
                >
                  <Share2 size={14} /> Share Score
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. BEST SCORE ON BOTTOM BAR DURING PLAY */}
      {!isGameOver && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-none">
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
            BEST SCORE: <span className="text-rose-400/80 font-black">{bestScore}</span>
          </span>
        </div>
      )}

      {/* 5. COPIED TOAST NOTIFICATION */}
      <AnimatePresence>
        {showCopied && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-6 z-50 bg-slate-900 border border-rose-500/40 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-xl"
          >
            <Check className="text-rose-400" size={14} />
            <span className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wider">
              Score copied to clipboard!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// -----------------------------------------------------------------
// 15. ONE SECOND CHALLENGE MINI TOY
// -----------------------------------------------------------------
const OneSecondChallengeToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [phase, setPhase] = useState<'idle' | 'running' | 'result'>('idle');
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [difference, setDifference] = useState<number | null>(null);
  const [bestDiff, setBestDiff] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [rating, setRating] = useState<{ stars: number; label: string; color: string; feedback: string } | null>(null);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);
  const dimensionsRef = useRef({ width: 600, height: 400 });

  // Load Highscore on Mount
  useEffect(() => {
    const storedBestDiff = localStorage.getItem('one_second_best_diff');
    const storedBestTime = localStorage.getItem('one_second_best_time');
    if (storedBestDiff && storedBestTime) {
      setBestDiff(parseFloat(storedBestDiff));
      setBestTime(parseFloat(storedBestTime));
    }
  }, []);

  // HUD Synchronization effect
  useEffect(() => {
    const starScore = rating ? rating.stars : 0;
    const bestStarScore = bestDiff !== null ? (bestDiff <= 0.01 ? 5 : bestDiff <= 0.05 ? 4 : bestDiff <= 0.15 ? 3 : bestDiff <= 0.35 ? 2 : 1) : 0;
    gamePlatform.updateHud({
      score: starScore,
      highScore: bestStarScore,
      lives: null,
      timer: elapsed !== null ? Math.round(elapsed) : null,
      combo: null,
      multiplier: null,
      level: 1,
    });
  }, [rating, bestDiff, elapsed]);

  const playSound = (type: 'start' | 'stop-perfect' | 'stop-good' | 'stop-bad') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'start') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'stop-perfect') {
        // Glorious chord
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C major chord
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.03);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        });
      } else if (type === 'stop-good') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'stop-bad') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn('AudioContext blocked/failed:', e);
    }
  };

  // ResizeObserver for canvas particles size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      const w = Math.max(width, 100);
      const h = Math.max(height, 100);
      dimensionsRef.current = { width: w, height: h };
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Canvas particle render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.glow ? 20 : 0;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const spawnParticles = (count: number, colors: string[]) => {
    const { width, height } = dimensionsRef.current;
    const x = width / 2;
    const y = height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 12;
      const color = colors[Math.floor(Math.random() * colors.length)];
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color,
        life: 1.0,
        decay: 0.01 + Math.random() * 0.02,
        glow: true
      });
    }
  };

  const handleStart = () => {
    playSound('start');
    startTimeRef.current = performance.now();
    setPhase('running');
    setElapsed(null);
    setDifference(null);
    setRating(null);
  };

  const handleStop = () => {
    const stopTime = performance.now();
    const duration = (stopTime - startTimeRef.current) / 1000;
    const diff = Math.abs(duration - 1.000);

    setElapsed(duration);
    setDifference(diff);
    setPhase('result');

    // Rating Logic
    let currentRating;
    if (diff <= 0.005) {
      currentRating = { stars: 5, label: 'Perfect', color: 'text-amber-400 drop-shadow-[0_0_12px_#fbbf24]', feedback: 'Incredible accuracy! Spot on.' };
      playSound('stop-perfect');
      spawnParticles(80, ['#fbbf24', '#f59e0b', '#ffffff', '#3b82f6', '#ec4899']);
    } else if (diff <= 0.025) {
      currentRating = { stars: 4, label: 'Great', color: 'text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]', feedback: 'Extremely close! Excellent feel.' };
      playSound('stop-perfect');
      spawnParticles(45, ['#22d3ee', '#06b6d4', '#ffffff', '#a855f7']);
    } else if (diff <= 0.075) {
      currentRating = { stars: 3, label: 'Good', color: 'text-emerald-400', feedback: 'Very respectable guess!' };
      playSound('stop-good');
      spawnParticles(20, ['#34d399', '#10b981', '#ffffff']);
    } else if (diff <= 0.150) {
      currentRating = { stars: 2, label: 'Close', color: 'text-sky-400', feedback: 'A bit off, but you are getting warm.' };
      playSound('stop-good');
    } else {
      currentRating = { stars: 1, label: 'Try Again', color: 'text-slate-400', feedback: 'Keep practicing your rhythm!' };
      playSound('stop-bad');
    }

    setRating(currentRating);

    // Haptic Vibration if supported
    if (navigator.vibrate) {
      try {
        if (diff <= 0.005) {
          navigator.vibrate([80, 40, 80]);
        } else if (diff <= 0.025) {
          navigator.vibrate(50);
        } else {
          navigator.vibrate(20);
        }
      } catch (err) {
        // Blocked on some systems
      }
    }

    // Highscore check
    const storedBestDiff = localStorage.getItem('one_second_best_diff');
    const numericBestDiff = storedBestDiff ? parseFloat(storedBestDiff) : 999.0;

    if (diff < numericBestDiff) {
      localStorage.setItem('one_second_best_diff', diff.toString());
      localStorage.setItem('one_second_best_time', duration.toString());
      setBestDiff(diff);
      setBestTime(duration);
    }

    // Register with shared game platform
    gamePlatform.recordScore('one-second-challenge', currentRating.stars, {
      errorMs: Math.round(diff * 1000),
      isPerfect: Math.round(diff * 1000) === 0
    });
  };

  const handleShare = () => {
    if (elapsed === null) return;
    const starDisplay = '★'.repeat(rating?.stars || 1) + '☆'.repeat(5 - (rating?.stars || 1));
    const text = `⏱️ I stopped the timer at exactly ${elapsed.toFixed(3)}s (diff: ${difference !== null ? (difference > 0 ? '+' : '') + (elapsed - 1.0).toFixed(3) : ''}s) inside "One Second Challenge"! Rating: ${starDisplay} ${rating?.label || ''}. Can you hit exactly 1.000s? Play here: ${window.location.origin}/one-second-challenge`;
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] flex flex-col justify-between p-6 sm:p-8 select-none overflow-hidden rounded-2xl border border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900 text-white transition-all duration-300"
    >
      {/* 60fps canvas particles overlay */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-10"
      />

      {/* 1. TOP STATS BAR */}
      <div className="flex justify-between items-start w-full z-20 pointer-events-none font-mono">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest font-semibold">TARGET TIME</span>
          <span className="text-2xl font-black text-cyan-400 tracking-wider">
            1.000s
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-rose-500/60 uppercase tracking-widest font-semibold">BEST ACCURACY</span>
          <span className="text-xl font-black text-rose-400 tracking-wider">
            {bestTime !== null ? `${bestTime.toFixed(3)}s` : '---'}
          </span>
          {bestDiff !== null && (
            <span className="text-[10px] text-slate-500 font-bold">
              Δ: {bestDiff.toFixed(3)}s
            </span>
          )}
        </div>
      </div>

      {/* 2. MAIN INTERACTIVE AREA */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-6 z-20 w-full">
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center w-full"
            >
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <Timer size={36} className="text-cyan-400 animate-pulse" />
              </div>

              <h2 className="text-lg font-mono font-bold text-slate-400 uppercase tracking-widest mb-6">
                Tap Start to Begin Challenge
              </h2>

              <button
                onClick={handleStart}
                className="w-48 h-48 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-black text-2xl uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] border-4 border-cyan-300/30 flex flex-col items-center justify-center"
              >
                <Play size={28} className="fill-slate-950 mb-1.5" />
                START
              </button>
            </motion.div>
          )}

          {phase === 'running' && (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center w-full"
            >
              <div className="mb-8 font-mono text-xs text-slate-500 tracking-widest uppercase animate-pulse">
                TIMER IS TICKING... STOP EXACTLY AT 1.000s
              </div>

              <button
                onClick={handleStop}
                className="w-56 h-56 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-sans font-black text-3xl uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-[0_0_60px_rgba(239,68,68,0.5)] border-4 border-rose-300/30 flex flex-col items-center justify-center animate-pulse"
              >
                <Zap size={32} className="fill-white mb-2" />
                STOP
              </button>
            </motion.div>
          )}

          {phase === 'result' && elapsed !== null && rating !== null && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center w-full max-w-sm"
            >
              {/* Rating stars */}
              <div className="flex gap-1.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    size={22} 
                    className={s <= rating.stars ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_#fbbf24]' : 'text-slate-700'} 
                  />
                ))}
              </div>

              <h3 className={`text-2xl font-black uppercase tracking-widest mb-1 ${rating.color}`}>
                {rating.label}
              </h3>

              <p className="text-xs text-slate-400 font-mono mb-6">
                {rating.feedback}
              </p>

              {/* Huge Timer Result box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6 w-full font-mono flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">
                  YOUR TIME
                </span>
                <span className="text-4xl font-black text-white tracking-widest">
                  {elapsed.toFixed(3)}s
                </span>
                <div className="w-full h-px bg-slate-800/60 my-3" />
                <div className="flex justify-between w-full px-4 text-xs">
                  <span className="text-slate-500 font-medium uppercase">DIFFERENCE:</span>
                  <span className={`font-black ${difference <= 0.025 ? 'text-green-400' : 'text-rose-400'}`}>
                    {(elapsed - 1.000) >= 0 ? '+' : ''}{(elapsed - 1.000).toFixed(3)}s
                  </span>
                </div>
              </div>

              {/* Action row */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleStart}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold tracking-widest uppercase cursor-pointer active:scale-95 transition-all shadow-md shadow-cyan-500/10"
                >
                  <RotateCcw size={14} /> Try Again
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs font-bold tracking-widest uppercase cursor-pointer active:scale-95 transition-all"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. COPIED TOAST NOTIFICATION */}
      <AnimatePresence>
        {showCopied && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500/40 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-xl whitespace-nowrap"
          >
            <Check className="text-cyan-400" size={14} />
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Score copied to clipboard!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. FOOTER CREDITS */}
      <div className="text-[9px] font-mono text-slate-600 font-semibold uppercase tracking-widest text-center pointer-events-none z-20">
        ONE SECOND CHALLENGE • DESIGNED BY PLAYSPRINT
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 16. REACTION RUSH MINI TOY
// -----------------------------------------------------------------
interface RushParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  decay: number;
  glow: boolean;
}

const getGrade = (timeMs: number) => {
  if (timeMs < 150) return { label: '⚡ LEGENDARY', color: 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] font-black', bg: 'bg-amber-500/10 border-amber-500/30' };
  if (timeMs < 200) return { label: '🔥 ELITE', color: 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)] font-extrabold', bg: 'bg-rose-500/10 border-rose-500/30' };
  if (timeMs < 250) return { label: '⭐ EXCELLENT', color: 'text-cyan-400 font-bold', bg: 'bg-cyan-500/10 border-cyan-500/30' };
  if (timeMs < 300) return { label: '👍 GOOD', color: 'text-emerald-400 font-semibold', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (timeMs < 350) return { label: '🙂 AVERAGE', color: 'text-sky-400 font-medium', bg: 'bg-sky-500/10 border-sky-500/30' };
  return { label: '🐢 SLOW', color: 'text-slate-400 font-normal', bg: 'bg-slate-500/10 border-slate-500/30' };
};

const ReactionRushToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [phase, setPhase] = useState<'idle' | 'waiting' | 'flash' | 'early-fail' | 'round-result' | 'game-over'>('idle');
  const [rounds, setRounds] = useState<number[]>([]);
  const [roundResult, setRoundResult] = useState<number | null>(null);
  
  // Local storage / global statistics
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [legendaryCount, setLegendaryCount] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);

  const [shake, setShake] = useState<number>(0);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  const signalTimeRef = useRef<number>(0);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const particlesRef = useRef<RushParticle[]>([]);
  const dimensionsRef = useRef({ width: 600, height: 400 });

  // Load Highscores
  useEffect(() => {
    const storedBest = localStorage.getItem('reaction_rush_best');
    if (storedBest) setPersonalBest(parseInt(storedBest, 10));

    const storedGames = localStorage.getItem('reaction_rush_games_played');
    if (storedGames) setGamesPlayed(parseInt(storedGames, 10));

    const storedLegendary = localStorage.getItem('reaction_rush_legendary_count');
    if (storedLegendary) setLegendaryCount(parseInt(storedLegendary, 10));

    const storedStreak = localStorage.getItem('reaction_rush_current_streak');
    if (storedStreak) setCurrentStreak(parseInt(storedStreak, 10));
  }, []);

  // HUD Synchronization effect
  useEffect(() => {
    const scoreVal = roundResult !== null ? roundResult : (rounds.length > 0 ? Math.round(rounds.reduce((a,b)=>a+b,0)/rounds.length) : 0);
    const livesVal = Math.max(0, 5 - rounds.length);
    const multVal = currentStreak >= 5 ? 3 : currentStreak >= 3 ? 2 : 1;
    gamePlatform.updateHud({
      score: scoreVal,
      highScore: personalBest !== null ? personalBest : 0,
      lives: livesVal,
      timer: null,
      combo: currentStreak,
      multiplier: multVal,
      level: rounds.length + 1,
    });
  }, [rounds, roundResult, personalBest, currentStreak]);

  // ResizeObserver for Canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      const w = Math.max(width, 100);
      const h = Math.max(height, 100);
      dimensionsRef.current = { width: w, height: h };
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Particle render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        if (p.glow) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = p.color;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const triggerVibration = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        // Blocked
      }
    }
  };

  const playSound = (type: 'start' | 'signal' | 'perfect' | 'excellent' | 'average' | 'slow' | 'too-early' | 'victory') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'start') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'signal') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'too-early') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'perfect' || type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
          gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.05);
          osc.stop(ctx.currentTime + idx * 0.05 + 0.25);
        });
      } else if (type === 'excellent') {
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
          gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.04);
          osc.stop(ctx.currentTime + idx * 0.04 + 0.18);
        });
      } else if (type === 'average') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(554.37, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'slow') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn('AudioContext failed/blocked:', e);
    }
  };

  const spawnRushParticles = (count: number, colors: string[], speedMultiplier: number = 1) => {
    const { width, height } = dimensionsRef.current;
    const x = width / 2;
    const y = height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (3 + Math.random() * 9) * speedMultiplier;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (2 + Math.random() * 4) * (speedMultiplier > 1 ? 1.3 : 1),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.015 + Math.random() * 0.018,
        glow: speedMultiplier > 1
      });
    }
  };

  const triggerVisualFeedback = (timeMs: number) => {
    if (timeMs < 150) {
      playSound('perfect');
      spawnRushParticles(50, ['#22c55e', '#a3e635', '#ffffff', '#fbbf24'], 1.5);
      triggerVibration([80, 40, 80]);
    } else if (timeMs < 250) {
      playSound('excellent');
      spawnRushParticles(30, ['#38bdf8', '#3b82f6', '#ffffff'], 1.1);
      triggerVibration(40);
    } else if (timeMs < 350) {
      playSound('average');
      spawnRushParticles(15, ['#f1f5f9', '#94a3b8'], 0.7);
      triggerVibration(20);
    } else {
      playSound('slow');
      spawnRushParticles(8, ['#64748b', '#334155'], 0.4);
    }
  };

  const startNextRound = () => {
    playSound('start');
    setPhase('waiting');
    setRoundResult(null);

    // Dynamic non-repeating delay
    const randomDelay = Math.floor(Math.random() * 4000) + 1000; // 1000ms - 5000ms
    delayTimeoutRef.current = setTimeout(() => {
      setPhase('flash');
      signalTimeRef.current = performance.now();
      playSound('signal');
    }, randomDelay);
  };

  const handleStartGame = () => {
    setRounds([]);
    startNextRound();
  };

  const handleScreenTap = () => {
    if (phase === 'waiting') {
      // TOO EARLY!
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      playSound('too-early');
      setPhase('early-fail');
      setShake(12);
      triggerVibration([100, 60, 100]);

      setTimeout(() => {
        setShake(0);
      }, 150);

      // Wait 1 second, restart current round
      setTimeout(() => {
        startNextRound();
      }, 1000);

    } else if (phase === 'flash') {
      const tapTime = performance.now();
      const reactTime = Math.round(tapTime - signalTimeRef.current);
      setRoundResult(reactTime);
      triggerVisualFeedback(reactTime);

      const updatedRounds = [...rounds, reactTime];
      setRounds(updatedRounds);

      if (updatedRounds.length === 5) {
        // Complete game
        setTimeout(() => {
          setPhase('game-over');
          playSound('victory');
          handleGameComplete(updatedRounds);
        }, 800);
      } else {
        setPhase('round-result');
      }
    }
  };

  const handleGameComplete = (finalRounds: number[]) => {
    const avg = Math.round(finalRounds.reduce((a, b) => a + b, 0) / finalRounds.length);
    const best = Math.min(...finalRounds);
    const hasLegendary = finalRounds.some((r) => r < 150);

    // Save stats
    const prevGames = parseInt(localStorage.getItem('reaction_rush_games_played') || '0', 10);
    const newGames = prevGames + 1;
    localStorage.setItem('reaction_rush_games_played', newGames.toString());
    setGamesPlayed(newGames);

    if (hasLegendary) {
      const legendaryCountInGame = finalRounds.filter((r) => r < 150).length;
      const prevLegendary = parseInt(localStorage.getItem('reaction_rush_legendary_count') || '0', 10);
      const newLegendary = prevLegendary + legendaryCountInGame;
      localStorage.setItem('reaction_rush_legendary_count', newLegendary.toString());
      setLegendaryCount(newLegendary);
    }

    const storedBest = localStorage.getItem('reaction_rush_best');
    const numericBest = storedBest ? parseInt(storedBest, 10) : 9999;
    if (best < numericBest) {
      localStorage.setItem('reaction_rush_best', best.toString());
      setPersonalBest(best);
    } else {
      setPersonalBest(numericBest);
    }

    const prevStreak = parseInt(localStorage.getItem('reaction_rush_current_streak') || '0', 10);
    let newStreak = prevStreak;
    if (avg < 280) {
      newStreak = prevStreak + 1;
    } else {
      newStreak = 0;
    }
    localStorage.setItem('reaction_rush_current_streak', newStreak.toString());
    setCurrentStreak(newStreak);

    // Register with shared game platform
    gamePlatform.recordScore('reaction-rush', avg, {
      reactionTime: best,
      isPerfect: best < 180
    });
  };

  const handleShare = () => {
    if (rounds.length === 0) return;
    const avg = Math.round(rounds.reduce((a, b) => a + b, 0) / rounds.length);
    const best = Math.min(...rounds);
    const grade = getOverallGrade(avg);
    const text = `⚡ My average reaction speed is ${avg}ms (Fastest: ${best}ms) inside "Reaction Rush"! Rating: ${grade.label}. Test your true human reflexes: ${window.location.origin}/reaction-rush`;
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  const getOverallGrade = (avg: number) => {
    if (avg < 150) return { label: '⚡ LEGENDARY', color: 'text-amber-400 drop-shadow-[0_0_12px_#fbbf24]' };
    if (avg < 200) return { label: '🔥 ELITE', color: 'text-rose-400 drop-shadow-[0_0_8px_#f43f5e]' };
    if (avg < 250) return { label: '⭐ EXCELLENT', color: 'text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]' };
    if (avg < 300) return { label: '👍 GOOD', color: 'text-emerald-400' };
    if (avg < 350) return { label: '🙂 AVERAGE', color: 'text-sky-400' };
    return { label: '🐢 SLOW', color: 'text-slate-400' };
  };

  const currentGrade = roundResult !== null ? getGrade(roundResult) : null;
  const avgReaction = rounds.length > 0 ? Math.round(rounds.reduce((a, b) => a + b, 0) / rounds.length) : 0;
  const fastestReaction = rounds.length > 0 ? Math.min(...rounds) : 0;
  const slowestReaction = rounds.length > 0 ? Math.max(...rounds) : 0;

  return (
    <div
      ref={containerRef}
      onClick={phase === 'waiting' || phase === 'flash' ? handleScreenTap : undefined}
      style={shake > 0 ? { transform: `translate(${(Math.random() - 0.5) * shake}px, ${(Math.random() - 0.5) * shake}px)` } : undefined}
      className={`relative w-full h-full min-h-[460px] flex flex-col justify-between p-6 sm:p-8 select-none overflow-hidden rounded-2xl border transition-all duration-300 ${
        phase === 'flash'
          ? 'bg-emerald-500 border-emerald-400 text-slate-950 cursor-pointer'
          : phase === 'early-fail'
          ? 'bg-rose-950 border-rose-800 text-white animate-[shake_0.15s_ease-in-out_infinite]'
          : phase === 'waiting'
          ? 'bg-black border-slate-900 text-white cursor-pointer'
          : 'bg-gradient-to-b from-slate-950 to-slate-900 border-slate-900 text-white'
      }`}
    >
      {/* 60fps canvas particles overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none z-10" />

      {/* 1. TOP STATUS / STATS BAR */}
      <div className="flex justify-between items-start w-full z-20 pointer-events-none font-mono">
        <div className="flex flex-col">
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${phase === 'flash' ? 'text-slate-900/60' : 'text-emerald-500/60'}`}>
            REACTION RUSH
          </span>
          <span className={`text-2xl font-black tracking-wider ${phase === 'flash' ? 'text-slate-950' : 'text-emerald-400'}`}>
            ROUND {Math.min(rounds.length + 1, 5)}/5
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${phase === 'flash' ? 'text-slate-900/60' : 'text-rose-500/60'}`}>
            BEST REFLEX
          </span>
          <span className={`text-xl font-black tracking-wider ${phase === 'flash' ? 'text-slate-950' : 'text-rose-400'}`}>
            {personalBest !== null ? `${personalBest}ms` : '---'}
          </span>
        </div>
      </div>

      {/* 2. MAIN INTERACTIVE AREA */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-6 z-20 w-full">
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center w-full"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <Zap size={36} className="text-emerald-400 animate-pulse" />
              </div>

              <h2 className="text-lg font-mono font-bold text-slate-400 uppercase tracking-widest mb-6">
                Test Your Synaptic Latency
              </h2>

              <button
                onClick={handleStartGame}
                className="w-48 h-48 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-black text-2xl uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] border-4 border-emerald-300/30 flex flex-col items-center justify-center"
              >
                <Play size={28} className="fill-slate-950 mb-1.5" />
                START
              </button>
            </motion.div>
          )}

          {phase === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center w-full"
            >
              <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-slate-700 animate-pulse">
                WAIT...
              </div>
              <p className="text-xs text-slate-500 font-mono mt-4 uppercase tracking-widest">
                TAP AS SOON AS THE SCREEN TURNS GREEN!
              </p>
            </motion.div>
          )}

          {phase === 'flash' && (
            <motion.div
              key="flash"
              initial={{ scale: 0.9 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="flex flex-col items-center justify-center text-center w-full"
            >
              <div className="text-6xl sm:text-7xl font-sans font-extrabold tracking-tighter text-slate-950 uppercase select-none">
                TAP NOW!
              </div>
            </motion.div>
          )}

          {phase === 'early-fail' && (
            <motion.div
              key="early-fail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center w-full text-rose-500"
            >
              <div className="text-5xl sm:text-6xl font-mono font-black tracking-widest mb-4">
                TOO EARLY!
              </div>
              <p className="text-sm font-mono text-rose-400 uppercase tracking-widest">
                Wait for green signal. Restarting round...
              </p>
            </motion.div>
          )}

          {phase === 'round-result' && roundResult !== null && currentGrade !== null && (
            <motion.div
              key="round-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center w-full max-w-xs"
            >
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-black mb-2">
                ROUND {rounds.length} RESULTS
              </span>

              <h3 className="text-5xl sm:text-6xl font-mono font-black tracking-tight text-white mb-2">
                {roundResult}ms
              </h3>

              <div className={`text-xs tracking-widest uppercase mb-6 px-4 py-1.5 rounded-full border ${currentGrade.color} ${currentGrade.bg}`}>
                {currentGrade.label}
              </div>

              {/* Staggered mini timeline dots */}
              <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const isCompleted = idx <= rounds.length;
                  const isCurrent = idx === rounds.length + 1;
                  return (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                          : isCurrent
                          ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]'
                          : 'bg-slate-800'
                      }`}
                    />
                  );
                })}
              </div>

              <button
                onClick={startNextRound}
                className="w-full flex items-center justify-center gap-1.5 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold tracking-widest uppercase cursor-pointer active:scale-95 transition-all shadow-md shadow-emerald-500/10"
              >
                NEXT ROUND <Play size={14} className="fill-slate-950" />
              </button>
            </motion.div>
          )}

          {phase === 'game-over' && (
            <motion.div
              key="game-over"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center w-full max-w-sm"
            >
              <div className="flex items-center gap-1.5 mb-2 font-mono text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <Trophy size={12} /> GAME COMPLETED
              </div>

              <h3 className={`text-2xl sm:text-3xl font-black uppercase tracking-wider mb-6 ${getOverallGrade(avgReaction).color}`}>
                {getOverallGrade(avgReaction).label}
              </h3>

              {/* Detailed scorecard list */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6 w-full font-mono flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase flex items-center gap-1.5">
                    📈 AVERAGE SPEED
                  </span>
                  <span className="font-black text-white text-base">
                    {avgReaction}ms
                  </span>
                </div>

                <div className="w-full h-px bg-slate-800/60" />

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase flex items-center gap-1.5">
                    ⚡ FASTEST SPEED
                  </span>
                  <span className="font-black text-emerald-400">
                    {fastestReaction}ms
                  </span>
                </div>

                <div className="w-full h-px bg-slate-800/60" />

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase flex items-center gap-1.5">
                    🐢 SLOWEST SPEED
                  </span>
                  <span className="font-black text-rose-400">
                    {slowestReaction}ms
                  </span>
                </div>

                <div className="w-full h-px bg-slate-800/60" />

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase flex items-center gap-1.5">
                    🔥 CURRENT STREAK
                  </span>
                  <span className="font-black text-amber-400 flex items-center gap-1">
                    <Flame size={14} className="fill-amber-400 text-amber-400 animate-pulse" /> {currentStreak}
                  </span>
                </div>
              </div>

              {/* Action row */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleStartGame}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold tracking-widest uppercase cursor-pointer active:scale-95 transition-all shadow-md shadow-emerald-500/10"
                >
                  <RotateCcw size={14} /> PLAY AGAIN
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs font-bold tracking-widest uppercase cursor-pointer active:scale-95 transition-all"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. TOAST COPIED */}
      <AnimatePresence>
        {showCopied && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/40 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-xl whitespace-nowrap"
          >
            <Check className="text-emerald-400" size={14} />
            <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
              Score copied to clipboard!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. FOOTER CREDITS */}
      <div className="text-[9px] font-mono text-slate-600 font-semibold uppercase tracking-widest text-center pointer-events-none z-20">
        REACTION RUSH • DESIGNED BY PLAYSPRINT
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// CENTRAL WRAPPER / ROUTER FOR MINI TOYS
// -----------------------------------------------------------------
export const InteractiveMiniToys: React.FC<MiniToyProps> = ({ experienceId, onClose, onSelectExperience }) => {
  const { activeResult, setActiveResult, getRandomGameId } = useGamePlatform();
  const [sessionKey, setSessionKey] = useState<number>(0);

  // Play Time Tracking
  useEffect(() => {
    const interval = setInterval(() => {
      gamePlatform.incrementPlayTime(1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayAgain = () => {
    setActiveResult(null);
    setSessionKey(prev => prev + 1);
  };

  const handleHome = () => {
    setActiveResult(null);
    if (onClose) onClose();
  };

  const handleNextGame = () => {
    setActiveResult(null);
    if (onSelectExperience) {
      const nextId = getRandomGameId(experienceId);
      const nextExp = EXPERIENCES.find(e => e.id === nextId);
      if (nextExp) {
        onSelectExperience(nextExp);
      }
    }
  };

  const renderActiveToy = () => {
    switch (experienceId) {
      case 'reaction-rush':
        return <ReactionRushToy />;
      case 'one-second-challenge':
        return <OneSecondChallengeToy />;
      case 'color-panic':
        return <ColorPanicToy />;
      case 'catch-the-dot':
        return <CatchTheDotToy />;
      case 'lucky-button':
        return <LuckyButtonToy />;
      case 'dont-press-the-red-button':
        return <DontPressRedButtonToy />;
      case 'gravity-lab':
        return <GravityLabToy />;
      case 'infinite-machine':
        return <InfiniteMachineToy />;
      case 'time-warp':
        return <TimeWarpToy />;
      case 'planet-creator':
        return <PlanetCreatorToy />;
      case 'light-playground':
        return <LightPlaygroundToy />;
      case 'pixel-universe':
        return <PixelUniverseToy />;
      case 'decision-reactor':
        return <DecisionReactorToy />;
      case 'color-lab':
        return <ColorLabToy />;
      case 'shadow-explorer':
        return <ShadowExplorerToy />;
      case 'random-reality':
        return <RandomRealityToy />;
      case 'find-the-fake-emoji':
        return <FindTheFakeEmojiToy />;
      case 'chain-reaction':
        return <ChainReactionToy />;
      case 'shape-switch':
        return <ShapeSwitchToy />;
      case 'perfect-timing':
        return <PerfectTimingToy />;
      case 'gravity-escape':
        return <GravityEscapeToy />;
      case 'laser-maze':
        return <LaserMazeToy onClose={onClose} onSelectExperience={onSelectExperience} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs">
            <Sparkles className="animate-spin text-slate-500 mb-2" size={24} />
            <span>Interactive simulator is loading...</span>
          </div>
        );
    }
  };

  return (
    <div 
      className="relative w-full h-full min-h-[460px] flex flex-col justify-between" 
      onClick={() => gamePlatform.recordClick()}
    >
      <div key={sessionKey} className="w-full h-full flex-1 flex flex-col justify-between">
        {renderActiveToy()}
      </div>

      <AnimatePresence>
        {activeResult && activeResult.gameId === experienceId && (
          <SharedGameOverScreen
            result={activeResult}
            onPlayAgain={handlePlayAgain}
            onHome={handleHome}
            onNextGame={handleNextGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
