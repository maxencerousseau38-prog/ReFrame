/**
 * Curated reference database — the "moodboard library" of ReFrame.
 *
 * Each entry represents a premium design reference (Framer template, Awwwards
 * site, Dribbble shot) distilled into its visual DNA. The engine doesn't copy
 * these references — it composes from them, taking the hero approach from one,
 * the card system from another, the spacing rhythm from a third, producing an
 * original composition that is always greater than any single source.
 *
 * Extensible by design: add new entries without touching the engine.
 * ~5–8 references per industry, curated for the highest quality.
 */

import type { Industry, Theme } from "./types";
import type {
  CardSystem,
  HeroDirection,
  MotionDirection,
  GalleryDirection,
  SectionRhythm,
  CtaDirection,
} from "./dna";

/* -------------------------------------------------------------------------- */
/*  Reference type                                                            */
/* -------------------------------------------------------------------------- */

export interface CuratedReference {
  id: string;
  name: string;
  /** What this reference is primarily known for. */
  inspiration: string;
  industries: Industry[];
  tier: "premium" | "luxury";
  moods: Theme["mood"][];
  /** The visual DNA traits of this reference. */
  dna: {
    heroStyle: HeroDirection["style"];
    rhythm: SectionRhythm["density"];
    spacingMultiplier: number;
    typePairing: string;
    typeWeight: number;
    cardStyle: CardSystem["style"];
    cardHover: CardSystem["hoverEffect"];
    ctaStyle: CtaDirection["style"];
    motionLevel: MotionDirection["level"];
    entranceType: MotionDirection["entranceType"];
    galleryStyle?: GalleryDirection["style"];
    colorMode: "monochrome" | "accent-rare" | "duotone" | "rich";
    usesGradients: boolean;
    prefersDark: boolean;
    imageStyle: "fullbleed" | "framed" | "rounded" | "masked" | "editorial";
    sectionDividers: boolean;
  };
}

/* -------------------------------------------------------------------------- */
/*  The curated library                                                       */
/* -------------------------------------------------------------------------- */

export const REFERENCE_DB: CuratedReference[] = [
  // ─── Restaurant / Hospitality ───────────────────────────────────
  {
    id: "ref-flavor",
    name: "Flavor — Framer Restaurant",
    inspiration: "Full-bleed hero with scrim, editorial menu grid, warm serif display",
    industries: ["restaurant"],
    tier: "premium",
    moods: ["warm", "elegant"],
    dna: {
      heroStyle: "fullbleed",
      rhythm: "generous",
      spacingMultiplier: 1.5,
      typePairing: "Serif + Inter",
      typeWeight: 400,
      cardStyle: "editorial",
      cardHover: "none",
      ctaStyle: "ghost",
      motionLevel: 2,
      entranceType: "blur-fade",
      galleryStyle: "editorial",
      colorMode: "accent-rare",
      usesGradients: false,
      prefersDark: true,
      imageStyle: "fullbleed",
      sectionDividers: true,
    },
  },
  {
    id: "ref-restroo",
    name: "Restroo — Framer restaurant",
    inspiration:
      "Warm beige #f5ece4 / forest green #1b3c2d alternating sections, " +
      "Fraunces serif display (cv03/cv04/cv09/cv11) at 600, spring-physics hero " +
      "(damping:60, stiffness:400), monumental 188px 'Dîner' statement, " +
      "food parallax translateY(-35px) within cards, hover image reveal at -12deg, " +
      "rolling character text hover, muted gold #7f7239 sharp CTAs with arrow slide, " +
      "filterable menu grid + textual list dual presentation, scroll-triggered scale entrances",
    industries: ["restaurant"],
    tier: "premium",
    moods: ["warm", "elegant"],
    dna: {
      heroStyle: "fullbleed",
      rhythm: "editorial",
      spacingMultiplier: 1.5,
      typePairing: "Fraunces + Geist",
      typeWeight: 600,
      cardStyle: "elevated",
      cardHover: "scale",
      ctaStyle: "sharp",
      motionLevel: 2,
      entranceType: "stagger",
      galleryStyle: "grid",
      colorMode: "duotone",
      usesGradients: false,
      prefersDark: false,
      imageStyle: "editorial",
      sectionDividers: true,
    },
  },
  {
    id: "ref-noma",
    name: "Noma-inspired fine dining",
    inspiration: "Monumental typography, cinematic imagery, extreme whitespace",
    industries: ["restaurant", "hotel"],
    tier: "luxury",
    moods: ["elegant"],
    dna: {
      heroStyle: "editorial",
      rhythm: "editorial",
      spacingMultiplier: 2.0,
      typePairing: "Serif display",
      typeWeight: 400,
      cardStyle: "editorial",
      cardHover: "none",
      ctaStyle: "text-arrow",
      motionLevel: 2,
      entranceType: "reveal",
      galleryStyle: "editorial",
      colorMode: "monochrome",
      usesGradients: false,
      prefersDark: false,
      imageStyle: "editorial",
      sectionDividers: false,
    },
  },

  // ─── Architecture / Design ──────────────────────────────────────
  {
    id: "ref-archform",
    name: "ARCHFORM — Framer Architecture",
    inspiration:
      "Monumental sticky hero with per-character reveal, pure monochrome, " +
      "editorial sections with dark punctuation rhythm, sticky-stacking process cards, " +
      "3D carousel gallery, zero-radius brutalist cards, horizontal scroll portfolio",
    industries: ["architect", "construction", "realestate"],
    tier: "premium",
    moods: ["bold", "elegant"],
    dna: {
      heroStyle: "monumental",
      rhythm: "editorial",
      spacingMultiplier: 1.75,
      typePairing: "Inter Display + Inter",
      typeWeight: 700,
      cardStyle: "flat",
      cardHover: "scale",
      ctaStyle: "pill",
      motionLevel: 3,
      entranceType: "stagger",
      galleryStyle: "editorial",
      colorMode: "monochrome",
      usesGradients: false,
      prefersDark: false,
      imageStyle: "fullbleed",
      sectionDividers: true,
    },
  },
  {
    id: "ref-archinest",
    name: "Archinest — editorial architecture",
    inspiration: "Full-bleed imagery, serif captions, gallery-first composition",
    industries: ["architect", "realestate"],
    tier: "luxury",
    moods: ["elegant", "warm"],
    dna: {
      heroStyle: "fullbleed",
      rhythm: "editorial",
      spacingMultiplier: 2.0,
      typePairing: "Serif + Inter",
      typeWeight: 400,
      cardStyle: "editorial",
      cardHover: "none",
      ctaStyle: "text-arrow",
      motionLevel: 1,
      entranceType: "fade",
      galleryStyle: "editorial",
      colorMode: "monochrome",
      usesGradients: false,
      prefersDark: false,
      imageStyle: "editorial",
      sectionDividers: true,
    },
  },

  // ─── SaaS / Tech ────────────────────────────────────────────────
  {
    id: "ref-linear",
    name: "Linear-inspired SaaS",
    inspiration: "Dark canvas, glass cards, beam animation, monochrome + rare accent",
    industries: ["saas"],
    tier: "premium",
    moods: ["bold", "minimal"],
    dna: {
      heroStyle: "cinematic",
      rhythm: "generous",
      spacingMultiplier: 1.5,
      typePairing: "Inter",
      typeWeight: 500,
      cardStyle: "glass",
      cardHover: "glow",
      ctaStyle: "pill",
      motionLevel: 3,
      entranceType: "blur-fade",
      colorMode: "accent-rare",
      usesGradients: true,
      prefersDark: true,
      imageStyle: "rounded",
      sectionDividers: false,
    },
  },
  {
    id: "ref-vercel",
    name: "Vercel-inspired developer platform",
    inspiration: "Near-black, sharp type, border-lit cards, conic beam hero",
    industries: ["saas"],
    tier: "premium",
    moods: ["minimal"],
    dna: {
      heroStyle: "minimal",
      rhythm: "standard",
      spacingMultiplier: 1.25,
      typePairing: "Geist",
      typeWeight: 590,
      cardStyle: "outlined",
      cardHover: "border",
      ctaStyle: "sharp",
      motionLevel: 2,
      entranceType: "fade",
      colorMode: "monochrome",
      usesGradients: false,
      prefersDark: true,
      imageStyle: "rounded",
      sectionDividers: false,
    },
  },
  {
    id: "ref-stripe",
    name: "Stripe-inspired fintech",
    inspiration: "Gradient hero, clean type hierarchy, elevated cards, generous space",
    industries: ["saas", "finance"],
    tier: "premium",
    moods: ["minimal", "elegant"],
    dna: {
      heroStyle: "split",
      rhythm: "generous",
      spacingMultiplier: 1.5,
      typePairing: "Inter",
      typeWeight: 510,
      cardStyle: "elevated",
      cardHover: "lift",
      ctaStyle: "pill",
      motionLevel: 2,
      entranceType: "slide-up",
      colorMode: "duotone",
      usesGradients: true,
      prefersDark: false,
      imageStyle: "rounded",
      sectionDividers: false,
    },
  },

  // ─── Agency / Studio ────────────────────────────────────────────
  {
    id: "ref-agencia",
    name: "Agencia — Framer agency",
    inspiration:
      "Sticky cinematic hero with scattered Bebas Neue wordmark (200px), " +
      "spring-physics word-by-word 3D text reveal (skewX+rotateX), " +
      "pixel-grid image reveal, blur-to-sharp service names, " +
      "glass cards with gradient-fade top borders, pill CTAs with icon circle, " +
      "ember-red accent on near-black #060606 canvas, 18-section maximal portfolio",
    industries: ["agency"],
    tier: "premium",
    moods: ["bold"],
    dna: {
      heroStyle: "cinematic",
      rhythm: "generous",
      spacingMultiplier: 1.75,
      typePairing: "Bebas Neue + Archivo",
      typeWeight: 400,
      cardStyle: "glass",
      cardHover: "none",
      ctaStyle: "pill",
      motionLevel: 3,
      entranceType: "stagger",
      galleryStyle: "feature",
      colorMode: "accent-rare",
      usesGradients: false,
      prefersDark: true,
      imageStyle: "rounded",
      sectionDividers: false,
    },
  },
  {
    id: "ref-portfolio-minimal",
    name: "Minimal portfolio studio",
    inspiration: "White canvas, oversized type, editorial image pairs, text-only CTAs",
    industries: ["agency", "architect"],
    tier: "luxury",
    moods: ["minimal", "elegant"],
    dna: {
      heroStyle: "editorial",
      rhythm: "editorial",
      spacingMultiplier: 2.0,
      typePairing: "Space Grotesk",
      typeWeight: 500,
      cardStyle: "editorial",
      cardHover: "none",
      ctaStyle: "text-arrow",
      motionLevel: 1,
      entranceType: "fade",
      galleryStyle: "feature",
      colorMode: "monochrome",
      usesGradients: false,
      prefersDark: false,
      imageStyle: "editorial",
      sectionDividers: false,
    },
  },

  // ─── E-commerce / Retail ────────────────────────────────────────
  {
    id: "ref-commerce-editorial",
    name: "Editorial e-commerce",
    inspiration: "Split hero with product, lifestyle imagery, clean product grid",
    industries: ["ecommerce", "fashion"],
    tier: "premium",
    moods: ["minimal", "elegant"],
    dna: {
      heroStyle: "split",
      rhythm: "standard",
      spacingMultiplier: 1.25,
      typePairing: "Inter",
      typeWeight: 500,
      cardStyle: "flat",
      cardHover: "scale",
      ctaStyle: "pill",
      motionLevel: 1,
      entranceType: "fade",
      galleryStyle: "grid",
      colorMode: "accent-rare",
      usesGradients: false,
      prefersDark: false,
      imageStyle: "rounded",
      sectionDividers: false,
    },
  },

  // ─── Fashion / Beauty ───────────────────────────────────────────
  {
    id: "ref-fashion-editorial",
    name: "Fashion editorial lookbook",
    inspiration: "Full-bleed editorial, serif headlines, strip gallery, monochrome palette",
    industries: ["fashion"],
    tier: "luxury",
    moods: ["elegant"],
    dna: {
      heroStyle: "editorial",
      rhythm: "editorial",
      spacingMultiplier: 2.0,
      typePairing: "Serif display",
      typeWeight: 400,
      cardStyle: "editorial",
      cardHover: "none",
      ctaStyle: "text-arrow",
      motionLevel: 2,
      entranceType: "reveal",
      galleryStyle: "strip",
      colorMode: "monochrome",
      usesGradients: false,
      prefersDark: false,
      imageStyle: "editorial",
      sectionDividers: false,
    },
  },

  // ─── Hotel / Hospitality ────────────────────────────────────────
  {
    id: "ref-hotel-premium",
    name: "Havenn — Framer hotel",
    inspiration: "Full-bleed hero, editorial statement, warm tones, booking CTA",
    industries: ["hotel"],
    tier: "premium",
    moods: ["warm", "elegant"],
    dna: {
      heroStyle: "fullbleed",
      rhythm: "generous",
      spacingMultiplier: 1.75,
      typePairing: "Serif + Inter",
      typeWeight: 400,
      cardStyle: "elevated",
      cardHover: "lift",
      ctaStyle: "ghost",
      motionLevel: 2,
      entranceType: "blur-fade",
      galleryStyle: "feature",
      colorMode: "accent-rare",
      usesGradients: false,
      prefersDark: true,
      imageStyle: "fullbleed",
      sectionDividers: true,
    },
  },

  // ─── Legal / Finance / Professional ─────────────────────────────
  {
    id: "ref-law-firm",
    name: "Premium law firm",
    inspiration: "Authoritative serif, dark split hero, outlined cards, structured layout",
    industries: ["lawyer", "finance"],
    tier: "premium",
    moods: ["elegant"],
    dna: {
      heroStyle: "split",
      rhythm: "standard",
      spacingMultiplier: 1.25,
      typePairing: "Serif + Inter",
      typeWeight: 500,
      cardStyle: "outlined",
      cardHover: "border",
      ctaStyle: "ghost",
      motionLevel: 1,
      entranceType: "fade",
      colorMode: "monochrome",
      usesGradients: false,
      prefersDark: true,
      imageStyle: "framed",
      sectionDividers: true,
    },
  },

  // ─── Health / Wellness / Medical ────────────────────────────────
  {
    id: "ref-wellness-calm",
    name: "Premium wellness clinic",
    inspiration: "Light canvas, soft radii, elevated cards, calming imagery, trust-first",
    industries: ["health", "medical"],
    tier: "premium",
    moods: ["minimal", "warm"],
    dna: {
      heroStyle: "split",
      rhythm: "generous",
      spacingMultiplier: 1.5,
      typePairing: "Inter",
      typeWeight: 500,
      cardStyle: "elevated",
      cardHover: "lift",
      ctaStyle: "pill",
      motionLevel: 1,
      entranceType: "fade",
      colorMode: "accent-rare",
      usesGradients: false,
      prefersDark: false,
      imageStyle: "rounded",
      sectionDividers: false,
    },
  },

  // ─── Fitness / Gym ──────────────────────────────────────────────
  {
    id: "ref-gym-bold",
    name: "Bold fitness brand",
    inspiration: "Dark hero, bold Manrope type, glass cards, energetic motion, red accent",
    industries: ["gym", "coach"],
    tier: "premium",
    moods: ["bold"],
    dna: {
      heroStyle: "cinematic",
      rhythm: "tight",
      spacingMultiplier: 1.0,
      typePairing: "Manrope",
      typeWeight: 600,
      cardStyle: "glass",
      cardHover: "glow",
      ctaStyle: "pill",
      motionLevel: 3,
      entranceType: "stagger",
      colorMode: "duotone",
      usesGradients: true,
      prefersDark: true,
      imageStyle: "fullbleed",
      sectionDividers: false,
    },
  },

  // ─── Trades / Local Services ────────────────────────────────────
  {
    id: "ref-trades-pro",
    name: "Professional trades website",
    inspiration: "Clean split hero, timeline process, trust badges, clear CTA",
    industries: ["plumber", "electrician", "construction", "artisan"],
    tier: "premium",
    moods: ["bold", "minimal"],
    dna: {
      heroStyle: "split",
      rhythm: "standard",
      spacingMultiplier: 1.0,
      typePairing: "Inter",
      typeWeight: 590,
      cardStyle: "flat",
      cardHover: "border",
      ctaStyle: "pill",
      motionLevel: 1,
      entranceType: "slide-up",
      colorMode: "accent-rare",
      usesGradients: false,
      prefersDark: false,
      imageStyle: "rounded",
      sectionDividers: false,
    },
  },

  // ─── Real Estate ────────────────────────────────────────────────
  {
    id: "ref-realestate-editorial",
    name: "Editorial real estate",
    inspiration: "Monumental hero, property gallery, teal accent, elevated cards",
    industries: ["realestate"],
    tier: "premium",
    moods: ["elegant", "bold"],
    dna: {
      heroStyle: "monumental",
      rhythm: "generous",
      spacingMultiplier: 1.5,
      typePairing: "Space Grotesk + Inter",
      typeWeight: 510,
      cardStyle: "elevated",
      cardHover: "lift",
      ctaStyle: "ghost",
      motionLevel: 2,
      entranceType: "blur-fade",
      galleryStyle: "feature",
      colorMode: "accent-rare",
      usesGradients: false,
      prefersDark: true,
      imageStyle: "fullbleed",
      sectionDividers: false,
    },
  },

  // ─── Coaching / Consulting ──────────────────────────────────────
  {
    id: "ref-coach-modern",
    name: "Modern coaching platform",
    inspiration: "Clean hero, space grotesk, testimonial-led, purple accent, generous space",
    industries: ["coach"],
    tier: "premium",
    moods: ["minimal"],
    dna: {
      heroStyle: "split",
      rhythm: "generous",
      spacingMultiplier: 1.5,
      typePairing: "Space Grotesk",
      typeWeight: 500,
      cardStyle: "flat",
      cardHover: "border",
      ctaStyle: "pill",
      motionLevel: 2,
      entranceType: "blur-fade",
      colorMode: "accent-rare",
      usesGradients: false,
      prefersDark: false,
      imageStyle: "rounded",
      sectionDividers: false,
    },
  },

  // ─── Automotive ─────────────────────────────────────────────────
  {
    id: "ref-auto-bold",
    name: "Bold automotive brand",
    inspiration: "Full-bleed hero, dark canvas, red accent, cinematic motion, editorial gallery",
    industries: ["automotive"],
    tier: "premium",
    moods: ["bold"],
    dna: {
      heroStyle: "fullbleed",
      rhythm: "generous",
      spacingMultiplier: 1.5,
      typePairing: "Manrope",
      typeWeight: 600,
      cardStyle: "glass",
      cardHover: "glow",
      ctaStyle: "pill",
      motionLevel: 3,
      entranceType: "stagger",
      galleryStyle: "strip",
      colorMode: "duotone",
      usesGradients: true,
      prefersDark: true,
      imageStyle: "fullbleed",
      sectionDividers: false,
    },
  },
];
