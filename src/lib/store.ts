"use client";

import type { SiteAnalysis, SiteSchema } from "@/lib/generation/types";

/**
 * Client persistence for the analyze → result → editor flow.
 *
 * Two layers:
 *  - sessionStorage (below) is the always-available fast path and the anonymous
 *    fallback, so the flow works without an account.
 *  - the server-backed project helpers (further down) persist a signed-in user's
 *    work across refreshes, devices and the editor round-trip. They no-op
 *    (return null/false) when the user isn't signed in, so callers can always
 *    try them.
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

/* -------------------------------------------------------------------------- */
/*  Server-backed projects (signed-in users)                                  */
/* -------------------------------------------------------------------------- */

/** Persist a generated project. Returns its id, or null if not signed in. */
export async function createProject(
  schema: SiteSchema,
  analysis?: SiteAnalysis | null
): Promise<string | null> {
  try {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema, analysis: analysis ?? undefined }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id?: string };
    return data.id ?? null;
  } catch {
    return null;
  }
}

/** Load a saved project by id, or null if absent / not owned / offline. */
export async function fetchProject(
  id: string
): Promise<{ schema: SiteSchema; analysis: SiteAnalysis | null } | null> {
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { schema: SiteSchema; analysis: SiteAnalysis | null };
    return { schema: data.schema, analysis: data.analysis ?? null };
  } catch {
    return null;
  }
}

/** Save an edit back to a project. Returns true on success. */
export async function updateProject(id: string, schema: SiteSchema): Promise<boolean> {
  try {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Read the current project id from the URL (`?p=`), if any. */
export function projectIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("p");
}
