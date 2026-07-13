import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * GlassPillNav — a segmented, frosted-glass navigation pill.
 *
 * Extracted and re-interpreted from a 3D-beams hero (21st.dev): the ONE piece
 * of that component that fits ReFrame's language. Rebuilt monochrome on the
 * frozen tokens (glass rgba(255,255,255,.05), hairline .08, hover .10) — no
 * gradients, no glow, Phosphor-friendly. Real <a> elements, keyboard-focusable,
 * `aria-current` on the active link.
 *
 * Universal: landing top-nav, dashboard section switcher, editor mode toggle,
 * pricing period switch, any small set of peer destinations/segments.
 */
export interface GlassPillNavItem {
  label: React.ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  /** Optional leading icon (Phosphor). */
  icon?: React.ReactNode;
}

export interface GlassPillNavProps extends React.HTMLAttributes<HTMLElement> {
  items: GlassPillNavItem[];
  "aria-label"?: string;
}

function GlassPillNav({ items, className, "aria-label": ariaLabel = "Navigation", ...props }: GlassPillNavProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-white/8 bg-white/[0.05] p-1 backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {items.map((item, i) => {
        const cls = cn(
          "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-fast ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          item.active
            ? "bg-white/10 text-foreground"
            : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
        );
        const content = (
          <>
            {item.icon}
            {item.label}
          </>
        );
        return item.href ? (
          <a key={i} href={item.href} aria-current={item.active ? "page" : undefined} className={cls}>
            {content}
          </a>
        ) : (
          <button key={i} type="button" onClick={item.onClick} aria-current={item.active ? "page" : undefined} className={cls}>
            {content}
          </button>
        );
      })}
    </nav>
  );
}

export { GlassPillNav };
