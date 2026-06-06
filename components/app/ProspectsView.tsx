"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { PROSPECTS } from "@/lib/appData";
import { Icon } from "./icons";

const STATUS_TONE: Record<string, string> = {
  Nouveau: "bg-beige-light text-ink",
  "En contact": "bg-beige text-ink",
  "Devis envoyé": "bg-beige-dark/40 text-ink",
  Gagné: "bg-ink text-paper",
};

export function ProspectsView() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".p-row", {
          autoAlpha: 0,
          y: 12,
          duration: 0.5,
          stagger: 0.05,
          ease: "power3.out",
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {PROSPECTS.length} prospects dans votre pipeline
        </p>
        <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-transform hover:scale-[1.03] active:scale-95">
          <Icon name="plus" size={16} />
          Nouveau prospect
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="px-5 py-3 font-medium">Prospect</th>
                <th className="px-5 py-3 font-medium">Véhicule</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Valeur</th>
                <th className="px-5 py-3 font-medium">Dernier contact</th>
              </tr>
            </thead>
            <tbody>
              {PROSPECTS.map((p) => (
                <tr key={p.name} className="p-row border-b border-line/60 last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-beige text-xs font-semibold text-ink">
                        {p.name.replace(/^M(me)?\.\s*/, "").charAt(0)}
                      </span>
                      <span className="text-sm font-medium text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">{p.vehicle}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-ink">{p.value}</td>
                  <td className="px-5 py-4 text-sm text-muted">{p.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
