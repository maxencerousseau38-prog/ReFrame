import { cn } from "@/lib/utils";

/**
 * Valoryx brand lockup — a violet→blue "V" check mark + the VALORYX wordmark.
 * Matches the official brand artwork: freestanding gradient mark, thin
 * wide-tracked uppercase wordmark with a gradient terminal "X", and an
 * optional "INVEST INTELLIGENTLY" tagline.
 */
export function Logo({
  className,
  showWordmark = true,
  showTagline = false,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const mark = { sm: 22, md: 28, lg: 40 }[size];
  const word = { sm: "text-[13px]", md: "text-[15px]", lg: "text-[22px]" }[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ValoryxMark height={mark} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-light uppercase tracking-[0.28em] text-white",
              word,
            )}
          >
            VALOR
            <span className="bg-gradient-to-r from-accent-soft to-[#a78bff] bg-clip-text text-transparent">
              YX
            </span>
          </span>
          {showTagline && (
            <span className="mt-1.5 text-[8px] uppercase tracking-[0.42em] text-mist-400">
              Invest Intelligently
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ValoryxMark({ height = 28 }: { height?: number }) {
  return (
    <svg
      width={(height * 42) / 48}
      height={height}
      viewBox="0 0 42 48"
      fill="none"
      className="shrink-0"
      aria-label="Valoryx"
    >
      <defs>
        <linearGradient id="valoryx-mark" x1="4" y1="6" x2="30" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bff" />
          <stop offset="55%" stopColor="#7b86ff" />
          <stop offset="100%" stopColor="#4d8dff" />
        </linearGradient>
      </defs>
      <path
        d="M6 9 L19 42 L33 6"
        stroke="url(#valoryx-mark)"
        strokeWidth={7}
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />
    </svg>
  );
}
