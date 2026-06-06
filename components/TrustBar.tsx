"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

type Stat = { value: number; decimals?: number; prefix?: string; suffix?: string; label: string };

const STATS: Stat[] = [
  { value: 400, suffix: "+", label: "Garagistes équipés" },
  { value: 12000, label: "Véhicules gérés" },
  { value: 38000, label: "Relances automatisées" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "Satisfaction client" },
];

function format(v: number, s: Stat) {
  const num = v.toLocaleString("fr-FR", {
    minimumFractionDigits: s.decimals ?? 0,
    maximumFractionDigits: s.decimals ?? 0,
  });
  return `${s.prefix ?? ""}${num}${s.suffix ?? ""}`;
}

export default function TrustBar() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counters = gsap.utils.toArray<HTMLElement>("[data-stat]");
        counters.forEach((el) => {
          const s = JSON.parse(el.dataset.stat!) as Stat;
          el.textContent = format(0, s);
        });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
        });
        tl.from(".trust-col", {
          autoAlpha: 0,
          y: 16,
          rotateX: -16,
          transformOrigin: "center top",
          transformPerspective: 800,
          duration: 0.7,
          stagger: 0.1,
        });
        counters.forEach((el) => {
          const s = JSON.parse(el.dataset.stat!) as Stat;
          const obj = { v: 0 };
          tl.to(
            obj,
            {
              v: s.value,
              duration: 1.4,
              ease: "power2.out",
              onUpdate: () => (el.textContent = format(obj.v, s)),
            },
            "<"
          );
        });
        return () => {
          ScrollTrigger.getAll().forEach((st) => {
            if (st.trigger === root.current) st.kill();
          });
        };
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="border-y border-line bg-white/50 px-6 py-10">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="trust-col text-center">
            <div
              className="text-3xl font-semibold tracking-tight text-ink tabular-nums"
              data-stat={JSON.stringify(s)}
            >
              {format(s.value, s)}
            </div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
