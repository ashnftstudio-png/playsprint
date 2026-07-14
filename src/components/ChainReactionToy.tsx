/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, RotateCcw, Play, Home, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { gamePlatform } from '../lib/gamePlatform';

// =================================================================
// DESIGNED TYPES & CONSTANTS
// =================================================================

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isExploding: boolean;
  explosionRadius: number;
  explosionMaxRadius: number;
  explosionSpeed: number;
  explosionAge: number;
  explosionLife: number;
  isSpecial?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Ring {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  life: number;
}

interface ComboText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
}

interface ScorePop {
  x: number;
  y: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

// Neon color spectrum for maximum arcade visual appeal
const BALL_COLORS = [
  '#ff0055', // Hot Pink
  '#00ffcc', // Neon Cyan
  '#39ff14', // Neon Green
  '#ffcc00', // Neon Gold/Yellow
  '#ff6600', // Neon Orange
  '#b026ff', // Violet Electric
];

// =================================================================
// AUDIO SYNTHESIZER
// =================================================================
class SoundEngine {
  ctx: AudioContext | null = null;
  muted: boolean = false;

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (_) {}
  }

  playTap() {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  }

  playExplosion(chainIndex: number) {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      // Create primary boom synth
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Pitch climbs with chain length for satisfying sound combos
      const pitchMultiplier = Math.pow(1.0594, Math.min(18, chainIndex));
      const baseFreq = 110 + (chainIndex * 8);
      const freq = Math.min(1000, baseFreq * pitchMultiplier);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(Math.min(0.25, 0.12 + chainIndex * 0.005), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      // Lowpass filter for deep bass rumble
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  }

  playFanfare(win: boolean) {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const notes = win ? [261.63, 329.63, 392.00, 523.25] : [196.00, 164.81, 130.81];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = win ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } catch (_) {}
  }
}

const synth = new SoundEngine();

// =================================================================
// COMPONENT IMPLEMENTATION
// =================================================================
export const ChainReactionToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reaction Gameplay State
  const [level, setLevel] = useState<number>(1);
  const [bestScore, setBestScore] = useState<number>(0);
  const [hasTapped, setHasTapped] = useState<boolean>(false);
  
  // Real-time counter metrics
  const [destroyedCount, setDestroyedCount] = useState<number>(0);
  const [chainLength, setChainLength] = useState<number>(0);
  const [maxChainLength, setMaxChainLength] = useState<number>(0);
  
  // Screen shake amount
  const [shakeIntensity, setShakeIntensity] = useState<number>(0);
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);

  // Post-level/Game Over custom display
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Physical Refs for smooth 60fps canvas updates
  const ballsRef = useRef<Ball[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const ringsRef = useRef<Ring[]>([]);
  const comboTextsRef = useRef<ComboText[]>([]);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const isPlayingRef = useRef<boolean>(true);
  
  // Bullet-time slowing parameters
  const slowMoTimerRef = useRef<number>(0);
  const chainCounterRef = useRef<number>(0);

  // Synchronous game metrics for 60fps instant UI updates
  const destroyedCountRef = useRef<number>(0);
  const chainLengthRef = useRef<number>(0);
  const maxChainLengthRef = useRef<number>(0);
  const scorePopsRef = useRef<ScorePop[]>([]);

  // DOM Refs for bypassing React rendering lag in real-time stats
  const liveScoreRef = useRef<HTMLSpanElement | null>(null);
  const liveChainRef = useRef<HTMLSpanElement | null>(null);
  const liveBestChainRef = useRef<HTMLSpanElement | null>(null);
  const liveRemainingRef = useRef<HTMLSpanElement | null>(null);

  // Targets
  const targetCount = level === 1 ? 25 : level === 2 ? 45 : level === 3 ? 65 : 75;
  const isLevelCleared = destroyedCount >= targetCount;

  // Load High Score on mount
  useEffect(() => {
    const saved = localStorage.getItem('chain_reaction_best_score');
    if (saved) {
      setBestScore(parseInt(saved, 10));
    }
    synth.muted = soundMuted;
    initArena(1);
  }, []);

  // HUD Synchronization effect
  useEffect(() => {
    const multVal = chainLength >= 20 ? 4 : chainLength >= 10 ? 3 : chainLength >= 5 ? 2 : 1;
    gamePlatform.updateHud({
      score: destroyedCount,
      highScore: bestScore,
      lives: null,
      timer: null,
      combo: chainLength,
      multiplier: multVal,
      level,
    });
  }, [destroyedCount, bestScore, chainLength, level]);

  // Set up 100 colorful moving neon balls
  const initArena = (lvl: number) => {
    isPlayingRef.current = true;
    setLevel(lvl);
    setHasTapped(false);
    setDestroyedCount(0);
    setChainLength(0);
    setMaxChainLength(0);
    setShowSummary(false);
    setIsSlowMo(false);
    
    chainCounterRef.current = 0;
    slowMoTimerRef.current = 0;

    destroyedCountRef.current = 0;
    chainLengthRef.current = 0;
    maxChainLengthRef.current = 0;
    scorePopsRef.current = [];

    if (liveScoreRef.current) liveScoreRef.current.textContent = '0';
    if (liveChainRef.current) liveChainRef.current.textContent = '0';
    if (liveBestChainRef.current) liveBestChainRef.current.textContent = '0';
    const initialTarget = lvl === 1 ? 25 : lvl === 2 ? 45 : lvl === 3 ? 65 : 75;
    if (liveRemainingRef.current) liveRemainingRef.current.textContent = initialTarget.toString();

    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 500;
    const height = canvas ? canvas.height : 400;

    const balls: Ball[] = [];
    const speedMultiplier = (1.2 + (lvl - 1) * 0.4) * (0.9 + Math.random() * 0.2);
    const minSpacing = Math.random() * 6 + 23; // Random starting spacing per session

    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = (0.7 + Math.random() * 0.8) * speedMultiplier;
      
      // Determine if this is a rare special orb (5-10% chance)
      const isSpecial = Math.random() < 0.08; 

      let x = 0;
      let y = 0;
      let attempts = 0;
      let valid = false;

      // Keep spacing between moving orbs on spawn
      while (!valid && attempts < 100) {
        x = Math.random() * (width - 40) + 20;
        y = Math.random() * (height - 40) + 20;
        valid = true;
        for (const other of balls) {
          const dx = x - other.x;
          const dy = y - other.y;
          if (Math.hypot(dx, dy) < minSpacing) {
            valid = false;
            break;
          }
        }
        attempts++;
      }

      balls.push({
        id: i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        radius: isSpecial ? 8.5 : (5.5 + Math.random() * 2.0),
        color: isSpecial ? '#ffd700' : BALL_COLORS[i % BALL_COLORS.length],
        isExploding: false,
        explosionRadius: 0,
        explosionMaxRadius: isSpecial ? 65 : 43, // reduced by 40% (was 72)
        explosionSpeed: isSpecial ? 1.95 : 1.3, // scale speed to match radius expansion
        explosionAge: 0,
        explosionLife: 60,
        isSpecial
      });
    }

    ballsRef.current = balls;
    particlesRef.current = [];
    ringsRef.current = [];
    comboTextsRef.current = [];
  };

  // Sparkle generator helper
  const spawnExplosionParticles = (x: number, y: number, color: string) => {
    const particles = particlesRef.current;
    const count = 24; // more particles
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 5.5; // faster and wider dispersion
      // Mix pure white hot sparkles with the neon color for extra contrast
      const particleColor = Math.random() > 0.4 ? color : '#ffffff';
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: particleColor,
        size: Math.random() * 3.5 + 1.5,
        alpha: 1,
        life: 50,
        maxLife: 50
      });
    }
  };

  // Continuous physics, chain reactions, and particle system updates (60 FPS)
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 550;
      canvas.height = Math.max(380, canvas.parentElement?.clientHeight || 400);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const updateAndDraw = () => {
      if (!isPlayingRef.current) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Decrement screenshake intensity
      setShakeIntensity(prev => Math.max(0, prev - 0.5));

      // Check Slow Motion timer duration
      if (slowMoTimerRef.current > 0) {
        slowMoTimerRef.current -= 1;
        if (slowMoTimerRef.current === 0) {
          setIsSlowMo(false);
        }
      }

      const activeSlowMo = slowMoTimerRef.current > 0;
      const speedDivisor = activeSlowMo ? 4.5 : 1.0;

      // Draw Bloom Backdrop Glow for massive chain reactions
      if (chainCounterRef.current > 15) {
        ctx.save();
        const radial = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.6);
        radial.addColorStop(0, 'rgba(139, 92, 246, 0.05)');
        radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Render glowing aiming indicator before first tap
      if (!hasTapped && mousePosRef.current) {
        const { x, y } = mousePosRef.current;
        const pulse = 1.0 + Math.sin(Date.now() / 150) * 0.04;
        const targetRadius = 78 * pulse; // starter radius is 78 (reduced by 40% from 130)

        ctx.save();
        // Soft neon fill
        ctx.fillStyle = 'rgba(236, 72, 153, 0.03)';
        ctx.beginPath();
        ctx.arc(x, y, targetRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing dashed indicator line
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(x, y, targetRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Solid outer ring with glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ec4899';
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x, y, targetRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - 18, y);
        ctx.lineTo(x + 18, y);
        ctx.moveTo(x, y - 18);
        ctx.lineTo(x, y + 18);
        ctx.stroke();

        // Small inner core dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 1. UPDATE & RENDER BALLS
      const balls = ballsRef.current;
      const explodingList: Ball[] = [];

      for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];

        if (ball.isExploding) {
          ball.explosionAge += 1;
          
          // Smooth expanding curve, then rapid collapse
          if (ball.explosionAge <= ball.explosionLife * 0.45) {
            ball.explosionRadius += ball.explosionSpeed;
          } else if (ball.explosionAge >= ball.explosionLife * 0.75) {
            ball.explosionRadius = Math.max(0, ball.explosionRadius - ball.explosionSpeed * 1.5);
          }

          explodingList.push(ball);

          // Draw neon glowing expansion sphere
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowBlur = 15;
          ctx.shadowColor = ball.color;
          const grad = ctx.createRadialGradient(ball.x, ball.y, 1, ball.x, ball.y, ball.explosionRadius);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, ball.color);
          grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.explosionRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // Standard ball physics update
          ball.x += (ball.vx / speedDivisor);
          ball.y += (ball.vy / speedDivisor);

          // Wall bouncing
          if (ball.x < ball.radius) {
            ball.x = ball.radius;
            ball.vx *= -1;
          } else if (ball.x > width - ball.radius) {
            ball.x = width - ball.radius;
            ball.vx *= -1;
          }

          if (ball.y < ball.radius) {
            ball.y = ball.radius;
            ball.vy *= -1;
          } else if (ball.y > height - ball.radius) {
            ball.y = height - ball.radius;
            ball.vy *= -1;
          }

          // Draw arcade neon ball
          ctx.save();
          if (ball.isSpecial) {
            // Pulsing glowing ring for special gold balls
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffd700';
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            const pulseRadius = ball.radius + 3 + Math.sin(Date.now() / 100) * 1.5;
            ctx.arc(ball.x, ball.y, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          ctx.shadowBlur = activeSlowMo ? 15 : 6;
          ctx.shadowColor = ball.color;
          ctx.fillStyle = ball.color;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          ctx.fill();

          // Core flare highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ball.x - 1.5, ball.y - 1.5, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Filter out fully completed explosion animations
      ballsRef.current = balls.filter(b => !b.isExploding || b.explosionAge < b.explosionLife);

      // 2. DETECT CHAIN COLLISIONS
      if (explodingList.length > 0) {
        const remainingBalls = ballsRef.current;
        let chainTriggeredThisFrame = false;

        for (let i = 0; i < remainingBalls.length; i++) {
          const ball = remainingBalls[i];
          if (ball.isExploding) continue;

          for (let j = 0; j < explodingList.length; j++) {
            const expl = explodingList[j];

            // Distance formulation
            const dx = ball.x - expl.x;
            const dy = ball.y - expl.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= ball.radius + expl.explosionRadius) {
              // DETONATION REACHED!
              ball.isExploding = true;
              chainTriggeredThisFrame = true;

              chainCounterRef.current += 1;
              const activeChain = chainCounterRef.current;

              // Sound combo
              synth.playExplosion(activeChain);

              // Increment counters and refs synchronously
              destroyedCountRef.current += 1;
              chainLengthRef.current = activeChain;
              if (activeChain > maxChainLengthRef.current) {
                maxChainLengthRef.current = activeChain;
              }

              // Update DOM text contents instantly for 0-delay feedback
              if (liveScoreRef.current) {
                liveScoreRef.current.textContent = destroyedCountRef.current.toString();
              }
              if (liveChainRef.current) {
                liveChainRef.current.textContent = chainLengthRef.current.toString();
              }
              if (liveBestChainRef.current) {
                liveBestChainRef.current.textContent = maxChainLengthRef.current.toString();
              }
              if (liveRemainingRef.current) {
                const rem = Math.max(0, targetCount - destroyedCountRef.current);
                liveRemainingRef.current.textContent = rem > 0 ? rem.toString() : 'CLEARED!';
              }

              // Also keep React states in sync (scheduled/batched update)
              setDestroyedCount(destroyedCountRef.current);
              setChainLength(activeChain);
              setMaxChainLength(prev => Math.max(prev, activeChain));

              // Spawn +1 score pop animation near the exploding orb
              scorePopsRef.current.push({
                x: ball.x,
                y: ball.y,
                alpha: 1.0,
                life: 35,
                maxLife: 35,
                color: ball.color
              });

              // Visual shockwave ring
              ringsRef.current.push({
                x: ball.x,
                y: ball.y,
                radius: 2,
                maxRadius: ball.explosionMaxRadius * 0.75,
                color: ball.color,
                alpha: 1.0,
                life: 20
              });

              // Sparks burst
              spawnExplosionParticles(ball.x, ball.y, ball.color);

              // Trigger Satisfying heavy screen shake based on how big the chain is
              setShakeIntensity(prev => Math.min(18.0, prev + 3.0));

              // Spawning combo texts
              let comboWord = '';
              if (activeChain === 5) comboWord = 'GOOD!';
              else if (activeChain === 10) comboWord = 'GREAT!';
              else if (activeChain === 15) comboWord = 'EPIC!!';
              else if (activeChain === 20) comboWord = 'LEGENDARY!!!';
              else if (activeChain === 30) comboWord = 'UNBELIEVABLE!!!';
              else if (activeChain === 45) comboWord = 'GODLIKE!!!';
              else if (activeChain % 10 === 0 && activeChain > 20) comboWord = `${activeChain} COMBO!`;

              if (comboWord) {
                comboTextsRef.current.push({
                  x: ball.x,
                  y: ball.y - 15,
                  text: comboWord,
                  color: ball.color,
                  alpha: 1.0,
                  life: 55,
                  maxLife: 55,
                  scale: 0.95
                });
              }

              // 0.3-second slow-motion on huge chain triggers (e.g., multiples of 5 on huge combos)
              if (activeChain === 10 || activeChain === 15 || activeChain === 20 || activeChain === 25 || activeChain === 30 || activeChain === 40 || activeChain === 50) {
                slowMoTimerRef.current = 18; // 18 frames at 60 FPS is exactly 0.3 seconds
                setIsSlowMo(true);
              }

              break;
            }
          }
        }
      }

      // 3. RENDER EXPANDING RING SHOCKWAVES
      const rings = ringsRef.current;
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.radius += (r.maxRadius - r.radius) * 0.12;
        r.life -= 1;
        r.alpha = Math.max(0, r.life / 20);

        if (r.life <= 0) {
          rings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = r.alpha;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2.0;
        ctx.shadowBlur = 10;
        ctx.shadowColor = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. UPDATE & RENDER SHINY PARTICLES
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx / speedDivisor;
        p.y += p.vy / speedDivisor;
        p.life -= 1;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4.5 UPDATE & RENDER FLOATING COMBO TEXTS
      const comboTexts = comboTextsRef.current;
      for (let i = comboTexts.length - 1; i >= 0; i--) {
        const ct = comboTexts[i];
        ct.y -= 0.7; // float up gently
        ct.life -= 1;
        ct.alpha = Math.max(0, ct.life / ct.maxLife);
        ct.scale += 0.006; // pulse and grow

        if (ct.life <= 0) {
          comboTexts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ct.alpha;
        ctx.fillStyle = '#ffffff'; // pure white letters
        ctx.strokeStyle = '#020617'; // dark outline for absolute readability
        ctx.lineWidth = 4.5;
        ctx.font = '900 16px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.translate(ct.x, ct.y);
        ctx.scale(ct.scale, ct.scale);

        // draw drop-shadow or outline glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = ct.color;
        
        ctx.strokeText(ct.text, 0, 0);
        ctx.fillText(ct.text, 0, 0);
        ctx.restore();
      }

      // 4.6 UPDATE & RENDER FLOATING SCORE POPUPS (+1)
      const scorePops = scorePopsRef.current;
      for (let i = scorePops.length - 1; i >= 0; i--) {
        const sp = scorePops[i];
        sp.y -= 0.8; // Float up slightly faster than combo text
        sp.life -= 1;
        sp.alpha = Math.max(0, sp.life / sp.maxLife);

        if (sp.life <= 0) {
          scorePops.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3.5;
        ctx.font = '900 15px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowBlur = 8;
        ctx.shadowColor = sp.color;

        ctx.strokeText('+1', sp.x, sp.y);
        ctx.fillText('+1', sp.x, sp.y);
        ctx.restore();
      }

      // 5. EVALUATE TRANSITIONS (When everything stops and player has tapped)
      const isStillExploding = ballsRef.current.some(b => b.isExploding);
      if (hasTapped && !isStillExploding && !showSummary) {
        setTimeout(() => {
          triggerLevelSummary();
        }, 800);
      }

      animId = requestAnimationFrame(updateAndDraw);
    };

    animId = requestAnimationFrame(updateAndDraw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [hasTapped, level, showSummary]);

  // Handle post-game outcome summary overlay
  const triggerLevelSummary = () => {
    if (showSummary) return;
    setShowSummary(true);

    const finalScore = destroyedCountRef.current;
    const finalMaxChain = maxChainLengthRef.current;
    const cleared = finalScore >= targetCount;
    synth.playFanfare(cleared);

    // Save Personal Best high-score
    const saved = localStorage.getItem('chain_reaction_best_score');
    const numericBest = saved ? parseInt(saved, 10) : 0;
    if (finalScore > numericBest) {
      localStorage.setItem('chain_reaction_best_score', finalScore.toString());
      setBestScore(finalScore);
    }

    // Explicitly update React states to match exactly
    setDestroyedCount(finalScore);
    setMaxChainLength(finalMaxChain);

    // Register score and metadata with global gamePlatform
    gamePlatform.recordScore('chain-reaction', finalScore, {
      combo: finalMaxChain,
      clicksCount: 1,
      successClicksCount: cleared ? 1 : 0,
      isPerfect: finalScore >= 90,
      errorMs: level
    });
  };

  // Primary user tap/click on arena
  const handleArenaClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hasTapped || showSummary) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHasTapped(true);
    synth.playTap();

    // Trigger Heavy Screen shake immediately
    setShakeIntensity(10.0);

    // Inject the single user trigger explosion sphere
    ballsRef.current.push({
      id: -999,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 4,
      color: '#ffffff', // Radiant pure white starter circle
      isExploding: true,
      explosionRadius: 0,
      explosionMaxRadius: 78, // reduced by 40% (was 130)
      explosionSpeed: 1.8, // slower crisp blast wave
      explosionAge: 0,
      explosionLife: 70
    });

    // Ring Wave decoration
    ringsRef.current.push({
      x,
      y,
      radius: 2,
      maxRadius: 60, // reduced by 40% (was 100)
      color: '#ffffff',
      alpha: 1.0,
      life: 22
    });
  };

  const handleMutedToggle = () => {
    setSoundMuted(prev => {
      const next = !prev;
      synth.muted = next;
      return next;
    });
  };

  // Dynamic css translation for interactive screen shakes
  const getShakeStyle = () => {
    if (shakeIntensity <= 0) return {};
    const x = (Math.random() - 0.5) * shakeIntensity;
    const y = (Math.random() - 0.5) * shakeIntensity;
    return { transform: `translate(${x}px, ${y}px)` };
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto flex flex-col justify-between p-4 sm:p-5 select-none bg-slate-950 border border-slate-900 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300"
      id="chain-reaction-game-container"
      style={getShakeStyle()}
    >
      {/* Decorative Neon Ambience */}
      <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-pink-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />

      {/* HEADER CONTROL AREA */}
      <div className="w-full flex items-center justify-between font-mono z-20 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-gradient-to-r from-pink-500 to-violet-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
            Level {level}
          </span>
          {isSlowMo && (
            <motion.span 
              animate={{ opacity: [0.4, 1.0, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-[10px] bg-violet-500/20 border border-violet-500/30 text-violet-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
            >
              ⏳ Bullet Time Slow-Mo
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Audio toggle button */}
          <button
            onClick={handleMutedToggle}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            id="reaction-sound-btn"
          >
            {soundMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300">
            <Trophy size={13} className="text-amber-400" />
            <span>BEST: <span className="text-amber-400">{bestScore}</span></span>
          </div>
        </div>
      </div>

      {/* CORE ONE-LINE DIRECTIVE */}
      <div className="w-full text-center py-1 z-10">
        <h2 className="text-sm font-semibold tracking-wide text-slate-400 font-sans uppercase">
          {!hasTapped ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-pink-400 to-slate-200 animate-pulse font-extrabold">
              You have ONE TAP. Make the biggest explosion.
            </span>
          ) : (
            <span className="text-slate-500 font-bold">
              Chain Cascading... {chainLength > 0 ? `Chain combo: ${chainLength}` : 'Waiting for link'}
            </span>
          )}
        </h2>
      </div>

      {/* LARGE ARCADE HUD PANEL (HIGH CONTRAST & RESPONSIVE) */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-2xl z-10 my-2 relative">
        {/* Large live score counter at the top center */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest font-black">CURRENT SCORE</span>
          <div className="flex items-baseline gap-1.5 leading-none mt-1">
            <span ref={liveScoreRef} className="text-5xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]">
              {destroyedCount}
            </span>
            <span className="text-slate-500 font-extrabold text-sm">/ 100</span>
          </div>
        </div>

        {/* Secondary metrics grid */}
        <div className="w-full grid grid-cols-3 gap-2 border-t border-slate-800/85 pt-3 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold">CURRENT CHAIN</span>
            <span ref={liveChainRef} className="text-xl font-black text-pink-400 mt-0.5">
              {chainLength}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-800/85">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold">BEST CHAIN</span>
            <span ref={liveBestChainRef} className="text-xl font-black text-violet-400 mt-0.5">
              {maxChainLength}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold">REMAINING TARGET</span>
            <span ref={liveRemainingRef} className="text-xl font-black text-amber-400 mt-0.5">
              {Math.max(0, targetCount - destroyedCount)}
            </span>
          </div>
        </div>
      </div>

      {/* LEVEL TARGET GUAGE BAR */}
      <div className="w-full px-2 mb-2 z-10">
        <div className="w-full h-1.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden relative">
          <div 
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-pink-500 to-violet-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"
            style={{ width: `${Math.min(100, (destroyedCount / targetCount) * 100)}%` }}
          />
          {/* Target flag indicator */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white/70"
            style={{ left: `${(targetCount / 100) * 100}%` }}
          />
        </div>
        <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-slate-500 mt-1">
          <span>START</span>
          <span>TARGET SCORE: {targetCount}</span>
          <span>100 MAX</span>
        </div>
      </div>

      {/* HIGH RES PHYSICAL ARENA */}
      <div className="w-full flex-1 flex items-center justify-center relative py-1 my-1 z-10">
        <canvas
          ref={canvasRef}
          onClick={handleArenaClick}
          onPointerMove={(e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            mousePosRef.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            };
          }}
          onPointerLeave={() => {
            mousePosRef.current = null;
          }}
          onPointerEnter={(e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            mousePosRef.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            };
          }}
          className={`w-full bg-slate-950/40 border border-slate-900/80 rounded-2xl cursor-pointer shadow-inner transition-colors duration-300 ${
            hasTapped ? 'border-pink-500/10' : 'hover:border-slate-800'
          }`}
          style={{ height: '400px', touchAction: 'none' }}
        />

        {/* Start indicator banner overlay */}
        {!hasTapped && !showSummary && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-950/90 border border-pink-500/30 px-6 py-3 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-1 backdrop-blur-md pointer-events-none"
            >
              <Sparkles className="text-pink-400 animate-spin" size={18} />
              <span className="text-xs font-mono font-black text-pink-400 uppercase tracking-widest mt-1 pointer-events-none">TAP ANYWHERE TO DETONATE</span>
              <span className="text-[10px] text-slate-400 font-sans pointer-events-none">Wait for optimal density to launch!</span>
            </motion.div>
          </div>
        )}

        {/* 3. BOLD ARCADE GAME OVER / LEVEL CLEAR OVERLAY CARD */}
        <AnimatePresence>
          {showSummary && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-30 rounded-2xl"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-[320px] bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center font-sans relative overflow-hidden"
              >
                {/* Glow ring in card */}
                <div className={`absolute -top-12 h-32 w-32 rounded-full ${isLevelCleared ? 'bg-emerald-500/10' : 'bg-red-500/10'} blur-xl`} />

                {/* Status Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border mb-2.5 ${
                  isLevelCleared ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {isLevelCleared ? <Sparkles size={20} /> : <AlertCircle size={20} />}
                </div>

                {/* Banner title */}
                <h3 className="text-lg font-black tracking-tight text-white uppercase">
                  {isLevelCleared ? 'LEVEL COMPLETE 🌟' : 'TRY AGAIN 💥'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isLevelCleared 
                    ? `Awesome cascade! Ready for Level ${level + 1}.` 
                    : `You needed ${targetCount} destroyed. Got ${destroyedCount}.`
                  }
                </p>

                {/* Core metrics comparison */}
                <div className="w-full grid grid-cols-2 gap-2 my-4 bg-slate-950/50 border border-slate-800/50 rounded-xl p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider font-extrabold">BALLS POPPED</span>
                    <span className="text-xl font-black text-white mt-0.5">{destroyedCount}</span>
                    <span className="text-[9px] text-slate-400">out of 100</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-slate-800/80">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider font-extrabold">PEAK CHAIN</span>
                    <span className="text-xl font-black text-pink-400 mt-0.5">{maxChainLength}</span>
                    <span className="text-[9px] text-slate-400">combo</span>
                  </div>
                </div>

                {/* Large responsive action buttons */}
                <div className="w-full flex flex-col gap-2">
                  {isLevelCleared ? (
                    <button
                      onClick={() => initArena(level + 1)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                      id="arcade-next-level-btn"
                    >
                      <Play size={13} className="fill-white" />
                      Next Level {level + 1}
                    </button>
                  ) : null}

                  <button
                    onClick={() => initArena(level)}
                    className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                      isLevelCleared 
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                        : 'bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white shadow-lg shadow-pink-500/10'
                    }`}
                    id="arcade-retry-btn"
                  >
                    <RotateCcw size={13} />
                    {isLevelCleared ? 'Replay Level' : 'Tap to Retry'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
