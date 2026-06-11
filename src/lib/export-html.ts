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

export function schemaToHtml(schema: SiteSchema): string {
  const t = schema.theme;
  const body = schema.blocks.map((b) => renderBlock(b)).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(schema.brand.name)}</title>
<meta name="description" content="${esc(schema.brand.tagline)}" />
<style>
  :root{
    --brand:${t.primary};
    --accent:${t.accent};
    --radius:${radius[t.radius]};
  }
  *{box-sizing:border-box}
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
${body}
<!-- Built with ReFrame -->
</body>
</html>`;
}

function renderBlock(b: Block): string {
  const p = b.props as Record<string, any>;
  switch (b.type) {
    case "hero":
      return `<section><div class="wrap">
        ${p.eyebrow ? `<p style="color:var(--accent);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.1em">${esc(p.eyebrow)}</p>` : ""}
        <h1 style="font-size:clamp(34px,6vw,64px);margin-top:12px;max-width:14ch">${esc(p.title)}</h1>
        <p class="muted" style="font-size:18px;margin-top:16px;max-width:50ch">${esc(p.subtitle)}</p>
        <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap">
          ${p.primaryCta ? `<a class="btn btn-primary" href="#contact">${esc(p.primaryCta)}</a>` : ""}
          ${p.secondaryCta ? `<a class="btn btn-ghost" href="#">${esc(p.secondaryCta)}</a>` : ""}
        </div>
      </div></section>`;

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
          <a class="btn btn-primary" href="#contact" style="margin-top:24px">${esc(p.cta)}</a>
        </div>
      </div></section>`;

    case "contact":
      return `<section id="contact"><div class="wrap" style="max-width:680px">
        <h2 style="font-size:clamp(28px,4vw,40px)">${esc(p.title)}</h2>
        <p class="muted" style="margin-top:10px">${esc(p.subtitle)}</p>
        <form style="margin-top:24px" onsubmit="event.preventDefault();alert('Thanks, we will be in touch.')">
          <input placeholder="Name" required />
          <input type="email" placeholder="Email" required />
          <textarea placeholder="How can we help?" rows="4"></textarea>
          <button class="btn btn-primary" type="submit" style="margin-top:14px;border:none;cursor:pointer">Send message</button>
        </form>
      </div></section>`;

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
