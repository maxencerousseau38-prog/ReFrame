"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 3D scene loaded client-side only to keep the initial bundle light.
const HeroScene = dynamic(() => import("@/components/three/hero-scene"), {
  ssr: false,
});

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    const clean = url.trim().replace(/^https?:\/\//, "");
    router.push(`/dashboard?url=${encodeURIComponent(clean)}`);
  }

  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      {/* Background layers: grid + controlled glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-radial-fade opacity-60" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 glow blur-2xl" />
      </div>

      {/* Subtle 3D object floating top-right */}
      <div className="pointer-events-none absolute right-[-6%] top-20 hidden h-[420px] w-[420px] opacity-90 lg:block">
        <HeroScene />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 flex justify-center">
            <Badge variant="glow">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
              </span>
              Now with AI redesign engine v2
            </Badge>
          </div>

          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Turn any website into a
            <span className="gradient-text"> premium experience</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
            Paste a URL. SiteRevive AI analyzes your existing site and rebuilds
            it into a modern, high-converting experience — fully editable with a
            built-in AI editor.
          </p>

          {/* Primary CTA — the URL analyzer */}
          <form
            onSubmit={handleAnalyze}
            className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourwebsite.com"
                className="h-14 w-full rounded-xl border border-border bg-white/80 pl-12 pr-4 text-[15px] shadow-sm backdrop-blur transition-all focus:border-foreground/20 focus:outline-none focus:ring-4 focus:ring-foreground/5"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              variant="gradient"
              disabled={loading}
              className="h-14 px-7"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Analyze your website
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required · First redesign free · Ready in ~3 minutes
          </p>
        </motion.div>

        {/* Trusted-by row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-20 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60"
        >
          {["Vercel", "Linear", "Framer", "Stripe", "Supabase"].map((n) => (
            <span
              key={n}
              className="text-sm font-semibold tracking-tight text-muted-foreground"
            >
              {n}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
