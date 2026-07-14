/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Heart, 
  Trophy, 
  Flame, 
  Clock, 
  Sparkles, 
  Shield, 
  Play, 
  Volume2, 
  VolumeX, 
  Share2, 
  Home, 
  Shuffle, 
  RotateCcw,
  Sparkle,
  Infinity as InfinityIcon,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { gamePlatform } from '../lib/gamePlatform';

// =================================================================
// AUDIO EFFECTS
// =================================================================
const playAudio = (type: 'perfect' | 'great' | 'good' | 'miss' | 'combo' | 'powerup' | 'gameOver', muted: boolean) => {
  if (muted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'perfect') {
      // Extremely satisfying crisp premium synth chime with harmonics
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc3.type = 'sine';
      
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(1567.98, ctx.currentTime + 0.12); // G6
      
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      osc2.frequency.exponentialRampToValueAtTime(2093.00, ctx.currentTime + 0.15); // C7

      osc3.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
      osc3.frequency.exponentialRampToValueAtTime(3135.96, ctx.currentTime + 0.18); // G7
      
      gain.gain.setValueAtTime(0.20, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      
      osc1.connect(gain);
      osc2.connect(gain);
      osc3.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc3.start();
      osc1.stop(ctx.currentTime + 0.22);
      osc2.stop(ctx.currentTime + 0.22);
      osc3.stop(ctx.currentTime + 0.22);
    } else if (type === 'great') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } else if (type === 'good') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(493.88, ctx.currentTime + 0.08); // B4
      gain.gain.setValueAtTime(0.10, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.10);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.10);
    } else if (type === 'miss') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } else if (type === 'combo') {
      // Arpeggio sound sweep
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.16);
      });
    } else if (type === 'powerup') {
      const notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.035);
        gain.gain.setValueAtTime(0.07, ctx.currentTime + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.035 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.035);
        osc.stop(ctx.currentTime + idx * 0.035 + 0.2);
      });
    } else if (type === 'gameOver') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.20, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    }
  } catch (e) {
    // Web audio blocked
  }
};

// =================================================================
// TYPES
// =================================================================
type PowerUpType = 'slowMo' | 'doubleScore' | 'extraLife' | 'giantZone';

interface ActivePowerUp {
  type: PowerUpType;
  durationLeft: number;
  totalDuration: number;
}

interface FloatingPowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface TimingParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  glow?: boolean;
}

// Performance Ranking helper
const getPerformanceRank = (finalScore: number) => {
  if (finalScore >= 70) return { title: 'Legend', symbol: '💎', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5' };
  if (finalScore >= 50) return { title: 'Master', symbol: '👑', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' };
  if (finalScore >= 35) return { title: 'Expert', symbol: '🥇', color: 'text-orange-400 border-orange-500/30 bg-orange-500/5' };
  if (finalScore >= 18) return { title: 'Skilled', symbol: '🥈', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' };
  return { title: 'Beginner', symbol: '🥉', color: 'text-slate-400 border-slate-500/20 bg-slate-500/5' };
};

export const PerfectTimingToy: React.FC = () => {
  // Game states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [bestScore, setBestScore] = useState<number>(0);

  // Stats trackers
  const [perfectHits, setPerfectHits] = useState<number>(0);
  const [totalHitsAttempted, setTotalHitsAttempted] = useState<number>(0);
  const [totalHitsScored, setTotalHitsScored] = useState<number>(0);

  // Dynamic timing position
  const [perfectZoneCenter, setPerfectZoneCenter] = useState<number>(50);

  // Indicators
  const [indicatorPos, setIndicatorPos] = useState<number>(10);
  const [indicatorDir, setIndicatorDir] = useState<number>(1);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [lastRating, setLastRating] = useState<'PERFECT' | 'GREAT' | 'GOOD' | 'MISS' | null>(null);
  const [ratingKey, setRatingKey] = useState<number>(0);
  
  // Power Ups
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [floatingPowerUps, setFloatingPowerUps] = useState<FloatingPowerUp[]>([]);
  const powerUpTimerRef = useRef<number>(0);

  // Audio setup
  const [muted, setMuted] = useState<boolean>(false);

  // V2 Polished mechanics
  const [perfectStreak, setPerfectStreak] = useState<number>(0);
  const [containerZoom, setContainerZoom] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);

  // Chaos mechanics (After score 15)
  const [currentModifier, setCurrentModifier] = useState<string | null>(null);
  const [appliedModifiers, setAppliedModifiers] = useState<string[]>([]);
  const [chaosNotification, setChaosNotification] = useState<string | null>(null);
  const [chaosNotificationKey, setChaosNotificationKey] = useState<number>(0);

  // References for physics loop
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<TimingParticle[]>([]);
  const isPlayingRef = useRef<boolean>(true);

  // Precise erratic indicator speed refs
  const pauseDurationRef = useRef<number>(0);
  const freezeDurationRef = useRef<number>(0);
  const randomSpeedFactorRef = useRef<number>(1.0);
  const nextErraticTimeRef = useRef<number>(0);

  // Calculate dynamic multiplier based on perfectStreak
  const multiplier = perfectStreak >= 20 ? 5 : perfectStreak >= 10 ? 3 : perfectStreak >= 5 ? 2 : 1;

  // High score fetch
  useEffect(() => {
    const history = gamePlatform.getHistory();
    if (history['perfect-timing']) {
      setBestScore(history['perfect-timing'].bestScore);
    }
  }, []);

  // HUD Synchronization effect
  useEffect(() => {
    gamePlatform.updateHud({
      score,
      highScore: bestScore,
      lives,
      timer: timeLeft,
      combo,
      multiplier,
      level: 1,
    });
  }, [score, bestScore, lives, timeLeft, combo, multiplier]);

  // Update game over sync ref
  useEffect(() => {
    isPlayingRef.current = !isGameOver && isPlaying;
  }, [isGameOver, isPlaying]);

  // Handle countdown timer
  useEffect(() => {
    if (isGameOver || !isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });

      // Update powerup active counters
      setActivePowerUps((prev) =>
        prev
          .map((p) => ({ ...p, durationLeft: Math.max(0, p.durationLeft - 1) }))
          .filter((p) => p.durationLeft > 0)
      );

      // Power up spawner trigger logic (approx every 12s)
      powerUpTimerRef.current += 1;
      if (powerUpTimerRef.current >= 12) {
        powerUpTimerRef.current = 0;
        spawnRandomPowerUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, isPlaying, score]);

  // Dynamic Chaos Modifiers based on score milestones
  useEffect(() => {
    if (score >= 15 && !isGameOver && isPlaying) {
      // Determine if we should trigger a modifier
      // Trigger new modifier every 12 scores crossed or when first crossing 15
      const milestoneIndex = Math.floor((score - 15) / 12);
      if (appliedModifiers.length <= milestoneIndex) {
        triggerChaosEvent();
      }
    }
  }, [score, isGameOver, isPlaying]);

  const triggerChaosEvent = () => {
    const modifiersList = [
      'vertical', 
      'reverse', 
      'tinyZone', 
      'giantZone', 
      'doubleSpeed', 
      'mirror', 
      'neon', 
      'lightning'
    ];
    
    // Filter out already used ones to never repeat
    const available = modifiersList.filter(m => !appliedModifiers.includes(m));
    if (available.length > 0) {
      const chosen = available[Math.floor(Math.random() * available.length)];
      setCurrentModifier(chosen);
      setAppliedModifiers((prev) => [...prev, chosen]);
      
      const labelMap: Record<string, string> = {
        vertical: '↕️ VERTICAL BAR CHALLENGE!',
        reverse: '↩️ REVERSE MOVEMENT OVERDRIVE!',
        tinyZone: '🔬 TINY PERFECT ZONE LIMIT!',
        giantZone: '🪐 GIANT PERFECT ZONE EXPANSION!',
        doubleSpeed: '⚡ DOUBLE SPEED CHAOS!',
        mirror: '🪞 MIRROR TWIN INDICATORS!',
        neon: '🌌 DEEP NEON INTENSITY MODE!',
        lightning: '⛈️ LIGHTNING FLASH OVERLOAD!'
      };

      setChaosNotification(labelMap[chosen] || '⚠️ CHAOS OVERDRIVE ACTIVE!');
      setChaosNotificationKey((prev) => prev + 1);
      playAudio('powerup', muted);

      // Extra big golden flash in background
      setScreenFlash('rgba(168, 85, 247, 0.25)');
      setTimeout(() => setScreenFlash(null), 300);
    }
  };

  // Spawn random floating power up bubble
  const spawnRandomPowerUp = () => {
    const types: PowerUpType[] = ['slowMo', 'doubleScore', 'extraLife', 'giantZone'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    
    const newPowerUp: FloatingPowerUp = {
      id: Math.random().toString(),
      type: selectedType,
      x: 15 + Math.random() * 70, // keep central
      y: 20 + Math.random() * 45,
      vx: (Math.random() - 0.5) * 2.0,
      vy: (Math.random() - 0.5) * 2.0,
      size: 46,
    };
    setFloatingPowerUps((prev) => [...prev, newPowerUp]);
  };

  // Click handler for powerup bubbles
  const handleCollectPowerUp = (id: string, type: PowerUpType, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering a rhythm tap!
    playAudio('powerup', muted);
    
    // Remove floating bubble
    setFloatingPowerUps((prev) => prev.filter((p) => p.id !== id));

    // Create custom particles at bubble spot
    const clickX = e.clientX;
    const clickY = e.clientY;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const localX = clickX - rect.left;
      const localY = clickY - rect.top;
      
      const colMap: Record<PowerUpType, string> = {
        slowMo: '#22c55e',
        doubleScore: '#3b82f6',
        extraLife: '#ef4444',
        giantZone: '#eab308'
      };
      createExplosion(localX, localY, colMap[type], 30);
    }

    if (type === 'extraLife') {
      setLives((l) => Math.min(5, l + 1));
      triggerFloatingIndicator('❤️ EXTRA LIFE RESTORED!');
    } else {
      const durations: Record<PowerUpType, number> = {
        slowMo: 3,
        doubleScore: 6,
        giantZone: 4,
        extraLife: 0,
      };
      
      setActivePowerUps((prev) => {
        const filtered = prev.filter((p) => p.type !== type);
        return [...filtered, { type, durationLeft: durations[type], totalDuration: durations[type] }];
      });
      
      const labelMap: Record<PowerUpType, string> = {
        slowMo: '💚 SLOW MOTION ENGAGED!',
        doubleScore: '💎 2X DOUBLE SCORE ACTIVE!',
        giantZone: '⚡ MAXI PERFECT ZONE EMBARKED!',
        extraLife: '',
      };
      triggerFloatingIndicator(labelMap[type]);
    }
  };

  // Helper floating banner text trigger
  const [floatingNotification, setFloatingNotification] = useState<string | null>(null);
  const [floatingNotifKey, setFloatingNotifKey] = useState<number>(0);
  
  const triggerFloatingIndicator = (text: string) => {
    setFloatingNotification(text);
    setFloatingNotifKey((k) => k + 1);
  };

  // Check game over on lives drop
  useEffect(() => {
    if (lives <= 0 && !isGameOver) {
      handleGameEnd(score);
    }
  }, [lives, isGameOver, score]);

  // Check game over on timer end safely
  useEffect(() => {
    if (timeLeft <= 0 && !isGameOver && isPlaying) {
      handleGameEnd(score);
    }
  }, [timeLeft, isGameOver, isPlaying, score]);

  // Track combo milestones safely
  useEffect(() => {
    if (combo > 0) {
      setMaxCombo((max) => Math.max(max, combo));
      checkComboMilestones(combo);
    }
  }, [combo]);

  // Gameplay physics loop (moves floating powerups, moves indicator, draws particles)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (!isGameOver && isPlaying) {
        
        // 1. Check Freeze hitstop duration
        if (freezeDurationRef.current > 0) {
          freezeDurationRef.current -= dt;
          // Skip moves while frozen to achieve juicy game feel
        } else {
          
          // 2. Erratic Indicator Physics State Machine
          if (pauseDurationRef.current > 0) {
            pauseDurationRef.current -= dt;
          } else {
            // Check next time to randomly alter indicator speed/direction
            nextErraticTimeRef.current -= dt;
            if (nextErraticTimeRef.current <= 0) {
              nextErraticTimeRef.current = 0.5 + Math.random() * 1.2;
              
              const rng = Math.random();
              if (rng < 0.12) {
                // Pause/freeze briefly
                pauseDurationRef.current = 0.10; // 100ms
              } else if (rng < 0.32) {
                // Sudden extreme acceleration speed-up
                randomSpeedFactorRef.current = 1.9 + Math.random() * 0.5;
              } else if (rng < 0.52) {
                // Sudden intense deceleration slow down
                randomSpeedFactorRef.current = 0.35 + Math.random() * 0.25;
              } else if (rng < 0.68) {
                // Unexpected direction reversal!
                setIndicatorDir((dir) => -dir);
              } else {
                // Restore standard speed baseline
                randomSpeedFactorRef.current = 1.0;
              }
            }

            // Calculate precise speed
            const baseSpeed = 92 * dt;
            const difficultySpeedMultiplier = 1 + Math.floor(score / 5) * 0.12;
            
            let speed = baseSpeed * difficultySpeedMultiplier * randomSpeedFactorRef.current;

            // Apply Slow-mo Power Up reduction
            const isSlowMoActive = activePowerUps.some((p) => p.type === 'slowMo');
            if (isSlowMoActive) {
              speed *= 0.35;
            }

            // Apply Chaos Modifier speed scaling
            if (currentModifier === 'doubleSpeed') {
              speed *= 2.0;
            }

            // Move indicator
            setIndicatorPos((pos) => {
              let nextPos = pos + indicatorDir * speed;
              if (nextPos >= 100) {
                nextPos = 100;
                setIndicatorDir(-1);
              } else if (nextPos <= 0) {
                nextPos = 0;
                setIndicatorDir(1);
              }
              return nextPos;
            });
          }
        }

        // Move Floating Power Ups
        setFloatingPowerUps((prev) =>
          prev.map((p) => {
            let nx = p.x + p.vx;
            let ny = p.y + p.vy;
            let nvx = p.vx;
            let nvy = p.vy;

            // Bounce boundaries
            if (nx <= 8 || nx >= 92) nvx = -nvx;
            if (ny <= 12 || ny >= 88) nvy = -nvy;

            return {
              ...p,
              x: Math.max(8, Math.min(92, nx)),
              y: Math.max(12, Math.min(88, ny)),
              vx: nvx,
              vy: nvy,
            };
          })
        );
      }

      // Draw and Update Particles
      drawParticles();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isPlaying, score, indicatorDir, activePowerUps, currentModifier]);

  // Particle creation helper (with glow capabilities)
  const createExplosion = (x: number, y: number, color: string, count: number, isPerfect = false) => {
    const list: TimingParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isPerfect ? (4 + Math.random() * 12) : (2 + Math.random() * 8);
      list.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: isPerfect ? (3 + Math.random() * 6) : (2 + Math.random() * 4),
        alpha: 1,
        life: isPerfect ? (0.8 + Math.random() * 0.6) : (0.5 + Math.random() * 0.5),
        glow: isPerfect,
      });
    }
    particlesRef.current = [...particlesRef.current, ...list];
  };

  // Render Canvas Particles
  const drawParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    const nextParticles: TimingParticle[] = [];

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95; // drag
      p.vy *= 0.95;
      p.life -= 0.016;
      p.alpha = Math.max(0, p.life);

      if (p.life > 0) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.glow) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        nextParticles.push(p);
      }
    });

    particlesRef.current = nextParticles;
  };

  // Adjust canvas size to parent container automatically
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width || 600;
        canvas.height = height || 400;
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // COMBO celebration helper state
  const [comboCelebration, setComboCelebration] = useState<{ text: string; subtext: string } | null>(null);
  const [celebrationKey, setCelebrationKey] = useState<number>(0);

  const checkComboMilestones = (currentCombo: number) => {
    let text = '';
    let subtext = '';
    
    if (currentCombo === 5) {
      text = 'HOT STREAK';
      subtext = 'PERFECTLY EXECUTING x5!';
    } else if (currentCombo === 10) {
      text = 'UNBELIEVABLE';
      subtext = 'UNSTOPPABLE MULTI-TAP x10!';
    } else if (currentCombo === 15) {
      text = 'MONSTER STREAK';
      subtext = 'RHYTHM MASTER x15!';
    } else if (currentCombo === 25) {
      text = 'GODLIKE';
      subtext = 'YOU ARE A TIMING CHOPIN x25!';
    }

    if (text) {
      playAudio('combo', muted);
      setComboCelebration({ text, subtext });
      setCelebrationKey((k) => k + 1);
      
      // Giant explosion in center
      if (canvasRef.current) {
        const cx = canvasRef.current.width / 2;
        const cy = canvasRef.current.height / 2;
        createExplosion(cx, cy, '#ec4899', 40, true);
        createExplosion(cx, cy, '#3b82f6', 40, true);
      }
    }
  };

  // CORE GAME OVER TRIGGER
  const handleGameEnd = (finalScore: number) => {
    setIsGameOver(true);
    playAudio('gameOver', muted);
    
    // Record score securely
    const history = gamePlatform.getHistory();
    const currentBest = history['perfect-timing']?.bestScore || 0;
    const isNewBest = finalScore > currentBest;

    const result = gamePlatform.recordScore('perfect-timing', finalScore, {
      combo: maxCombo,
      clicksCount: totalHitsAttempted,
      successClicksCount: totalHitsScored,
      isPerfect: perfectHits === totalHitsAttempted && totalHitsAttempted > 0,
    });

    gamePlatform.setActiveResult(result);
  };

  // Main interaction - tapping anywhere on timing container
  const handleTimingTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGameOver || !isPlaying) return;

    // Check freeze hitstop block
    if (freezeDurationRef.current > 0) return;

    // 1. Calculate relative coordinate for hit particles explosion
    const clickX = e.clientX;
    const clickY = e.clientY;
    let localX = 300;
    let localY = 200;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      localX = clickX - rect.left;
      localY = clickY - rect.top;
    }

    // 2. Define the active hit zones based on difficulty shrinking factor
    const baseShrink = Math.pow(0.96, Math.floor(score / 5));
    
    // Modifiers adjustments
    let shrinkModifier = 1.0;
    if (currentModifier === 'tinyZone') {
      shrinkModifier = 0.45;
    } else if (currentModifier === 'giantZone') {
      shrinkModifier = 2.0;
    }

    const shrinkingFactor = baseShrink * shrinkModifier;
    
    // Perfect Zone Base: 2.5%
    let perfectHalf = 2.5 * shrinkingFactor;
    // Giant Perfect Zone powerup increases Perfect Zone size 3.0x!
    const hasGiantZone = activePowerUps.some((p) => p.type === 'giantZone');
    if (hasGiantZone) {
      perfectHalf *= 3.0;
    }

    // Great Zone Base: 7.5%
    const greatHalf = 7.5 * shrinkingFactor;

    // Good Zone Base: 17.0%
    const goodHalf = 17.0;

    // Check indicator distance from Perfect Center (now dynamic perfectZoneCenter)
    const distancePrimary = Math.abs(indicatorPos - perfectZoneCenter);
    
    // Mirror mode calculations
    const mirroredPos = 100 - indicatorPos;
    const distanceMirror = Math.abs(mirroredPos - perfectZoneCenter);

    const isMirrorMode = currentModifier === 'mirror';
    const distance = isMirrorMode 
      ? Math.min(distancePrimary, distanceMirror) 
      : distancePrimary;

    // Check Multiplier points
    const pointsMultiplier = multiplier;
    const isDoubleScore = activePowerUps.some((p) => p.type === 'doubleScore');
    const finalPointsMultiplier = isDoubleScore ? (pointsMultiplier * 2) : pointsMultiplier;

    setTotalHitsAttempted((prev) => prev + 1);

    // Apply satisfying container scale zoom
    setContainerZoom(true);
    setTimeout(() => setContainerZoom(false), 140);

    if (distance <= perfectHalf) {
      // 🟢 PERFECT HIT
      // Freeze screen for 80ms
      freezeDurationRef.current = 0.08;

      const points = 3 * finalPointsMultiplier;
      setScore((s) => s + points);
      setCombo((c) => c + 1);
      setPerfectStreak((s) => s + 1);
      setPerfectHits((p) => p + 1);
      setTotalHitsScored((t) => t + 1);
      setLastRating('PERFECT');
      setRatingKey((k) => k + 1);
      playAudio('perfect', muted);

      // Flash background gold
      setScreenFlash('rgba(234, 179, 8, 0.2)');
      setTimeout(() => setScreenFlash(null), 180);

      // Intense golden particle burst
      createExplosion(localX, localY, '#fbbf24', 40, true);

      // Intense Screen shake
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 240);

      // Move Perfect Zone on successful hit
      movePerfectZone();

    } else if (distance <= greatHalf) {
      // 🟡 GREAT HIT
      const points = 2 * finalPointsMultiplier;
      setScore((s) => s + points);
      setCombo((c) => c + 1);
      // Great hit maintains streak but doesn't increment consecutive perfects
      setTotalHitsScored((t) => t + 1);
      setLastRating('GREAT');
      setRatingKey((k) => k + 1);
      playAudio('great', muted);

      // Flash background blue
      setScreenFlash('rgba(59, 130, 246, 0.15)');
      setTimeout(() => setScreenFlash(null), 150);

      // Blue particle burst
      createExplosion(localX, localY, '#3b82f6', 25, false);

      // Move Perfect Zone on successful hit
      movePerfectZone();

    } else if (distance <= goodHalf) {
      // 🟠 GOOD HIT
      const points = 1 * finalPointsMultiplier;
      setScore((s) => s + points);
      setCombo((c) => c + 1);
      setTotalHitsScored((t) => t + 1);
      setLastRating('GOOD');
      setRatingKey((k) => k + 1);
      playAudio('good', muted);

      // Small orange particle pulse
      createExplosion(localX, localY, '#f97316', 15, false);

      // Move Perfect Zone on successful hit
      movePerfectZone();

    } else {
      // 🔴 MISS
      setLives((l) => Math.max(0, l - 1));
      setCombo(0);
      setPerfectStreak(0); // reset multiplier streak dramatically!
      setLastRating('MISS');
      setRatingKey((k) => k + 1);
      playAudio('miss', muted);

      // Flash red
      setScreenFlash('rgba(239, 68, 68, 0.25)');
      setTimeout(() => setScreenFlash(null), 200);

      // Red particles
      createExplosion(localX, localY, '#ef4444', 20, false);
      
      // Slight screen shake
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 160);
    }
  };

  const movePerfectZone = () => {
    setPerfectZoneCenter((prev) => {
      let nextPos = prev;
      // Find a random spot between 15% and 85% that is at least 22% away from previous position
      let attempts = 0;
      while (Math.abs(nextPos - prev) < 22 && attempts < 15) {
        nextPos = 15 + Math.floor(Math.random() * 70);
        attempts++;
      }
      return nextPos;
    });
  };

  // Lightning effect tick for lighting mode chaos
  const [lightningTick, setLightningTick] = useState<boolean>(false);
  useEffect(() => {
    if (currentModifier === 'lightning' && !isGameOver && isPlaying) {
      const interval = setInterval(() => {
        if (Math.random() < 0.35) {
          setLightningTick(true);
          setTimeout(() => setLightningTick(false), 80);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [currentModifier, isGameOver, isPlaying]);

  // Difficulty Tier styling
  const getDifficultyTier = () => {
    if (score >= 60) return { label: 'LEGENDARY', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' };
    if (score >= 40) return { label: 'HARDCORE', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' };
    if (score >= 25) return { label: 'MEDIUM', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' };
    if (score >= 12) return { label: 'QUICK', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
    return { label: 'EASY', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' };
  };

  // Width of Perfect Zone
  const baseShrink = Math.pow(0.96, Math.floor(score / 5));
  let shrinkModifier = 1.0;
  if (currentModifier === 'tinyZone') shrinkModifier = 0.45;
  else if (currentModifier === 'giantZone') shrinkModifier = 2.0;

  let perfectWidth = 5.0 * baseShrink * shrinkModifier;
  const hasGiantZone = activePowerUps.some((p) => p.type === 'giantZone');
  if (hasGiantZone) perfectWidth *= 3.0;

  // Accuracy calculation
  const accuracyPercent = totalHitsAttempted > 0 
    ? Math.round((totalHitsScored / totalHitsAttempted) * 100) 
    : 100;

  // Custom Game Over Renderer to fit requirements beautifully
  const rank = getPerformanceRank(score);

  const resetGameSession = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(45);
    setPerfectHits(0);
    setPerfectStreak(0);
    setTotalHitsAttempted(0);
    setTotalHitsScored(0);
    setPerfectZoneCenter(50);
    setIndicatorPos(10);
    setIndicatorDir(1);
    setLastRating(null);
    setCurrentModifier(null);
    setAppliedModifiers([]);
    setActivePowerUps([]);
    setFloatingPowerUps([]);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleTimingTap}
      style={{
        transform: containerZoom ? 'scale(1.02)' : 'scale(1.0)',
        backgroundColor: screenFlash || undefined
      }}
      className={`relative w-full h-full min-h-[500px] flex flex-col justify-between p-5 select-none overflow-hidden rounded-3xl border transition-all duration-200 ${
        screenShake ? 'animate-arcade-heavy-shake' : ''
      } ${
        lightningTick ? 'bg-white/15' : ''
      } ${
        currentModifier === 'neon' 
          ? 'bg-slate-950 border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.15)] text-white' 
          : 'bg-slate-950/95 border-slate-900 text-white'
      }`}
      id="perfect-timing-game-view"
    >
      {/* 60FPS Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Floating combo announcements */}
      <AnimatePresence>
        {comboCelebration && (
          <motion.div
            key={celebrationKey}
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: [0.3, 1.25, 1], opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            onAnimationComplete={() => setTimeout(() => setComboCelebration(null), 1200)}
            className="absolute inset-x-0 top-1/4 flex flex-col items-center justify-center text-center pointer-events-none z-30"
          >
            <span className="text-4xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] uppercase">
              🔥 {comboCelebration.text}
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest mt-1.5">
              {comboCelebration.subtext}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chaos Modifier Flash announcement */}
      <AnimatePresence>
        {chaosNotification && (
          <motion.div
            key={chaosNotificationKey}
            initial={{ opacity: 0, scale: 0.5, y: -30 }}
            animate={{ opacity: 1, scale: [0.5, 1.2, 1], y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            onAnimationComplete={() => setTimeout(() => setChaosNotification(null), 2500)}
            className="absolute left-1/2 -translate-x-1/2 top-24 z-40 bg-purple-950/90 border border-purple-400/40 text-purple-300 px-6 py-2.5 rounded-2xl font-mono text-[11px] uppercase tracking-wider font-extrabold shadow-[0_0_20px_rgba(168,85,247,0.3)] text-center max-w-sm pointer-events-none"
          >
            <div className="text-[9px] text-purple-400 font-bold tracking-widest uppercase mb-0.5">⚡ CHAOS MODE INITIATED ⚡</div>
            {chaosNotification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating micro power-up activation text */}
      <AnimatePresence>
        {floatingNotification && (
          <motion.div
            key={floatingNotifKey}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            onAnimationComplete={() => setTimeout(() => setFloatingNotification(null), 1500)}
            className="absolute left-1/2 -translate-x-1/2 top-16 z-40 bg-slate-900/90 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold shadow-lg pointer-events-none"
          >
            {floatingNotification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating power-up bubbles */}
      <AnimatePresence>
        {floatingPowerUps.map((p) => {
          let label = '💚';
          let borderCol = 'border-green-500 bg-green-500/10 text-green-400';
          if (p.type === 'doubleScore') {
            label = '💎';
            borderCol = 'border-blue-500 bg-blue-500/10 text-blue-400';
          } else if (p.type === 'extraLife') {
            label = '❤️';
            borderCol = 'border-red-500 bg-red-500/10 text-red-400';
          } else if (p.type === 'giantZone') {
            label = '⚡';
            borderCol = 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
          }

          return (
            <motion.button
              key={p.id}
              onClick={(e) => handleCollectPowerUp(p.id, p.type, e)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border flex items-center justify-center text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer z-30 transition-transform hover:scale-110 active:scale-95 animate-pulse ${borderCol}`}
            >
              {label}
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Dynamic Background Overlays for Neon/Lightning Chaos */}
      {currentModifier === 'neon' && (
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 via-transparent to-indigo-950/10 pointer-events-none animate-pulse duration-2000" />
      )}

      {/* TOP HEADER STATUS PANEL */}
      <div className="flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border tracking-wider font-mono ${getDifficultyTier().color}`}>
            {getDifficultyTier().label}
          </span>
          {currentModifier && (
            <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-purple-500/20 bg-purple-950/30 text-purple-300 animate-pulse uppercase">
              🌀 CHAOS: {currentModifier}
            </span>
          )}
          {activePowerUps.map((p) => {
            let badgeStyle = 'bg-green-500/10 text-green-400 border-green-500/20';
            let label = 'SLOW-MO';
            if (p.type === 'doubleScore') {
              badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
              label = '2X SCORE';
            } else if (p.type === 'giantZone') {
              badgeStyle = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
              label = 'GIANT ZONE';
            }
            return (
              <span key={p.type} className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-widest uppercase ${badgeStyle}`}>
                🔥 {label} ({p.durationLeft}s)
              </span>
            );
          })}
        </div>

        {/* Best Score & Mute Control */}
        <div className="flex items-center gap-2.5">
          {bestScore > 0 && (
            <span className="text-[10px] font-mono font-semibold text-slate-500 flex items-center gap-1">
              <Trophy size={11} className="text-amber-500" /> PB: {bestScore}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMuted(!muted);
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
        </div>
      </div>

      {/* CORE ARCADE RHYTHM HUD */}
      <div className="flex flex-col items-center justify-center my-auto w-full z-20">
        
        {/* Combo Badge Floating */}
        <div className="h-10 flex items-center justify-center relative w-full mb-2">
          <AnimatePresence mode="wait">
            {combo >= 2 && (
              <motion.div
                key={combo}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 1.2, 1], opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="absolute flex items-center gap-1.5 text-orange-400 font-mono text-xs font-black bg-orange-500/15 border border-orange-500/30 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.15)]"
              >
                <Flame size={12} className="fill-orange-500 text-orange-500 animate-pulse" />
                <span>STREAK x{combo}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Score display (with multiplier pill) */}
        <div className="flex flex-col items-center justify-center mb-6">
          <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest font-black mb-0.5">ACCUMULATED SCORE</span>
          <div className="flex items-center gap-3">
            <span className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {score}
            </span>
            
            {/* Multiplier pill indicator */}
            <AnimatePresence mode="wait">
              {multiplier > 1 && (
                <motion.span
                  key={multiplier}
                  initial={{ scale: 0.5, opacity: 0, x: -10 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-mono font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.15)] animate-bounce"
                >
                  <Sparkle size={10} className="fill-yellow-400 animate-spin" />
                  x{multiplier} MULTI
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Lives Counter Hearts representation */}
        <div className="flex justify-center items-center gap-1.5 mb-8 bg-slate-950/60 px-4 py-2 border border-slate-900/60 rounded-full shadow-inner">
          {[1, 2, 3, 4, 5].map((idx) => (
            <motion.div
              key={idx}
              animate={{
                scale: idx <= lives ? 1 : 0.85,
                opacity: idx <= lives ? 1 : 0.15,
              }}
              className="transition-colors duration-200"
            >
              <Heart 
                size={16} 
                className={idx <= lives ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.45)]' : 'text-slate-800'} 
              />
            </motion.div>
          ))}
        </div>

        {/* ================================================================= */}
        {/* TIMING BAR RENDERER */}
        {/* ================================================================= */}
        <div className="w-full max-w-lg flex flex-col items-center">
          
          {/* Main Timing Container Track */}
          <div 
            className={`w-full bg-slate-900/90 border rounded-2xl relative flex items-center overflow-hidden shadow-inner shadow-black/50 transition-all duration-300 ${
              currentModifier === 'vertical' 
                ? 'h-32 w-14 max-w-[56px] flex-col justify-center border-indigo-500/30 bg-indigo-950/5' 
                : 'h-10 border-slate-800'
            }`}
          >
            {/* Zones Overlays inside the track */}
            {currentModifier === 'vertical' ? (
              // VERTICAL ORIENTATION VIEW
              <>
                {/* 🔴 GOOD ZONE */}
                <div 
                  style={{ top: '25%', bottom: '25%', left: 0, right: 0 }}
                  className="absolute bg-orange-500/5 border-y border-orange-500/10 pointer-events-none"
                />

                {/* 🟡 GREAT ZONE */}
                <div 
                  style={{ top: '38%', bottom: '38%', left: 0, right: 0 }}
                  className="absolute bg-blue-500/10 border-y border-blue-500/15 pointer-events-none"
                />

                {/* 🟢 PERFECT ZONE (Centered dynamically at perfectZoneCenter) */}
                <div 
                  style={{ 
                    top: `${perfectZoneCenter - perfectWidth / 2}%`, 
                    height: `${perfectWidth}%`,
                    left: 0,
                    right: 0
                  }}
                  className="absolute bg-gradient-to-b from-emerald-500/15 via-emerald-500/40 to-emerald-500/15 border-y border-emerald-400/50 pointer-events-none flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <div className="h-0.5 w-full bg-emerald-400/60" />
                </div>

                {/* Main Glowing moving indicator */}
                <div 
                  style={{ top: `${indicatorPos}%` }}
                  className="absolute h-4 w-full -mt-2 pointer-events-none z-20 flex justify-center items-center"
                >
                  <div className="h-1.5 w-full bg-white rounded-full shadow-[0_0_12px_#ffffff,0_0_20px_#3b82f6]" />
                </div>

                {/* Mirror indicator in mirror chaos mode */}
                {currentModifier === 'mirror' && (
                  <div 
                    style={{ top: `${100 - indicatorPos}%` }}
                    className="absolute h-4 w-full -mt-2 pointer-events-none opacity-80 z-20 flex justify-center items-center"
                  >
                    <div className="h-1.5 w-full bg-cyan-300 rounded-full shadow-[0_0_12px_#22d3ee,0_0_20px_#22d3ee]" />
                  </div>
                )}
              </>
            ) : (
              // STANDARD HORIZONTAL ORIENTATION VIEW
              <>
                {/* 🔴 GOOD ZONE */}
                <div 
                  style={{ left: `${perfectZoneCenter - 18}%`, width: '36%' }}
                  className="absolute h-full bg-orange-500/5 border-x border-orange-500/10 pointer-events-none"
                />

                {/* 🟡 GREAT ZONE */}
                <div 
                  style={{ left: `${perfectZoneCenter - 7.5}%`, width: '15%' }}
                  className="absolute h-full bg-blue-500/10 border-x border-blue-500/15 pointer-events-none"
                />

                {/* 🟢 PERFECT ZONE (Centered dynamically at perfectZoneCenter) */}
                <div 
                  style={{ 
                    left: `${perfectZoneCenter - perfectWidth / 2}%`, 
                    width: `${perfectWidth}%` 
                  }}
                  className="absolute h-full bg-gradient-to-r from-emerald-500/15 via-emerald-500/40 to-emerald-500/15 border-x border-emerald-400/50 pointer-events-none flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                >
                  <div className="w-0.5 h-full bg-emerald-400/60" />
                </div>

                {/* Main Glowing moving indicator */}
                <div 
                  style={{ left: `${indicatorPos}%` }}
                  className="absolute w-4 h-full -ml-2 pointer-events-none z-20 flex flex-col justify-between items-center"
                >
                  <div className="w-1.5 h-full bg-white rounded-full shadow-[0_0_12px_#ffffff,0_0_20px_#3b82f6]" />
                </div>

                {/* Mirror indicator in mirror chaos mode */}
                {currentModifier === 'mirror' && (
                  <div 
                    style={{ left: `${100 - indicatorPos}%` }}
                    className="absolute w-4 h-full -ml-2 pointer-events-none opacity-80 z-20 flex flex-col justify-between items-center"
                  >
                    <div className="w-1.5 h-full bg-cyan-300 rounded-full shadow-[0_0_12px_#22d3ee,0_0_20px_#22d3ee]" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Timing Bar footer labels */}
          <div className="w-full flex justify-between items-center mt-2 px-1 text-[9px] font-mono text-slate-500 tracking-wider">
            <span className="uppercase text-left">OUT ZONE</span>
            <div className="flex gap-4">
              <span className="text-orange-500/80 uppercase">GOOD</span>
              <span className="text-blue-400/80 uppercase">GREAT</span>
              <span className="text-emerald-400 font-bold uppercase">PERFECT</span>
              <span className="text-blue-400/80 uppercase">GREAT</span>
              <span className="text-orange-500/80 uppercase">GOOD</span>
            </div>
            <span className="uppercase text-right">OUT ZONE</span>
          </div>

        </div>

        {/* Real-time hit feedback rating texts */}
        <div className="h-10 mt-6 flex items-center justify-center relative w-full">
          <AnimatePresence mode="wait">
            {lastRating && (
              <motion.div
                key={ratingKey}
                initial={{ scale: 0.5, opacity: 0, y: 12 }}
                animate={{ scale: [0.5, 1.25, 1], opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`font-mono text-xs sm:text-sm font-black uppercase tracking-widest px-5 py-1.5 rounded-full border ${
                  lastRating === 'PERFECT' 
                    ? 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-110'
                    : lastRating === 'GREAT'
                    ? 'text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                    : lastRating === 'GOOD'
                    ? 'text-orange-400 border-orange-500/30 bg-orange-500/10'
                    : 'text-rose-500 border-rose-500/30 bg-rose-500/10 animate-arcade-tiny-shake'
                }`}
              >
                {lastRating === 'PERFECT' ? '🔥 PERFECT!' : lastRating === 'GREAT' ? '✨ GREAT!' : lastRating === 'GOOD' ? '👍 GOOD' : '❌ MISS!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Dynamic ranking announcement popup on score trigger */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 bg-slate-950/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full flex flex-col items-center"
          >
            <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-widest uppercase mb-1">
              ⭐ PERFECT TIMING • PERFORMANCE OVERVIEW
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-6 flex items-center gap-1">
              PLAY COMPLETE
            </h2>

            {/* Premium performance rank badge */}
            <div className={`w-full max-w-[260px] p-5 rounded-2xl border ${rank.color} flex flex-col items-center justify-center gap-2 mb-6 shadow-lg`}>
              <span className="text-3xl">{rank.symbol}</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">YOUR TIMING TIER</span>
              <span className="text-xl font-black uppercase tracking-widest text-slate-100">{rank.title}</span>
            </div>

            {/* Custom Metrics Panel */}
            <div className="w-full bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-3 font-mono shadow-inner text-left text-xs text-slate-300 mb-6">
              <div className="flex justify-between border-b border-slate-800/50 pb-2">
                <span className="text-slate-400">FINAL SCORE:</span>
                <span className="font-bold text-white text-sm">{score} pts</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-2">
                <span className="text-slate-400">BEST SCORE:</span>
                <span className="font-bold text-amber-400">{Math.max(bestScore, score)} pts</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-2">
                <span className="text-slate-400">MAX STREAK:</span>
                <span className="font-bold text-orange-400">{maxCombo} Hits</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-2">
                <span className="text-slate-400">PERFECT HITS:</span>
                <span className="font-bold text-emerald-400">{perfectHits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ACCURACY:</span>
                <span className="font-bold text-blue-400">{accuracyPercent}%</span>
              </div>
            </div>

            {/* Button controls */}
            <div className="flex flex-col gap-2 w-full">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={resetGameSession}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold tracking-wider uppercase cursor-pointer active:scale-95 transition-all shadow-md shadow-indigo-600/10"
                >
                  <RotateCcw size={13} />
                  Play Again
                </button>
                <button
                  onClick={() => {
                    const history = gamePlatform.getHistory();
                    const nextList = Object.keys(history);
                    if (nextList.length > 0) {
                      window.location.reload();
                    } else {
                      window.location.hash = '#/';
                      window.location.reload();
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-indigo-400 font-mono text-xs font-bold tracking-wider uppercase cursor-pointer active:scale-95 transition-all"
                >
                  <Shuffle size={13} />
                  Next Game
                </button>
              </div>
              <button
                onClick={() => {
                  window.location.hash = '#/';
                  window.location.reload();
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 font-mono text-[10px] tracking-widest uppercase cursor-pointer active:scale-95 transition-all"
              >
                <Home size={11} />
                Return Home
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* BOTTOM FOOTER INFO HUD */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 tracking-wider border-t border-slate-900/60 pt-3 z-20">
        <div className="flex items-center gap-1.5 uppercase">
          <Clock size={11} className="text-slate-600" />
          <span>TIME LEFT: <strong className="text-slate-300">{timeLeft}s</strong></span>
        </div>
        <div className="flex items-center gap-1.5 uppercase">
          <span>ACCURACY: <strong className="text-slate-300">{accuracyPercent}%</strong></span>
        </div>
      </div>
    </div>
  );
};
