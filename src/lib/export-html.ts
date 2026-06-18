import type { Block, SiteSchema, Theme } from "./generation/types";

/**
 * Render a SiteSchema into a single standalone, dependency-free HTML document
 * with inline CSS. This is what a customer downloads/publishes: real, valid
 * markup, no React runtime, no build step.
 */

const radius: Record<Theme["radius"], string> = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "20px",
};

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const NAV_LABELS: Record<string, string> = {
  features: "Why us", services: "Services", portfolio: "Work", products: "Shop",
  gallery: "Gallery", about: "About", testimonials: "Reviews", pricing: "Pricing",
  faq: "FAQ", contact: "Contact",
};
const anchorId = (type: string) => (type === "hero" ? "top" : type);

/**
 * Emit one standalone HTML file per page (home = index.html, others =
 * <path>.html), with the nav linking between them. A single-page site returns
 * just index.html.
 */
/** Every image URL referenced anywhere in the schema (for bundling into a zip). */
export function collectImages(schema: SiteSchema): string[] {
  const urls = new Set<string>();
  const visit = (v: unknown) => {
    if (typeof v === "string") {
      if (/^https?:\/\//i.test(v) && /\.(png|jpe?g|webp|gif|avif|svg)(\?|#|$)/i.test(v)) urls.add(v);
      return;
    }
    if (Array.isArray(v)) return v.forEach(visit);
    if (v && typeof v === "object") return Object.values(v).forEach(visit);
  };
  const pages = [{ blocks: schema.blocks }, ...(schema.pages ?? [])];
  for (const p of pages) for (const b of p.blocks) visit(b.props);
  return Array.from(urls);
}

export function schemaToFiles(
  schema: SiteSchema,
  opts: { branded?: boolean; assets?: Record<string, string> } = {}
): { name: string; html: string }[] {
  const multiPage = (schema.pages?.length ?? 0) > 0;
  const paths = ["", ...(schema.pages ?? []).map((p) => p.path)];
  return paths.map((path) => ({
    name: path ? `${path}.html` : "index.html",
    html: schemaToHtml(schema, { branded: opts.branded, page: path, multiPage, assets: opts.assets }),
  }));
}

export function schemaToHtml(
  schema: SiteSchema,
  opts: { branded?: boolean; page?: string; multiPage?: boolean; assets?: Record<string, string> } = {}
): string {
  // Rewrite remote image URLs to bundled local asset paths when provided, so the
  // exported site keeps working with no dependency on ReFrame or the old host.
  const rw = (url: unknown): string => {
    const u = typeof url === "string" ? url : "";
    return (opts.assets && opts.assets[u]) || u;
  };
  const t = schema.theme;
  const allPages = [{ path: "", label: "Home", blocks: schema.blocks }, ...(schema.pages ?? [])];
  const current = allPages.find((p) => p.path === (opts.page ?? "")) ?? allPages[0];
  const fileFor = (path: string) => (path ? `${path}.html` : "index.html");
  const pageTitle = current.path ? `${current.label} · ${schema.brand.name}` : schema.brand.name;

  // Each section is anchored so the sticky nav can jump to it.
  const body = current.blocks
    .map((b) => `<div id="${anchorId(b.type)}" style="scroll-margin-top:76px">${renderBlock(b, rw)}</div>`)
    .join("\n");

  // Multi-page: link to sibling .html files. Single-page: anchor links.
  let navLinks: string;
  let ctaHref: string;
  if (opts.multiPage && allPages.length > 1) {
    navLinks = allPages
      .map((p) => `<a href="${fileFor(p.path)}" style="color:var(--brand);opacity:${p.path === current.path ? 1 : 0.72};text-decoration:none;font-size:14px">${esc(p.label)}</a>`)
      .join("");
    ctaHref = fileFor(allPages.some((p) => p.path === "contact") ? "contact" : current.path);
  } else {
    const seen = new Set<string>();
    navLinks = current.blocks
      .filter((b) => {
        const id = anchorId(b.type);
        if (!NAV_LABELS[b.type] || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((b) => `<a href="#${anchorId(b.type)}" style="color:var(--brand);opacity:.72;text-decoration:none;font-size:14px">${esc(NAV_LABELS[b.type])}</a>`)
      .join("");
    ctaHref = `#${current.blocks.some((b) => b.type === "contact") ? "contact" : "top"}`;
  }
  const brandHref = opts.multiPage && allPages.length > 1 ? "index.html" : "#top";
  const nav = `<header style="position:sticky;top:0;z-index:40;backdrop-filter:blur(8px);background:rgba(255,255,255,.82);border-bottom:1px solid #ececec">
  <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:14px;padding-bottom:14px">
    <a href="${brandHref}" style="font-weight:600;font-size:18px;color:var(--brand);text-decoration:none">${esc(schema.brand.name)}</a>
    <nav style="display:flex;gap:24px;flex-wrap:wrap">${navLinks}</nav>
    <a href="${ctaHref}" class="btn btn-primary">Contact</a>
  </div>
</header>`;
  // Plan-gated "Made with ReFrame" badge (free plans + anonymous are branded;
  // paid plans pass branded:false). Inline styles so the export stays portable.
  const badge = opts.branded
    ? `<a href="https://reframe.design" style="position:fixed;bottom:16px;right:16px;z-index:50;display:inline-flex;align-items:center;gap:6px;background:#0f0f11;color:#fff;padding:8px 14px;border-radius:9999px;font-size:12px;font-weight:600;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.18)"><span style="width:6px;height:6px;border-radius:9999px;background:#9FDE3F"></span>Made with ReFrame</a>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(schema.brand.tagline)}" />
<meta name="theme-color" content="${t.accent}" />
<meta name="robots" content="index,follow" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${esc(schema.brand.name)}" />
<meta property="og:title" content="${esc(schema.brand.name)}" />
<meta property="og:description" content="${esc(schema.brand.tagline)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(schema.brand.name)}" />
<meta name="twitter:description" content="${esc(schema.brand.tagline)}" />
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: schema.brand.name,
  description: schema.brand.tagline,
})}</script>
<style>
  :root{
    --brand:${t.primary};
    --accent:${t.accent};
    --radius:${radius[t.radius]};
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:var(--brand);background:#fff;line-height:1.5}
  .wrap{max-width:1080px;margin:0 auto;padding:0 24px}
  a{color:inherit}
  .btn{display:inline-block;padding:12px 22px;border-radius:9999px;font-weight:600;text-decoration:none;font-size:14px}
  .btn-primary{background:var(--accent);color:#fff}
  .btn-ghost{border:1px solid #ddd;color:var(--brand)}
  h1,h2,h3{letter-spacing:-0.02em;line-height:1.05;margin:0}
  section{padding:72px 0}
  .muted{color:#666}
  .grid{display:grid;gap:20px}
  @media(min-width:768px){.cols-2{grid-template-columns:1fr 1fr}.cols-3{grid-template-columns:repeat(3,1fr)}.cols-4{grid-template-columns:repeat(4,1fr)}}
  .card{border:1px solid #ececec;border-radius:var(--radius);padding:24px;background:#fff}
  input,textarea{width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:var(--radius);font:inherit;margin-top:8px}
  footer{border-top:1px solid #ececec;padding:32px 0;color:#888;font-size:14px}
</style>
</head>
<body>
${nav}
${body}
${badge}
</body>
</html>`;
}

const sectionHead = (p: Record<string, any>) =>
  `${p.eyebrow ? `<p style="color:var(--accent);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.1em">${esc(p.eyebrow)}</p>` : ""}
   ${p.title ? `<h2 style="font-size:clamp(28px,4vw,40px);margin-top:12px">${esc(p.title)}</h2>` : ""}`;

/** Static renderers for the premium blocks (keyed by variant, like the app). */
function renderServices(p: Record<string, any>): string {
  return `<section><div class="wrap">${sectionHead(p)}
    <div style="margin-top:24px;border-top:1px solid #ececec">
      ${(p.items || []).map((it: any) => `<div style="border-bottom:1px solid #ececec;padding:18px 0">
        <h3 style="font-size:19px">${esc(it.title)}</h3>
        ${it.description ? `<p class="muted" style="margin-top:6px;font-size:14px;max-width:60ch">${esc(it.description)}</p>` : ""}
      </div>`).join("")}
    </div></div></section>`;
}
function renderPortfolio(p: Record<string, any>, rw: (u: unknown) => string): string {
  return `<section><div class="wrap">${sectionHead(p)}
    <div class="grid cols-3" style="margin-top:28px">
      ${(p.items || []).map((it: any) => `<div class="card">
        ${it.image ? `<div style="aspect-ratio:4/3;border-radius:calc(var(--radius)*.6);background:#eee center/cover no-repeat;background-image:url('${esc(rw(it.image))}')"></div>` : ""}
        <h3 style="font-size:16px;margin-top:${it.image ? "12px" : "0"}">${esc(it.title)}</h3>
        ${it.tag ? `<p class="muted" style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;margin-top:4px">${esc(it.tag)}</p>` : ""}
      </div>`).join("")}
    </div></div></section>`;
}
function renderStats(p: Record<string, any>): string {
  return `<section><div class="wrap"><div style="background:var(--brand);color:#fff;border-radius:calc(var(--radius)*1.2);padding:48px 32px">
    <div class="grid cols-4">
      ${(p.items || []).map((s: any) => `<div><div style="font-size:40px;font-weight:600">${esc(s.value)}</div><div style="opacity:.6;font-size:12px;text-transform:uppercase;letter-spacing:.12em;margin-top:6px">${esc(s.label)}</div></div>`).join("")}
    </div></div></div></section>`;
}
function renderAbout(p: Record<string, any>, rw: (u: unknown) => string): string {
  const image = p.image ? rw(p.image) : "";
  return `<section><div class="wrap" style="max-width:900px">
    ${image ? `<div style="aspect-ratio:16/9;border-radius:var(--radius);background:#eee center/cover no-repeat;background-image:url('${esc(image)}');margin-bottom:28px"></div>` : ""}
    <div style="max-width:760px">${sectionHead(p)}
      ${p.body ? `<p class="muted" style="margin-top:16px;font-size:18px;max-width:62ch">${esc(p.body)}</p>` : ""}
      ${Array.isArray(p.stats) && p.stats.length ? `<div class="grid cols-3" style="margin-top:28px">${p.stats.map((s: any) => `<div><div style="font-size:30px;font-weight:600">${esc(s.value)}</div><div class="muted" style="font-size:13px">${esc(s.label)}</div></div>`).join("")}</div>` : ""}
    </div>
  </div></section>`;
}
function renderMenu(p: Record<string, any>): string {
  return `<section><div class="wrap" style="max-width:760px">${sectionHead(p)}
    <div style="margin-top:24px;border-top:1px solid #ececec">
      ${(p.items || []).map((it: any) => `<div style="border-bottom:1px solid #ececec;padding:16px 0">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:baseline">
          <h3 style="font-size:17px">${esc(it.name || it.title)}</h3>
          ${it.price ? `<span style="color:var(--accent);font-weight:600;white-space:nowrap">${esc(it.price)}</span>` : ""}
        </div>
        ${it.description ? `<p class="muted" style="margin-top:4px;font-size:14px">${esc(it.description)}</p>` : ""}
      </div>`).join("")}
    </div></div></section>`;
}

/**
 * Contact section for the exported (static, backendless) site. Every control is
 * real: Call (tel:), Book (booking URL), Directions (maps), and a form that
 * opens the visitor's mail client via mailto: so it works with no server. Falls
 * back to a plain message when no contact details were provided.
 */
function renderContact(p: Record<string, any>): string {
  const c = (p.contact || {}) as { phone?: string; email?: string; address?: string; bookingUrl?: string };
  const actions: string[] = [];
  if (c.bookingUrl) actions.push(`<a class="btn btn-primary" href="${esc(c.bookingUrl)}">Book now</a>`);
  if (c.phone) actions.push(`<a class="btn btn-ghost" href="tel:${esc(c.phone.replace(/\s+/g, ""))}">Call ${esc(c.phone)}</a>`);
  if (c.email) actions.push(`<a class="btn btn-ghost" href="mailto:${esc(c.email)}">Email us</a>`);
  if (c.address)
    actions.push(
      `<a class="btn btn-ghost" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}" target="_blank" rel="noreferrer">Directions</a>`
    );
  const details = [
    c.email ? `<a href="mailto:${esc(c.email)}" style="color:var(--brand);text-decoration:none">${esc(c.email)}</a>` : "",
    c.phone ? `<a href="tel:${esc(c.phone.replace(/\s+/g, ""))}" style="color:var(--brand);text-decoration:none">${esc(c.phone)}</a>` : "",
    c.address ? `<span class="muted">${esc(c.address)}</span>` : "",
  ].filter(Boolean);

  // A backendless form that composes an email to the business (works anywhere
  // the site is hosted). Only shown when we have an address to send to.
  const form = c.email
    ? `<form action="mailto:${esc(c.email)}" method="post" enctype="text/plain" style="margin-top:24px">
        <input name="Name" placeholder="Name" required />
        <input name="Email" type="email" placeholder="Email" required />
        <textarea name="Message" placeholder="How can we help?" rows="4"></textarea>
        <button class="btn btn-primary" type="submit" style="margin-top:14px;border:none;cursor:pointer">Send message</button>
      </form>`
    : "";

  return `<section id="contact"><div class="wrap" style="max-width:680px">
    <h2 style="font-size:clamp(28px,4vw,40px)">${esc(p.title)}</h2>
    <p class="muted" style="margin-top:10px">${esc(p.subtitle)}</p>
    ${actions.length ? `<div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap">${actions.join("")}</div>` : ""}
    ${details.length ? `<div style="margin-top:18px;display:flex;gap:20px;flex-wrap:wrap;font-size:15px">${details.join("")}</div>` : ""}
    ${form}
  </div></section>`;
}

function renderBlock(b: Block, rw: (u: unknown) => string): string {
  const p = b.props as Record<string, any>;
  // Premium blocks are keyed by variant (matching the app renderer).
  if (b.variant === "ServicesList" || b.variant === "ServicesCards") return renderServices(p);
  if (b.variant === "PortfolioGrid") return renderPortfolio(p, rw);
  if (b.variant === "StatsCounter") return renderStats(p);
  if (b.variant === "AboutSplit") return renderAbout(p, rw);
  if (b.variant === "CollectionGrid") return renderMenu(p);
  switch (b.type) {
    case "hero": {
      const heroImg = p.image ? rw(p.image) : "";
      return `<section><div class="wrap">
        ${p.eyebrow ? `<p style="color:var(--accent);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.1em">${esc(p.eyebrow)}</p>` : ""}
        <h1 style="font-size:clamp(34px,6vw,64px);margin-top:12px;max-width:14ch">${esc(p.title)}</h1>
        <p class="muted" style="font-size:18px;margin-top:16px;max-width:50ch">${esc(p.subtitle)}</p>
        <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap">
          ${p.primaryCta ? `<a class="btn btn-primary" href="${esc(p.primaryHref || "#contact")}">${esc(p.primaryCta)}</a>` : ""}
          ${p.secondaryCta ? `<a class="btn btn-ghost" href="${esc(p.secondaryHref || "#contact")}">${esc(p.secondaryCta)}</a>` : ""}
        </div>
        ${heroImg ? `<div style="margin-top:40px;aspect-ratio:16/9;border-radius:calc(var(--radius)*1.4);background:#eee center/cover no-repeat;background-image:url('${esc(heroImg)}')"></div>` : ""}
      </div></section>`;
    }

    case "features":
      return `<section><div class="wrap">
        <h2 style="font-size:clamp(28px,4vw,40px)">${esc(p.title)}</h2>
        ${p.subtitle ? `<p class="muted" style="margin-top:10px">${esc(p.subtitle)}</p>` : ""}
        <div class="grid cols-4" style="margin-top:36px">
          ${(p.items || [])
            .map(
              (it: any) => `<div class="card">
            <h3 style="font-size:18px">${esc(it.title)}</h3>
            <p class="muted" style="margin-top:8px;font-size:14px">${esc(it.description)}</p>
          </div>`
            )
            .join("")}
        </div>
      </div></section>`;

    case "testimonials":
      return `<section style="background:#fafafa"><div class="wrap">
        <h2 style="font-size:clamp(28px,4vw,40px);text-align:center">${esc(p.title)}</h2>
        <div class="grid cols-3" style="margin-top:36px">
          ${(p.items || [])
            .map(
              (q: any) => `<figure class="card" style="margin:0">
            <blockquote style="margin:0;font-size:15px">${esc(q.quote)}</blockquote>
            <figcaption style="margin-top:16px;font-size:14px"><strong>${esc(q.name)}</strong><br /><span class="muted">${esc(q.role)}</span></figcaption>
          </figure>`
            )
            .join("")}
        </div>
      </div></section>`;

    case "faq":
      return `<section><div class="wrap" style="max-width:760px">
        <h2 style="font-size:clamp(28px,4vw,40px);text-align:center">${esc(p.title)}</h2>
        <div style="margin-top:28px">
          ${(p.items || [])
            .map(
              (f: any) => `<details style="border-bottom:1px solid #ececec;padding:18px 0">
            <summary style="font-weight:600;cursor:pointer">${esc(f.question)}</summary>
            <p class="muted" style="margin-top:10px;font-size:14px">${esc(f.answer)}</p>
          </details>`
            )
            .join("")}
        </div>
      </div></section>`;

    case "cta":
      return `<section><div class="wrap">
        <div style="background:var(--brand);color:#fff;border-radius:calc(var(--radius)*1.5);padding:64px 32px;text-align:center">
          <h2 style="font-size:clamp(28px,4vw,40px)">${esc(p.title)}</h2>
          <p style="opacity:.8;margin-top:12px">${esc(p.subtitle)}</p>
          <a class="btn btn-primary" href="${esc(p.ctaHref || "#contact")}" style="margin-top:24px">${esc(p.cta)}</a>
        </div>
      </div></section>`;

    case "contact":
      return renderContact(p);

    case "footer":
      return `<footer><div class="wrap">© ${new Date().getFullYear()} ${esc(p.brand)}. Built with ReFrame.</div></footer>`;

    default:
      return "";
  }
}

export function slugForFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "site"
  );
}
