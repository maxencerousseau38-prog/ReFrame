"use client";

import { useRef, useState, useEffect } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

const LINKS = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Produit", href: "#produit" },
  { label: "Tarifs", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

function Logo() {
  return (
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
  );
}

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Desktop entrance + smart scroll behaviour.
  useGSAP(
    () => {
      const nav = navRef.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
            nav.classList.toggle("is-scrolled", self.scroll() > 32);
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

  // Mobile menu open/close animation.
  useGSAP(
    () => {
      const el = menuRef.current!;
      if (open) {
        gsap.set(el, { display: "flex" });
        gsap.fromTo(
          el,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, ease: "power2.out" }
        );
        gsap.fromTo(
          el.querySelectorAll(".mobile-item"),
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.06,
            ease: "power3.out",
            delay: 0.05,
          }
        );
      } else {
        gsap.to(el, {
          autoAlpha: 0,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => gsap.set(el, { display: "none" }),
        });
      }
    },
    { dependencies: [open] }
  );

  // Lock body scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        ref={navRef}
        className="is-nav fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,padding] duration-300 [&.is-scrolled]:bg-paper/70 [&.is-scrolled]:backdrop-blur-xl [&.is-scrolled]:shadow-[0_1px_0_rgba(10,10,40,0.06)]"
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a
            href="#"
            className="nav-stagger flex items-center gap-2 text-[15px] font-semibold tracking-tightest"
          >
            <Logo />
            DriveOS
          </a>

          <div className="hidden items-center gap-8 text-sm md:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="nav-stagger nav-link">
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="nav-stagger hidden items-center gap-3 text-sm md:flex">
            <a
              href="#"
              className="text-muted transition-colors hover:text-ink"
            >
              Connexion
            </a>
            <a
              href="#pricing"
              className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              Démarrer gratuitement
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="nav-stagger -mr-2 grid h-10 w-10 place-items-center rounded-lg text-ink md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile full-screen menu (sibling of header → not affected by nav transforms) */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-[60] hidden flex-col bg-paper px-6 md:hidden"
        style={{ opacity: 0 }}
      >
        <div className="flex h-16 items-center justify-between">
          <a
            href="#"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-[15px] font-semibold tracking-tightest"
          >
            <Logo />
            DriveOS
          </a>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="-mr-2 grid h-10 w-10 place-items-center rounded-lg text-ink"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="mobile-item border-b border-line py-4 text-2xl font-medium tracking-tight text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="mobile-item mt-auto flex flex-col gap-3 pb-10">
          <a
            href="#"
            onClick={() => setOpen(false)}
            className="rounded-full border border-line py-3.5 text-center font-medium text-ink"
          >
            Connexion
          </a>
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="rounded-full bg-ink py-3.5 text-center font-medium text-paper"
          >
            Démarrer gratuitement
          </a>
          <p className="mt-1 text-center text-sm text-muted">
            7 jours gratuits · sans carte bancaire
          </p>
        </div>
      </div>
    </>
  );
}
