import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-accent-soft to-accent-deep shadow-glow">
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px] text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 18 L9 9 L13 13 L20 4" />
          <path d="M16 4 H20 V8" />
        </svg>
      </div>
      {showWordmark && (
        <span className="text-[17px] font-semibold tracking-tight text-white">
          Valoryx
        </span>
      )}
    </div>
  );
}
