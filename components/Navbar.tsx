"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

const LINKS = [
  { label: "Produit", href: "#produit" },
  { label: "Fonctionnalités", href: "#features" },
  { label: "Tarifs", href: "#pricing" },
  { label: "Ressources", href: "#ressources" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const nav = navRef.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1) Elegant entrance on load (runs before paint → no flash).
        gsap.from(nav, {
          y: -24,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.1,
        });
        gsap.from(".nav-stagger", {
          y: -12,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.2,
        });

        // 2) Smart scroll: hide on scroll-down, reveal on scroll-up.
        const showAnim = gsap
          .from(nav, {
            yPercent: -130,
            duration: 0.35,
            ease: "power2.out",
            paused: true,
          })
          .progress(1);

        const st = ScrollTrigger.create({
          start: "top top",
          end: "max",
          onUpdate: (self) => {
            // Condensed (frosted) state once we leave the very top.
            nav.classList.toggle("is-scrolled", self.scroll() > 32);
            // Direction: 1 = down (hide), -1 = up (show).
            if (self.scroll() < 80) {
              showAnim.play();
            } else {
              self.direction === -1 ? showAnim.play() : showAnim.reverse();
            }
          },
        });

        return () => st.kill();
      });
    },
    { scope: navRef }
  );

  return (
    <header
      ref={navRef}
      className="is-nav fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,padding] duration-300 [&.is-scrolled]:bg-paper/70 [&.is-scrolled]:backdrop-blur-xl [&.is-scrolled]:shadow-[0_1px_0_rgba(10,10,40,0.06)]"
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#"
          className="nav-stagger flex items-center gap-2 text-[15px] font-semibold tracking-tightest"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-paper">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 13.5 5 7h14l2 6.5M5.5 17.5h.01M18.5 17.5h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 13.5h18v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          DriveOS
        </a>

        <div className="hidden items-center gap-8 text-sm md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-stagger nav-link">
              {l.label}
            </a>
          ))}
        </div>

        <div className="nav-stagger flex items-center gap-3 text-sm">
          <a
            href="#"
            className="hidden text-muted transition-colors hover:text-ink sm:block"
          >
            Connexion
          </a>
          <a
            href="#"
            className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition-transform duration-200 hover:scale-[1.03] active:scale-95"
          >
            Démarrer gratuitement
          </a>
        </div>
      </nav>
    </header>
  );
}
