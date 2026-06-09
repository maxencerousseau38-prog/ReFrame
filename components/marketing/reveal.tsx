"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  /** Délai d'apparition en secondes (pour cascader plusieurs éléments). */
  delay?: number;
  /** Décalage vertical initial. */
  y?: number;
}

/** Apparition douce au défilement (fade + translate), respecte prefers-reduced-motion. */
export function Reveal({ children, delay = 0, y = 16, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
