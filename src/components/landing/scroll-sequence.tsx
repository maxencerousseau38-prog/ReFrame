"use client";

import * as React from "react";
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";

const FRAMES = 48;
const pad = (n: number) => String(n).padStart(4, "0");
const src = (i: number) => `/seq/${pad(i)}.jpg`;

/**
 * Scroll-scrubbed image sequence (the Apple technique): the page pins and the
 * sequence advances with scroll, drawn to a canvas for smoothness. Frames are
 * preloaded; reduced-motion users get a single static frame.
 */
export function ScrollSequence() {
  const reduce = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imgs = React.useRef<HTMLImageElement[]>([]);
  const loaded = React.useRef(0);
  const [ready, setReady] = React.useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const draw = React.useCallback((idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ok = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0;
    let img = imgs.current[idx];
    // If the exact frame is not loaded yet, fall back to the nearest loaded one
    // so the canvas is never blank while frames stream in.
    if (!ok(img)) {
      for (let off = 1; off < FRAMES; off++) {
        if (ok(imgs.current[idx - off])) { img = imgs.current[idx - off]; break; }
        if (ok(imgs.current[idx + off])) { img = imgs.current[idx + off]; break; }
      }
    }
    if (!ok(img)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cw / ch;
    let dw: number, dh: number;
    if (ir > cr) {
      dh = ch;
      dw = ch * ir;
    } else {
      dw = cw;
      dh = cw / ir;
    }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }, []);

  // preload
  React.useEffect(() => {
    let cancelled = false;
    const arr: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAMES; i++) {
      const im = new Image();
      im.src = src(i);
      im.onload = () => {
        loaded.current += 1;
        // Redraw the currently-targeted frame as images stream in.
        draw(currentIdx(scrollYProgress.get()));
        if (loaded.current >= FRAMES && !cancelled) setReady(true);
      };
      arr.push(im);
    }
    imgs.current = arr;
    return () => {
      cancelled = true;
    };
  }, [draw]);

  // redraw on resize
  React.useEffect(() => {
    const onResize = () => draw(currentIdx(scrollYProgress.get()));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    draw(currentIdx(v));
  });

  // initial / reduced-motion frame
  React.useEffect(() => {
    if (ready) draw(reduce ? FRAMES - 1 : currentIdx(scrollYProgress.get()));
  }, [ready, reduce, draw, scrollYProgress]);

  return (
    <section id="compare" ref={wrapRef} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute left-1/2 top-16 z-10 -translate-x-1/2 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Live rebuild</p>
          <h2 className="mt-3 font-semibold tracking-[-0.03em] text-white [font-size:clamp(1.75rem,4vw,3rem)] [line-height:1]">
            Scroll to rebuild the site.
          </h2>
        </div>
        <canvas ref={canvasRef} className="h-[62vh] w-full max-w-[1100px]" />
      </div>
    </section>
  );
}

function currentIdx(v: number): number {
  return Math.min(FRAMES - 1, Math.max(0, Math.round(v * (FRAMES - 1))));
}
