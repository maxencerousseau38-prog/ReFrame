/**
 * Motion Design Intelligence — animation as an expression of personality.
 *
 * Motion is not decoration; it is body language. The Curator moves slowly,
 * softly, rarely. The Challenger moves fast, far, with force. The Host moves
 * warmly and naturally. This engine turns a BrandPersonality into a concrete
 * MotionDirection — durations, easing, travel distance, stagger, hover
 * behaviour — that the renderer applies to reveals, transitions, hover,
 * micro-interactions, CTAs, nav, cards and images. Deterministic; derived, never
 * guessed.
 */

import type { BrandPersonality } from "./brand-personality";

export interface MotionDirection {
  /** Overall energy of the motion system. */
  intensity: "none" | "subtle" | "balanced" | "expressive";
  /** Base reveal / transition duration, seconds. */
  duration: number;
  /** Micro-interaction (hover) duration, seconds. */
  hoverDuration: number;
  /** Framer cubic-bezier control points. */
  ease: [number, number, number, number];
  /** Same curve as a CSS string, for CSS transitions/hover. */
  easeCss: string;
  /** Reveal travel distance (translateY), px. */
  revealDistance: number;
  /** Delay between staggered children, seconds. */
  stagger: number;
  /** Hover lift, px. */
  hoverLift: number;
  /** Hover scale, e.g. 1.03. */
  hoverScale: number;
  /** Whether hero/media may use a slow parallax. */
  parallax: boolean;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const round2 = (n: number) => Math.round(n * 100) / 100;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

const STILL: MotionDirection = {
  intensity: "none",
  duration: 0,
  hoverDuration: 0.12,
  ease: [0.25, 0.46, 0.45, 0.94],
  easeCss: "cubic-bezier(0.25,0.46,0.45,0.94)",
  revealDistance: 0,
  stagger: 0,
  hoverLift: 0,
  hoverScale: 1,
  parallax: false,
};

/**
 * Derive the motion system from the brand's temperament.
 *
 * - energy governs SPEED (fast vs slow) and stagger,
 * - boldness governs TRAVEL (far vs restrained) and hover force,
 * - sophistication governs the EASING (soft/cinematic vs plain),
 * - warmth softens the curve.
 *
 * `motionLevel` (0–3, from the DNA) is the ceiling: level 0 → no motion.
 */
export function deriveMotionDirection(personality: BrandPersonality, motionLevel: number): MotionDirection {
  if (motionLevel <= 0) return STILL;

  const { boldness, energy, sophistication, warmth } = personality;

  // Speed: high energy → quick; serene → slow and considered.
  const duration = round2(clamp(0.92 - energy * 0.0052, 0.34, 0.95));
  const hoverDuration = round2(clamp(duration * 0.3, 0.09, 0.28));

  // Travel + force: bold, energetic brands move far and lift hard.
  const revealDistance = Math.round(clamp(6 + energy * 0.16 + boldness * 0.08, 6, 30));
  const stagger = round3(clamp(0.03 + energy * 0.0006, 0.03, 0.1));
  const hoverLift = round2(clamp(1 + energy * 0.05 + boldness * 0.02, 1, 8));
  const hoverScale = round3(1 + clamp(boldness * 0.0004 + energy * 0.0002, 0, 0.05));

  // Easing: sophistication buys a soft, cinematic curve; energy a snappy decisive
  // one; warmth a gentle natural one; otherwise the house standard.
  let ease: [number, number, number, number];
  if (sophistication >= 62 && energy <= 52) ease = [0.22, 1, 0.36, 1]; // soft expo-out, elegant
  else if (energy >= 68) ease = [0.16, 1, 0.3, 1]; // decisive, fast settle
  else if (warmth >= 60) ease = [0.4, 0, 0.2, 1]; // natural, welcoming
  else ease = [0.25, 0.46, 0.45, 0.94]; // house standard

  const parallax = motionLevel >= 2 && (sophistication >= 58 || energy >= 72);

  const intensity: MotionDirection["intensity"] =
    energy < 34 ? "subtle" : energy < 62 ? "balanced" : "expressive";

  return {
    intensity,
    duration,
    hoverDuration,
    ease,
    easeCss: `cubic-bezier(${ease.join(",")})`,
    revealDistance,
    stagger,
    hoverLift,
    hoverScale,
    parallax,
  };
}
