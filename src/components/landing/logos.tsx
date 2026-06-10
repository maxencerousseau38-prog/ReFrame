// Partner logo marquee (the page's single marquee). Real brand SVGs via Simple
// Icons, logo-only, no category labels.
const logos = [
  "vercel", "linear", "framer", "stripe", "notion", "shopify", "figma", "loom",
];

export function Logos() {
  const row = [...logos, ...logos];
  return (
    <section className="overflow-hidden py-16">
      <p className="mb-8 text-center text-sm text-zinc-500">
        Agencies and founders reframe their sites with us
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max items-center gap-16 animate-marquee">
          {row.map((slug, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${slug}-${i}`}
              src={`https://cdn.simpleicons.org/${slug}/9a9a9a`}
              alt={slug}
              width={96}
              height={28}
              className="h-6 w-auto opacity-50 grayscale transition-opacity duration-200 hover:opacity-90"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
