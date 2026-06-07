import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** €M with smart compaction: 46 → €46M, 3900 → €3.9Md */
export function eur(m: number): string {
  if (Math.abs(m) >= 1000) {
    return `€${(m / 1000).toFixed(1).replace(/\.0$/, "")}Md`;
  }
  return `€${m.toFixed(m % 1 === 0 ? 0 : 1)}M`;
}

export function pct(n: number, withSign = false): string {
  const sign = withSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(n % 1 === 0 ? 0 : 1)}%`;
}

export function signed(n: number): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}`;
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}
