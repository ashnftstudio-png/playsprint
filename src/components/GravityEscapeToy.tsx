/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Heart, 
  Trophy, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Play, 
  Home, 
  Shuffle, 
  Sparkles,
  Award,
  Timer,
  Flame,
  Gauge
} from 'lucide-react';
import { gamePlatform } from '../lib/gamePlatform';

// =================================================================
// AUDIO ENGINE (Synthesized via Web Audio API to prevent 404s)
// =================================================================
class GravityAudio {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.engineGain) {
      this.engineGain.gain.setValueAtTime(muted ? 0 : 0.012, this.ctx?.currentTime || 0);
    }
  }

  isMuted() {
    return this.muted;
  }

  playFlip(isUp: boolean) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Create a deep, high-fidelity resonant click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isUp ? 140 : 100, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn(e);
    }
  }

  playImpact() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const noise = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(10, this.ctx.currentTime + 0.5);

      noise.type = 'sawtooth';
      noise.frequency.setValueAtTime(90, this.ctx.currentTime);
      noise.frequency.linearRampToValueAtTime(5, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime); // Louder, heavier impact
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      osc.connect(gain);
      noise.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      noise.start();
      osc.stop(this.ctx.currentTime + 0.5);
      noise.stop(this.ctx.currentTime + 0.5);
    } catch (e) {
      console.warn(e);
    }
  }

  playPowerup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const freqs = [349.23, 440.00, 523.25, 698.46, 880.00, 1046.50]; // F-A-C-F-A-C rapid arpeggio
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.035);
        gain.gain.setValueAtTime(0.04, this.ctx!.currentTime + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.035 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + idx * 0.035);
        osc.stop(this.ctx!.currentTime + idx * 0.035 + 0.15);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playNearMiss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      // High-frequency rewarding chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);

      // Low frequency spatial WHOOSH sweep
      const whoosh = this.ctx.createOscillator();
      const whooshGain = this.ctx.createGain();
      whoosh.type = 'triangle';
      whoosh.frequency.setValueAtTime(450, this.ctx.currentTime);
      whoosh.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.18);
      whooshGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      whoosh.connect(whooshGain);
      whooshGain.connect(this.ctx.destination);
      whoosh.start();
      whoosh.stop(this.ctx.currentTime + 0.18);
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
      const sub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.75);

      sub.type = 'triangle';
      sub.frequency.setValueAtTime(90, this.ctx.currentTime);
      sub.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.75);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      sub.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      sub.start();
      osc.stop(this.ctx.currentTime + 0.8);
      sub.stop(this.ctx.currentTime + 0.8);
    } catch (e) {
      console.warn(e);
    }
  }

  startEngine() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      if (this.engineOsc) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(50, this.ctx.currentTime); // Deep engine rumble
      
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      
      this.engineOsc = osc;
      this.engineGain = gain;
    } catch (e) {
      console.warn(e);
    }
  }

  stopEngine() {
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
        this.engineOsc = null;
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
        this.engineGain = null;
      }
    } catch (e) {
      console.warn(e);
    }
  }
}

const audio = new GravityAudio();

// =================================================================
// INTERFACES & TYPES
// =================================================================
type AsteroidType = 
  | 'small_fast' 
  | 'large_slow' 
  | 'rotating' 
  | 'fire_meteor' 
  | 'ice_asteroid' 
  | 'crystal_asteroid' 
  | 'explosive_red'
  | 'meteor';

interface Asteroid {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: AsteroidType;
  rotation: number;
  rotSpeed: number;
  passedShip: boolean;
  pulseTimer: number;
  corners: { x: number; y: number }[]; // custom jagged shapes
  trailTimer?: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  vx: number;
  type: 'shield' | 'slowmo' | 'double' | 'life' | 'magnet';
  radius: number;
  phase: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  scale: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
}

interface Planet {
  x: number;
  y: number;
  radius: number;
  color1: string;
  color2: string;
  speed: number;
  hasRings: boolean;
  ringsColor?: string;
}

// 16:9 Logical resolution
const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 450;

export const GravityEscapeToy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React HUD states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [survivalTime, setSurvivalTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(audio.isMuted());
  const [showWarning, setShowWarning] = useState<string | null>(null);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);

  // Active status buffs
  const [activeShieldTime, setActiveShieldTime] = useState<number>(0);
  const [activeSlowmoTime, setActiveSlowmoTime] = useState<number>(0);
  const [activeDoubleTime, setActiveDoubleTime] = useState<number>(0);
  const [activeMagnetTime, setActiveMagnetTime] = useState<number>(0);

  // Active event display
  const [activeEventName, setActiveEventName] = useState<string | null>(null);

  const stateRef = useRef({
    score: 0,
    lives: 3,
    highScore: 0,
    startTime: Date.now(),
    survivalSeconds: 0,
    lastTimeScoreAdded: Date.now(),
    isPlaying: true,

    // Combo Mechanics
    damageFreeSeconds: 0,
    comboMultiplier: 1,
    highestMultiplier: 1,

    // Spaceship properties
    ship: {
      x: 160,
      y: 225,
      vy: 0,
      radius: 14,
      isGravityUp: false,
      invincibilityTimer: 0,
      tapFeedbackTimer: 0,
    },

    // Entity lists
    asteroids: [] as Asteroid[],
    powerups: [] as PowerUp[],
    particles: [] as Particle[],
    thrusterParticles: [] as Particle[],
    floatingTexts: [] as FloatingText[],

    // Background scrolling components
    bgOffsetFar: 0,
    bgOffsetMid: 0,
    bgOffsetNear: 0,
    nebulaOffset: 0,
    shootingStars: [] as ShootingStar[],
    planets: [] as Planet[],
    satellites: [
      { x: 100, y: 80, speed: 0.15, angle: 0, rotSpeed: 0.015, size: 5 },
      { x: 600, y: 380, speed: 0.08, angle: Math.PI / 4, rotSpeed: -0.01, size: 6 }
    ] as { x: number; y: number; speed: number; angle: number; rotSpeed: number; size: number }[],
    comet: { x: 0, y: 0, vx: 0, vy: 0, active: false, size: 0, alpha: 0 },

    // Timing & Spawn control
    lastAsteroidSpawn: 0,
    spawnInterval: 1100, // fast start, direct tension
    speedMultiplier: 1.15, // speedier start
    gravityStrength: 0.52, // tighter punchier gravity
    difficultyTimer: 0, // progress seconds

    // Multi-track Event Management
    activeEvent: null as 'meteor_storm' | 'gravity_surge' | 'black_hole' | 'solar_flare' | 'nebula_fog' | null,
    eventTimeRemaining: 0, // seconds
    timeSinceLastEvent: 0, // seconds
    lastEvent: null as string | null,
    solarFlareAlpha: 0,
    blackHolePulse: 0,

    // Freeze Frame Matrix slow motions
    nearMissSlowmoRemaining: 0, // ms
    comboSlowmoRemaining: 0, // ms

    // Camera FX matrix
    cameraShake: 0,
    cameraTilt: 0,
    cameraZoom: 1.0,
    redFlashAlpha: 0,

    // Saved statistics for game over
    nearMissCount: 0,
    powerupsCollected: 0,

    // Buff tracking
    shieldTimer: 0,
    slowmoTimer: 0,
    doubleTimer: 0,
    magnetTimer: 0,
  });

  const nextEntityId = useRef(1);

  // Fetch HighScore on start
  useEffect(() => {
    const history = gamePlatform.getHistory();
    if (history['gravity-escape']) {
      setHighScore(history['gravity-escape'].bestScore);
      stateRef.current.highScore = history['gravity-escape'].bestScore;
    }
  }, []);

  // HUD Synchronization effect
  useEffect(() => {
    const levelVal = score < 15 ? 1 : score < 40 ? 2 : score < 80 ? 3 : 4;
    gamePlatform.updateHud({
      score,
      highScore,
      lives,
      timer: survivalTime,
      combo: null,
      multiplier: comboMultiplier,
      level: levelVal,
    });
  }, [score, highScore, lives, survivalTime, comboMultiplier]);

  // Populate initial background planets to make space feel alive
  useEffect(() => {
    stateRef.current.planets = [
      { x: 300, y: 120, radius: 25, color1: '#1e3a8a', color2: '#3b82f6', speed: 0.08, hasRings: true, ringsColor: '#60a5fa' },
      { x: 750, y: 320, radius: 45, color1: '#4c1d95', color2: '#a855f7', speed: 0.05, hasRings: false },
      { x: 1150, y: 80, radius: 18, color1: '#7c2d12', color2: '#ea580c', speed: 0.12, hasRings: false },
    ];

    // Spawn initial asteroids right from start
    spawnInitialAsteroids();
  }, []);

  // Sync mute state
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audio.setMuted(nextMute);
  };

  useEffect(() => {
    audio.startEngine();
    return () => {
      audio.stopEngine();
    };
  }, []);

  // ResizeObserver custom 16:9 responsive canvas sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = Math.floor(width);
          canvas.height = Math.floor(width * (LOGICAL_HEIGHT / LOGICAL_WIDTH));
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Spawn initial 6-8 asteroids distributed on screen for instant starting tension
  const spawnInitialAsteroids = () => {
    const state = stateRef.current;
    const initialCount = 7;
    for (let i = 0; i < initialCount; i++) {
      let tempX = LOGICAL_WIDTH * 0.25 + (i * (LOGICAL_WIDTH * 0.7) / initialCount) + Math.random() * 50;
      let tempY = 50 + Math.random() * (LOGICAL_HEIGHT - 100);
      
      // Enforce Safe Zone (180 pixels around the ship)
      const dist = Math.hypot(tempX - state.ship.x, tempY - state.ship.y);
      if (dist < 180) {
        tempX = state.ship.x + 180 + Math.random() * 80;
      }

      const asteroid = createAsteroidBlueprint();
      asteroid.x = tempX;
      asteroid.y = tempY;
      state.asteroids.push(asteroid);
    }
  };

  // Create randomized custom blueprint
  const createAsteroidBlueprint = (forceType?: AsteroidType): Asteroid => {
    const id = nextEntityId.current++;
    const mult = stateRef.current.speedMultiplier;

    // Detailed variety: choose type
    let type: AsteroidType = 'small_fast';
    if (forceType) {
      type = forceType;
    } else {
      const rand = Math.random();
      if (rand < 0.20) type = 'small_fast';
      else if (rand < 0.35) type = 'large_slow';
      else if (rand < 0.50) type = 'rotating';
      else if (rand < 0.65) type = 'fire_meteor';
      else if (rand < 0.80) type = 'ice_asteroid';
      else if (rand < 0.92) type = 'crystal_asteroid';
      else type = 'explosive_red';
    }

    let radius = 16;
    let vx = -3;
    let vy = 0;
    let rotSpeed = (Math.random() - 0.5) * 0.04;

    switch (type) {
      case 'small_fast':
        radius = 8 + Math.random() * 4;
        vx = -(6.5 + Math.random() * 2.5) * mult;
        break;
      case 'large_slow':
        radius = 45 + Math.random() * 12;
        vx = -(1.2 + Math.random() * 0.5) * mult;
        break;
      case 'rotating':
        radius = 18 + Math.random() * 5;
        vx = -(3.2 + Math.random() * 1.5) * mult;
        rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.09 + Math.random() * 0.05);
        break;
      case 'fire_meteor':
        radius = 15 + Math.random() * 4;
        vx = -(4.8 + Math.random() * 2.2) * mult;
        vy = (Math.random() - 0.5) * 1.2;
        break;
      case 'ice_asteroid':
        radius = 17 + Math.random() * 4;
        vx = -(2.8 + Math.random() * 1.2) * mult;
        break;
      case 'crystal_asteroid':
        radius = 14 + Math.random() * 3;
        vx = -(3.5 + Math.random() * 1.8) * mult;
        vy = (Math.random() - 0.5) * 1.8;
        break;
      case 'explosive_red':
        radius = 21 + Math.random() * 4;
        vx = -(2.2 + Math.random() * 1.0) * mult;
        break;
      case 'meteor':
        radius = 7 + Math.random() * 3;
        vx = -(8.5 + Math.random() * 3.5) * mult;
        vy = (Math.random() - 0.5) * 2.5;
        break;
    }

    // Generate stable craggy vertices cached so they rotate elegantly
    const verticesCount = type === 'crystal_asteroid' ? 6 : (type === 'ice_asteroid' ? 7 : 9);
    const corners = [];
    for (let idx = 0; idx < verticesCount; idx++) {
      const theta = (idx * Math.PI * 2) / verticesCount;
      const crag = type === 'crystal_asteroid' 
        ? (idx % 2 === 0 ? 1.0 : 0.6) 
        : 1.0 + (Math.sin(idx * 2.45 + id) * 0.15);
      corners.push({
        x: Math.cos(theta) * radius * crag,
        y: Math.sin(theta) * radius * crag
      });
    }

    // Smart Spawner: Analyze current asteroid positions to ensure escape remains possible
    let safeY = 40 + Math.random() * (LOGICAL_HEIGHT - 80);
    let attempts = 0;
    while (attempts < 15) {
      let unavoidable = false;
      for (const other of stateRef.current.asteroids) {
        // If there's an asteroid close to the spawning horizontal slice
        if (Math.abs(other.x - (LOGICAL_WIDTH + 60)) < 160) {
          // If the vertical distance is too tight, it might block the player
          if (Math.abs(other.y - safeY) < 110) {
            unavoidable = true;
            break;
          }
        }
      }
      if (!unavoidable) break;
      safeY = 40 + Math.random() * (LOGICAL_HEIGHT - 80);
      attempts++;
    }

    // Reaction Time: Limit maximum horizontal velocity to guarantee at least 700ms of reaction time
    const maxSafetySpeed = 14.5; // (860 - 160) / 14.5 = 48.2 frames = 804ms of reaction time!
    if (Math.abs(vx) > maxSafetySpeed) {
      vx = -maxSafetySpeed;
    }

    return {
      id,
      x: LOGICAL_WIDTH + 60,
      y: safeY,
      vx,
      vy,
      radius,
      type,
      rotation: Math.random() * Math.PI,
      rotSpeed,
      passedShip: false,
      pulseTimer: 0,
      corners
    };
  };

  // Spawn an asteroid on track
  const spawnAsteroid = (forceType?: AsteroidType) => {
    stateRef.current.asteroids.push(createAsteroidBlueprint(forceType));
  };

  // Spawns a tight wave swarm of 5 tiny fast asteroids close together
  const spawnTinyAsteroidSwarm = () => {
    const baseId = nextEntityId.current++;
    const numAsteroids = 5;
    const baseOffset_Y = 50 + Math.random() * (LOGICAL_HEIGHT - 120);
    const mult = stateRef.current.speedMultiplier;

    for (let idx = 0; idx < numAsteroids; idx++) {
      const id = nextEntityId.current++;
      const radius = 6 + Math.random() * 3;
      // Staggered layout coordinates
      const x = LOGICAL_WIDTH + 50 + (idx * 25);
      const y = baseOffset_Y + (idx * 16) + (Math.random() - 0.5) * 10;

      // Fast speed - capped for 700ms safety
      let vx = -(7.0 + Math.random() * 2.0) * mult;
      if (Math.abs(vx) > 14.5) {
        vx = -14.5;
      }
      
      const corners = [];
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI * 2) / 6;
        const crag = 1.0 + (Math.sin(i * 3 + id) * 0.1);
        corners.push({ x: Math.cos(theta) * radius * crag, y: Math.sin(theta) * radius * crag });
      }

      stateRef.current.asteroids.push({
        id,
        x,
        y,
        vx,
        vy: 0,
        radius,
        type: 'small_fast',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        passedShip: false,
        pulseTimer: 0,
        corners
      });
    }
  };

  // Spawn power ups
  const spawnPowerUp = () => {
    const id = nextEntityId.current++;
    const x = LOGICAL_WIDTH + 45;
    const y = 60 + Math.random() * (LOGICAL_HEIGHT - 120);

    const types: PowerUp['type'][] = ['shield', 'slowmo', 'double', 'life', 'magnet'];
    const type = types[Math.floor(Math.random() * types.length)];

    stateRef.current.powerups.push({
      id,
      x,
      y,
      vx: -2.5,
      type,
      radius: 14,
      phase: Math.random() * Math.PI * 2
    });
  };

  // Floating text generation
  const spawnFloatingText = (text: string, x: number, y: number, color: string, scale: number = 1) => {
    stateRef.current.floatingTexts.push({
      id: nextEntityId.current++,
      text,
      x,
      y,
      vy: -1.8,
      color,
      alpha: 1.0,
      scale
    });
  };

  // Spark burst generation
  const spawnExplosion = (x: number, y: number, color: string, count: number = 15) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 3.5,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.025
      });
    }
  };

  // Interactive Gravity Flip handler
  const lastPointerTimeRef = useRef(0);

  const handleGravityFlip = (e?: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!stateRef.current.isPlaying) return;

    const now = Date.now();
    // Ignore additional simultaneous touches or hyper-rapid taps (processing cooldown)
    if (now - lastPointerTimeRef.current < 90) {
      return;
    }
    lastPointerTimeRef.current = now;

    gamePlatform.recordClick();

    const nextGravityUp = !stateRef.current.ship.isGravityUp;
    stateRef.current.ship.isGravityUp = nextGravityUp;

    // Small vibration (mobile feedback)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch (err) {
        // Suppress if blocked in sandbox
      }
    }

    // Set glow feedback on the ship
    stateRef.current.ship.tapFeedbackTimer = 12;

    // Satisfying flip chime (Deep resonant click!)
    audio.playFlip(nextGravityUp);

    // Initial snappy push - increased acceleration and reduced floatiness
    stateRef.current.ship.vy = nextGravityUp ? -5.5 : 5.5;

    // Small camera tilt & zoom effect (increased camera tilt for juicy action!)
    stateRef.current.cameraTilt = nextGravityUp ? -0.075 : 0.075;
    stateRef.current.cameraZoom = 1.05;

    // Backwards thruster sparks particle emission
    const ship = stateRef.current.ship;
    for (let i = 0; i < 15; i++) {
      stateRef.current.particles.push({
        x: ship.x - 16,
        y: ship.y,
        vx: -3.0 - Math.random() * 4.5,
        vy: (Math.random() - 0.5) * 5.0,
        color: '#22d3ee',
        size: 2.2 + Math.random() * 2.8,
        alpha: 1.0,
        decay: 0.04
      });
    }

    // Beautiful shockwave ring of light propagating from the ship
    for (let i = 0; i < 20; i++) {
      const angle = (i * Math.PI * 2) / 20;
      const speed = 4.0;
      stateRef.current.particles.push({
        x: ship.x,
        y: ship.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: 'rgba(34, 211, 238, 0.95)',
        size: 1.8,
        alpha: 0.9,
        decay: 0.045
      });
    }
  };

  // End Game
  const triggerGameOver = () => {
    const state = stateRef.current;
    state.isPlaying = false;
    setIsPlaying(false);
    audio.stopEngine();
    audio.playGameOver();

    // Ranks based on survival seconds
    let rank = '🥉 Rookie';
    if (state.survivalSeconds >= 120) rank = '👑 Space Legend';
    else if (state.survivalSeconds >= 60) rank = '🥇 Ace';
    else if (state.survivalSeconds >= 30) rank = '🥈 Pilot';

    gamePlatform.recordScore('gravity-escape', state.score, {
      survivalTime: state.survivalSeconds,
      nearMisses: state.nearMissCount,
      powerupsCollected: state.powerupsCollected,
      highestMultiplier: state.highestMultiplier,
      rank: rank
    });
  };

  // High performance Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updateAndRender = () => {
      const state = stateRef.current;
      const now = Date.now();

      // Matrix Freeze Frame / Time dilation calculation
      let timeDilation = 1.0;
      if (state.nearMissSlowmoRemaining > 0) {
        state.nearMissSlowmoRemaining -= 16.6;
        timeDilation = 0.15; // Slow down action to 15% speed
      } else if (state.comboSlowmoRemaining > 0) {
        state.comboSlowmoRemaining -= 16.6;
        timeDilation = 0.25;
      }

      // Final speed factor combines active Slow-Mo powerup and Time Dilation freeze frames
      const activeSlowmoFactor = state.slowmoTimer > 0 ? 0.35 : 1.0;
      const finalDeltaFactor = activeSlowmoFactor * timeDilation;

      // ---------------------------------------------------------------
      // 1. UPDATE STATES & PHYSICS
      // ---------------------------------------------------------------
      if (state.isPlaying) {
        // Core timing and score clock
        if (now - state.lastTimeScoreAdded >= 1000) {
          state.survivalSeconds += 1;
          state.lastTimeScoreAdded = now;

          // Increment combo time
          state.damageFreeSeconds += 1;

          // Calculate multi-tier Combo Multiplier
          let prevMult = state.comboMultiplier;
          if (state.damageFreeSeconds >= 30) {
            state.comboMultiplier = 5;
          } else if (state.damageFreeSeconds >= 20) {
            state.comboMultiplier = 3;
          } else if (state.damageFreeSeconds >= 10) {
            state.comboMultiplier = 2;
          } else {
            state.comboMultiplier = 1;
          }

          // Trigger screen slow-mo and text popup on big combo level up!
          if (state.comboMultiplier > prevMult) {
            state.comboSlowmoRemaining = 120; // 120ms freeze frame
            spawnFloatingText(`COMBO x${state.comboMultiplier}!`, state.ship.x, state.ship.y - 30, '#f43f5e', 1.4);
            audio.playPowerup();
            state.cameraShake = 6;
          }

          state.highestMultiplier = Math.max(state.highestMultiplier, state.comboMultiplier);

          // Add survival scores multiplied by combo tier! (x2 double points buff stacks on top!)
          const baseGain = state.doubleTimer > 0 ? 2 : 1;
          const scoresGained = baseGain * state.comboMultiplier;

          state.score += scoresGained;

          setScore(state.score);
          setSurvivalTime(state.survivalSeconds);
          setComboMultiplier(state.comboMultiplier);

          // Spawn floating indicators
          if (state.doubleTimer > 0) {
            spawnFloatingText(`+${scoresGained} (2X)`, state.ship.x, state.ship.y - 20, '#f59e0b', 1.15);
          } else if (state.comboMultiplier > 1) {
            spawnFloatingText(`+${scoresGained}`, state.ship.x, state.ship.y - 20, '#ec4899', 1.1);
          }
        }

        // Active Buff Timers
        if (state.ship.invincibilityTimer > 0) {
          state.ship.invincibilityTimer -= 16.6 * timeDilation;
        }
        if (state.ship.tapFeedbackTimer && state.ship.tapFeedbackTimer > 0) {
          state.ship.tapFeedbackTimer -= 1;
        }
        if (state.shieldTimer > 0) {
          state.shieldTimer -= 16.6 * timeDilation;
          setActiveShieldTime(Math.max(0, Math.ceil(state.shieldTimer / 1000)));
        }
        if (state.slowmoTimer > 0) {
          state.slowmoTimer -= 16.6 * timeDilation;
          setActiveSlowmoTime(Math.max(0, Math.ceil(state.slowmoTimer / 1000)));
        }
        if (state.doubleTimer > 0) {
          state.doubleTimer -= 16.6 * timeDilation;
          setActiveDoubleTime(Math.max(0, Math.ceil(state.doubleTimer / 1000)));
        }
        if (state.magnetTimer > 0) {
          state.magnetTimer -= 16.6 * timeDilation;
          setActiveMagnetTime(Math.max(0, Math.ceil(state.magnetTimer / 1000)));
        }

        // Camera fx dampening
        if (state.cameraShake > 0) {
          state.cameraShake *= 0.88;
          if (state.cameraShake < 0.1) state.cameraShake = 0;
        }
        state.cameraTilt *= 0.9;
        state.cameraZoom = 1.0 + (state.cameraZoom - 1.0) * 0.9;
        if (state.redFlashAlpha > 0) {
          state.redFlashAlpha -= 0.035;
        }

        // Solar flare flash decay
        if (state.solarFlareAlpha > 0) {
          state.solarFlareAlpha -= 0.012;
        }

        // Ship gravity vertical calculations
        let finalGravity = state.gravityStrength;
        if (state.activeEvent === 'gravity_surge') {
          finalGravity *= 2.0; // gravity doubles
        }

        if (state.ship.isGravityUp) {
          state.ship.vy -= finalGravity * finalDeltaFactor;
        } else {
          state.ship.vy += finalGravity * finalDeltaFactor;
        }

        // Snappy vertical movement - tight responsive movement (reduced floatiness)
        state.ship.vy *= Math.pow(0.92, finalDeltaFactor);
        state.ship.y += state.ship.vy * finalDeltaFactor;

        // Wall boundary soft rebounds
        if (state.ship.y < state.ship.radius) {
          state.ship.y = state.ship.radius;
          state.ship.vy = -state.ship.vy * 0.22;
        } else if (state.ship.y > LOGICAL_HEIGHT - state.ship.radius) {
          state.ship.y = LOGICAL_HEIGHT - state.ship.radius;
          state.ship.vy = -state.ship.vy * 0.22;
        }

        // Thruster sparks tail emission
        if (Math.random() < 0.85 * finalDeltaFactor) {
          state.thrusterParticles.push({
            x: state.ship.x - 14,
            y: state.ship.y + (Math.random() - 0.5) * 6,
            vx: -3.5 - Math.random() * 4,
            vy: (Math.random() - 0.5) * 2.2,
            color: state.shieldTimer > 0 ? '#38bdf8' : '#f97316',
            size: 2.2 + Math.random() * 3,
            alpha: 1.0,
            decay: 0.045
          });
        }

        // Progressive Difficulty Scaling and Chaos system
        state.difficultyTimer += 0.0166 * finalDeltaFactor;
        
        // Smoothly adjust spawn intervals and speed multipliers based on survival time (Fairness and curve compliance)
        if (state.survivalSeconds < 15) {
          // Very Easy: slow speed, relaxed spawns
          state.spawnInterval = 1400;
          state.speedMultiplier = 0.95;
        } else if (state.survivalSeconds < 30) {
          // Easy: gradual speed increase
          state.spawnInterval = 1100;
          state.speedMultiplier = 1.15;
        } else if (state.survivalSeconds < 60) {
          // Medium: moderate challenge
          state.spawnInterval = 850;
          state.speedMultiplier = 1.35;
        } else if (state.survivalSeconds < 90) {
          // Hard: fast meteors
          state.spawnInterval = 650;
          state.speedMultiplier = 1.6;
        } else {
          // Insane: expert zone
          state.spawnInterval = 500;
          state.speedMultiplier = 1.9;
        }

        // Multi-track Random Dynamic Events system (every 20-30 seconds)
        state.timeSinceLastEvent += 0.0166 * finalDeltaFactor;
        if (state.timeSinceLastEvent >= 22) {
          state.timeSinceLastEvent = 0;

          // Select random non-repeating event
          const candidates: ('meteor_storm' | 'gravity_surge' | 'black_hole' | 'solar_flare' | 'nebula_fog')[] = [
            'meteor_storm',
            'gravity_surge',
            'black_hole',
            'solar_flare',
            'nebula_fog'
          ];
          const filtered = state.lastEvent ? candidates.filter(e => e !== state.lastEvent) : candidates;
          const selected = filtered[Math.floor(Math.random() * filtered.length)];

          state.activeEvent = selected;
          state.lastEvent = selected;
          state.eventTimeRemaining = selected === 'solar_flare' ? 4.0 : 5.0;

          // Apply event announcements
          switch (selected) {
            case 'meteor_storm':
              setShowWarning('☄️ METEOR STORM DETECTED! PREPARE FOR METEOR SHOWER!');
              setActiveEventName('METEOR STORM');
              break;
            case 'gravity_surge':
              setShowWarning('🌀 GRAVITY SURGE ACTIVE! GRAVITY FIELD INTENSIFIED!');
              setActiveEventName('GRAVITY SURGE');
              break;
            case 'black_hole':
              setShowWarning('🕳️ BLACK HOLE PULSE DETECTED! CORE VORTEX ACTIVE!');
              setActiveEventName('BLACK HOLE');
              break;
            case 'solar_flare':
              setShowWarning('⚡ SOLAR FLARE WARNING! RADIATION BLAST!');
              setActiveEventName('SOLAR FLARE');
              state.solarFlareAlpha = 0.85; // Initial flash brightness
              break;
            case 'nebula_fog':
              setShowWarning('🌌 ENTERING NEBULA FOG! VISIBILITY IMPAIRED!');
              setActiveEventName('NEBULA FOG');
              break;
          }

          setTimeout(() => {
            setShowWarning(null);
          }, 3200);
        }

        // Count down active event
        if (state.activeEvent) {
          state.eventTimeRemaining -= 0.0166 * finalDeltaFactor;
          if (state.eventTimeRemaining <= 0) {
            state.activeEvent = null;
            setActiveEventName(null);
          }
        }

        // Event specific ticking behaviors
        if (state.activeEvent === 'meteor_storm') {
          // Rapidly spawn meteors (24% chance each frame)
          if (Math.random() < 0.24 * finalDeltaFactor) {
            spawnAsteroid('meteor');
          }
        }

        // standard asteroid spawn ticks
        if (now - state.lastAsteroidSpawn >= state.spawnInterval) {
          state.lastAsteroidSpawn = now;

          // Limit count based on difficulty
          let maxAllowed = 8;
          if (state.survivalSeconds < 15) maxAllowed = 8;
          else if (state.survivalSeconds < 30) maxAllowed = 10;
          else if (state.survivalSeconds < 60) maxAllowed = 12;
          else if (state.survivalSeconds < 90) maxAllowed = 15;
          else maxAllowed = 18;

          if (state.asteroids.length < maxAllowed) {
            // 12% chance of tiny swarm burst instead of normal single spawn
            if (Math.random() < 0.12) {
              spawnTinyAsteroidSwarm();
            } else {
              spawnAsteroid();
            }
          }

          // Spawn power up slightly more frequently (16% chance on asteroid ticks)
          if (Math.random() < 0.16) {
            spawnPowerUp();
          }
        }

        // -------------------------------------------------------------
        // ENTITY LOOP OPERATIONS
        // -------------------------------------------------------------

        // A. Asteroids update & collision loops
        const eventSpeedMult = state.activeEvent === 'solar_flare' ? 1.8 : 1.0;

        for (let i = state.asteroids.length - 1; i >= 0; i--) {
          const ast = state.asteroids[i];
          
          // Black hole pulse vortex mechanics: pull asteroids toward (550, 225)
          if (state.activeEvent === 'black_hole') {
            const bhX = 550;
            const bhY = 225;
            const dx = bhX - ast.x;
            const dy = bhY - ast.y;
            const distBH = Math.hypot(dx, dy);

            if (distBH > 25) {
              // Apply pulling acceleration vectors
              ast.vx += (dx / distBH) * 0.15 * finalDeltaFactor;
              ast.vy += (dy / distBH) * 0.15 * finalDeltaFactor;
            }
          }

          // Apply velocities
          ast.x += ast.vx * eventSpeedMult * finalDeltaFactor;
          ast.y += ast.vy * eventSpeedMult * finalDeltaFactor;
          ast.rotation += ast.rotSpeed * finalDeltaFactor;

          if (ast.type === 'explosive_red') {
            ast.pulseTimer += 0.08 * finalDeltaFactor;
          }

          // Emit active trails for burning meteors
          if (ast.type === 'fire_meteor' && Math.random() < 0.4 * finalDeltaFactor) {
            state.particles.push({
              x: ast.x + Math.cos(ast.rotation) * ast.radius,
              y: ast.y + Math.sin(ast.rotation) * ast.radius,
              vx: -ast.vx * 0.2 + (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5,
              color: Math.random() > 0.4 ? '#f97316' : '#facc15',
              size: 2 + Math.random() * 3,
              alpha: 0.8,
              decay: 0.03
            });
          }

          // Near miss detection system
          if (!ast.passedShip && ast.x <= state.ship.x) {
            ast.passedShip = true;
            
            const dy = Math.abs(ast.y - state.ship.y);
            const edgeDist = dy - state.ship.radius - ast.radius;

            // Trigger on exceptionally close dodges
            if (edgeDist > 0 && edgeDist <= 19) {
              state.nearMissCount += 1;

              // Register near miss combo score bonus (+5)
              const scoreBonus = (state.doubleTimer > 0 ? 10 : 5) * state.comboMultiplier;
              state.score += scoreBonus;
              setScore(state.score);

              // 100ms satisfying freeze-frame slow motion
              state.nearMissSlowmoRemaining = 100;

              // Satisfying chime
              audio.playNearMiss();

              // Blue particle burst
              spawnExplosion(ast.x, ast.y, '#38bdf8', 16);

              // Floating indicator text
              spawnFloatingText(`+${scoreBonus} NEAR MISS!`, state.ship.x + 22, state.ship.y - 15, '#22d3ee', 1.25);
            }
          }

          // Circle overlap collision check
          const dist = Math.hypot(ast.x - state.ship.x, ast.y - state.ship.y);
          if (dist < ast.radius + state.ship.radius) {
            
            if (state.shieldTimer > 0) {
              // Shield absorbed collision
              state.asteroids.splice(i, 1);
              spawnExplosion(ast.x, ast.y, '#38bdf8', 26);
              state.cameraShake = 8;
              audio.playImpact();
              spawnFloatingText('SHIELD ABSORBED!', state.ship.x, state.ship.y - 25, '#60a5fa', 1.2);
              continue;
            } else if (state.ship.invincibilityTimer <= 0) {
              // Take Damage
              state.lives -= 1;
              setLives(state.lives);

              // Reset Damage-Free seconds to instantly reset Combo!
              state.damageFreeSeconds = 0;
              state.comboMultiplier = 1;
              setComboMultiplier(1);

              state.ship.invincibilityTimer = 1500; // 1.5s invincible flashing
              state.cameraShake = 22; // Strong screen shake
              state.redFlashAlpha = 0.65; // High contrast red warning overlay
              audio.playImpact();

              // Spawn floating pop & intensive fiery spark fragments
              spawnFloatingText('-1 LIFE', state.ship.x, state.ship.y - 30, '#ef4444', 1.45);
              spawnExplosion(state.ship.x, state.ship.y, '#ef4444', 32);

              if (state.lives <= 0) {
                triggerGameOver();
              }
            }
          }

          // Despawn
          if (ast.x < -ast.radius - 30) {
            state.asteroids.splice(i, 1);
          }
        }

        // B. Powerups movement & magnet collections
        for (let i = state.powerups.length - 1; i >= 0; i--) {
          const p = state.powerups[i];
          p.phase += 0.05 * finalDeltaFactor;

          // Magnet Pull mechanics
          if (state.magnetTimer > 0) {
            const pullDist = Math.hypot(p.x - state.ship.x, p.y - state.ship.y);
            if (pullDist < 200) {
              const dx = state.ship.x - p.x;
              const dy = state.ship.y - p.y;
              p.x += (dx / pullDist) * 6.5 * finalDeltaFactor;
              p.y += (dy / pullDist) * 6.5 * finalDeltaFactor;
            } else {
              p.x += p.vx * finalDeltaFactor;
            }
          } else {
            p.x += p.vx * finalDeltaFactor;
          }

          p.y += Math.sin(p.phase) * 0.5 * finalDeltaFactor;

          // Collect detection
          const dist = Math.hypot(p.x - state.ship.x, p.y - state.ship.y);
          if (dist < p.radius + state.ship.radius) {
            state.powerupsCollected += 1;
            audio.playPowerup();

            // Glowing gold burst
            spawnExplosion(p.x, p.y, '#f59e0b', 16);
            spawnFloatingText(`+${p.type.toUpperCase()}`, p.x, p.y - 18, '#10b981', 1.3);

            // Double rewards bonus points
            const pts = (state.doubleTimer > 0 ? 30 : 15) * state.comboMultiplier;
            state.score += pts;
            setScore(state.score);

            // Apply Buff timers
            if (p.type === 'shield') {
              state.shieldTimer = 5000;
              setActiveShieldTime(5);
            } else if (p.type === 'slowmo') {
              state.slowmoTimer = 4000; // 4s
              setActiveSlowmoTime(4);
            } else if (p.type === 'double') {
              state.doubleTimer = 5000;
              setActiveDoubleTime(5);
            } else if (p.type === 'magnet') {
              state.magnetTimer = 5000;
              setActiveMagnetTime(5);
            } else if (p.type === 'life') {
              state.lives = Math.min(3, state.lives + 1);
              setLives(state.lives);
            }

            state.powerups.splice(i, 1);
            continue;
          }

          // Despawn
          if (p.x < -p.radius - 20) {
            state.powerups.splice(i, 1);
          }
        }
      }

      // -------------------------------------------------------------
      // BACKGROUNDS & PARTICLES MOVEMENT
      // -------------------------------------------------------------
      const bgSpeed = finalDeltaFactor;
      state.bgOffsetFar = (state.bgOffsetFar - 0.3 * bgSpeed) % LOGICAL_WIDTH;
      state.bgOffsetMid = (state.bgOffsetMid - 0.75 * bgSpeed) % LOGICAL_WIDTH;
      state.bgOffsetNear = (state.bgOffsetNear - 1.6 * bgSpeed) % LOGICAL_WIDTH;
      state.nebulaOffset = (state.nebulaOffset - 0.15 * bgSpeed) % LOGICAL_WIDTH;

      // Handle Shooting Stars
      if (state.isPlaying && Math.random() < 0.015 * finalDeltaFactor) {
        state.shootingStars.push({
          x: LOGICAL_WIDTH + 50,
          y: Math.random() * (LOGICAL_HEIGHT - 150),
          vx: -(10 + Math.random() * 8),
          vy: 3 + Math.random() * 4,
          length: 40 + Math.random() * 40,
          alpha: 1.0
        });
      }

      for (let i = state.shootingStars.length - 1; i >= 0; i--) {
        const ss = state.shootingStars[i];
        ss.x += ss.vx * finalDeltaFactor;
        ss.y += ss.vy * finalDeltaFactor;
        ss.alpha -= 0.02 * finalDeltaFactor;
        if (ss.alpha <= 0 || ss.x < -100) {
          state.shootingStars.splice(i, 1);
        }
      }

      // Handle Planets scrolling
      state.planets.forEach(p => {
        p.x -= p.speed * bgSpeed;
        if (p.x < -p.radius - 100) {
          p.x = LOGICAL_WIDTH + 150 + Math.random() * 200;
          p.y = 50 + Math.random() * (LOGICAL_HEIGHT - 100);
        }
      });

      // Update particle decay list
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * finalDeltaFactor;
        p.y += p.vy * finalDeltaFactor;
        p.alpha -= p.decay * finalDeltaFactor;
        if (p.alpha <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // Thruster smoke particles update
      for (let i = state.thrusterParticles.length - 1; i >= 0; i--) {
        const p = state.thrusterParticles[i];
        p.x += p.vx * finalDeltaFactor;
        p.y += p.vy * finalDeltaFactor;
        p.alpha -= p.decay * finalDeltaFactor;
        if (p.alpha <= 0) {
          state.thrusterParticles.splice(i, 1);
        }
      }

      // Floating text score labels
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y += ft.vy * finalDeltaFactor;
        ft.alpha -= 0.02 * finalDeltaFactor;
        if (ft.alpha <= 0) {
          state.floatingTexts.splice(i, 1);
        }
      }

      // ---------------------------------------------------------------
      // 2. CANVAS RENDERING
      // ---------------------------------------------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // A. CAMERA FX TRANSFORMATIONS
      ctx.save();
      const shakeIntensity = state.cameraShake;
      if (shakeIntensity > 0) {
        const shakeX = (Math.random() - 0.5) * shakeIntensity;
        const shakeY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(shakeX, shakeY);
      }

      // Center transformations for Camera Zoom and Camera Tilt
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(state.cameraZoom, state.cameraZoom);
      ctx.rotate(state.cameraTilt);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Scaler transform mapping coordinates
      const scaleX = canvas.width / LOGICAL_WIDTH;
      const scaleY = canvas.height / LOGICAL_HEIGHT;
      ctx.scale(scaleX, scaleY);

      // B. DEEP SPACE GRADIENT BACKGROUND
      const nebGrad = ctx.createRadialGradient(
        LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, 50, 
        LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, 450
      );
      nebGrad.addColorStop(0, '#060613');
      nebGrad.addColorStop(0.5, '#030308');
      nebGrad.addColorStop(1, '#010103');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // C. BEAUTIFUL DRIFTING NEBULA CLOUDS
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      // Drifting purple radial nebula cloud
      const neb1X = (LOGICAL_WIDTH * 0.25 + state.nebulaOffset) % (LOGICAL_WIDTH + 300) - 150;
      const cloudGrad1 = ctx.createRadialGradient(neb1X, 150, 20, neb1X, 150, 180);
      cloudGrad1.addColorStop(0, 'rgba(124, 58, 237, 0.07)');
      cloudGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cloudGrad1;
      ctx.beginPath();
      ctx.arc(neb1X, 150, 180, 0, Math.PI * 2);
      ctx.fill();

      // Drifting cyan radial nebula cloud
      const neb2X = (LOGICAL_WIDTH * 0.75 + state.nebulaOffset * 1.5) % (LOGICAL_WIDTH + 300) - 150;
      const cloudGrad2 = ctx.createRadialGradient(neb2X, 300, 30, neb2X, 300, 220);
      cloudGrad2.addColorStop(0, 'rgba(6, 182, 212, 0.06)');
      cloudGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cloudGrad2;
      ctx.beginPath();
      ctx.arc(neb2X, 300, 220, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // D. DISTANT SCROLLING PLANETS
      state.planets.forEach(p => {
        ctx.save();
        // Ring drawing under planet body (back layer of rings)
        if (p.hasRings && p.ringsColor) {
          ctx.strokeStyle = p.ringsColor;
          ctx.lineWidth = 4;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(2.2, 0.45);
          ctx.rotate(-Math.PI / 8);
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, Math.PI, 0); // back arc
          ctx.stroke();
          ctx.restore();
        }

        // Planet core sphere
        const planetGrad = ctx.createRadialGradient(
          p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.1,
          p.x, p.y, p.radius
        );
        planetGrad.addColorStop(0, p.color2);
        planetGrad.addColorStop(0.7, p.color1);
        planetGrad.addColorStop(1, '#020205');
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ring drawing over planet body (front layer of rings)
        if (p.hasRings && p.ringsColor) {
          ctx.strokeStyle = p.ringsColor;
          ctx.lineWidth = 4;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(2.2, 0.45);
          ctx.rotate(-Math.PI / 8);
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI); // front arc
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      });

      // Distant satellites orbiting and slow comet streaks
      if (state.satellites) {
        state.satellites.forEach(sat => {
          sat.angle += sat.rotSpeed * finalDeltaFactor;
          const satX = sat.x + Math.cos(sat.angle) * 35;
          const satY = sat.y + Math.sin(sat.angle) * 12;

          ctx.save();
          ctx.fillStyle = '#94a3b8';
          ctx.shadowColor = '#cbd5e1';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(satX, satY, sat.size, 0, Math.PI * 2);
          ctx.fill();

          // Satellite solar panel wing outline
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(satX - sat.size - 3, satY);
          ctx.lineTo(satX + sat.size + 3, satY);
          ctx.stroke();
          ctx.restore();
        });
      }

      if (state.comet) {
        if (!state.comet.active && Math.random() < 0.002 * finalDeltaFactor) {
          state.comet.active = true;
          state.comet.x = LOGICAL_WIDTH + 50;
          state.comet.y = 30 + Math.random() * 100;
          state.comet.vx = -(4.0 + Math.random() * 3.0);
          state.comet.vy = 0.5 + Math.random() * 1.0;
          state.comet.size = 3 + Math.random() * 3;
          state.comet.alpha = 1.0;
        }

        if (state.comet.active) {
          state.comet.x += state.comet.vx * finalDeltaFactor;
          state.comet.y += state.comet.vy * finalDeltaFactor;
          
          ctx.save();
          const cometGrad = ctx.createLinearGradient(
            state.comet.x, state.comet.y,
            state.comet.x - state.comet.vx * 15, state.comet.y - state.comet.vy * 15
          );
          cometGrad.addColorStop(0, '#ffffff');
          cometGrad.addColorStop(0.3, 'rgba(236, 72, 153, 0.4)');
          cometGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
          
          ctx.strokeStyle = cometGrad;
          ctx.lineWidth = state.comet.size;
          ctx.beginPath();
          ctx.moveTo(state.comet.x, state.comet.y);
          ctx.lineTo(state.comet.x - state.comet.vx * 12, state.comet.y - state.comet.vy * 12);
          ctx.stroke();
          ctx.restore();

          if (state.comet.x < -100 || state.comet.y > LOGICAL_HEIGHT + 100) {
            state.comet.active = false;
          }
        }
      }

      // E. TRIPLE LAYER PARALLAX STARS
      // Backlayer (Dim, slow)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      for (let i = 0; i < 30; i++) {
        const starX = (i * 35 + state.bgOffsetFar + LOGICAL_WIDTH) % LOGICAL_WIDTH;
        const starY = (i * i * 4.3) % LOGICAL_HEIGHT;
        ctx.fillRect(starX, starY, 1, 1);
      }
      // Midlayer (Medium size)
      ctx.fillStyle = 'rgba(156, 163, 175, 0.45)';
      for (let i = 0; i < 20; i++) {
        const starX = (i * 65 + state.bgOffsetMid + LOGICAL_WIDTH) % LOGICAL_WIDTH;
        const starY = (i * i * 9.1 + 40) % LOGICAL_HEIGHT;
        ctx.fillRect(starX, starY, 1.5, 1.5);
      }
      // Nearlayer (Bright cyan)
      for (let i = 0; i < 12; i++) {
        const starX = (i * 95 + state.bgOffsetNear + LOGICAL_WIDTH) % LOGICAL_WIDTH;
        const starY = (i * i * 14.7 + 75) % LOGICAL_HEIGHT;
        ctx.fillStyle = 'rgba(14, 116, 144, 0.7)';
        ctx.fillRect(starX, starY, 2.2, 2.2);
      }

      // F. SHOOTING STARS TRAILS
      state.shootingStars.forEach(ss => {
        ctx.save();
        ctx.globalAlpha = ss.alpha;
        const ssGrad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * ss.length * 0.05, ss.y - ss.vy * ss.length * 0.05);
        ssGrad.addColorStop(0, '#ffffff');
        ssGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
        ssGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.strokeStyle = ssGrad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x + ss.vx * 0.6, ss.y + ss.vy * 0.6);
        ctx.stroke();
        ctx.restore();
      });

      // G. NEBULA FOG EVENT INTENSE spotlight overlay clipping mask
      let isMaskApplied = false;
      if (state.activeEvent === 'nebula_fog') {
        isMaskApplied = true;
        ctx.save();
        
        // Draw standard viewport
        // Setup overlay clipping
        ctx.beginPath();
        // Inner circle spotlight centered at ship
        ctx.arc(state.ship.x, state.ship.y, 145, 0, Math.PI * 2);
        ctx.rect(LOGICAL_WIDTH, 0, -LOGICAL_WIDTH, LOGICAL_HEIGHT); // Invert viewport path
        ctx.clip();

        // Fill out viewport outside of spotlight with dense glowing fog gas
        const fogGrad = ctx.createRadialGradient(
          state.ship.x, state.ship.y, 100,
          state.ship.x, state.ship.y, 250
        );
        fogGrad.addColorStop(0, 'rgba(21, 10, 41, 0.1)');
        fogGrad.addColorStop(0.5, 'rgba(40, 15, 75, 0.88)');
        fogGrad.addColorStop(1, 'rgba(12, 4, 28, 0.97)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      }

      // H. TRUCK TRAIL FLAMES
      state.thrusterParticles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // I. COGNITIVE DRAW THE SLEEK COLLISION-SPARKED SPACESHIP
      const ship = state.ship;
      const isInvincibleFlashing = ship.invincibilityTimer > 0 && Math.floor(ship.invincibilityTimer / 110) % 2 === 0;

      if (!isInvincibleFlashing) {
        // Draw Tap Feedback Pulse Ring propagating outwards
        if (ship.tapFeedbackTimer && ship.tapFeedbackTimer > 0) {
          ctx.save();
          const progress = (12 - ship.tapFeedbackTimer) / 12; // 0 to 1
          ctx.strokeStyle = `rgba(34, 211, 238, ${1.0 - progress})`;
          ctx.lineWidth = 3 - progress * 2;
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(ship.x, ship.y, ship.radius * (1.0 + progress * 2.5), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Active shield orb outer glow
        if (state.shieldTimer > 0) {
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.8;
          ctx.shadowColor = '#0ea5e9';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(ship.x, ship.y, ship.radius * 1.85, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.fill();
          ctx.restore();
        }

        // Active magnet line circle
        if (state.magnetTimer > 0) {
          ctx.save();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(ship.x, ship.y, 140, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Active double points flame aura
        if (state.doubleTimer > 0) {
          ctx.save();
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ship.x, ship.y, ship.radius * 2.15, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Elegant Gravity Direction Arrow indicator floating behind/above the ship
        ctx.save();
        ctx.translate(ship.x - 30, ship.y);
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ship.isGravityUp) {
          // Pointing up
          ctx.moveTo(0, 5);
          ctx.lineTo(0, -5);
          ctx.lineTo(-3, -2);
          ctx.moveTo(0, -5);
          ctx.lineTo(3, -2);
        } else {
          // Pointing down
          ctx.moveTo(0, -5);
          ctx.lineTo(0, 5);
          ctx.lineTo(-3, 2);
          ctx.moveTo(0, 5);
          ctx.lineTo(3, 2);
        }
        ctx.stroke();
        ctx.restore();

        // Draw Spaceship Pointing Right
        ctx.save();
        ctx.translate(ship.x, ship.y);

        const angle = Math.max(-0.25, Math.min(0.25, ship.vy * 0.04));
        ctx.rotate(angle);

        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 11;
        ctx.fillStyle = '#22d3ee';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        // Nose tip
        ctx.moveTo(18, 0);
        // Top Wing-tip
        ctx.lineTo(-12, -12);
        // Indent Engine body
        ctx.lineTo(-7, -4);
        // Bottom Wing-tip
        ctx.lineTo(-7, 4);
        ctx.lineTo(-12, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing Engine flame
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ff6b00';
        ctx.beginPath();
        ctx.arc(-8, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // J. DRAW POWER UPS WITH SOLID STRONG GLOW
      state.powerups.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);

        let glowColor = '#3b82f6';
        let innerSymbol = '🛡️';
        if (p.type === 'slowmo') { glowColor = '#a855f7'; innerSymbol = '⏳'; }
        else if (p.type === 'double') { glowColor = '#f59e0b'; innerSymbol = '⭐'; }
        else if (p.type === 'life') { glowColor = '#db2777'; innerSymbol = '❤️'; }
        else if (p.type === 'magnet') { glowColor = '#10b981'; innerSymbol = '🧲'; }

        // Strong neon aura glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 18;
        ctx.fillStyle = `${glowColor}38`;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2.0;

        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Icon symbol
        ctx.shadowBlur = 0;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(innerSymbol, 0.5, 0.5);

        ctx.restore();
      });

      // K. BLACK HOLE VORTEX OBJECT RENDERING (If event is active)
      if (state.activeEvent === 'black_hole') {
        ctx.save();
        const bhX = 550;
        const bhY = 225;
        state.blackHolePulse += 0.06;
        const bhScale = 1.0 + Math.sin(state.blackHolePulse) * 0.12;

        // Gravity swirl paths
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.save();
        ctx.translate(bhX, bhY);
        ctx.rotate(-state.blackHolePulse * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, 75 * bhScale, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();

        // Outer violet event horizon
        const bhGrad = ctx.createRadialGradient(bhX, bhY, 5, bhX, bhY, 45 * bhScale);
        bhGrad.addColorStop(0, '#000000');
        bhGrad.addColorStop(0.3, '#120224');
        bhGrad.addColorStop(0.7, '#6b21a8');
        bhGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bhGrad;
        ctx.beginPath();
        ctx.arc(bhX, bhY, 45 * bhScale, 0, Math.PI * 2);
        ctx.fill();

        // Absolute dark singular core
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(bhX, bhY, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // L. DRAW ASTEROIDS WITH COMPLEX DISTINCT GEOMETRIES & TYPES
      state.asteroids.forEach((ast) => {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.rotation);

        let fillStyle = '#475569';
        let strokeStyle = '#64748b';
        let shadowColor = 'transparent';
        let shadowBlur = 0;
        let isCrystalline = false;
        let isFiery = false;
        let isIce = false;

        switch (ast.type) {
          case 'small_fast':
            fillStyle = '#0f172a';
            strokeStyle = '#ec4899';
            shadowColor = '#f43f5e';
            shadowBlur = 12;
            break;
          case 'large_slow':
            fillStyle = '#1e293b';
            strokeStyle = '#475569';
            shadowColor = '#334155';
            shadowBlur = 6;
            break;
          case 'rotating':
            fillStyle = '#0f172a';
            strokeStyle = '#eab308';
            shadowColor = '#f59e0b';
            shadowBlur = 14;
            break;
          case 'fire_meteor':
            isFiery = true;
            break;
          case 'ice_asteroid':
            isIce = true;
            break;
          case 'crystal_asteroid':
            isCrystalline = true;
            break;
          case 'explosive_red':
            fillStyle = '#7f1d1d';
            strokeStyle = '#ef4444';
            shadowColor = '#f87171';
            shadowBlur = 16 + Math.sin(ast.pulseTimer) * 5;
            break;
          case 'meteor':
            fillStyle = '#7c2d12';
            strokeStyle = '#ea580c';
            shadowColor = '#ea580c';
            shadowBlur = 8;
            break;
        }

        // Handle specialty material rendering
        if (isFiery) {
          // Fiery molten core radial gradient
          const fireGrad = ctx.createRadialGradient(
            -ast.radius * 0.2, -ast.radius * 0.2, ast.radius * 0.1,
            0, 0, ast.radius
          );
          fireGrad.addColorStop(0, '#fef08a');
          fireGrad.addColorStop(0.4, '#f97316');
          fireGrad.addColorStop(0.8, '#b91c1c');
          fireGrad.addColorStop(1, '#450a0a');
          ctx.fillStyle = fireGrad;
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 15;
        } else if (isIce) {
          // Frost ice blue radial gradient
          const iceGrad = ctx.createRadialGradient(
            -ast.radius * 0.2, -ast.radius * 0.2, ast.radius * 0.1,
            0, 0, ast.radius
          );
          iceGrad.addColorStop(0, '#e0f2fe');
          iceGrad.addColorStop(0.5, '#38bdf8');
          iceGrad.addColorStop(0.9, '#0369a1');
          iceGrad.addColorStop(1, '#0c4a6e');
          ctx.fillStyle = iceGrad;
          ctx.strokeStyle = '#e0f7ff';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
        } else if (isCrystalline) {
          // Jewel facets radial gradient
          const cryGrad = ctx.createRadialGradient(
            -ast.radius * 0.3, -ast.radius * 0.3, ast.radius * 0.1,
            0, 0, ast.radius
          );
          cryGrad.addColorStop(0, '#fae8ff');
          cryGrad.addColorStop(0.4, '#d946ef');
          cryGrad.addColorStop(0.8, '#86198f');
          cryGrad.addColorStop(1, '#4a044e');
          ctx.fillStyle = cryGrad;
          ctx.strokeStyle = '#fdf4ff';
          ctx.lineWidth = 2.0;
          ctx.shadowColor = '#d946ef';
          ctx.shadowBlur = 16;
        } else {
          ctx.fillStyle = fillStyle;
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = shadowColor;
          ctx.shadowBlur = shadowBlur;
        }

        // Draw cached custom jagged polygon coordinates
        ctx.beginPath();
        ast.corners.forEach((pt, pIdx) => {
          if (pIdx === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw facet reflection vectors inside crystals
        if (isCrystalline) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ast.corners.forEach((pt) => {
            ctx.moveTo(0, 0);
            ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();
        } else if (isIce) {
          // Draw frost cracks
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(-ast.radius * 0.4, -ast.radius * 0.3);
          ctx.lineTo(ast.radius * 0.4, ast.radius * 0.3);
          ctx.moveTo(-ast.radius * 0.3, ast.radius * 0.4);
          ctx.lineTo(ast.radius * 0.3, -ast.radius * 0.4);
          ctx.stroke();
        } else if (ast.type === 'explosive_red') {
          // Draw hazard inner circular lines
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, ast.radius * 0.5, 0, Math.PI * 2);
          ctx.stroke();

          // Pulsing warning core dot
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, 3 + Math.sin(ast.pulseTimer) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw classic craters on normal and large slow
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          // Crater 1
          ctx.beginPath();
          ctx.arc(-ast.radius * 0.3, -ast.radius * 0.2, ast.radius * 0.2, 0, Math.PI * 2);
          ctx.fill();
          // Crater 2
          ctx.beginPath();
          ctx.arc(ast.radius * 0.4, ast.radius * 0.1, ast.radius * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // M. IMPACT EXPLOSIONS PARTICLES
      state.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // N. FLOATING GAIN INDICATORS
      state.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = `bold ${Math.floor(11 * ft.scale)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // O. NEBULA FOG EVENT spotlight pop restore
      if (isMaskApplied) {
        ctx.restore();
      }

      // P. SOLAR FLARE INTENSE FLASH OVERLAY
      if (state.solarFlareAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(251, 146, 60, ${state.solarFlareAlpha})`;
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        ctx.restore();
      }

      // Q. CRASH RED COLLISION DAMAGE FLASH OVERLAY & PROCEDURAL SCREEN CRACKS
      if (state.redFlashAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(239, 68, 68, ${state.redFlashAlpha * 0.45})`;
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

        // Draw elegant, arcade procedural glowing screen cracks propagating from collision points
        ctx.strokeStyle = `rgba(254, 226, 226, ${state.redFlashAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#f87171';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        // Central crack 1
        ctx.moveTo(state.ship.x, state.ship.y);
        ctx.lineTo(state.ship.x - 30, state.ship.y - 40);
        ctx.lineTo(state.ship.x - 20, state.ship.y - 75);
        ctx.moveTo(state.ship.x - 30, state.ship.y - 40);
        ctx.lineTo(state.ship.x - 65, state.ship.y - 50);

        // Central crack 2
        ctx.moveTo(state.ship.x, state.ship.y);
        ctx.lineTo(state.ship.x + 40, state.ship.y + 35);
        ctx.lineTo(state.ship.x + 25, state.ship.y + 70);
        ctx.moveTo(state.ship.x + 40, state.ship.y + 35);
        ctx.lineTo(state.ship.x + 75, state.ship.y + 20);

        ctx.stroke();
        ctx.restore();
      }

      // Restore overall Camera transformations matrix
      ctx.restore();

      animId = requestAnimationFrame(updateAndRender);
    };

    updateAndRender();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, activeEventName]);

  // Restart handler
  const handleRestartGame = () => {
    stateRef.current = {
      score: 0,
      lives: 3,
      highScore: stateRef.current.highScore,
      startTime: Date.now(),
      survivalSeconds: 0,
      lastTimeScoreAdded: Date.now(),
      isPlaying: true,

      damageFreeSeconds: 0,
      comboMultiplier: 1,
      highestMultiplier: 1,

      ship: {
        x: 160,
        y: 225,
        vy: 0,
        radius: 14,
        isGravityUp: false,
        invincibilityTimer: 0,
        tapFeedbackTimer: 0,
      },

      asteroids: [],
      powerups: [],
      particles: [],
      thrusterParticles: [],
      floatingTexts: [],

      bgOffsetFar: 0,
      bgOffsetMid: 0,
      bgOffsetNear: 0,
      nebulaOffset: 0,
      shootingStars: [],
      planets: [
        { x: 300, y: 120, radius: 25, color1: '#1e3a8a', color2: '#3b82f6', speed: 0.08, hasRings: true, ringsColor: '#60a5fa' },
        { x: 750, y: 320, radius: 45, color1: '#4c1d95', color2: '#a855f7', speed: 0.05, hasRings: false },
        { x: 1150, y: 80, radius: 18, color1: '#7c2d12', color2: '#ea580c', speed: 0.12, hasRings: false },
      ],
      satellites: [
        { x: 100, y: 80, speed: 0.15, angle: 0, rotSpeed: 0.015, size: 5 },
        { x: 600, y: 380, speed: 0.08, angle: Math.PI / 4, rotSpeed: -0.01, size: 6 }
      ],
      comet: { x: 0, y: 0, vx: 0, vy: 0, active: false, size: 0, alpha: 0 },

      lastAsteroidSpawn: 0,
      spawnInterval: 1400, // Very Easy start, direct tension
      speedMultiplier: 0.95,
      gravityStrength: 0.52,
      difficultyTimer: 0,

      activeEvent: null,
      eventTimeRemaining: 0,
      timeSinceLastEvent: 0,
      lastEvent: stateRef.current.lastEvent,
      solarFlareAlpha: 0,
      blackHolePulse: 0,

      nearMissSlowmoRemaining: 0,
      comboSlowmoRemaining: 0,

      cameraShake: 0,
      cameraTilt: 0,
      cameraZoom: 1.0,
      redFlashAlpha: 0,

      nearMissCount: 0,
      powerupsCollected: 0,

      shieldTimer: 0,
      slowmoTimer: 0,
      doubleTimer: 0,
      magnetTimer: 0,
    };

    nextEntityId.current = 1;

    setScore(0);
    setLives(3);
    setSurvivalTime(0);
    setComboMultiplier(1);
    setIsPlaying(true);
    setActiveShieldTime(0);
    setActiveSlowmoTime(0);
    setActiveDoubleTime(0);
    setActiveMagnetTime(0);
    setActiveEventName(null);
    setShowWarning(null);

    // Initial asteroids
    spawnInitialAsteroids();

    audio.startEngine();
  };

  return (
    <div className="w-full flex flex-col h-full justify-between gap-4 font-sans select-none relative">
      {/* 60 FPS Premium Canvas chamber */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-indigo-500/15 bg-slate-950 shadow-2xl flex flex-col justify-center items-center touch-none"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleGravityFlip(e);
        }}
      >
        <canvas 
          ref={canvasRef}
          className="w-full aspect-[16/9] block bg-slate-950 cursor-pointer"
        />

        {/* Dynamic Warning Alerts overlay */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-1/4 left-4 right-4 text-center pointer-events-none z-30"
            >
              <div className="inline-block bg-rose-950/90 backdrop-blur-md border border-rose-500/60 text-rose-300 text-xs sm:text-sm font-black font-mono tracking-wider px-6 py-3 rounded-xl shadow-2xl animate-pulse uppercase max-w-md mx-auto">
                {showWarning}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live HUD Dashboard panel overlay */}
        <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none select-none z-20 font-mono">
          
          {/* LIVES & ACTIVE STATUS BUFF TIMERS */}
          <div className="flex flex-col gap-1.5 items-start">
            <div className="flex gap-1.5 items-center bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl px-3 py-1.5 shadow-md">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Heart 
                  key={idx}
                  size={14}
                  className={`transition-all duration-300 ${
                    idx < lives 
                      ? 'text-rose-500 fill-rose-500 scale-105 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]' 
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Shield Indicator */}
            {activeShieldTime > 0 && (
              <div className="bg-blue-950/90 backdrop-blur-sm border border-blue-500/30 px-2.5 py-1 rounded-lg text-[9px] font-bold text-blue-300 flex items-center gap-1">
                <Shield size={10} className="text-blue-400 animate-pulse" />
                <span>SHIELD: {activeShieldTime}s</span>
              </div>
            )}
            {/* Magnet indicator */}
            {activeMagnetTime > 0 && (
              <div className="bg-emerald-950/90 backdrop-blur-sm border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[9px] font-bold text-emerald-300 flex items-center gap-1">
                <span>🧲 MAGNET: {activeMagnetTime}s</span>
              </div>
            )}
            {/* Slowmo indicator */}
            {activeSlowmoTime > 0 && (
              <div className="bg-purple-950/90 backdrop-blur-sm border border-purple-500/30 px-2.5 py-1 rounded-lg text-[9px] font-bold text-purple-300">
                ⏳ SLOW-MO: {activeSlowmoTime}s
              </div>
            )}
          </div>

          {/* TIMER & EVENT INDICATOR */}
          <div className="flex flex-col gap-1.5 items-center">
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl px-3 py-1.5 shadow-md text-slate-300 text-xs font-bold">
              <Timer size={13} className="text-indigo-400" />
              <span>{survivalTime}s</span>
            </div>

            {/* Display active event if one is running */}
            {activeEventName && (
              <div className="bg-amber-950/90 backdrop-blur-sm border border-amber-500/40 px-2.5 py-1 rounded-lg text-[9px] font-black text-amber-300 tracking-wider uppercase animate-pulse">
                ⚠️ EVENT: {activeEventName}
              </div>
            )}
          </div>

          {/* SCORE, MULTIPLIER & HIGH SCORE */}
          <div className="flex flex-col gap-1.5 items-end">
            <div className="flex gap-2">
              {/* Score Panel */}
              <div className="flex flex-col items-end bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl px-3 py-1 shadow-md">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-none">SCORE</span>
                <span className="text-sm font-black text-cyan-400 mt-0.5">{score}</span>
              </div>

              {/* Combo Multiplier Panel with glowing Fire badge */}
              <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 shadow-md border transition-all duration-300 ${
                comboMultiplier > 1 
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-300 scale-105 drop-shadow-[0_0_6px_rgba(244,63,94,0.3)]' 
                  : 'bg-slate-900/90 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-0.5">
                  <Flame size={12} className={comboMultiplier > 1 ? 'text-rose-400 animate-pulse fill-rose-400' : 'text-slate-600'} />
                  <span className="text-xs font-black">x{comboMultiplier}</span>
                </div>
              </div>
            </div>

            {/* Double points indicator */}
            {activeDoubleTime > 0 && (
              <div className="bg-amber-950/90 backdrop-blur-sm border border-amber-500/30 px-2.5 py-1 rounded-lg text-[9px] font-bold text-amber-300 flex items-center gap-1 shadow-sm">
                <Zap size={10} className="text-amber-400 fill-amber-400" />
                <span>2X POINTS: {activeDoubleTime}s</span>
              </div>
            )}

            {/* Personal Best line */}
            <div className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
              <Trophy size={10} className="text-amber-500" />
              <span>PB: {highScore}</span>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Sound control block overlay */}
        <div className="absolute bottom-3 right-3 z-30 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMute();
            }}
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-800/60 text-slate-400 hover:text-white transition-colors cursor-pointer active:scale-95 pointer-events-auto"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* Central control instructions line */}
      <div className="text-xs text-slate-400 font-mono text-center flex items-center justify-center gap-1.5 bg-slate-900/20 py-2 px-4 border border-slate-800/40 rounded-xl">
        <span>💡 Tap anywhere on the space terminal to instantly invert gravity. Perfect gravity timing escapes crash!</span>
      </div>
    </div>
  );
};
