"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudArrowUp,
  Lightning,
  Globe,
  Check,
  Confetti,
  ArrowSquareOut,
} from "@phosphor-icons/react";

interface PublishSequenceProps {
  url: string;
  brandName: string;
}

const STAGES = [
  {
    icon: CloudArrowUp,
    label: "Uploading site…",
    sublabel: "Packaging blocks and assets",
    duration: 1200,
  },
  {
    icon: Lightning,
    label: "Optimizing…",
    sublabel: "Compressing images, minifying code",
    duration: 1400,
  },
  {
    icon: Globe,
    label: "Deploying…",
    sublabel: "Propagating to edge network",
    duration: 1600,
  },
] as const;

export function PublishSequence({ url, brandName }: PublishSequenceProps) {
  const [stage, setStage] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    let current = 0;
    const next = () => {
      if (current < STAGES.length - 1) {
        current++;
        setStage(current);
        setTimeout(next, STAGES[current].duration);
      } else {
        setTimeout(() => setDone(true), STAGES[current].duration);
      }
    };
    const t = setTimeout(next, STAGES[0].duration);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="relative">
              <motion.div
                className="h-20 w-20 rounded-full border-2 border-accent/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {STAGES.map(
                    (s, i) =>
                      stage === i && (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <s.icon
                            weight="bold"
                            className="h-8 w-8 text-accent"
                          />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-lg font-semibold">
                    {STAGES[stage].label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {STAGES[stage].sublabel}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex gap-2">
              {STAGES.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-8 overflow-hidden rounded-full bg-white/10"
                >
                  <motion.div
                    className="h-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: stage >= i ? "100%" : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
            >
              <Check weight="bold" className="h-10 w-10 text-emerald-400" />
            </motion.div>

            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mb-2 flex items-center justify-center gap-2">
                  <Confetti
                    weight="fill"
                    className="h-5 w-5 text-accent"
                  />
                  <span className="text-sm font-medium text-accent">
                    Congratulations!
                  </span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {brandName} is live
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your redesigned site is now published and accessible worldwide.
                </p>
              </motion.div>
            </div>

            <motion.a
              href={url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Visit your site
              <ArrowSquareOut weight="bold" className="h-4 w-4" />
            </motion.a>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-[13px] text-muted-foreground"
            >
              {url.replace("https://", "")}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
