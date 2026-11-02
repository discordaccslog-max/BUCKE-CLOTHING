import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/products";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const url = (path: string) => `${site.url}${path}`;

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/shop"), changeFrequency: "weekly", priority: 0.9 },
    ...categories.map((c) => ({
      url: url(`/shop/${c.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: url(`/product/${p.slug}`),
      lastModified: p.releasedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: url("/lookbook"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
