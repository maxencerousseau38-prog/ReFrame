/**
 * Vercel Domains API client, env-driven with graceful degradation (same pattern
 * as the KV / email / Stripe / render adapters: no SDK, just fetch to an HTTP
 * endpoint).
 *
 * Connecting a custom domain is the core promise of the paid plans. For a domain
 * like `www.acme.com` to actually serve a published site over HTTPS, it has to
 * be *registered with our Vercel project* — only then does Vercel route the host
 * to this deployment and auto-provision a TLS certificate once DNS points at it.
 * A local DNS lookup alone never gets the customer a working, secure site.
 *
 * Configure (production):
 *   VERCEL_API_TOKEN   token with access to the project (Account Settings → Tokens)
 *   VERCEL_PROJECT_ID  the project these sites deploy to (prj_...)
 *   VERCEL_TEAM_ID     team/owner id, when the project lives under a team (team_...)
 *
 * Without VERCEL_API_TOKEN / VERCEL_PROJECT_ID, isVercelDomainsConfigured() is
 * false and the domain route falls back to a best-effort local DNS check, so the
 * app still runs unchanged in dev.
 */

const API_TOKEN = process.env.VERCEL_API_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_TEAM_ID;

const API_BASE = "https://api.vercel.com";

/** Vercel's stable pointing targets (https://vercel.com/docs/projects/domains). */
const VERCEL_A_RECORD = "76.76.21.21";
const VERCEL_CNAME_TARGET = "cname.vercel-dns.com";

/** A DNS record the customer must create to finish setup (and unlock TLS). */
export interface DnsRecord {
  type: "A" | "CNAME" | "TXT";
  /** Host portion to set at the registrar (`@` for the apex, or the subdomain). */
  name: string;
  value: string;
  /** Why this record is needed, when Vercel supplies a reason. */
  reason?: string;
}

export interface DomainStatus {
  domain: string;
  /** Added to the project (whether or not DNS is correct yet). */
  attached: boolean;
  /** Vercel has confirmed ownership and DNS points at us — TLS is being issued. */
  verified: boolean;
  /** DNS is not (yet) pointing at Vercel; the site won't serve until fixed. */
  misconfigured: boolean;
  /** Records the customer should add at their registrar to finish setup. */
  records: DnsRecord[];
}

/** Domain connection is handled by Vercel only when fully configured. */
export function isVercelDomainsConfigured(): boolean {
  return Boolean(API_TOKEN && PROJECT_ID);
}

/** Typed failure so the route can map Vercel errors to sensible HTTP responses. */
export class VercelDomainsError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number
  ) {
    super(message);
    this.name = "VercelDomainsError";
  }
}

function withTeam(path: string): string {
  const url = new URL(`${API_BASE}${path}`);
  if (TEAM_ID) url.searchParams.set("teamId", TEAM_ID);
  return url.toString();
}

async function vercelFetch<T>(
  path: string,
  init: RequestInit & { method: string }
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  let res: Response;
  try {
    res = await fetch(withTeam(path), {
      ...init,
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      signal: controller.signal,
    });
  } catch {
    throw new VercelDomainsError("Could not reach Vercel.", "network", 502);
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return undefined as T;

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* empty / non-JSON body */
  }

  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string } })?.error;
    throw new VercelDomainsError(
      err?.message || `Vercel request failed (${res.status}).`,
      err?.code || "request_failed",
      res.status
    );
  }
  return body as T;
}

/** Shape of a Vercel project-domain (subset we use). */
interface VercelProjectDomain {
  name: string;
  verified: boolean;
  verification?: Array<{ type: string; domain: string; value: string; reason?: string }>;
}

/** Shape of GET /v6/domains/{domain}/config (subset). */
interface VercelDomainConfig {
  misconfigured: boolean;
}

/** Is this an apex/root domain (acme.com) vs a subdomain (www.acme.com)? */
export function isApexDomain(domain: string): boolean {
  // Two labels = apex. More labels = subdomain (covers the common www./app. case;
  // multi-part TLDs like .co.uk apex are rare here and still get a working CNAME
  // path from the customer's registrar if they prefer).
  return domain.split(".").length <= 2;
}

/**
 * Build the DNS records a customer must add at their registrar, given Vercel's
 * verification challenges. Apex domains take an A record; subdomains a CNAME.
 * Pure (no I/O) so the instructions are easy to test and reason about.
 */
export function recommendedRecords(
  domain: string,
  challenges: VercelProjectDomain["verification"] = []
): DnsRecord[] {
  const records: DnsRecord[] = [];

  // Ownership-challenge records Vercel hands back (needed when the domain is
  // already in use elsewhere). Surface them verbatim.
  for (const c of challenges ?? []) {
    if (c.type?.toUpperCase() === "TXT" || c.type?.toUpperCase() === "CNAME") {
      records.push({
        type: c.type.toUpperCase() === "TXT" ? "TXT" : "CNAME",
        name: c.domain,
        value: c.value,
        reason: c.reason,
      });
    }
  }

  // The pointing record that actually routes traffic (and unlocks TLS).
  if (isApexDomain(domain)) {
    records.push({ type: "A", name: "@", value: VERCEL_A_RECORD });
  } else {
    const host = domain.split(".")[0];
    records.push({ type: "CNAME", name: host, value: VERCEL_CNAME_TARGET });
  }
  return records;
}

function configError(): never {
  throw new VercelDomainsError("Vercel domains are not configured.", "not_configured", 503);
}

async function fetchConfig(domain: string): Promise<boolean> {
  // Best-effort: if the config probe fails, assume misconfigured (DNS pending)
  // rather than reporting a domain as live before it actually serves.
  try {
    const cfg = await vercelFetch<VercelDomainConfig>(
      `/v6/domains/${encodeURIComponent(domain)}/config`,
      { method: "GET" }
    );
    return Boolean(cfg.misconfigured);
  } catch {
    return true;
  }
}

function toStatus(domain: string, pd: VercelProjectDomain, misconfigured: boolean): DomainStatus {
  return {
    domain,
    attached: true,
    // A domain only truly serves (with TLS) once Vercel verified ownership AND
    // DNS resolves correctly. Both must hold.
    verified: Boolean(pd.verified) && !misconfigured,
    misconfigured,
    records: recommendedRecords(domain, pd.verification),
  };
}

/**
 * Register a domain with the project (idempotent) and return its current status,
 * including the DNS records the customer still needs to add. Vercel issues the
 * TLS certificate automatically once `verified` flips true.
 */
export async function attachDomain(domain: string): Promise<DomainStatus> {
  if (!isVercelDomainsConfigured()) configError();
  let pd: VercelProjectDomain;
  try {
    pd = await vercelFetch<VercelProjectDomain>(
      `/v10/projects/${encodeURIComponent(PROJECT_ID!)}/domains`,
      { method: "POST", body: JSON.stringify({ name: domain }) }
    );
  } catch (e) {
    // Already on this project from a previous attempt — fine, just read it back.
    if (e instanceof VercelDomainsError && e.status === 409) {
      return getDomainStatus(domain);
    }
    throw e;
  }
  const misconfigured = await fetchConfig(domain);
  return toStatus(domain, pd, misconfigured);
}

/** Read the live status of a domain already (or expected to be) on the project. */
export async function getDomainStatus(domain: string): Promise<DomainStatus> {
  if (!isVercelDomainsConfigured()) configError();
  const pd = await vercelFetch<VercelProjectDomain>(
    `/v9/projects/${encodeURIComponent(PROJECT_ID!)}/domains/${encodeURIComponent(domain)}`,
    { method: "GET" }
  );
  const misconfigured = await fetchConfig(domain);
  return toStatus(domain, pd, misconfigured);
}

/** Remove a domain from the project. No-op (resolves) if it isn't attached. */
export async function detachDomain(domain: string): Promise<void> {
  if (!isVercelDomainsConfigured()) configError();
  try {
    await vercelFetch<void>(
      `/v9/projects/${encodeURIComponent(PROJECT_ID!)}/domains/${encodeURIComponent(domain)}`,
      { method: "DELETE" }
    );
  } catch (e) {
    if (e instanceof VercelDomainsError && e.status === 404) return;
    throw e;
  }
}
