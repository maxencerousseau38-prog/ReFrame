/**
 * V2 UNDERSTAND — content language detection.
 *
 * Two mechanical signals, in charter order (measured first, inferred second):
 *   1. the <html lang> attribute — declared by the site itself;
 *   2. a stopword heuristic over the visible text (fr/en/es/de/it), which
 *      only answers when one language wins with a clear margin.
 *
 * Returns undefined when inconclusive — the caller falls back to "en" for
 * generated labels and that fallback stays visible in the provenance
 * (nothing invented, nothing silent).
 */

import type { HTMLElement } from "node-html-parser";

export type DetectedLanguage = {
  /** ISO 639-1 two-letter code. */
  lang: string;
  source: "html-attr" | "heuristic";
};

export const SUPPORTED_LANGUAGES = ["en", "fr", "es", "de", "it"] as const;

/** Distinctive, frequent, language-exclusive stopwords (lowercase). */
const STOPWORDS: Record<(typeof SUPPORTED_LANGUAGES)[number], string[]> = {
  en: ["the", "and", "with", "your", "our", "from", "this", "are", "you", "for"],
  fr: ["le", "la", "les", "des", "une", "nous", "vous", "avec", "pour", "votre", "notre", "est", "dans", "sur"],
  es: ["el", "los", "las", "una", "nuestro", "con", "para", "que", "este", "más", "servicios"],
  de: ["der", "die", "das", "und", "für", "mit", "sie", "wir", "ihre", "unsere", "nicht"],
  it: ["il", "gli", "della", "una", "nostro", "con", "per", "che", "più", "servizi", "siamo"],
};

/** Minimum hits and winning margin before the heuristic is allowed to answer. */
const MIN_HITS = 6;
const MIN_MARGIN = 1.5;

export function detectLanguage(
  root: HTMLElement | null,
  bodyText: string
): DetectedLanguage | undefined {
  // 1. Declared by the site — the strongest signal.
  const declared = root?.querySelector("html")?.getAttribute("lang")
    ?? root?.getAttribute?.("lang");
  if (declared) {
    const code = declared.trim().toLowerCase().slice(0, 2);
    if (/^[a-z]{2}$/.test(code)) return { lang: code, source: "html-attr" };
  }

  // 2. Stopword heuristic — answers only with a clear winner.
  const words = bodyText.toLowerCase().split(/[^a-zà-ÿäöüß]+/).filter(Boolean);
  if (words.length < 30) return undefined;

  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);

  const scores = SUPPORTED_LANGUAGES.map((lang) => ({
    lang,
    hits: STOPWORDS[lang].reduce((acc, sw) => acc + (counts.get(sw) ?? 0), 0),
  })).sort((a, b) => b.hits - a.hits);

  const [first, second] = scores;
  if (first.hits < MIN_HITS) return undefined;
  if (second.hits > 0 && first.hits / second.hits < MIN_MARGIN) return undefined;

  return { lang: first.lang, source: "heuristic" };
}
