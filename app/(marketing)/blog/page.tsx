import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Conseils et actualités pour les commerces locaux qui veulent un site qui marche.",
};

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Conseils pour votre présence en ligne"
        description="Des articles simples et concrets pour tirer le meilleur de votre site."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Article à la une */}
          {featured && (
            <Reveal>
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid overflow-hidden rounded-3xl border border-border bg-card transition-shadow hover:shadow-lg lg:grid-cols-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand/15 via-chart-2/10 to-transparent lg:aspect-auto">
                  <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
                  <span className="absolute bottom-6 left-6 text-6xl font-bold tracking-tighter text-foreground/10">
                    {featured.category}
                  </span>
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10">
                  <Badge variant="secondary" className="w-fit">
                    {featured.category}
                  </Badge>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight group-hover:text-brand">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
                  <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatDate(featured.date)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" /> {featured.readingTime} min
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Autres articles */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 0.08}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-muted to-brand-muted/30">
                    <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <Badge variant="secondary" className="w-fit">
                      {post.category}
                    </Badge>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-brand">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between pt-4 text-sm text-muted-foreground">
                      <span>{formatDate(post.date)}</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
