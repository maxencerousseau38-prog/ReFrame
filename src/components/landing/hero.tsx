"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section className="relative overflow-hidden pt-40 pb-28 sm:pt-52 sm:pb-36">
      {/* Background: animated mesh glow + dotted grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-radial-fade opacity-50" />
        <motion.div
          animate={{ x: [-40, 40, -40], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-[-6rem] h-[640px] w-[940px] -translate-x-1/2 glow blur-[90px]"
        />
        <motion.div
          animate={{ x: [60, -30, 60], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[12%] top-40 h-[360px] w-[360px] glow-pink blur-[80px]"
        />
        {/* contained 3D accent floating near the top */}
        <div className="absolute left-1/2 top-16 h-[420px] w-[620px] -translate-x-1/2 sm:top-20">
          <HeroScene />
        </div>
        {/* fade the bottom into the page */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-7 flex justify-center">
            <div className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-xs backdrop-blur">
              <span className="flex items-center gap-1 rounded-full bg-[linear-gradient(110deg,#6366f1,#d946ef)] px-2 py-0.5 font-medium text-white">
                <Star className="h-3 w-3 fill-white" /> New
              </span>
              <span className="text-neutral-300">AI redesign engine v2 is live</span>
              <ArrowRight className="h-3 w-3 text-neutral-500 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl">
            Turn any website into a
            <br className="hidden sm:block" />
            <span className="gradient-text"> premium experience</span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-balance text-lg leading-relaxed text-neutral-400">
            Paste a URL. SiteRevive AI analyzes your existing site and rebuilds
            it into a modern, high-converting experience — fully editable with a
            built-in AI editor.
          </p>

          {/* Primary CTA — the URL analyzer */}
          <form
            onSubmit={handleAnalyze}
            className="group mx-auto mt-10 flex max-w-xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
          >
            <div className="relative flex-1">
              <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourwebsite.com"
                className="h-12 w-full rounded-full bg-transparent pl-12 pr-4 text-[15px] text-white placeholder:text-neutral-500 focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              variant="gradient"
              disabled={loading}
              className="h-12 px-7"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Analyze
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-neutral-500">
            No credit card required · First redesign free · Ready in ~3 minutes
          </p>
        </motion.div>

        {/* Trusted-by row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-24 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          <span className="w-full text-center text-xs uppercase tracking-widest text-neutral-600">
            Trusted by teams who care about craft
          </span>
          {["Vercel", "Linear", "Framer", "Stripe", "Supabase"].map((n) => (
            <span
              key={n}
              className="text-sm font-semibold tracking-tight text-neutral-500 transition-colors hover:text-neutral-300"
            >
              {n}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
