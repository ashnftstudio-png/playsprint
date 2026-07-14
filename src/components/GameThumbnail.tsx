/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface GameThumbnailProps {
  experienceId: string;
  themeColor: string;
  isHovered: boolean;
}

export const GameThumbnail: React.FC<GameThumbnailProps> = ({
  experienceId,
  themeColor,
  isHovered,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const stateRef = useRef<any>({});

  // Get color hex values matching getColorClasses
  const getColorHex = (colorName: string): string => {
    switch (colorName) {
      case 'indigo': return '#818cf8';
      case 'emerald': return '#34d399';
      case 'amber': return '#fbbf24';
      case 'rose': return '#f43f5e';
      case 'cyan': return '#22d3ee';
      case 'violet': return '#a78bfa';
      case 'teal': return '#2dd4bf';
      case 'fuchsia': return '#e879f9';
      case 'sky': return '#38bdf8';
      case 'orange': return '#fb923c';
      default: return '#818cf8';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use ResizeObserver or exact dimensions (card preview is typically 96px tall, let's handle high DPI)
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const activeColor = getColorHex(themeColor);
    
    // Initialize game-specific animation state variables
    const state = stateRef.current;
    state.time = 0;
    
    // Setup initial conditions for each game representation
    switch (experienceId) {
      case 'gravity-lab': {
        state.particles = Array.from({ length: 6 }, (_, i) => ({
          angle: (i * Math.PI * 2) / 6,
          radius: 18 + Math.random() * 15,
          speed: 0.02 + Math.random() * 0.02,
          size: 2 + Math.random() * 2,
        }));
        break;
      }
      case 'dont-press-the-red-button': {
        state.pulse = 0;
        state.shake = 0;
        break;
      }
      case 'infinite-machine': {
        state.rotation1 = 0;
        state.rotation2 = 0;
        break;
      }
      case 'time-warp': {
        state.hands = [0, 0];
        state.warp = 1;
        break;
      }
      case 'planet-creator': {
        state.angle = 0;
        state.clouds = Array.from({ length: 3 }, () => Math.random() * Math.PI * 2);
        break;
      }
      case 'light-playground': {
        state.mirrors = [
          { x: 30, y: 35 },
          { x: 120, y: 20 },
          { x: 140, y: 75 },
          { x: 50, y: 65 }
        ];
        break;
      }
      case 'pixel-universe': {
        state.pixels = Array.from({ length: 48 }, () => ({
          x: Math.floor(Math.random() * 16),
          y: Math.floor(Math.random() * 8),
          alpha: Math.random(),
          targetAlpha: Math.random(),
          speed: 0.02 + Math.random() * 0.05
        }));
        break;
      }
      case 'decision-reactor': {
        state.particles = [];
        state.pegs = [];
        // Generate small triangular peg board
        for (let row = 1; row <= 4; row++) {
          for (let col = 0; col < row; col++) {
            state.pegs.push({ row, col });
          }
        }
        break;
      }
      case 'color-lab': {
        state.circles = [
          { x: 0.35, y: 0.45, r: 20, color: '#06b6d4' },
          { x: 0.65, y: 0.45, r: 20, color: '#ec4899' },
          { x: 0.5, y: 0.6, r: 18, color: '#eab308' }
        ];
        break;
      }
      case 'shadow-explorer': {
        state.angle = 0;
        break;
      }
      case 'random-reality': {
        state.points = Array.from({ length: 15 }, () => ({
          x: Math.random() * 150,
          y: Math.random() * 80,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          color: `hsla(${(Math.random() * 360).toFixed(0)}, 85%, 60%, 0.45)`
        }));
        break;
      }
      case 'catch-the-dot': {
        state.dot = { x: 75, y: 40 };
        state.timer = 0;
        state.radar = 0;
        break;
      }
      case 'color-panic': {
        state.colorIdx = 0;
        state.timer = 0;
        state.colors = ['#f43f5e', '#34d399', '#38bdf8', '#fbbf24'];
        state.words = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
        break;
      }
      case 'one-second-challenge': {
        state.timeVal = 0.0;
        state.isStopped = false;
        state.timer = 0;
        break;
      }
      case 'reaction-rush': {
        state.state = 'waiting'; // waiting, ready, click
        state.timer = 0;
        break;
      }
      case 'find-the-fake-emoji': {
        state.grid = Array.from({ length: 15 }, (_, i) => ({
          isFake: i === 7,
          x: (i % 5) * 22 + 25,
          y: Math.floor(i / 5) * 18 + 15,
          blink: 0,
        }));
        break;
      }
      case 'chain-reaction': {
        state.reacting = [];
        state.timer = 0;
        break;
      }
      case 'shape-switch': {
        state.morph = 0;
        state.shapeIndex = 0;
        break;
      }
      case 'perfect-timing': {
        state.angle = 0;
        state.pulse = 0;
        break;
      }
      case 'gravity-escape': {
        state.shipY = 40;
        state.shipV = 0;
        state.gravity = 0.15;
        state.obstacles = Array.from({ length: 3 }, (_, i) => ({
          x: 100 + i * 50,
          y: 15 + Math.random() * 50,
          size: 4 + Math.random() * 4
        }));
        break;
      }
      case 'laser-maze': {
        state.lasers = [
          { x1: 15, y1: 20, x2: 135, y2: 20, pulse: 0 },
          { x1: 15, y1: 60, x2: 135, y2: 60, pulse: Math.PI / 2 },
          { x1: 50, y1: 10, x2: 50, y2: 70, pulse: Math.PI }
        ];
        break;
      }
      default: {
        // default starfield
        state.stars = Array.from({ length: 12 }, () => ({
          x: Math.random() * 150,
          y: Math.random() * 80,
          speed: 0.2 + Math.random() * 0.4,
          r: 0.5 + Math.random() * 1.5,
        }));
      }
    }

    // Animation Loop
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // Enhance dynamic variables based on hovering state
      const speedMultiplier = isHovered ? 2.0 : 1.0;
      state.time += 0.05 * speedMultiplier;

      // Render custom procedural mini-simulation for each game ID
      switch (experienceId) {
        case 'gravity-lab': {
          // Centered star
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 4 + Math.sin(state.time * 2) * 1, 0, Math.PI * 2);
          ctx.fillStyle = activeColor;
          ctx.shadowBlur = 10;
          ctx.shadowColor = activeColor;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Orbit paths
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 22, 0, Math.PI * 2);
          ctx.arc(w / 2, h / 2, 34, 0, Math.PI * 2);
          ctx.stroke();

          // Orbits
          state.particles.forEach((p: any) => {
            p.angle += p.speed * speedMultiplier;
            const x = w / 2 + Math.cos(p.angle) * p.radius;
            const y = h / 2 + Math.sin(p.angle) * p.radius;

            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = activeColor;
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
          break;
        }

        case 'dont-press-the-red-button': {
          state.shake = isHovered ? Math.sin(state.time * 5) * 1.5 : 0;
          const pulse = Math.sin(state.time * 3) * 3 + 10;

          // Danger zone borders
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(8, 8, w - 16, h - 16);
          ctx.setLineDash([]);

          // Big warning glow behind button
          ctx.beginPath();
          ctx.arc(w / 2 + state.shake, h / 2, pulse + 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
          ctx.fill();

          // Button body base
          ctx.beginPath();
          ctx.arc(w / 2 + state.shake, h / 2, 16, 0, Math.PI * 2);
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Inner button red cap
          ctx.beginPath();
          ctx.arc(w / 2 + state.shake, h / 2, 11, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? '#ff4d4d' : '#dc2626';
          ctx.fill();
          break;
        }

        case 'infinite-machine': {
          state.rotation1 += 0.02 * speedMultiplier;
          state.rotation2 -= 0.03 * speedMultiplier;

          // Draw left gear
          const drawGear = (cx: number, cy: number, r: number, teeth: number, rot: number) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rot);
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
            ctx.stroke();

            // Teeth
            for (let i = 0; i < teeth; i++) {
              ctx.rotate((Math.PI * 2) / teeth);
              ctx.fillStyle = activeColor;
              ctx.fillRect(-2, -r - 1, 4, 4);
            }
            // Inner core
            ctx.beginPath();
            ctx.arc(0, 0, r / 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          };

          drawGear(w / 2 - 18, h / 2 + 2, 18, 12, state.rotation1);
          drawGear(w / 2 + 18, h / 2 - 2, 15, 10, state.rotation2);
          break;
        }

        case 'time-warp': {
          state.warp = isHovered ? 0.3 : 1.5 + Math.sin(state.time * 0.5) * 0.8;
          state.hands[0] += 0.02 * state.warp;
          state.hands[1] += 0.08 * state.warp;

          // Clock circle
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 22, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Clock ticks
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 1;
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            ctx.beginPath();
            ctx.moveTo(w / 2 + Math.cos(angle) * 18, h / 2 + Math.sin(angle) * 18);
            ctx.lineTo(w / 2 + Math.cos(angle) * 21, h / 2 + Math.sin(angle) * 21);
            ctx.stroke();
          }

          // Hands
          ctx.strokeStyle = activeColor;
          ctx.lineCap = 'round';
          
          // Hour hand
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.lineTo(w / 2 + Math.cos(state.hands[0]) * 10, h / 2 + Math.sin(state.hands[0]) * 10);
          ctx.stroke();

          // Minute hand
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.lineTo(w / 2 + Math.cos(state.hands[1]) * 15, h / 2 + Math.sin(state.hands[1]) * 15);
          ctx.stroke();
          break;
        }

        case 'planet-creator': {
          state.angle += 0.015 * speedMultiplier;

          // Background nebulas/stars
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(20, 20, 1.5, 1.5);
          ctx.fillRect(w - 30, 25, 1, 1);
          ctx.fillRect(35, h - 25, 1.2, 1.2);

          // Render Ring
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate(-Math.PI / 12);

          // Back half of planet ring
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, 32, 7, 0, Math.PI, Math.PI * 2);
          ctx.stroke();

          // Planet sphere
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.fill();

          // Front half of planet ring
          ctx.beginPath();
          ctx.ellipse(0, 0, 32, 7, 0, 0, Math.PI);
          ctx.stroke();

          // Small Moon orbiting
          const moonX = Math.cos(state.angle) * 26;
          const moonY = Math.sin(state.angle) * 6;
          ctx.beginPath();
          ctx.arc(moonX, moonY, 3, 0, Math.PI * 2);
          ctx.fillStyle = activeColor;
          ctx.fill();

          ctx.restore();
          break;
        }

        case 'light-playground': {
          // Draw laser emitters & reflecting paths
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(15, h / 2 - 3, 5, 6); // emitter

          // Laser path
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ef4444';
          
          ctx.beginPath();
          ctx.moveTo(20, h / 2);
          
          const pulseOffset = Math.sin(state.time * 2) * 5;
          const mirrorY1 = h / 2 - 15 + pulseOffset;
          const mirrorY2 = h / 2 + 15 - pulseOffset;

          ctx.lineTo(w / 2 - 15, mirrorY1);
          ctx.lineTo(w / 2 + 15, mirrorY2);
          ctx.lineTo(w - 25, h / 2);
          ctx.stroke();
          
          ctx.shadowBlur = 0;

          // Draw mirror indicators
          ctx.fillStyle = '#64748b';
          ctx.fillRect(w / 2 - 18, mirrorY1 - 6, 6, 12);
          ctx.fillRect(w / 2 + 12, mirrorY2 - 6, 6, 12);

          // Split light effect
          ctx.beginPath();
          ctx.arc(w - 25, h / 2, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          break;
        }

        case 'pixel-universe': {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
          ctx.fillRect(0, 0, w, h);

          const cellSizeX = w / 16;
          const cellSizeY = h / 8;

          state.pixels.forEach((p: any) => {
            // Smooth blend alphas
            p.alpha += (p.targetAlpha - p.alpha) * p.speed * speedMultiplier;
            if (Math.abs(p.alpha - p.targetAlpha) < 0.1) {
              p.targetAlpha = Math.random();
            }

            ctx.fillStyle = activeColor;
            ctx.globalAlpha = p.alpha * 0.7;
            ctx.fillRect(p.x * cellSizeX + 1, p.y * cellSizeY + 1, cellSizeX - 2, cellSizeY - 2);
          });
          ctx.globalAlpha = 1.0;
          break;
        }

        case 'decision-reactor': {
          const pegRadius = 1.5;
          const ballRadius = 2.5;

          // Draw pegs
          ctx.fillStyle = '#475569';
          state.pegs.forEach((p: any) => {
            const px = w / 2 + (p.col - (p.row - 1) / 2) * 16;
            const py = 12 + p.row * 10;
            ctx.beginPath();
            ctx.arc(px, py, pegRadius, 0, Math.PI * 2);
            ctx.fill();
          });

          // Spawn new balls periodically
          if (!state.ballTimer) state.ballTimer = 0;
          state.ballTimer += speedMultiplier;
          if (state.ballTimer > 30) {
            state.ballTimer = 0;
            state.particles.push({
              x: w / 2 + (Math.random() - 0.5) * 4,
              y: 5,
              vx: (Math.random() - 0.5) * 0.5,
              vy: 1,
              life: 120
            });
          }

          // Update & render balls
          ctx.fillStyle = activeColor;
          state.particles = state.particles.filter((b: any) => {
            b.vy += 0.05; // gravity
            b.x += b.vx;
            b.y += b.vy;
            b.life -= 1;

            // Bounce on pegs
            state.pegs.forEach((p: any) => {
              const px = w / 2 + (p.col - (p.row - 1) / 2) * 16;
              const py = 12 + p.row * 10;
              const dx = b.x - px;
              const dy = b.y - py;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < pegRadius + ballRadius + 0.5) {
                b.vy = -Math.abs(b.vy) * 0.4;
                b.vx += (dx / dist) * 0.4 + (Math.random() - 0.5) * 0.2;
                b.y = py - 2.5;
              }
            });

            ctx.beginPath();
            ctx.arc(b.x, b.y, ballRadius, 0, Math.PI * 2);
            ctx.fill();

            return b.y < h && b.life > 0;
          });
          break;
        }

        case 'color-lab': {
          // Liquid overlapping circles blending
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          
          state.circles.forEach((c: any, idx: number) => {
            const speed = 0.03 * (idx === 0 ? 1 : idx === 1 ? -1.2 : 0.8) * speedMultiplier;
            const angle = state.time * speed;
            const ox = Math.cos(angle) * 8;
            const oy = Math.sin(angle) * 5;
            
            ctx.beginPath();
            ctx.arc(w * c.x + ox, h * c.y + oy, c.r, 0, Math.PI * 2);
            ctx.fillStyle = c.color;
            ctx.globalAlpha = 0.6;
            ctx.fill();
          });
          
          ctx.restore();
          ctx.globalAlpha = 1.0;
          break;
        }

        case 'shadow-explorer': {
          state.angle += 0.015 * speedMultiplier;
          
          // Source point (light source at center)
          const lightX = w / 2 + Math.cos(state.angle) * 20;
          const lightY = h / 2 - 10 + Math.sin(state.angle * 1.5) * 8;

          // Object box
          const objX = w / 2;
          const objY = h / 2 + 10;
          const objW = 14;
          const objH = 10;

          // Draw shadow casting representation (dark polygon extending from center opposite to light)
          const dx = objX - lightX;
          const dy = objY - lightY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const shadowExtend = 60;
          
          const sx1 = objX - objW / 2 + (dx / dist) * shadowExtend - (dy / dist) * 10;
          const sy1 = objY + objH / 2 + (dy / dist) * shadowExtend + (dx / dist) * 10;
          const sx2 = objX + objW / 2 + (dx / dist) * shadowExtend + (dy / dist) * 10;
          const sy2 = objY + objH / 2 + (dy / dist) * shadowExtend - (dx / dist) * 10;

          ctx.beginPath();
          ctx.moveTo(objX - objW / 2, objY + objH / 2);
          ctx.lineTo(sx1, sy1);
          ctx.lineTo(sx2, sy2);
          ctx.lineTo(objX + objW / 2, objY + objH / 2);
          ctx.closePath();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fill();

          // Draw object
          ctx.fillStyle = activeColor;
          ctx.fillRect(objX - objW / 2, objY - objH / 2, objW, objH);

          // Draw light source bulb
          ctx.beginPath();
          ctx.arc(lightX, lightY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a'; // yellow
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#fef08a';
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        }

        case 'random-reality': {
          // Flowing canvas painting trails
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          
          state.points.forEach((p: any) => {
            p.x += p.vx * speedMultiplier;
            p.y += p.vy * speedMultiplier;
            
            // Bounce on borders
            if (p.x < 5 || p.x > w - 5) p.vx *= -1;
            if (p.y < 5 || p.y > h - 5) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Connected laser networks
            ctx.strokeStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 6, p.y - p.vy * 6);
            ctx.stroke();
          });
          break;
        }

        case 'lucky-button': {
          // Centered beautiful retro glow button
          const scale = 1 + Math.sin(state.time * 2.5) * 0.04;
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.scale(scale, scale);

          // Golden outer rings
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#fbbf24';
          ctx.fill();
          ctx.shadowBlur = 0;

          // Inner spark
          ctx.beginPath();
          ctx.arc(-3, -3, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.restore();
          break;
        }

        case 'catch-the-dot': {
          state.timer += speedMultiplier;
          state.radar += 0.05;
          if (state.timer > 50) {
            state.timer = 0;
            state.dot.x = 25 + Math.random() * (w - 50);
            state.dot.y = 15 + Math.random() * (h - 30);
            state.radar = 0;
          }

          // Pulsing radar ring
          ctx.beginPath();
          ctx.arc(state.dot.x, state.dot.y, (state.radar % 1) * 20, 0, Math.PI * 2);
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 1 - (state.radar % 1);
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          // Glowing dot target
          ctx.beginPath();
          ctx.arc(state.dot.x, state.dot.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = activeColor;
          ctx.shadowBlur = 8;
          ctx.shadowColor = activeColor;
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        }

        case 'color-panic': {
          state.timer += speedMultiplier;
          if (state.timer > 45) {
            state.timer = 0;
            state.colorIdx = (state.colorIdx + 1) % 4;
          }

          // Render active neon word in a wrong color (color mismatch!)
          const activeWord = state.words[state.colorIdx];
          const activeTextColor = state.colors[(state.colorIdx + 1) % 4];

          ctx.fillStyle = activeTextColor;
          ctx.font = 'bold 15px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(activeWord, w / 2, h / 2);
          
          // Draw mini progress bar
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.fillRect(w / 2 - 25, h / 2 + 12, 50, 3);
          ctx.fillStyle = activeColor;
          ctx.fillRect(w / 2 - 25, h / 2 + 12, 50 * (1 - state.timer / 45), 3);
          break;
        }

        case 'one-second-challenge': {
          state.timer += speedMultiplier;
          if (state.timer > 60) {
            state.timer = 0;
            state.isStopped = !state.isStopped;
          }

          if (!state.isStopped) {
            state.timeVal = (state.timeVal + 0.016 * speedMultiplier) % 2;
          }

          // Render stopwatch text
          ctx.font = 'bold 14px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = state.isStopped && Math.abs(state.timeVal - 1.0) < 0.05 ? '#10b981' : activeColor;
          
          ctx.fillText(state.timeVal.toFixed(3) + 's', w / 2, h / 2);

          // Border indicator
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(w / 2 - 35, h / 2 - 10, 70, 20);
          break;
        }

        case 'reaction-rush': {
          state.timer += speedMultiplier;
          if (state.timer > 80) {
            state.timer = 0;
            state.state = state.state === 'waiting' ? 'ready' : 'waiting';
          }

          // Render response indicator
          ctx.fillStyle = state.state === 'ready' ? '#10b981' : '#ef4444';
          ctx.fillRect(15, 15, w - 30, h - 30);

          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#0f172a';
          ctx.fillText(state.state === 'ready' ? 'CLICK NOW!' : 'WAITING...', w / 2, h / 2);
          break;
        }

        case 'find-the-fake-emoji': {
          // Render a simple emoji/face grid
          state.grid.forEach((emoji: any) => {
            ctx.beginPath();
            ctx.arc(emoji.x, emoji.y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Eyes
            ctx.fillStyle = activeColor;
            ctx.fillRect(emoji.x - 2.5, emoji.y - 2, 1, 1.5);
            ctx.fillRect(emoji.x + 1.5, emoji.y - 2, 1, 1.5);

            // Smile vs frown (the fake blinks/frowns!)
            ctx.beginPath();
            const blinkFactor = Math.sin(state.time * 2);
            if (emoji.isFake && blinkFactor > 0.3) {
              // frown
              ctx.arc(emoji.x, emoji.y + 2.5, 2, Math.PI, 0);
            } else {
              // smile
              ctx.arc(emoji.x, emoji.y + 1, 2, 0, Math.PI);
            }
            ctx.stroke();
          });
          break;
        }

        case 'chain-reaction': {
          state.timer += speedMultiplier;
          if (state.timer > 50) {
            state.timer = 0;
            state.reacting = [
              { x: w / 2, y: h / 2, r: 2, maxR: 28 },
              { x: w / 2 - 25, y: h / 2 - 10, r: 2, maxR: 20 },
              { x: w / 2 + 25, y: h / 2 + 10, r: 2, maxR: 22 }
            ];
          }

          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          // Dots
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 2.5, 0, Math.PI * 2);
          ctx.arc(w / 2 - 25, h / 2 - 10, 2.5, 0, Math.PI * 2);
          ctx.arc(w / 2 + 25, h / 2 + 10, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Expanding wave circles
          state.reacting.forEach((circle: any) => {
            circle.r += 0.5 * speedMultiplier;
            if (circle.r < circle.maxR) {
              ctx.beginPath();
              ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
              ctx.strokeStyle = activeColor;
              ctx.lineWidth = 1.2;
              ctx.globalAlpha = 1 - (circle.r / circle.maxR);
              ctx.stroke();
              ctx.globalAlpha = 1.0;
            }
          });
          break;
        }

        case 'shape-switch': {
          state.morph += 0.015 * speedMultiplier;
          if (state.morph >= 1.0) {
            state.morph = 0;
            state.shapeIndex = (state.shapeIndex + 1) % 4;
          }

          // Morph vertices beautifully
          const getPoints = (idx: number, morphTime: number) => {
            const nextIdx = (idx + 1) % 4;
            const pts = [];
            const segments = 32;

            for (let i = 0; i < segments; i++) {
              const angle = (i * Math.PI * 2) / segments;
              
              // Start shape vertices
              let r1 = 18;
              if (idx === 1) { // square
                r1 = 18 / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
              } else if (idx === 2) { // triangle
                const a = angle + Math.PI / 2;
                r1 = 15 / Math.max(Math.cos(a), -0.5);
              } else if (idx === 3) { // star
                const isInner = i % 2 === 0;
                r1 = isInner ? 18 : 8;
              }

              // End shape vertices
              let r2 = 18;
              if (nextIdx === 1) { // square
                r2 = 18 / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
              } else if (nextIdx === 2) { // triangle
                const a = angle + Math.PI / 2;
                r2 = 15 / Math.max(Math.cos(a), -0.5);
              } else if (nextIdx === 3) { // star
                const isInner = i % 2 === 0;
                r2 = isInner ? 18 : 8;
              }

              // Interpolate
              const r = r1 + (r2 - r1) * morphTime;
              pts.push({
                x: w / 2 + Math.cos(angle) * r,
                y: h / 2 + Math.sin(angle) * r
              });
            }
            return pts;
          };

          const pts = getPoints(state.shapeIndex, state.morph);
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          break;
        }

        case 'perfect-timing': {
          state.angle += 0.02 * speedMultiplier;
          state.pulse = Math.sin(state.time * 3) * 0.15 + 1;

          // Goal zone sector
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 18, -Math.PI / 6, Math.PI / 6);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Rotating radial line indicator (needle)
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.lineTo(w / 2 + Math.cos(state.angle) * 20, h / 2 + Math.sin(state.angle) * 20);
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Core hub
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 4 * state.pulse, 0, Math.PI * 2);
          ctx.fillStyle = activeColor;
          ctx.fill();
          break;
        }

        case 'gravity-escape': {
          // Spaceship up/down jumps
          state.shipV += state.gravity * (state.time % (Math.PI * 2) > Math.PI ? 1 : -1) * speedMultiplier;
          state.shipY += state.shipV * speedMultiplier;
          if (state.shipY < 12) { state.shipY = 12; state.shipV = 0; }
          if (state.shipY > h - 12) { state.shipY = h - 12; state.shipV = 0; }

          // Obstacles scroll left
          state.obstacles.forEach((obs: any) => {
            obs.x -= 1.2 * speedMultiplier;
            if (obs.x < -10) {
              obs.x = w + 10;
              obs.y = 15 + Math.random() * (h - 30);
            }

            // Draw obstacle
            ctx.beginPath();
            ctx.arc(obs.x, obs.y, obs.size, 0, Math.PI * 2);
            ctx.fillStyle = '#64748b';
            ctx.fill();
          });

          // Draw neon ship
          ctx.beginPath();
          ctx.moveTo(25, state.shipY);
          ctx.lineTo(15, state.shipY - 5);
          ctx.lineTo(15, state.shipY + 5);
          ctx.closePath();
          ctx.fillStyle = activeColor;
          ctx.fill();

          // Engine trail particle indicators
          ctx.beginPath();
          ctx.arc(10, state.shipY + Math.sin(state.time * 4) * 2, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fb923c';
          ctx.fill();
          break;
        }

        case 'laser-maze': {
          // Render bouncing lasers and barriers
          state.lasers.forEach((laser: any) => {
            laser.pulse += 0.05 * speedMultiplier;
            const opacity = 0.4 + Math.abs(Math.sin(laser.pulse)) * 0.6;

            ctx.save();
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#ef4444';
            ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`;
            ctx.lineWidth = 1.2;
            
            ctx.beginPath();
            ctx.moveTo(laser.x1, laser.y1);
            ctx.lineTo(laser.x2, laser.y2);
            ctx.stroke();
            ctx.restore();
          });

          // Draw block nodes
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 1;
          ctx.fillRect(w / 2 - 8, h / 2 - 8, 16, 16);
          ctx.strokeRect(w / 2 - 8, h / 2 - 8, 16, 16);
          break;
        }

        default: {
          // Standard starry cosmos
          state.stars.forEach((star: any) => {
            star.x -= star.speed * speedMultiplier;
            if (star.x < 0) {
              star.x = w;
              star.y = Math.random() * h;
            }
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = activeColor;
            ctx.globalAlpha = star.r / 2;
            ctx.fill();
          });
          ctx.globalAlpha = 1.0;
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // Use IntersectionObserver to stop animations if out of screen (low CPU consumption guaranteed)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!animationRef.current) {
              animationRef.current = requestAnimationFrame(draw);
            }
          } else {
            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current);
              animationRef.current = null;
            }
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [experienceId, themeColor, isHovered]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none transition-transform duration-500 group-hover:scale-105"
      style={{ display: 'block' }}
    />
  );
};
