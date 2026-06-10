"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

const LINE =
  "Most websites quietly lose customers every day. ReFrame rebuilds yours into one that earns them back.";

/**
 * Signature scroll moment: the sentence pins in view and each word brightens as
 * the section scrolls through, the way Framer and Stripe reveal manifesto copy.
 * Built on Motion's useScroll (no scroll listeners) and disabled under
 * prefers-reduced-motion.
 */
export function Manifesto() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });

  const words = LINE.split(" ");

  if (reduce) {
    return (
      <section className="px-6 py-32">
        <div className="mx-auto max-w-4xl">
          <p className="text-center font-semibold leading-[1.15] tracking-tight text-white [font-size:clamp(1.75rem,4vw,3rem)]">
            {LINE}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="manifesto" ref={ref} className="relative h-[180vh] px-6">
      <div className="sticky top-0 flex h-screen items-center justify-center">
        <p className="mx-auto max-w-4xl text-center font-semibold leading-[1.18] tracking-tight [font-size:clamp(1.75rem,4vw,3rem)]">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  // ReFrame is the brand word: tint it with the accent as it lights up.
  const isBrand = children === "ReFrame";
  return (
    <>
      <motion.span style={{ opacity }} className={isBrand ? "text-accent" : "text-white"}>
        {children}
      </motion.span>{" "}
    </>
  );
}
