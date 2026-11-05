import type { Metadata } from "next";
import Link from "next/link";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Hero } from "@/components/home/Hero";
import { LookbookBand } from "@/components/home/LookbookBand";
import { Newsletter } from "@/components/home/Newsletter";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductRail, RAIL_ITEM_CLASS, RAIL_SIZES } from "@/components/product/ProductRail";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { lookbookSeason } from "@/data/lookbook";
import { getCategories, getLookbook, getNewArrivals } from "@/lib/products";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [categories, newArrivals, looks] = await Promise.all([
    getCategories(),
    getNewArrivals(8),
    getLookbook(),
  ]);

  return (
    <>
      <Hero />
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
      <LookbookBand season={lookbookSeason} looks={looks} />
      <Newsletter />
    </>
  );
}
