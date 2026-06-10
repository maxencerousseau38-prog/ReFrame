import Link from "next/link";
import { Sparkles } from "lucide-react";

const columns = [
  { title: "Product", links: ["Features", "Pricing", "AI Editor", "Templates", "Changelog"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Customers", "Contact"] },
  { title: "Resources", links: ["Docs", "Guides", "API", "Status", "Community"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/8">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#6366f1,#d946ef)] text-white shadow-lg shadow-violet-600/30">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-white">
                SiteRevive<span className="text-neutral-500"> AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Turn any website into a modern, premium, AI-editable experience —
              in minutes.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm text-neutral-400 transition-colors hover:text-white">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} SiteRevive AI. All rights reserved.
          </p>
          <p className="text-sm text-neutral-500">Built for the modern web.</p>
        </div>
      </div>
    </footer>
  );
}
