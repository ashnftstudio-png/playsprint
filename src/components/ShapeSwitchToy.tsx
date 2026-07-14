/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Timer, Award, Flame, Sparkles, AlertTriangle } from 'lucide-react';
import { gamePlatform } from '../lib/gamePlatform';

// =================================================================
// DATA TYPES & CONFIGURATIONS
// =================================================================

type ShapeType =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'hexagon'
  | 'star'
  | 'heart'
  | 'diamond'
  | 'pentagon'
  | 'arrow'
  | 'moon'
  | 'lightning'
  | 'cross';

interface ShapeConfig {
  type: ShapeType;
  label: string;
  color: string;      // Tailwind text color
  borderColor: string; // Tailwind border
  glowColor: string;  // Hex color for canvas particles / shadows
  bgColor: string;    // Tailwind background with transparency
}

const SHAPES: Record<ShapeType, ShapeConfig> = {
  circle: {
    type: 'circle',
    label: 'Circle',
    color: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    glowColor: '#38bdf8',
    bgColor: 'bg-sky-500/10'
  },
  square: {
    type: 'square',
    label: 'Square',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    glowColor: '#34d399',
    bgColor: 'bg-emerald-500/10'
  },
  triangle: {
    type: 'triangle',
    label: 'Triangle',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    glowColor: '#fbbf24',
    bgColor: 'bg-amber-500/10'
  },
  hexagon: {
    type: 'hexagon',
    label: 'Hexagon',
    color: 'text-fuchsia-400',
    borderColor: 'border-fuchsia-500/30',
    glowColor: '#e879f9',
    bgColor: 'bg-fuchsia-500/10'
  },
  star: {
    type: 'star',
    label: 'Star',
    color: 'text-yellow-300',
    borderColor: 'border-yellow-500/30',
    glowColor: '#fde047',
    bgColor: 'bg-yellow-500/10'
  },
  heart: {
    type: 'heart',
    label: 'Heart',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    glowColor: '#fb7185',
    bgColor: 'bg-rose-500/10'
  },
  diamond: {
    type: 'diamond',
    label: 'Diamond',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    glowColor: '#22d3ee',
    bgColor: 'bg-cyan-500/10'
  },
  pentagon: {
    type: 'pentagon',
    label: 'Pentagon',
    color: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    glowColor: '#a78bfa',
    bgColor: 'bg-violet-500/10'
  },
  arrow: {
    type: 'arrow',
    label: 'Arrow',
    color: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    glowColor: '#2dd4bf',
    bgColor: 'bg-teal-500/10'
  },
  moon: {
    type: 'moon',
    label: 'Moon',
    color: 'text-indigo-300',
    borderColor: 'border-indigo-500/30',
    glowColor: '#818cf8',
    bgColor: 'bg-indigo-500/10'
  },
  lightning: {
    type: 'lightning',
    label: 'Lightning',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    glowColor: '#fb923c',
    bgColor: 'bg-orange-500/10'
  },
  cross: {
    type: 'cross',
    label: 'Cross',
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    glowColor: '#f87171',
    bgColor: 'bg-red-500/10'
  }
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

// =================================================================
// AUDIO SYNTHESIZERS
// =================================================================
const playSynthSound = (type: 'correct' | 'wrong' | 'combo5' | 'combo10' | 'combo20' | 'combo30' | 'combo50' | 'gameOver') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.08); // D6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'combo5') {
      // Arpeggio chord
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.04 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.12);
      });
    } else if (type === 'combo10') {
      // Sparkling rising cascade
      const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98]; // D5, F#5, A5, D6, F#6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.035);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.035 + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.035);
        osc.stop(ctx.currentTime + idx * 0.035 + 0.14);
      });
    } else if (type === 'combo20') {
      // Ultimate victory sound
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0]; // Major Scale Sweep
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.03);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.03 + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.03);
        osc.stop(ctx.currentTime + idx * 0.03 + 0.16);
      });
    } else if (type === 'combo30') {
      // Hyper rising octave cascade
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0, 2637.02, 3135.96];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.025);
        gain.gain.setValueAtTime(0.07, ctx.currentTime + idx * 0.025);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.025 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.025);
        osc.stop(ctx.currentTime + idx * 0.025 + 0.15);
      });
    } else if (type === 'combo50') {
      // Ultimate arcade siren / power chord
      const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
      chords.forEach((freq) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        
        osc1.frequency.setValueAtTime(freq, ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.4);
        
        osc2.frequency.setValueAtTime(freq * 2.0, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(freq * 3.0, ctx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.45);
        osc2.stop(ctx.currentTime + 0.45);
      });
    } else if (type === 'gameOver') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    // Web Audio blocked or unsupported
  }
};

const getShapeDuration = (currentScore: number): number => {
  if (currentScore < 10) return 2000;
  if (currentScore < 20) return 1600;
  if (currentScore < 30) return 1300;
  if (currentScore < 40) return 1000;
  if (currentScore < 60) return 800;
  return 600;
};

type ModifierType =
  | 'none'
  | 'rotate'
  | 'grow'
  | 'shrink'
  | 'glow'
  | 'shake'
  | 'flipX'
  | 'flipY'
  | 'flashBg'
  | 'pulseButtons'
  | 'screenShake'
  | 'ghostShadow';

const MODIFIERS: ModifierType[] = [
  'rotate', 'grow', 'shrink', 'glow', 'shake', 'flipX', 'flipY', 'flashBg', 'pulseButtons', 'screenShake', 'ghostShadow'
];

const getButtonsForShape = (activeShape: ShapeType): ShapeType[] => {
  const allShapes: ShapeType[] = [
    'circle', 'square', 'triangle', 'hexagon',
    'star', 'heart', 'diamond', 'pentagon',
    'arrow', 'moon', 'lightning', 'cross'
  ];
  const filtered = allShapes.filter(s => s !== activeShape);
  const shuffledIncorrect = [...filtered].sort(() => Math.random() - 0.5);
  const incorrectChoices = shuffledIncorrect.slice(0, 3);
  const finalChoices = [activeShape, ...incorrectChoices];
  return finalChoices.sort(() => Math.random() - 0.5);
};

export const ShapeSwitchToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game States
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [currentShape, setCurrentShape] = useState<ShapeType>('circle');
  const [personalBest, setPersonalBest] = useState<number>(0);

  // Active Chaos Modifier State
  const [activeModifier, setActiveModifier] = useState<ModifierType>('none');
  const prevModifierRef = useRef<ModifierType>('none');

  // Buttons state - handles position scrambling
  const [buttonOrder, setButtonOrder] = useState<ShapeType[]>([]);

  // Feedback Flags
  const [redFlash, setRedFlash] = useState<boolean>(false);
  const [correctFlash, setCorrectFlash] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [comboText, setComboText] = useState<{ text: string; color: string } | null>(null);

  // Unique trigger to restart shape countdowns
  const [shapeResetKey, setShapeResetKey] = useState<number>(0);

  // Particle System
  const particlesRef = useRef<Particle[]>([]);
  const isPlayingRef = useRef<boolean>(true);

  // Difficulty Tier
  const getDifficultyTier = () => {
    if (score < 10) return { label: 'EASY', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
    if (score < 25) return { label: 'MEDIUM', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (score < 40) return { label: 'HARD', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'IMPOSSIBLE', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse' };
  };

  // Sync Best Score & pick random first shape
  useEffect(() => {
    const savedBest = localStorage.getItem('shape_switch_best');
    if (savedBest) {
      setPersonalBest(parseInt(savedBest, 10));
    }
    const allShapes: ShapeType[] = [
      'circle', 'square', 'triangle', 'hexagon',
      'star', 'heart', 'diamond', 'pentagon',
      'arrow', 'moon', 'lightning', 'cross'
    ];
    const randomType = allShapes[Math.floor(Math.random() * allShapes.length)];
    setCurrentShape(randomType);
    setButtonOrder(getButtonsForShape(randomType));
  }, []);

  // HUD Synchronization effect
  useEffect(() => {
    const levelVal = score < 10 ? 1 : score < 25 ? 2 : score < 40 ? 3 : 4;
    const multVal = combo >= 15 ? 4 : combo >= 10 ? 3 : combo >= 5 ? 2 : 1;
    gamePlatform.updateHud({
      score,
      highScore: personalBest,
      lives,
      timer: timeLeft,
      combo,
      multiplier: multVal,
      level: levelVal,
    });
  }, [score, personalBest, lives, timeLeft, combo]);

  // 60FPS Canvas Animation loop for particles
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Slight gravity gravity drift
        p.life -= 1;
        p.alpha = Math.max(0, p.life / 40);

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Main countdown game timer (overall 45 seconds game duration)
  useEffect(() => {
    if (isGameOver || !isPlayingRef.current) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver]);

  // Monitor timeLeft to trigger Game End safely
  useEffect(() => {
    if (timeLeft <= 0 && !isGameOver && isPlayingRef.current) {
      handleGameEnd();
    }
  }, [timeLeft, isGameOver]);

  // Handle Game Over
  const handleGameEnd = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    isPlayingRef.current = false;
    playSynthSound('gameOver');

    // Save Personal Best
    const savedBest = localStorage.getItem('shape_switch_best');
    const numericBest = savedBest ? parseInt(savedBest, 10) : 0;
    const isNewBest = score > numericBest;
    if (isNewBest) {
      localStorage.setItem('shape_switch_best', score.toString());
      setPersonalBest(score);
    }

    // Submit core stats to Shared Platform Game Engine
    gamePlatform.recordScore('shape-switch', score, {
      combo: maxCombo,
      isPerfect: score >= 40,
      clicksCount: score + (3 - lives), // Total actions attempted
      successClicksCount: score
    });
  };

  // Pick new active shape
  const pickNextShape = (prevType: ShapeType, currentScore: number) => {
    const allShapes: ShapeType[] = [
      'circle', 'square', 'triangle', 'hexagon',
      'star', 'heart', 'diamond', 'pentagon',
      'arrow', 'moon', 'lightning', 'cross'
    ];
    
    // Pick fully randomly from all 12 shapes.
    // This allows consecutive repeats to occur naturally.
    const randomType = allShapes[Math.floor(Math.random() * allShapes.length)];
    setCurrentShape(randomType);

    // Randomize button positions every round
    setButtonOrder(getButtonsForShape(randomType));

    // Handle Chaos Modifiers after score 15
    let nextModifier: ModifierType = 'none';
    if (currentScore >= 15 && Math.random() < 0.45) { // 45% chance of chaos
      const allowed = MODIFIERS.filter(m => m !== prevModifierRef.current);
      nextModifier = allowed[Math.floor(Math.random() * allowed.length)];
    }
    setActiveModifier(nextModifier);
    prevModifierRef.current = nextModifier;
  };

  // Spark burst physics
  const spawnBurst = (x: number, y: number, colorHex: string, extraCount: number = 0) => {
    const particles = particlesRef.current;
    const count = 25 + Math.floor(Math.random() * 15) + extraCount;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5 + (extraCount > 0 ? Math.random() * 2 : 0);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colorHex,
        size: 2.5 + Math.random() * 3 + (extraCount > 0 ? 0.5 : 0),
        alpha: 1,
        life: 25 + Math.floor(Math.random() * 20)
      });
    }
  };

  // Center shape burst explosion
  const spawnCenterBurst = () => {
    const stage = document.getElementById('shape-switch-center-stage');
    const container = containerRef.current;
    if (stage && container) {
      const rect = stage.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;
      spawnBurst(x, y, SHAPES[currentShape].glowColor, 20);
    }
  };

  // Handle Shape Timeout
  const handleShapeTimeout = () => {
    if (isGameOver) return;

    // Play wrong sound
    playSynthSound('wrong');

    // Screen flashes red & shake
    setRedFlash(true);
    setShake(true);

    if ('vibrate' in navigator) {
      try { navigator.vibrate(100); } catch (_) {}
    }

    setTimeout(() => {
      setRedFlash(false);
      setShake(false);
    }, 300);

    // Shape explodes
    spawnCenterBurst();

    // Reset combo
    setCombo(0);

    // Lose one life
    setLives((prevLives) => prevLives - 1);
  };

  // Countdown timer for each individual shape
  useEffect(() => {
    if (isGameOver || !isPlayingRef.current) return;

    const duration = getShapeDuration(score);
    const timerId = setTimeout(() => {
      handleShapeTimeout();
    }, duration);

    return () => clearTimeout(timerId);
  }, [currentShape, shapeResetKey, isGameOver, score]);

  // Monitor lives to handle game ending or next shape picking safely without executing side-effects in state setters
  const prevLivesRef = useRef<number>(3);
  useEffect(() => {
    if (lives < prevLivesRef.current) {
      if (lives <= 0) {
        if (!isGameOver && isPlayingRef.current) {
          handleGameEnd();
        }
      } else {
        // If lives are lost but the game is still active, pick a new shape and reset countdown
        if (!isGameOver && isPlayingRef.current) {
          pickNextShape(currentShape, score);
          setShapeResetKey(prev => prev + 1);
        }
      }
    }
    prevLivesRef.current = lives;
  }, [lives, isGameOver, score, currentShape]);

  // Tap button interaction
  const handleTap = (type: ShapeType, e: React.MouseEvent<HTMLButtonElement>) => {
    if (isGameOver) return;

    // Trigger button coordinates for localized sparks
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    const x = rect.left - (containerRect?.left || 0) + rect.width / 2;
    const y = rect.top - (containerRect?.top || 0) + rect.height / 2;

    if (type === currentShape) {
      // CORRECT MATCH!
      const newScore = score + 1;
      const newCombo = combo + 1;

      setScore(newScore);
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));

      // Combo announcements & satisfying effects
      let milestoneHit = false;
      let text = '';
      let soundType: 'correct' | 'combo5' | 'combo10' | 'combo20' | 'combo30' | 'combo50' = 'correct';
      let color = 'text-sky-400 font-extrabold';
      let explosionSize = 0;

      if (newCombo === 5) {
        milestoneHit = true;
        text = 'GOOD!';
        soundType = 'combo5';
        color = 'text-green-400 font-bold drop-shadow-[0_0_6px_rgba(74,222,128,0.4)]';
        explosionSize = 15;
      } else if (newCombo === 10) {
        milestoneHit = true;
        text = 'AWESOME!';
        soundType = 'combo10';
        color = 'text-sky-400 font-extrabold drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]';
        explosionSize = 30;
      } else if (newCombo === 20) {
        milestoneHit = true;
        text = 'INSANE!';
        soundType = 'combo20';
        color = 'text-amber-400 font-black drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]';
        explosionSize = 55;
      } else if (newCombo === 30) {
        milestoneHit = true;
        text = 'UNSTOPPABLE!';
        soundType = 'combo30';
        color = 'text-fuchsia-400 font-black drop-shadow-[0_0_15px_rgba(232,121,249,0.7)] animate-pulse';
        explosionSize = 85;
      } else if (newCombo >= 50 && newCombo % 5 === 0) {
        milestoneHit = true;
        text = 'GODLIKE!';
        soundType = 'combo50';
        color = 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 font-black drop-shadow-[0_0_20px_rgba(236,72,153,0.8)] animate-bounce';
        explosionSize = 130;
      }

      if (milestoneHit) {
        playSynthSound(soundType);
        setComboText({ text: `${text} (${newCombo}x)`, color });
        setTimeout(() => setComboText(null), 1500);

        // Screen shake on milestone hit
        setShake(true);
        setTimeout(() => setShake(false), 500);

        // Huge center particles explosion
        setTimeout(() => {
          const stage = document.getElementById('shape-switch-center-stage');
          const container = containerRef.current;
          if (stage && container) {
            const r = stage.getBoundingClientRect();
            const cR = container.getBoundingClientRect();
            const xCenter = r.left - cR.left + r.width / 2;
            const yCenter = r.top - cR.top + r.height / 2;
            spawnBurst(xCenter, yCenter, SHAPES[currentShape].glowColor, explosionSize);
          }
        }, 50);
      } else {
        playSynthSound('correct');
      }

      // Spark explosion scaled by combo length
      const extraParticles = Math.min(newCombo * 2, 40);
      spawnBurst(x, y, SHAPES[type].glowColor, extraParticles);

      // Flash feedback
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 150);

      // Pick next shape immediately without any delay!
      pickNextShape(currentShape, newScore);
      setShapeResetKey(prev => prev + 1);
    } else {
      // WRONG MATCH!
      setCombo(0);

      playSynthSound('wrong');
      setRedFlash(true);
      setShake(true);

      // Trigger tactile haptic vibration if supported
      if ('vibrate' in navigator) {
        try { navigator.vibrate(100); } catch (_) {}
      }

      setTimeout(() => {
        setRedFlash(false);
        setShake(false);
      }, 300);

      // Decrement lives
      setLives((prevLives) => prevLives - 1);
    }
  };

  // Center Shapes Vector renderers
  const renderCenterShape = () => {
    // Determine scale based on active chaos modifier
    let baseScale = 1.0;
    if (activeModifier === 'grow') {
      baseScale = 1.35;
    } else if (activeModifier === 'shrink') {
      baseScale = 0.65;
    } else if (score >= 40) {
      baseScale = 1.15;
    } else if (score >= 10) {
      baseScale = 1.08;
    }

    const scale = [baseScale, baseScale * 1.08, baseScale];
    
    // Determine rotation
    let rotate = 0;
    if (activeModifier === 'rotate') {
      rotate = 360;
    } else if (score >= 40) {
      rotate = 360;
    } else if (score >= 10) {
      rotate = 180;
    }

    const speedMultiplier = activeModifier === 'rotate' ? 1.0 : score >= 40 ? 1.5 : score >= 10 ? 4 : 0;

    const transitionConfig = speedMultiplier > 0 ? {
      rotate: { repeat: Infinity, ease: 'linear', duration: speedMultiplier },
      scale: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
    } : {};

    // Custom CSS style for flip X/Y modifiers
    const transformStyles: React.CSSProperties = {};
    if (activeModifier === 'flipX') {
      transformStyles.transform = 'scaleX(-1)';
    } else if (activeModifier === 'flipY') {
      transformStyles.transform = 'scaleY(-1)';
    }

    let modifierClasses = "";
    if (activeModifier === 'shake') {
      modifierClasses += " animate-rapid-shape-shake";
    }
    if (activeModifier === 'glow') {
      modifierClasses += " animate-heavy-glow-pulse";
    }

    // Set custom glow-color variable for tailwind custom animations
    const currentGlowColor = SHAPES[currentShape]?.glowColor || '#ffffff';
    transformStyles['--glow-color' as any] = currentGlowColor;

    const baseClass = `w-24 h-24 sm:w-32 sm:h-32 select-none pointer-events-none transition-all duration-200 ${modifierClasses}`;

    switch (currentShape) {
      case 'circle':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <circle cx="50" cy="50" r="38" fill="none" stroke={SHAPES.circle.glowColor} strokeWidth="10" />
            <circle cx="50" cy="50" r="22" fill="none" stroke={SHAPES.circle.glowColor} strokeWidth="3" strokeDasharray="4, 4" className="opacity-60" />
          </motion.svg>
        );
      case 'square':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <rect x="14" y="14" width="72" height="72" rx="10" fill="none" stroke={SHAPES.square.glowColor} strokeWidth="10" />
            <rect x="28" y="28" width="44" height="44" rx="4" fill="none" stroke={SHAPES.square.glowColor} strokeWidth="2" strokeDasharray="5, 3" className="opacity-50" />
          </motion.svg>
        );
      case 'triangle':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <polygon points="50,10 90,82 10,82" fill="none" stroke={SHAPES.triangle.glowColor} strokeWidth="10" strokeLinejoin="round" />
            <polygon points="50,28 76,74 24,74" fill="none" stroke={SHAPES.triangle.glowColor} strokeWidth="2.5" strokeDasharray="3, 3" className="opacity-50" />
          </motion.svg>
        );
      case 'hexagon':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <polygon points="50,8 87,29 87,71 50,92 13,71 13,29" fill="none" stroke={SHAPES.hexagon.glowColor} strokeWidth="10" strokeLinejoin="round" />
            <polygon points="50,22 75,36 75,64 50,78 25,64 25,36" fill="none" stroke={SHAPES.hexagon.glowColor} strokeWidth="2" strokeDasharray="4, 4" className="opacity-50" />
          </motion.svg>
        );
      case 'star':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="none" stroke={SHAPES.star.glowColor} strokeWidth="9" strokeLinejoin="round" />
            <polygon points="50,24 58,42 78,42 61,54 68,74 50,61 32,74 39,54 22,42 42,42" fill="none" stroke={SHAPES.star.glowColor} strokeWidth="2" strokeDasharray="3,3" className="opacity-50" />
          </motion.svg>
        );
      case 'heart':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <path d="M50,85 C50,85 10,50 10,30 C10,16 22,8 34,8 C42,8 47,13 50,18 C53,13 58,8 66,8 C78,8 90,16 90,30 C90,50 50,85 50,85 Z" fill="none" stroke={SHAPES.heart.glowColor} strokeWidth="9" strokeLinejoin="round" />
            <path d="M50,70 C50,70 20,43 20,30 C20,22 28,17 34,17 C39,17 43,21 45,24 L50,30 L55,24 C57,21 61,17 66,17 C72,17 80,22 80,30 C80,43 50,70 50,70 Z" fill="none" stroke={SHAPES.heart.glowColor} strokeWidth="2.5" strokeDasharray="3,3" className="opacity-50" />
          </motion.svg>
        );
      case 'diamond':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <polygon points="50,6 92,50 50,94 8,50" fill="none" stroke={SHAPES.diamond.glowColor} strokeWidth="10" strokeLinejoin="round" />
            <polygon points="50,22 76,50 50,78 24,50" fill="none" stroke={SHAPES.diamond.glowColor} strokeWidth="2.5" strokeDasharray="4,4" className="opacity-50" />
          </motion.svg>
        );
      case 'pentagon':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <polygon points="50,8 92,38 76,88 24,88 8,38" fill="none" stroke={SHAPES.pentagon.glowColor} strokeWidth="10" strokeLinejoin="round" />
            <polygon points="50,24 78,44 67,78 33,78 22,44" fill="none" stroke={SHAPES.pentagon.glowColor} strokeWidth="2.5" strokeDasharray="4,4" className="opacity-50" />
          </motion.svg>
        );
      case 'arrow':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <polygon points="50,8 92,50 64,50 64,90 36,90 36,50 8,50" fill="none" stroke={SHAPES.arrow.glowColor} strokeWidth="9" strokeLinejoin="round" />
            <polygon points="50,26 76,52 56,52 56,80 44,80 44,52 24,52" fill="none" stroke={SHAPES.arrow.glowColor} strokeWidth="2" strokeDasharray="3,3" className="opacity-50" />
          </motion.svg>
        );
      case 'moon':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <path d="M40,10 C58,10 75,22 80,40 C62,40 48,58 48,80 C48,85 49,90 50,94 C25,84 10,58 10,38 C10,22 22,10 40,10 Z" fill="none" stroke={SHAPES.moon.glowColor} strokeWidth="9" strokeLinejoin="round" />
            <path d="M45,25 C55,25 65,33 68,45 C52,48 42,62 42,78 C30,70 20,52 20,38 C20,30 30,25 45,25 Z" fill="none" stroke={SHAPES.moon.glowColor} strokeWidth="2" strokeDasharray="3,3" className="opacity-50" />
          </motion.svg>
        );
      case 'lightning':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <polygon points="60,4 15,55 45,55 35,96 85,45 55,45" fill="none" stroke={SHAPES.lightning.glowColor} strokeWidth="9" strokeLinejoin="round" />
            <polygon points="55,16 26,50 48,50 41,80 73,47 51,47" fill="none" stroke={SHAPES.lightning.glowColor} strokeWidth="2" strokeDasharray="3,3" className="opacity-50" />
          </motion.svg>
        );
      case 'cross':
        return (
          <motion.svg 
            viewBox="0 0 100 100" 
            className={baseClass}
            style={transformStyles}
            animate={{ scale, rotate }}
            transition={transitionConfig}
          >
            <polygon points="35,10 65,10 65,35 90,35 90,65 65,65 65,90 35,90 35,65 10,65 10,35 35,35" fill="none" stroke={SHAPES.cross.glowColor} strokeWidth="9" strokeLinejoin="round" />
            <polygon points="41,20 59,20 59,41 80,41 80,59 59,59 59,80 41,80 41,59 20,59 20,41 41,41" fill="none" stroke={SHAPES.cross.glowColor} strokeWidth="2" strokeDasharray="3,3" className="opacity-50" />
          </motion.svg>
        );
    }
  };

  const getButtonShapeIcon = (type: ShapeType) => {
    switch (type) {
      case 'circle':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="12" />
          </svg>
        );
      case 'square':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <rect x="18" y="18" width="64" height="64" rx="8" fill="none" stroke="currentColor" strokeWidth="12" />
          </svg>
        );
      case 'triangle':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <polygon points="50,14 86,78 14,78" fill="none" stroke="currentColor" strokeWidth="12" strokeLinejoin="round" />
          </svg>
        );
      case 'hexagon':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <polygon points="50,12 83,31 83,69 50,88 17,69 17,31" fill="none" stroke="currentColor" strokeWidth="12" strokeLinejoin="round" />
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <polygon points="50,8 63,35 93,35 69,53 78,82 50,64 22,82 31,53 7,35 37,35" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
          </svg>
        );
      case 'heart':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <path d="M50,82 C50,82 16,50 16,32 C16,19 26,12 37,12 C44,12 48,16 50,20 C52,16 56,12 63,12 C74,12 84,19 84,32 C84,50 50,82 50,82 Z" fill="none" stroke="currentColor" strokeWidth="11" strokeLinejoin="round" />
          </svg>
        );
      case 'diamond':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <polygon points="50,12 84,50 50,88 16,50" fill="none" stroke="currentColor" strokeWidth="12" strokeLinejoin="round" />
          </svg>
        );
      case 'pentagon':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <polygon points="50,12 88,39 74,83 26,83 12,39" fill="none" stroke="currentColor" strokeWidth="12" strokeLinejoin="round" />
          </svg>
        );
      case 'arrow':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <polygon points="50,12 86,48 62,48 62,84 38,84 38,48 14,48" fill="none" stroke="currentColor" strokeWidth="11" strokeLinejoin="round" />
          </svg>
        );
      case 'moon':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <path d="M42,14 C58,14 73,25 78,40 C62,40 50,56 50,75 C50,80 51,85 52,88 C29,80 16,57 16,39 C16,25 27,14 42,14 Z" fill="none" stroke="currentColor" strokeWidth="11" strokeLinejoin="round" />
          </svg>
        );
      case 'lightning':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <polygon points="58,6 18,52 45,52 38,90 82,44 55,44" fill="none" stroke="currentColor" strokeWidth="11" strokeLinejoin="round" />
          </svg>
        );
      case 'cross':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none mb-1">
            <polygon points="36,14 64,14 64,36 86,36 86,64 64,64 64,86 36,86 36,64 14,64 14,36 36,36" fill="none" stroke="currentColor" strokeWidth="11" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full sm:min-h-[480px] min-h-0 flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden rounded-2xl border transition-all duration-300 ${
        redFlash 
          ? 'bg-rose-950/30 border-rose-500/50 text-white animate-arcade-tiny-shake' 
          : correctFlash 
          ? 'bg-emerald-950/20 border-emerald-500/30' 
          : 'bg-slate-950/90 border-slate-900 text-white'
      } ${shake ? 'animate-arcade-heavy-shake' : ''} ${
        activeModifier === 'screenShake' ? 'animate-slow-tremor' : ''
      }`}
      id="shape-switch-game-view"
    >
      {/* 60FPS Particles canvas layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none z-30" />

      {/* Background ambient flashing chaos modifier */}
      {activeModifier === 'flashBg' && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none animate-ambient-flash z-10" />
      )}

      {/* Decorative ambient background spots */}
      <div className={`absolute -top-10 -left-10 h-36 w-36 rounded-full ${isGameOver ? 'bg-rose-500/5' : 'bg-sky-500/5'} blur-[60px] pointer-events-none`} />
      <div className={`absolute -bottom-10 -right-10 h-36 w-36 rounded-full ${isGameOver ? 'bg-rose-500/5' : 'bg-fuchsia-500/5'} blur-[60px] pointer-events-none`} />

      {/* 1. STATUS HUD HEADER */}
      <div className="w-full hidden sm:flex flex-col gap-2 font-mono z-20">
        
        {/* Top parameters indicators */}
        <div className="flex items-center justify-between">
          {/* Level indicator */}
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border tracking-wider transition-colors duration-200 ${getDifficultyTier().color}`}>
              {getDifficultyTier().label}
            </span>
            {activeModifier !== 'none' && (
              <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded animate-pulse font-bold tracking-widest">
                ⚠️ {activeModifier.toUpperCase()}
              </span>
            )}
          </div>

          {/* PB score */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Award size={13} className="text-amber-400" />
            <span>🏆 BEST: <span className="text-amber-400 font-extrabold">{personalBest}</span></span>
          </div>

          {/* Heart Lives list */}
          <div className="flex items-center gap-1.5" id="shape-switch-lives-counter">
            <span className="text-[10px] text-slate-500 font-bold tracking-wider mr-1">❤️ LIVES:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((heartIdx) => {
                const active = heartIdx <= lives;
                return (
                  <Heart
                    key={heartIdx}
                    size={14}
                    className={`transition-all duration-300 ${
                      active 
                        ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]' 
                        : 'text-slate-800 scale-90 opacity-30'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Big live score, time left and active combo indicators */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/40 border border-slate-800/80 rounded-xl p-2.5 shadow-inner">
          {/* Seconds Remaining Timer */}
          <div className={`flex flex-col items-center justify-center ${timeLeft <= 8 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">
              ⏳ TIME
            </span>
            <span className="text-lg font-black font-sans leading-none tracking-tight mt-1" id="shape-switch-time-display">
              {timeLeft}<span className="text-[10px] font-bold ml-0.5">s</span>
            </span>
          </div>

          {/* Current Score */}
          <div className="flex flex-col items-center justify-center border-l border-r border-slate-800/60 text-sky-400">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">
              ⭐ SCORE
            </span>
            <span className="text-lg font-black font-sans leading-none tracking-tight mt-1" id="shape-switch-score-display">
              {score}
            </span>
          </div>

          {/* Active Combo Streak */}
          <div className="flex flex-col items-center justify-center text-orange-400">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">
              🔥 COMBO
            </span>
            <span className="text-lg font-black font-sans leading-none tracking-tight mt-1" id="shape-switch-combo-display">
              {combo}<span className="text-[10px] font-bold ml-0.5">x</span>
            </span>
          </div>
        </div>

        {/* Dynamic progress loader bar */}
        <div className="w-full h-1.5 bg-slate-900 border border-slate-800/50 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              timeLeft <= 8 
                ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                : 'bg-gradient-to-r from-sky-500 via-emerald-400 to-indigo-500'
            }`}
            style={{ width: `${(timeLeft / 45) * 100}%` }}
          />
        </div>
      </div>

      {/* 2. CENTER ACTIVE SHAPE DISPLAY & STREAK HUD */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-4 z-20">
        
        {/* Floating Streak text */}
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute -top-3 flex items-center gap-1.5 text-orange-400 font-mono text-xs font-bold bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full shadow-lg animate-bounce"
              id="shape-switch-streak-badge"
            >
              <Flame size={12} className="fill-orange-500 animate-pulse" />
              <span>STREAK: {combo}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glowing Central Shape Box */}
        <div 
          className={`relative w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-slate-900/20 border flex items-center justify-center transition-all duration-300 ${
            combo >= 15
              ? 'border-pink-500/60 shadow-[0_0_30px_rgba(236,72,153,0.3)]'
              : combo >= 10
              ? 'border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
              : combo >= 5
              ? 'border-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
              : 'border-slate-800/40'
          }`}
          id="shape-switch-center-stage"
        >
          {/* Circular Timer Ring */}
          {!isGameOver && isPlayingRef.current && (
            <svg className="absolute inset-0 w-full h-full rotate-[-90deg] pointer-events-none z-10" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="2"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke={SHAPES[currentShape]?.glowColor || '#ffffff'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 46}
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 46 }}
                transition={{ duration: getShapeDuration(score) / 1000, ease: 'linear' }}
                key={`${currentShape}-${shapeResetKey}`}
              />
            </svg>
          )}

          {/* Pulsing visual backdrop glow matching shape color */}
          <div 
            className="absolute rounded-full w-28 h-28 blur-[40px] opacity-20 transition-all duration-300"
            style={{ backgroundColor: SHAPES[currentShape]?.glowColor || '#ffffff' }}
          />

          {/* Chaos Modifier - Ghost/Fake Shadow clone outline */}
          {activeModifier === 'ghostShadow' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-40 scale-[1.1] blur-[2px] translate-x-4 translate-y-3 pointer-events-none z-0">
              {renderCenterShape()}
            </div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentShape}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="z-10"
            >
              {renderCenterShape()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Combo streak notifications */}
        <AnimatePresence>
          {comboText && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: -15 }}
              className="absolute -bottom-3 z-30 bg-slate-900/95 border border-slate-800 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 backdrop-blur-md"
            >
              <Sparkles size={11} className="text-amber-400" />
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${comboText.color}`}>
                {comboText.text}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. FOUR INTERACTIVE ACTION BUTTONS */}
      <div className="w-full z-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {buttonOrder.map((type) => {
            const config = SHAPES[type];
            if (!config) return null;
            return (
              <button
                key={type}
                onClick={(e) => handleTap(type, e)}
                disabled={isGameOver}
                className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl sm:rounded-2xl border bg-slate-950/50 ${config.borderColor} ${config.color} ${config.bgColor} hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer text-xs font-mono font-bold uppercase tracking-wider select-none ${
                  activeModifier === 'pulseButtons' ? 'animate-button-pulse-scale' : ''
                }`}
                style={{
                  touchAction: 'manipulation'
                }}
                id={`shape-button-${type}`}
              >
                {getButtonShapeIcon(type)}
                <span className="mt-1 font-mono tracking-widest text-[9px] sm:text-[10px]">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FOOTER */}
      <div className="mt-2 text-[9px] font-mono text-slate-600 font-bold uppercase tracking-widest text-center pointer-events-none z-20 hidden sm:block">
        SHAPE SWITCH • DESIGNED BY PLAYSPRINT
      </div>
    </div>
  );
};
