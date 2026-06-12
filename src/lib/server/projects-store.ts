import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { SiteAnalysis, SiteSchema } from "@/lib/generation/types";

/**
 * Server-side persistence for user *projects* (a saved generation: the schema
 * plus the analysis behind its before/after view). This is the seam that was
 * previously only client-side sessionStorage, so a signed-in user's work now
 * survives refreshes, devices and the editor round-trip.
 *
 * Same env-driven adapter idea as the sites store: Vercel KV / Upstash Redis
 * when its credentials are present, the filesystem otherwise. Projects are
 * keyed by a random id and indexed per owner so listing is O(owner's projects).
 */

export interface Project {
  id: string;
  ownerId: string;
  schema: SiteSchema;
  /** Kept so the result page can still render the "before" view after reload. */
  analysis?: SiteAnalysis;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight shape for listing — never ships the full schema/analysis. */
export interface ProjectSummary {
  id: string;
  brandName: string;
  sourceUrl: string;
  industry: string;
  updatedAt: string;
}

export function projectSummary(p: Project): ProjectSummary {
  return {
    id: p.id,
    brandName: p.schema.brand?.name ?? "Untitled",
    sourceUrl: p.schema.sourceUrl ?? "",
    industry: p.schema.industry ?? "generic",
    updatedAt: p.updatedAt,
  };
}

function newId(): string {
  return crypto.randomBytes(9).toString("base64url");
}

/* -------------------------------------------------------------------------- */
/*  Backends                                                                  */
/* -------------------------------------------------------------------------- */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const useKv = Boolean(KV_URL && KV_TOKEN);

const kvKey = (id: string) => `project:${id}`;
const kvIndex = (ownerId: string) => `projects:${ownerId}`;

async function kv<T = unknown>(command: (string | number)[]): Promise<T> {
  const res = await fetch(KV_URL as string, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV ${command[0]} failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { result: T; error?: string };
  if (data.error) throw new Error(`KV ${command[0]} error: ${data.error}`);
  return data.result;
}

const FS_DIR = process.env.REFRAME_DATA_DIR
  ? path.join(path.resolve(process.env.REFRAME_DATA_DIR), "projects")
  : path.join(process.cwd(), ".data", "projects");
const fileFor = (id: string) => path.join(FS_DIR, `${id}.json`);

async function readRaw(id: string): Promise<Project | null> {
  if (useKv) {
    const raw = await kv<string | null>(["GET", kvKey(id)]);
    return raw ? (JSON.parse(raw) as Project) : null;
  }
  try {
    return JSON.parse(await fs.readFile(fileFor(id), "utf8")) as Project;
  } catch {
    return null;
  }
}

async function writeRaw(p: Project): Promise<void> {
  if (useKv) {
    await kv(["SET", kvKey(p.id), JSON.stringify(p)]);
    await kv(["ZADD", kvIndex(p.ownerId), Date.parse(p.updatedAt), p.id]);
    return;
  }
  await fs.mkdir(FS_DIR, { recursive: true });
  await fs.writeFile(fileFor(p.id), JSON.stringify(p), "utf8");
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export async function createProject(
  ownerId: string,
  schema: SiteSchema,
  analysis?: SiteAnalysis
): Promise<Project> {
  const now = new Date().toISOString();
  const project: Project = { id: newId(), ownerId, schema, analysis, createdAt: now, updatedAt: now };
  await writeRaw(project);
  return project;
}

/** Read a project, owner-checked. Returns null if absent or not owned by user. */
export async function getProject(id: string, ownerId: string): Promise<Project | null> {
  const p = await readRaw(id);
  if (!p || p.ownerId !== ownerId) return null;
  return p;
}

export async function updateProject(
  id: string,
  ownerId: string,
  patch: { schema?: SiteSchema; analysis?: SiteAnalysis }
): Promise<Project | null> {
  const p = await readRaw(id);
  if (!p || p.ownerId !== ownerId) return null;
  const next: Project = {
    ...p,
    schema: patch.schema ?? p.schema,
    analysis: patch.analysis ?? p.analysis,
    updatedAt: new Date().toISOString(),
  };
  await writeRaw(next);
  return next;
}

export async function deleteProject(id: string, ownerId: string): Promise<boolean> {
  const p = await readRaw(id);
  if (!p || p.ownerId !== ownerId) return false;
  if (useKv) {
    await kv(["DEL", kvKey(id)]);
    await kv(["ZREM", kvIndex(ownerId), id]);
  } else {
    await fs.rm(fileFor(id), { force: true });
  }
  return true;
}

/** A single owner's projects, newest first. */
export async function listProjectsByOwner(ownerId: string): Promise<Project[]> {
  if (useKv) {
    const ids = await kv<string[]>(["ZRANGE", kvIndex(ownerId), "0", "-1", "REV"]);
    if (!ids?.length) return [];
    const all = await Promise.all(ids.map(readRaw));
    return all.filter((p): p is Project => p !== null && p.ownerId === ownerId);
  }
  let names: string[];
  try {
    names = await fs.readdir(FS_DIR);
  } catch {
    return [];
  }
  const all = await Promise.all(
    names
      .filter((n) => n.endsWith(".json"))
      .map(async (n) => {
        try {
          return JSON.parse(await fs.readFile(path.join(FS_DIR, n), "utf8")) as Project;
        } catch {
          return null;
        }
      })
  );
  return all
    .filter((p): p is Project => p !== null && p.ownerId === ownerId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
