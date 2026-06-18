"use client";

import {
  ShieldCheck,
  Eye,
  CreditCard,
  ArrowsClockwise,
  ChatCircleText,
  LockKey,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { BlurReveal } from "@/components/ui/blur-reveal";

type Promise_ = { icon: PhosphorIcon; title: string; body: string };

// Every claim here is literally true of how ReFrame works. No fabricated proof.
const promises: Promise_[] = [
  {
    icon: CreditCard,
    title: "Free preview, no card",
    body: "See your site fully rebuilt before you pay anything. You only pay when you choose to publish it live.",
  },
  {
    icon: ShieldCheck,
    title: "Your content, preserved",
    body: "We rebuild from your real text, logo, images and colours. We never invent a business or fake your details.",
  },
  {
    icon: ArrowsClockwise,
    title: "No lock-in",
    body: "Keep your own domain, connect it with automatic SSL, and cancel anytime. Your site stays yours.",
  },
  {
    icon: Eye,
    title: "Only your public pages",
    body: "We read what is already public on the web. We never ask for your passwords, CMS or hosting access.",
  },
  {
    icon: ChatCircleText,
    title: "Honest about limits",
    body: "If a site is behind bot-protection and we can't fully read it, we tell you, instead of faking the result.",
  },
  {
    icon: LockKey,
    title: "Edit anything, anytime",
    body: "Change copy, colours, add pages or sections by chatting in plain English. Changes go live instantly.",
  },
];

export function Trust() {
  return (
    <section id="trust" className="px-6 py-32 sm:py-40">
      <div className="mx-auto max-w-[1100px]">
        <BlurReveal className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">No risk, no lock-in</p>
          <h2 className="mt-4 font-semibold leading-[1.04] tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,3.75rem)]">
            Built to earn your trust.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
            We're new, so we won't pretend to have thousands of customers. Instead,
            here's exactly how ReFrame protects you.
          </p>
        </BlurReveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promises.map((p, i) => (
            <BlurReveal key={p.title} delay={i * 0.06}>
              <div className="panel flex h-full flex-col rounded-[1.5rem] p-7 ring-1 ring-inset ring-white/10">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
                  <p.icon weight="bold" className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">{p.body}</p>
              </div>
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
