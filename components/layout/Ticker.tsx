import { COMPANIES } from "@/lib/data";
import { pct } from "@/lib/utils";

// Bloomberg-style scrolling market ticker built from the analysed universe.
export function Ticker() {
  const items = COMPANIES.map((c) => ({
    name: c.name,
    score: c.score,
    trend: c.trend,
  }));
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-b border-white/[0.06] bg-ink-900/40">
      <div className="flex w-max animate-ticker gap-8 py-2">
        {doubled.map((it, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap text-2xs">
            <span className="font-medium text-mist-200">{it.name}</span>
            <span className="num text-mist-400">{it.score}</span>
            <span className={`num ${it.trend >= 0 ? "text-bull" : "text-bear"}`}>
              {pct(it.trend, true)}
            </span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-950 to-transparent" />
    </div>
  );
}
