"use client";

/**
 * "Trap to subscribe" — a small premium-capability teaser that smooth-scrolls
 * the visitor to the pricing section. Native smooth scroll (set in globals.css)
 * keeps it performant and reduced-motion friendly; the fixed navbar is handled
 * by scroll-mt-* on the target sections.
 */

const ICONS = {
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  chat: "M5 5h14v10H9l-4 4V5Z",
  target: "M12 12m-8 0a8 8 0 1 0 16 0 8 8 0 1 0-16 0M12 12m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0M12 12h.01",
  bolt: "M13 3 4 14h7l-1 7 9-11h-7l1-7Z",
} as const;

type Plan = "Pro" | "Business";

export default function UpsellButton({
  label,
  plan,
  icon = "bolt",
}: {
  label: string;
  plan: Plan;
  icon?: keyof typeof ICONS;
}) {
  return (
    <a
      href="#pricing"
      className="group inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-card"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink"
      >
        <path d={ICONS[icon]} />
      </svg>
      {label}
      <span className="rounded-full bg-beige-light px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
        {plan}
      </span>
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="-ml-0.5 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink"
      >
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </a>
  );
}
