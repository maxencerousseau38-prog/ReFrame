import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blog";
import { formatDate, getInitials } from "@/lib/utils";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article introuvable" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="mb-8 -ml-2 text-muted-foreground">
          <Link href="/blog">
            <ArrowLeft className="size-4" /> Tous les articles
          </Link>
        </Button>

        <Badge variant="secondary">{post.category}</Badge>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight">{post.title}</h1>

        <div className="mt-6 flex items-center gap-4 border-b border-border pb-8">
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand to-chart-2 text-sm font-semibold text-white">
            {getInitials(post.author.name)}
          </span>
          <div className="text-sm">
            <p className="font-medium">{post.author.name}</p>
            <p className="text-muted-foreground">
              {post.author.role} · {formatDate(post.date)} ·{" "}
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {post.readingTime} min
              </span>
            </p>
          </div>
        </div>

        <div className="prose-vitrio mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-pretty">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Envie d'un site moderne pour votre commerce ?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Découvrez gratuitement l'avant/après de votre site.
          </p>
          <Button asChild className="mt-6">
            <Link href="/inscription">Créer mon site</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
