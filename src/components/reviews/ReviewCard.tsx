import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, CheckIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import type { Review } from "@/types/review";
import { Stars } from "./Stars";

export interface ReviewProduct {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: { src: string; alt: string };
}

const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

export function ReviewCard({ review, product }: { review: Review; product?: ReviewProduct }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ink/10 bg-white">
      {review.photo && (
        <div className="relative aspect-[4/3] bg-black/[0.04]">
          <Image
            src={review.photo.src}
            alt={review.photo.alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 85vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Stars rating={review.rating} className="text-sm" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.05] px-2.5 py-1 text-xs font-semibold">
            {review.author}
            {review.verified && (
              <>
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink text-white">
                  <CheckIcon width={10} height={10} strokeWidth={3} />
                </span>
                <span className="font-normal text-grey-600">Verified Buyer</span>
              </>
            )}
          </span>
        </div>
        {review.title && <h3 className="font-semibold">{review.title}</h3>}
        <blockquote className="text-sm leading-relaxed text-grey-700">&ldquo;{review.body}&rdquo;</blockquote>

        {product && (
          <Link
            href={`/product/${product.slug}`}
            className="mt-auto flex items-center gap-3 rounded-lg bg-black/[0.04] p-2.5 transition-colors hover:bg-black/[0.07]"
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white">
              <Image src={product.image.src} alt="" fill sizes="48px" className="object-contain p-0.5" />
            </span>
            <span className="min-w-0 text-xs">
              <span className="block truncate font-semibold">{product.name}</span>
              <span className="block tabular-nums">
                {formatPrice(product.price)}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <s className="ml-1.5 text-grey-500">{formatPrice(product.compareAtPrice)}</s>
                )}
              </span>
              {review.purchasedAt && (
                <span className="mt-0.5 flex items-center gap-1 text-grey-600">
                  <CalendarIcon width={12} height={12} />
                  Purchased on {longDate.format(new Date(review.purchasedAt))}
                </span>
              )}
            </span>
          </Link>
        )}
      </div>
    </article>
  );
}
