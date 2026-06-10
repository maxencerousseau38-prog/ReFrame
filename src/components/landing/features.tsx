"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChatCircle,
  MagnifyingGlass,
  SquaresFour,
  Gauge,
  RocketLaunch,
  ArrowRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/** Double-bezel bento cell: outer shell + inner core (high-end 4.A). */
function Cell({
  span,
  i,
  inner,
  children,
}: {
  span: string;
  i: number;
  inner?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn("rounded-[1.75rem] bg-white/[0.04] p-1.5 ring-1 ring-inset ring-white/10", span)}
    >
      <div className={cn("bezel-core flex h-full flex-col rounded-[1.4rem] p-6", inner ?? "bg-card")}>
        {children}
      </div>
    </motion.div>
  );
}

function Head({ icon: Icon, title, body, dark }: { icon: any; title: string; body: string; dark?: boolean }) {
  return (
    <>
      <span
        className={cn(
          "mb-4 flex h-10 w-10 items-center justify-center rounded-xl",
          dark ? "bg-black/10 text-accent-foreground" : "bg-white/5 text-accent ring-1 ring-inset ring-white/10"
        )}
      >
        <Icon weight="bold" className="h-5 w-5" />
      </span>
      <h3 className={cn("text-lg font-semibold", dark ? "text-accent-foreground" : "text-white")}>{title}</h3>
      <p className={cn("mt-2 text-sm leading-relaxed", dark ? "text-accent-foreground/70" : "text-zinc-400")}>{body}</p>
    </>
  );
}

export function Features() {
  return (
    <section id="features" className="px-6 py-32">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="mx-auto max-w-3xl text-balance text-center font-semibold leading-[1.05] tracking-tight text-white [font-size:clamp(2rem,4.5vw,3.25rem)]">
          From a tired homepage to a site people actually finish.
        </h2>

        <div className="mt-14 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-3 [grid-auto-flow:dense] md:grid-cols-6">
          {/* Big: AI editor as a real mini chat */}
          <Cell i={0} span="md:col-span-4 md:row-span-2">
            <Head
              icon={ChatCircle}
              title="Edit by chatting"
              body="Type what you want changed and watch it happen live. No menus, no code, no waiting on a developer."
            />
            <div className="mt-auto space-y-3 rounded-2xl border border-white/8 bg-background/60 p-4">
              <div className="flex justify-end">
                <span className="max-w-[78%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-[13px] text-accent-foreground">
                  Make the hero punchier and add a booking section
                </span>
              </div>
              <div className="flex justify-start">
                <span className="max-w-[78%] rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-3.5 py-2 text-[13px] text-zinc-200">
                  Done. New headline is live and a booking block sits under it.
                </span>
              </div>
            </div>
          </Cell>

          <Cell i={1} span="md:col-span-2">
            <Head
              icon={MagnifyingGlass}
              title="Reads your business"
              body="Detects your industry and pulls your real copy, images and structure first."
            />
          </Cell>

          <Cell i={2} span="md:col-span-2">
            <Head
              icon={SquaresFour}
              title="Picks the right layout"
              body="Sections chosen for your sector from a vetted block library, never random."
            />
          </Cell>

          <Cell i={3} span="md:col-span-3">
            <Head
              icon={Gauge}
              title="Fast and findable"
              body="Clean semantic markup, quick loads and sensible metadata are built in from the first render."
            />
          </Cell>

          {/* Accent inner core for visual variety */}
          <Cell i={4} span="md:col-span-3" inner="bg-accent">
            <Head
              dark
              icon={RocketLaunch}
              title="Ships to the edge"
              body="Publish to a global network in one click. Custom domains and SSL handled for you."
            />
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-foreground">
              Go live in seconds <ArrowRight weight="bold" className="h-3.5 w-3.5" />
            </span>
          </Cell>
        </div>
      </div>
    </section>
  );
}
