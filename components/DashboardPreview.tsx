"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

type Kpi = {
  label: string;
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delta: string;
  positive?: boolean;
};

const KPIS: Kpi[] = [
  { label: "Véhicules en stock", target: 248, delta: "+12 cette semaine", positive: true },
  { label: "Leads ce mois", target: 1320, delta: "+18,2 %", positive: true },
  { label: "Taux de conversion", target: 24.8, decimals: 1, suffix: " %", delta: "+3,1 pts", positive: true },
  { label: "Chiffre d'affaires", target: 482, prefix: "€", suffix: "k", delta: "+9,4 %", positive: true },
];

const BARS = [0.42, 0.58, 0.5, 0.72, 0.64, 0.86, 0.95];

function formatValue(v: number, k: Kpi) {
  const num = v.toLocaleString("fr-FR", {
    minimumFractionDigits: k.decimals ?? 0,
    maximumFractionDigits: k.decimals ?? 0,
  });
  return `${k.prefix ?? ""}${num}${k.suffix ?? ""}`;
}

export default function DashboardPreview() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".dash-card");
        const counters = gsap.utils.toArray<HTMLElement>("[data-counter]");
        const linePath = root.current!.querySelector<SVGPathElement>(".chart-line");
        const areaPath = root.current!.querySelector<SVGPathElement>(".chart-area");
        const bars = gsap.utils.toArray<SVGRectElement>(".chart-bar");

        // Initial hidden states (inside no-preference branch only).
        gsap.set(cards, {
          autoAlpha: 0,
          y: 28,
          rotateX: -12,
          transformOrigin: "center top",
          transformPerspective: 1000,
        });
        counters.forEach((el) => {
          const k = JSON.parse(el.dataset.kpi!) as Kpi;
          el.textContent = formatValue(0, k);
        });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: root.current,
            start: "top 68%",
            once: true,
          },
        });

        // 1) Cards reveal with an intelligent stagger + subtle 3D tilt.
        tl.to(cards, {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.1,
        });

        // 2) Fluid counters — tween a proxy and write formatted text.
        counters.forEach((el) => {
          const k = JSON.parse(el.dataset.kpi!) as Kpi;
          const obj = { v: 0 };
          tl.to(
            obj,
            {
              v: k.target,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => (el.textContent = formatValue(obj.v, k)),
            },
            "<+0.1"
          );
        });

        // 3) Line chart draws itself, area fades in underneath.
        if (linePath) {
          tl.from(
            linePath,
            { drawSVG: "0%", duration: 1.6, ease: "power2.inOut" },
            "<0.2"
          );
        }
        if (areaPath) {
          tl.from(areaPath, { autoAlpha: 0, duration: 1.2 }, "<0.3");
        }

        // 4) Bars grow from the baseline.
        tl.from(
          bars,
          {
            scaleY: 0,
            transformOrigin: "center bottom",
            duration: 0.9,
            stagger: 0.07,
            ease: "power3.out",
          },
          "<0.1"
        );

        return () => {
          ScrollTrigger.getAll().forEach((s) => {
            if (s.trigger === root.current) s.kill();
          });
        };
      });
    },
    { scope: root }
  );

  return (
    <section
      id="produit"
      ref={root}
      className="relative scroll-mt-20 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted">
            Tableau de bord
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tightest text-ink sm:text-4xl">
            Toute votre activité, en temps réel
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted">
            Suivez vos indicateurs clés d&apos;un coup d&apos;œil. Des données
            vivantes qui transforment chaque décision en avantage commercial.
          </p>
        </div>

        {/* KPI grid */}
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((k) => (
            <div
              key={k.label}
              className="dash-card rounded-2xl border border-line bg-white p-5 shadow-card will-change-transform"
            >
              <div className="text-sm text-muted">{k.label}</div>
              <div
                className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums"
                data-counter
                data-kpi={JSON.stringify(k)}
              >
                {formatValue(k.target, k)}
              </div>
              <div
                className={`mt-2 inline-flex items-center gap-1 rounded-full bg-beige-light px-2 py-0.5 text-xs font-medium ${
                  k.positive ? "text-ink/75" : "text-ink/40"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 14l5-5 5 5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {k.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Line chart */}
          <div className="dash-card rounded-2xl border border-line bg-white p-6 shadow-card will-change-transform lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">
                  Ventes réalisées
                </div>
                <div className="text-xs text-muted">12 derniers mois</div>
              </div>
              <span className="rounded-full bg-beige-light px-2.5 py-1 text-xs font-medium text-ink">
                +24,6 %
              </span>
            </div>
            <svg
              viewBox="0 0 600 220"
              className="h-48 w-full"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16140f" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#16140f" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* gridlines */}
              {[44, 88, 132, 176].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="rgba(10,10,40,0.06)"
                  strokeWidth="1"
                />
              ))}
              <path
                className="chart-area"
                d="M0,175 C50,165 80,150 120,150 C170,150 190,120 240,122 C300,124 320,95 380,100 C430,104 460,70 510,60 C550,52 575,45 600,38 L600,220 L0,220 Z"
                fill="url(#areaFill)"
              />
              <path
                className="chart-line"
                d="M0,175 C50,165 80,150 120,150 C170,150 190,120 240,122 C300,124 320,95 380,100 C430,104 460,70 510,60 C550,52 575,45 600,38"
                stroke="#16140f"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Bar chart */}
          <div className="dash-card rounded-2xl border border-line bg-white p-6 shadow-card will-change-transform">
            <div className="mb-4">
              <div className="text-sm font-medium text-ink">
                Leads par semaine
              </div>
              <div className="text-xs text-muted">7 dernières semaines</div>
            </div>
            <svg viewBox="0 0 280 200" className="h-48 w-full" fill="none">
              {BARS.map((h, i) => {
                const barW = 28;
                const gap = 12;
                const x = 6 + i * (barW + gap);
                const fullH = 170;
                const barH = h * fullH;
                const y = 180 - barH;
                return (
                  <rect
                    key={i}
                    className="chart-bar"
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx="5"
                    fill={i === BARS.length - 1 ? "#16140f" : "#ddd7c9"}
                    style={{ transformBox: "fill-box" }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
