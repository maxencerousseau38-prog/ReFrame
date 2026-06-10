"use client";

import { motion, useReducedMotion } from "framer-motion";
import * as React from "react";

/**
 * Heavy blur-up scroll entrance: content rises and sharpens as it enters the
 * viewport. (high-end-visual-design 5.C) Honors prefers-reduced-motion.
 */
export function BlurReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
