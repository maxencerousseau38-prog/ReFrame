import Link from "next/link";

const columns = [
  { title: "Product", links: ["Features", "Pricing", "AI editor", "Templates", "Changelog"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Customers", "Contact"] },
  { title: "Resources", links: ["Docs", "Guides", "API", "Status", "Community"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
];

export function Footer() {
  return (
    <footer className="border-t border-white/8 px-6">
      <div className="mx-auto max-w-[1200px] py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
                R
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-white">ReFrame</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              Reframe any website into a fast, modern site you can edit by
              chatting. Live in minutes.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm text-zinc-400 transition-colors hover:text-white">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-sm text-zinc-500">© {new Date().getFullYear()} ReFrame. All rights reserved.</p>
          <p className="text-sm text-zinc-500">Built for the modern web.</p>
        </div>
      </div>
    </footer>
  );
}
