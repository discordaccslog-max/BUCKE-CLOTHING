import type { Metadata } from "next";
import Link from "next/link";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedLook } from "@/components/home/FeaturedLook";
import { Hero } from "@/components/home/Hero";
import { Newsletter } from "@/components/home/Newsletter";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductRail, RAIL_ITEM_CLASS, RAIL_SIZES } from "@/components/product/ProductRail";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { getCategories, getNewArrivals, getProductsBySlugs } from "@/lib/products";

/** Pieces worn in the featured look, in caption order. */
const FEATURED_LOOK_SLUGS = ["bankroll-club-long-sleeve", "saint-studded-denim-washed-tan"];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [categories, newArrivals, featuredLook] = await Promise.all([
    getCategories(),
    getNewArrivals(8),
    getProductsBySlugs(FEATURED_LOOK_SLUGS),
  ]);

  return (
    <>
      <Hero />
      <FeaturedLook products={featuredLook} />
      <CategoryGrid categories={categories} />
      <ProductRail
        eyebrow="Just landed"
        title="New arrivals"
        action={
          <Link href="/shop?sort=newest" className="type-label border-b border-ink/40 pb-1 hover:border-ink">
            View all
          </Link>
        }
      >
        {newArrivals.map((product) => (
          <li key={product.id} className={RAIL_ITEM_CLASS}>
            <ProductCard product={product} sizes={RAIL_SIZES} />
          </li>
        ))}
      </ProductRail>
      <ReviewsSection variant="home" />
      <Newsletter />
    </>
  );
}
