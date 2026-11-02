import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopView, ShopViewFallback } from "@/components/shop/ShopView";
import { getCategories, getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Heavyweight hoodies, longsleeves, pants and jeans from Bucke.",
  alternates: { canonical: "/shop" },
  openGraph: { url: "/shop" },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const props = { products, categories, basePath: "/shop", showCategoryFilter: true };

  return (
    <>
      <ShopHeader
        title="Shop all"
        description="Everything we make, in one place. Filter by category, size and price."
        categories={categories}
      />
      <Suspense fallback={<ShopViewFallback {...props} />}>
        <ShopView {...props} />
      </Suspense>
    </>
  );
}
