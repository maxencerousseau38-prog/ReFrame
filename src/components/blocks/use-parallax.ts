"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
function ensureRegistered() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

/**
 * Find the nearest scrollable ancestor so ScrollTrigger tracks the right
 * scroller. The published site scrolls the window; the result-page preview
 * scrolls a clamped inner container. Returns `undefined` for the window (the
 * ScrollTrigger default), or the element otherwise.
 */
function scrollParent(el: HTMLElement | null): HTMLElement | undefined {
  let node = el?.parentElement;
  while (node) {
    const oy = getComputedStyle(node).overflowY;
    if ((oy === "auto" || oy === "scroll") && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return undefined;
}

/**
 * Subtle scroll-linked parallax. Drifts the target vertically (yPercent) as it
 * passes through the scroller, tied 1:1 to scroll position (scrub + ease none).
 *
 * The target must live inside an `overflow-hidden` frame and be over-sized
 * (e.g. `-inset-[15%]`) so the drift never exposes an edge. No-ops under
 * prefers-reduced-motion. Cleans itself up on unmount via gsap.context().
 */
export function useParallax(ref: React.RefObject<HTMLElement | null>, amount = 10) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensureRegistered();
    const scroller = scrollParent(el);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              scroller,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    });
    return () => ctx.revert();
  }, [ref, amount]);
}
