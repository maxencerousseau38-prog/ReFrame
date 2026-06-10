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

/** Premium multi-step loader shown while analyzing and generating. */
export function AnalyzeLoader({ done }: { done?: boolean }) {
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
      <div className="mb-8 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <CircleNotch weight="bold" className={cn("h-7 w-7", !reduce && "animate-spin")} />
        </div>
      </div>

      <div className="space-y-2.5">
        {STEPS.map((step, i) => {
          const complete = i < active || done;
          const current = i === active && !done;
          return (
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                complete
                  ? "border-white/8 bg-card text-white"
                  : current
                  ? "border-accent/30 bg-accent/10 text-white"
                  : "border-transparent text-zinc-500"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full",
                  complete ? "bg-accent text-accent-foreground" : current ? "bg-accent/20" : "bg-white/8"
                )}
              >
                {complete ? (
                  <Check weight="bold" className="h-3 w-3" />
                ) : current ? (
                  <CircleNotch weight="bold" className={cn("h-3 w-3 text-accent", !reduce && "animate-spin")} />
                ) : null}
              </span>
              {step}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
