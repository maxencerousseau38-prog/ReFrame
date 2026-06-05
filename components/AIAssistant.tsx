"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import UpsellButton from "@/components/UpsellButton";

const CAPABILITIES = [
  "Rédige vos emails et SMS de relance",
  "Résume l’historique d’un client en un clic",
  "Rédige vos annonces automobiles",
  "Identifie vos prospects prioritaires",
  "Suggère vos prochaines actions commerciales",
];

const EMAIL =
  "Bonjour M. Dupont, votre Peugeot 308 GT est toujours disponible. Souhaitez-vous convenir d’un essai cette semaine ? Je reste à votre écoute. — L’équipe DriveOS";

export default function AIAssistant() {
  const root = useRef<HTMLDivElement>(null);
  const out = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".ai-reveal", {
          autoAlpha: 0,
          y: 24,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        });

        // The AI "generates" the email in real time on scroll.
        gsap.to(out.current, {
          duration: 2.4,
          ease: "none",
          scrambleText: {
            text: EMAIL,
            chars: "abcdefghijklmnopqrstuvwxyz",
            speed: 0.5,
          },
          scrollTrigger: { trigger: root.current, start: "top 60%", once: true },
        });

        gsap.to(".ai-spark", {
          scale: 1.15,
          repeat: -1,
          yoyo: true,
          duration: 1.4,
          ease: "sine.inOut",
        });

        return () => {
          ScrollTrigger.getAll().forEach((s) => {
            if (s.trigger === root.current) s.kill();
          });
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (out.current) out.current.textContent = EMAIL;
      });
    },
    { scope: root }
  );

  return (
    <section
      id="ai"
      ref={root}
      className="relative scroll-mt-20 px-6 py-24 md:py-32"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        {/* Left — message */}
        <div>
          <p className="ai-reveal mb-3 text-sm font-medium uppercase tracking-wider text-muted">
            Assistant IA
          </p>
          <h2 className="ai-reveal text-balance text-3xl font-semibold tracking-tightest text-ink sm:text-4xl">
            Une IA qui vend avec vous
          </h2>
          <p className="ai-reveal mt-4 text-pretty text-lg text-muted">
            DriveOS rédige, résume et priorise à votre place. Vous gardez le
            contrôle, l’IA fait le travail répétitif.
          </p>

          <ul className="ai-reveal mt-7 space-y-3">
            {CAPABILITIES.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-sm text-ink">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0 text-ink"
                >
                  <path d="m5 12 4.5 4.5L19 7" />
                </svg>
                {c}
              </li>
            ))}
          </ul>

          <div className="ai-reveal mt-8">
            <UpsellButton label="Activer l’assistant IA" plan="Pro" icon="bolt" />
          </div>
        </div>

        {/* Right — generation mock */}
        <div className="ai-reveal">
          <div className="glass-panel rounded-2xl p-2">
            <div className="rounded-xl bg-white p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-line pb-3">
                <span className="ai-spark text-ink">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v4M12 17v4M5 12H1M23 12h-4M6.3 6.3 4 4M20 20l-2.3-2.3M17.7 6.3 20 4M4 20l2.3-2.3" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-ink">
                  Assistant DriveOS
                </span>
                <span className="ml-auto rounded-full bg-beige-light px-2 py-0.5 text-[11px] text-muted">
                  Génération
                </span>
              </div>

              <div className="mb-3 inline-flex rounded-lg bg-paper px-3 py-2 text-xs text-muted">
                « Rédige une relance pour M. Dupont (Peugeot 308) »
              </div>

              <p
                ref={out}
                className="min-h-[96px] text-[15px] leading-relaxed text-ink"
              >
                {EMAIL}
              </p>

              <div className="mt-4 flex gap-2">
                <button className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper">
                  Envoyer
                </button>
                <button className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink">
                  Régénérer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
