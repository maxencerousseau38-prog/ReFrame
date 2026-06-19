"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion, useInView, MotionConfig } from "framer-motion";
import {
  Sparkle,
  ShieldCheck,
  Lightning,
  Heart,
  Star,
  Check,
  Plus,
  ArrowRight,
  ArrowLeft,
  Phone,
  MapPin,
  CalendarCheck,
  CheckCircle,
  CircleNotch,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import type { Block, BlockType, SiteSchema, Theme } from "@/lib/generation/types";
import { cn } from "@/lib/utils";
import { useParallax } from "./use-parallax";
import { toProxiedUrl } from "@/lib/img";

/**
 * Anchor attributes for a CTA so every button leads somewhere. Defaults to
 * scrolling to the on-page contact section; external links (booking) open in a
 * new tab, while tel:/mailto stay inline.
 */
function ctaAttrs(href?: string): { href: string; target?: string; rel?: string } {
  const h = href || "#contact";
  return /^https?:/i.test(h) ? { href: h, target: "_blank", rel: "noreferrer" } : { href: h };
}

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

// Shared premium entrance easing (Emil Kowalski-style ease-out).
const EASE = [0.16, 1, 0.3, 1] as const;
// Hairline derived from the brand ink, for borders and grid gaps on any canvas.
const HAIRLINE = "color-mix(in srgb, var(--brand-ink) 8%, transparent)";

// Keep the gradient as a fallback layer beneath the image: CSS stacks
// background layers top-to-bottom, and a broken/blocked image paints nothing,
// so the gradient below shows through instead of a blank box. Extracted client
// images are often hotlink-protected or stale, so every image block needs this.
function imageBg(image: string | undefined, gradient: string): string {
  // Route external images through the proxy (control caching/referrer, validate,
  // bypass naive hotlink protection); data URIs and relative paths pass through.
  const url = toProxiedUrl(image);
  return url ? `url(${url}), ${gradient}` : gradient;
}

/* -------------------------------------------------------------------------- */
/*  Hero blocks                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Centered, message-first hero (safe default). A controlled overhead light and a
 * masked line-grid sit behind the headline; both are tinted from the brand, so a
 * blue brand glows blue and a warm brand glows warm. Ported from a SaaS-grade
 * reference onto the token system to stay brand-adaptive.
 */
function HeroPremium1({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  });
  return (
    <section
      className="relative overflow-hidden px-6 pb-28 pt-32"
      style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}
    >
      {/* controlled overhead light, tinted from the brand accent */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 z-0 h-[500px]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 0%, color-mix(in srgb, var(--brand-accent) 18%, transparent), transparent 70%)",
        }}
      />
      {/* masked line grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,#000,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--brand-ink) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--brand-ink) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {props.eyebrow && (
          <motion.span
            {...rise(0)}
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur"
            style={{
              borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)",
              background: "color-mix(in srgb, var(--brand-surface) 70%, transparent)",
              color: "color-mix(in srgb, var(--brand-ink) 65%, transparent)",
            }}
          >
            {props.eyebrow}
          </motion.span>
        )}

        <motion.h1
          {...rise(0.05)}
          className="mt-6 text-5xl font-semibold tracking-tight [text-wrap:balance] md:text-6xl"
          style={{ color: "var(--brand)" }}
        >
          {props.title}
        </motion.h1>

        {props.subtitle && (
          <motion.p
            {...rise(0.12)}
            className="mx-auto mt-5 max-w-xl text-lg [text-wrap:balance]"
            style={{ color: "var(--brand-ink)", opacity: 0.65 }}
          >
            {props.subtitle}
          </motion.p>
        )}

        <motion.div {...rise(0.2)} className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            {...ctaAttrs(props.primaryHref)}
            className="group inline-flex items-center gap-1.5 px-7 py-3.5 text-sm font-medium text-white transition-transform active:scale-[0.98]"
            style={{
              background: "var(--brand-accent)",
              borderRadius: "var(--brand-radius)",
              boxShadow: "0 12px 34px -10px color-mix(in srgb, var(--brand-accent) 70%, transparent)",
            }}
          >
            {props.primaryCta || props.cta || "Get started"}
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          {props.secondaryCta && (
            <a
              {...ctaAttrs(props.secondaryHref)}
              className="text-sm font-medium underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: "var(--brand)" }}
            >
              {props.secondaryCta}
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function HeroPremium2({ props }: { props: any }) {
  const imgRef = React.useRef<HTMLDivElement>(null);
  useParallax(imgRef);
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
            <a
              {...ctaAttrs(props.primaryHref)}
              className="px-6 py-3 text-sm font-medium text-white shadow-lg"
              style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}
            >
              {props.primaryCta}
            </a>
            {props.secondaryCta && (
              <a
                {...ctaAttrs(props.secondaryHref)}
                className="border px-6 py-3 text-sm font-medium"
                style={{ borderColor: "var(--brand)", color: "var(--brand)", borderRadius: "var(--brand-radius)" }}
              >
                {props.secondaryCta}
              </a>
            )}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative aspect-[4/3] overflow-hidden"
          style={{ borderRadius: "var(--brand-radius)", boxShadow: "0 40px 100px -45px rgba(0,0,0,0.5), 0 0 0 1px color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}
        >
          <div
            ref={imgRef}
            className="absolute -inset-[15%] bg-cover bg-center"
            style={{ backgroundImage: imageBg(props.image, "linear-gradient(135deg, var(--brand-accent), var(--brand))") }}
          />
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
  const imgRef = React.useRef<HTMLDivElement>(null);
  useParallax(imgRef);
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
            <a
              {...ctaAttrs(props.primaryHref)}
              className="px-7 py-3.5 text-sm font-medium tracking-wide text-white shadow-sm transition-transform active:scale-[0.98]"
              style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}
            >
              {props.primaryCta}
            </a>
            {props.secondaryCta && (
              <a
                {...ctaAttrs(props.secondaryHref)}
                className="text-sm font-medium underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: "var(--brand)" }}
              >
                {props.secondaryCta} &rarr;
              </a>
            )}
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
            className="relative aspect-[4/5] overflow-hidden"
            style={{ borderRadius: "var(--brand-radius)", boxShadow: "0 40px 100px -45px rgba(0,0,0,0.5), 0 0 0 1px color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}
          >
            <div
              ref={imgRef}
              className="absolute -inset-[15%] bg-cover bg-center"
              style={{ backgroundImage: imageBg(props.image, "linear-gradient(150deg, var(--brand-surface-2), var(--brand-accent))") }}
            />
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

/**
 * Feature grid as a single bordered card sliced by hairline gaps — cells share
 * one rounded frame and warm to the brand surface on hover. Icon chips use a
 * faint brand-accent wash. Heading is left-aligned (editorial), not centered.
 */
function FeaturesGrid1({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  // Pick columns that divide the item count so the grid never shows an empty
  // cell (e.g. 4 items => 2x2, not 3+1). Most sectors ship 4 or 6 items.
  const lgCols = items.length % 3 === 0 ? "lg:grid-cols-3" : items.length % 2 === 0 ? "lg:grid-cols-2" : "lg:grid-cols-3";
  return (
    <section className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight [text-wrap:balance] md:text-4xl" style={{ color: "var(--brand)" }}>
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="mt-3 text-lg" style={{ color: "var(--brand-ink)", opacity: 0.65 }}>
              {props.subtitle}
            </p>
          )}
        </div>

        <div
          className={cn("mt-12 grid gap-px overflow-hidden border sm:grid-cols-2", lgCols)}
          style={{ borderRadius: "calc(var(--brand-radius) * 1.4)", borderColor: HAIRLINE, background: HAIRLINE }}
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
              className="group bg-white p-7 transition-colors hover:bg-[var(--brand-surface)]"
            >
              <div
                className="flex h-10 w-10 items-center justify-center transition-transform group-hover:scale-105"
                style={{
                  background: "color-mix(in srgb, var(--brand-accent) 12%, transparent)",
                  color: "var(--brand-accent)",
                  borderRadius: "calc(var(--brand-radius) * 0.7)",
                }}
              >
                <BlockIcon name={item.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-medium" style={{ color: "var(--brand)" }}>
                {item.title}
              </h3>
              {item.description && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>
                  {item.description}
                </p>
              )}
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

/**
 * One testimonial at a time on a dark brand band, cross-fading between quotes.
 * Reads bigger and more confident than a card row. Falls back gracefully to a
 * single quote (controls hidden). Dark surface = var(--brand); accent untouched.
 */
function TestimonialsSlider1({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  const [i, setI] = React.useState(0);
  if (!items.length) return null;
  const go = (d: number) => setI((p) => (p + d + items.length) % items.length);
  const t = items[i];

  return (
    <section className="px-6 py-28 text-white" style={{ background: "var(--brand)" }}>
      <div className="mx-auto max-w-3xl text-center">
        {props.title && (
          <p className="text-sm font-medium uppercase tracking-widest text-white/40">{props.title}</p>
        )}

        <div className="relative mt-10 min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <p className="text-2xl font-medium leading-snug [text-wrap:balance] md:text-3xl">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-7 text-sm text-white/60">
                <span className="font-medium text-white">{t.name || t.author}</span>
                {t.role && <span> &middot; {t.role}</span>}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => go(-1)}
              aria-label="Previous"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-xs tabular-nums text-white/40">
              {i + 1} / {items.length}
            </span>
            <button
              onClick={() => go(1)}
              aria-label="Next"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Editorial accordion: hairline-ruled rows (no boxed border), answers that
 * animate open with height + fade, and a toggle chip that fills with the brand
 * accent and rotates to an X when active. Respects reduced motion.
 */
function FAQAccordion1({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const items = (props.items || []) as any[];
  const [open, setOpen] = React.useState(0);
  const collapsed = reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 };

  return (
    <section className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight [text-wrap:balance] md:text-4xl" style={{ color: "var(--brand)" }}>
          {props.title}
        </h2>
        <div className="mt-12 border-t" style={{ borderColor: HAIRLINE }}>
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b" style={{ borderColor: HAIRLINE }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-base font-medium md:text-lg" style={{ color: "var(--brand)" }}>{item.question}</span>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                    style={{ background: isOpen ? "var(--brand-accent)" : "color-mix(in srgb, var(--brand-ink) 6%, transparent)" }}
                  >
                    <Plus
                      weight="bold"
                      className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-45 text-white")}
                      style={isOpen ? undefined : { color: "var(--brand-ink)" }}
                    />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={collapsed}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={collapsed}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-12 text-[15px] leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.65 }}>
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Closing CTA: a dark brand panel with a soft accent glow rising from the top
 * and a light button for maximum contrast. Reveals on scroll into view.
 */
function CTASection1({ props }: { props: any }) {
  return (
    <section className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative mx-auto max-w-4xl overflow-hidden border px-8 py-16 text-center text-white md:px-16 md:py-20"
        style={{
          background: "var(--brand)",
          borderRadius: "28px",
          borderColor: HAIRLINE,
          boxShadow: "0 30px 80px -40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 120% at 50% 0%, color-mix(in srgb, var(--brand-accent) 38%, transparent), transparent 60%)",
          }}
        />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight [text-wrap:balance] md:text-4xl">{props.title}</h2>
          {props.subtitle && (
            <p className="mx-auto mt-4 max-w-lg text-white/60 [text-wrap:balance]">{props.subtitle}</p>
          )}
          <a
            {...ctaAttrs(props.ctaHref)}
            className="group mt-8 inline-flex items-center gap-1.5 bg-white px-7 py-3.5 text-sm font-medium transition-colors hover:bg-white/90"
            style={{ color: "var(--brand)", borderRadius: "var(--brand-radius)" }}
          >
            {props.cta}
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contact                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Two-column contact: an editorial intro beside a framed form card. Inputs are
 * transparent with hairline borders that warm to the brand accent on focus; the
 * submit button matches the hero CTA (accent fill, glow, arrow).
 */
function ContactFormPremium1({ props }: { props: any }) {
  const field =
    "border bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-[color:color-mix(in_srgb,var(--brand-ink)_45%,transparent)] focus:border-[color:var(--brand-accent)]";
  const contact = (props.contact || {}) as { phone?: string; address?: string; bookingUrl?: string };
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      // Only the published site (/s/<slug> or a site subdomain) can deliver; in
      // the in-app preview there is no slug, so the API best-effort accepts it.
      const m = typeof window !== "undefined" ? window.location.pathname.match(/^\/s\/([^/]+)/) : null;
      const slug = m ? m[1] : "";
      const host = typeof window !== "undefined" ? window.location.host : "";
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, host, ...form }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const actions: { label: string; href: string; Icon: PhosphorIcon }[] = [];
  if (contact.phone) actions.push({ label: "Call us", href: `tel:${contact.phone.replace(/\s+/g, "")}`, Icon: Phone });
  if (contact.bookingUrl) actions.push({ label: "Book now", href: contact.bookingUrl, Icon: CalendarCheck });
  if (contact.address)
    actions.push({
      label: "Get directions",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`,
      Icon: MapPin,
    });

  return (
    <section id="contact" className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight [text-wrap:balance] md:text-4xl" style={{ color: "var(--brand)" }}>
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="mt-4 max-w-sm text-lg leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.65 }}>
              {props.subtitle}
            </p>
          )}
          {actions.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {actions.map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  target={a.href.startsWith("http") ? "_blank" : undefined}
                  rel={a.href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--brand-surface)]"
                  style={{ borderColor: HAIRLINE, borderRadius: "var(--brand-radius)", color: "var(--brand)" }}
                >
                  <a.Icon weight="bold" className="h-4 w-4" style={{ color: "var(--brand-accent)" }} />
                  {a.label}
                </a>
              ))}
            </div>
          )}
          {contact.address && (
            <p className="mt-4 flex items-start gap-2 text-sm" style={{ opacity: 0.6 }}>
              <MapPin weight="bold" className="mt-0.5 h-4 w-4 shrink-0" />
              {contact.address}
            </p>
          )}
        </div>

        {status === "sent" ? (
          <div
            className="flex flex-col items-center justify-center gap-3 border bg-white px-7 py-16 text-center sm:p-10"
            style={{ borderRadius: "calc(var(--brand-radius) * 1.4)", borderColor: HAIRLINE }}
          >
            <CheckCircle weight="fill" className="h-10 w-10" style={{ color: "var(--brand-accent)" }} />
            <p className="text-base font-medium" style={{ color: "var(--brand)" }}>Thanks, your message was sent.</p>
            <p className="text-sm" style={{ opacity: 0.6 }}>We&apos;ll get back to you shortly.</p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="space-y-4 border bg-white p-7 sm:p-8"
            style={{ borderRadius: "calc(var(--brand-radius) * 1.4)", borderColor: HAIRLINE, boxShadow: "0 20px 50px -30px rgba(0,0,0,0.18)" }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={cn("h-12", field)} style={{ borderRadius: "var(--brand-radius)", borderColor: HAIRLINE }} />
              <input required placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={cn("h-12", field)} style={{ borderRadius: "var(--brand-radius)", borderColor: HAIRLINE }} />
            </div>
            <textarea required placeholder="How can we help?" rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className={cn("w-full py-3", field)} style={{ borderRadius: "var(--brand-radius)", borderColor: HAIRLINE }} />
            {status === "error" && (
              <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="group inline-flex w-full items-center justify-center gap-1.5 px-6 py-3.5 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-70 sm:w-auto"
              style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)", boxShadow: "0 12px 34px -10px color-mix(in srgb, var(--brand-accent) 70%, transparent)" }}
            >
              {status === "sending" ? <CircleNotch weight="bold" className="h-4 w-4 animate-spin" /> : "Send message"}
              {status !== "sending" && <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Footer: a large brand wordmark in the display face with a back-to-top control,
 * then a hairline rule above the copyright line. Quiet, editorial, brand-toned.
 */
function Footer1({ props }: { props: any }) {
  return (
    <footer className="border-t px-6 py-16" style={{ borderColor: HAIRLINE, color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div
              className="text-2xl font-medium tracking-tight"
              style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
            >
              {props.brand}
            </div>
            <p className="mt-2 text-sm" style={{ opacity: 0.55 }}>Crafted with care.</p>
          </div>
          <a
            href="#top"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors hover:bg-[var(--brand-surface)]"
            style={{ borderColor: HAIRLINE, color: "var(--brand)" }}
          >
            Back to top <span aria-hidden>&uarr;</span>
          </a>
        </div>
        <div
          className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: HAIRLINE, opacity: 0.55 }}
        >
          <span>&copy; {new Date().getFullYear()} {props.brand}. All rights reserved.</span>
          <span>Privacy &middot; Terms</span>
        </div>
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
          <a
            {...ctaAttrs(props.primaryHref)}
            className="px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform active:scale-[0.98]"
            style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}
          >
            {props.primaryCta}
          </a>
          {props.secondaryCta && (
            <a
              {...ctaAttrs(props.secondaryHref)}
              className="border px-6 py-3 text-sm font-medium transition-colors"
              style={{ borderColor: "var(--brand-accent)", color: "var(--brand)", borderRadius: "var(--brand-radius)" }}
            >
              {props.secondaryCta}
            </a>
          )}
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
/*  Premium section components (derived from luxury agency references)         */
/* -------------------------------------------------------------------------- */

/**
 * Animated number. Parses a leading integer off a label like "150+", "98%" or
 * "12" and counts up to it once it scrolls into view; non-numeric values such as
 * "24/7" render verbatim. Respects prefers-reduced-motion (shows the final value
 * immediately). This is the "Measured Credibility" cue from the references.
 */
function StatValue({ value }: { value: string }) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const m = /^(\d[\d,]*)(.*)$/.exec(value.trim());
  const target = m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
  const suffix = m ? m[2] : "";
  const [n, setN] = React.useState(reduce || target === null ? target ?? 0 : 0);

  React.useEffect(() => {
    if (target === null || reduce || !inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, reduce]);

  return <span ref={ref}>{target === null ? value : `${n.toLocaleString()}${suffix}`}</span>;
}

/**
 * Stats credibility band. A dark, rounded panel of monumental counters with
 * hairline dividers and thin uppercase labels — the "190+ / 12 Years / 98%"
 * moment from the references. Dark on the warm canvas for maximum contrast.
 */
function StatsCounter({ props }: { props: any }) {
  const items = (props.items || []) as { value: string; label: string }[];
  return (
    <section className="px-6 py-16 sm:py-20">
      <div
        className="mx-auto max-w-6xl overflow-hidden px-8 py-14 sm:px-12 sm:py-16"
        style={{ background: "var(--brand)", borderRadius: "calc(var(--brand-radius) * 1.5)" }}
      >
        {props.title && (
          <p className="mb-10 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-white/45">
            {props.title}
          </p>
        )}
        <div className="grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cn(
                "px-2 lg:px-8",
                i > 0 && "lg:border-l lg:border-white/10"
              )}
            >
              <div
                className="text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-none tracking-tight text-white"
                style={{ fontFamily: "var(--brand-font)" }}
              >
                <StatValue value={s.value} />
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/50">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Editorial services list. Numbered rows with a serif display title, a short
 * blurb and a hairline rule; each row nudges right and warms to the accent on
 * hover. The "Our tailored services" layout from the references — reads like a
 * magazine index, not a card grid.
 */
function ServicesList({ props }: { props: any }) {
  const items = (props.items || []) as { title: string; description?: string }[];
  return (
    <section className="px-6 py-20 sm:py-28" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-3 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          {props.eyebrow && (
            <span
              className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em]"
              style={{ color: "var(--brand-accent)" }}
            >
              <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
              {props.eyebrow}
            </span>
          )}
          <h2
            className="text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.02em]"
            style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
          >
            {props.title}
          </h2>
        </div>

        <div className="mt-12 border-t" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 14%, transparent)" }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-b py-7 transition-[padding] duration-300 hover:pl-3 sm:grid-cols-[3rem_1fr_1.1fr] sm:gap-x-10"
              style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 14%, transparent)" }}
            >
              <span
                className="text-sm font-medium tabular-nums transition-colors"
                style={{ color: "var(--brand-accent)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className="col-start-2 text-2xl font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl"
                style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
              >
                {item.title}
              </h3>
              {item.description && (
                <p className="col-span-2 mt-3 max-w-md text-sm leading-relaxed sm:col-span-1 sm:col-start-3 sm:mt-0" style={{ opacity: 0.65 }}>
                  {item.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * "Selected work" portfolio. An asymmetric image grid — one monumental lead
 * tile plus a dense run of supporting tiles — with a slow zoom and a caption
 * that lifts on hover. Tiles without a real image fall back to a tonal gradient
 * so the composition stays intact. The "Curated Artistic Visuals" reference.
 */
function PortfolioGrid({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const items = (props.items || []) as { image?: string; title: string; tag?: string }[];
  // Only use the rich image gallery when there are enough real images to fill
  // it; otherwise a clean card grid (avoids half-empty / invisible tiles).
  const withImg = items.filter((p) => p.image);
  const useGallery = withImg.length >= 3;
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {props.eyebrow && (
              <span
                className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em]"
                style={{ color: "var(--brand-accent)" }}
              >
                <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
                {props.eyebrow}
              </span>
            )}
            <h2
              className="mt-5 text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.02em]"
              style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
            >
              {props.title}
            </h2>
          </div>
        </div>

        {!useGallery ? (
          // Not enough real imagery: a clean editorial card grid instead of big
          // empty image tiles (which read as voids, especially on desktop).
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="border p-6 transition-colors hover:bg-[var(--brand-surface)]"
                style={{ borderColor: HAIRLINE, borderRadius: "var(--brand-radius)" }}
              >
                <div className="text-sm font-medium tabular-nums" style={{ color: "var(--brand-accent)" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 text-lg font-medium" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>
                  {p.title}
                </h3>
                {p.tag && (
                  <div className="mt-1.5 text-[0.7rem] uppercase tracking-[0.18em]" style={{ color: "var(--brand-ink)", opacity: 0.55 }}>
                    {p.tag}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
        <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-4 [grid-auto-flow:dense] sm:auto-rows-[220px] lg:grid-cols-3">
          {withImg.map((p, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "group relative overflow-hidden",
                i === 0 && "col-span-2 row-span-2"
              )}
              style={{ borderRadius: "var(--brand-radius)" }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: imageBg(p.image, "linear-gradient(145deg, var(--brand), color-mix(in srgb, var(--brand-accent) 45%, var(--brand)))"),
                }}
              />
              {!p.image && (
                <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_30%_25%,#fff_1px,transparent_1px)] [background-size:22px_22px]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                <div className="translate-y-1 opacity-90 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className={cn("font-medium", i === 0 ? "text-xl" : "text-base")}>{p.title}</div>
                  {p.tag && <div className="mt-0.5 text-[0.7rem] uppercase tracking-[0.18em] text-white/70">{p.tag}</div>}
                </div>
                <span className="text-[0.7rem] tabular-nums text-white/60">{String(i + 1).padStart(2, "0")}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}

/**
 * About split. A tall framed portrait beside a serif narrative with a row of
 * inline credibility chips and a quiet text CTA — the "About ARCHFORM" moment.
 * Token-driven so it inherits the brand canvas, face and accent.
 */
function AboutSplit({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const imgRef = React.useRef<HTMLDivElement>(null);
  useParallax(imgRef);
  const stats = (props.stats || []) as { value: string; label: string }[];
  const rise = reduce
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };

  const hasImage = !!props.image;
  return (
    <section className="px-6 py-20 sm:py-28" style={{ color: "var(--brand-ink)" }}>
      <div className={hasImage ? "mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]" : "mx-auto max-w-2xl text-center"}>
        {hasImage && (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 1.03 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/5] overflow-hidden"
            style={{ borderRadius: "var(--brand-radius)", boxShadow: "0 40px 100px -45px rgba(0,0,0,0.5), 0 0 0 1px color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}
          >
            <div
              ref={imgRef}
              className="absolute -inset-[15%] bg-cover bg-center"
              style={{ backgroundImage: imageBg(props.image, "linear-gradient(150deg, var(--brand-surface-2), var(--brand-accent))") }}
            />
          </motion.div>
        )}

        <div>
          {props.eyebrow && (
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={rise}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em]"
              style={{ color: "var(--brand-accent)" }}
            >
              <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
              {props.eyebrow}
            </motion.span>
          )}
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={rise}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-[clamp(2rem,4.2vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.02em]"
            style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
          >
            {props.title}
          </motion.h2>
          {props.body && (
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={rise}
              transition={{ duration: 0.7, delay: 0.12 }}
              className={cn("mt-6 max-w-md text-lg leading-relaxed", !hasImage && "mx-auto")}
              style={{ opacity: 0.72 }}
            >
              {props.body}
            </motion.p>
          )}

          {stats.length > 0 && (
            <div className={cn("mt-10 flex flex-wrap gap-x-10 gap-y-6", !hasImage && "justify-center")}>
              {stats.map((s, i) => (
                <div key={i}>
                  <div
                    className="text-3xl font-medium tracking-tight"
                    style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
                  >
                    <StatValue value={s.value} />
                  </div>
                  <div className="mt-1 text-[0.7rem] uppercase tracking-[0.18em]" style={{ opacity: 0.5 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {props.cta && (
            <a
              {...ctaAttrs(props.ctaHref)}
              className="mt-10 inline-block text-sm font-medium underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: "var(--brand)" }}
            >
              {props.cta} &rarr;
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Editorial testimonials (light). A large serif pull-quote beside a hairline-
 * ruled column of supporting quotes — reads like a press page, not an app card
 * row. The calm, warm/elegant counterpart to the dark TestimonialsSlider1.
 */
function TestimonialsEditorial({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  if (!items.length) return null;
  const [lead, ...rest] = items;
  return (
    <section className="px-6 py-24 sm:py-28" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-6xl">
        {props.title && (
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em]" style={{ color: "var(--brand-accent)" }}>
            {props.title}
          </p>
        )}
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <motion.figure
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <blockquote
              className="text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-[1.25] tracking-[-0.01em]"
              style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
            >
              &ldquo;{lead.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 text-sm" style={{ opacity: 0.6 }}>
              <span className="font-medium" style={{ color: "var(--brand)", opacity: 1 }}>{lead.name || lead.author}</span>
              {lead.role && <span> &middot; {lead.role}</span>}
            </figcaption>
          </motion.figure>

          {rest.length > 0 && (
            <div className="border-t" style={{ borderColor: HAIRLINE }}>
              {rest.map((t, i) => (
                <motion.figure
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.05 + i * 0.05 }}
                  className="border-b py-6"
                  style={{ borderColor: HAIRLINE }}
                >
                  <blockquote className="text-[15px] leading-relaxed" style={{ opacity: 0.8 }}>
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-3 text-xs" style={{ opacity: 0.55 }}>
                    <span className="font-medium" style={{ color: "var(--brand)", opacity: 1 }}>{t.name || t.author}</span>
                    {t.role && <span> &middot; {t.role}</span>}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Editorial closing CTA (light). A serif statement on the brand canvas framed by
 * hairline rules, with the accent pill button — the calm, warm/elegant
 * counterpart to the dark, glowing CTASection1.
 */
function CTAEditorial({ props }: { props: any }) {
  return (
    <section className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto max-w-4xl border-y px-6 py-20 text-center sm:py-24"
        style={{ borderColor: HAIRLINE, color: "var(--brand-ink)" }}
      >
        <h2
          className="mx-auto max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.02em]"
          style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
        >
          {props.title}
        </h2>
        {props.subtitle && (
          <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed" style={{ opacity: 0.65 }}>
            {props.subtitle}
          </p>
        )}
        <a
          {...ctaAttrs(props.ctaHref)}
          className="group mt-9 inline-flex items-center gap-1.5 px-7 py-3.5 text-sm font-medium text-white transition-transform active:scale-[0.98]"
          style={{
            background: "var(--brand-accent)",
            borderRadius: "var(--brand-radius)",
            boxShadow: "0 12px 34px -10px color-mix(in srgb, var(--brand-accent) 70%, transparent)",
          }}
        >
          {props.cta}
          <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </motion.div>
    </section>
  );
}

/**
 * Owner-managed collection rendered as a menu / price list: hairline-ruled rows
 * with a name, an optional price aligned right, and an optional description.
 * Used on the dedicated Menu / Catalogue page (real items only).
 */
function CollectionGrid({ props }: { props: any }) {
  const items = (props.items || []) as { name: string; price?: string; description?: string }[];
  return (
    <section className="px-6 py-20 sm:py-28" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-3xl">
        {props.eyebrow && (
          <span className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em]" style={{ color: "var(--brand-accent)" }}>
            <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
            {props.eyebrow}
          </span>
        )}
        <h2
          className="mt-5 text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.02em]"
          style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
        >
          {props.title}
        </h2>

        <div className="mt-10 border-t" style={{ borderColor: HAIRLINE }}>
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
              className="border-b py-5"
              style={{ borderColor: HAIRLINE }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-medium" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>
                  {it.name}
                </h3>
                {it.price && (
                  <span className="shrink-0 text-base font-medium tabular-nums" style={{ color: "var(--brand-accent)" }}>
                    {it.price}
                  </span>
                )}
              </div>
              {it.description && (
                <p className="mt-1 max-w-xl text-sm leading-relaxed" style={{ opacity: 0.65 }}>
                  {it.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Additional premium variants                                               */
/* -------------------------------------------------------------------------- */

/**
 * Full-bleed image hero. One edge-to-edge photograph (tonal gradient fallback)
 * under a soft scrim, with bottom-anchored editorial copy. For hospitality,
 * real estate and retail — where the image IS the pitch.
 */
function HeroImageFull({ props }: { props: any }) {
  const bgRef = React.useRef<HTMLDivElement>(null);
  useParallax(bgRef);
  return (
    <section className="relative flex min-h-[86vh] items-end overflow-hidden px-6 py-20">
      <div
        ref={bgRef}
        className="absolute -inset-[12%] bg-cover bg-center"
        style={{ backgroundImage: imageBg(props.image, "linear-gradient(135deg, var(--brand), var(--brand-accent))") }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.38))" }} />
      <div className="relative mx-auto w-full max-w-6xl text-white">
        {props.eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em]"
            style={{ color: "var(--brand-accent)" }}
          >
            <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
            {props.eyebrow}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 max-w-3xl text-[clamp(2.6rem,6.5vw,5rem)] font-medium leading-[1.02] tracking-[-0.02em]"
          style={{ fontFamily: "var(--brand-font)" }}
        >
          {props.title}
        </motion.h1>
        {props.subtitle && <p className="mt-5 max-w-xl text-lg text-white/80">{props.subtitle}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          {props.primaryCta && (
            <a {...ctaAttrs(props.primaryHref)} className="px-6 py-3 text-sm font-medium text-white" style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}>
              {props.primaryCta}
            </a>
          )}
          {props.secondaryCta && (
            <a {...ctaAttrs(props.secondaryHref)} className="border px-6 py-3 text-sm font-medium text-white" style={{ borderColor: "rgba(255,255,255,0.5)", borderRadius: "var(--brand-radius)" }}>
              {props.secondaryCta}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Alternating feature rows. Each capability gets a full-width row whose oversized
 * index + icon panel flips side row to row — calmer and more editorial than a
 * grid; strong for services and SaaS narratives.
 */
function FeaturesAlternating({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  return (
    <section className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight [text-wrap:balance] md:text-4xl" style={{ color: "var(--brand)" }}>
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="mt-3 text-lg" style={{ color: "var(--brand-ink)", opacity: 0.65 }}>{props.subtitle}</p>
          )}
        </div>
        <div className="mt-12">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
              className={`grid items-center gap-8 border-t py-10 sm:grid-cols-[1fr_1.4fr] ${i % 2 ? "sm:[&>*:first-child]:order-last" : ""}`}
              style={{ borderColor: HAIRLINE }}
            >
              <div className="flex items-center gap-5">
                <span
                  className="text-5xl font-medium tabular-nums"
                  style={{ fontFamily: "var(--brand-font)", color: "color-mix(in srgb, var(--brand-accent) 38%, transparent)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className="flex h-12 w-12 items-center justify-center"
                  style={{ background: "color-mix(in srgb, var(--brand-accent) 12%, transparent)", color: "var(--brand-accent)", borderRadius: "calc(var(--brand-radius) * 0.7)" }}
                >
                  <BlockIcon name={item.icon} className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium" style={{ color: "var(--brand)" }}>{item.title}</h3>
                {item.description && (
                  <p className="mt-2 max-w-md text-sm leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Service card grid. A modern, bold alternative to the editorial ServicesList:
 * numbered cards with a hairline border that warms to the brand surface on hover.
 */
function ServicesCards({ props }: { props: any }) {
  const items = (props.items || []) as { title: string; description?: string }[];
  return (
    <section className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          {props.eyebrow && (
            <span className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em]" style={{ color: "var(--brand-accent)" }}>
              <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
              {props.eyebrow}
            </span>
          )}
          <h2
            className="mt-5 text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.02em]"
            style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
          >
            {props.title}
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
              className="group flex flex-col border p-7 transition-colors hover:bg-[var(--brand-surface)]"
              style={{ borderColor: HAIRLINE, borderRadius: "calc(var(--brand-radius) * 1.1)" }}
            >
              <span className="text-sm font-medium tabular-nums" style={{ color: "var(--brand-accent)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-xl font-medium tracking-tight" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>
                {item.title}
              </h3>
              {item.description && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>
                  {item.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Three-card review grid with star ratings and initials avatars. Broad,
 * credible social proof on a warm brand surface; complements the single-quote
 * slider and the editorial press layout.
 */
function TestimonialsGrid({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  if (!items.length) return null;
  const initials = (n: string) =>
    (n || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");
  return (
    <section className="px-6 py-24" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-6xl">
        {props.title && (
          <h2
            className="max-w-2xl text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em]"
            style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
          >
            {props.title}
          </h2>
        )}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {items.slice(0, 6).map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
              className="flex flex-col border bg-white p-7"
              style={{ borderColor: HAIRLINE, borderRadius: "calc(var(--brand-radius) * 1.1)" }}
            >
              <div className="text-sm tracking-widest" style={{ color: "var(--brand-accent)" }}>★★★★★</div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed" style={{ color: "var(--brand-ink)" }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t pt-5" style={{ borderColor: HAIRLINE }}>
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
                  style={{ background: "color-mix(in srgb, var(--brand-accent) 15%, transparent)", color: "var(--brand-accent)" }}
                >
                  {initials(t.name || t.author)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium" style={{ color: "var(--brand)" }}>{t.name || t.author}</span>
                  {t.role && <span className="block truncate text-[13px]" style={{ opacity: 0.6 }}>{t.role}</span>}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Monumental hero (the ARCFORM / Archinest signature). A full-bleed photograph
 * under a soft gradient, a thin uppercase meta row up top, a concise statement
 * mid-frame, and the brand set as a colossal wordmark spanning the bottom edge,
 * slightly clipped. Maximum presence for image-led, confident brands.
 */
function HeroMonumental({ props }: { props: any }) {
  const bgRef = React.useRef<HTMLDivElement>(null);
  useParallax(bgRef);
  const word = (props.brand || props.title || "Studio") as string;
  return (
    <section className="relative flex min-h-[92vh] flex-col overflow-hidden px-6 pb-0 pt-28 text-white">
      <div
        ref={bgRef}
        className="absolute -inset-[10%] bg-cover bg-center"
        style={{ backgroundImage: imageBg(props.image, "linear-gradient(135deg, var(--brand), var(--brand-accent))") }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.06) 34%, rgba(0,0,0,0.8))" }} />

      {/* top meta row */}
      <div className="relative mx-auto flex w-full max-w-6xl items-start justify-between gap-8">
        {props.eyebrow && (
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-white/80">{props.eyebrow}</span>
        )}
        {props.subtitle && (
          <p className="hidden max-w-xs text-right text-sm leading-relaxed text-white/80 sm:block">{props.subtitle}</p>
        )}
      </div>

      {/* mid statement + CTAs */}
      <div className="relative mx-auto mt-auto w-full max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.08] tracking-[-0.01em]"
          style={{ fontFamily: "var(--brand-font)" }}
        >
          {props.title}
        </motion.h1>
        <div className="mt-7 flex flex-wrap gap-3">
          {props.primaryCta && (
            <a {...ctaAttrs(props.primaryHref)} className="px-6 py-3 text-sm font-medium text-white" style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}>
              {props.primaryCta}
            </a>
          )}
          {props.secondaryCta && (
            <a {...ctaAttrs(props.secondaryHref)} className="border px-6 py-3 text-sm font-medium text-white" style={{ borderColor: "rgba(255,255,255,0.5)", borderRadius: "var(--brand-radius)" }}>
              {props.secondaryCta}
            </a>
          )}
        </div>
      </div>

      {/* colossal wordmark, clipped at the bottom edge */}
      <div className="relative mx-auto mt-10 w-full max-w-[1500px] overflow-hidden">
        <motion.span
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="block translate-y-[0.14em] select-none whitespace-nowrap text-center font-semibold uppercase leading-[0.78] tracking-[-0.03em] [font-size:clamp(3.5rem,18vw,15rem)]"
          style={{ fontFamily: "var(--brand-font)" }}
        >
          {word}
        </motion.span>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Agencia family — editorial-brutalist dark templates                        */
/*                                                                            */
/*  A cohesive set (hero + statement + closing CTA) inspired by modern Framer  */
/*  agency sites: a near-black canvas, a single hot accent run through gradient */
/*  washes, colossal condensed uppercase type with a two-tone (live + muted)   */
/*  split, and numbered "01" section pills. Brand-adaptive: the heat comes from */
/*  --brand-accent, so any bold brand colour drives the whole family. Selected  */
/*  for bold moods, where they tend to land together and read as one site.     */
/* -------------------------------------------------------------------------- */

const AGENCIA_BG = "#0a0a0a";

/** Two consecutive pills — a white label + a circular index — as on Agencia. */
function NumberedPill({ label, index }: { label: string; index?: number }) {
  const n = (typeof index === "number" && index > 0 ? index : 1).toString().padStart(2, "0");
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <span className="rounded-full bg-white px-4 py-1.5 text-[0.82rem] font-medium text-black">{label}</span>
      <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-[0.82rem] font-medium text-black">
        {n}
      </span>
    </span>
  );
}

/** Split a phrase so the trailing share renders muted — the Agencia two-tone. */
function splitTwoTone(text: string, liveRatio = 0.55): [string, string] {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length < 3) return [text || "", ""];
  const mid = Math.max(1, Math.ceil(words.length * liveRatio));
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

/** Closed display class shared by the family: heavy, condensed, tight. */
const AGENCIA_DISPLAY =
  "font-semibold uppercase leading-[0.95] tracking-[-0.02em] [font-stretch:condensed]";

/**
 * Agencia hero — near-black canvas, a colossal condensed brand wordmark clipped
 * at the baseline, a hot gradient "ember" lozenge as the only colour, and a
 * two-tone tagline. The most cinematic hero in the library; for bold brands.
 */
function HeroAgencia({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const word = (props.brand || props.title || "Studio") as string;
  const [live, muted] = splitTwoTone(props.subtitle || props.title || "", 0.5);
  return (
    <section className="relative flex min-h-[94vh] flex-col overflow-hidden px-6 pb-0 pt-28 text-white" style={{ background: AGENCIA_BG }}>
      {/* ember: the lone splash of brand colour, drifting at the top */}
      <motion.div
        aria-hidden
        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
        className="pointer-events-none absolute -top-24 right-[8%] h-72 w-72 rounded-full blur-[60px]"
        style={{ background: "radial-gradient(circle at 40% 40%, var(--brand-accent), transparent 70%)" }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <div className="flex items-start justify-between gap-8">
          <NumberedPill label={props.eyebrow || "Studio"} index={props._index} />
          {props.caption && (
            <p className="hidden max-w-xs text-right text-sm leading-relaxed text-white/70 sm:block">{props.caption}</p>
          )}
        </div>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className={cn("mt-12 max-w-4xl text-[clamp(2rem,5vw,4rem)]", AGENCIA_DISPLAY)}
          style={{ fontFamily: "var(--brand-font)" }}
        >
          <span>{live} </span>
          {muted && <span className="text-white/35">{muted}</span>}
        </motion.h1>

        <div className="mt-8 flex flex-wrap gap-3">
          {props.primaryCta && (
            <a {...ctaAttrs(props.primaryHref)} className="px-6 py-3 text-sm font-medium text-white" style={{ background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" }}>
              {props.primaryCta}
            </a>
          )}
          {props.secondaryCta && (
            <a {...ctaAttrs(props.secondaryHref)} className="border px-6 py-3 text-sm font-medium text-white" style={{ borderColor: "rgba(255,255,255,0.4)", borderRadius: "var(--brand-radius)" }}>
              {props.secondaryCta}
            </a>
          )}
        </div>
      </div>

      {/* colossal wordmark, clipped at the bottom edge with an accent underglow */}
      <div className="relative mx-auto w-full max-w-[1500px] overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--brand-accent) 30%, transparent), transparent)" }} />
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          className={cn("relative block translate-y-[0.14em] select-none whitespace-nowrap text-center [font-size:clamp(3.5rem,19vw,16rem)] leading-[0.78]", AGENCIA_DISPLAY)}
          style={{ fontFamily: "var(--brand-font)" }}
        >
          {word}
        </motion.span>
      </div>
    </section>
  );
}

/**
 * Agencia statement — a centred numbered pill over a monumental two-tone mission
 * line, then a wide rounded image plate. Maps to the About slot; the brand's
 * description becomes the statement, so it stays specific, never boilerplate.
 */
function StatementAgencia({ props }: { props: any }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const statement = (props.body || props.title || "") as string;
  const [live, muted] = splitTwoTone(statement, 0.45);
  return (
    <section ref={ref} className="px-6 py-24 text-white sm:py-32" style={{ background: AGENCIA_BG }}>
      <div className="mx-auto max-w-5xl text-center">
        <NumberedPill label={props.eyebrow || "About"} index={props._index} />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
          className={cn("mx-auto mt-10 max-w-4xl text-[clamp(1.6rem,4vw,3rem)]", AGENCIA_DISPLAY)}
          style={{ fontFamily: "var(--brand-font)" }}
        >
          <span>{live} </span>
          {muted && <span className="text-white/35">{muted}</span>}
        </motion.h2>

        {props.image && (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
            className="mx-auto mt-14 h-64 w-full max-w-3xl overflow-hidden rounded-3xl bg-cover bg-center sm:h-80"
            style={{ backgroundImage: imageBg(props.image, "linear-gradient(135deg, var(--brand-accent), #1a1a1a)") }}
          />
        )}
      </div>
    </section>
  );
}

/**
 * Agencia closing CTA — a giant two-line "LET'S GET STARTED" over a hot gradient
 * plate carrying a slowly rotating asterisk and the contact link. The library's
 * boldest sign-off; pairs with the Agencia hero/statement for bold brands.
 */
function CTAAsterisk({ props }: { props: any }) {
  const reduce = useReducedMotion();
  return (
    <section className="overflow-hidden px-6 pt-24 text-white sm:pt-32" style={{ background: AGENCIA_BG }}>
      <div className="mx-auto max-w-6xl">
        <NumberedPill label={props.eyebrow || "Contact"} index={props._index} />
        {props.subtitle && <p className="mt-6 text-lg text-white/60">{props.subtitle}</p>}
        <h2 className={cn("mt-4 text-[clamp(2.6rem,11vw,8rem)]", AGENCIA_DISPLAY)} style={{ fontFamily: "var(--brand-font)" }}>
          {props.title || "Let's get started"}
        </h2>
      </div>

      <div
        className="relative mt-14 flex items-center gap-6 overflow-hidden rounded-3xl px-8 py-16 sm:px-14 sm:py-20"
        style={{ background: "linear-gradient(110deg, var(--brand-accent), color-mix(in srgb, var(--brand-accent) 55%, #120a06))" }}
      >
        <motion.span
          aria-hidden
          animate={reduce ? {} : { rotate: 360 }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          className="shrink-0 text-5xl font-light leading-none text-white sm:text-7xl"
        >
          ✳
        </motion.span>
        <a href="#contact" className={cn("text-[clamp(1.8rem,6vw,4rem)] text-white transition-opacity hover:opacity-80", AGENCIA_DISPLAY)} style={{ fontFamily: "var(--brand-font)" }}>
          {props.cta || "Contact us"}
        </a>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Registry + renderer                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Image-free premium hero. When the source site has no usable image, a plain
 * centered text hero reads as a template, so we compose a "brand canvas"
 * instead: an asymmetric panel with a gradient mesh, the brand monogram and
 * drifting accent orbs. Entirely token-driven and CSS-only, so it adapts to any
 * brand colour, works in export, and degrades gracefully with reduced motion.
 */
function HeroCanvas({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const monogram = (props.brand || props.title || "•").trim().charAt(0).toUpperCase() || "•";
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  });
  const drift = (dx: number, dy: number) =>
    reduce ? {} : { animate: { x: [0, dx, 0], y: [0, dy, 0] }, transition: { duration: 14, ease: "easeInOut" as const, repeat: Infinity } };

  return (
    <section
      className="relative overflow-hidden px-6 pb-24 pt-32 sm:pb-28"
      style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}
    >
      {/* overhead accent light + masked grid, for depth */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 z-0 h-[520px]"
        style={{ background: "radial-gradient(50% 50% at 50% 0%, color-mix(in srgb, var(--brand-accent) 16%, transparent), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(70%_55%_at_50%_0%,#000,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--brand-ink) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--brand-ink) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: message + CTAs */}
        <div>
          {props.eyebrow && (
            <motion.span
              {...rise(0)}
              className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                borderColor: "color-mix(in srgb, var(--brand-ink) 12%, transparent)",
                color: "color-mix(in srgb, var(--brand-ink) 65%, transparent)",
              }}
            >
              {props.eyebrow}
            </motion.span>
          )}
          <motion.h1
            {...rise(0.05)}
            className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight [text-wrap:balance] md:text-6xl"
            style={{ color: "var(--brand)", fontFamily: "var(--brand-font)" }}
          >
            {props.title}
          </motion.h1>
          {props.subtitle && (
            <motion.p
              {...rise(0.12)}
              className="mt-5 max-w-md text-lg leading-relaxed"
              style={{ color: "var(--brand-ink)", opacity: 0.66 }}
            >
              {props.subtitle}
            </motion.p>
          )}
          <motion.div {...rise(0.2)} className="mt-9 flex flex-wrap items-center gap-4">
            <a
              {...ctaAttrs(props.primaryHref)}
              className="group inline-flex items-center gap-1.5 px-7 py-3.5 text-sm font-medium text-white transition-transform active:scale-[0.98]"
              style={{
                background: "var(--brand-accent)",
                borderRadius: "var(--brand-radius)",
                boxShadow: "0 14px 36px -12px color-mix(in srgb, var(--brand-accent) 70%, transparent)",
              }}
            >
              {props.primaryCta || "Get started"}
              <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            {props.secondaryCta && (
              <a
                {...ctaAttrs(props.secondaryHref)}
                className="text-sm font-medium underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: "var(--brand)" }}
              >
                {props.secondaryCta}
              </a>
            )}
          </motion.div>
        </div>

        {/* Right: the brand canvas (stands in for a hero image) */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[5/4] w-full overflow-hidden border lg:aspect-[4/5]"
          style={{
            borderRadius: "calc(var(--brand-radius) * 1.6)",
            borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)",
            background: "linear-gradient(140deg, color-mix(in srgb, var(--brand-accent) 22%, var(--brand-surface)), var(--brand-surface-2))",
            boxShadow: "0 40px 90px -50px color-mix(in srgb, var(--brand-ink) 60%, transparent)",
          }}
        >
          {/* drifting accent orbs */}
          <motion.div
            {...drift(24, -18)}
            className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand-accent) 60%, transparent), transparent 70%)" }}
          />
          <motion.div
            {...drift(-20, 16)}
            className="pointer-events-none absolute -bottom-12 -right-8 h-52 w-52 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 45%, transparent), transparent 70%)" }}
          />
          {/* fine grid inside the panel */}
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(to right, color-mix(in srgb, var(--brand-ink) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--brand-ink) 6%, transparent) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* giant brand monogram, bleeding off the corner */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-[0.2em] right-[0.04em] select-none font-semibold leading-none [font-size:clamp(11rem,26vw,20rem)]"
            style={{ fontFamily: "var(--brand-font)", color: "var(--brand)", opacity: 0.1 }}
          >
            {monogram}
          </span>
          {/* hairline frame + brand label */}
          <div className="absolute left-5 top-5 flex items-center gap-2 text-[12px] font-medium" style={{ color: "color-mix(in srgb, var(--brand-ink) 60%, transparent)" }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--brand-accent)" }} />
            {props.brand || props.caption || ""}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const REGISTRY: Record<string, React.ComponentType<{ props: any }>> = {
  HeroPremium1,
  HeroCanvas,
  HeroPremium2,
  HeroEditorial,
  HeroSpotlight,
  HeroImageFull,
  HeroMonumental,
  HeroAgencia,
  StatementAgencia,
  CTAAsterisk,
  FeaturesGrid1,
  FeaturesBento,
  FeaturesAlternating,
  ServicesList,
  ServicesCards,
  PortfolioGrid,
  StatsCounter,
  AboutSplit,
  TestimonialsSlider1,
  TestimonialsEditorial,
  TestimonialsGrid,
  FAQAccordion1,
  CTASection1,
  CTAEditorial,
  CollectionGrid,
  ContactFormPremium1,
  Footer1,
};

function BlockRenderer({ block, index }: { block: Block; index?: number }) {
  const Cmp = REGISTRY[block.variant];
  if (!Cmp) return null;
  // Expose the section's position so numbered-index templates (Agencia-style
  // pills: "About 01") can label themselves without the engine tracking order.
  return <Cmp props={{ _index: index, ...block.props }} />;
}

/** Renders a full generated site from its schema, applying the theme. */
/** Section types that earn a top-nav link, and their label. */
const NAV_LABELS: Partial<Record<BlockType, string>> = {
  features: "Why us",
  services: "Services",
  portfolio: "Work",
  products: "Shop",
  gallery: "Gallery",
  about: "About",
  testimonials: "Reviews",
  pricing: "Pricing",
  faq: "FAQ",
  contact: "Contact",
};

const anchorId = (type: BlockType): string => (type === "hero" ? "top" : type);

type NavItem = { label: string; href?: string; onClick?: () => void; active?: boolean };

/** Sticky brand navigation. Items can be anchors (single-page) or buttons that
 *  switch page client-side (multi-page). */
function SiteNav({ brand, items, cta }: { brand: NavItem; items: NavItem[]; cta: NavItem }) {
  const link = (it: NavItem, key: React.Key) => {
    const cls = "text-sm transition-opacity hover:opacity-70";
    const style = { color: "var(--brand-ink)", opacity: it.active ? 1 : 0.72 } as React.CSSProperties;
    return it.href ? (
      <a key={key} href={it.href} className={cls} style={style}>{it.label}</a>
    ) : (
      <button key={key} type="button" onClick={it.onClick} className={cls} style={style}>{it.label}</button>
    );
  };
  const wordmark = { className: "text-lg font-medium tracking-tight", style: { fontFamily: "var(--brand-font)", color: "var(--brand)" } as React.CSSProperties };
  const ctaCls = "shrink-0 px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98]";
  const ctaStyle = { background: "var(--brand-accent)", borderRadius: "var(--brand-radius)" } as React.CSSProperties;

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{ background: "color-mix(in srgb, var(--brand-surface) 82%, transparent)", borderBottom: `1px solid ${HAIRLINE}` }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        {brand.href ? (
          <a href={brand.href} {...wordmark}>{brand.label}</a>
        ) : (
          <button type="button" onClick={brand.onClick} {...wordmark}>{brand.label}</button>
        )}
        <nav className="hidden items-center gap-7 md:flex">{items.map(link)}</nav>
        {cta.href ? (
          <a href={cta.href} className={ctaCls} style={ctaStyle}>{cta.label}</a>
        ) : (
          <button type="button" onClick={cta.onClick} className={ctaCls} style={ctaStyle}>{cta.label}</button>
        )}
      </div>
    </header>
  );
}

export function SiteRenderer({
  schema,
  basePath,
  page,
}: {
  schema: SiteSchema;
  basePath?: string;
  page?: string;
}) {
  const allPages = [{ path: "", label: "Home", blocks: schema.blocks }, ...(schema.pages ?? [])];
  const multi = allPages.length > 1;
  const routed = typeof basePath === "string";

  const [clientPath, setClientPath] = React.useState("");
  const currentPath = routed ? page ?? "" : clientPath;
  const current = allPages.find((p) => p.path === currentPath) ?? allPages[0];
  const contactPath = allPages.some((p) => p.path === "contact") ? "contact" : currentPath;

  const href = (p: string) => `${basePath ?? ""}${p ? `/${p}` : ""}`;
  const go = (p: string) => {
    setClientPath(p);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  let brand: NavItem;
  let items: NavItem[];
  let cta: NavItem;
  if (multi && routed) {
    // Published: real per-page URLs (deeplinkable + per-page SEO).
    brand = { label: schema.brand.name, href: href("") };
    items = allPages.map((p) => ({ label: p.label, href: href(p.path), active: p.path === currentPath }));
    cta = { label: "Contact", href: href(contactPath) };
  } else if (multi) {
    // In-app preview: switch pages client-side (no routes).
    brand = { label: schema.brand.name, onClick: () => go("") };
    items = allPages.map((p) => ({ label: p.label, onClick: () => go(p.path), active: p.path === currentPath }));
    cta = { label: "Contact", onClick: () => go(contactPath) };
  } else {
    const seen = new Set<string>();
    brand = { label: schema.brand.name, href: "#top" };
    items = schema.blocks.flatMap((b) => {
      const label = NAV_LABELS[b.type];
      const id = anchorId(b.type);
      if (!label || seen.has(id)) return [];
      seen.add(id);
      return [{ label, href: `#${id}` }];
    });
    cta = { label: "Contact", href: `#${schema.blocks.some((b) => b.type === "contact") ? "contact" : "top"}` };
  }

  // The client can switch motion off from the AI editor (schema.animations).
  // reducedMotion="always" stops framer transforms/parallax/scroll-reveals from
  // animating (content still ends visible), and data-animate kills CSS
  // transitions/animations (marquees, hovers) without touching layout transforms.
  const animationsOn = schema.animations !== false;

  return (
    <MotionConfig reducedMotion={animationsOn ? "user" : "always"}>
      <div
        data-animate={animationsOn ? "on" : "off"}
        style={{
          ...themeStyle(schema.theme),
          background: "var(--brand-surface)",
          color: "var(--brand-ink)",
          scrollBehavior: "smooth",
        }}
      >
        <SiteNav brand={brand} items={items} cta={cta} />
        {current.blocks.map((block, i) => (
          <div key={block.id} id={anchorId(block.type)} style={{ scrollMarginTop: "76px" }}>
            <BlockRenderer block={block} index={i + 1} />
          </div>
        ))}
      </div>
    </MotionConfig>
  );
}
