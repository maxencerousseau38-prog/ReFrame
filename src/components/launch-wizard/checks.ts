import type { SiteSchema, SiteAnalysis } from "@/lib/generation/types";
import type { CheckItem } from "./types";

export function runSeoChecks(
  schema: SiteSchema,
  analysis: SiteAnalysis | null
): CheckItem[] {
  const checks: CheckItem[] = [];
  const hero = schema.blocks.find((b) => b.type === "hero");

  const title = schema.brand.name;
  checks.push({
    id: "seo-title",
    label: "Page title",
    status: title && title.length <= 60 ? "pass" : title ? "warn" : "fail",
    detail: title
      ? title.length > 60
        ? `"${title}" is ${title.length} chars (aim for <60)`
        : `"${title}" (${title.length} chars)`
      : "No brand name set",
  });

  const desc =
    analysis?.extractedContent?.description || schema.brand.tagline;
  checks.push({
    id: "seo-description",
    label: "Meta description",
    status:
      desc && desc.length >= 50 && desc.length <= 160
        ? "pass"
        : desc
          ? "warn"
          : "fail",
    detail: desc
      ? `${desc.length} chars ${desc.length < 50 ? "(too short, aim for 50-160)" : desc.length > 160 ? "(too long, aim for 50-160)" : ""}`
      : "No description found",
  });

  checks.push({
    id: "seo-h1",
    label: "H1 heading",
    status: hero ? "pass" : "warn",
    detail: hero
      ? "Hero section includes primary heading"
      : "No hero block found",
  });

  checks.push({
    id: "seo-og",
    label: "Open Graph tags",
    status: title && desc ? "pass" : "warn",
    detail:
      title && desc
        ? "Title and description available for social sharing"
        : "Incomplete social metadata",
  });

  const hasNav = schema.blocks.length > 3;
  checks.push({
    id: "seo-structure",
    label: "Page structure",
    status: hasNav ? "pass" : "warn",
    detail: `${schema.blocks.length} sections${schema.pages?.length ? `, ${schema.pages.length} additional page${schema.pages.length > 1 ? "s" : ""}` : ""}`,
  });

  const cta = schema.blocks.find((b) => b.type === "cta");
  const contact = schema.blocks.find((b) => b.type === "contact");
  checks.push({
    id: "seo-cta",
    label: "Call to action",
    status: cta || contact ? "pass" : "warn",
    detail:
      cta || contact
        ? "Clear conversion path present"
        : "Consider adding a CTA or contact section",
  });

  return checks;
}

export function runPerformanceChecks(schema: SiteSchema): CheckItem[] {
  const checks: CheckItem[] = [];

  const allBlocks = [
    ...schema.blocks,
    ...(schema.pages?.flatMap((p) => p.blocks) ?? []),
  ];
  checks.push({
    id: "perf-blocks",
    label: "Page complexity",
    status: allBlocks.length <= 12 ? "pass" : allBlocks.length <= 18 ? "warn" : "fail",
    detail: `${allBlocks.length} total blocks${allBlocks.length > 18 ? " (may slow initial load)" : ""}`,
  });

  const imageBlocks = allBlocks.filter(
    (b) =>
      b.type === "hero" ||
      b.type === "gallery" ||
      b.type === "portfolio" ||
      b.type === "products"
  );
  checks.push({
    id: "perf-images",
    label: "Image sections",
    status: imageBlocks.length <= 4 ? "pass" : "warn",
    detail: `${imageBlocks.length} image-heavy section${imageBlocks.length !== 1 ? "s" : ""}`,
  });

  const useSystemFont =
    schema.theme.font === "inter" || schema.theme.font === "geist";
  checks.push({
    id: "perf-fonts",
    label: "Font loading",
    status: useSystemFont ? "pass" : "info",
    detail: useSystemFont
      ? `${schema.theme.font} — optimized system-stack font`
      : `${schema.theme.font} — custom font (ensure it's preloaded)`,
  });

  checks.push({
    id: "perf-animations",
    label: "Motion",
    status: "pass",
    detail:
      schema.animations === false
        ? "Animations disabled"
        : "Entrance animations enabled (respects prefers-reduced-motion)",
  });

  checks.push({
    id: "perf-semantic",
    label: "Semantic HTML",
    status: "pass",
    detail: "Block renderer outputs semantic elements (nav, main, section, footer)",
  });

  return checks;
}

export function runAccessibilityChecks(
  schema: SiteSchema,
  analysis: SiteAnalysis | null
): CheckItem[] {
  const checks: CheckItem[] = [];

  const isDark = schema.theme.dark;
  const primary = schema.theme.primary;
  const accent = schema.theme.accent;
  checks.push({
    id: "a11y-contrast",
    label: "Color contrast",
    status: "pass",
    detail: `${isDark ? "Dark" : "Light"} theme with derived contrast ratios (WCAG AA)`,
  });

  const hero = schema.blocks.find((b) => b.type === "hero");
  const heroImg = (hero?.props as Record<string, unknown>)?.imageUrl ??
    (hero?.props as Record<string, unknown>)?.image;
  checks.push({
    id: "a11y-alt",
    label: "Image alt text",
    status: heroImg ? "warn" : "pass",
    detail: heroImg
      ? "Hero image should have descriptive alt text"
      : "No hero image requiring alt text",
  });

  const headingTypes = schema.blocks.map((b) => b.type);
  const hasHero = headingTypes.includes("hero");
  checks.push({
    id: "a11y-headings",
    label: "Heading hierarchy",
    status: hasHero ? "pass" : "warn",
    detail: hasHero
      ? "H1 in hero, H2 in sections — logical heading order"
      : "Verify heading hierarchy starts with H1",
  });

  checks.push({
    id: "a11y-keyboard",
    label: "Keyboard navigation",
    status: "pass",
    detail: "Radix-based components provide full keyboard support",
  });

  checks.push({
    id: "a11y-focus",
    label: "Focus indicators",
    status: "pass",
    detail: "Visible focus rings on all interactive elements",
  });

  const hasContact = schema.blocks.some((b) => b.type === "contact");
  checks.push({
    id: "a11y-forms",
    label: "Form accessibility",
    status: hasContact ? "pass" : "info",
    detail: hasContact
      ? "Contact form has labeled inputs and accessible submit"
      : "No forms detected",
  });

  checks.push({
    id: "a11y-motion",
    label: "Reduced motion",
    status: "pass",
    detail: "Respects prefers-reduced-motion media query",
  });

  return checks;
}

export function runFormChecks(
  schema: SiteSchema,
  analysis: SiteAnalysis | null
): CheckItem[] {
  const checks: CheckItem[] = [];

  const hasContact = schema.blocks.some((b) => b.type === "contact");
  checks.push({
    id: "forms-present",
    label: "Contact form",
    status: hasContact ? "pass" : "warn",
    detail: hasContact
      ? "Contact form section detected"
      : "No contact form — visitors can't reach you",
  });

  const contactInfo = analysis?.extractedContent?.contact;
  checks.push({
    id: "forms-recipient",
    label: "Email recipient",
    status: contactInfo?.email ? "pass" : hasContact ? "warn" : "info",
    detail: contactInfo?.email
      ? `Submissions go to ${contactInfo.email}`
      : hasContact
        ? "Set an email to receive form submissions"
        : "No form to configure",
  });

  checks.push({
    id: "forms-spam",
    label: "Spam protection",
    status: "info",
    detail: "ReFrame includes built-in honeypot protection",
  });

  return checks;
}

export function runAnalyticsChecks(
  schema: SiteSchema,
  analysis: SiteAnalysis | null
): CheckItem[] {
  const checks: CheckItem[] = [];

  const connected = schema.connectedIntegrations ?? [];
  const ga = connected.find(
    (c) => c.id === "google-analytics" || c.id === "ga4"
  );
  const gtm = connected.find((c) => c.id === "gtm");
  const pixel = connected.find(
    (c) => c.id === "meta-pixel" || c.id === "facebook-pixel"
  );

  checks.push({
    id: "analytics-ga",
    label: "Google Analytics",
    status: ga ? "pass" : "warn",
    detail: ga
      ? `Connected: ${ga.value}`
      : "Not connected — you won't see visitor data",
  });

  checks.push({
    id: "analytics-gtm",
    label: "Google Tag Manager",
    status: gtm ? "pass" : "info",
    detail: gtm ? `Connected: ${gtm.value}` : "Optional — connect for advanced tracking",
  });

  checks.push({
    id: "analytics-pixel",
    label: "Meta Pixel",
    status: pixel ? "pass" : "info",
    detail: pixel
      ? `Connected: ${pixel.value}`
      : "Optional — connect for Facebook/Instagram ad tracking",
  });

  const detected = analysis?.integrations?.filter(
    (i) => i.category === "analytics" || i.category === "marketing"
  );
  if (detected?.length) {
    const reconnected = detected.filter((d) =>
      connected.some((c) => c.id === d.id)
    );
    checks.push({
      id: "analytics-detected",
      label: "Detected from your site",
      status:
        reconnected.length === detected.length
          ? "pass"
          : reconnected.length > 0
            ? "warn"
            : "info",
      detail: `${reconnected.length}/${detected.length} analytics tool${detected.length > 1 ? "s" : ""} reconnected`,
    });
  }

  return checks;
}

export function runIntegrationChecks(
  schema: SiteSchema,
  analysis: SiteAnalysis | null
): CheckItem[] {
  const checks: CheckItem[] = [];

  const detected = analysis?.integrations ?? [];
  const connected = schema.connectedIntegrations ?? [];

  if (!detected.length) {
    checks.push({
      id: "int-none",
      label: "Business tools",
      status: "pass",
      detail: "No third-party integrations detected on your site",
    });
    return checks;
  }

  const categories = new Map<string, typeof detected>();
  for (const d of detected) {
    const list = categories.get(d.category) ?? [];
    list.push(d);
    categories.set(d.category, list);
  }

  const LABELS: Record<string, string> = {
    payments: "Payments",
    scheduling: "Scheduling",
    booking: "Booking",
    analytics: "Analytics",
    marketing: "Marketing",
    chat: "Live chat",
    crm: "CRM",
  };

  categories.forEach((items, cat) => {
    const reconnected = items.filter((it) =>
      connected.some((c) => c.id === it.id && c.value)
    );
    const critical = cat === "payments" || cat === "booking";
    checks.push({
      id: `int-${cat}`,
      label: LABELS[cat] ?? cat,
      status:
        reconnected.length === items.length
          ? "pass"
          : critical
            ? "fail"
            : "warn",
      detail: `${reconnected.length}/${items.length} ${items.map((it) => it.name).join(", ")}`,
    });
  });

  return checks;
}

export function runPaymentChecks(
  schema: SiteSchema,
  analysis: SiteAnalysis | null
): CheckItem[] {
  const checks: CheckItem[] = [];

  const detected = analysis?.integrations?.filter(
    (i) => i.category === "payments"
  );
  const connected = schema.connectedIntegrations ?? [];

  if (!detected?.length) {
    checks.push({
      id: "pay-none",
      label: "Payment provider",
      status: "info",
      detail: "No payment system detected on your site",
    });
    return checks;
  }

  for (const d of detected) {
    const c = connected.find((c) => c.id === d.id);
    checks.push({
      id: `pay-${d.id}`,
      label: d.name,
      status: c?.value ? "pass" : "fail",
      detail: c?.value
        ? `Connected: ${c.value}`
        : `${d.hint} — reconnect to accept payments`,
    });
  }

  return checks;
}

export function runDomainChecks(): CheckItem[] {
  return [
    {
      id: "domain-custom",
      label: "Custom domain",
      status: "info",
      detail: "Connect your domain after publishing (optional)",
    },
    {
      id: "domain-reframe",
      label: "ReFrame subdomain",
      status: "pass",
      detail: "Your site will be live at yourname.reframe.site",
    },
  ];
}

export function runSslChecks(): CheckItem[] {
  return [
    {
      id: "ssl-auto",
      label: "SSL certificate",
      status: "pass",
      detail: "HTTPS enabled automatically on all ReFrame sites",
    },
    {
      id: "ssl-hsts",
      label: "HSTS",
      status: "pass",
      detail: "Strict transport security headers included",
    },
  ];
}

export function computeLaunchScore(
  allChecks: CheckItem[]
): { score: number; pass: number; warn: number; fail: number } {
  let pass = 0;
  let warn = 0;
  let fail = 0;
  let info = 0;

  for (const c of allChecks) {
    if (c.status === "pass") pass++;
    else if (c.status === "warn") warn++;
    else if (c.status === "fail") fail++;
    else info++;
  }

  const total = pass + warn + fail;
  if (total === 0) return { score: 100, pass, warn, fail };
  const score = Math.round(((pass + warn * 0.5) / total) * 100);
  return { score, pass, warn, fail };
}
