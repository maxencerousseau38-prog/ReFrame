"use client";

import { useRef } from "react";
import { gsap, useGSAP, DrawSVGPlugin } from "@/lib/gsap";
import { KPIS, PROSPECTS, ACTIVITY, RDV, type Kpi } from "@/lib/appData";
import type { User } from "@/lib/auth";

function fmt(v: number, k: Kpi) {
  const n = v.toLocaleString("fr-FR", {
    minimumFractionDigits: k.decimals ?? 0,
    maximumFractionDigits: k.decimals ?? 0,
  });
  return `${k.prefix ?? ""}${n}${k.suffix ?? ""}`;
}

const STATUS_TONE: Record<string, string> = {
  Nouveau: "bg-beige-light text-ink",
  "En contact": "bg-beige text-ink",
  "Devis envoyé": "bg-beige-dark/40 text-ink",
  Gagné: "bg-ink text-paper",
};

export function DashboardView({ user }: { user: User }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".d-reveal", {
          autoAlpha: 0,
          y: 18,
          duration: 0.6,
          stagger: 0.07,
          ease: "power3.out",
        });

        const counters = gsap.utils.toArray<HTMLElement>("[data-kpi]");
        counters.forEach((el) => {
          const k = JSON.parse(el.dataset.kpi!) as Kpi;
          const obj = { v: 0 };
          gsap.to(obj, {
            v: k.value,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => (el.textContent = fmt(obj.v, k)),
          });
        });

        const line = root.current!.querySelector<SVGPathElement>(".d-line");
        if (line) gsap.from(line, { drawSVG: "0%", duration: 1.6, ease: "power2.inOut" });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="space-y-6">
      {/* Greeting */}
      <div className="d-reveal">
        <h2 className="text-2xl font-semibold tracking-tightest text-ink">
          Bienvenue, {user.name} 👋
        </h2>
        <p className="mt-1 text-sm text-muted">
          Voici l’activité de votre garage aujourd’hui.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className="d-reveal rounded-2xl border border-line bg-white p-5 shadow-card"
          >
            <div className="text-sm text-muted">{k.label}</div>
            <div
              className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums"
              data-kpi={JSON.stringify(k)}
            >
              {fmt(k.value, k)}
            </div>
            <div className="mt-2 inline-flex rounded-full bg-beige-light px-2 py-0.5 text-xs font-medium text-ink/75">
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chart */}
        <div className="d-reveal rounded-2xl border border-line bg-white p-6 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-ink">Ventes</div>
              <div className="text-xs text-muted">12 derniers mois</div>
            </div>
            <span className="rounded-full bg-beige-light px-2.5 py-1 text-xs font-medium text-ink">
              +24,6 %
            </span>
          </div>
          <svg viewBox="0 0 600 220" className="h-48 w-full" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16140f" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#16140f" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[44, 88, 132, 176].map((y) => (
              <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(22,20,15,0.06)" strokeWidth="1" />
            ))}
            <path d="M0,175 C50,165 80,150 120,150 C170,150 190,120 240,122 C300,124 320,95 380,100 C430,104 460,70 510,60 C550,52 575,45 600,38 L600,220 L0,220 Z" fill="url(#dFill)" />
            <path className="d-line" d="M0,175 C50,165 80,150 120,150 C170,150 190,120 240,122 C300,124 320,95 380,100 C430,104 460,70 510,60 C550,52 575,45 600,38" stroke="#16140f" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Upcoming RDV */}
        <div className="d-reveal rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="mb-4 text-sm font-medium text-ink">
            Rendez-vous du jour
          </div>
          <div className="space-y-3">
            {RDV.map((r) => (
              <div key={r.client} className="flex items-center gap-3">
                <span className="rounded-lg bg-paper px-2 py-1 text-xs font-medium text-ink tabular-nums">
                  {r.time}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">{r.client}</div>
                  <div className="truncate text-xs text-muted">{r.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent prospects */}
        <div className="d-reveal rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="mb-4 text-sm font-medium text-ink">Derniers prospects</div>
          <div className="space-y-3">
            {PROSPECTS.slice(0, 4).map((p) => (
              <div key={p.name} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">{p.name}</div>
                  <div className="truncate text-xs text-muted">{p.vehicle}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[p.status]}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="d-reveal rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="mb-4 text-sm font-medium text-ink">Activité récente</div>
          <div className="space-y-3">
            {ACTIVITY.map((a) => (
              <div key={a.text} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-beige-dark" />
                <div className="min-w-0">
                  <div className="text-sm text-ink">{a.text}</div>
                  <div className="text-xs text-muted">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
