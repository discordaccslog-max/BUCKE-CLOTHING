import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/format";
import { UNNAMED_COLOR, type Product } from "@/types/product";

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
        {/* Product shots are white-background flat lays: fit the whole garment, never crop. */}
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes={sizes}
            preload={preload}
            loading={preload ? "eager" : "lazy"}
            className="object-contain p-3 transition-[transform,opacity] duration-[1.2s] ease-out-expo group-hover:scale-[1.04]"
          />
          {secondary && (
            <Image
              src={secondary.src}
              alt=""
              fill
              sizes={sizes}
              loading="lazy"
              className="object-contain p-3 opacity-0 transition-[transform,opacity] duration-[1.2s] ease-out-expo group-hover:scale-[1.04] group-hover:opacity-100"
            />
          )}
          {(product.isNew || onSale) && (
            <span className="type-label absolute left-3 top-3 bg-bone px-2 py-1 text-[0.625rem] text-accent">
              {onSale ? "Sale" : "New"}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-medium uppercase tracking-wide">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-grey-600">
              {product.colors.length > 1
                ? `${product.colors.length} colors`
                : color.name !== UNNAMED_COLOR && color.name}
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
