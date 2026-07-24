/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Experience } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'brain',
    name: 'Brain',
    description: 'Cognitive exercise, memory, and spatial thinking sandbox tools.',
    iconName: 'Brain',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    hoverBg: 'hover:bg-indigo-500/20'
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Interactive simulations of physical systems, optics, and mechanics.',
    iconName: 'Atom',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    hoverBg: 'hover:bg-emerald-500/20'
  },
  {
    id: 'space',
    name: 'Space',
    description: 'Explore celestial physics, orbital structures, and cosmic creation.',
    iconName: 'Orbit',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    hoverBg: 'hover:bg-cyan-500/20'
  },
  {
    id: 'visual',
    name: 'Visual',
    description: 'Mesmerizing light mechanics, shadows, and eye-opening graphics.',
    iconName: 'Sparkles',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    hoverBg: 'hover:bg-rose-500/20'
  },
  {
    id: 'random',
    name: 'Random',
    description: 'Unpredictable mathematical noise, chaos, and physics sandboxes.',
    iconName: 'Dices',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    hoverBg: 'hover:bg-orange-500/20'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Generative art, cellular systems, and harmonious design playgrounds.',
    iconName: 'Palette',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    hoverBg: 'hover:bg-teal-500/20'
  },
  {
    id: 'experiments',
    name: 'Experiments',
    description: 'High-concept prototypes, interactive cell loops, and physics tests.',
    iconName: 'FlaskConical',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    hoverBg: 'hover:bg-violet-500/20'
  },
  {
    id: 'logic',
    name: 'Logic',
    description: 'Boolean networks, gear systems, and cause-effect reactors.',
    iconName: 'Cpu',
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/10',
    borderColor: 'border-fuchsia-500/20',
    hoverBg: 'hover:bg-fuchsia-500/20'
  },
  {
    id: 'discovery',
    name: 'Discovery',
    description: 'Interactive maps of ideas, exploration, and spatial optics.',
    iconName: 'Compass',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20',
    hoverBg: 'hover:bg-sky-500/20'
  },
  {
    id: 'fun',
    name: 'Fun',
    description: 'Entertaining interactive toys, lucky clickers, and playful physics.',
    iconName: 'PartyPopper',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    hoverBg: 'hover:bg-orange-500/20'
  }
];

const RAW_EXPERIENCES: Experience[] = [
  {
    id: 'lucky-button',
    title: 'Lucky Button',
    slug: '/lucky-button',
    description: 'A premium interactive sandbox centered around one glowing button. Trigger over 50 random physical and visual events.',
    longDescription: 'Welcome to the ultimate curiosity reactor. Centered around a single, highly animated glowing button, each press unleashes one of over 50 completely unique random physical, cosmetic, or environmental events inside the chamber. Witness gravity inversion, confetti showers, neon matrix grids, particle storms, button morphs, and chaotic physics. Challenge your lucky streak and explore deep mathematical unpredictability.',
    category: 'fun',
    duration: '30 seconds – Unlimited',
    difficulty: 'Easy',
    featured: true,
    trending: true,
    themeColor: 'orange',
    isNew: true,
    learningOutcomes: [
      'Analyze the dynamics of mathematical probability distributions.',
      'Visualize physical state transitions, such as gravity inversion and dilation.',
      'Explore the psychological feedback loops of reward systems and randomized surprises.'
    ],
    howToPlay: 'Press the giant glowing Lucky Button in the center to trigger a random event. Check the dynamic title and side console log to read about what event occurred, and use the dashboard controls to reset or copy your lucky streak stats.'
  },
  {
    id: 'gravity-lab',
    title: 'Can You Control Gravity?',
    slug: '/gravity',
    description: 'An interactive gravity sandbox. Spawn colorful particles, warp spacetime, and control orbital mechanics.',
    longDescription: 'Explore the limits of physical attraction in a premium dark-themed sandbox. Spawn thousands of colorful glowing particles, drop massive gravity wells to warp their trajectories, and watch complex orbits emerge in real time. Modify constants like gravity strength, particle density, and atmospheric resistance to construct perfectly stable solar systems or beautiful cosmic chaos.',
    category: 'science',
    duration: '2–5 minutes',
    difficulty: 'Easy',
    featured: true,
    trending: true,
    themeColor: 'indigo',
    isNew: true,
    learningOutcomes: [
      'Understand how mass curves local spacetime and guides orbits.',
      'Visualize Keplerian trajectories and orbital decay under gas drag.',
      'Explore multi-body chaotic physical attractions in a dynamic vacuum.'
    ],
    howToPlay: 'Tap or click anywhere in the vacuum chamber to place a gravity well. Tap an existing well to collapse and remove it. Adjust gravity strength, particle density, or atmospheric drag sliders to manipulate physical constants, and inject bursts of cosmic dust in real time.'
  },
  {
    id: 'infinite-machine',
    title: 'Infinite Machine',
    slug: 'infinite-machine',
    description: 'Construct complex procedural gear works and auto-generating systems.',
    longDescription: 'Infinite Machine is a visual sandbox for mechanical logic. Assemble interlocking gear trains, synchronize rotational ratios, and watch cause-and-effect cascade infinitely. Turn variables to explore mechanical automation and gear ratios.',
    category: 'logic',
    duration: '8 mins',
    difficulty: 'Hard',
    featured: false,
    trending: true,
    themeColor: 'amber',
    isNew: true,
    learningOutcomes: [
      'Learn the proportional mechanics of gear teeth and rotational speed.',
      'Visualize procedural chain reactions and torque distribution.',
      'Deconstruct logical logic chains using rotational logic.'
    ],
    howToPlay: 'Select a gear size on the console. Drag your cursor or move around the sandbox to connect new gears into the turning engine. Spin the primary driver wheel and observe how kinetic force spreads across the infinite sequence.'
  },
  {
    id: 'time-warp',
    title: 'Time Warp',
    slug: 'time-warp',
    description: 'Bend space-time dimensions and see particle fields interact under relative speeds.',
    longDescription: 'Time Warp is a premium physics toy that visually models temporal relativity. Control the central time dilation vector to speed up, freeze, or reverse the path of an ambient light-cascade field. Experience visual relativity without heavy math.',
    category: 'science',
    duration: '6 mins',
    difficulty: 'Medium',
    featured: true,
    trending: false,
    themeColor: 'violet',
    isNew: false,
    learningOutcomes: [
      'Grasp the concepts of velocity-based time dilation.',
      'Interact with wave-particle dual behaviors visually.',
      'Understand how speed changes are mapped on temporal graphs.'
    ],
    howToPlay: 'Drag the temporal dilation slider to adjust relativity. Left-click and drag on the canvas to distort the direction of the light waves. Toggle between "Wavelength" and "Particle Stream" to observe wave propagation.'
  },
  {
    id: 'planet-creator',
    title: 'Planet Creator',
    slug: 'planet-creator',
    description: 'Seed atmospheres, design exoplanets, and watch orbital physics in real-time.',
    longDescription: 'Planet Creator is a micro-terraforming simulation. Balance core heat, seed atmospheric density, and establish rings. Witness how chemical ratios automatically determine the exoplanet’s color signature, habitability score, and seasonal patterns.',
    category: 'space',
    duration: '10 mins',
    difficulty: 'Easy',
    featured: false,
    trending: true,
    themeColor: 'cyan',
    isNew: false,
    learningOutcomes: [
      'Understand atmospheric compositions and thermal retention.',
      'Deconstruct planetary rings, orbital spacing, and tidal forces.',
      'Analyze the habitable zone limits of exoplanetary orbits.'
    ],
    howToPlay: 'Use sliders to manage Carbon Dioxide, Oxygen, and Water Vapor layers. Use the cursor to place asteroid rings. Launch small companion moons and evaluate your customized planet habitable rating.'
  },
  {
    id: 'light-playground',
    title: 'Light Playground',
    slug: 'light-playground',
    description: 'Refract and split white light beams through high-fidelity prisms and lenses.',
    longDescription: 'Light Playground is an elegant light physics laboratory. Arrange mirrors, prisms, and light emitters inside a virtual darkroom. Adjust index constants to refract beams and split white light into full spectral wavelengths with absolute precision.',
    category: 'science',
    duration: '7 mins',
    difficulty: 'Medium',
    featured: true,
    trending: false,
    themeColor: 'emerald',
    isNew: true,
    learningOutcomes: [
      'Learn the laws of reflection (angle of incidence equals angle of reflection).',
      'Understand refractive index variables and dispersion physics.',
      'Visualize how focal points shift in biconvex and biconcave lenses.'
    ],
    howToPlay: 'Drag and rotate mirrors or glass prisms across the optical grid. Click on the central laser source to shift beam colors. Aim your beams at targeted light collectors to complete spectral chromatic combinations.'
  },
  {
    id: 'pixel-universe',
    title: 'Pixel Universe',
    slug: 'pixel-universe',
    description: 'Paint cellular automata and watch beautiful self-replicating procedural life emerge.',
    longDescription: 'Pixel Universe is an advanced cellular automata simulator. Using simple rules, paint organic pixel life on an infinite grid and watch patterns emerge. Change the laws of physics to design custom virtual biosystems.',
    category: 'creative',
    duration: '5 mins',
    difficulty: 'Hard',
    featured: false,
    trending: false,
    themeColor: 'rose',
    isNew: true,
    learningOutcomes: [
      'Understand emergent behavior from basic cellular rules (Conway’s Life).',
      'Discover grid-based systems and seed generation patterns.',
      'Analyze how mathematical constraints simulate natural organic growth.'
    ],
    howToPlay: 'Draw or tap on the cellular matrix to place live cells. Choose a physics ruleset from the dropdown. Press Play to animate the generations, or press Step to observe updates frame-by-frame.'
  },
  {
    id: 'decision-reactor',
    title: 'Decision Reactor',
    slug: 'decision-reactor',
    description: 'Visualize critical thinking paths, cause-effect systems, and probability cascades.',
    longDescription: 'Decision Reactor models mathematical probability and branching decisions in real-time. Drop glowing logic marbles through tree hierarchies, alter gate configurations dynamically, and watch chaos converge into predictable Gaussian distributions.',
    category: 'logic',
    duration: '6 mins',
    difficulty: 'Easy',
    featured: false,
    trending: false,
    themeColor: 'fuchsia',
    isNew: false,
    learningOutcomes: [
      'Deconstruct the Galton Board probability bell-curve (Gaussian distribution).',
      'Understand binary decision-making and logic gating.',
      'Visualize the Law of Large Numbers through iterative statistics.'
    ],
    howToPlay: 'Click the "Inject Particles" button to release logic marbles. Click on individual nodes to flip their logic gates (Left/Right/Equal). Adjust gravity and funnel speeds to see immediate distribution shifts.'
  },
  {
    id: 'color-lab',
    title: 'Color Lab',
    slug: 'color-lab',
    description: 'Explore color physics, mix custom spectrums, and evaluate harmony metrics.',
    longDescription: 'Color Lab is a high-fidelity visual workspace designed for creatives and UI artists. Adjust optical spectrums, analyze contrast scores, and experience how human retinas perceive color balance under distinct lighting types.',
    category: 'creative',
    duration: '4 mins',
    difficulty: 'Easy',
    featured: false,
    trending: true,
    themeColor: 'teal',
    isNew: false,
    learningOutcomes: [
      'Learn the difference between Additive (RGB) and Subtractive (CMYK) blending.',
      'Understand accessibility constraints and real-time contrast ratios.',
      'Explore harmonious math relations (triadic, split-complementary).'
    ],
    howToPlay: 'Use the interactive color wheel to pick your base wavelength. Toggle harmony modes to automatically align matching palettes. Drag the contrast analyzer cards over backgrounds to test accessibility standards.'
  },
  {
    id: 'shadow-explorer',
    title: 'Shadow Explorer',
    slug: 'shadow-explorer',
    description: 'Position custom obstructions and learn the raycasting physics of shadows.',
    longDescription: 'Shadow Explorer is a beautiful 2D vector raycaster. Play with multiple light emitters and move geometric structures to watch realistic, real-time penumbra and umbra shadows cast. Perfect for learning computer graphics principles.',
    category: 'discovery',
    duration: '8 mins',
    difficulty: 'Hard',
    featured: true,
    trending: false,
    themeColor: 'sky',
    isNew: false,
    learningOutcomes: [
      'Visualize vector-ray intersection points in real-time computing.',
      'Differentiate between soft shadow boundaries (penumbras) and hard centers.',
      'Understand light intensity degradation based on inverse-square physics.'
    ],
    howToPlay: 'Drag light sources and place barriers on the vector field. Modify the light radius and emission angle from the side panel. Observe how changing source sizes alters shadow hardness.'
  },
  {
    id: 'random-reality',
    title: 'Random Reality',
    slug: 'random-reality',
    description: 'Harness procedural noise and mathematical chaos to craft beautiful generative art.',
    longDescription: 'Random Reality turns mathematical chaos into stunning visual art. Tweak Perlin noise scales, particle counts, and brush weights to generate custom wallpaper art. Learn how procedural terrain is generated in modern game engines.',
    category: 'random',
    duration: '5 mins',
    difficulty: 'Medium',
    featured: false,
    trending: false,
    themeColor: 'orange',
    isNew: true,
    learningOutcomes: [
      'Differentiate between uniform random noise and Perlin/Simplex noise fields.',
      'Understand coordinate grids, frequencies, and vector flow fields.',
      'Observe how mathematical math shapes modern game environments.'
    ],
    howToPlay: 'Move your mouse to shift the force vectors of the active flow grid. Adjust frequency, amplitude, and particle velocity sliders on the console. Click the "Regenerate Seed" button to create a new universe.'
  },
  {
    id: 'dont-press-the-red-button',
    title: "Don't Press the Red Button",
    slug: '/dont-press-the-red-button',
    description: "The ultimate test of self-control. Tap the forbidden giant red button to unleash funny, absurd, and chaotic events.",
    longDescription: "Welcome to the forbidden zone. You are strictly commanded NOT to press the giant red button. Tap it anyway to trigger over 30 completely unique chaotic responses—including button teleportation, glitch flashes, gravity flips, fake alerts, and emoji storms. Fast-paced, addictive, and purely hilarious.",
    category: 'fun',
    duration: '30 seconds – endless',
    difficulty: 'Easy',
    featured: true,
    trending: true,
    themeColor: 'rose',
    isNew: true,
    learningOutcomes: [
      'Observe the psychological mechanics of reverse psychology.',
      'Explore real-time visual physics feedback loops.',
      'Encounter high-speed, unpredictable state transitions.'
    ],
    howToPlay: 'Strictly DO NOT press the giant red button in the center. If you must disobey, tap it to see what chaotic anomaly occurs. Use the reset control to restore order.'
  },
  {
    id: 'catch-the-dot',
    title: 'Catch The Dot',
    slug: '/catch-the-dot',
    description: 'Tap the glowing blue dot as it teleports. Ramps up in speed and shrinks as you score.',
    longDescription: 'A fast, addictive, highly playful micro-reflex game. Tap the glowing blue dot before it teleports. Every 5 points, the speed increases and the size shrinks. Every 10 points, the background cycles and particles explode. Avoid miss-clicks!',
    category: 'fun',
    duration: '30 seconds',
    difficulty: 'Easy',
    featured: true,
    trending: true,
    themeColor: 'cyan',
    isNew: true,
    learningOutcomes: [
      'Deconstruct the limits of real-time human reflex speeds.',
      'Visualize physical state transitions and scaling vectors.',
      'Observe dynamic reward architectures and high-velocity feedback loop systems.'
    ],
    howToPlay: 'Tap the blue glowing dot as quickly as possible. Successful taps increase your score, speed, and reduce the size of the target. Missed taps decrease your score and shake the screen.'
  },
  {
    id: 'color-panic',
    title: 'Color Panic',
    slug: '/color-panic',
    description: 'Tap the TEXT COLOR of the word, not the written word. Fast-paced Stroop reflex test.',
    longDescription: 'A frantic test of cognitive speed and hand-eye focus. Can you resist reading the word and focus strictly on its color? Ramps up in speed, introduces combo celebrations, and adds more colors as you score.',
    category: 'fun',
    duration: '45 seconds',
    difficulty: 'Medium',
    featured: true,
    trending: true,
    themeColor: 'rose',
    isNew: true,
    learningOutcomes: [
      'Experience the Stroop Effect and cognitive processing friction.',
      'Train rapid decision filtering under high-speed conditions.',
      'Observe human neural latency limits in game design.'
    ],
    howToPlay: 'Tap the button matching the actual text color of the displayed word, NOT the text spelling itself.'
  },
  {
    id: 'one-second-challenge',
    title: 'One Second Challenge',
    slug: '/one-second-challenge',
    description: 'Press stop when you think exactly 1.000 second has passed. Test your internal clock.',
    longDescription: 'An intense, arcade-style rhythm and timing challenge. Can you stop the hidden timer at precisely 1.000 second? Hit the exact millisecond to trigger golden particle explosions and earn 5 stars!',
    category: 'fun',
    duration: '1 second',
    difficulty: 'Hard',
    featured: true,
    trending: true,
    themeColor: 'cyan',
    isNew: true,
    learningOutcomes: [
      'Deconstruct human internal rhythm and clock precision.',
      'Analyze variance patterns in rapid motor-response systems.',
      'Test neural latency and visual-motor feedback loops.'
    ],
    howToPlay: 'Press START to launch the hidden timer. Keep track of the elapsed time in your head and tap STOP when you believe exactly 1.000 second has elapsed.'
  },
  {
    id: 'reaction-rush',
    title: 'Reaction Rush',
    slug: '/reaction-rush',
    description: 'Measure your true human reaction speed in milliseconds. Fast-paced, high-fidelity reflex test.',
    longDescription: 'An ultra-responsive reflex testing machine. Wait for the green flash and tap as fast as humanly possible. Features real-time precision calculation, detailed analytics, reward feedback tiers, and haptic support.',
    category: 'fun',
    duration: '30-60s',
    difficulty: 'Easy',
    featured: true,
    trending: true,
    themeColor: 'emerald',
    isNew: true,
    learningOutcomes: [
      'Evaluate millisecond-level visual processing speeds.',
      'Record synaptic motor latency spikes.',
      'Analyze variance curves across consecutive neural triggers.'
    ],
    howToPlay: 'Tap START to begin. Wait for the screen to turn bright green, then tap immediately. Do not tap too early!'
  },
  {
    id: 'find-the-fake-emoji',
    title: 'Find The Fake Emoji',
    slug: '/find-the-fake-emoji',
    description: 'Find the one slightly different emoji hidden in the grid before the time runs out.',
    longDescription: 'An addictive, fast-paced cognitive training game that measures visual search speed and pattern recognition. Spot the single different emoji in an expanding grid of look-alikes. Difficulty scales rapidly with larger grid dimensions, subtle changes, and shrinking time windows.',
    category: 'fun',
    duration: '45 seconds',
    difficulty: 'Easy',
    featured: true,
    trending: true,
    themeColor: 'indigo',
    isNew: true,
    learningOutcomes: [
      'Deconstruct visual attention spans and pattern-matching efficiency.',
      'Exercise selective attention and inhibit cognitive distractors.',
      'Measure changes in search latency as visual complexity increases.'
    ],
    howToPlay: 'Look closely at the grid of emojis. Spot the single emoji that is slightly different from the rest and tap/click it. Each correct tap scores +1 and advances you to the next grid with more emojis and subtler differences. Incorrect clicks lose 2 seconds!'
  },
  {
    id: 'chain-reaction',
    title: 'Chain Reaction',
    slug: '/chain-reaction',
    description: 'Trigger a cascading energy explosion. Detonate moving colorful glowing orbs with only one single tap!',
    longDescription: 'A high-impact physics-based arcade game simulating atomic chain reactions. Colorful neon glowing energy orbs bounce smoothly around the screen. Tap once to deploy a expanding gravity shockwave. Bouncing elements catching the blast wave will detonate, launching further expanding energy waves. Your target scales with levels — can you trigger the ultimate master cascade?',
    category: 'fun',
    duration: '60 seconds',
    difficulty: 'Medium',
    featured: true,
    trending: true,
    themeColor: 'rose',
    isNew: true,
    learningOutcomes: [
      'Observe physical kinetic chain reactions and ripple mechanics.',
      'Refine spatial timing and anticipation of path intersections.',
      'Engage in tactical positioning to maximize cascade yield.'
    ],
    howToPlay: 'Colorful glowing energy orbs are moving around the screen. Tap anywhere to set off a single expanding blast wave. Any moving orb that touches an active explosion will also detonate and create its own expanding blast wave. Chain together explosions to reach the level target!'
  },
  {
    id: 'shape-switch',
    title: 'Shape Switch',
    slug: '/shape-switch',
    description: 'Match rapidly switching neon glowing shapes to buttons. A fast-paced cognitive coordination reflex challenge.',
    longDescription: 'An ultra-fast geometric matching speedrun. Colorful neon shapes (Circle, Square, Triangle, Hexagon) light up in the center stage. Tap the matching bottom action button as rapidly as possible before the timer expires or your 3 lives run dry. Difficulty scales seamlessly from Easy up to an Impossible speed with rotating, scaling, wobbling center elements, and scrambled action button orders.',
    category: 'fun',
    duration: '45 Seconds',
    difficulty: 'Easy',
    featured: true,
    trending: true,
    themeColor: 'fuchsia',
    isNew: true,
    learningOutcomes: [
      'Sharpen visual-motor cognitive coordination and speed.',
      'Exercise selective attention under scrambled button distractions.',
      'Evaluate spatial perception and rapid physical response times.'
    ],
    howToPlay: 'A glowing shape will appear in the center. Tap the button at the bottom that matches that shape. Keep a high streak to trigger satisfying combo chimes, but be careful: wrong taps lose you a life. Can you handle the chaos as difficulty spikes?'
  },
  {
    id: 'perfect-timing',
    title: 'Perfect Timing',
    slug: '/perfect-timing',
    description: 'Tap exactly when the glowing indicator enters the green PERFECT zone. Simple, fast-paced, and highly addictive.',
    longDescription: 'A glowing indicator moves continuously across a horizontal bar. The player must TAP exactly when the indicator enters the GREEN PERFECT ZONE. Ramps up in speed, shrinks the perfect target, changes directions, and flashes unpredictably to test your coordination.',
    category: 'fun',
    duration: '45 seconds',
    difficulty: 'Easy',
    featured: true,
    trending: true,
    themeColor: 'indigo',
    isNew: true,
    learningOutcomes: [
      'Refine motor-response latency and precision hand-eye timing.',
      'Deconstruct visual-motor tracking speeds across a continuous vector path.',
      'Analyze rapid focus performance under scaling speed and size factors.'
    ],
    howToPlay: 'Tap anywhere on the screen exactly when the glowing indicator enters the center green PERFECT zone. Accumulate points and high streaks while avoiding misses, and catch floating power-up bubbles for extra help!'
  },
  {
  id: 'perfect-cut',
  title: 'Perfect Cut',
  slug: '/perfect-cut',
  description: 'Stop the moving block exactly in the center to score points.',
  longDescription: 'A precision timing challenge where every tap matters. Hit the exact center, build combos, beat your high score, and master perfect timing.',
  category: 'fun',
  duration: 'Endless',
  difficulty: 'Easy',
  featured: true,
  trending: true,
  themeColor: 'indigo',
  isNew: true,
  learningOutcomes: [
    'Improve reaction time.',
    'Develop precision and focus.',
    'Sharpen hand-eye coordination.'
  ],
  howToPlay: 'Tap anywhere to stop the moving block exactly in the center. The closer you are, the higher your score.'
},
{
    id: 'gravity-escape',
    title: 'Gravity Escape',
    slug: '/gravity-escape',
    description: 'Control a glowing spaceship in endless survival. Tap to reverse gravity, dodge asteroids, and catch power-ups!',
    longDescription: 'Prepare for high-speed cosmic escape. Guide a glowing spaceship through a dense asteroid field. The physics environment constantly exerts gravity pulling you UP or DOWN. Tap anywhere to instantly invert gravity. Master orbital momentum, dodge normal, fast, and giant slow obstacles, and trigger shield, magnet, or slow-motion fields to survive. Speed and frequency increase every 15 seconds, culminating in pure Chaos Mode!',
    category: 'fun',
    duration: 'Endless Survival',
    difficulty: 'Hard',
    featured: true,
    trending: true,
    themeColor: 'indigo',
    isNew: true,
    learningOutcomes: [
      'Evaluate gravitational vector fields and rapid trajectory correction.',
      'Anticipate multi-speed asteroid intercept paths.',
      'Deploy localized shields and slow-motion temporal fields.'
    ],
    howToPlay: 'The game starts instantly. The ship drifts continuously due to gravity. Tap or click anywhere on the screen to instantly flip gravity (UP/DOWN). Avoid asteroid collisions. Collect power-ups to activate shields, magnet, slow motion, or double scoring.'
  },
  {
    id: 'laser-maze',
    title: 'Laser Maze',
    slug: '/laser-maze',
    description: 'Control a glowing energy orb with smooth dragging. Dodge horizontal, vertical, rotating, and sweeping neon lasers in endless survival!',
    longDescription: 'Enter the grid of high-intensity laser hazards. Control a beautiful glowing energy orb that follows your drag coordinates smoothly. Watch out for flashing warning lines that anticipate laser blasts, and deploy tactical quick-reflex dodges. Avoid single, double, rotating, sweeping, pulsing, crossing, and grid lasers. Collect shields, slow motion, double score, extra lives, and high-energy dash boosts to conquer the neon chaos as difficulty scales every 15 seconds up to the Impossible Legend rank!',
    category: 'fun',
    duration: 'Endless Survival',
    difficulty: 'Hard',
    featured: true,
    trending: true,
    themeColor: 'fuchsia',
    isNew: true,
    learningOutcomes: [
      'Understand spatial projection and hazard warning times.',
      'Refine millisecond-precision continuous path-planning reflexes.',
      'Analyze rotating and translating geometric collision bounds.'
    ],
    howToPlay: 'Drag your finger or mouse anywhere on the screen. Your glowing energy orb will follow your movement smoothly. Watch out for the red hazard warning lines: they indicate where lasers will fire after 0.8 seconds. Dodge the lasers, catch neon power-up gems, and survive as long as you can!'
  }
];

// Reorder the experiences based on game quality and engagement
const ORDER_MAP: Record<string, number> = {
  'perfect-timing': 1,
  'perfect-cut': 2,
  'shape-switch': 3,
  'reaction-rush': 4,
  'catch-the-dot': 5,
  'color-panic': 6,
  'find-the-fake-emoji': 7,
  'one-second-challenge': 8,
  'chain-reaction': 9,
  'gravity-escape': 10,
  'lucky-button': 11,
  'dont-press-the-red-button': 12,
  'laser-maze': 13,
  'gravity-lab': 14,
  'infinite-machine': 15,
  'time-warp': 16,
  'planet-creator': 17,
  'light-playground': 18,
  'pixel-universe': 19,
  'decision-reactor': 20,
  'color-lab': 21,
  'shadow-explorer': 22,
  'random-reality': 23,
};

// Also configure featured property only for top 3
export const EXPERIENCES: Experience[] = RAW_EXPERIENCES.map((exp) => ({
  ...exp,
  featured: exp.id === 'perfect-timing' || exp.id === 'shape-switch' || exp.id === 'reaction-rush',
})).sort((a, b) => {
  const orderA = ORDER_MAP[a.id] || 99;
  const orderB = ORDER_MAP[b.id] || 99;
  return orderA - orderB;
});
