"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MoveHorizontal } from "lucide-react";
import { MockupBefore, MockupAfter } from "./site-mockup";
import { cn } from "@/lib/utils";

/**
 * Démonstration avant/après interactive.
 * L'utilisateur glisse la poignée pour révéler la version refaite.
 */
export function BeforeAfter({ className }: { className?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState(50);
  const dragging = React.useRef(false);

  const setFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      setFromClientX(e.clientX);
    };
    const onUp = () => (dragging.current = false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [setFromClientX]);

  return (
    <div className={cn("select-none", className)}>
      <div
        ref={containerRef}
        className="relative aspect-[16/10] w-full cursor-ew-resize overflow-hidden rounded-xl border border-border bg-card shadow-2xl ring-1 ring-black/5"
        onPointerDown={(e) => {
          dragging.current = true;
          setFromClientX(e.clientX);
        }}
      >
        {/* Après (fond, pleine largeur) */}
        <div className="absolute inset-0">
          <MockupAfter />
        </div>

        {/* Avant (au-dessus, masqué par la poignée) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <MockupBefore />
        </div>

        {/* Étiquettes */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
          Avant
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-medium text-brand-foreground">
          Après · Vitrio
        </span>

        {/* Poignée */}
        <div
          className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"
          style={{ left: `${position}%` }}
        >
          <motion.div
            whileTap={{ scale: 0.92 }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-white text-foreground shadow-lg ring-1 ring-black/10"
          >
            <MoveHorizontal className="size-4" />
          </motion.div>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Glissez la poignée pour comparer l'avant et l'après.
      </p>
    </div>
  );
}
