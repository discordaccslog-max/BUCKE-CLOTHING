import Image from "next/image";
import Link from "next/link";
import { CheckIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import type { Review } from "@/types/review";
import { ReviewPhotoThumbnail } from "./ReviewPhotoThumbnail";
import { TrustpilotStars } from "./Stars";

export interface ReviewProduct {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: { src: string; alt: string };
}

const shortDate = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export function ReviewCard({ review, product }: { review: Review; product?: ReviewProduct }) {
  return (
    <article className="flex flex-col border border-ink/10 bg-white">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <TrustpilotStars rating={review.rating} className="text-base" />
          <time dateTime={review.date} className="text-xs text-grey-600">
            {shortDate.format(new Date(review.date))}
          </time>
        </div>

        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className="font-semibold">{review.author}</span>
          {review.verified && (
            <span className="type-label inline-flex items-center gap-1 text-[0.625rem] text-grey-700">
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-trustpilot text-white">
                <CheckIcon width={9} height={9} strokeWidth={3.5} />
              </span>
              Verified Buyer
            </span>
          )}
        </p>

        {review.title && <h3 className="font-semibold">{review.title}</h3>}
        <blockquote className="leading-relaxed text-grey-700">{review.body}</blockquote>

        {/* REVIEW IMAGE SLOT: renders when the review has a `photo` in src/data/reviews.ts. */}
        {review.photo && <ReviewPhotoThumbnail photo={review.photo} />}

        {product && (
          <Link
            href={`/product/${product.slug}`}
            className="flex items-center gap-3 bg-paper p-2.5 transition-colors hover:bg-bone"
          >
            <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-white">
              <Image src={product.image.src} alt="" fill sizes="56px" className="object-contain p-0.5" />
            </span>
            <span className="min-w-0 text-xs leading-snug">
              <span className="block truncate text-sm font-semibold">{product.name}</span>
              <span className="block tabular-nums">
                {formatPrice(product.price)}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <s className="ml-1.5 text-grey-500">{formatPrice(product.compareAtPrice)}</s>
                )}
              </span>
              {review.purchasedAt && (
                <span className="mt-0.5 block text-grey-600">
                  Purchased {shortDate.format(new Date(review.purchasedAt))}
                </span>
              )}
            </span>
          </Link>
        )}
      </div>
    </article>
  );
}
