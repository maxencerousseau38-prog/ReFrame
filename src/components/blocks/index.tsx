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
import type { DesignDNA } from "@/lib/generation/dna";
import { deriveScheme, idealInkOn, ensureReadable } from "@/lib/generation/color";
import { Aurora, Spotlight, Meteors, BlurFade, BorderBeam } from "./fx";
import { cn } from "@/lib/utils";
import { useParallax } from "./use-parallax";
import { toProxiedUrl } from "@/lib/img";
import { tokenVarOverrides, type CompiledTokens } from "@/lib/dna/tokens";

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
  manrope: "Manrope, var(--font-geist-sans), system-ui, -apple-system, sans-serif",
  "space-grotesk": "'Space Grotesk', var(--font-geist-sans), system-ui, -apple-system, sans-serif",
};

function fontGoogleUrl(font: Theme["font"]): string | undefined {
  switch (font) {
    case "manrope":
      return "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap";
    case "space-grotesk":
      return "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap";
    default:
      return undefined;
  }
}

/**
 * The brand CSS custom properties for one light/dark mode, as a plain record.
 * Emitted twice by the renderer (base + a prefers-color-scheme media override)
 * so a generated site follows the visitor's OS preference with no JS or FOUC.
 * Explicit theme surfaces only apply to the theme's INTENDED mode — the
 * auto-flipped mode always uses the derived scheme so it stays coherent.
 */
function themeVars(theme: Theme, dark: boolean): Record<string, string> {
  const sc = deriveScheme(theme.accent, dark, theme.mood);
  const intended = dark === (theme.dark === true);
  const surface = (intended && theme.surface) || sc.surface;
  const surface2 = (intended && theme.surface2) || sc.surface2;
  const ink = (intended && theme.ink) || sc.ink;
  // Headings/brand text: the brand primary in light, a near-white (brand-tinted)
  // in dark. Guaranteed to clear WCAG AA for large text (3:1) on the surface so a
  // pale brand colour never becomes an unreadable heading.
  const brand = ensureReadable(dark ? sc.ink : theme.primary, surface, 3);
  // Inverse "panel" (stats / CTA bands): an elevated brand-tinted dark in dark
  // mode, the brand-dark in light mode.
  const contrast = dark ? sc.contrast : theme.primary;
  return {
    "--brand": brand,
    "--brand-accent": theme.accent,
    "--brand-accent-2": sc.accent2,
    // Legible label colour ON the accent (CTAs) — white for deep brands,
    // near-black for light ones (yellow/lime). WCAG-correct by construction.
    "--brand-accent-ink": sc.accentInk,
    "--brand-radius": radiusMap[theme.radius],
    "--brand-surface": surface,
    "--brand-surface-2": surface2,
    "--brand-ink": ink,
    "--brand-contrast": contrast,
    "--brand-contrast-ink": idealInkOn(contrast),
    "--brand-card": dark ? sc.card : "#ffffff",
    "--brand-font": fontStacks[theme.font],
    "--brand-mood": theme.mood,
  };
}

const cssVarsText = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

/**
 * The site's theme CSS: the baseline mode (the source/brand-derived default)
 * plus a `prefers-color-scheme` override that flips to the opposite mode, so the
 * rebuild auto-matches the visitor's system setting. Scoped to one site root.
 */
function themeCss(theme: Theme, scope: string, tokens?: CompiledTokens): string {
  const baselineDark = theme.dark === true;
  const sel = `.rf-site[data-rf="${scope}"]`;
  // V2 Chantier 5: measured/compiled tokens (--rf-* + the real body family)
  // are merged over the derived vars — fill-order per charter: the enum font
  // stack was always a guess, the measured family is the site's truth.
  const overrides = tokenVarOverrides(tokens);
  const base = cssVarsText({ ...themeVars(theme, baselineDark), ...overrides });
  const alt = cssVarsText({ ...themeVars(theme, !baselineDark), ...overrides });
  const fontFaces = tokens?.fontFaceCss ? `${tokens.fontFaceCss}\n` : "";
  return `${fontFaces}${sel}{${base}}@media (prefers-color-scheme:${baselineDark ? "light" : "dark"}){${sel}{${alt}}}`;
}

/* -------------------------------------------------------------------------- */
/*  Design DNA context + CSS variables                                        */
/* -------------------------------------------------------------------------- */

/**
 * Extract the _dna bag injected by the Composer into every block's props.
 * Returns a typed object that components use for DNA-driven rendering.
 * Falls back to sensible defaults when a block was built without DNA.
 */
interface DNAProps {
  spacingMultiplier: number;
  density: "tight" | "standard" | "generous" | "editorial";
  cardStyle: string;
  cardRadius: string;
  cardShadow: string;
  cardBorder: string;
  cardHoverEffect: string;
  entranceType: string;
  motionLevel: number;
  staggerDelay: number;
  duration: number;
  ctaStyle: string;
  ctaSize: string;
}

const DNA_DEFAULTS: DNAProps = {
  spacingMultiplier: 1,
  density: "standard",
  cardStyle: "flat",
  cardRadius: "12px",
  cardShadow: "none",
  cardBorder: "none",
  cardHoverEffect: "lift",
  entranceType: "slide-up",
  motionLevel: 1,
  staggerDelay: 0.05,
  duration: 0.3,
  ctaStyle: "pill",
  ctaSize: "md",
};

function useDNA(props: any): DNAProps {
  if (props?._dna && typeof props._dna === "object") {
    return { ...DNA_DEFAULTS, ...props._dna };
  }
  return DNA_DEFAULTS;
}

/**
 * Build a DNA-driven entrance animation config. Components call this instead
 * of hardcoding their own rise/fade variants, so the DNA controls all motion.
 */
function dnaEntrance(dna: DNAProps, delay: number): {
  initial: false | Record<string, number | string>;
  whileInView: Record<string, number | string>;
  viewport: { once: true };
  transition: { duration: number; ease: typeof EASE; delay: number };
} {
  const d = delay * (dna.staggerDelay / 0.05);
  const dur = dna.duration;

  const variants = {
    fade: { initial: { opacity: 0 }, whileInView: { opacity: 1 } },
    "slide-up": { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } },
    "blur-fade": { initial: { opacity: 0, y: 12, filter: "blur(6px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" } },
    reveal: { initial: { opacity: 0, y: 32 }, whileInView: { opacity: 1, y: 0 } },
    stagger: { initial: { opacity: 0, y: 24, scale: 0.97 }, whileInView: { opacity: 1, y: 0, scale: 1 } },
  } as const;

  type VKey = keyof typeof variants;
  const key = (dna.entranceType in variants ? dna.entranceType : "slide-up") as VKey;
  const v = variants[key];
  return {
    initial: dna.motionLevel === 0 ? false : { ...v.initial },
    whileInView: { ...v.whileInView },
    viewport: { once: true },
    transition: { duration: dur, ease: EASE, delay: d },
  };
}

/**
 * DNA-derived section padding. Components use this instead of hardcoding
 * py-20 / py-28, so the DNA's rhythm.spacingMultiplier controls spacing.
 */
function dnaSectionPy(dna: DNAProps): string {
  const base = 80; // px
  const scaled = Math.round(base * dna.spacingMultiplier);
  return `${scaled}px`;
}

/**
 * DNA-derived card style as inline React CSS.
 */
function dnaCardStyle(dna: DNAProps): React.CSSProperties {
  return {
    borderRadius: dna.cardRadius,
    boxShadow: dna.cardShadow !== "none" ? dna.cardShadow : undefined,
    border: dna.cardBorder !== "none" ? dna.cardBorder : undefined,
    background: dna.cardStyle === "glass"
      ? "color-mix(in srgb, var(--brand-card) 80%, transparent)"
      : "var(--brand-card)",
    backdropFilter: dna.cardStyle === "glass" ? "blur(12px)" : undefined,
  };
}

/**
 * DNA-derived CTA button classes.
 */
function dnaCtaClasses(dna: DNAProps): string {
  const size = dna.ctaSize === "lg"
    ? "px-8 py-4 text-base"
    : dna.ctaSize === "sm"
    ? "px-5 py-2.5 text-xs"
    : "px-7 py-3.5 text-sm";

  return `group inline-flex items-center gap-1.5 font-medium transition-transform active:scale-[0.98] ${size}`;
}

function dnaCtaStyle(dna: DNAProps): React.CSSProperties {
  const base: React.CSSProperties = {
    color: "var(--brand-accent-ink)",
  };

  switch (dna.ctaStyle) {
    case "pill":
      return { ...base, background: "var(--brand-accent)", borderRadius: "9999px", boxShadow: "0 12px 34px -10px color-mix(in srgb, var(--brand-accent) 70%, transparent)" };
    case "sharp":
      return { ...base, background: "var(--brand-accent)", borderRadius: "4px" };
    case "ghost":
      return { ...base, background: "transparent", color: "var(--brand)", border: "1px solid color-mix(in srgb, var(--brand-ink) 20%, transparent)", borderRadius: "var(--brand-radius)" };
    case "text-arrow":
      return { ...base, background: "transparent", color: "var(--brand)", padding: 0 };
    case "gradient":
      return { ...base, background: "linear-gradient(135deg, var(--brand-accent), var(--brand-accent-2))", borderRadius: "var(--brand-radius)" };
    default:
      return { ...base, background: "var(--brand-accent)", borderRadius: "var(--brand-radius)", boxShadow: "0 12px 34px -10px color-mix(in srgb, var(--brand-accent) 70%, transparent)" };
  }
}

function dnaSecondaryCta(dna: DNAProps): React.CSSProperties {
  switch (dna.ctaStyle) {
    case "ghost":
    case "text-arrow":
      return { color: "var(--brand)", textDecoration: "none" };
    default:
      return { color: "var(--brand)", textDecoration: "none", opacity: 0.8 };
  }
}

/**
 * DNA-aware card hover wrapper. Applies the DNA's hover effect.
 */
function dnaCardHoverProps(dna: DNAProps) {
  if (dna.motionLevel === 0) return {};
  switch (dna.cardHoverEffect) {
    case "lift": return { whileHover: { y: -4, transition: { duration: 0.2 } } };
    case "scale": return { whileHover: { scale: 1.02, transition: { duration: 0.2 } } };
    case "glow": return { whileHover: { boxShadow: `0 0 24px color-mix(in srgb, var(--brand-accent) 30%, transparent)`, transition: { duration: 0.2 } } };
    case "border": return { whileHover: { borderColor: "var(--brand-accent)", transition: { duration: 0.2 } } };
    default: return {};
  }
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

/**
 * A cover image rendered as a REAL <img> (for Core Web Vitals): native lazy-load
 * below the fold, fetchpriority="high" + eager for the LCP hero, async decode,
 * and a brand-gradient fallback kept behind it (so a blocked/missing image still
 * shows the gradient, never a blank box). The container takes the caller's
 * size/radius/shadow via className/style; the img absolutely fills it.
 */
function CoverImage({
  image,
  gradient,
  priority,
  position,
  className,
  style,
  parallaxRef,
  overscan,
}: {
  image?: string;
  gradient: string;
  priority?: boolean;
  position?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Attach to drive a scroll parallax on the image (via useParallax). */
  parallaxRef?: React.RefObject<HTMLImageElement>;
  /** Over-size the image (so a parallax drift never exposes an edge). */
  overscan?: boolean;
}) {
  const src = toProxiedUrl(image);
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: gradient, ...style }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={parallaxRef}
          src={src}
          alt=""
          aria-hidden
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={overscan ? "absolute -inset-[12%] h-[124%] w-[124%] max-w-none" : "absolute inset-0 h-full w-full"}
          style={{ objectFit: "cover", objectPosition: position ?? "center" }}
        />
      ) : null}
    </div>
  );
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
          className="mt-6 rf-fluid-display font-semibold [text-wrap:balance]"
          style={{ color: "var(--brand)" }}
        >
          {props.title}
        </motion.h1>

        {props.subtitle && (
          <motion.p
            {...rise(0.12)}
            className="mx-auto mt-5 max-w-xl rf-fluid-lead [text-wrap:balance]"
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
              color: "var(--brand-accent-ink)",
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

      {/* Large centered product visual below the copy - the Apple-style
          "hero shot". Only when a real image was extracted; brand-tinted
          gradient + glow fallback keeps a blocked image from leaving a hole. */}
      {props.image && (
        <motion.div {...rise(0.28)} className="relative z-10 mx-auto mt-16 w-full max-w-5xl">
          <div
            className="overflow-hidden rounded-[1.25rem]"
            style={{
              aspectRatio: "16 / 10",
              background: imageBg(
                props.image,
                "linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 22%, transparent), transparent)"
              ),
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: `0 50px 140px -40px color-mix(in srgb, var(--brand-accent) 45%, transparent), inset 0 0 0 1px ${HAIRLINE}`,
            }}
          />
        </motion.div>
      )}
    </section>
  );
}

function HeroPremium2({ props }: { props: any }) {
  const imgRef = React.useRef<HTMLImageElement>(null);
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
            className="mt-4 rf-fluid-display font-semibold [text-wrap:balance]"
            style={{ color: "var(--brand)" }}
          >
            {props.title}
          </motion.h1>
          <p className="mt-5 max-w-md text-lg" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{props.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              {...ctaAttrs(props.primaryHref)}
              className="px-6 py-3 text-sm font-medium text-white shadow-lg"
              style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)" }}
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
          <div className="absolute inset-0">
            <CoverImage
              image={props.image}
              gradient="linear-gradient(135deg, var(--brand-accent), var(--brand))"
              priority
              overscan
              parallaxRef={imgRef}
              className="h-full w-full"
            />
          </div>
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
  const imgRef = React.useRef<HTMLImageElement>(null);
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
              style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)" }}
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
            <div className="absolute inset-0">
              <CoverImage
                image={props.image}
                gradient="linear-gradient(150deg, var(--brand-surface-2), var(--brand-accent))"
                overscan
                parallaxRef={imgRef}
                className="h-full w-full"
              />
            </div>
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
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>
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
              className="group rf-card p-7 transition-colors hover:bg-[var(--brand-surface)]"
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
    <section className="px-6 py-28 text-white" style={{ background: "var(--brand-contrast)" }}>
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
/**
 * Two-column FAQ — all answers visible, hairline-separated. An editorial,
 * scannable counterpart to the accordion; calmer for content-confident brands.
 */
function FaqGrid({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const items = (props.items || []) as { question: string; answer: string }[];
  return (
    <section className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-5xl">
        <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>
          {props.title}
        </h2>
        <div className="mt-12 grid gap-x-12 gap-y-9 sm:grid-cols-2">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 2) * 0.05, ease: EASE }}
              className="border-t pt-5"
              style={{ borderColor: HAIRLINE }}
            >
              <h3 className="text-base font-semibold tracking-tight" style={{ color: "var(--brand)" }}>{it.question}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.62 }}>{it.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQAccordion1({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const items = (props.items || []) as any[];
  const [open, setOpen] = React.useState(0);
  const collapsed = reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 };

  return (
    <section className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>
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
          background: "var(--brand-contrast)",
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
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]">{props.title}</h2>
          {props.subtitle && (
            <p className="mx-auto mt-4 max-w-lg text-white/60 [text-wrap:balance]">{props.subtitle}</p>
          )}
          <a
            {...ctaAttrs(props.ctaHref)}
            className="group mt-8 inline-flex items-center gap-1.5 bg-white px-7 py-3.5 text-sm font-medium transition-colors hover:bg-white/90"
            style={{ color: "var(--brand-contrast)", borderRadius: "var(--brand-radius)" }}
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
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>
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
            className="flex flex-col items-center justify-center gap-3 border rf-card px-7 py-16 text-center sm:p-10"
            style={{ borderRadius: "calc(var(--brand-radius) * 1.4)", borderColor: HAIRLINE }}
          >
            <CheckCircle weight="fill" className="h-10 w-10" style={{ color: "var(--brand-accent)" }} />
            <p className="text-base font-medium" style={{ color: "var(--brand)" }}>Thanks, your message was sent.</p>
            <p className="text-sm" style={{ opacity: 0.6 }}>We&apos;ll get back to you shortly.</p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="space-y-4 border rf-card p-7 sm:p-8"
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
              style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)", boxShadow: "0 12px 34px -10px color-mix(in srgb, var(--brand-accent) 70%, transparent)" }}
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
          <div className="flex items-center gap-5">
            {Array.isArray(props.social) && props.social.length > 0 && (
              <ul className="flex flex-wrap items-center gap-4">
                {(props.social as { platform: string; url: string }[]).map((s) => (
                  <li key={s.platform}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ color: "var(--brand-ink)", opacity: 0.7 }}
                    >
                      {s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <a
              href="#top"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors hover:bg-[var(--brand-surface)]"
              style={{ borderColor: HAIRLINE, color: "var(--brand)" }}
            >
              Back to top <span aria-hidden>&uarr;</span>
            </a>
          </div>
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
          className="mt-6 rf-fluid-display font-semibold [text-wrap:balance]"
          style={{ color: "var(--brand)" }}
        >
          {props.title}
        </motion.h1>
        <p className="mx-auto mt-5 max-w-xl rf-fluid-lead" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{props.subtitle}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            {...ctaAttrs(props.primaryHref)}
            className="px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform active:scale-[0.98]"
            style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)" }}
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
/**
 * Image-led bento, Apple-store grade. A monumental lead tile and supporting
 * tiles, each an elevated brand-card surface (correct in light AND dark) with a
 * real product/work image on top and the real title + description below. When no
 * imagery is available it degrades to a restrained monochrome-icon tile (no loud
 * accent chip) so the accent stays rare, per the design golden rules.
 */
function FeaturesBento({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  return (
    <section className="px-6 py-20 sm:py-24" style={{ background: "var(--brand-surface)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="mt-3" style={{ color: "var(--brand-ink)", opacity: 0.55 }}>{props.subtitle}</p>
          )}
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:[grid-auto-flow:dense]">
          {items.map((item, i) => {
            const lead = i === 0;
            return (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fade}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rf-card transition-transform duration-300 hover:-translate-y-1",
                  lead && "sm:col-span-2 lg:row-span-2"
                )}
                style={{ borderRadius: "var(--brand-radius)", boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
              >
                {/* Premium beam-lit edge on the lead tile. */}
                {lead && <BorderBeam radius="var(--brand-radius)" />}
                {item.image ? (
                  <CoverImage
                    image={item.image}
                    priority={lead && i === 0}
                    gradient="linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 20%, transparent), transparent)"
                    className={cn("w-full", lead ? "min-h-[220px] flex-1" : "aspect-[16/10]")}
                  />
                ) : (
                  <div className="px-6 pt-6">
                    <div
                      className="flex h-10 w-10 items-center justify-center"
                      style={{
                        color: "var(--brand-accent)",
                        background: "color-mix(in srgb, var(--brand-accent) 12%, transparent)",
                        borderRadius: "calc(var(--brand-radius) * 0.7)",
                      }}
                    >
                      <BlockIcon name={item.icon} className="h-5 w-5" />
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className={cn("font-semibold", lead ? "text-xl" : "text-base")} style={{ color: "var(--brand)" }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>
                      {item.description}
                    </p>
                  )}
                  {(props.primaryCta || props.secondaryCta) && (
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                      {props.primaryCta && (
                        <a
                          {...ctaAttrs(props.primaryHref)}
                          className="group/cta inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-80"
                          style={{ color: "var(--brand-accent)" }}
                        >
                          {props.primaryCta}
                          <ArrowRight weight="bold" className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />
                        </a>
                      )}
                      {props.secondaryCta && props.secondaryCta !== props.primaryCta && (
                        <a
                          {...ctaAttrs(props.secondaryHref)}
                          className="group/cta2 inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-80"
                          style={{ color: "var(--brand-accent)" }}
                        >
                          {props.secondaryCta}
                          <ArrowRight weight="bold" className="h-3.5 w-3.5 transition-transform group-hover/cta2:translate-x-0.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
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
        style={{ background: "var(--brand-contrast)", borderRadius: "calc(var(--brand-radius) * 1.5)" }}
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
  const imgRef = React.useRef<HTMLImageElement>(null);
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
            <div className="absolute inset-0">
              <CoverImage
                image={props.image}
                gradient="linear-gradient(150deg, var(--brand-surface-2), var(--brand-accent))"
                overscan
                parallaxRef={imgRef}
                className="h-full w-full"
              />
            </div>
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
 * Editorial statement (the Havenn "Timeless Spaces" signature). A light section
 * built on one bold move: a monumental section title with a faint, offset ghost
 * of itself behind — the single memorable element — beside a tall, asymmetric
 * framed image. The client's real About copy carries the column; real stats (if
 * any) sit on a hairline row. No numbered markers: a statement isn't a sequence.
 */
function StatementEditorial({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const imgRef = React.useRef<HTMLImageElement>(null);
  useParallax(imgRef);
  const stats = (props.stats || []) as { value: string; label: string }[];
  const title = (props.title || "") as string;
  return (
    <section className="overflow-hidden px-6 py-24 sm:py-32" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* statement column */}
        <div className="lg:pt-10">
          {props.eyebrow && (
            <span
              className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em]"
              style={{ color: "var(--brand-accent)" }}
            >
              <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
              {props.eyebrow}
            </span>
          )}
          {/* monumental title with a ghosted echo behind it — the one bold move */}
          <div className="relative mt-6">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-0.5 -top-[0.16em] hidden select-none text-[clamp(2.4rem,6vw,5rem)] leading-[0.92] tracking-[-0.03em] sm:block"
              style={{
                fontFamily: "var(--brand-font)",
                fontWeight: 590,
                color: "transparent",
                WebkitTextStroke: "1px color-mix(in srgb, var(--brand-ink) 14%, transparent)",
              }}
            >
              {title}
            </span>
            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE }}
              className="relative text-[clamp(2.4rem,6vw,5rem)] leading-[0.92] tracking-[-0.03em] [text-wrap:balance]"
              style={{ fontFamily: "var(--brand-font)", fontWeight: 590, color: "var(--brand)" }}
            >
              {title}
            </motion.h2>
          </div>
          {props.body && (
            <p className="mt-7 max-w-xl text-lg leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.66 }}>
              {props.body}
            </p>
          )}
          {props.cta && (
            <a
              {...ctaAttrs(props.ctaHref)}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--brand-accent)" }}
            >
              {props.cta}
              <span aria-hidden>→</span>
            </a>
          )}
          {stats.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t pt-8" style={{ borderColor: HAIRLINE }}>
              {stats.slice(0, 3).map((s, i) => (
                <div key={i}>
                  <div className="text-3xl font-medium tabular-nums" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>
                    {s.value}
                  </div>
                  <div className="mt-1 text-[0.7rem] uppercase tracking-[0.22em]" style={{ opacity: 0.55 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* asymmetric framed image, pushed down to break the grid baseline */}
        {props.image && (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative aspect-[4/5] overflow-hidden lg:mt-16"
            style={{
              borderRadius: "var(--brand-radius)",
              boxShadow: "0 40px 100px -45px rgba(0,0,0,0.5), 0 0 0 1px color-mix(in srgb, var(--brand-ink) 8%, transparent)",
            }}
          >
            <div className="absolute inset-0">
              <CoverImage
                image={props.image}
                gradient="linear-gradient(150deg, var(--brand-surface-2), var(--brand-accent))"
                overscan
                parallaxRef={imgRef}
                className="h-full w-full"
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/**
 * Team / people grid. A premium agency-style roster: portrait cards with the
 * member's real photo, name, role and an optional short bio. Real members only —
 * the engine omits the section entirely when none were extracted.
 */
function TeamGrid({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const members = (props.items || []) as { name: string; role?: string; image?: string; bio?: string }[];
  if (!members.length) return null;
  return (
    <section className="px-6 py-24 sm:py-28" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          {props.eyebrow && (
            <span className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em]" style={{ color: "var(--brand-accent)" }}>
              <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
              {props.eyebrow}
            </span>
          )}
          <h2 className="mt-5 rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>
            {props.title}
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {members.map((m, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: EASE, delay: (i % 4) * 0.05 }}
            >
              <CoverImage
                image={m.image}
                gradient="linear-gradient(150deg, var(--brand-surface-2), var(--brand-accent))"
                position="center"
                className="aspect-[4/5] w-full overflow-hidden"
                style={{ borderRadius: "var(--brand-radius)", boxShadow: "0 24px 60px -36px rgba(0,0,0,0.5), 0 0 0 1px color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}
              />
              <h3 className="mt-4 text-base font-medium tracking-tight" style={{ color: "var(--brand)" }}>{m.name}</h3>
              {m.role && <p className="mt-0.5 text-sm" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{m.role}</p>}
              {m.bio && <p className="mt-2 text-[13px] leading-relaxed line-clamp-3" style={{ color: "var(--brand-ink)", opacity: 0.55 }}>{m.bio}</p>}
            </motion.div>
          ))}
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
            color: "var(--brand-accent-ink)",
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
/**
 * Full-bleed editorial hero (the Havenn signature). A single characteristic
 * photograph fills the frame; the brand wordmark + sector label ride a hairline
 * meta row up top; a monumental display title is anchored bottom-left, with the
 * real description and a real-service caption sitting on a baseline rule beside
 * the CTAs. Editorial, image-led, and entirely brand-derived — the eyebrow is
 * the sector ("Real Estate", "Restaurant"…) and the caption a genuine service,
 * so every business reads as itself, never a template.
 */
function HeroImageFull({ props }: { props: any }) {
  const bgRef = React.useRef<HTMLImageElement>(null);
  useParallax(bgRef);
  const reduce = useReducedMotion();
  const brand = (props.brand || "") as string;
  return (
    <section className="relative flex min-h-[92vh] flex-col overflow-hidden px-6 pb-10 pt-7 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <CoverImage
          image={props.image}
          gradient="linear-gradient(135deg, var(--brand), var(--brand-accent))"
          priority
          overscan
          parallaxRef={bgRef}
          className="h-full w-full"
        />
      </div>
      {/* Dual scrim: a whisper up top so the meta row stays legible, a deep well
          at the base so the editorial title sits on near-solid ink. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.04) 26%, rgba(0,0,0,0.12) 52%, rgba(0,0,0,0.86))" }}
      />

      {/* top meta row — brand wordmark left, sector label right */}
      <div
        className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-6 border-b pb-5"
        style={{ borderColor: "rgba(255,255,255,0.16)" }}
      >
        {brand && <span className="truncate text-sm font-medium tracking-tight">{brand}</span>}
        {props.eyebrow && (
          <span className="shrink-0 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-white/75">
            {props.eyebrow}
          </span>
        )}
      </div>

      {/* editorial title, anchored to the bottom of the frame */}
      <div className="relative mx-auto mt-auto w-full max-w-6xl">
        {props.eyebrow && (
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-white/80"
          >
            <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
            {props.eyebrow}
          </motion.span>
        )}
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 26, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
          className="mt-5 max-w-[14ch] text-[clamp(2.9rem,8.2vw,7rem)] leading-[0.95] tracking-[-0.035em] [text-wrap:balance]"
          style={{ fontFamily: "var(--brand-font)", fontWeight: 590 }}
        >
          {props.title}
        </motion.h1>

        {/* baseline row: real description + service caption left, CTAs right */}
        <div
          className="mt-9 flex flex-col gap-6 border-t pt-6 sm:flex-row sm:items-end sm:justify-between"
          style={{ borderColor: "rgba(255,255,255,0.16)" }}
        >
          <div className="max-w-md">
            {props.subtitle && <p className="text-[15px] leading-relaxed text-white/80">{props.subtitle}</p>}
            {props.caption && (
              <p className="mt-3 text-[0.66rem] uppercase tracking-[0.22em] text-white/55">{props.caption}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {props.primaryCta && (
              <a {...ctaAttrs(props.primaryHref)} className="px-6 py-3 text-sm font-medium text-white" style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)" }}>
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
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>
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
              className="flex flex-col border rf-card p-7"
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
  const bgRef = React.useRef<HTMLImageElement>(null);
  useParallax(bgRef);
  const word = (props.brand || props.title || "Studio") as string;
  return (
    <section className="relative flex min-h-[92vh] flex-col overflow-hidden px-6 pb-0 pt-28 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <CoverImage
          image={props.image}
          gradient="linear-gradient(135deg, var(--brand), var(--brand-accent))"
          priority
          overscan
          parallaxRef={bgRef}
          className="h-full w-full"
        />
      </div>
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
          className="max-w-2xl text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1.04] tracking-[-0.02em]"
          style={{ fontFamily: "var(--brand-font)", fontWeight: 590 }}
        >
          {props.title}
        </motion.h1>
        <div className="mt-7 flex flex-wrap gap-3">
          {props.primaryCta && (
            <a {...ctaAttrs(props.primaryHref)} className="px-6 py-3 text-sm font-medium text-white" style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)" }}>
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
            <a {...ctaAttrs(props.primaryHref)} className="px-6 py-3 text-sm font-medium text-white" style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)" }}>
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
/**
 * Beam hero — a Linear/Vercel-grade centered statement: a badge pill, a large
 * headline whose final word is painted with the brand gradient, a lead, dual
 * CTA, and one slow conic beam + masked grid behind. Real trust stats only
 * (never fabricated). Brand-tokened, dark-auto, export-safe, reduced-motion.
 */
function HeroBeam({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const words = String(props.title || "").trim().split(/\s+/).filter(Boolean);
  const last = words.length > 1 ? words.pop()! : "";
  const stats = (props.stats || []) as { value: string; label: string }[];
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-32 text-center sm:pt-40" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <motion.div
        aria-hidden
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 0.5, rotate: reduce ? 0 : 360 }}
        transition={{ opacity: { duration: 1 }, rotate: { duration: 64, repeat: Infinity, ease: "linear" } }}
        className="pointer-events-none absolute left-1/2 top-[-30%] h-[640px] w-[640px] -translate-x-1/2 rounded-full blur-[90px]"
        style={{ background: "conic-gradient(from 90deg, transparent, color-mix(in srgb, var(--brand-accent) 40%, transparent), transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,#000,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--brand-ink) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--brand-ink) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="relative mx-auto max-w-3xl">
        {props.eyebrow && (
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium"
            style={{ borderColor: HAIRLINE, background: "var(--brand-surface-2)", color: "var(--brand-ink)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand-accent)" }} />
            {props.eyebrow}
          </motion.span>
        )}
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
          className="mt-6 text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] [text-wrap:balance]"
          style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}
        >
          {words.join(" ")}
          {last && " "}
          {last && (
            <span style={{ background: "linear-gradient(120deg, var(--brand-accent), var(--brand-accent-2))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{last}</span>
          )}
        </motion.h1>
        {props.subtitle && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
            className="mx-auto mt-6 max-w-xl rf-fluid-lead"
            style={{ color: "var(--brand-ink)", opacity: 0.65 }}
          >
            {props.subtitle}
          </motion.p>
        )}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          {props.primaryCta && (
            <a {...ctaAttrs(props.primaryHref)} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium" style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)" }}>
              {props.primaryCta} <ArrowRight weight="bold" className="h-4 w-4" />
            </a>
          )}
          {props.secondaryCta && (
            <a {...ctaAttrs(props.secondaryHref)} className="inline-flex items-center border px-6 py-3 text-sm font-medium" style={{ borderColor: HAIRLINE, color: "var(--brand)", borderRadius: "var(--brand-radius)" }}>
              {props.secondaryCta}
            </a>
          )}
        </motion.div>
        {stats.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {stats.slice(0, 3).map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-semibold tabular-nums" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>{s.value}</div>
                <div className="mt-0.5 text-[0.7rem] uppercase tracking-[0.18em]" style={{ color: "var(--brand-ink)", opacity: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Archform hero — the full-bleed architectural archetype (after the ARCHFORM
 * Framer reference): a single characteristic photo, a colossal UPPERCASE display
 * line anchored bottom-left, the brand wordmark + sector on a top meta row, pill
 * CTAs and a scroll cue. Brand-adapted (the client's own image, accent, name) —
 * deliberately heavier/uppercase (weight 800) than the house default for this
 * bold archetype. Real <img> for LCP, parallax, dark-auto, reduced-motion.
 */
function HeroArchform({ props }: { props: any }) {
  const bgRef = React.useRef<HTMLImageElement>(null);
  useParallax(bgRef);
  const reduce = useReducedMotion();
  const brand = (props.brand || "") as string;
  return (
    <section className="relative flex min-h-[94vh] flex-col overflow-hidden px-6 pb-10 pt-7 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <CoverImage
          image={props.image}
          gradient="linear-gradient(135deg, var(--brand), var(--brand-accent))"
          priority
          overscan
          parallaxRef={bgRef}
          className="h-full w-full"
        />
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.88))" }} />

      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-6">
        {brand && <span className="truncate text-sm font-semibold uppercase tracking-[0.22em]">{brand}</span>}
        {props.eyebrow && (
          <span className="hidden shrink-0 text-[0.66rem] font-medium uppercase tracking-[0.28em] text-white/70 sm:block">{props.eyebrow}</span>
        )}
      </div>

      <div className="relative mx-auto mt-auto w-full max-w-6xl">
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
          className="max-w-[16ch] text-[clamp(2.8rem,9vw,8rem)] uppercase leading-[0.92] tracking-[-0.02em] [text-wrap:balance]"
          style={{ fontFamily: "var(--brand-font)", fontWeight: 800 }}
        >
          {props.title}
        </motion.h1>
        <div className="mt-8 flex flex-col gap-6 border-t pt-6 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
          {props.subtitle && <p className="max-w-md text-[15px] leading-relaxed text-white/80">{props.subtitle}</p>}
          <div className="flex flex-wrap items-center gap-3">
            {props.primaryCta && (
              <a {...ctaAttrs(props.primaryHref)} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium uppercase tracking-wide" style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "9999px" }}>
                {props.primaryCta}
              </a>
            )}
            {props.secondaryCta && (
              <a {...ctaAttrs(props.secondaryHref)} className="inline-flex items-center border px-6 py-3 text-sm font-medium uppercase tracking-wide text-white" style={{ borderColor: "rgba(255,255,255,0.5)", borderRadius: "9999px" }}>
                {props.secondaryCta}
              </a>
            )}
            <span className="hidden items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-white/60 lg:inline-flex">
              Scroll <span aria-hidden>&darr;</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

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
            className="mt-6 rf-fluid-display font-semibold [text-wrap:balance]"
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
                color: "var(--brand-accent-ink)",
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

/**
 * Split Premium hero — left: eyebrow, large headline, lead, CTA group; right: a
 * floating "product preview" card (browser chrome + the real image) with a brand
 * glow, hairline, mouse-follow tilt and a gentle float. The modern Linear/Stripe/
 * Vercel hero: copy and product side by side, never a centered headline + button.
 */
function HeroSplitPremium({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const dna = useDNA(props);
  const [t, setT] = React.useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent) => {
    if (reduce || dna.motionLevel < 2) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setT({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
  };
  const rise = (d: number) => dnaEntrance(dna, d);
  const sectionPy = dnaSectionPy(dna);
  const heightStyle = props.heightVh ? { minHeight: `${props.heightVh}vh` } : {};
  return (
    <section className="relative flex items-center overflow-hidden px-6" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)", paddingTop: sectionPy, paddingBottom: sectionPy, ...heightStyle }}>
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-28 h-[520px] w-[520px] rounded-full blur-3xl" style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--brand-accent) 45%, transparent), transparent)", opacity: 0.5 }} />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          {props.eyebrow && (
            <motion.span {...rise(0)} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 12%, transparent)", color: "color-mix(in srgb, var(--brand-ink) 65%, transparent)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand-accent)" }} />
              {props.eyebrow}
            </motion.span>
          )}
          <motion.h1 {...rise(1)} className="mt-5 rf-fluid-display font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title || props.headline}</motion.h1>
          {(props.subtitle || props.description) && <motion.p {...rise(2)} className="mt-5 max-w-xl rf-fluid-lead" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{props.subtitle || props.description}</motion.p>}
          <motion.div {...rise(3)} className="mt-8 flex flex-wrap items-center gap-4">
            <a {...ctaAttrs(props.primaryHref || props.ctaHref)} className={dnaCtaClasses(dna)} style={dnaCtaStyle(dna)}>
              {props.primaryCta || props.ctaLabel || "Get started"}
              <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            {(props.secondaryCta || props.secondaryCtaLabel) && (
              <a {...ctaAttrs(props.secondaryHref || props.secondaryCtaHref)} className="text-sm font-medium underline-offset-4 transition-opacity hover:opacity-70" style={dnaSecondaryCta(dna)}>
                {props.secondaryCta || props.secondaryCtaLabel}
              </a>
            )}
          </motion.div>
          {props.stats && Array.isArray(props.stats) && props.stats.length > 0 && (
            <motion.div {...rise(4)} className="mt-10 flex flex-wrap gap-8">
              {(props.stats as { value: string; label: string }[]).slice(0, 3).map((s, i) => (
                <div key={i}>
                  <div className="text-2xl font-semibold" style={{ color: "var(--brand)" }}><StatValue value={s.value} /></div>
                  <div className="text-xs mt-1" style={{ color: "color-mix(in srgb, var(--brand-ink) 55%, transparent)" }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
        <motion.div {...rise(4)} onMouseMove={onMove} onMouseLeave={() => setT({ x: 0, y: 0 })} style={{ perspective: 1000 }}>
          <motion.div
            className="flex flex-col overflow-hidden rounded-[1.25rem]"
            style={{ aspectRatio: "4 / 3", boxShadow: `0 44px 120px -28px color-mix(in srgb, var(--brand-accent) 45%, transparent), inset 0 0 0 1px ${HAIRLINE}`, transformStyle: "preserve-3d" }}
            animate={reduce || dna.motionLevel < 2 ? {} : { rotateY: t.x * 4, rotateX: -t.y * 4, y: [0, -10, 0] }}
            transition={{ rotateY: { duration: 0.3 }, rotateX: { duration: 0.3 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
          >
            <div className="flex shrink-0 items-center gap-1.5 px-4 py-3" style={{ background: "color-mix(in srgb, var(--brand-ink) 7%, transparent)" }}>
              {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: "color-mix(in srgb, var(--brand-ink) 18%, transparent)" }} />)}
            </div>
            <CoverImage image={props.image || props.heroImageUrl} priority gradient="linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 30%, transparent), transparent)" className="flex-1" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Bento hero — a large headline beside a Framer-style bento that fuses the
 * product preview with real proof: animated metric tiles when genuine stats were
 * extracted, otherwise the brand's real key services. Never fabricates numbers.
 */
function HeroBento({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const stats = (props.stats || []) as { value: string; label: string }[];
  const services = (props.services || []) as string[];
  const rise = (d: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, ease: EASE, delay: d },
  });
  const tile = "rounded-[1.1rem] p-5";
  const tileStyle = { background: "var(--brand-card)", boxShadow: `inset 0 0 0 1px ${HAIRLINE}` } as React.CSSProperties;
  return (
    <section className="relative overflow-hidden px-6 py-20 sm:py-24" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-6rem] h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--brand-accent) 35%, transparent), transparent)", opacity: 0.45 }} />
      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-3xl">
          {props.eyebrow && (
            <motion.span {...rise(0)} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 12%, transparent)", color: "color-mix(in srgb, var(--brand-ink) 65%, transparent)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand-accent)" }} />
              {props.eyebrow}
            </motion.span>
          )}
          <motion.h1 {...rise(0.06)} className="mt-5 rf-fluid-display font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</motion.h1>
          {props.subtitle && <motion.p {...rise(0.12)} className="mt-5 max-w-xl rf-fluid-lead" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{props.subtitle}</motion.p>}
          <motion.div {...rise(0.18)} className="mt-7 flex flex-wrap items-center gap-4">
            <a {...ctaAttrs(props.primaryHref)} className="group inline-flex items-center gap-1.5 px-7 py-3.5 text-sm font-medium text-white transition-transform active:scale-[0.98]" style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)", boxShadow: "0 12px 34px -10px color-mix(in srgb, var(--brand-accent) 70%, transparent)" }}>
              {props.primaryCta || "Get started"}
              <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            {props.secondaryCta && <a {...ctaAttrs(props.secondaryHref)} className="text-sm font-medium underline-offset-4 transition-opacity hover:opacity-70" style={{ color: "var(--brand)" }}>{props.secondaryCta}</a>}
          </motion.div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Large product-preview tile */}
          <motion.div {...rise(0.2)} className="col-span-2 row-span-2">
            <CoverImage image={props.image} priority gradient="linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 30%, transparent), transparent)" className="h-full w-full rounded-[1.1rem]" style={{ minHeight: 220, boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }} />
          </motion.div>
          {/* Proof tiles: real metrics, else real services */}
          {(stats.length ? stats.slice(0, 4) : services.slice(0, 4).map((s) => ({ value: "", label: s }))).map((it, i) => (
            <motion.div key={i} {...rise(0.24 + i * 0.05)} className={cn(tile, "flex flex-col justify-center transition-transform duration-300 hover:-translate-y-1")} style={tileStyle}>
              {it.value && <div className="text-2xl font-semibold tabular-nums" style={{ color: "var(--brand)" }}><StatValue value={it.value} /></div>}
              <div className={cn(it.value ? "mt-1 text-xs" : "text-sm font-medium")} style={{ color: it.value ? "color-mix(in srgb, var(--brand-ink) 55%, transparent)" : "var(--brand)" }}>{it.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Aurora hero — an ambient, cinematic hero: a drifting brand aurora, an overhead
 * spotlight and faint meteors behind blur-fade copy, with the real product image
 * in a beam-lit preview card. Showcases the premium effect primitives; fully
 * brand-tokened and export-safe (effects freeze, content stays). Apple/Linear
 * "atmosphere" feel.
 */
function HeroAurora({ props }: { props: any }) {
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center sm:py-32" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <Aurora className="opacity-70" />
      <Spotlight />
      <Meteors count={12} className="opacity-60" />
      <div
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,#000,transparent)]"
        style={{ backgroundImage: "linear-gradient(to right, color-mix(in srgb, var(--brand-ink) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--brand-ink) 5%, transparent) 1px, transparent 1px)", backgroundSize: "64px 64px" }}
      />
      <div className="relative z-10 mx-auto max-w-3xl">
        {props.eyebrow && (
          <BlurFade>
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 12%, transparent)", color: "color-mix(in srgb, var(--brand-ink) 65%, transparent)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand-accent)" }} />
              {props.eyebrow}
            </span>
          </BlurFade>
        )}
        <BlurFade delay={0.08}>
          <h1 className="mt-6 rf-fluid-display font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</h1>
        </BlurFade>
        {props.subtitle && (
          <BlurFade delay={0.16}>
            <p className="mx-auto mt-5 max-w-xl rf-fluid-lead" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{props.subtitle}</p>
          </BlurFade>
        )}
        <BlurFade delay={0.24}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a {...ctaAttrs(props.primaryHref)} className="group inline-flex items-center gap-1.5 px-7 py-3.5 text-sm font-medium text-white transition-transform active:scale-[0.98]" style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)", boxShadow: "0 12px 34px -10px color-mix(in srgb, var(--brand-accent) 70%, transparent)" }}>
              {props.primaryCta || "Get started"}
              <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            {props.secondaryCta && <a {...ctaAttrs(props.secondaryHref)} className="text-sm font-medium underline-offset-4 transition-opacity hover:opacity-70" style={{ color: "var(--brand)" }}>{props.secondaryCta}</a>}
          </div>
        </BlurFade>
        {props.image && (
          <BlurFade delay={0.32}>
            <div className="relative mx-auto mt-14 w-full max-w-3xl">
              <BorderBeam radius="1.25rem" />
              <CoverImage image={props.image} priority gradient="linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 25%, transparent), transparent)" className="rounded-[1.25rem]" style={{ aspectRatio: "16 / 10", boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }} />
            </div>
          </BlurFade>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Catalog expansion - extra premium variants (footers / CTA / features)      */
/* -------------------------------------------------------------------------- */

/** Multi-column footer: brand + real page links + real services + real contact.
 *  The "agency site map" footer. Only renders columns that have real content. */
function FooterColumns({ props }: { props: any }) {
  const services = (props.services || []).slice(0, 5) as string[];
  const contact = props.contact || {};
  const pages = [
    { label: "Home", href: "#top" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];
  const col = "flex flex-col gap-2.5 text-sm";
  const head = "text-xs font-medium uppercase tracking-wider";
  return (
    <footer className="border-t px-6 py-16" style={{ borderColor: HAIRLINE, color: "var(--brand-ink)" }}>
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="text-2xl font-medium tracking-tight" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>{props.brand}</div>
          <p className="mt-3 max-w-xs text-sm" style={{ opacity: 0.55 }}>Crafted with care.</p>
        </div>
        <div className={col}>
          <span className={head} style={{ opacity: 0.5 }}>Pages</span>
          {pages.map((p) => (
            <a key={p.label} href={p.href} className="transition-opacity hover:opacity-100" style={{ opacity: 0.7 }}>{p.label}</a>
          ))}
        </div>
        {services.length > 0 && (
          <div className={col}>
            <span className={head} style={{ opacity: 0.5 }}>Services</span>
            {services.map((s) => (
              <a key={s} href="#services" className="transition-opacity hover:opacity-100" style={{ opacity: 0.7 }}>{s}</a>
            ))}
          </div>
        )}
        {(contact.email || contact.phone || contact.address) && (
          <div className={col}>
            <span className={head} style={{ opacity: 0.5 }}>Contact</span>
            {contact.email && <a href={`mailto:${contact.email}`} className="transition-opacity hover:opacity-100" style={{ opacity: 0.7 }}>{contact.email}</a>}
            {contact.phone && <a href={`tel:${String(contact.phone).replace(/\s+/g, "")}`} className="transition-opacity hover:opacity-100" style={{ opacity: 0.7 }}>{contact.phone}</a>}
            {contact.address && <span style={{ opacity: 0.7 }}>{contact.address}</span>}
          </div>
        )}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: HAIRLINE, opacity: 0.55 }}>
        <span>&copy; {new Date().getFullYear()} {props.brand}. All rights reserved.</span>
        {Array.isArray(props.social) && props.social.length > 0 && (
          <ul className="flex flex-wrap items-center gap-4">
            {(props.social as { platform: string; url: string }[]).map((s) => (
              <li key={s.platform}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform} className="transition-opacity hover:opacity-100" style={{ opacity: 0.85 }}>
                  {s.platform}
                </a>
              </li>
            ))}
          </ul>
        )}
        <span>Privacy &middot; Terms</span>
      </div>
    </footer>
  );
}

/** Minimal centered footer: a colossal brand wordmark over a thin legal line.
 *  Confident and quiet - for brands that let the name carry it. */
function FooterMinimal({ props }: { props: any }) {
  return (
    <footer className="overflow-hidden border-t px-6 pt-16 text-center" style={{ borderColor: HAIRLINE, color: "var(--brand-ink)" }}>
      <a href="#top" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors hover:bg-[var(--brand-surface)]" style={{ borderColor: HAIRLINE, color: "var(--brand)" }}>
        Back to top <span aria-hidden>&uarr;</span>
      </a>
      {Array.isArray(props.social) && props.social.length > 0 && (
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs">
          {(props.social as { platform: string; url: string }[]).map((s) => (
            <li key={s.platform}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform} className="transition-opacity hover:opacity-70" style={{ color: "var(--brand-ink)", opacity: 0.7 }}>
                {s.platform}
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between" style={{ opacity: 0.55 }}>
        <span>&copy; {new Date().getFullYear()} {props.brand}. All rights reserved.</span>
        <span>Privacy &middot; Terms</span>
      </div>
      <div className="pointer-events-none -mb-[0.18em] mt-6 select-none whitespace-nowrap text-[22vw] font-semibold leading-none tracking-tight" style={{ color: "var(--brand)", opacity: 0.06 }}>
        {props.brand}
      </div>
    </footer>
  );
}

/** Horizontal CTA band: headline left, button right, on a brand-tinted surface
 *  with a hairline. Compact and high-conversion; great between content and footer. */
function CTABanner({ props }: { props: any }) {
  return (
    <section className="px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto flex max-w-5xl flex-col items-start gap-6 rounded-[1.5rem] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10"
        style={{ background: "color-mix(in srgb, var(--brand-accent) 10%, var(--brand-surface))", boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
      >
        <div>
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</h2>
          {props.subtitle && <p className="mt-2 max-w-md text-sm" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{props.subtitle}</p>}
        </div>
        <a {...ctaAttrs(props.ctaHref)} className="group inline-flex shrink-0 items-center gap-1.5 px-7 py-3.5 text-sm font-medium text-white transition-transform active:scale-[0.98]" style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)", boxShadow: "0 12px 34px -10px color-mix(in srgb, var(--brand-accent) 70%, transparent)" }}>
          {props.cta}
          <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </motion.div>
    </section>
  );
}

/** Full-bleed gradient CTA: a bold accent-gradient panel with an ambient glow and
 *  a colossal headline. Stripe/Vercel-grade closing moment. */
function CTAGradient({ props }: { props: any }) {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] px-8 py-20 text-center sm:px-16"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 90%, black), color-mix(in srgb, var(--brand-accent) 55%, black))" }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(255,255,255,0.25), transparent 60%)" }} />
        <div className="relative">
          <h2 className="rf-fluid-display font-semibold text-white [text-wrap:balance]">{props.title}</h2>
          {props.subtitle && <p className="mx-auto mt-4 max-w-lg text-white/80 [text-wrap:balance]">{props.subtitle}</p>}
          <a {...ctaAttrs(props.ctaHref)} className="group mt-8 inline-flex items-center gap-1.5 bg-white px-8 py-4 text-sm font-medium text-neutral-900 shadow-xl transition-transform active:scale-[0.98]" style={{ borderRadius: "var(--brand-radius)" }}>
            {props.cta}
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/** Spotlight feature cards: a cursor-following radial light warms each card on
 *  hover (Linear/Aceternity feel). Export-safe: no JS just means no spotlight. */
function FeaturesSpotlight({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <section className="px-6 py-20 sm:py-24" style={{ background: "var(--brand-surface)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</h2>
          {props.subtitle && <p className="mt-3" style={{ color: "var(--brand-ink)", opacity: 0.55 }}>{props.subtitle}</p>}
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              onMouseMove={onMove}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
              className="group relative overflow-hidden rounded-[1.1rem] p-6 rf-card"
              style={{ boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(220px circle at var(--mx) var(--my), color-mix(in srgb, var(--brand-accent) 18%, transparent), transparent 70%)" }} />
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center" style={{ color: "var(--brand-accent)", background: "color-mix(in srgb, var(--brand-accent) 12%, transparent)", borderRadius: "calc(var(--brand-radius) * 0.7)" }}>
                  <BlockIcon name={item.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold" style={{ color: "var(--brand)" }}>{item.title}</h3>
                {item.description && <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{item.description}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Columns feature layout: tidy 3-up columns, each with a top accent rule and a
 *  numbered index. Calm, editorial, content-dense friendly. */
function FeaturesColumns({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  return (
    <section className="px-6 py-20 sm:py-24" style={{ background: "var(--brand-surface)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</h2>
          {props.subtitle && <p className="mt-3" style={{ color: "var(--brand-ink)", opacity: 0.55 }}>{props.subtitle}</p>}
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
            >
              <div className="h-px w-10" style={{ background: "var(--brand-accent)" }} />
              <div className="mt-4 text-xs font-medium tabular-nums" style={{ color: "var(--brand-ink)", opacity: 0.4 }}>{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-2 text-lg font-semibold" style={{ color: "var(--brand)" }}>{item.title}</h3>
              {item.description && <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{item.description}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Editorial features — a sticky narrative column (title + lead + CTA) holds
 * while the capabilities scroll past as hairline-separated rows with an
 * oversized index. Calm, Linear/Framer editorial; for service-led brands.
 */
/**
 * Process / storytelling timeline — the client's real services presented as a
 * connected, numbered journey down a hairline rail (agency "how we work" feel).
 * Reveals on scroll. Never fabricated: the steps ARE the extracted services.
 */
function ProcessTimeline({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const items = (props.items || []) as any[];
  return (
    <section className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-3xl">
        <div className="max-w-2xl">
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>{props.title}</h2>
          {props.subtitle && <p className="mt-3 text-lg" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{props.subtitle}</p>}
        </div>
        <ol className="relative mt-12 border-l" style={{ borderColor: HAIRLINE }}>
          {items.map((it, i) => (
            <motion.li
              key={i}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 6) * 0.05, ease: EASE }}
              className="relative ml-8 pb-12 last:pb-0"
            >
              <span
                className="absolute -left-8 top-0 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--brand)" }}>{it.title}</h3>
              {it.description && (
                <p className="mt-2 max-w-xl leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.62 }}>{it.description}</p>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * Big-type features — a single editorial column of oversized numbered rows
 * (index + title + description). Arc/Vercel statement clarity; distinct from the
 * grid/bento layouts. For calm, content-confident brands.
 */
function FeaturesBigType({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const items = (props.items || []) as any[];
  return (
    <section className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-4xl">
        <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>{props.title}</h2>
        <div className="mt-12">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 6) * 0.04, ease: EASE }}
              className="flex flex-col gap-3 border-t py-8 sm:flex-row sm:items-baseline sm:gap-10"
              style={{ borderColor: HAIRLINE }}
            >
              <span className="w-[2.5ch] shrink-0 text-[clamp(1.8rem,3.4vw,2.8rem)] font-medium leading-none tabular-nums" style={{ fontFamily: "var(--brand-font)", color: "color-mix(in srgb, var(--brand-accent) 42%, transparent)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-tight" style={{ color: "var(--brand)" }}>{it.title}</h3>
                {it.description && (
                  <p className="mt-2 max-w-xl leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{it.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSticky({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const items = (props.items || []) as any[];
  return (
    <section className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <span className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.28em]" style={{ color: "var(--brand-accent)" }}>
            <span className="h-px w-9" style={{ background: "var(--brand-accent)" }} />
            What we do
          </span>
          <h2 className="mt-5 rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="mt-4 max-w-md text-lg leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{props.subtitle}</p>
          )}
          {props.primaryCta && (
            <a {...ctaAttrs(props.primaryHref)} className="mt-7 inline-flex items-center gap-2 text-sm font-medium" style={{ color: "var(--brand-accent)" }}>
              {props.primaryCta} <span aria-hidden>→</span>
            </a>
          )}
        </div>
        <div className="border-t" style={{ borderColor: HAIRLINE }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 6) * 0.04, ease: EASE }}
              className="grid grid-cols-[auto_1fr] items-start gap-5 border-b py-7"
              style={{ borderColor: HAIRLINE }}
            >
              <span className="text-2xl font-medium tabular-nums" style={{ fontFamily: "var(--brand-font)", color: "color-mix(in srgb, var(--brand-accent) 45%, transparent)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--brand)" }}>{item.title}</h3>
                {item.description && (
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{item.description}</p>
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
 * Image-led features showcase — uniform premium cards, each with a REAL photo
 * (when the source has enough imagery), title and description; clean icon tiles
 * otherwise. Apple feature-grid clarity for visual sectors. Real <img> (lazy).
 */
function FeaturesShowcase({ props }: { props: any }) {
  const reduce = useReducedMotion();
  const items = (props.items || []) as any[];
  return (
    <section className="px-6 py-24" style={{ color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>{props.title}</h2>
          {props.subtitle && <p className="mt-3 text-lg" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{props.subtitle}</p>}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: EASE }}
              className="group flex flex-col overflow-hidden border"
              style={{ borderColor: HAIRLINE, borderRadius: "calc(var(--brand-radius) * 1.1)" }}
            >
              {item.image ? (
                <CoverImage image={item.image} gradient="linear-gradient(150deg, var(--brand-surface-2), var(--brand-accent))" className="aspect-[4/3] w-full" />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center" style={{ background: "var(--brand-surface-2)" }}>
                  <span style={{ color: "var(--brand-accent)" }}><BlockIcon name={item.icon} className="h-8 w-8" /></span>
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--brand)" }}>{item.title}</h3>
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{item.description}</p>
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
 * Product grid - the client's REAL catalogue, kept whole and modernized. A
 * responsive grid of premium product cards (image + name + price), every entry
 * scraped from the source site (never fabricated). Cards link to the real
 * product. Brand-tokened, dark-mode, export-safe.
 */
function ProductGrid({ props }: { props: any }) {
  const items = (props.items || []) as { name: string; price?: string; image?: string; url?: string }[];
  return (
    <section className="px-6 py-20 sm:py-24" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          {props.eyebrow && (
            <div className="mb-3 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--brand-accent)" }}>{props.eyebrow}</div>
          )}
          <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</h2>
          {props.subtitle && <p className="mt-3" style={{ color: "var(--brand-ink)", opacity: 0.55 }}>{props.subtitle}</p>}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it, i) => (
            <motion.a
              key={i}
              href={it.url || "#contact"}
              {...(it.url && /^https?:/i.test(it.url) ? { target: "_blank", rel: "noreferrer" } : {})}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 8) * 0.04, ease: EASE }}
              className="group flex flex-col overflow-hidden rounded-[1rem] rf-card transition-transform duration-300 hover:-translate-y-1"
              style={{ boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
            >
              <CoverImage
                image={it.image}
                gradient="linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 18%, transparent), transparent)"
                className="aspect-square w-full"
              />
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h3 className="line-clamp-2 text-sm font-medium" style={{ color: "var(--brand)" }}>{it.name}</h3>
                {it.price && <div className="mt-auto pt-1 text-sm font-semibold" style={{ color: "var(--brand-accent)" }}>{it.price}</div>}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Catalog expansion - testimonials / contact / gallery (premium variants)    */
/* -------------------------------------------------------------------------- */

const initialsOf = (n: string) =>
  (n || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

/** Single monumental pull-quote on a brand-contrast panel with a soft glow.
 *  Apple/Linear "one big proof" moment; secondary names sit quietly below. */
function TestimonialsSpotlight({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  if (!items.length) return null;
  const t = items[0];
  return (
    <section className="px-6 py-24" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-4xl text-center">
        {props.title && <div className="mb-10 text-xs font-medium uppercase tracking-[0.28em]" style={{ color: "var(--brand-accent)" }}>{props.title}</div>}
        <motion.figure
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative overflow-hidden px-8 py-14 text-white sm:px-16"
          style={{ background: "var(--brand-contrast)", borderRadius: "calc(var(--brand-radius) * 1.6)", boxShadow: "0 40px 100px -40px rgba(0,0,0,0.5)" }}
        >
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 120% at 50% 0%, color-mix(in srgb, var(--brand-accent) 30%, transparent), transparent 60%)" }} />
          <div className="relative">
            <div className="text-sm tracking-widest" style={{ color: "var(--brand-accent)" }}>★★★★★</div>
            <blockquote className="mx-auto mt-6 max-w-3xl text-[clamp(1.5rem,3.2vw,2.4rem)] font-medium leading-[1.25] [text-wrap:balance]">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-8 flex items-center justify-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold" style={{ background: "color-mix(in srgb, var(--brand-accent) 22%, transparent)", color: "var(--brand-accent)" }}>{initialsOf(t.name || t.author)}</span>
              <span className="text-left">
                <span className="block text-sm font-semibold">{t.name || t.author}</span>
                {t.role && <span className="block text-xs text-white/60">{t.role}</span>}
              </span>
            </figcaption>
          </div>
        </motion.figure>
        {items.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm" style={{ color: "var(--brand-ink)", opacity: 0.5 }}>
            {items.slice(1, 5).map((o, i) => <span key={i}>{o.name || o.author}</span>)}
          </div>
        )}
      </div>
    </section>
  );
}

/** Editorial stacked quotes: large pull-quotes separated by hairlines, alternating
 *  alignment, generous whitespace. Reads like a press page. */
function TestimonialsStacked({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  if (!items.length) return null;
  return (
    <section className="px-6 py-24" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-4xl">
        {props.title && <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</h2>}
        <div className="mt-12 flex flex-col">
          {items.slice(0, 4).map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: EASE }}
              className={cn("border-t py-9", i % 2 === 1 && "sm:pl-[18%]")}
              style={{ borderColor: HAIRLINE }}
            >
              <blockquote className="text-[clamp(1.25rem,2.4vw,1.8rem)] font-medium leading-[1.3] [text-wrap:balance]" style={{ color: "var(--brand)" }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>
                <span className="font-semibold" style={{ opacity: 1 }}>{t.name || t.author}</span>
                {t.role && <span> · {t.role}</span>}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Contact details card: a centered premium card with real email/phone/address
 *  rows + a primary action. For businesses where a form would be friction. */
function ContactDetailsCard({ props }: { props: any }) {
  const c = props.contact || {};
  const phoneHref = c.phone ? `tel:${String(c.phone).replace(/\s+/g, "")}` : undefined;
  const rows = [
    c.email && { label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.phone && { label: "Phone", value: c.phone, href: phoneHref },
    c.address && { label: "Visit", value: c.address },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];
  const primary = c.bookingUrl ? { label: "Book now", href: c.bookingUrl } : c.email ? { label: "Get in touch", href: `mailto:${c.email}` } : phoneHref ? { label: "Call us", href: phoneHref } : null;
  return (
    <section id="contact" className="px-6 py-24" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto max-w-2xl rf-card p-10 text-center sm:p-14"
        style={{ borderRadius: "calc(var(--brand-radius) * 1.4)", boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
      >
        <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</h2>
        {props.subtitle && <p className="mx-auto mt-3 max-w-md" style={{ color: "var(--brand-ink)", opacity: 0.6 }}>{props.subtitle}</p>}
        <div className="mx-auto mt-9 flex max-w-sm flex-col divide-y" style={{ borderColor: HAIRLINE }}>
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-4 py-3.5 text-left" style={{ borderColor: HAIRLINE }}>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--brand-ink)", opacity: 0.45 }}>{r.label}</span>
              {r.href ? (
                <a href={r.href} className="text-sm font-medium hover:underline" style={{ color: "var(--brand)" }}>{r.value}</a>
              ) : (
                <span className="text-sm" style={{ color: "var(--brand-ink)", opacity: 0.8 }}>{r.value}</span>
              )}
            </div>
          ))}
        </div>
        {primary && (
          <a {...ctaAttrs(primary.href)} className="group mt-9 inline-flex items-center gap-1.5 px-7 py-3.5 text-sm font-medium text-white transition-transform active:scale-[0.98]" style={{ background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)", boxShadow: "0 12px 34px -10px color-mix(in srgb, var(--brand-accent) 70%, transparent)" }}>
            {primary.label}
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        )}
      </motion.div>
    </section>
  );
}

/** Closing contact band: a full-bleed brand-contrast panel with a big invite and
 *  the real next steps (email / call / book) as buttons. */
function ContactBanner({ props }: { props: any }) {
  const c = props.contact || {};
  const phoneHref = c.phone ? `tel:${String(c.phone).replace(/\s+/g, "")}` : undefined;
  return (
    <section id="contact" className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative mx-auto max-w-5xl overflow-hidden px-8 py-16 text-center text-white sm:px-16 sm:py-20"
        style={{ background: "var(--brand-contrast)", borderRadius: "calc(var(--brand-radius) * 1.6)" }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 120% at 50% 0%, color-mix(in srgb, var(--brand-accent) 32%, transparent), transparent 60%)" }} />
        <div className="relative">
          <h2 className="rf-fluid-display font-semibold [text-wrap:balance]">{props.title}</h2>
          {props.subtitle && <p className="mx-auto mt-4 max-w-lg text-white/65 [text-wrap:balance]">{props.subtitle}</p>}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a {...ctaAttrs(c.bookingUrl || (c.email ? `mailto:${c.email}` : "#contact"))} className="inline-flex items-center gap-1.5 bg-white px-7 py-3.5 text-sm font-medium transition-transform active:scale-[0.98]" style={{ color: "var(--brand-contrast)", borderRadius: "var(--brand-radius)" }}>
              {c.bookingUrl ? "Book now" : "Email us"}
            </a>
            {phoneHref && (
              <a href={phoneHref} className="inline-flex items-center gap-1.5 px-6 py-3.5 text-sm font-medium text-white ring-1 ring-white/25 transition-colors hover:bg-white/10" style={{ borderRadius: "var(--brand-radius)" }}>
                {c.phone}
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/** Masonry gallery: a real-image columns layout with captions that lift on hover. */
function GalleryMasonry({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  if (!items.length) return null;
  return (
    <section className="px-6 py-20 sm:py-24" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          {props.eyebrow && <div className="mb-3 text-xs font-medium uppercase tracking-[0.22em]" style={{ color: "var(--brand-accent)" }}>{props.eyebrow}</div>}
          {props.title && <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</h2>}
        </div>
        <div className="mt-10 [column-gap:1rem] sm:columns-2 lg:columns-3">
          {items.slice(0, 9).map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: EASE, delay: (i % 3) * 0.05 }}
              className="group relative mb-4 overflow-hidden break-inside-avoid rounded-[1rem]"
              style={{ boxShadow: `inset 0 0 0 1px ${HAIRLINE}`, aspectRatio: i % 3 === 0 ? "3 / 4" : "4 / 3" }}
            >
              <CoverImage image={it.image} gradient="linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 18%, transparent), transparent)" className="absolute inset-0 h-full w-full" />
              {it.title && (
                <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                  <span className="text-sm font-medium text-white">{it.title}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Horizontal gallery strip with scroll-snap (no JS): a premium, swipeable rail. */
function GalleryStrip({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  if (!items.length) return null;
  return (
    <section className="py-20 sm:py-24" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <div className="mx-auto mb-8 max-w-6xl px-6">
        {props.eyebrow && <div className="mb-3 text-xs font-medium uppercase tracking-[0.22em]" style={{ color: "var(--brand-accent)" }}>{props.eyebrow}</div>}
        {props.title && <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</h2>}
      </div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.slice(0, 10).map((it, i) => (
          <div
            key={i}
            className="relative w-[78%] shrink-0 snap-center overflow-hidden rounded-[1.1rem] sm:w-[42%] lg:w-[30%]"
            style={{ aspectRatio: "4 / 3", boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
          >
            <CoverImage image={it.image} gradient="linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 18%, transparent), transparent)" className="absolute inset-0 h-full w-full" />
            {it.title && <div className="absolute inset-x-0 bottom-0 z-10 p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}><span className="text-sm font-medium text-white">{it.title}</span></div>}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Full-bleed alternating gallery: large image bands with a caption beside each.
 *  Editorial, image-led; great for hospitality / property / studios. */
function GalleryFeature({ props }: { props: any }) {
  const items = (props.items || []) as any[];
  if (!items.length) return null;
  return (
    <section className="px-6 py-20 sm:py-24" style={{ background: "var(--brand-surface)", color: "var(--brand-ink)" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {props.title && <h2 className="rf-fluid-h2 font-semibold [text-wrap:balance]" style={{ color: "var(--brand)" }}>{props.title}</h2>}
        {items.slice(0, 5).map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className={cn("flex flex-col gap-6 sm:items-center", i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row")}
          >
            <CoverImage image={it.image} gradient="linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 20%, transparent), transparent)" className="w-full rounded-[1.25rem] sm:w-[62%]" style={{ aspectRatio: "16 / 10", boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }} />
            <div className="flex-1">
              {it.tag && <div className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--brand-accent)" }}>{it.tag}</div>}
              <h3 className="mt-2 text-2xl font-semibold" style={{ color: "var(--brand)" }}>{it.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const REGISTRY: Record<string, React.ComponentType<{ props: any }>> = {
  TestimonialsSpotlight,
  TestimonialsStacked,
  ContactDetailsCard,
  ContactBanner,
  GalleryMasonry,
  GalleryStrip,
  GalleryFeature,
  ProductGrid,
  FooterColumns,
  FooterMinimal,
  CTABanner,
  CTAGradient,
  FeaturesSpotlight,
  FeaturesColumns,
  HeroAurora,
  HeroSplitPremium,
  HeroBento,
  HeroPremium1,
  HeroCanvas,
  HeroPremium2,
  HeroEditorial,
  HeroSpotlight,
  HeroImageFull,
  HeroMonumental,
  HeroAgencia,
  HeroBeam,
  HeroArchform,
  StatementAgencia,
  StatementEditorial,
  TeamGrid,
  CTAAsterisk,
  FeaturesGrid1,
  FeaturesBento,
  FeaturesAlternating,
  FeaturesSticky,
  FeaturesShowcase,
  FeaturesBigType,
  ProcessTimeline,
  ServicesList,
  ServicesCards,
  PortfolioGrid,
  StatsCounter,
  AboutSplit,
  TestimonialsSlider1,
  TestimonialsEditorial,
  TestimonialsGrid,
  FaqGrid,
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
  team: "Team",
  testimonials: "Reviews",
  pricing: "Pricing",
  faq: "FAQ",
  contact: "Contact",
};

const anchorId = (type: BlockType): string => (type === "hero" ? "top" : type);

type NavItem = { label: string; href?: string; onClick?: () => void; active?: boolean };

/** Sticky brand navigation. Items can be anchors (single-page) or buttons that
 *  switch page client-side (multi-page). */
/**
 * Brand mark for the rebuilt site's nav: the REAL logo pulled from the source
 * site, proxied (caching/referrer/hotlink bypass), with the wordmark (brand
 * name) as a graceful fallback when there is no logo or it fails to load.
 *
 * Auto-contrast: the proxied logo is same-origin, so once loaded we sample it on
 * a canvas. A near-monochrome logo that would vanish against the canvas (a dark
 * logo on dark, a light logo on light) is flipped to read; colour logos are left
 * untouched. Tainted/failed reads simply skip the treatment.
 */
/** Light/dark hint from the logo's filename (e.g. "logo-black.svg",
 *  "brand-white.svg"). Many sites ship theme-specific assets and name them so;
 *  this is the reliable signal for SVG logos, which taint a canvas and can't be
 *  pixel-sampled. Returns the logo's own tone: "dark" = a dark-coloured mark. */
function logoToneFromUrl(u: string): "dark" | "light" | undefined {
  if (/(?:^|[-_/.])(black|dark|noir|onlight|on-light)(?:[-_/.]|$)/i.test(u)) return "dark";
  if (/(?:^|[-_/.])(white|light|blanc|ondark|on-dark|inverse|inverted)(?:[-_/.]|$)/i.test(u)) return "light";
  return undefined;
}

/** Filter needed for a logo of the given tone to read on this theme. */
function fixFor(tone: "dark" | "light" | undefined, dark?: boolean): string | undefined {
  if (tone === "dark" && dark) return "brightness(0) invert(1)"; // dark mark -> white on dark
  if (tone === "light" && !dark) return "brightness(0)"; // light mark -> black on light
  return undefined;
}

function BrandLogo({ logo, name, dark }: { logo?: string; name: string; dark?: boolean }) {
  const [failed, setFailed] = React.useState(false);
  // The logo's intrinsic tone: seeded from the filename hint (works for SVGs),
  // refined by canvas sampling once a raster logo loads. "color" marks are never
  // recoloured.
  const [tone, setTone] = React.useState<"dark" | "light" | "color" | undefined>(
    logo ? logoToneFromUrl(logo) : undefined
  );
  // Effective scheme follows the visitor's OS preference (the site auto-flips via
  // prefers-color-scheme), falling back to the baked default — so the logo stays
  // legible in whichever mode is actually painted.
  const [effDark, setEffDark] = React.useState(!!dark);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const d = window.matchMedia("(prefers-color-scheme: dark)");
    const l = window.matchMedia("(prefers-color-scheme: light)");
    const update = () => setEffDark(d.matches ? true : l.matches ? false : !!dark);
    update();
    d.addEventListener("change", update);
    l.addEventListener("change", update);
    return () => {
      d.removeEventListener("change", update);
      l.removeEventListener("change", update);
    };
  }, [dark]);

  const src = logo ? toProxiedUrl(logo) : undefined;
  const filter = tone === "color" ? undefined : fixFor(tone, effDark);

  const analyze = React.useCallback((img: HTMLImageElement) => {
    try {
      const w = 24, h = 24;
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      let n = 0, lum = 0, sat = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 32) continue; // ignore transparent pixels
        const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        lum += (max + min) / 2;
        sat += max === 0 ? 0 : (max - min) / max;
        n++;
      }
      if (!n) return;
      lum /= n;
      sat /= n;
      // Record the tone; the filter is derived from it + the effective scheme,
      // so it re-resolves automatically when the OS preference flips.
      if (sat >= 0.15) setTone("color");
      else if (lum < 0.5) setTone("dark");
      else if (lum > 0.6) setTone("light");
    } catch {
      /* cross-origin/tainted: leave the logo as extracted */
    }
  }, []);

  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        onLoad={(e) => analyze(e.currentTarget)}
        onError={() => setFailed(true)}
        className="h-7 w-auto max-w-[170px] object-contain"
        style={filter ? { filter } : undefined}
      />
    );
  }
  return (
    <span className="text-lg font-medium tracking-tight" style={{ fontFamily: "var(--brand-font)", color: "var(--brand)" }}>
      {name}
    </span>
  );
}

function SiteNav({ brand, items, cta, logoUrl, dark }: { brand: NavItem; items: NavItem[]; cta: NavItem; logoUrl?: string; dark?: boolean }) {
  const link = (it: NavItem, key: React.Key) => {
    const cls = "text-sm transition-opacity hover:opacity-70";
    const style = { color: "var(--brand-ink)", opacity: it.active ? 1 : 0.72 } as React.CSSProperties;
    return it.href ? (
      <a key={key} href={it.href} className={cls} style={style}>{it.label}</a>
    ) : (
      <button key={key} type="button" onClick={it.onClick} className={cls} style={style}>{it.label}</button>
    );
  };
  const ctaCls = "shrink-0 px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98]";
  const ctaStyle = { background: "var(--brand-accent)", color: "var(--brand-accent-ink)", borderRadius: "var(--brand-radius)" } as React.CSSProperties;

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--brand-surface) 82%, transparent)",
        borderBottom: `1px solid ${HAIRLINE}`,
        // Sit below the status bar / notch on phones (viewportFit: cover).
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-[max(1.5rem,env(safe-area-inset-left))] py-3.5">
        {brand.href ? (
          <a href={brand.href} className="inline-flex items-center" aria-label={brand.label}>
            <BrandLogo logo={logoUrl} name={brand.label} dark={dark} />
          </a>
        ) : (
          <button type="button" onClick={brand.onClick} className="inline-flex items-center" aria-label={brand.label}>
            <BrandLogo logo={logoUrl} name={brand.label} dark={dark} />
          </button>
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
  published,
}: {
  schema: SiteSchema;
  basePath?: string;
  page?: string;
  /** A live/hosted render (vs the in-app editor preview). Hosted sites default
   *  to static for instant paint + SEO; the owner opts into motion via the AI
   *  editor (schema.animations === true). */
  published?: boolean;
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

  // Motion policy. In the editor preview, animations are on by default (off only
  // if the client turned them off). On a live/hosted site we default to STATIC
  // for instant paint + SEO (content visible with no JS-dependent reveal), and
  // the owner opts in via the AI editor (schema.animations === true).
  // reducedMotion="always" stops framer motion; data-animate kills CSS
  // animations AND forces framer's inline reveal states (opacity:0) visible.
  const animationsOn = published ? schema.animations === true : schema.animations !== false;

  const themeScope = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const fontLink = fontGoogleUrl(schema.theme.font);
  return (
    <MotionConfig reducedMotion={animationsOn ? "user" : "always"}>
      {fontLink && <link rel="stylesheet" href={fontLink} />}
      <style dangerouslySetInnerHTML={{ __html: themeCss(schema.theme, themeScope, schema.tokens) }} />
      <div
        className="rf-site"
        data-rf={themeScope}
        data-animate={animationsOn ? "on" : "off"}
        style={{
          background: "var(--brand-surface)",
          color: "var(--brand-ink)",
          scrollBehavior: "smooth",
        }}
      >
        <SiteNav brand={brand} items={items} cta={cta} logoUrl={schema.brand.logo} dark={schema.theme.dark === true} />
        {current.blocks.map((block, i) => (
          <div key={block.id} id={anchorId(block.type)} style={{ scrollMarginTop: "76px" }}>
            <BlockRenderer block={block} index={i + 1} />
          </div>
        ))}
      </div>
    </MotionConfig>
  );
}
