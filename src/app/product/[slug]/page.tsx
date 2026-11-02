import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductRail, RAIL_ITEM_CLASS, RAIL_SIZES } from "@/components/product/ProductRail";
import { ProductSkeleton } from "@/components/product/ProductSkeleton";
import { getCategory, getProduct, getProductSlugs, getRelatedProducts } from "@/lib/products";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const image = product.colors[0].images[0];
  // Social crawlers don't render SVG; placeholders fall back to the site OG image.
  const ogImages = image.src.endsWith(".svg")
    ? undefined
    : [{ url: image.src, width: image.width, height: image.height, alt: image.alt }];
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { url: `/product/${product.slug}`, title: product.name, description: product.description, images: ogImages },
  };
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/product/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const [category, related] = await Promise.all([
    getCategory(product.category),
    getRelatedProducts(product.slug, 8),
  ]);
  if (!category) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: site.legalName },
    image: product.colors.flatMap((c) => c.images.map((i) => new URL(i.src, site.url).toString())),
    offers: {
      "@type": "Offer",
      url: new URL(`/product/${product.slug}`, site.url).toString(),
      priceCurrency: product.currency,
      price: (product.price / 100).toFixed(2),
      availability:
        product.soldOutSizes.length === product.sizes.length
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
      />
      <ProductDetail product={product} category={category} />
      {related.length > 0 && (
        <div className="border-t border-ink/10">
          <ProductRail eyebrow="More from Bucke" title="You may also like">
            {related.map((p) => (
              <li key={p.id} className={RAIL_ITEM_CLASS}>
                <ProductCard product={p} sizes={RAIL_SIZES} />
              </li>
            ))}
          </ProductRail>
        </div>
      )}
    </>
  );
}
