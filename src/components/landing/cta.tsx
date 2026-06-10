"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { IslandButton } from "@/components/ui/island-button";
import { Bezel } from "@/components/ui/bezel";

export function FinalCta() {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-[1100px]">
        <BlurReveal>
          <Bezel innerClassName="relative overflow-hidden px-8 py-24 text-center sm:py-28">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-[-8rem] h-[420px] w-[760px] -translate-x-1/2 ambient blur-[70px]" />
              <div className="absolute inset-0 bg-grid bg-fade-b opacity-30" />
            </div>
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance font-semibold leading-[1.05] tracking-tight text-white [font-size:clamp(2.25rem,5vw,3.75rem)]">
                Your website should be working harder than this.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-zinc-400">
                Paste your link and watch it become the site you always wanted,
                in minutes rather than months.
              </p>
              <div className="mt-9 flex justify-center">
                <IslandButton href="/dashboard" variant="accent">
                  Start for free
                </IslandButton>
              </div>
            </div>
          </Bezel>
        </BlurReveal>
      </div>
    </section>
  );
}
