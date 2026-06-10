"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <Reveal>
          <div className="gradient-border relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-20 text-center">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-[-10rem] h-[420px] w-[760px] -translate-x-1/2 glow blur-[90px]" />
              <div className="absolute inset-0 bg-grid bg-radial-fade opacity-30" />
            </div>
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Your website deserves better.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-neutral-400">
                Paste your URL and watch it become the site you always wished
                you had — in minutes, not months.
              </p>
              <div className="mt-8 flex justify-center">
                <Link href="/dashboard">
                  <Button size="lg" variant="gradient" className="h-12">
                    Revive my website
                    <ArrowRight className="h-4 w-4" />
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
