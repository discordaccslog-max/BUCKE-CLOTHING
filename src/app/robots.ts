import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/order-success", "/order-failed", "/refund-request"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
