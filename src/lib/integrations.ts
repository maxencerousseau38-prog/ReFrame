/**
 * Real reconnection of detected third-party tools. The customer supplies the ID
 * for a tool we found on their old site, and we re-inject the EXACT vendor
 * snippet into the published pages so analytics/chat/booking keep working.
 *
 * Security: every value is matched against a strict pattern before it is placed
 * into a snippet, so an attacker can't break out of the script string. Anything
 * that doesn't validate is dropped. Pure + dependency-free (client + server).
 */

export interface IntegrationTag {
  kind: "src" | "inline" | "css" | "noscript";
  content: string;
}

export interface ConnectedIntegration {
  id: string;
  value: string;
}

interface Connectable {
  id: string;
  label: string;
  placeholder: string;
  help: string;
  valid: (v: string) => boolean;
  tags: (v: string) => IntegrationTag[];
}

const CONNECTABLE: Connectable[] = [
  {
    id: "ga4",
    label: "Google Analytics 4",
    placeholder: "G-XXXXXXXXXX",
    help: "Your GA4 Measurement ID (Admin → Data Streams).",
    valid: (v) => /^G-[A-Z0-9]{4,15}$/i.test(v),
    tags: (v) => [
      { kind: "src", content: `https://www.googletagmanager.com/gtag/js?id=${v}` },
      { kind: "inline", content: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${v}');` },
    ],
  },
  {
    id: "gtm",
    label: "Google Tag Manager",
    placeholder: "GTM-XXXXXXX",
    help: "Your GTM container ID.",
    valid: (v) => /^GTM-[A-Z0-9]{4,12}$/i.test(v),
    tags: (v) => [
      { kind: "inline", content: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${v}');` },
      { kind: "noscript", content: `<iframe src="https://www.googletagmanager.com/ns.html?id=${v}" height="0" width="0" style="display:none;visibility:hidden"></iframe>` },
    ],
  },
  {
    id: "metapixel",
    label: "Meta Pixel",
    placeholder: "1234567890",
    help: "Your Meta (Facebook) Pixel ID (numbers only).",
    valid: (v) => /^\d{6,20}$/.test(v),
    tags: (v) => [
      { kind: "inline", content: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${v}');fbq('track','PageView');` },
      { kind: "noscript", content: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${v}&ev=PageView&noscript=1"/>` },
    ],
  },
  {
    id: "calendly",
    label: "Calendly",
    placeholder: "https://calendly.com/you/intro",
    help: "Your Calendly scheduling link. Adds a floating Book button.",
    valid: (v) => isCalendlyUrl(v),
    tags: (v) => [
      { kind: "css", content: "https://assets.calendly.com/assets/external/widget.css" },
      { kind: "src", content: "https://assets.calendly.com/assets/external/widget.js" },
      { kind: "inline", content: `window.addEventListener('load',function(){if(window.Calendly){Calendly.initBadgeWidget({url:${JSON.stringify(v)},text:'Book a time',color:'#0b0b0c',textColor:'#ffffff'});}});` },
    ],
  },
  {
    id: "crisp",
    label: "Crisp",
    placeholder: "00000000-0000-0000-0000-000000000000",
    help: "Your Crisp Website ID (Settings → Setup).",
    valid: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
    tags: (v) => [{ kind: "inline", content: `window.$crisp=[];window.CRISP_WEBSITE_ID='${v}';(function(){var d=document,s=d.createElement('script');s.src='https://client.crisp.chat/l.js';s.async=1;d.getElementsByTagName('head')[0].appendChild(s);})();` }],
  },
  {
    id: "intercom",
    label: "Intercom",
    placeholder: "abcd1234",
    help: "Your Intercom App ID.",
    valid: (v) => /^[a-z0-9]{6,12}$/i.test(v),
    tags: (v) => [{ kind: "inline", content: `window.intercomSettings={app_id:'${v}'};(function(){var w=window,d=document,i=function(){i.c(arguments)};i.q=[];i.c=function(a){i.q.push(a)};w.Intercom=i;var s=d.createElement('script');s.async=1;s.src='https://widget.intercom.io/widget/${v}';d.head.appendChild(s);})();` }],
  },
];

function isCalendlyUrl(v: string): boolean {
  if (/["'<>]/.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && (u.hostname === "calendly.com" || u.hostname.endsWith(".calendly.com"));
  } catch {
    return false;
  }
}

const BY_ID = new Map(CONNECTABLE.map((c) => [c.id, c]));

/** Is this detected integration one we can actually reconnect from an ID? */
export function isConnectable(id: string): boolean {
  return BY_ID.has(id);
}

export function connectableMeta(id: string): { label: string; placeholder: string; help: string } | null {
  const c = BY_ID.get(id);
  return c ? { label: c.label, placeholder: c.placeholder, help: c.help } : null;
}

/** Validate a single connection value for an integration id. */
export function isValidIntegrationValue(id: string, value: string): boolean {
  const c = BY_ID.get(id);
  return Boolean(c && value && c.valid(value.trim()));
}

/** Build the real, validated vendor tags to inject for the connected set.
 *  Invalid or unknown entries are silently dropped (never injected). */
export function buildIntegrationTags(connected: ConnectedIntegration[] | undefined): IntegrationTag[] {
  if (!connected?.length) return [];
  const out: IntegrationTag[] = [];
  const seen = new Set<string>();
  for (const { id, value } of connected) {
    const c = BY_ID.get(id);
    const v = (value || "").trim();
    if (!c || !v || !c.valid(v) || seen.has(id)) continue;
    seen.add(id);
    out.push(...c.tags(v));
  }
  return out;
}
