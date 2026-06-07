"use client";

import { motion } from "framer-motion";
import { scoreColor } from "@/lib/scoring";

/**
 * The signature Investment Score™ dial. Animated SVG arc that fills from 0 to
 * the target score on mount, with a subtle gradient tuned to the score band.
 */
export function ScoreRing({
  score,
  size = 200,
  stroke = 12,
  label = "Investment Score™",
  delay = 0.1,
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  delay?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = scoreColor(score);
  const offset = c - (score / 100) * c;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${score}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-${score})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          filter="url(#ringGlow)"
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <motion.div
          className="num text-[2.9rem] font-semibold leading-none text-white"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.3 }}
          style={{ fontSize: size * 0.26 }}
        >
          {score}
          <span className="text-mist-400" style={{ fontSize: size * 0.12 }}>
            /100
          </span>
        </motion.div>
        <div className="eyebrow mt-2">{label}</div>
      </div>
    </div>
  );
}
