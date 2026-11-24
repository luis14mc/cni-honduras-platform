import type { MetadataRoute } from "next";
import { siteUrl } from "@/src/lib/seo";
import { isIndexableDeployment } from "@/src/lib/indexing";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexableDeployment()) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cms", "/strapi-api", "/api", "/editorial-preview", "/en/editorial-preview"],
    },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
