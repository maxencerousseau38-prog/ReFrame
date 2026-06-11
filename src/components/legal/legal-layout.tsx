import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/brand/logo";
import { Footer } from "@/components/landing/footer";

/** Shared shell for legal/document pages: header, readable column, footer. */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative w-full max-w-full overflow-x-clip">
      <header className="border-b border-white/8">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-6">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-[13px] text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft weight="bold" className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-zinc-500">Last updated {updated}</p>

        <div className="legal mt-12 space-y-6 text-[15px] leading-relaxed text-zinc-400">{children}</div>

        <p className="mt-16 rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-sm text-zinc-500">
          This document is a starting template. Have it reviewed by qualified
          legal counsel before relying on it in production.
        </p>
      </article>

      <Footer />
    </main>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-6 text-xl font-semibold tracking-tight text-white">{children}</h2>;
}
