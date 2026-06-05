"use client";

/**
 * Centralised GSAP setup for DriveOS.
 *
 * All formerly-Club plugins (SplitText, DrawSVG, MorphSVG, ScrambleText, Flip…)
 * ship for free in the public `gsap` package since v3.13, so we can import and
 * register them here once and reuse everywhere.
 *
 * Performance / a11y principles applied across the app:
 *  - animate transform/opacity only (compositor-friendly, 60fps)
 *  - drive intro/scroll states with gsap.matchMedia() so we honour
 *    prefers-reduced-motion automatically
 *  - never hide content with CSS; hide it via gsap.set inside the
 *    no-preference branch so reduced-motion / no-JS users always see it
 */

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

// Guard against double-registration during Fast Refresh / SSR hydration.
if (typeof window !== "undefined" && !(window as any).__driveos_gsap) {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);
  // A snappier, more "designed" default for the whole app.
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
  (window as any).__driveos_gsap = true;
}

export { gsap, useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin };
