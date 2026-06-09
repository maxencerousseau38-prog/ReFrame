import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}

/** En-tête de section homogène : sur-titre, titre, description. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-pretty text-lg text-muted-foreground">{description}</p>
      )}
    </Reveal>
  );
}
