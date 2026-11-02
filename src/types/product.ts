/**
 * Domain types for the catalogue. Components depend on these, never on the
 * shape of a particular data source (local files today, a database later).
 */

export const CATEGORY_SLUGS = ["hoodies", "longsleeves", "pants-jeans"] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface Category {
  slug: CategorySlug;
  name: string;
  /** One-line editorial description used on tiles and category pages. */
  description: string;
  image: ProductImage;
}

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductColor {
  name: string;
  /** URL-safe identifier, e.g. "washed-black". */
  slug: string;
  /** Swatch color. Data, not styling, so a literal value is correct here. */
  swatch: string;
  images: ProductImage[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  /** Price in the smallest currency unit (cents). */
  price: number;
  compareAtPrice?: number;
  currency: "USD";
  description: string;
  details: string[];
  materials: string;
  fit: string;
  sizes: string[];
  /** Sizes that exist but are currently unavailable. */
  soldOutSizes: string[];
  colors: ProductColor[];
  isNew: boolean;
  /** ISO date, drives "newest" sorting. */
  releasedAt: string;
  /** Lower numbers surface first in "featured" sorting. */
  featuredRank: number;
}
