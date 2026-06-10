"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Sparkle,
  ShieldCheck,
  Lightning,
  Heart,
  Star,
  Check,
  Plus,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import type { Block, SiteSchema, Theme } from "@/lib/generation/types";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Theme plumbing                                                            */
/* -------------------------------------------------------------------------- */

const radiusMap: Record<Theme["radius"], string> = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1.25rem",
};

function themeStyle(theme: Theme): React.CSSProperties {
  return {
    // exposed to children as CSS custom properties
    ["--brand" as string]: theme.primary,
    ["--brand-accent" as string]: theme.accent,
    ["--brand-radius" as string]: radiusMap[theme.radius],
  };
}

// Generated sites pick icons by name; map those names to Phosphor glyphs.
const ICONS: Record<string, PhosphorIcon> = {
  Sparkle,
  ShieldCheck,
  Lightning,
  Heart,
  Star,
  Check,
};

function BlockIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] || Sparkle;
  return <Cmp weight="bold" className={className} />;
}

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/* -------------------------------------------------------------------------- */
/*  Hero blocks                                                               */
/* -------------------------------------------------------------------------- */

function HeroPremium1({ props }: { props: any }) {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[760px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: `radial-gradient(closest-side, var(--brand-accent), transparent)` }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        {props.eyebrow && (
          <span
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
            style={{ borderColor: "var(--brand-accent)", color: "var(--brand-accent)" }}
          >
            {props.eyebrow}
          </span>
        )}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fade}
          transition={{ duration: 0.6 }}
          className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl"
          style={{ color: "var(--brand)" }}
        >
          {props.title}
        </motion.h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-500">{props.subtitle}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            className="px-6 py-3 text-sm font-medium text-white shadow-lg"
            style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}
          >
            {props.primaryCta}
          </button>
          <button
            className="border px-6 py-3 text-sm font-medium"
            style={{ borderColor: "var(--brand-accent)", color: "var(--brand)", borderRadius: "var(--brand-radius)" }}
          >
            {props.secondaryCta}
          </button>
        </div>
      </div>
    </section>
  );
}

function HeroPremium2({ props }: { props: any }) {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          {props.eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--brand-accent)" }}>
              {props.eyebrow}
            </span>
          )}
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6 }}
            className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            style={{ color: "var(--brand)" }}
          >
            {props.title}
          </motion.h1>
          <p className="mt-5 max-w-md text-lg text-neutral-500">{props.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="px-6 py-3 text-sm font-medium text-white shadow-lg"
              style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}
            >
              {props.primaryCta}
            </button>
            <button
              className="border px-6 py-3 text-sm font-medium"
              style={{ borderColor: "var(--brand)", color: "var(--brand)", borderRadius: "var(--brand-radius)" }}
            >
              {props.secondaryCta}
            </button>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative aspect-[4/3] overflow-hidden bg-cover bg-center"
          style={{
            borderRadius: "var(--brand-radius)",
            backgroundImage: props.image
              ? `url(${props.image})`
              : `linear-gradient(135deg, var(--brand-accent), var(--brand))`,
          }}
        >
          {!props.image && (
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#fff_1px,transparent_1px)] [background-size:24px_24px]" />
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Features                                                                  */
/* -------------------------------------------------------------------------- */

function FeaturesGrid1({ props }: { props: any }) {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--brand)" }}>
            {props.title}
          </h2>
          {props.subtitle && <p className="mt-3 text-neutral-500">{props.subtitle}</p>}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {props.items?.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="border bg-white p-6"
              style={{ borderRadius: "var(--brand-radius)", borderColor: "#ececec" }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center text-white"
                style={{ background: "var(--brand-accent)", borderRadius: "calc(var(--brand-radius) * 0.7)" }}
              >
                <BlockIcon name={item.icon} className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold" style={{ color: "var(--brand)" }}>
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Testimonials                                                              */
/* -------------------------------------------------------------------------- */

function TestimonialsSlider1({ props }: { props: any }) {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--brand)" }}>
          {props.title}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {props.items?.map((t: any, i: number) => (
            <figure
              key={i}
              className="flex flex-col justify-between border bg-white p-6"
              style={{ borderRadius: "var(--brand-radius)", borderColor: "#ececec" }}
            >
              <blockquote className="text-[15px] leading-relaxed text-neutral-700">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: "var(--brand-accent)" }}
                >
                  {t.name?.split(" ").map((n: string) => n[0]).join("")}
                </span>
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--brand)" }}>{t.name}</div>
                  <div className="text-xs text-neutral-400">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

function FAQAccordion1({ props }: { props: any }) {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--brand)" }}>
          {props.title}
        </h2>
        <div className="mt-10 divide-y border" style={{ borderRadius: "var(--brand-radius)", borderColor: "#ececec" }}>
          {props.items?.map((item: any, i: number) => (
            <div key={i} className="px-6">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between py-5 text-left">
                <span className="text-[15px] font-medium" style={{ color: "var(--brand)" }}>{item.question}</span>
                <Plus weight="bold" className={cn("h-5 w-5 text-neutral-400 transition-transform", open === i && "rotate-45")} />
              </button>
              {open === i && <p className="pb-5 text-sm leading-relaxed text-neutral-500">{item.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA                                                                       */
/* -------------------------------------------------------------------------- */

function CTASection1({ props }: { props: any }) {
  return (
    <section className="px-6 py-20">
      <div
        className="relative mx-auto max-w-5xl overflow-hidden px-8 py-16 text-center"
        style={{ background: "var(--brand)", borderRadius: "calc(var(--brand-radius) * 1.5)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(600px 200px at 50% 0%, var(--brand-accent), transparent)` }}
        />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{props.title}</h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">{props.subtitle}</p>
          <button
            className="mt-8 px-7 py-3 text-sm font-medium text-white shadow-lg"
            style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}
          >
            {props.cta}
          </button>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contact                                                                   */
/* -------------------------------------------------------------------------- */

function ContactFormPremium1({ props }: { props: any }) {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--brand)" }}>
            {props.title}
          </h2>
          <p className="mt-3 text-neutral-500">{props.subtitle}</p>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="Name" className="h-11 border px-4 text-sm outline-none" style={{ borderRadius: "var(--brand-radius)", borderColor: "#ececec" }} />
            <input placeholder="Email" className="h-11 border px-4 text-sm outline-none" style={{ borderRadius: "var(--brand-radius)", borderColor: "#ececec" }} />
          </div>
          <textarea placeholder="How can we help?" rows={4} className="w-full border px-4 py-3 text-sm outline-none" style={{ borderRadius: "var(--brand-radius)", borderColor: "#ececec" }} />
          <button className="px-6 py-3 text-sm font-medium text-white" style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}>
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

function Footer1({ props }: { props: any }) {
  return (
    <footer className="border-t px-6 py-12" style={{ borderColor: "#ececec" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="font-semibold" style={{ color: "var(--brand)" }}>{props.brand}</span>
        <span className="text-sm text-neutral-400">© {new Date().getFullYear()} {props.brand}. All rights reserved.</span>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Registry + renderer                                                       */
/* -------------------------------------------------------------------------- */

const REGISTRY: Record<string, React.ComponentType<{ props: any }>> = {
  HeroPremium1,
  HeroPremium2,
  FeaturesGrid1,
  TestimonialsSlider1,
  FAQAccordion1,
  CTASection1,
  ContactFormPremium1,
  Footer1,
};

function BlockRenderer({ block }: { block: Block }) {
  const Cmp = REGISTRY[block.variant];
  if (!Cmp) return null;
  return <Cmp props={block.props} />;
}

/** Renders a full generated site from its schema, applying the theme. */
export function SiteRenderer({ schema }: { schema: SiteSchema }) {
  return (
    <div className="bg-white" style={themeStyle(schema.theme)}>
      {schema.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
