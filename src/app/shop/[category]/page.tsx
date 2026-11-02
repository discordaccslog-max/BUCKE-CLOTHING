import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";
import { ShopView, ShopViewFallback } from "@/components/shop/ShopView";
import {
  getCategories,
  getCategory,
  getProductsByCategory,
  isCategorySlug,
} from "@/lib/products";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: { url: `/shop/${category.slug}` },
  };
}

export default function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  // Params are read inside Suspense so client navigations render the
  // skeleton instantly; prerendered categories ship complete HTML.
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: Pick<PageProps<"/shop/[category]">, "params">) {
  const { category: slug } = await params;
  if (!isCategorySlug(slug)) notFound();
  const [category, products, categories] = await Promise.all([
    getCategory(slug),
    getProductsByCategory(slug),
    getCategories(),
  ]);
  if (!category) notFound();

  const props = {
    products,
    categories,
    basePath: `/shop/${category.slug}`,
    showCategoryFilter: false,
  };

  return (
    <>
      <ShopHeader
        title={category.name}
        description={category.description}
        categories={categories}
        current={category.slug}
      />
      <Suspense fallback={<ShopViewFallback {...props} />}>
        <ShopView {...props} />
      </Suspense>
    </>
  );
}
