"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Fetching your website",
  "Detecting your industry",
  "Extracting content & media",
  "Auditing SEO & performance",
  "Selecting premium templates",
  "Assembling your new site",
];

/** Premium multi-step loader shown while analyzing + generating. */
export function AnalyzeLoader({ done }: { done?: boolean }) {
  const [active, setActive] = React.useState(0);

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
      <div className="relative mb-8 flex justify-center">
        <div className="absolute h-24 w-24 animate-ping rounded-full bg-violet-500/20" />
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-xl shadow-violet-600/30">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const complete = i < active || done;
          const current = i === active && !done;
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
                complete
                  ? "border-border bg-card text-foreground"
                  : current
                  ? "border-violet-200 bg-violet-50/60 text-foreground"
                  : "border-transparent text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full",
                  complete ? "bg-violet-600 text-white" : current ? "bg-violet-100" : "bg-secondary"
                )}
              >
                {complete ? (
                  <Check className="h-3 w-3" />
                ) : current ? (
                  <Loader2 className="h-3 w-3 animate-spin text-violet-600" />
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
