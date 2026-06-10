// Social-proof logo wall. Real brand SVGs via Simple Icons CDN, logo-only
// (no category labels), sitting directly under the hero (not inside it).
const logos = [
  { name: "Vercel", slug: "vercel" },
  { name: "Linear", slug: "linear" },
  { name: "Framer", slug: "framer" },
  { name: "Stripe", slug: "stripe" },
  { name: "Notion", slug: "notion" },
  { name: "Shopify", slug: "shopify" },
];

export function Logos() {
  return (
    <section className="border-y border-white/8 py-10">
      <div className="mx-auto max-w-[1400px] px-6">
        <p className="text-center text-sm text-zinc-500">
          Agencies and founders rebuild their sites with SiteRevive
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={logo.slug}
              src={`https://cdn.simpleicons.org/${logo.slug}/a1a1aa`}
              alt={logo.name}
              width={92}
              height={28}
              className="h-6 w-auto opacity-60 grayscale transition-opacity duration-200 hover:opacity-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
