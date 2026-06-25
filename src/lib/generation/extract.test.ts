import { describe, it, expect } from "vitest";
import { parse } from "node-html-parser";
import { extractContact, extractStats, extractTestimonials, extractFaq, extractSocialLinks, extractFonts, extractCollection, extractTeam, detectSourceDark, cleanServiceLabels, extractProse, extractImages, extractProducts, navPageLinks, detectIntegrations, routePath } from "./engine";

describe("routePath (SEO continuity)", () => {
  it("preserves the real nested path, only sanitizing segments", () => {
    expect(routePath("/collections/mens-bestsellers")).toBe("collections/mens-bestsellers");
    expect(routePath("/gb/12609-snack-cuisson/")).toBe("gb/12609-snack-cuisson");
    expect(routePath("/Our Services")).toBe("our-services");
    expect(routePath("/")).toBe("page");
  });
});

describe("extractTestimonials (real proof, never fabricated)", () => {
  it("pulls a blockquote + cite attribution from the DOM", () => {
    const root = parse(`<section>
      <blockquote><p>They rebuilt our site in days and it finally looks like the business we actually run.</p><cite>Élise Caron, Owner</cite></blockquote>
    </section>`);
    const t = extractTestimonials(root, {});
    expect(t?.length).toBe(1);
    expect(t![0].quote).toMatch(/rebuilt our site in days/);
    expect(t![0].name).toBe("Élise Caron");
    expect(t![0].role).toBe("Owner");
  });

  it("reads .testimonial / .review containers with .author", () => {
    const root = parse(`<div>
      <div class="testimonial"><p>Every detail was considered and enquiries went up the first month.</p><span class="author">Priya Nair — Director</span></div>
      <div class="review"><p>The most senior, least precious team we have ever worked with.</p><cite>Marcus Reede</cite></div>
    </div>`);
    const t = extractTestimonials(root, {});
    expect(t?.length).toBe(2);
    expect(t!.map((x) => x.name)).toContain("Priya Nair");
    expect(t!.find((x) => x.name === "Priya Nair")?.role).toBe("Director");
  });

  it("prefers JSON-LD reviews and dedupes against the DOM", () => {
    const root = parse(`<blockquote><p>Outstanding craftsmanship from start to finish, truly exceptional.</p></blockquote>`);
    const t = extractTestimonials(root, {
      reviews: [{ quote: "Outstanding craftsmanship from start to finish, truly exceptional.", name: "Sophie Bennett" }],
    });
    expect(t?.length).toBe(1); // not double-counted
    expect(t![0].name).toBe("Sophie Bennett");
  });

  it("returns undefined when there is nothing credible (no fabrication)", () => {
    const root = parse(`<section><p>Welcome to our site.</p><blockquote>Sale</blockquote></section>`);
    expect(extractTestimonials(root, {})).toBeUndefined();
  });
});

describe("extractFaq (real Q&A, replaces the generic default)", () => {
  it("reads native <details>/<summary> accordions", () => {
    const root = parse(`<section>
      <details><summary>Do you ship internationally?</summary><p>Yes, we ship worldwide with tracked delivery on every order.</p></details>
      <details><summary>What is your return policy?</summary><p>Returns are free within 30 days, no questions asked.</p></details>
    </section>`);
    const faq = extractFaq(root, {});
    expect(faq?.length).toBe(2);
    expect(faq![0].question).toBe("Do you ship internationally?");
    expect(faq![0].answer).toMatch(/ship worldwide/);
  });

  it("reads dl/dt/dd and headings phrased as questions", () => {
    const root = parse(`<div>
      <dl><dt>How long does setup take?</dt><dd>Most teams are live within a single afternoon.</dd></dl>
      <h3>Can I cancel anytime?</h3><p>Absolutely — there are no lock-in contracts and you can leave whenever.</p>
    </div>`);
    const faq = extractFaq(root, {});
    expect(faq?.length).toBe(2);
    expect(faq!.map((f) => f.question)).toContain("Can I cancel anytime?");
  });

  it("prefers JSON-LD FAQPage and dedupes", () => {
    const root = parse(`<details><summary>Is support included?</summary><p>Yes, priority support is included on every plan.</p></details>`);
    const faq = extractFaq(root, { faq: [{ question: "Is support included?", answer: "Yes, priority support is included on every plan." }] });
    expect(faq?.length).toBe(1);
  });

  it("returns undefined with fewer than two real pairs", () => {
    const root = parse(`<section><h2>Our work</h2><p>We build things.</p></section>`);
    expect(extractFaq(root, {})).toBeUndefined();
  });
});

describe("extractSocialLinks (footer profiles, never fabricated)", () => {
  it("collects known platforms, dedupes, and skips share buttons", () => {
    const root = parse(`<footer>
      <a href="https://www.instagram.com/northlight">IG</a>
      <a href="https://www.linkedin.com/company/northlight">LinkedIn</a>
      <a href="https://twitter.com/intent/tweet?url=x">Share</a>
      <a href="https://x.com/northlight">X</a>
      <a href="/contact">Contact</a>
    </footer>`);
    const s = extractSocialLinks(root);
    const platforms = s?.map((x) => x.platform);
    expect(platforms).toContain("Instagram");
    expect(platforms).toContain("LinkedIn");
    expect(platforms).toContain("X"); // from x.com, not the share intent
    expect(s!.find((x) => x.platform === "X")?.url).toBe("https://x.com/northlight");
  });
  it("returns undefined when there are no social links", () => {
    expect(extractSocialLinks(parse(`<footer><a href="/about">About</a></footer>`))).toBeUndefined();
  });
});

describe("extractFonts (preserve a serif-led source)", () => {
  const f = (html: string) => extractFonts(parse(html), html);
  it("detects a serif brand from a Google Fonts link", () => {
    expect(f(`<head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&display=swap" rel="stylesheet"></head>`)).toBe("serif");
  });
  it("detects a serif first family in a font-family declaration", () => {
    expect(f(`<style>body{font-family:"Cormorant Garamond",Georgia,serif}</style>`)).toBe("serif");
  });
  it("does NOT flag a sans stack that merely lists serif as a fallback", () => {
    expect(f(`<style>body{font-family:Inter,Georgia,serif}</style>`)).toBeUndefined();
    expect(f(`<head><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400" rel="stylesheet"></head>`)).toBeUndefined();
  });
});

describe("extractCollection (menu / price list, never fabricated)", () => {
  it("reads a price-bearing menu table", () => {
    const root = parse(`<table>
      <tr><th>Dish</th><th>Price</th></tr>
      <tr><td>Burrata</td><td>€14</td></tr>
      <tr><td>Tagliatelle al ragù</td><td>€18</td></tr>
      <tr><td>Tiramisù</td><td>€9</td></tr>
    </table>`);
    const c = extractCollection(root);
    expect(c?.items.length).toBe(3);
    expect(c!.items[0]).toMatchObject({ name: "Burrata", price: "€14" });
  });

  it("reads repeated price-bearing blocks with names + descriptions", () => {
    const root = parse(`<ul>
      <li class="menu-item"><h3>Margherita</h3><p>San Marzano, fior di latte, basil</p><span>$12</span></li>
      <li class="menu-item"><h3>Diavola</h3><p>Spicy salami, chili</p><span>$15</span></li>
      <li class="menu-item"><h3>Quattro Formaggi</h3><p>Four cheeses</p><span>$16</span></li>
    </ul>`);
    const c = extractCollection(root);
    expect(c?.items.length).toBe(3);
    expect(c!.items[1]).toMatchObject({ name: "Diavola", price: "$15" });
    expect(c!.items[0].description).toMatch(/San Marzano/);
  });

  it("returns undefined with fewer than three priced items", () => {
    const root = parse(`<ul><li>About us</li><li>One item $5</li></ul>`);
    expect(extractCollection(root)).toBeUndefined();
  });
});

describe("extractTeam (real people, photo-gated, never fabricated)", () => {
  const base = "https://northlight.studio";
  it("reads member cards with name, role, photo and bio", () => {
    const root = parse(`<section><h2>Our team</h2>
      <ul>
        <li class="member"><img src="/team/elise.jpg"><h3>Élise Caron</h3><p class="role">Founder</p><p>Twenty years shaping interiors across Europe and a relentless eye for light.</p></li>
        <li class="member"><img src="/team/marcus.jpg"><h3>Marcus Reede</h3><p class="role">Creative Director</p><p>Leads every project from first sketch to final reveal.</p></li>
      </ul>
    </section>`);
    const team = extractTeam(root, base);
    expect(team?.length).toBe(2);
    expect(team![0]).toMatchObject({ name: "Élise Caron", role: "Founder", image: "https://northlight.studio/team/elise.jpg" });
    expect(team![0].bio).toMatch(/shaping interiors/);
  });

  it("ignores a name without a photo (anti-false-positive) and needs two members", () => {
    const root = parse(`<section><h2>Our team</h2>
      <div><h3>John Smith</h3><p>No photo here.</p></div>
      <div class="member"><img src="/p.jpg"><h3>Jane Doe</h3></div>
    </section>`);
    expect(extractTeam(root, base)).toBeUndefined(); // only one photographed member
  });

  it("returns undefined when there is no team section", () => {
    expect(extractTeam(parse(`<section><h2>Services</h2><img src="/x.jpg"><h3>Web Design</h3></section>`), base)).toBeUndefined();
  });
});

describe("detectSourceDark (option 3: dark source -> dark rebuild)", () => {
  const dark = (html: string) => detectSourceDark(html, parse(html));
  it("detects a declared dark color-scheme (meta, dark-first)", () => {
    expect(dark(`<html><head><meta name="color-scheme" content="dark light"></head><body></body></html>`)).toBe(true);
  });
  it("detects color-scheme:dark in CSS", () => {
    expect(dark(`<html><head><style>:root{color-scheme:dark}</style></head><body></body></html>`)).toBe(true);
  });
  it("detects a dark background painted on body", () => {
    expect(dark(`<html><body style="background:#0b0b0d">hi</body></html>`)).toBe(true);
  });
  it("stays false for a light site (no false positives)", () => {
    expect(dark(`<html><head><meta name="color-scheme" content="light dark"></head><body style="background:#ffffff"></body></html>`)).toBe(false);
    expect(dark(`<html><body style="background:#fafafa"></body></html>`)).toBe(false);
    expect(dark(`<html><body></body></html>`)).toBe(false);
  });
});

describe("detectIntegrations", () => {
  it("detects payments, scheduling, analytics, chat from real embed signatures", () => {
    const html = `<html><head>
      <script src="https://js.stripe.com/v3/"></script>
      <script src="https://assets.calendly.com/assets/external/widget.js"></script>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>
      <script>window.intercomSettings={app_id:'abc'};</script>
      <script src="https://client.crisp.chat/l.js"></script>
    </head><body></body></html>`;
    const ids = detectIntegrations(html).map((i) => i.id).sort();
    expect(ids).toContain("stripe");
    expect(ids).toContain("calendly");
    expect(ids).toContain("ga4"); // gtag/js is GA4
    expect(ids).toContain("intercom");
    expect(ids).toContain("crisp");
    expect(detectIntegrations(html).find((i) => i.id === "stripe")?.category).toBe("payments");
  });

  it("returns nothing for a plain page (no false positives)", () => {
    expect(detectIntegrations("<html><body><h1>Hello</h1><p>About us</p></body></html>")).toEqual([]);
  });
});

describe("navPageLinks (multi-page discovery)", () => {
  it("keeps real internal pages, drops home/anchors/assets/external/system", () => {
    const html = `<header>
      <a href="/">Home</a>
      <a href="/services">Services</a>
      <a href="/about-us">About us</a>
      <a href="#section">Jump</a>
      <a href="/brochure.pdf">PDF</a>
      <a href="/cart">Cart</a>
      <a href="https://other.com/x">External</a>
      <a href="mailto:a@b.com">Mail</a>
      <a href="/contact" title="Contact">Reach us</a>
    </header>`;
    const links = navPageLinks(parse(html, { blockTextElements: { script: true, style: true } }), "https://acme.com");
    expect(links.map((l) => l.path)).toEqual(["/services", "/about-us", "/contact"]);
    expect(links.find((l) => l.path === "/contact")?.label).toBe("Contact"); // title wins
  });
});

describe("extractProducts", () => {
  it("reads JSON-LD Product entries with price + image", () => {
    const ld = JSON.stringify([
      { "@type": "Product", name: "Pro Mixer 500", image: "https://x/m.jpg", url: "https://x/p/1", offers: { price: "129.00", priceCurrency: "EUR" } },
      { "@type": "Product", name: "Cold Display", image: ["https://x/c.jpg"], offers: [{ price: "899", priceCurrency: "USD" }] },
    ]);
    const r = parse(`<html><head><script type="application/ld+json">${ld}</script></head><body></body></html>`,
      { blockTextElements: { script: true, style: true } });
    const products = extractProducts(r, "https://x.com");
    expect(products.map((p) => p.name)).toEqual(["Pro Mixer 500", "Cold Display"]);
    expect(products[0].price).toBe("129.00 €");
    expect(products[1].price).toBe("$899");
    expect(products[0].image).toBe("https://x/m.jpg");
  });

  it("falls back to DOM product cards (link + image + price)", () => {
    const card = (n: string, p: string) =>
      `<li class="product"><a href="/p/${n}" title="${n}"><img src="/img/${n}.jpg" alt="${n}"></a><span class="price">${p}</span></li>`;
    const r = parse(`<ul>${card("Whisk", "12,90 €")}${card("Pan", "24,00 €")}${card("Oven", "499 €")}</ul>`,
      { blockTextElements: { script: true, style: true } });
    const products = extractProducts(r, "https://x.com");
    expect(products.length).toBeGreaterThanOrEqual(3);
    expect(products[0].price).toMatch(/12,90/);
    expect(products[0].url).toBe("https://x.com/p/Whisk");
  });

  it("catalogue mode: priceless image tiles in the body, names from slug", () => {
    const tile = (id: number, slug: string) =>
      `<div class="cat"><a href="/gb/${id}-${slug}"><img src="/media/${slug}.jpg"></a></div>`;
    const html = `<main>${tile(1, "snack-cooking")}${tile(2, "preparation")}${tile(3, "buffet")}${tile(4, "cold")}${tile(5, "dishwasher")}</main>`;
    const r = parse(html, { blockTextElements: { script: true, style: true } });
    const products = extractProducts(r, "https://www.casselin.com");
    expect(products.length).toBeGreaterThanOrEqual(4);
    expect(products.map((p) => p.name)).toContain("Snack cooking"); // slug, id stripped
    expect(products.every((p) => !p.price)).toBe(true);
  });

  it("catalogue mode ignores nav/header tiles and lone links", () => {
    const tile = (slug: string) => `<a href="/gb/${slug}"><img src="/m/${slug}.jpg"></a>`;
    const inNav = `<nav>${tile("home")}${tile("about")}${tile("contact")}${tile("services")}</nav>`;
    const r = parse(inNav, { blockTextElements: { script: true, style: true } });
    expect(extractProducts(r, "https://x.com").length).toBe(0);
  });
});

describe("extractImages junk filter", () => {
  it("drops decorative/campaign assets (stars, squiggles), keeps real photos", () => {
    const root = parse(
      `<main>
        <img src="/v/home/a/stars/star01__x_large.png" width="400" height="400">
        <img src="/v/home/a/squiggle03__y_large.png" width="400" height="400">
        <img src="/media/our-bakery-interior.jpg" width="1200" height="800">
        <img src="/media/sourdough-loaf.jpg" width="1200" height="800">
      </main>`,
      { blockTextElements: { script: false, style: true } }
    );
    const imgs = extractImages(root, "https://example.com");
    expect(imgs.some((u) => /star01|squiggle/.test(u))).toBe(false);
    expect(imgs.some((u) => /our-bakery-interior/.test(u))).toBe(true);
    expect(imgs.some((u) => /sourdough-loaf/.test(u))).toBe(true);
  });
});

const root = (html: string) => parse(html, { blockTextElements: { script: false, style: true } });

describe("cleanServiceLabels", () => {
  it("strips nav/CTA/location noise (real Tartine nav)", () => {
    const out = cleanServiceLabels(["LOCATIONS", "VIEW ALL", "Bay Area", "The Bakery", "Tartine Manufactory", "Inner Sunset SF"]);
    expect(out).not.toContain("LOCATIONS");
    expect(out).not.toContain("VIEW ALL");
    expect(out).not.toContain("Bay Area");
    expect(out).not.toContain("Inner Sunset SF");
    expect(out).not.toContain("Tartine Manufactory"); // "manufactory" => location-ish
    expect(out).toContain("The Bakery");
  });

  it("keeps real offering names and dedupes", () => {
    const out = cleanServiceLabels(["Catering", "Wedding Cakes", "Catering", "Contact", "Shop Now", "Pastry Classes"]);
    expect(out).toEqual(["Catering", "Wedding Cakes", "Pastry Classes"]);
  });

  it("drops utility labels and pure symbols", () => {
    expect(cleanServiceLabels(["Home", "Cart", "FAQ", "→", "123"]).length).toBe(0);
  });

  it("drops generic section labels but keeps real offerings", () => {
    const out = cleanServiceLabels(["Work", "Clients", "Services", "Industries", "Brand Identity", "Web Design"]);
    expect(out).toEqual(["Brand Identity", "Web Design"]);
  });
});

describe("extractProse services", () => {
  const html = (inner: string) => parse(`<main>${inner}</main>`, { blockTextElements: { script: false, style: true } });
  const card = (t: string) => `<h3>${t}</h3><p>A real, sufficiently long description of this offering for clients.</p>`;

  it("keeps real service headings, drops section/FAQ/sentence headings", () => {
    const root = html(
      card("Brand Strategy") +
        card("Web Design") +
        card("Frequently asked questions") + // section label -> noise
        card("We craft brands people remember.") + // sentence -> dropped
        card("Content Production")
    );
    const titles = extractProse(root).serviceItems?.map((s) => s.title);
    expect(titles).toEqual(["Brand Strategy", "Web Design", "Content Production"]);
  });
});

describe("extractContact", () => {
  it("prefers tel:/mailto: links and reads an <address>", () => {
    const r = root(
      `<a href="tel:+33123456789">Call</a><a href="mailto:hi@acme.com?subject=x">Email</a><address>12 Rue X, 75003 Paris</address>`
    );
    const c = extractContact(r, "", {});
    expect(c?.phone).toBe("+33123456789");
    expect(c?.email).toBe("hi@acme.com");
    expect(c?.address).toContain("Paris");
  });

  it("falls back to structured data, then text patterns", () => {
    const c = extractContact(root("<div>Reach us</div>"), "Call 01 23 45 67 89 or email team@shop.fr today", {});
    expect(c?.phone?.replace(/\s/g, "")).toContain("0123456789");
    expect(c?.email).toBe("team@shop.fr");
  });

  it("uses JSON-LD details when present", () => {
    const c = extractContact(root("<div></div>"), "", { telephone: "+1 555 0100", email: "x@y.com", address: "1 Main St, NY" });
    expect(c).toEqual({ phone: "+1 555 0100", email: "x@y.com", address: "1 Main St, NY" });
  });

  it("returns undefined when there is nothing real", () => {
    expect(extractContact(root("<p>hello world</p>"), "hello world", {})).toBeUndefined();
  });
});

describe("extractStats (real ratings only)", () => {
  it("builds stats from aggregateRating", () => {
    expect(extractStats({ ratingValue: "4.8", reviewCount: "230" })).toEqual([
      { value: "4.8★", label: "Average rating" },
      { value: "230+", label: "Reviews" },
    ]);
  });
  it("ignores invalid ratings and returns undefined when none", () => {
    expect(extractStats({ ratingValue: "9" })).toBeUndefined(); // >5 rejected
    expect(extractStats({})).toBeUndefined();
  });
});
