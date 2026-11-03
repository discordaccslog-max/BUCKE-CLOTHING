import type { Category } from "../types/product";

/**
 * The four Bucke categories. Each tile's image is taken from the category's
 * first product by the data layer (src/lib/products.ts).
 */
export const categories: Omit<Category, "image">[] = [
  {
    slug: "hoodies",
    name: "Hoodies",
    description: "Pullovers and zip-ups: airbrush, camo, patchwork and rhinestone.",
  },
  {
    slug: "longsleeves",
    name: "Longsleeves",
    description: "Relaxed longsleeves with gothic and grunge graphics.",
  },
  {
    slug: "shirts",
    name: "Shirts",
    description: "Boxy, heavyweight graphic tees.",
  },
  {
    slug: "pants-jeans",
    name: "Pants & Jeans",
    description: "Wide-leg denim in acid washes, crystals, studs and prints.",
  },
];
