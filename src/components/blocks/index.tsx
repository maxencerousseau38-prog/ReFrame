"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
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

// Self-contained font stacks (no webfont fetch) so static exports stay portable.
const fontStacks: Record<Theme["font"], string> = {
  inter: "var(--font-geist-sans), Inter, system-ui, -apple-system, sans-serif",
  geist: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
  serif: "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif",
};

// When a theme doesn't specify surfaces, derive them from the brand mood so the
// canvas adapts (warm brands get a warm off-white, tech brands stay crisp).
const moodSurface: Record<Theme["mood"], { surface: string; surface2: string; ink: string }> = {
  warm: { surface: "#faf6f0", surface2: "#f0e7da", ink: "#2a2320" },
  elegant: { surface: "#f7f6f3", surface2: "#ece9e3", ink: "#211e1b" },
  minimal: { surface: "#ffffff", surface2: "#f5f5f5", ink: "#0a0a0a" },
  bold: { surface: "#ffffff", surface2: "#f4f4f5", ink: "#111111" },
};

function themeStyle(theme: Theme): React.CSSProperties {
  const s = moodSurface[theme.mood] ?? moodSurface.minimal;
  return {
    // exposed to children as CSS custom properties
    ["--brand" as string]: theme.primary,
    ["--brand-accent" as string]: theme.accent,
    ["--brand-radius" as string]: radiusMap[theme.radius],
    ["--brand-surface" as string]: theme.surface ?? s.surface,
    ["--brand-surface-2" as string]: theme.surface2 ?? s.surface2,
    ["--brand-ink" as string]: theme.ink ?? s.ink,
    ["--brand-font" as string]: fontStacks[theme.font],
    ["--brand-mood" as string]: theme.mood,
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

/**
 * Editorial luxury hero. Serif display, a tall framed client portrait, a faint
 * monumental wordmark and a hairline caption rule. Everything is token-driven:
 * the warm canvas comes from `--brand-surface`, the display face from
 * `--brand-font`, the rule + eyebrow from `--brand-accent`. Suits hospitality,
 * real estate, retail and any brand that wants to read as a magazine, not an app.
 */
function HeroEditorial({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const rise = reduce
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

  return (
    <section
      className="relative overflow-hidden px-6 py-20 sm:py-28"
      style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}
    >
      {/* faint monumental wordmark, anchored bottom, clipped by the section */}
      {props.brand && (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-[0.18em] left-0 select-none whitespace-nowrap font-medium leading-none [font-size:clamp(7rem,26vw,20rem)]"
          style={{ fontFamily: "var(--brand-font)", color: "var(--brand)", opacity: 0.04 }}
        >
          {props.brand}
        </span>
      )}

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          {props.eyebrow && (
            <motion.span
              initial="hidden"
              animate="visible"
              variants={rise}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em]"
              style={{ color: "var(--brand-accent)" }}
            >
              <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
              {props.eyebrow}
            </motion.span>
          )}
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={rise}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-[clamp(2.5rem,6vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.02em]"
            style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
          >
            {props.title}
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={rise}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-6 max-w-md text-lg leading-relaxed"
            style={{ color: "var(--brand-ink)", opacity: 0.72 }}
          >
            {props.subtitle}
          </motion.p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <button
              className="px-7 py-3.5 text-sm font-medium tracking-wide text-white shadow-sm transition-transform active:scale-[0.98]"
              style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}
            >
              {props.primaryCta}
            </button>
            <button
              className="text-sm font-medium underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: "var(--brand)" }}
            >
              {props.secondaryCta} &rarr;
            </button>
          </div>
        </div>

        {/* client portrait, editorial frame + hairline caption */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div
            className="relative aspect-[4/5] overflow-hidden bg-cover bg-center"
            style={{
              borderRadius: "var(--brand-radius)",
              backgroundImage: props.image
                ? `url(${props.image})`
                : `linear-gradient(150deg, var(--brand-surface-2), var(--brand-accent))`,
            }}
          >
            {!props.image && (
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_20%,#fff_1px,transparent_1px)] [background-size:22px_22px]" />
            )}
          </div>
          <div
            className="mt-4 flex items-center gap-4 text-[0.7rem] uppercase tracking-[0.24em]"
            style={{ color: "var(--brand-ink)", opacity: 0.55 }}
          >
            <span>{props.caption || props.eyebrow || "Featured"}</span>
            <span className="h-px flex-1" style={{ background: "currentColor", opacity: 0.4 }} />
            <span>01</span>
          </div>
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
/*  Premium animated variants                                                 */
/* -------------------------------------------------------------------------- */

/** Tech/SaaS hero with a slowly drifting accent aura. */
function HeroSpotlight({ props }: { props: any }) {
  return (
    <section className="relative overflow-hidden px-6 py-28 text-center sm:py-36">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-4rem] h-[420px] w-[680px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--brand-accent), transparent)", opacity: 0.22 }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.16, 0.28, 0.16] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "26px 26px", color: "var(--brand)" }}
      />
      <div className="relative mx-auto max-w-3xl">
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
            className="px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform active:scale-[0.98]"
            style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}
          >
            {props.primaryCta}
          </button>
          <button
            className="border px-6 py-3 text-sm font-medium transition-colors"
            style={{ borderColor: "var(--brand-accent)", color: "var(--brand)", borderRadius: "var(--brand-radius)" }}
          >
            {props.secondaryCta}
          </button>
        </div>
      </div>
    </section>
  );
}

/** Asymmetric bento; first item is featured, cards lift on hover. */
function FeaturesBento({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--brand)" }}>
            {props.title}
          </h2>
          {props.subtitle && <p className="mt-3 text-neutral-500">{props.subtitle}</p>}
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:[grid-auto-flow:dense]">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className={cn(
                "group border bg-white p-6 transition-transform duration-300 hover:-translate-y-1",
                i === 0 && "md:col-span-2 md:row-span-2"
              )}
              style={{ borderRadius: "var(--brand-radius)", borderColor: "#ececec" }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center text-white"
                style={{ background: "var(--brand-accent)", borderRadius: "calc(var(--brand-radius) * 0.7)" }}
              >
                <BlockIcon name={item.icon} className="h-5 w-5" />
              </div>
              <h3 className={cn("font-semibold", i === 0 ? "text-xl" : "text-base")} style={{ color: "var(--brand)" }}>
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
/*  Registry + renderer                                                       */
/* -------------------------------------------------------------------------- */

const REGISTRY: Record<string, React.ComponentType<{ props: any }>> = {
  HeroPremium1,
  HeroPremium2,
  HeroEditorial,
  HeroSpotlight,
  FeaturesGrid1,
  FeaturesBento,
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
    <div
      style={{
        ...themeStyle(schema.theme),
        background: "var(--brand-surface)",
        color: "var(--brand-ink)",
      }}
    >
      {schema.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
