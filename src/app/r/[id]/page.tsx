import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkle, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getShare } from "@/lib/server/shares-store";
import { SiteRenderer } from "@/components/blocks";
import { siteImage } from "@/lib/server/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const share = await getShare(params.id);
  if (!share) return { title: "Redesign not found" };
  const { name, tagline } = share.schema.brand;
  const title = `${name} — redesigned with ReFrame`;
  const image = siteImage(share.schema);
  return {
    title,
    description: tagline,
    robots: { index: false }, // previews shouldn't compete with the client's real site
    openGraph: { title, description: tagline, images: image ? [image] : undefined },
    twitter: { card: "summary_large_image", title, description: tagline },
  };
}

/**
 * Public, shareable preview of a redesign (anonymous-friendly). This is what a
 * visitor sends to a partner or revisits later, so the "wow" survives a closed
 * tab. A claim bar turns the viewer into the editor/buyer.
 */
export default async function SharePage({ params }: { params: { id: string } }) {
  const share = await getShare(params.id);
  if (!share) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/70 px-5 py-3 backdrop-blur-xl">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
          <Sparkle weight="fill" className="h-4 w-4 text-accent" />
          Redesigned with ReFrame
          <span className="hidden text-zinc-500 sm:inline">· {share.schema.brand.name}</span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/editor?share=${params.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[13px] font-medium text-accent-foreground transition hover:brightness-105"
          >
            Edit with AI <ArrowRight weight="bold" className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-white/5"
          >
            Redesign your site
          </Link>
        </div>
      </div>
      <SiteRenderer schema={share.schema} published />
    </div>
  );
}
