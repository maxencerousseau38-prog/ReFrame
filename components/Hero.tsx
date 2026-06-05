"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText, ScrollTrigger } from "@/lib/gsap";

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Mask the headline lines for a clean Linear/Stripe-style reveal.
        const split = new SplitText(titleRef.current!, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
        });

        // Hide everything we're about to reveal (inside this branch only, so
        // reduced-motion / no-JS users keep the fully-visible layout).
        gsap.set([".hero-eyebrow", ".hero-sub", ".hero-cta", ".hero-proof"], {
          autoAlpha: 0,
        });
        gsap.set(visualRef.current, { autoAlpha: 0 });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.to(".hero-eyebrow", { autoAlpha: 1, y: 0, duration: 0.6 })
          .from(
            split.lines,
            {
              yPercent: 115,
              opacity: 0,
              duration: 1,
              stagger: 0.12,
              ease: "power4.out",
            },
            "-=0.3"
          )
          .to(
            ".hero-sub",
            { autoAlpha: 1, y: 0, duration: 0.8 },
            "-=0.55"
          )
          .to(
            ".hero-cta",
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 },
            "-=0.4"
          )
          .to(".hero-proof", { autoAlpha: 1, duration: 0.6 }, "-=0.3")
          .to(
            visualRef.current,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
              duration: 1.2,
              ease: "power3.out",
            },
            "-=1.1"
          );

        // Subtle scroll parallax + depth on the product window.
        gsap.to(visualRef.current, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        // Pointer-driven 3D tilt (clamped, very subtle — premium, not gadget).
        const setX = gsap.quickTo(visualRef.current, "rotateY", {
          duration: 0.6,
          ease: "power3.out",
        });
        const setY = gsap.quickTo(visualRef.current, "rotateX", {
          duration: 0.6,
          ease: "power3.out",
        });
        const onMove = (e: PointerEvent) => {
          const r = root.current!.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          setX(gsap.utils.clamp(-6, 6, px * 12));
          setY(gsap.utils.clamp(-5, 5, -py * 10));
        };
        const el = root.current!;
        el.addEventListener("pointermove", onMove);

        return () => {
          el.removeEventListener("pointermove", onMove);
          split.revert(); // restore original DOM for a11y / SEO
        };
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden px-6 pb-24 pt-36 md:pb-32 md:pt-44"
    >
      {/* Ambient gradient depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.20),transparent)] blur-2xl animate-blob-slow" />
        <div className="absolute right-[6%] top-[22%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.16),transparent)] blur-2xl animate-blob-slow [animation-delay:-6s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--background))]" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <p className="hero-eyebrow mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-1.5 text-[13px] text-muted backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          La plateforme de vente automobile nouvelle génération
        </p>

        <h1
          ref={titleRef}
          className="text-balance text-[40px] font-semibold leading-[1.05] tracking-tightest text-ink sm:text-6xl"
        >
          Pilotez toutes vos ventes automobiles depuis{" "}
          <span className="text-gradient">une seule plateforme</span>.
        </h1>

        <p className="hero-sub mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
          DriveOS centralise vos prospects, votre stock, vos rendez-vous et vos
          analyses. Conçu pour les garages, concessions et mandataires qui
          veulent vendre plus, plus vite.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#"
            className="hero-cta group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-paper transition-transform duration-200 hover:scale-[1.03] active:scale-95"
          >
            Démarrer gratuitement
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="#"
            className="hero-cta inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-6 py-3 font-medium text-ink backdrop-blur transition-colors hover:bg-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 5v14l11-7z"
                fill="currentColor"
              />
            </svg>
            Voir la démo
          </a>
        </div>

        <p className="hero-proof mt-6 text-sm text-muted">
          Sans carte bancaire · Déjà adopté par 400+ garages et concessions
        </p>
      </div>

      {/* Product window with depth */}
      <div
        className="mx-auto mt-16 max-w-5xl [perspective:1600px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          ref={visualRef}
          className="glass-panel relative rounded-2xl p-2.5 will-change-transform"
          style={{
            transform: "translateY(40px) scale(0.96) rotateX(8deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="overflow-hidden rounded-xl bg-white">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <div className="ml-4 hidden h-6 flex-1 items-center rounded-md bg-paper px-3 text-xs text-muted sm:flex">
                app.driveos.fr/dashboard
              </div>
            </div>

            {/* App body mock */}
            <div className="grid grid-cols-12 gap-0">
              <aside className="col-span-3 hidden flex-col gap-1.5 border-r border-line p-4 md:flex">
                {["Dashboard", "Prospects", "Stock", "Rendez-vous", "Analyses"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        i === 0
                          ? "bg-accent/10 font-medium text-accent"
                          : "text-muted"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-sm bg-current opacity-50" />
                      {item}
                    </div>
                  )
                )}
              </aside>

              <div className="col-span-12 p-5 md:col-span-9">
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {[
                    { k: "Véhicules", v: "248" },
                    { k: "Leads / mois", v: "1 320" },
                    { k: "Conversion", v: "24,8 %" },
                  ].map((c) => (
                    <div
                      key={c.k}
                      className="rounded-xl border border-line bg-paper p-3"
                    >
                      <div className="text-xs text-muted">{c.k}</div>
                      <div className="mt-1 text-xl font-semibold tracking-tight text-ink">
                        {c.v}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-line bg-paper p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">
                      Ventes — 30 derniers jours
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                      +18,2 %
                    </span>
                  </div>
                  <div className="flex h-24 items-end gap-1.5">
                    {[40, 55, 45, 70, 60, 80, 72, 90, 85, 100, 78, 95].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-accent/30 to-accent"
                          style={{ height: `${h}%` }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
