"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import * as React from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Scroll-reveal wrapper. Honors prefers-reduced-motion (Section 6.B): when the
 * user opts out of motion it renders content statically with no transform.
 */
export function Reveal({
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
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
