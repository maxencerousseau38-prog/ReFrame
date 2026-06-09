"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeUrl } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    // On amorce le parcours d'inscription avec l'URL pré-remplie.
    const params = normalized ? `?site=${encodeURIComponent(normalized)}` : "";
    router.push(`/inscription${params}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Fonds décoratifs */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.4]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[40rem] aurora"
        animate={{ scale: [1, 1.05, 1], y: [0, -16, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show">
            <Link
              href="/fonctionnalites"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
            >
              <Sparkles className="size-3.5 text-brand" />
              Site refait + hébergé + toujours à jour
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="show"
            className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            Ton site refait,{" "}
            <span className="text-gradient-brand">hébergé et toujours à jour</span>.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="show"
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
          >
            Pour les artisans, restaurants, garages et commerces locaux. On modernise votre
            site, on l'héberge sur une infra rapide et sécurisée, et vous le modifiez en
            quelques clics. Pour quelques euros par mois.
          </motion.p>

          {/* Capture d'URL */}
          <motion.form
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="show"
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-lg flex-col gap-2 sm:flex-row"
          >
            <Input
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="votresite.fr (ou laissez vide)"
              aria-label="Adresse de votre site actuel"
              className="h-12 flex-1 bg-background/80 text-base shadow-sm backdrop-blur"
            />
            <Button type="submit" size="lg" className="h-12 shadow-md">
              Voir mon avant/après
              <ArrowRight className="size-4" />
            </Button>
          </motion.form>

          <motion.div
            variants={fadeUp}
            custom={4}
            initial="hidden"
            animate="show"
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-brand" /> SSL & sauvegardes inclus
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-4 text-brand" /> Mise en ligne en quelques jours
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-4 text-brand" /> Sans engagement
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
