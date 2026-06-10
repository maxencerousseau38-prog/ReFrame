"use client";

import type { SiteAnalysis, SiteSchema } from "@/lib/generation/types";

/**
 * Lightweight client persistence for the demo flow. In production this would be
 * Supabase/Postgres rows keyed by user + project; here we use sessionStorage so
 * the analyze → result → editor flow survives navigation without a backend.
 */

const ANALYSIS_KEY = "sr:analysis";
const SCHEMA_KEY = "sr:schema";

export function saveAnalysis(a: SiteAnalysis) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ANALYSIS_KEY, JSON.stringify(a));
}
export function loadAnalysis(): SiteAnalysis | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ANALYSIS_KEY);
  return raw ? (JSON.parse(raw) as SiteAnalysis) : null;
}

export function saveSchema(s: SiteSchema) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SCHEMA_KEY, JSON.stringify(s));
}
export function loadSchema(): SiteSchema | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SCHEMA_KEY);
  return raw ? (JSON.parse(raw) as SiteSchema) : null;
}
