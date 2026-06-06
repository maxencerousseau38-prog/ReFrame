"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".l-reveal", {
          autoAlpha: 0,
          y: 18,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
        });
      });
    },
    { scope: root }
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email);
    router.push("/app");
  };

  return (
    <div ref={root} className="flex min-h-screen bg-paper">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.12),transparent)] blur-2xl"
        />
        <a href="/" className="relative flex items-center gap-2 text-[15px] font-semibold tracking-tightest">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-paper text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M3 13.5 5 7h14l2 6.5M5.5 17.5h.01M18.5 17.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 13.5h18v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          DriveOS
        </a>

        <div className="relative mt-auto">
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tightest">
            Le logiciel qui fait vendre plus de véhicules aux garagistes.
          </h2>
          <p className="mt-4 max-w-md text-paper/70">
            CRM, stock, relances et IA — toute votre activité commerciale dans
            un seul espace.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-paper/60">
            <span className="flex -space-x-2">
              {["A", "B", "C"].map((c) => (
                <span key={c} className="grid h-8 w-8 place-items-center rounded-full border border-ink bg-beige text-xs font-semibold text-ink">
                  {c}
                </span>
              ))}
            </span>
            Rejoint par 400+ garagistes
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <a href="/" className="l-reveal mb-8 inline-flex items-center gap-2 text-[15px] font-semibold tracking-tightest text-ink lg:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-paper">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M3 13.5 5 7h14l2 6.5M5.5 17.5h.01M18.5 17.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 13.5h18v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </span>
            DriveOS
          </a>

          <h1 className="l-reveal text-2xl font-semibold tracking-tightest text-ink">
            {mode === "login" ? "Connexion à votre espace" : "Créer votre compte"}
          </h1>
          <p className="l-reveal mt-2 text-sm text-muted">
            {mode === "login"
              ? "Heureux de vous revoir sur DriveOS."
              : "7 jours gratuits, sans carte bancaire."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="l-reveal">
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@garage.fr"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink"
              />
            </div>
            <div className="l-reveal">
              <label className="mb-1.5 block text-sm font-medium text-ink">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink"
              />
            </div>
            <button
              type="submit"
              className="l-reveal w-full rounded-full bg-ink py-3 text-sm font-medium text-paper transition-transform duration-200 hover:scale-[1.02] active:scale-95"
            >
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p className="l-reveal mt-6 text-center text-sm text-muted">
            {mode === "login" ? "Pas encore de compte ? " : "Déjà inscrit ? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-medium text-ink underline-offset-4 hover:underline"
            >
              {mode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>

          <p className="l-reveal mt-8 text-center text-xs text-muted">
            <a href="/" className="hover:text-ink">← Retour au site</a>
          </p>
        </div>
      </div>
    </div>
  );
}
