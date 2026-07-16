"use client";

import * as React from "react";
import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * ScrollScaleReveal — the ONE reusable, ReFrame-aligned idea distilled from a
 * "zoom parallax" gallery (21st.dev): a focal element that scales gently as it
 * scrolls through a pinned stage. Everything spectacular about the source was
 * rejected — no Lenis smooth-scroll dependency, no 7-image hardcoded cluster,
 * no 1→9 zoom-jack. This is restrained (1→1.35 by default, "intemporel, never
 * spectacular"), fully responsive (single focal child, no vw-positioned magic),
 * and reduced-motion-safe (the scale is frozen when the user prefers less
 * motion). Transform-only → cheap on the GPU.
 *
 * Universal: a Landing hero/media reveal, a template section, a preview frame
 * that lifts on scroll. Wrap any content (an <img>, a BrowserFrame, a card).
 */
export interface ScrollScaleRevealProps {
  children: React.ReactNode;
  /** Scale at the start of the track. Default 1. */
  from?: number;
  /** Scale at the end of the track. Kept restrained by default (1.35). */
  to?: number;
  /** Height of the scroll track in vh (how long the reveal lasts). Default 200. */
  heightVh?: number;
  className?: string;
}

export function ScrollScaleReveal({
  children,
  from = 1,
  to = 1.35,
  heightVh = 200,
  className,
}: ScrollScaleRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Frozen to `from` when reduced-motion is requested — no animation at all.
  const scale = useTransform(scrollYProgress, [0, 1], [from, reduce ? from : to]);

  return (
    <div ref={ref} style={{ height: `${heightVh}vh` }} className={cn("relative", className)}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div style={reduce ? undefined : { scale }} className="flex h-full w-full items-center justify-center will-change-transform">
          {children}
        </motion.div>
      </div>
    </div>
  );
}
