import Link from "next/link";

const links = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Examples", href: "/#examples" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Contact", href: "mailto:hello@reframe.design" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 px-6">
      <div className="mx-auto max-w-[1400px] py-20">
        {/* monumental wordmark as the closing note */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-semibold tracking-[-0.04em] text-white [font-size:clamp(3rem,9vw,7rem)] [line-height:0.85]">
              ReFrame
            </span>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-zinc-500">
              Paste a link. Get a site worth visiting. Edited by chatting, live
              in minutes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {links.map((l) => (
              <Link key={l.label} href={l.href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-white/8 pt-8 text-sm text-zinc-600">
          © {new Date().getFullYear()} ReFrame
        </div>
      </div>
    </footer>
  );
}

