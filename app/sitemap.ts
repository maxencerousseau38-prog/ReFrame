import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/fonctionnalites",
    "/tarifs",
    "/exemples",
    "/a-propos",
    "/contact",
    "/blog",
    "/connexion",
    "/inscription",
    "/mentions-legales",
    "/confidentialite",
    "/cgv",
    "/cgu",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const posts = BLOG_POSTS.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...routes, ...posts];
}
