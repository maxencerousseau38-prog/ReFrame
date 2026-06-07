"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  Crosshair,
  Rocket,
  Users,
  AlertTriangle,
  Plus,
  Minus,
} from "lucide-react";
import type { Criterion } from "@/lib/types";
import { scoreColor } from "@/lib/scoring";

const ICONS: Record<string, any> = {
  growth: TrendingUp,
  profitability: Coins,
  "financial-strength": ShieldCheck,
  "market-position": Crosshair,
  scalability: Rocket,
  management: Users,
  risk: AlertTriangle,
};

export function CriterionCard({ c, index = 0 }: { c: Criterion; index?: number }) {
  const Icon = ICONS[c.key] ?? TrendingUp;
  const color = scoreColor(c.score);

  return (
    <motion.div
      className="surface surface-hover flex h-full flex-col p-5"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03]" style={{ color }}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <h3 className="text-sm font-semibold text-white">{c.label}</h3>
        </div>
        <span className="num text-lg font-semibold" style={{ color }}>
          {c.score}
        </span>
      </div>

      {/* score bar */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${c.score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: index * 0.04 + 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-mist-300">{c.summary}</p>

      <div className="mt-4 space-y-1.5">
        {c.strengths.map((s) => (
          <div key={s} className="flex items-start gap-1.5 text-2xs text-mist-200">
            <Plus className="mt-px h-3 w-3 shrink-0 text-bull" />
            <span>{s}</span>
          </div>
        ))}
        {c.weaknesses.map((w) => (
          <div key={w} className="flex items-start gap-1.5 text-2xs text-mist-300">
            <Minus className="mt-px h-3 w-3 shrink-0 text-bear" />
            <span>{w}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
