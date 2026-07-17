"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Fetching your website",
  "Detecting your industry",
  "Extracting content and media",
  "Auditing SEO and performance",
  "Selecting layout blocks",
  "Assembling your new site",
];

/**
 * The generation moment — a quiet, focused progress card (V3 glass, 24px).
 * Shows WHICH site is being read (real data), then the pipeline stages.
 * Steps advance on a timer as a narrative of the real pipeline stages; the
 * final step only completes when `done` is true (the real signal).
 */
export function AnalyzeLoader({ done, url }: { done?: boolean; url?: string }) {
  const [active, setActive] = React.useState(0);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (done) {
      setActive(STEPS.length);
      return;
    }
    const t = setInterval(() => {
      setActive((a) => (a < STEPS.length - 1 ? a + 1 : a));
    }, 700);
    return () => clearInterval(t);
  }, [done]);

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CircleNotch weight="bold" className={cn("h-5 w-5", !reduce && !done && "animate-spin")} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">
              {done ? "Assembling your new site" : "Reading your site"}
            </div>
            {url && <div className="truncate text-[13px] text-muted-foreground">{url}</div>}
          </div>
        </div>

        <div className="mt-6 space-y-1.5">
          {STEPS.map((step, i) => {
            const complete = i < active || done;
            const current = i === active && !done;
            return (
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-base ease-premium",
                  complete
                    ? "text-foreground"
                    : current
                    ? "bg-white/[0.06] text-foreground"
                    : "text-muted-foreground/60"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-base ease-premium",
                    complete ? "bg-primary text-primary-foreground" : current ? "bg-white/12" : "bg-white/[0.06]"
                  )}
                >
                  {complete ? (
                    <Check weight="bold" className="h-3 w-3" />
                  ) : current ? (
                    <CircleNotch weight="bold" className={cn("h-3 w-3 text-foreground/80", !reduce && "animate-spin")} />
                  ) : null}
                </span>
                {step}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
