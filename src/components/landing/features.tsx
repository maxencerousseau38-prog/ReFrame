"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChatCircleDots,
  MagnifyingGlass,
  Layout,
  Gauge,
  RocketLaunch,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

function Cell({
  className,
  children,
  i,
}: {
  className?: string;
  children: React.ReactNode;
  i: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-card p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

function Label({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <>
      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
        <Icon weight="bold" className="h-5 w-5" />
      </span>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
    </>
  );
}

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Everything from analysis to live site.
        </h2>
        <p className="mt-4 max-w-md text-zinc-400">
          One tool does the audit, the redesign, the edits and the deploy.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-3">
          {/* Big feature: the AI editor, shown as a real mini chat */}
          <Cell i={0} className="lg:col-span-2 lg:row-span-2">
            <Label
              icon={ChatCircleDots}
              title="Edit by chatting"
              body="Type what you want changed and watch it happen. No menus, no code, no waiting on a developer."
            />
            <div className="mt-6 space-y-3 rounded-xl border border-white/8 bg-background/60 p-4">
              <div className="flex justify-end">
                <span className="max-w-[80%] rounded-2xl rounded-br-sm bg-accent px-3.5 py-2 text-[13px] text-accent-foreground">
                  Make the hero punchier and add a booking section
                </span>
              </div>
              <div className="flex justify-start">
                <span className="max-w-[80%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-3.5 py-2 text-[13px] text-zinc-200">
                  Done. New headline is live and a booking block sits under it.
                </span>
              </div>
            </div>
          </Cell>

          <Cell i={1}>
            <Label
              icon={MagnifyingGlass}
              title="Reads your business"
              body="It detects your industry and pulls your real copy, images and structure before redesigning."
            />
          </Cell>

          <Cell i={2}>
            <Label
              icon={Layout}
              title="Picks the right layout"
              body="Sections are chosen for your sector from a vetted block library, never a random template."
            />
          </Cell>

          {/* Wide cell */}
          <Cell i={3} className="lg:col-span-2">
            <Label
              icon={Gauge}
              title="Fast and findable"
              body="Clean semantic markup, quick load times and sensible metadata are built in from the first render."
            />
          </Cell>

          {/* Accent-tinted cell for visual variety */}
          <Cell i={4} className="border-accent/25 bg-accent/[0.07]">
            <Label
              icon={RocketLaunch}
              title="Ships to the edge"
              body="Publish to a global network in one click. Custom domains and SSL handled for you."
            />
          </Cell>
        </div>
      </div>
    </section>
  );
}
