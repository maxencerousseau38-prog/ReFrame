"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Offscreen frame renderer for the scroll sequence. Visiting /frame?p=0..1
 * paints a single deterministic frame of the "rebuild" morph: a dated site
 * (left) is wiped away to reveal the rebuilt one (right) as p goes 0 -> 1,
 * with a subtle push-in. No external assets, so frames render fully anywhere.
 */
function Scene() {
  const sp = useSearchParams();
  const p = Math.max(0, Math.min(1, parseFloat(sp.get("p") || "0")));

  const reveal = p * 100; // how much "before" has been eaten from the left
  const scale = 0.965 + p * 0.035;
  const glow = 0.25 + p * 0.55;

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#030303]">
      <div
        className="absolute left-1/2 top-1/2 h-[620px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{
          opacity: glow,
          background:
            "radial-gradient(45% 50% at 50% 50%, rgba(53,226,235,0.5), rgba(53,226,235,0.08) 45%, transparent 75%)",
        }}
      />

      <div
        className="relative w-[960px] overflow-hidden rounded-[1.5rem] border border-white/12 shadow-[0_60px_160px_-40px_rgba(0,0,0,0.9)]"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="flex items-center gap-2 border-b border-white/8 bg-zinc-900 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <div className="ml-3 rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-500">
            hartleyandsons.co.uk
          </div>
        </div>

        <div className="relative aspect-[16/9]">
          <div className="absolute inset-0"><After /></div>
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${reveal}% 0 0)` }}>
            <Before />
          </div>
          {p > 0.01 && p < 0.99 && (
            <div className="absolute inset-y-0 z-10 w-px bg-white/70" style={{ left: `${100 - reveal}%` }} />
          )}
        </div>
      </div>
    </div>
  );
}

function Before() {
  return (
    <div className="h-full w-full bg-[#eceae3] p-10 font-serif text-[#2b2b2b]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between border-b-2 border-[#9a9a8e] pb-3">
          <span className="text-lg font-bold text-[#1f4e79]">HARTLEY &amp; SONS PLUMBING</span>
          <div className="flex gap-3 text-xs text-[#1f4e79] underline">
            <span>Home</span><span>Services</span><span>Contact</span>
          </div>
        </div>
        <div className="mb-4 h-32 w-full bg-[#c9c7bb]" />
        <h3 className="mb-2 text-xl font-bold">Welcome to our website</h3>
        <p className="max-w-md text-sm leading-relaxed text-[#555]">
          Family plumbing business serving the area since 1994. Bathrooms,
          boilers and emergency callouts. Phone for a quote today.
        </p>
        <div className="mt-4 inline-block border border-[#1f4e79] bg-[#dcdcd2] px-4 py-1 text-xs text-[#1f4e79]">Click here to contact us</div>
      </div>
    </div>
  );
}

function After() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-white text-zinc-900">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-cyan-100 via-white to-white" />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="relative flex h-full flex-col justify-center px-16">
        <span className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span className="h-5 w-5 rounded-md bg-zinc-900" /> Hartley &amp; Sons
        </span>
        <h3 className="mt-6 max-w-2xl font-semibold leading-[0.98] tracking-[-0.03em] [font-size:clamp(2rem,4vw,3.25rem)]">
          Plumbing done right, the first time.
        </h3>
        <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-500">
          Bathrooms, boilers and 24/7 emergencies. Upfront pricing, work
          guaranteed in writing.
        </p>
        <div className="mt-7 flex gap-3">
          <span className="rounded-full bg-zinc-900 px-5 py-2.5 text-[13px] font-medium text-white">Get a free quote</span>
          <span className="rounded-full border border-zinc-300 px-5 py-2.5 text-[13px] font-medium text-zinc-700">Our work</span>
        </div>
      </div>
    </div>
  );
}

export default function FramePage() {
  return (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
}
