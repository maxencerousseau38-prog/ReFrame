import { NextResponse } from "next/server";
import { resolveCname, resolve4 } from "dns/promises";
import { getSite, updateSite, listSites } from "@/lib/server/sites-store";
import { getCurrentUser } from "@/lib/server/auth";
import { entitlementsOf, effectivePlan } from "@/lib/server/plans";
import {
  isVercelDomainsConfigured,
  attachDomain,
  detachDomain,
  VercelDomainsError,
  type DnsRecord,
} from "@/lib/server/vercel-domains";

export const runtime = "nodejs";

const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63})+$/;

function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

/** CNAME target customers should point their domain at. */
function cnameTarget(): string {
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "reframe.site").toLowerCase();
  return `cname.${root}`;
}

/** True when the domain's DNS points at us (CNAME to our target, or our A records). */
async function verifyDns(domain: string): Promise<boolean> {
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "reframe.site").toLowerCase();
  try {
    const cnames = await resolveCname(domain);
    if (cnames.some((c) => c.toLowerCase().endsWith(root))) return true;
  } catch {
    /* no CNAME, try A records */
  }
  try {
    const rootIps = await resolve4(root);
    const ips = await resolve4(domain);
    if (rootIps.length && ips.some((ip) => rootIps.includes(ip))) return true;
  } catch {
    /* unresolved */
  }
  return false;
}

async function authorize(slug: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  const site = await getSite(slug);
  if (!site) return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) };
  if (site.ownerId !== user.id)
    return { error: NextResponse.json({ error: "Not your site." }, { status: 403 }) };
  return { user, site };
}

/** POST /api/sites/:slug/domain — connect (and verify) a custom domain. */
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const auth = await authorize(params.slug);
  if ("error" in auth) return auth.error;

  if (!entitlementsOf(effectivePlan(auth.user)).customDomain) {
    return NextResponse.json(
      { error: "Custom domains are a paid feature.", code: "upgrade" },
      { status: 402 }
    );
  }

  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "reframe.site").toLowerCase();
  const { domain: raw } = (await req.json()) as { domain?: string };
  if (typeof raw !== "string") {
    return NextResponse.json({ error: "A domain is required." }, { status: 400 });
  }
  const domain = normalizeDomain(raw);
  if (!DOMAIN_RE.test(domain) || domain.length > 253) {
    return NextResponse.json({ error: "Enter a valid domain, e.g. www.yoursite.com." }, { status: 400 });
  }
  if (domain === root || domain.endsWith(`.${root}`)) {
    return NextResponse.json({ error: `${root} domains are managed automatically.` }, { status: 400 });
  }

  // One domain per site, no stealing another site's domain.
  const taken = (await listSites()).find((s) => s.domain === domain && s.slug !== params.slug);
  if (taken) {
    return NextResponse.json({ error: "That domain is already connected to another site." }, { status: 409 });
  }

  // Preferred path: register the domain with our Vercel project so it actually
  // routes here and gets a TLS certificate. Fall back to a local DNS check when
  // Vercel isn't configured (dev / self-host without the API token).
  if (isVercelDomainsConfigured()) {
    let status;
    try {
      status = await attachDomain(domain);
    } catch (e) {
      if (e instanceof VercelDomainsError) {
        // Domain owned/used by another Vercel account → can't connect it here.
        if (e.status === 409 || e.code === "domain_already_in_use") {
          return NextResponse.json(
            { error: "That domain is in use on another Vercel account and can't be connected here." },
            { status: 409 }
          );
        }
        return NextResponse.json({ error: e.message }, { status: e.status >= 400 && e.status < 500 ? 400 : 502 });
      }
      throw e;
    }

    await updateSite(params.slug, { domain, domainVerified: status.verified });
    return NextResponse.json({
      domain,
      verified: status.verified,
      records: status.records,
      message: status.verified
        ? "Domain connected and secured (HTTPS active)."
        : dnsInstructions(status.records),
    });
  }

  const verified = await verifyDns(domain);
  await updateSite(params.slug, { domain, domainVerified: verified });

  return NextResponse.json({
    domain,
    verified,
    cname: cnameTarget(),
    message: verified
      ? "Domain connected and verified."
      : `Add a CNAME record pointing ${domain} to ${cnameTarget()}, then re-verify.`,
  });
}

/** One-line instruction summarising the records to add (for the connect toast). */
function dnsInstructions(records: DnsRecord[]): string {
  const main = records[records.length - 1];
  if (!main) return "Add the DNS records below at your registrar, then re-verify.";
  return `Add a ${main.type} record for "${main.name}" → ${main.value} at your registrar. HTTPS turns on automatically once DNS propagates — re-verify in a few minutes.`;
}

/** DELETE /api/sites/:slug/domain — disconnect the custom domain. */
export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  const auth = await authorize(params.slug);
  if ("error" in auth) return auth.error;

  // Release the domain from the Vercel project so it can be reconnected later
  // (here or elsewhere). Best-effort: never block disconnect on a Vercel hiccup.
  const current = auth.site.domain;
  if (current && isVercelDomainsConfigured()) {
    try {
      await detachDomain(current);
    } catch {
      /* leave the DB clear regardless; the domain can be cleaned up in Vercel */
    }
  }

  await updateSite(params.slug, { domain: undefined, domainVerified: undefined });
  return NextResponse.json({ ok: true });
}
