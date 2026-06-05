"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const ITEMS = [
  {
    q: "Combien de temps pour démarrer ?",
    a: "Quelques minutes. Vous créez votre compte, importez vos clients et votre stock, et vous êtes opérationnel. Aucune formation technique n’est nécessaire.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Vos données sont hébergées en Europe, chiffrées et sauvegardées. Vous restez seul propriétaire de vos informations et pouvez les exporter à tout moment.",
  },
  {
    q: "Puis-je importer mes clients existants ?",
    a: "Bien sûr. DriveOS importe vos contacts depuis un fichier Excel/CSV, et à partir du plan Pro, vos emails clients créent automatiquement des prospects.",
  },
  {
    q: "L’IA remplace-t-elle le vendeur ?",
    a: "Non. L’IA est un assistant : elle prépare vos relances, résume vos échanges et suggère des actions. C’est toujours vous qui validez et gardez le contrôle.",
  },
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez passer d’un plan à l’autre quand vous le souhaitez. Le changement est immédiat et le tarif ajusté au prorata.",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Aucun engagement. Vous bénéficiez de 7 jours gratuits à l’inscription, puis vous payez au mois et résiliez quand vous voulez.",
  },
];

export default function FAQ() {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>(".faq-answer");
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        panels.forEach((el, i) => {
          gsap.to(el, {
            height: i === open ? "auto" : 0,
            autoAlpha: i === open ? 1 : 0,
            duration: 0.4,
            ease: "power2.inOut",
          });
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        panels.forEach((el, i) =>
          gsap.set(el, {
            height: i === open ? "auto" : 0,
            autoAlpha: i === open ? 1 : 0,
          })
        );
      });
    },
    { dependencies: [open], scope: root }
  );

  return (
    <section
      id="faq"
      ref={root}
      className="relative scroll-mt-20 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted">
            FAQ
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tightest text-ink sm:text-4xl">
            Les questions fréquentes
          </h2>
        </div>

        <div className="mt-12 divide-y divide-line rounded-2xl border border-line bg-white">
          {ITEMS.map((item, i) => (
            <div key={item.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
                aria-expanded={open === i}
              >
                <span className="text-[15px] font-medium text-ink">
                  {item.q}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 text-muted transition-transform duration-300 ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <div
                className="faq-answer overflow-hidden"
                style={{ height: 0, opacity: 0 }}
              >
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
