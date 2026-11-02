import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  /** next/image `sizes` for the grid or rail this card sits in. */
  sizes: string;
  /** Preload the first image (use for the first row only). */
  preload?: boolean;
  className?: string;
}

export function ProductCard({ product, sizes, preload, className }: ProductCardProps) {
  const color = product.colors[0];
  const [primary, secondary] = color.images;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-grey-100">
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes={sizes}
            preload={preload}
            loading={preload ? "eager" : "lazy"}
            className="object-cover transition-[transform,opacity] duration-[1.2s] ease-out-expo group-hover:scale-[1.04]"
          />
          {secondary && (
            <Image
              src={secondary.src}
              alt=""
              fill
              sizes={sizes}
              loading="lazy"
              className="object-cover opacity-0 transition-[transform,opacity] duration-[1.2s] ease-out-expo group-hover:scale-[1.04] group-hover:opacity-100"
            />
          )}
          {(product.isNew || onSale) && (
            <span className="type-label absolute left-3 top-3 bg-bone px-2 py-1 text-[0.625rem] text-accent">
              {onSale ? "Sale" : "New"}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium uppercase tracking-wide">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-grey-600">
              {product.colors.length > 1 ? `${product.colors.length} colors` : color.name}
            </p>
          </div>
          <p className="shrink-0 text-sm tabular-nums">
            {onSale && (
              <>
                <span className="sr-only">Sale price </span>
                <s className="mr-2 text-grey-500">
                  <span className="sr-only">Was </span>
                  {formatPrice(product.compareAtPrice!)}
                </s>
              </>
            )}
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </article>
  );
}
