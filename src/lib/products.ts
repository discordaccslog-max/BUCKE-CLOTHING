/**
 * Catalogue data layer.
 *
 * This is the ONLY module that knows where product data comes from. Today it
 * reads typed files in /src/data. To move to a database or commerce API,
 * rewrite the bodies of these functions; their signatures (async, returning
 * domain types) stay the same, so no component has to change.
 *
 * Each function is marked "use cache" so a slow source still produces a
 * static, cached result under Next.js Cache Components.
 */
import { categories } from "@/data/categories";
import { lookbook } from "@/data/lookbook";
import { products } from "@/data/products";
import type { Category, CategorySlug, Product } from "@/types/product";
import { CATEGORY_SLUGS } from "@/types/product";

export function isCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

/** Categories with a tile image taken from each category's top-ranked product. */
function withImages(): Category[] {
  return categories.map((c) => {
    const lead = [...products]
      .filter((p) => p.category === c.slug)
      .sort((a, b) => a.featuredRank - b.featuredRank)[0];
    const image = lead?.colors[0].images[0] ?? {
      src: "/editorial/look-01.svg",
      alt: c.name,
      width: 1600,
      height: 2400,
    };
    return { ...c, image };
  });
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  return withImages();
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  "use cache";
  return withImages().find((c) => c.slug === slug);
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  return [...products].sort((a, b) => a.featuredRank - b.featuredRank);
}

export async function getProductsByCategory(slug: CategorySlug): Promise<Product[]> {
  "use cache";
  return products
    .filter((p) => p.category === slug)
    .sort((a, b) => a.featuredRank - b.featuredRank);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  return products.find((p) => p.slug === slug);
}

export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  return products.map((p) => p.slug);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  "use cache";
  const sorted = [...products].sort(
    (a, b) => Number(b.isNew) - Number(a.isNew) || b.releasedAt.localeCompare(a.releasedAt),
  );
  return sorted.slice(0, limit);
}

/** Same category first, then everything else, never the product itself. */
export async function getRelatedProducts(slug: string, limit = 8): Promise<Product[]> {
  "use cache";
  const current = products.find((p) => p.slug === slug);
  if (!current) return [];
  const others = products.filter((p) => p.slug !== slug);
  const same = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}

export async function getLookbook() {
  "use cache";
  return lookbook;
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  "use cache";
  return slugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is Product => Boolean(p));
}
