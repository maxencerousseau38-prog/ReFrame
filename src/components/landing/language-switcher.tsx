"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "@phosphor-icons/react";
import { LOCALES, useI18n } from "@/lib/i18n";

/** Compact language menu for the navbar (top-right). Switches the whole landing. */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t.nav.language}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Globe weight="bold" className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="glass-dark absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-2xl p-1.5"
          >
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[14px] text-zinc-200 transition-colors hover:bg-white/5"
              >
                {l.label}
                {locale === l.code && <Check weight="bold" className="h-4 w-4 text-accent" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
