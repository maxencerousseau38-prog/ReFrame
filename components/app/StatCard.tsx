import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "good" | "bad" | "accent";
  icon?: any;
}) {
  const toneText = {
    neutral: "text-mist-400",
    good: "text-bull",
    bad: "text-bear",
    accent: "text-accent-soft",
  }[tone];

  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-mist-500" />}
      </div>
      <p className="num mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
      {sub && <p className={cn("num mt-0.5 text-2xs", toneText)}>{sub}</p>}
    </div>
  );
}
