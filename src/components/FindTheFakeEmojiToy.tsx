/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Flame, Timer, Sparkles, Award, Zap, Ban, RefreshCw } from 'lucide-react';
import { gamePlatform } from '../lib/gamePlatform';

// =================================================================
// EMOJI DATASET WITH VARIOUS DIFFICULTY TIERS
// =================================================================

interface EmojiPair {
  base: string;
  fake: string;
  desc: string;
}

const EMOJI_LEVELS: Record<'easy' | 'medium' | 'hard', EmojiPair[]> = {
  easy: [
    { base: '🐶', fake: '🐱', desc: 'Dog vs Cat' },
    { base: '🍎', fake: '🍏', desc: 'Red vs Green Apple' },
    { base: '🚗', fake: '🚲', desc: 'Car vs Bicycle' },
    { base: '⚽', fake: '🏀', desc: 'Soccer vs Basketball' },
    { base: '☀️', fake: '🌙', desc: 'Sun vs Moon' },
    { base: '🍕', fake: '🍔', desc: 'Pizza vs Burger' },
    { base: '🐬', fake: '🦈', desc: 'Dolphin vs Shark' },
    { base: '🍦', fake: '🍩', desc: 'Ice Cream vs Donut' },
    { base: '🎈', fake: '🎁', desc: 'Balloon vs Gift' },
    { base: '🌻', fake: '🌹', desc: 'Sunflower vs Rose' },
    { base: '🦁', fake: '🐯', desc: 'Lion vs Tiger' },
    { base: '🥕', fake: '🌽', desc: 'Carrot vs Corn' },
    { base: '✈️', fake: '🚀', desc: 'Airplane vs Rocket' },
    { base: '🧸', fake: '🤖', desc: 'Teddy vs Robot' }
  ],
  medium: [
    { base: '😀', fake: '😃', desc: 'Grinning Face' },
    { base: '🍊', fake: '🍋', desc: 'Orange vs Lemon' },
    { base: '🍇', fake: '🫐', desc: 'Grapes vs Blueberries' },
    { base: '🍉', fake: '🍈', desc: 'Watermelon vs Melon' },
    { base: '🐼', fake: '🐨', desc: 'Panda vs Koala' },
    { base: '🥛', fake: '🥤', desc: 'Milk vs Soda' },
    { base: '🎸', fake: '🎻', desc: 'Guitar vs Violin' },
    { base: '🐵', fake: '🙉', desc: 'Monkey vs Hear-No-Evil Monkey' },
    { base: '🍦', fake: '🍧', desc: 'Soft Serve vs Shaved Ice' },
    { base: '🕯️', fake: '💡', desc: 'Candle vs Bulb' },
    { base: '🥑', fake: '🍐', desc: 'Avocado vs Pear' },
    { base: '🧁', fake: '🍰', desc: 'Cupcake vs Cake slice' }
  ],
  hard: [
    { base: '😀', fake: '😉', desc: 'Smile vs Wink' },
    { base: '😆', fake: '😅', desc: 'Grin vs Sweat Grin' },
    { base: '😠', fake: '😡', desc: 'Angry vs Pouting' },
    { base: '😭', fake: '😢', desc: 'Loud Crying vs Sad Crying' },
    { base: '😳', fake: '🥺', desc: 'Flushed vs Pleading' },
    { base: '🐏', fake: '🐑', desc: 'Ram vs Sheep' },
    { base: '🐊', fake: '🦎', desc: 'Crocodile vs Lizard' },
    { base: '🐝', fake: '🪰', desc: 'Bee vs Fly' },
    { base: '🥎', fake: '🎾', desc: 'Softball vs Tennis Ball' },
    { base: '📙', fake: '📘', desc: 'Orange vs Blue Book' },
    { base: '🖊️', fake: '🖋️', desc: 'Ballpoint vs Fountain Pen' },
    { base: '🥥', fake: '🥔', desc: 'Coconut vs Potato' },
    { base: '🍩', fake: '🥯', desc: 'Donut vs Bagel' },
    { base: '🐪', fake: '🐫', desc: 'One-hump vs Two-hump Camel' },
    { base: '🌳', fake: '🌲', desc: 'Deciduous vs Pine Tree' },
    { base: '👁️', fake: '👄', desc: 'Eye vs Mouth' },
    { base: '🧅', fake: '🧄', desc: 'Onion vs Garlic' },
    { base: '🛹', fake: '🛼', desc: 'Skateboard vs Roller Skates' },
    { base: '🍳', fake: '🥘', desc: 'Egg vs Shallow Pan' },
    { base: '🚲', fake: '🛵', desc: 'Bicycle vs Scooter' }
  ]
};

interface EmojiCell {
  emoji: string;
  isFake: boolean;
  row: number;
  col: number;
  index: number;
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
  emoji?: string;
}

// =================================================================
// HELPER SOUND SYNTHESIZERS
// =================================================================
const playSynthSound = (type: 'correct' | 'wrong' | 'freeze' | 'magnify' | 'combo3' | 'combo5' | 'combo10' | 'gameOver') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(85, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'freeze') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'magnify') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === 'combo3') {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.15);
      });
    } else if (type === 'combo5') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.15);
      });
    } else if (type === 'combo10') {
      const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // Octave scale
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
    } else if (type === 'gameOver') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (e) {
    // Unsupported or blocked
  }
};

export const FindTheFakeEmojiToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [bestScore, setBestScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [gridSize, setGridSize] = useState<number>(3);
  const [cells, setCells] = useState<EmojiCell[]>([]);
  const [fakePosition, setFakePosition] = useState<{ row: number, col: number, index: number } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Power-Ups
  const [magnifierUsed, setMagnifierUsed] = useState<boolean>(false);
  const [magnifierActive, setMagnifierActive] = useState<boolean>(false);
  const [freezeUsed, setFreezeUsed] = useState<boolean>(false);
  const [freezeActive, setFreezeActive] = useState<boolean>(false);
  const [freezeDurationLeft, setFreezeDurationLeft] = useState<number>(0);

  // UI Flashes & Feedback
  const [shake, setShake] = useState<boolean>(false);
  const [redFlash, setRedFlash] = useState<boolean>(false);
  const [correctFlash, setCorrectFlash] = useState<boolean>(false);
  const [comboCelebration, setComboCelebration] = useState<{ text: string; color: string } | null>(null);

  // Refs for 60fps Particle System
  const particlesRef = useRef<Particle[]>([]);
  const lastPairRef = useRef<EmojiPair | null>(null);
  const isPlayingRef = useRef<boolean>(true);

  // Retrieve best score from localStorage
  useEffect(() => {
    const savedBest = localStorage.getItem('find_the_fake_emoji_best');
    if (savedBest) {
      setBestScore(parseInt(savedBest, 10));
    }
    generateLevel(1, 0);
  }, []);

  // HUD Synchronization effect
  useEffect(() => {
    const multVal = combo >= 10 ? 3 : combo >= 5 ? 2 : 1;
    gamePlatform.updateHud({
      score,
      highScore: bestScore,
      lives: null,
      timer: timeLeft,
      combo,
      multiplier: multVal,
      level,
    });
  }, [score, bestScore, timeLeft, combo, level]);

  // 60FPS Particles render loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // Gravity drift
        p.life -= 1;
        p.alpha = Math.max(0, p.life / 60);

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.emoji) {
          ctx.font = `${p.size * 1.5}px sans-serif`;
          ctx.fillText(p.emoji, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Game Countdown Timer
  useEffect(() => {
    if (isGameOver || !isPlayingRef.current) return;

    const interval = setInterval(() => {
      if (freezeActive) {
        setFreezeDurationLeft((prev) => {
          if (prev <= 1) {
            setFreezeActive(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, freezeActive]);

  // Monitor timeLeft to trigger Game Over safely
  useEffect(() => {
    if (timeLeft <= 0 && !isGameOver && isPlayingRef.current) {
      handleGameOver();
    }
  }, [timeLeft, isGameOver]);

  // Handle game end
  const handleGameOver = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    isPlayingRef.current = false;
    playSynthSound('gameOver');

    // Save personal best if applicable
    const savedBest = localStorage.getItem('find_the_fake_emoji_best');
    const numericBest = savedBest ? parseInt(savedBest, 10) : 0;
    const isNewBest = score > numericBest;
    if (isNewBest) {
      localStorage.setItem('find_the_fake_emoji_best', score.toString());
      setBestScore(score);
    }

    // Register with unified GamePlatform engine
    gamePlatform.recordScore('find-the-fake-emoji', score, {
      combo: maxCombo,
      clicksCount: score + 5, // Estimated total interactions
      successClicksCount: score,
      isPerfect: score >= 30
    });
  };

  // Generate the next grid level
  const generateLevel = (nextLevel: number, currentScore: number) => {
    // Grid size determination
    let size = 3;
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

    if (nextLevel === 1) {
      size = 3;
      difficulty = 'easy';
    } else if (nextLevel === 2) {
      size = 4;
      difficulty = 'easy';
    } else if (nextLevel === 3) {
      size = 5;
      difficulty = 'medium';
    } else if (nextLevel === 4) {
      size = 6;
      difficulty = 'medium';
    } else if (nextLevel === 5) {
      size = 7;
      difficulty = 'hard';
    } else {
      size = 8;
      difficulty = 'hard';
    }

    setGridSize(size);

    // Pick random EmojiPair based on difficulty
    const pool = EMOJI_LEVELS[difficulty];
    let filteredPool = pool.filter(pair => pair !== lastPairRef.current);
    if (filteredPool.length === 0) filteredPool = pool;

    const chosenPair = filteredPool[Math.floor(Math.random() * filteredPool.length)];
    lastPairRef.current = chosenPair;

    // Pick random position for fake
    const totalCells = size * size;
    const fakeIdx = Math.floor(Math.random() * totalCells);
    const fRow = Math.floor(fakeIdx / size);
    const fCol = fakeIdx % size;

    setFakePosition({ row: fRow, col: fCol, index: fakeIdx });

    // Generate cells
    const generatedCells: EmojiCell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const isFake = i === fakeIdx;
      generatedCells.push({
        emoji: isFake ? chosenPair.fake : chosenPair.base,
        isFake,
        row: Math.floor(i / size),
        col: i % size,
        index: i
      });
    }

    setCells(generatedCells);
  };

  // Trigger custom particles at a certain location
  const spawnParticles = (x: number, y: number, type: 'correct' | 'wrong' | 'combo3' | 'combo5' | 'combo10') => {
    const particles = particlesRef.current;
    const colors = {
      correct: ['#34d399', '#60a5fa', '#a78bfa', '#fb7185'],
      wrong: ['#f87171', '#ef4444', '#b91c1c'],
      combo3: ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa'],
      combo5: ['#fbbf24', '#f59e0b', '#d97706', '#fffbeb'], // Gold
      combo10: ['#ff007f', '#ffaa00', '#00ffaa', '#00aaff', '#aa00ff'] // Rainbow
    };

    const selectedColors = colors[type];
    const count = type === 'combo10' ? 80 : type === 'combo5' ? 45 : type === 'correct' ? 15 : type === 'wrong' ? 10 : 25;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = type === 'combo10' ? Math.random() * 8 + 3 : Math.random() * 5 + 1.5;
      particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type.includes('combo') ? 2 : 0),
        color: selectedColors[Math.floor(Math.random() * selectedColors.length)],
        size: Math.random() * 4 + 2,
        alpha: 1,
        life: Math.random() * 30 + 30,
        emoji: type === 'combo10' ? ['🌈', '✨', '🔥', '👑'][Math.floor(Math.random() * 4)] : undefined
      });
    }
  };

  // Cell Interaction click handler
  const handleCellClick = (cell: EmojiCell, e: React.MouseEvent) => {
    if (isGameOver || magnifierActive) {
      // Allow click if active but only to verify, but wait, magnifier makes it easy
    }

    const clickX = e.clientX - (containerRef.current?.getBoundingClientRect().left || 0);
    const clickY = e.clientY - (containerRef.current?.getBoundingClientRect().top || 0);

    if (cell.isFake) {
      // Correct Match!
      const newScore = score + 1;
      const newLevel = level + 1;
      const newCombo = combo + 1;

      setScore(newScore);
      setLevel(newLevel);
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));

      // Visual flash
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 200);

      // Play sound based on combo streaks
      if (newCombo === 3) {
        playSynthSound('combo3');
        spawnParticles(clickX, clickY, 'combo3');
        setComboCelebration({ text: 'Combo x3! 🔥', color: 'text-sky-400' });
        setTimeout(() => setComboCelebration(null), 1200);
      } else if (newCombo === 5) {
        playSynthSound('combo5');
        spawnParticles(clickX, clickY, 'combo5');
        setComboCelebration({ text: 'Super Combo! 🌟', color: 'text-amber-400 font-extrabold animate-bounce' });
        setTimeout(() => setComboCelebration(null), 1500);
      } else if (newCombo === 10) {
        playSynthSound('combo10');
        spawnParticles(clickX, clickY, 'combo10');
        setComboCelebration({ text: 'LEGENDARY COMBO! 👑🌈', color: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-black animate-pulse' });
        setTimeout(() => setComboCelebration(null), 2000);
      } else {
        playSynthSound('correct');
        spawnParticles(clickX, clickY, 'correct');
      }

      // Progression: Go to next level
      generateLevel(newLevel, newScore);
    } else {
      // Incorrect Match!
      setCombo(0);
      setShake(true);
      setRedFlash(true);
      playSynthSound('wrong');
      spawnParticles(clickX, clickY, 'wrong');

      // Vibrate if supported
      if ('vibrate' in navigator) {
        try { navigator.vibrate(80); } catch (_) {}
      }

      // Deduct 2 seconds penalty
      setTimeLeft(prev => Math.max(0, prev - 2));

      setTimeout(() => {
        setShake(false);
        setRedFlash(false);
      }, 350);
    }
  };

  // POWER UP: Magnifier (Highlights small area containing target for 1s)
  const useMagnifier = () => {
    if (magnifierUsed || isGameOver || !fakePosition) return;
    setMagnifierUsed(true);
    setMagnifierActive(true);
    playSynthSound('magnify');

    setTimeout(() => {
      setMagnifierActive(false);
    }, 1200);
  };

  // POWER UP: Time Freeze (Pauses countdown for 3 seconds)
  const useTimeFreeze = () => {
    if (freezeUsed || isGameOver) return;
    setFreezeUsed(true);
    setFreezeActive(true);
    setFreezeDurationLeft(3);
    playSynthSound('freeze');
  };

  // Determine if a cell should be dimmed under magnifier activation
  const isCellDimmed = (cell: EmojiCell) => {
    if (!magnifierActive || !fakePosition) return false;
    // Magnifier covers 3x3 square centered at fake emoji
    const rowDiff = Math.abs(cell.row - fakePosition.row);
    const colDiff = Math.abs(cell.col - fakePosition.col);
    return rowDiff > 1 || colDiff > 1;
  };

  // Dynamic inline font scaling for responsive layout
  const getCellFontSize = () => {
    const sizeMap: Record<number, string> = {
      3: 'text-5xl sm:text-6xl',
      4: 'text-4xl sm:text-5xl',
      5: 'text-3xl sm:text-4xl',
      6: 'text-2xl sm:text-3xl',
      7: 'text-xl sm:text-2xl',
      8: 'text-lg sm:text-xl'
    };
    return sizeMap[gridSize] || 'text-base';
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-2xl mx-auto flex flex-col justify-between p-4 sm:p-5 select-none transition-all duration-300 ${
        redFlash ? 'bg-red-950/25 border-red-500/30' : correctFlash ? 'bg-emerald-950/20' : 'bg-slate-950/20'
      } border border-slate-900 rounded-2xl shadow-xl overflow-hidden`}
      id="fake-emoji-microgame-container"
    >
      {/* 60FPS Overlay Canvas for Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-30" 
      />

      {/* Decorative glows */}
      <div className={`absolute top-0 right-0 h-40 w-40 rounded-full ${freezeActive ? 'bg-cyan-500/10' : 'bg-indigo-500/5'} blur-[60px] pointer-events-none transition-all`} />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-[60px] pointer-events-none" />

      {/* HUD HEADER PANEL */}
      <div className="w-full flex flex-col gap-3 font-mono z-10">
        
        {/* Top bar metrics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-extrabold uppercase tracking-wider">
              Lvl {level}
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Brain Training
            </span>
          </div>

          {/* Real-time score indicator */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-200">
            <div className="flex items-center gap-1">
              <Award size={13} className="text-emerald-400" />
              <span>BEST: <span className="text-emerald-400 font-extrabold">{bestScore}</span></span>
            </div>
            {combo > 1 && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex items-center gap-1.5 text-orange-500"
              >
                <Flame size={13} className="fill-orange-500" />
                <span className="font-extrabold">STREAK: {combo}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Digital Time and Score Section */}
        <div className="grid grid-cols-2 gap-3 bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 shadow-inner">
          {/* Active Timer Display */}
          <div className={`flex flex-col items-center justify-center relative ${freezeActive ? 'text-cyan-400' : timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">
              <Timer size={10} /> {freezeActive ? 'TIME FROZEN' : 'TIME REMAINING'}
            </span>
            <span className="text-2xl font-black font-sans leading-none tracking-tight mt-1">
              {timeLeft}
              <span className="text-xs font-semibold ml-0.5">s</span>
            </span>

            {/* Ice Freeze glow effect */}
            {freezeActive && (
              <span className="absolute -top-1 right-2 text-[9px] text-cyan-300 animate-bounce bg-cyan-500/20 border border-cyan-500/30 px-1 py-0.2 rounded font-sans uppercase font-bold">
                ❄️ FREEZE {freezeDurationLeft}s
              </span>
            )}
          </div>

          {/* Current Score Display */}
          <div className="flex flex-col items-center justify-center border-l border-slate-800/60 text-cyan-400">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">CURRENT SCORE</span>
            <span className="text-2xl font-black font-sans leading-none tracking-tight mt-1">
              {score}
              <span className="text-xs text-cyan-500/80 ml-0.5 font-bold">pts</span>
            </span>
          </div>
        </div>

        {/* Timer/Freeze Visual Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 border border-slate-800/50 rounded-full overflow-hidden relative">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              freezeActive 
                ? 'bg-gradient-to-r from-cyan-400 to-sky-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]' 
                : timeLeft <= 10 
                  ? 'bg-gradient-to-r from-red-600 to-red-400' 
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
            }`}
            style={{ width: `${(timeLeft / 45) * 100}%` }}
          />
        </div>
      </div>

      {/* CORE EMOJI PLAYING GRID CONTAINER */}
      <div 
        className={`w-full flex-1 flex items-center justify-center py-4 my-2 z-10 ${
          shake ? 'animate-[shake_0.3s_ease-in-out_infinite]' : ''
        }`}
      >
        <div 
          className={`grid gap-2 p-3.5 bg-slate-900/30 border border-slate-800/60 rounded-2xl w-full max-w-[380px] aspect-square items-center justify-center relative ${
            freezeActive ? 'shadow-[0_0_15px_rgba(6,182,212,0.15)] border-cyan-500/20' : ''
          }`}
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
          }}
        >
          {cells.map((cell) => {
            const dimmed = isCellDimmed(cell);
            return (
              <button
                key={cell.index}
                onClick={(e) => handleCellClick(cell, e)}
                disabled={isGameOver}
                className={`w-full h-full aspect-square flex items-center justify-center rounded-xl bg-slate-950/40 border border-slate-800/40 hover:border-indigo-500/20 active:scale-90 hover:bg-indigo-500/5 select-none transition-all duration-200 cursor-pointer ${getCellFontSize()} ${
                  dimmed ? 'opacity-10 scale-90 blur-[1.5px] pointer-events-none' : 'opacity-100 scale-100'
                }`}
                style={{
                  touchAction: 'manipulation'
                }}
              >
                <span className="transform hover:scale-110 active:scale-95 transition-transform inline-block">
                  {cell.emoji}
                </span>
              </button>
            );
          })}

          {/* Ambient Combo Notifications / Celebrations */}
          <AnimatePresence>
            {comboCelebration && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -10 }}
                className="absolute inset-x-0 mx-auto w-fit bg-slate-950/95 border border-indigo-500/30 text-xs px-4 py-1.5 rounded-full shadow-2xl z-20 flex items-center gap-1.5 backdrop-blur-md"
              >
                <Sparkles size={11} className="text-amber-400" />
                <span className={`font-bold ${comboCelebration.color}`}>
                  {comboCelebration.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* POWER UPS PANEL (Max 1 utilization per session) */}
      <div className="w-full bg-slate-900/30 border border-slate-800/60 rounded-xl p-3 grid grid-cols-2 gap-3 font-mono z-10">
        
        {/* Power Up: Magnifier */}
        <button
          onClick={useMagnifier}
          disabled={magnifierUsed || isGameOver}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            magnifierUsed 
              ? 'bg-slate-950/40 border-slate-900/50 text-slate-600 cursor-not-allowed' 
              : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 active:scale-95'
          }`}
          id="powerup-magnifier-btn"
        >
          {magnifierUsed ? (
            <>
              <Ban size={12} className="text-slate-600" />
              Magnifier Spent
            </>
          ) : (
            <>
              <Search size={12} className="text-indigo-400 animate-pulse" />
              1x Magnifier
            </>
          )}
        </button>

        {/* Power Up: Time Freeze */}
        <button
          onClick={useTimeFreeze}
          disabled={freezeUsed || isGameOver}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            freezeUsed 
              ? 'bg-slate-950/40 border-slate-900/50 text-slate-600 cursor-not-allowed' 
              : 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-600/20 active:scale-95'
          }`}
          id="powerup-timefreeze-btn"
        >
          {freezeUsed ? (
            <>
              <Ban size={12} className="text-slate-600" />
              Freeze Spent
            </>
          ) : (
            <>
              <Zap size={12} className="text-cyan-400 animate-pulse" />
              3s Time Freeze
            </>
          )}
        </button>
      </div>

    </div>
  );
};
