"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Premium effect primitives for the rebuilt-site renderer. Reimplemented from
 * scratch (no third-party branding, no extra dependencies) and driven entirely
 * by the brand tokens exposed by SiteRenderer (--brand, --brand-accent,
 * --brand-surface, --brand-ink, --brand-card, --brand-radius). Every effect is
 * export-safe: the motion is CSS-keyframe or framer based, so the static HTML
 * export and the data-animate="off" kill switch stop it without breaking layout
 * (content stays visible and correctly placed). Inspired by Linear / Framer /
 * Stripe / Apple ambient detailing - subtle, expensive, never distracting.
 */

const ACCENT = (pct: number) => `color-mix(in srgb, var(--brand-accent) ${pct}%, transparent)`;

/** Soft brand-tinted overhead light. Static gradient (always visible) with an
 *  optional slow pulse; great behind a hero headline. */
export function Spotlight({ className, size = 680, opacity = 0.22 }: { className?: string; size?: number; opacity?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute left-1/2 top-[-6rem] -translate-x-1/2 rounded-full blur-3xl", className)}
      style={{ width: size, height: size * 0.62, background: `radial-gradient(closest-side, ${ACCENT(60)}, transparent)`, opacity }}
      animate={reduce ? undefined : { opacity: [opacity * 0.7, opacity, opacity * 0.7], scale: [1, 1.08, 1] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** Drifting aurora wash built from brand-tinted radial blobs. Sits behind
 *  content; the CSS drift is killed by data-animate="off" but the wash remains. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="rf-aurora absolute inset-[-25%]"
        style={{
          background: `radial-gradient(40% 50% at 20% 25%, ${ACCENT(45)} 0%, transparent 60%), radial-gradient(35% 45% at 80% 20%, color-mix(in srgb, var(--brand) 35%, transparent) 0%, transparent 60%), radial-gradient(45% 55% at 60% 80%, ${ACCENT(35)} 0%, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}

/** Falling meteor streaks, brand-accent tinted. Decorative; count kept low. */
export function Meteors({ count = 14, className }: { count?: number; className?: string }) {
  const items = React.useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: `${Math.round((i / count) * 100 + (i % 3) * 4)}%`,
        delay: `${(i % 5) * 0.8 + Math.random()}s`,
        duration: `${4 + (i % 4)}s`,
      })),
    [count]
  );
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {items.map((m, i) => (
        <span
          key={i}
          className="rf-meteor absolute top-[-10%] h-[2px] w-[2px] rounded-full"
          style={{
            left: m.left,
            background: "var(--brand-accent)",
            boxShadow: `0 0 0 1px ${ACCENT(40)}`,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}
    </div>
  );
}

/** A light that travels around a card's border (masked ring). Pair with a
 *  relatively-positioned, rounded parent. Falls back to a faint static ring. */
export function BorderBeam({ className, radius = "var(--brand-radius)" }: { className?: string; radius?: string }) {
  return (
    <span
      aria-hidden
      className={cn("rf-border-beam pointer-events-none absolute inset-0", className)}
      style={
        {
          borderRadius: radius,
          padding: "1px",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
    />
  );
}

/** Animated gradient border (the "shine" runs along the edge). Wrap a card. */
export function ShineBorder({ children, className, radius = "var(--brand-radius)" }: { children: React.ReactNode; className?: string; radius?: string }) {
  return (
    <div className={cn("relative", className)} style={{ borderRadius: radius }}>
      <span
        aria-hidden
        className="rf-shine pointer-events-none absolute inset-0"
        style={
          {
            borderRadius: radius,
            padding: "1px",
            background: `linear-gradient(110deg, transparent 25%, ${ACCENT(70)} 50%, transparent 75%)`,
            backgroundSize: "200% 100%",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          } as React.CSSProperties
        }
      />
      {children}
    </div>
  );
}

/** Infinite, seamless marquee row. Duplicates children so the loop is seamless;
 *  uses the existing @keyframes marquee (killed by data-animate / reduced motion). */
export function Marquee({ children, className, reverse, speed = 32 }: { children: React.ReactNode; className?: string; reverse?: boolean; speed?: number }) {
  return (
    <div className={cn("group flex overflow-hidden", className)}>
      {[0, 1].map((dup) => (
        <div
          key={dup}
          aria-hidden={dup === 1}
          className="animate-marquee flex shrink-0 items-center gap-10 pr-10"
          style={{ animationDuration: `${speed}s`, animationDirection: reverse ? "reverse" : "normal" }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/** Entrance blur + fade + rise. Export-safe: when SiteRenderer disables motion
 *  it sets MotionConfig reducedMotion="always", so framer renders the final
 *  (unblurred, visible) state with no JS-dependent reveal. */
export function BlurFade({ children, className, delay = 0, y = 14 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, filter: "blur(8px)", y }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
