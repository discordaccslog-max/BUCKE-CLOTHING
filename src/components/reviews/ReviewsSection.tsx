import { getProductsBySlugs } from "@/lib/products";
import { getReviewSummary, getReviews, ratingLabel } from "@/lib/reviews";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ReviewCard, type ReviewProduct } from "./ReviewCard";
import { ReviewCarousel } from "./ReviewCarousel";
import { PlatformLogo, Stars } from "./Stars";

interface ReviewsSectionProps {
  /** "home": "See our reviews" with the platform logo. "product": the product page block. */
  variant: "home" | "product";
  /** On a product page, that product's reviews are listed first. */
  productSlug?: string;
}

/** Renders nothing until there are real reviews in src/data/reviews.ts. */
export async function ReviewsSection({ variant, productSlug }: ReviewsSectionProps) {
  const [summary, reviews] = await Promise.all([getReviewSummary(), getReviews(productSlug)]);
  if (!summary || reviews.length === 0) return null;

  const slugs = [...new Set(reviews.map((r) => r.productSlug).filter((s): s is string => Boolean(s)))];
  const products = new Map<string, ReviewProduct>(
    (await getProductsBySlugs(slugs)).map((p) => [
      p.slug,
      { slug: p.slug, name: p.name, price: p.price, compareAtPrice: p.compareAtPrice, image: p.colors[0].images[0] },
    ]),
  );

  const headingId = `reviews-${variant}`;
  const label = ratingLabel(summary.rating);

  return (
    <section aria-labelledby={headingId} className="bg-white py-16 text-ink md:py-24">
      <div className="container-page">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center md:mb-14">
          {variant === "home" ? (
            <>
              <h2 id={headingId} className="text-4xl font-bold tracking-tight md:text-5xl">
                See our reviews
              </h2>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-base">
                <span className="font-semibold">{label}</span>
                <Stars rating={summary.rating} className="text-xl" />
                <span className="text-grey-600">
                  <span className="font-semibold text-ink">{summary.rating.toFixed(1)}</span> out of 5 based on{" "}
                  {summary.count.toLocaleString("en-US")} reviews
                </span>
                <PlatformLogo platform={summary.platform} className="text-lg" />
              </div>
            </>
          ) : (
            <>
              <p className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-black/[0.05] px-4 py-2 text-xs font-semibold">
                <Stars rating={summary.rating} className="text-sm" />
                Rated {summary.rating.toFixed(1)}/5 based on {summary.count.toLocaleString("en-US")} total ratings
              </p>
              <h2 id={headingId} className="mt-5 text-4xl tracking-tight md:text-5xl">
                <span className="font-bold">Customer</span> <span className="font-normal">Reviews</span>
              </h2>
            </>
          )}
          <p className="mt-3 text-grey-600">See what our customers are saying</p>
        </div>

        <ReviewCarousel label="Customer reviews">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} product={r.productSlug ? products.get(r.productSlug) : undefined} />
          ))}
        </ReviewCarousel>

        {summary.profileUrl && (
          <p className="mt-8 text-center">
            <a
              href={summary.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-b border-ink/40 pb-0.5 text-sm font-semibold hover:border-ink"
            >
              Read all reviews on <PlatformLogo platform={summary.platform} />
              <ArrowRightIcon width={16} height={16} />
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
