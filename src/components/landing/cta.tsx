"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1100px] px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card px-8 py-20 text-center sm:py-24">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-[360px] w-[680px] -translate-x-1/2 accent-wash blur-2xl" />
              <div className="absolute inset-0 bg-grid bg-fade-tl opacity-20" />
            </div>
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Your website should be working harder than this.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-zinc-400">
                Paste your link and watch it become the site you always wanted,
                in minutes rather than months.
              </p>
              <div className="mt-8 flex justify-center">
                <Link href="/dashboard">
                  <Button size="lg">
                    Rebuild my site
                    <ArrowRight weight="bold" className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
