import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Espaces privés exclus de l'indexation.
      disallow: ["/dashboard", "/admin", "/onboarding", "/api"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
