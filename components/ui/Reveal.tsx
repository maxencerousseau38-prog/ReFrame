"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  return (
    <span
      className={`num inline-flex items-center gap-0.5 text-xs font-medium ${
        positive ? "text-bull" : "text-bear"
      }`}
    >
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
        {positive ? <path d="M3 8 L6 4 L9 8" /> : <path d="M3 4 L6 8 L9 4" />}
      </svg>
      {positive ? "+" : ""}
      {value.toFixed(1)}
      {suffix}
    </span>
  );
}
