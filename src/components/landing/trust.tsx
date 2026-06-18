"use client";

import {
  ShieldCheck,
  Eye,
  CreditCard,
  ArrowsClockwise,
  DownloadSimple,
  LockKey,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { useI18n } from "@/lib/i18n";

const ICONS: PhosphorIcon[] = [CreditCard, ShieldCheck, DownloadSimple, ArrowsClockwise, Eye, LockKey];

export function Trust() {
  const { t } = useI18n();
  const promises = t.trust.cards.map((c, i) => ({ ...c, icon: ICONS[i] }));
  return (
    <section id="trust" className="px-6 py-32 sm:py-40">
      <div className="mx-auto max-w-[1100px]">
        <BlurReveal className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">{t.trust.eyebrow}</p>
          <h2 className="mt-4 font-semibold leading-[1.04] tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,3.75rem)]">
            {t.trust.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-zinc-300">{t.trust.p1}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{t.trust.p2}</p>
        </BlurReveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promises.map((p, i) => (
            <BlurReveal key={p.title} delay={i * 0.06}>
              <div className="panel group flex h-full flex-col rounded-[1.5rem] p-7 ring-1 ring-inset ring-white/10 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:ring-white/20">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent transition-transform duration-300 group-hover:scale-105">
                  <p.icon weight="bold" className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">{p.body}</p>
              </div>
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
