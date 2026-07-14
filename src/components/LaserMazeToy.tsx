/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Clock, 
  Star, 
  Heart, 
  Zap, 
  RotateCcw, 
  Home, 
  Shuffle, 
  Share2, 
  AlertTriangle,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';
import { gamePlatform } from '../lib/gamePlatform';

// =================================================================
// 1. GAME CONSTANTS & SOUNDS
// =================================================================
const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 480;

// High-fidelity synth audio generator using Web Audio API
class LaserAudio {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
  }

  isMuted() {
    return this.muted;
  }

  playWarning() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn(e);
    }
  }

  playLaserFire() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {
      console.warn(e);
    }
  }

  playPowerUp(type: string) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const baseFreq = type === 'extra-life' ? 523.25 : 659.25; // C5 vs E5
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, this.ctx.currentTime + 0.25);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc2.start();
      osc.stop(this.ctx.currentTime + 0.3);
      osc2.stop(this.ctx.currentTime + 0.3);
    } catch (e) {
      console.warn(e);
    }
  }

  playNearMiss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn(e);
    }
  }

  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const noise = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(10, this.ctx.currentTime + 0.4);

      noise.type = 'sawtooth';
      noise.frequency.setValueAtTime(90, this.ctx.currentTime);
      noise.frequency.linearRampToValueAtTime(5, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      noise.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      noise.start();
      osc.stop(this.ctx.currentTime + 0.4);
      noise.stop(this.ctx.currentTime + 0.4);
    } catch (e) {
      console.warn(e);
    }
  }

  playGameOver() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch (e) {
      console.warn(e);
    }
  }
}

const audio = new LaserAudio();

// =================================================================
// 2. DATA TYPE INTERFACES
// =================================================================
type LaserType = 
  | 'single' 
  | 'double' 
  | 'rotating' 
  | 'sweeping' 
  | 'pulsing' 
  | 'crossing' 
  | 'grid';

interface LaserHazard {
  id: string;
  type: LaserType;
  state: 'warning' | 'active' | 'decaying';
  timer: number;         // Milliseconds left in state
  maxWarningTimer: number; // Duration of warning state
  activeDuration: number;  // How long it fires
  decayDuration: number;   // Fading out phase
  
  // Custom geometry specs
  angle?: number;
  rotSpeed?: number;
  pivotX?: number;
  pivotY?: number;
  
  // Coordinate endpoints or indices
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  
  // Sweep states
  sweepProgress?: number;
  sweepSpeed?: number;
  sweepDirection?: 'H' | 'V'; // horizontal or vertical sweep
  
  // Pulse states
  pulseTimer?: number;

  width: number;
  color: string;
  nearMissChecked: boolean;
}

interface PowerUpItem {
  x: number;
  y: number;
  type: 'shield' | 'slowmo' | 'double' | 'extra-life' | 'dash';
  radius: number;
  pulseAngle: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  isSpark?: boolean;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  vy: number;
  alpha: number;
  size: number;
}

export const LaserMazeToy: React.FC<{ onClose?: () => void; onSelectExperience?: (exp: any | null) => void }> = ({
  onClose,
  onSelectExperience
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Responsive dimensions
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 480 });

  // Game settings & core states
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // HUD UI stats (mirrors game loop reference to update React UI cleanly)
  const [hudLives, setHudLives] = useState(3);
  const [hudScore, setHudScore] = useState(0);
  const [hudMultiplier, setHudMultiplier] = useState(1);
  const [hudSurvivalTime, setHudSurvivalTime] = useState(0);
  const [hudActiveShield, setHudActiveShield] = useState(0);
  const [hudActiveSlowMo, setHudActiveSlowMo] = useState(0);
  const [hudActiveDouble, setHudActiveDouble] = useState(0);
  const [hudActiveDash, setHudActiveDash] = useState(0);
  const [hudWarningActive, setHudWarningActive] = useState(false);

  // Engine references to avoid closure stales inside requestAnimationFrame
  const stateRef = useRef({
    isPlaying: false,
    survivalSeconds: 0,
    score: 0,
    multiplier: 1,
    nearMisses: 0,
    powerupsCollected: 0,
    highestMultiplier: 1,
    timeScale: 1.0, // For slow-motion dilation

    player: {
      x: LOGICAL_WIDTH / 2,
      y: LOGICAL_HEIGHT / 2,
      targetX: LOGICAL_WIDTH / 2,
      targetY: LOGICAL_HEIGHT / 2,
      radius: 13,
      trail: [] as { x: number; y: number }[],
      lives: 3,
      invulnerableTimer: 0, // iFrame safe flash invulnerability
      pulsePulse: 0
    },

    // Power-up durations in ms
    powerUps: {
      shield: 0,
      slowmo: 0,
      double: 0,
      dash: 0
    },

    lasers: [] as LaserHazard[],
    powerups: [] as PowerUpItem[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],

    // Juice values
    screenShake: 0,
    flashOverlayAlpha: 0,
    flashColor: '#ffffff',
    gridOffset: 0,
    lastTime: 0,
    lastSpawnTime: 0,
    spawnInterval: 1800, // Ms between spawns
    lastPowerupSpawn: 0
  });

  // Handle ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const widthCalc = width > 0 ? Math.floor(width) : 800;
        // Keep logical aspect ratio
        const heightCalc = Math.floor((widthCalc * 480) / 800);
        setCanvasDimensions({
          width: widthCalc,
          height: heightCalc
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Set Mute initially
  useEffect(() => {
    audio.setMuted(isMuted);
  }, [isMuted]);

  const [bestScore, setBestScore] = useState(0);
  useEffect(() => {
    const history = gamePlatform.getHistory();
    if (history['laser-maze']) {
      setBestScore(history['laser-maze'].bestScore);
    }
  }, []);

  // HUD Synchronization effect
  useEffect(() => {
    const levelVal = hudScore < 15 ? 1 : hudScore < 40 ? 2 : hudScore < 80 ? 3 : 4;
    gamePlatform.updateHud({
      score: hudScore,
      highScore: bestScore,
      lives: hudLives,
      timer: hudSurvivalTime,
      combo: null,
      multiplier: hudMultiplier,
      level: levelVal,
    });
  }, [hudScore, bestScore, hudLives, hudSurvivalTime, hudMultiplier]);

  // Handle play/pause, immediate starts
  useEffect(() => {
    startNewGame();
    return () => {
      stateRef.current.isPlaying = false;
    };
  }, []);

  // Launch Score and Duration updates
  const startNewGame = () => {
    const state = stateRef.current;
    state.isPlaying = true;
    state.survivalSeconds = 0;
    state.score = 0;
    state.multiplier = 1;
    state.nearMisses = 0;
    state.powerupsCollected = 0;
    state.highestMultiplier = 1;
    state.timeScale = 1.0;
    state.screenShake = 0;
    state.flashOverlayAlpha = 0;

    state.player = {
      x: LOGICAL_WIDTH / 2,
      y: LOGICAL_HEIGHT / 2,
      targetX: LOGICAL_WIDTH / 2,
      targetY: LOGICAL_HEIGHT / 2,
      radius: 13,
      trail: [],
      lives: 3,
      invulnerableTimer: 800, // brief startup buffer
      pulsePulse: 0
    };

    state.powerUps = {
      shield: 0,
      slowmo: 0,
      double: 0,
      dash: 0
    };

    state.lasers = [];
    state.powerups = [];
    state.particles = [];
    state.floatingTexts = [];
    state.spawnInterval = 1800;
    state.lastSpawnTime = Date.now();
    state.lastPowerupSpawn = Date.now() + 4000; // Delay first spawn
    state.lastTime = performance.now();

    setHudLives(3);
    setHudScore(0);
    setHudMultiplier(1);
    setHudSurvivalTime(0);
    setHudActiveShield(0);
    setHudActiveSlowMo(0);
    setHudActiveDouble(0);
    setHudActiveDash(0);
    setHudWarningActive(false);

    setIsPlaying(true);
    // Request animation frame
    requestAnimationFrame(gameStep);
  };

  // Score generator ticker (Survival points)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const state = stateRef.current;
      if (!state.isPlaying) return;

      // Surviving ticks score
      state.survivalSeconds += 1;
      
      // Points accumulation: +1 point per second * current multiplier
      const addedPoints = 1 * state.multiplier;
      state.score += addedPoints;

      // Update React UI HUD
      setHudScore(state.score);
      setHudSurvivalTime(state.survivalSeconds);

      // Progressive Difficulty Curve Scaling (every 15 seconds)
      const seconds = state.survivalSeconds;
      if (seconds > 0 && seconds % 15 === 0) {
        spawnFloatingText('DIFFICULTY ENHANCED!', LOGICAL_WIDTH / 2, 80, '#f43f5e', 1.5, -1.2);
        
        // Dynamic scaling
        if (seconds < 30) {
          // Level 2
          state.spawnInterval = 1400;
        } else if (seconds < 45) {
          // Level 3
          state.spawnInterval = 1100;
        } else if (seconds < 60) {
          // Level 4
          state.spawnInterval = 850;
        } else {
          // Chaos Mode (Level 5+)
          state.spawnInterval = 650;
          spawnFloatingText('🔥 CHAOS MODE STARTED 🔥', LOGICAL_WIDTH / 2, 130, '#ea580c', 1.8, -1.5);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Laser Generation Mechanics
  const triggerNewLaser = () => {
    const state = stateRef.current;
    const seconds = state.survivalSeconds;
    
    // Determine available laser type list based on survival time
    let availableTypes: LaserType[] = ['single', 'double'];
    if (seconds >= 15) availableTypes.push('sweeping', 'pulsing');
    if (seconds >= 30) availableTypes.push('rotating', 'crossing');
    if (seconds >= 45) availableTypes.push('grid');

    // Chaos Mode allows double spawns
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    // Calculate dynamic warning timers (decrease as game scales)
    let warningDuration = 800; // default 800ms
    if (seconds >= 15) warningDuration = 700;
    if (seconds >= 30) warningDuration = 600;
    if (seconds >= 45) warningDuration = 500;
    if (seconds >= 60) warningDuration = 450; // Chaos limit!

    const defaultFiredDuration = 1000;
    const defaultDecayDuration = 300;

    const laserId = 'laser-' + Math.random().toString(36).substring(2, 9);
    
    // Play laser prep audio
    audio.playWarning();

    // Spawn customized lasers based on type chosen
    switch (type) {
      case 'single': {
        const isHorizontal = Math.random() < 0.5;
        const coord = isHorizontal 
          ? 50 + Math.random() * (LOGICAL_HEIGHT - 100)
          : 50 + Math.random() * (LOGICAL_WIDTH - 100);

        state.lasers.push({
          id: laserId,
          type: 'single',
          state: 'warning',
          timer: warningDuration,
          maxWarningTimer: warningDuration,
          activeDuration: defaultFiredDuration,
          decayDuration: defaultDecayDuration,
          x1: isHorizontal ? 0 : coord,
          y1: isHorizontal ? coord : 0,
          x2: isHorizontal ? LOGICAL_WIDTH : coord,
          y2: isHorizontal ? coord : LOGICAL_HEIGHT,
          width: 8,
          color: '#ec4899', // Fuchsia neon
          nearMissChecked: false
        });
        break;
      }

      case 'double': {
        const isHorizontal = Math.random() < 0.5;
        const gap = 90 + Math.random() * 40;
        const baseCoord = 80 + Math.random() * (isHorizontal ? (LOGICAL_HEIGHT - 220) : (LOGICAL_WIDTH - 250));

        // Create two matching parallel laser segments
        state.lasers.push({
          id: laserId + '-1',
          type: 'double',
          state: 'warning',
          timer: warningDuration,
          maxWarningTimer: warningDuration,
          activeDuration: defaultFiredDuration,
          decayDuration: defaultDecayDuration,
          x1: isHorizontal ? 0 : baseCoord,
          y1: isHorizontal ? baseCoord : 0,
          x2: isHorizontal ? LOGICAL_WIDTH : baseCoord,
          y2: isHorizontal ? baseCoord : LOGICAL_HEIGHT,
          width: 8,
          color: '#3b82f6', // Cyan blue
          nearMissChecked: false
        });

        state.lasers.push({
          id: laserId + '-2',
          type: 'double',
          state: 'warning',
          timer: warningDuration,
          maxWarningTimer: warningDuration,
          activeDuration: defaultFiredDuration,
          decayDuration: defaultDecayDuration,
          x1: isHorizontal ? 0 : baseCoord + gap,
          y1: isHorizontal ? baseCoord + gap : 0,
          x2: isHorizontal ? LOGICAL_WIDTH : baseCoord + gap,
          y2: isHorizontal ? baseCoord + gap : LOGICAL_HEIGHT,
          width: 8,
          color: '#3b82f6',
          nearMissChecked: false
        });
        break;
      }

      case 'rotating': {
        // Pivot point near middle region
        const pivotX = LOGICAL_WIDTH * 0.3 + Math.random() * (LOGICAL_WIDTH * 0.4);
        const pivotY = LOGICAL_HEIGHT * 0.3 + Math.random() * (LOGICAL_HEIGHT * 0.4);
        const initialAngle = Math.random() * Math.PI * 2;
        const rotSpeed = (0.01 + Math.random() * 0.015) * (Math.random() < 0.5 ? 1 : -1);

        state.lasers.push({
          id: laserId,
          type: 'rotating',
          state: 'warning',
          timer: warningDuration,
          maxWarningTimer: warningDuration,
          activeDuration: 1800, // Rotating laser stays longer to slice around!
          decayDuration: defaultDecayDuration,
          pivotX,
          pivotY,
          angle: initialAngle,
          rotSpeed,
          width: 6,
          color: '#f59e0b', // Glowing Gold
          nearMissChecked: false
        });
        break;
      }

      case 'sweeping': {
        const isHorizontal = Math.random() < 0.5;
        const sweepSpeed = isHorizontal ? (LOGICAL_HEIGHT / 80) : (LOGICAL_WIDTH / 80);

        state.lasers.push({
          id: laserId,
          type: 'sweeping',
          state: 'warning',
          timer: warningDuration,
          maxWarningTimer: warningDuration,
          activeDuration: 1500,
          decayDuration: defaultDecayDuration,
          sweepDirection: isHorizontal ? 'H' : 'V',
          x1: isHorizontal ? 0 : 50,
          y1: isHorizontal ? 50 : 0,
          x2: isHorizontal ? LOGICAL_WIDTH : 50,
          y2: isHorizontal ? 50 : LOGICAL_HEIGHT,
          sweepProgress: 0,
          sweepSpeed,
          width: 8,
          color: '#10b981', // Neon Emerald
          nearMissChecked: false
        });
        break;
      }

      case 'pulsing': {
        const isHorizontal = Math.random() < 0.5;
        const coord = 80 + Math.random() * (isHorizontal ? (LOGICAL_HEIGHT - 160) : (LOGICAL_WIDTH - 160));

        state.lasers.push({
          id: laserId,
          type: 'pulsing',
          state: 'warning',
          timer: warningDuration,
          maxWarningTimer: warningDuration,
          activeDuration: 2000, // longer pulsing phase
          decayDuration: defaultDecayDuration,
          x1: isHorizontal ? 0 : coord,
          y1: isHorizontal ? coord : 0,
          x2: isHorizontal ? LOGICAL_WIDTH : coord,
          y2: isHorizontal ? coord : LOGICAL_HEIGHT,
          pulseTimer: 0,
          width: 10,
          color: '#8b5cf6', // Violet pulse
          nearMissChecked: false
        });
        break;
      }

      case 'crossing': {
        const isDiagonal = Math.random() < 0.5;
        const pivotX = LOGICAL_WIDTH / 2;
        const pivotY = LOGICAL_HEIGHT / 2;

        if (isDiagonal) {
          // X Diagonal Cross
          state.lasers.push({
            id: laserId + '-diag1',
            type: 'crossing',
            state: 'warning',
            timer: warningDuration,
            maxWarningTimer: warningDuration,
            activeDuration: 1200,
            decayDuration: defaultDecayDuration,
            x1: 0, y1: 0, x2: LOGICAL_WIDTH, y2: LOGICAL_HEIGHT,
            width: 8,
            color: '#ef4444', // Hot Red cross
            nearMissChecked: false
          });
          state.lasers.push({
            id: laserId + '-diag2',
            type: 'crossing',
            state: 'warning',
            timer: warningDuration,
            maxWarningTimer: warningDuration,
            activeDuration: 1200,
            decayDuration: defaultDecayDuration,
            x1: LOGICAL_WIDTH, y1: 0, x2: 0, y2: LOGICAL_HEIGHT,
            width: 8,
            color: '#ef4444',
            nearMissChecked: false
          });
        } else {
          // Center Orthogonal Cross
          state.lasers.push({
            id: laserId + '-cross1',
            type: 'crossing',
            state: 'warning',
            timer: warningDuration,
            maxWarningTimer: warningDuration,
            activeDuration: 1200,
            decayDuration: defaultDecayDuration,
            x1: 0, y1: pivotY, x2: LOGICAL_WIDTH, y2: pivotY,
            width: 8,
            color: '#ef4444',
            nearMissChecked: false
          });
          state.lasers.push({
            id: laserId + '-cross2',
            type: 'crossing',
            state: 'warning',
            timer: warningDuration,
            maxWarningTimer: warningDuration,
            activeDuration: 1200,
            decayDuration: defaultDecayDuration,
            x1: pivotX, y1: 0, x2: pivotX, y2: LOGICAL_HEIGHT,
            width: 8,
            color: '#ef4444',
            nearMissChecked: false
          });
        }
        break;
      }

      case 'grid': {
        // Draw 3 horizontal and 3 vertical lasers, creating a beautiful dodge mesh!
        const hCoords = [LOGICAL_HEIGHT * 0.25, LOGICAL_HEIGHT * 0.5, LOGICAL_HEIGHT * 0.75];
        const vCoords = [LOGICAL_WIDTH * 0.25, LOGICAL_WIDTH * 0.5, LOGICAL_WIDTH * 0.75];

        hCoords.forEach((y, idx) => {
          state.lasers.push({
            id: `${laserId}-gh-${idx}`,
            type: 'grid',
            state: 'warning',
            timer: warningDuration,
            maxWarningTimer: warningDuration,
            activeDuration: 1000,
            decayDuration: defaultDecayDuration,
            x1: 0, y1: y, x2: LOGICAL_WIDTH, y2: y,
            width: 6,
            color: '#14b8a6', // Teal grid mesh
            nearMissChecked: false
          });
        });

        vCoords.forEach((x, idx) => {
          state.lasers.push({
            id: `${laserId}-gv-${idx}`,
            type: 'grid',
            state: 'warning',
            timer: warningDuration,
            maxWarningTimer: warningDuration,
            activeDuration: 1000,
            decayDuration: defaultDecayDuration,
            x1: x, y1: 0, x2: x, y2: LOGICAL_HEIGHT,
            width: 6,
            color: '#14b8a6',
            nearMissChecked: false
          });
        });
        break;
      }
    }
  };

  // Powerup Spawner Mechanics
  const triggerNewPowerUp = () => {
    const state = stateRef.current;
    
    // Select dynamic powerups: Shield, Slowmo, DoubleScore, ExtraLife, Dash
    const types: ('shield' | 'slowmo' | 'double' | 'extra-life' | 'dash')[] = [
      'shield', 'slowmo', 'double', 'extra-life', 'dash'
    ];
    // Slightly favor shield and dash
    const type = types[Math.floor(Math.random() * types.length)];

    const x = 100 + Math.random() * (LOGICAL_WIDTH - 200);
    const y = 80 + Math.random() * (LOGICAL_HEIGHT - 160);

    state.powerups.push({
      x,
      y,
      type,
      radius: 12,
      pulseAngle: Math.random() * Math.PI * 2
    });
  };

  // Add highly interactive juice: Sparks/Particles Spawner
  const spawnExplosionParticles = (x: number, y: number, color: string, count = 20) => {
    const state = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 5.5;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 3.5,
        color,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  };

  const spawnNearMissSparks = (x: number, y: number, color = '#22d3ee', count = 10) => {
    const state = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.0 + Math.random() * 6.0;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.2 + Math.random() * 2.2,
        color,
        alpha: 1.0,
        decay: 0.04 + Math.random() * 0.04,
        isSpark: true
      });
    }
  };

  // Add floating overlay text indicator for score/multiplier ticks
  const spawnFloatingText = (text: string, x: number, y: number, color: string, size = 14, vy = -1.5) => {
    const state = stateRef.current;
    state.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      vy,
      alpha: 1.0,
      size
    });
  };

  // Pointer dragging smoothly matches energy orb coordinates
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stateRef.current.isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Calculate scaled logical coordinates based on responsive layout
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;

    const targetX = Math.max(10, Math.min(LOGICAL_WIDTH - 10, clientX * scaleX));
    const targetY = Math.max(10, Math.min(LOGICAL_HEIGHT - 10, clientY * scaleY));

    stateRef.current.player.targetX = targetX;
    stateRef.current.player.targetY = targetY;
  };

  // Touch Move prevention (ensures iframe scrolling won't break finger dragging)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Math Helper: Closest point on line segment to circle center
  const getClosestPointOnSegment = (
    px: number, py: number, // circle center
    x1: number, y1: number, // segment start
    x2: number, y2: number  // segment end
  ) => {
    const ab_x = x2 - x1;
    const ab_y = y2 - y1;
    const ap_x = px - x1;
    const ap_y = py - y1;

    // Projection factor
    const ab2 = ab_x * ab_x + ab_y * ab_y;
    if (ab2 === 0) return { x: x1, y: y1, t: 0 };

    let t = (ap_x * ab_x + ap_y * ab_y) / ab2;
    t = Math.max(0, Math.min(1, t)); // constrain to segment bounds

    return {
      x: x1 + t * ab_x,
      y: y1 + t * ab_y,
      t
    };
  };

  // Core Game Loop Execution (60 FPS high-fidelity calculation)
  const gameStep = (timestamp: number) => {
    const state = stateRef.current;
    if (!state.isPlaying) return;

    const dt = timestamp - state.lastTime;
    state.lastTime = timestamp;

    // Safety guard for hyper-lag or paused background browser states
    const delta = Math.min(100, dt);

    // Apply Time Dilation Factor from Slow Motion Power-Up
    state.timeScale = state.powerUps.slowmo > 0 ? 0.45 : 1.0;
    const dilatedDelta = delta * state.timeScale;

    // Decay power-up timers
    if (state.powerUps.shield > 0) {
      state.powerUps.shield = Math.max(0, state.powerUps.shield - delta);
      setHudActiveShield(Math.ceil(state.powerUps.shield / 1000));
    }
    if (state.powerUps.slowmo > 0) {
      state.powerUps.slowmo = Math.max(0, state.powerUps.slowmo - delta);
      setHudActiveSlowMo(Math.ceil(state.powerUps.slowmo / 1000));
    }
    if (state.powerUps.double > 0) {
      state.powerUps.double = Math.max(0, state.powerUps.double - delta);
      setHudActiveDouble(Math.ceil(state.powerUps.double / 1000));
      state.multiplier = 2;
    } else {
      state.multiplier = 1;
    }
    if (state.powerUps.dash > 0) {
      state.powerUps.dash = Math.max(0, state.powerUps.dash - delta);
      setHudActiveDash(Math.ceil(state.powerUps.dash / 1000));
    }

    setHudMultiplier(state.multiplier);
    if (state.multiplier > state.highestMultiplier) {
      state.highestMultiplier = state.multiplier;
    }

    // 1. UPDATE PLAYER ORB COORDINATES (High fidelity lerping trail)
    const player = state.player;
    // Speed tracking: if dash is active, tracking is instant and ultra-responsive
    const lerpFactor = state.powerUps.dash > 0 ? 0.95 : 0.16;
    player.x += (player.targetX - player.x) * lerpFactor;
    player.y += (player.targetY - player.y) * lerpFactor;

    // Accumulate player trails
    player.trail.push({ x: player.x, y: player.y });
    if (player.trail.length > 15) {
      player.trail.shift();
    }

    if (player.invulnerableTimer > 0) {
      player.invulnerableTimer -= delta;
    }

    player.pulsePulse += 0.05 * state.timeScale;

    // 2. SPAWN TICKERS
    const now = Date.now();
    if (now - state.lastSpawnTime >= state.spawnInterval) {
      state.lastSpawnTime = now;
      triggerNewLaser();
    }

    // Spawn Powerups randomly
    if (now - state.lastPowerupSpawn >= 11000) {
      state.lastPowerupSpawn = now;
      triggerNewPowerUp();
    }

    // 3. COLLISION, WARNING & HAZARD UPDATES
    let activeWarningDetected = false;
    
    // Loop backward to safely splice decaying lasers
    for (let i = state.lasers.length - 1; i >= 0; i--) {
      const laser = state.lasers[i];
      
      // Update laser warning/active timers
      laser.timer -= dilatedDelta;

      if (laser.state === 'warning') {
        activeWarningDetected = true;
        if (laser.timer <= 0) {
          // Switch to fully active firing laser
          laser.state = 'active';
          laser.timer = laser.activeDuration;
          audio.playLaserFire();
        }
      } else if (laser.state === 'active') {
        // Handle specialized animated behaviors
        if (laser.type === 'rotating' && laser.angle !== undefined && laser.rotSpeed !== undefined) {
          laser.angle += laser.rotSpeed * state.timeScale;
          // Recalculate endpoints
          const length = 1200;
          laser.x1 = laser.pivotX! - Math.cos(laser.angle) * length;
          laser.y1 = laser.pivotY! - Math.sin(laser.angle) * length;
          laser.x2 = laser.pivotX! + Math.cos(laser.angle) * length;
          laser.y2 = laser.pivotY! + Math.sin(laser.angle) * length;
        }

        if (laser.type === 'sweeping' && laser.sweepProgress !== undefined && laser.sweepSpeed !== undefined) {
          laser.sweepProgress += laser.sweepSpeed * state.timeScale;
          if (laser.sweepDirection === 'H') {
            laser.y1 = 50 + laser.sweepProgress;
            laser.y2 = 50 + laser.sweepProgress;
          } else {
            laser.x1 = 50 + laser.sweepProgress;
            laser.x2 = 50 + laser.sweepProgress;
          }
          if (laser.sweepProgress > LOGICAL_WIDTH) {
            laser.timer = 0; // complete sweep
          }
        }

        if (laser.type === 'pulsing' && laser.pulseTimer !== undefined) {
          laser.pulseTimer += dilatedDelta;
        }

        // Perform Distance Calculation for Collisions and Near-Misses
        if (laser.x1 !== undefined && laser.y1 !== undefined && laser.x2 !== undefined && laser.y2 !== undefined) {
          const closest = getClosestPointOnSegment(player.x, player.y, laser.x1, laser.y1, laser.x2, laser.y2);
          const dist = Math.hypot(player.x - closest.x, player.y - closest.y);

          // Pulsing laser is harmless when pulsed off
          let isLaserCurrentlyHot = true;
          if (laser.type === 'pulsing' && laser.pulseTimer !== undefined) {
            const pulsePhase = Math.floor(laser.pulseTimer / 250) % 2;
            isLaserCurrentlyHot = pulsePhase === 0;
          }

          if (isLaserCurrentlyHot) {
            const hitThreshold = player.radius + laser.width / 2;

            if (dist < hitThreshold) {
              // COLLISION! Trigger damage if not invulnerable
              if (player.invulnerableTimer <= 0 && state.powerUps.dash <= 0) {
                if (state.powerUps.shield > 0) {
                  // Shield absorbs the damage!
                  state.powerUps.shield = 0;
                  setHudActiveShield(0);
                  player.invulnerableTimer = 1000; // temporary buffer
                  state.screenShake = 18;
                  state.flashOverlayAlpha = 0.55;
                  state.flashColor = '#06b6d4'; // cyan flash
                  audio.playHit();
                  spawnExplosionParticles(player.x, player.y, '#06b6d4', 35);
                  spawnFloatingText('SHIELD SHATTERED', player.x, player.y - 30, '#06b6d4', 15);
                } else {
                  // Suffer physical damage
                  player.lives -= 1;
                  setHudLives(player.lives);
                  player.invulnerableTimer = 1500; // Flashing invuln
                  state.screenShake = 28;
                  state.flashOverlayAlpha = 0.85;
                  state.flashColor = '#ef4444'; // Red flash
                  audio.playHit();
                  spawnExplosionParticles(player.x, player.y, '#f43f5e', 45);
                  spawnFloatingText('DAMAGE SUSTAINED', player.x, player.y - 35, '#ef4444', 16);

                  if (player.lives <= 0) {
                    handleGameOver();
                    return; // exit loop
                  }
                }
              }
            } else if (dist < hitThreshold + 24 && !laser.nearMissChecked) {
              // NEAR MISS trigger! Must dodge extremely closely
              laser.nearMissChecked = true;
              state.nearMisses += 1;
              
              // Trigger Golden Reward Score and popups
              const bonusScore = 10 * state.multiplier;
              state.score += bonusScore;
              setHudScore(state.score);

              audio.playNearMiss();
              // Spawn satisfying bright neon blue shock sparks from closest line point
              spawnNearMissSparks(closest.x, closest.y, '#22d3ee', 15);
              spawnFloatingText(`+${bonusScore} NEAR MISS!`, player.x, player.y - 32, '#22d3ee', 14, -2.0);

              // Perfect Dodge Slow motion feedback loop (brief 80ms slowmo juice!)
              state.powerUps.slowmo = Math.max(state.powerUps.slowmo, 100);
            }
          }
        }

        if (laser.timer <= 0) {
          laser.state = 'decaying';
          laser.timer = laser.decayDuration;
        }
      } else if (laser.state === 'decaying') {
        if (laser.timer <= 0) {
          // Remove laser
          state.lasers.splice(i, 1);
        }
      }
    }

    setHudWarningActive(activeWarningDetected);

    // 4. POWER-UP ITEM COLLISION CHECKS
    for (let i = state.powerups.length - 1; i >= 0; i--) {
      const p = state.powerups[i];
      p.pulseAngle += 0.05 * state.timeScale;

      const dist = Math.hypot(player.x - p.x, player.y - p.y);
      if (dist < player.radius + p.radius) {
        // Collect!
        state.powerupsCollected += 1;
        audio.playPowerUp(p.type);

        // Apply specialized enhancements
        let bonusPoints = 15 * state.multiplier;
        state.score += bonusPoints;
        setHudScore(state.score);

        // Generate glowing star particles
        spawnExplosionParticles(p.x, p.y, p.type === 'shield' ? '#06b6d4' : p.type === 'slowmo' ? '#a855f7' : p.type === 'double' ? '#f59e0b' : p.type === 'extra-life' ? '#f43f5e' : '#e11d48', 20);

        if (p.type === 'shield') {
          state.powerUps.shield = 6000; // 6 seconds
          spawnFloatingText(`SHIELD TRIGGERED +${bonusPoints}`, p.x, p.y - 20, '#06b6d4', 13);
        } else if (p.type === 'slowmo') {
          state.powerUps.slowmo = 5000; // 5 seconds
          spawnFloatingText(`TEMPORAL DILATION +${bonusPoints}`, p.x, p.y - 20, '#a855f7', 13);
        } else if (p.type === 'double') {
          state.powerUps.double = 8000; // 8 seconds
          spawnFloatingText(`DOUBLE SCORE MULTIPLIER +${bonusPoints}`, p.x, p.y - 20, '#f59e0b', 13);
        } else if (p.type === 'extra-life') {
          player.lives = Math.min(5, player.lives + 1);
          setHudLives(player.lives);
          spawnFloatingText(`LIFE RESTORED +${bonusPoints}`, p.x, p.y - 20, '#f43f5e', 13);
        } else if (p.type === 'dash') {
          state.powerUps.dash = 4000; // 4 seconds electromagnetic dash
          spawnFloatingText(`HIGH-VOLTAGE ENERGY DASH +${bonusPoints}`, p.x, p.y - 20, '#38bdf8', 13);
        }

        state.powerups.splice(i, 1);
      }
    }

    // 5. DECAY DECORATIONS & JUICE
    if (state.screenShake > 0) {
      state.screenShake *= 0.9;
      if (state.screenShake < 0.2) state.screenShake = 0;
    }

    if (state.flashOverlayAlpha > 0) {
      state.flashOverlayAlpha -= 0.03;
    }

    // Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * state.timeScale;
      p.y += p.vy * state.timeScale;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        state.particles.splice(i, 1);
      }
    }

    // Update Floating texts
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const t = state.floatingTexts[i];
      t.y += t.vy;
      t.alpha -= 0.025;
      if (t.alpha <= 0) {
        state.floatingTexts.splice(i, 1);
      }
    }

    // Draw frame to canvas
    drawGameFrame();

    // Trigger next request frame
    requestAnimationFrame(gameStep);
  };

  // Render Engine (high speed Canvas painting)
  const drawGameFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;

    // Apply screen shake translation
    ctx.save();
    if (state.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * state.screenShake;
      const shakeY = (Math.random() - 0.5) * state.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // A. CLEAR CANVAS & DRAW DARK SCI-FI CHAMBER GRID
    ctx.fillStyle = '#020617'; // slate-950 deep dark space
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Dynamic Scrolling Cyber grid lines
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.035)'; // faint slate-800 grid
    ctx.lineWidth = 1;
    state.gridOffset = (state.gridOffset + 0.3 * state.timeScale) % 40;

    for (let x = state.gridOffset; x < LOGICAL_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, LOGICAL_HEIGHT);
      ctx.stroke();
    }
    for (let y = state.gridOffset; y < LOGICAL_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(LOGICAL_WIDTH, y);
      ctx.stroke();
    }

    // B. PAINT ACTIVE POWER-UPS
    state.powerups.forEach(p => {
      ctx.save();
      const scale = 1.0 + Math.sin(p.pulseAngle) * 0.15;
      ctx.translate(p.x, p.y);

      // Colorful specialized color styling
      let color1 = '#3b82f6';
      let color2 = '#00f2fe';
      let icon = '🛡';

      if (p.type === 'shield') { color1 = '#06b6d4'; color2 = '#22d3ee'; icon = '🛡'; }
      else if (p.type === 'slowmo') { color1 = '#8b5cf6'; color2 = '#c084fc'; icon = '⏳'; }
      else if (p.type === 'double') { color1 = '#f59e0b'; color2 = '#fbbf24'; icon = '⭐'; }
      else if (p.type === 'extra-life') { color1 = '#ef4444'; color2 = '#f87171'; icon = '❤️'; }
      else if (p.type === 'dash') { color1 = '#e11d48'; color2 = '#fb7185'; icon = '⚡'; }

      // Outer glow radial
      const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, p.radius * 2);
      grad.addColorStop(0, `${color1}66`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Core orb outline
      ctx.strokeStyle = color2;
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw Emoji glyph center
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, 0, 0.5);

      ctx.restore();
    });

    // C. DRAW INACTIVE/ACTIVE AND DECAYING LASER HAZARDS
    state.lasers.forEach(laser => {
      if (laser.x1 === undefined || laser.y1 === undefined || laser.x2 === undefined || laser.y2 === undefined) return;
      
      ctx.save();

      if (laser.state === 'warning') {
        // Red / Fuchsia flashing warning guideline
        const flashRate = 180; // flash interval in ms
        const isFlashed = Math.floor(laser.timer / flashRate) % 2 === 0;
        
        ctx.strokeStyle = isFlashed ? 'rgba(239, 68, 68, 0.85)' : 'rgba(239, 68, 68, 0.22)';
        ctx.lineWidth = 2.0;
        ctx.setLineDash([12, 8]); // dashed lines for guidelines

        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();

        // Draw alert warnings at extremities of warning segments
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (laser.type === 'rotating') {
          // Warning indicator circle centered on rotating pivot
          ctx.beginPath();
          ctx.arc(laser.pivotX!, laser.pivotY!, 24, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.stroke();
        }

      } else if (laser.state === 'active') {
        // Laser beam active, gorgeous neon beam graphics
        let thickness = laser.width;
        
        // Pulse laser visual vibration
        if (laser.type === 'pulsing' && laser.pulseTimer !== undefined) {
          const pulsePhase = Math.floor(laser.pulseTimer / 250) % 2;
          if (pulsePhase !== 0) {
            thickness = 1.0; // tiny deactivated flicker
          } else {
            thickness = laser.width * (1.1 + Math.sin(laser.pulseTimer * 0.04) * 0.2);
          }
        }

        // Draw massive outer halo glow
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = thickness * 3.8;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();

        // Core white hot center laser rod
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = thickness * 0.9;
        ctx.shadowBlur = 0; // disable shadow for sharp white hot core
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();

      } else if (laser.state === 'decaying') {
        // Laser is rapidly decaying/fading out
        const alpha = laser.timer / laser.decayDuration;
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = laser.width * alpha * 2.2;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 10 * alpha;
        
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
      }

      ctx.restore();
    });

    // D. PAINT DECORATIVE PARTICLES
    state.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.isSpark) {
        // Beautiful electric zig-zag sparks
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // E. DRAW PLAYER ENERGETIC GLOWING ORB
    const player = state.player;
    const isFlashing = player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer / 110) % 2 === 0;

    if (!isFlashing) {
      ctx.save();

      // Trail painting
      player.trail.forEach((t, index) => {
        const ratio = index / player.trail.length;
        ctx.save();
        ctx.globalAlpha = ratio * 0.35;
        ctx.fillStyle = state.powerUps.dash > 0 ? '#38bdf8' : '#ec4899';
        ctx.beginPath();
        ctx.arc(t.x, t.y, player.radius * ratio, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Ambient electric outer shield sphere
      if (state.powerUps.shield > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.45 + Math.sin(player.pulsePulse * 1.5) * 0.15})`;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * 1.8, 0, Math.PI * 2);
        ctx.stroke();

        // Shield geometric nodes
        ctx.fillStyle = '#22d3ee';
        for (let i = 0; i < 4; i++) {
          const nodeAngle = player.pulsePulse + (i * Math.PI) / 2;
          const nodeX = player.x + Math.cos(nodeAngle) * player.radius * 1.8;
          const nodeY = player.y + Math.sin(nodeAngle) * player.radius * 1.8;
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // High voltage electromagnetic dash trails
      if (state.powerUps.dash > 0) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * (1.3 + Math.sin(player.pulsePulse * 2) * 0.2), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Main core energy orb glow
      const glowGrad = ctx.createRadialGradient(player.x, player.y, 2, player.x, player.y, player.radius * 1.5);
      glowGrad.addColorStop(0, '#ffffff');
      glowGrad.addColorStop(0.3, state.powerUps.dash > 0 ? '#38bdf8' : '#ec4899');
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Sharp central power core outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.0;
      ctx.fillStyle = state.powerUps.dash > 0 ? '#0284c7' : '#db2777';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // F. FLOATING SCORE INDICATORS & POPUPS
    state.floatingTexts.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.font = `bold ${t.size}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });

    // G. LOW HEALTH VIGNETTE & CRITICAL FLASH INDICATOR
    if (player.lives === 1) {
      // Draw pulsating warning borders
      ctx.save();
      const vignetteGrad = ctx.createRadialGradient(
        LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, LOGICAL_WIDTH * 0.4,
        LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, LOGICAL_WIDTH * 0.75
      );
      const intensity = 0.16 + Math.sin(performance.now() * 0.007) * 0.08;
      vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGrad.addColorStop(1, `rgba(239, 68, 68, ${intensity})`);
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }

    // H. COGNITIVE TEMPORAL SLOW-MO HUD VIGNETTE
    if (state.powerUps.slowmo > 0) {
      ctx.save();
      const vignetteGrad = ctx.createRadialGradient(
        LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, LOGICAL_WIDTH * 0.4,
        LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, LOGICAL_WIDTH * 0.75
      );
      vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGrad.addColorStop(1, 'rgba(139, 92, 246, 0.15)'); // violet time-warp aura
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }

    // I. COLLISION SCREEN JUICE DAMAGING RED FLASH
    if (state.flashOverlayAlpha > 0) {
      ctx.save();
      ctx.fillStyle = state.flashColor;
      ctx.globalAlpha = state.flashOverlayAlpha;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }

    ctx.restore(); // complete shake translation restore
  };

  // GameOver Termination Handling
  const handleGameOver = () => {
    stateRef.current.isPlaying = false;
    setIsPlaying(false);
    audio.playGameOver();

    // Map numerical scores to achievements and shared ranks
    const finalScore = stateRef.current.score;
    let rank = '🥉 Rookie';
    if (finalScore >= 80) rank = '👑 Impossible Legend';
    else if (finalScore >= 45) rank = '🥇 Master';
    else if (finalScore >= 20) rank = '🥈 Survivor';

    // Record score using platform engine
    gamePlatform.recordScore('laser-maze', finalScore, {
      survivalTime: stateRef.current.survivalSeconds,
      nearMisses: stateRef.current.nearMisses,
      powerupsCollected: stateRef.current.powerupsCollected,
      highestMultiplier: stateRef.current.highestMultiplier,
      rank
    });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-fuchsia-500/15 bg-slate-950 shadow-2xl flex flex-col justify-center items-center select-none"
    >
      {/* HUD HEADER OVERLAYS */}
      <div className="absolute top-0 inset-x-0 z-10 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-slate-950/85 to-transparent pointer-events-none">
        
        {/* Left Side: Score & Multipliers */}
        <div className="flex gap-4 font-mono items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-fuchsia-400 font-bold tracking-widest uppercase flex items-center gap-1">
              <Star size={10} className="fill-fuchsia-400 text-fuchsia-400" />
              SCORE
            </span>
            <span className="text-xl sm:text-2xl font-black text-white leading-tight">
              {hudScore}
            </span>
          </div>

          <div className="flex flex-col bg-slate-900/40 border border-slate-800/40 rounded-lg px-2.5 py-0.5 items-center">
            <span className="text-[8px] text-slate-500 font-bold uppercase">MULTIPLIER</span>
            <span className="text-xs font-black text-amber-400 flex items-center">
              🔥 x{hudMultiplier}
            </span>
          </div>
        </div>

        {/* Dynamic Glowing WARNING label in center HUD */}
        {hudWarningActive && (
          <div className="hidden sm:flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[9px] font-bold uppercase px-3 py-1.5 rounded-full animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <AlertTriangle size={11} className="text-rose-400" />
            LASER COLLISION DANGER
          </div>
        )}

        {/* Right Side: Health Lives Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1 font-mono">
              ⏱ SURVIVAL: {hudSurvivalTime}s
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((heart) => (
                <Heart
                  key={heart}
                  size={14}
                  className={`${
                    heart <= hudLives 
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                      : 'text-slate-800'
                  } transition-all duration-300`}
                />
              ))}
            </div>
          </div>

          {/* Mute and exit triggers */}
          <div className="flex gap-1 pointer-events-auto">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-slate-400 hover:text-white transition cursor-pointer"
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* POWER-UP RUNNING METERS SIDEBAR */}
      <div className="absolute left-6 top-20 flex flex-col gap-2 z-10 pointer-events-none">
        {hudActiveShield > 0 && (
          <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg">
            <Shield size={11} className="text-cyan-400 animate-spin" />
            SHIELD ACTIVE ({hudActiveShield}s)
          </div>
        )}

        {hudActiveSlowMo > 0 && (
          <div className="flex items-center gap-1.5 bg-violet-950/40 border border-violet-500/20 text-violet-300 font-mono text-[9px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg">
            <Clock size={11} className="text-violet-400 animate-bounce" />
            TIME-WARP ACTIVE ({hudActiveSlowMo}s)
          </div>
        )}

        {hudActiveDouble > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/20 text-amber-300 font-mono text-[9px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            X2 MULTIPLIER ({hudActiveDouble}s)
          </div>
        )}

        {hudActiveDash > 0 && (
          <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/20 text-rose-300 font-mono text-[9px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg">
            <Zap size={11} className="text-rose-400 animate-pulse" />
            ENERGY DASH ACTIVE ({hudActiveDash}s)
          </div>
        )}
      </div>

      {/* 60 FPS Canvas Chamber for high rendering efficiency */}
      <div 
        className="relative w-full overflow-hidden touch-none"
        onPointerDown={handlePointerMove}
        onPointerMove={handlePointerMove}
        onTouchMove={handleTouchMove}
        style={{ height: canvasDimensions.height }}
      >
        <canvas 
          ref={canvasRef}
          width={LOGICAL_WIDTH}
          height={LOGICAL_HEIGHT}
          className="w-full h-full object-contain block bg-slate-950"
        />
      </div>

      {/* START INTERFACE SCREEN (IMMERSIVE PLAYSPRINT INTEGRATED) */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-6 bg-slate-950/90 backdrop-blur-sm rounded-2xl">
          <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-fuchsia-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center max-w-sm text-center relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-indigo-500 flex items-center justify-center text-2xl shadow-lg shadow-fuchsia-500/20 mb-4 animate-bounce">
              ⚡
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight uppercase font-sans mb-2 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-indigo-400">
              LASER MAZE
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider mb-6">
              SIGNATURE HIGH-SPEED DODGING CHALLENGE
            </p>

            {/* Micro details panel */}
            <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 mb-6 text-left font-mono text-[10px] text-slate-400 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-fuchsia-400">☄️</span>
                <span>DRAG finger or mouse to guide energy orb</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">⚡</span>
                <span>Avoid red flashing warning laser vectors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">🛡</span>
                <span>Collect Shields, Slow-Mo, and Life powerups</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">⚡</span>
                <span>Near Miss dodging awards golden bonus score!</span>
              </div>
            </div>

            <button
              onClick={() => {
                // Initialize context on first click
                audio.playWarning();
                startNewGame();
              }}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white hover:from-fuchsia-500 hover:to-indigo-500 font-mono text-xs font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-lg shadow-fuchsia-600/10"
              id="laser-maze-start-btn"
            >
              <Play size={14} className="fill-white" />
              START PLAYING
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
