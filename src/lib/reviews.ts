/**
 * Reviews data layer: the only module that reads /src/data/reviews.ts.
 * To pull reviews live from Trustpilot, Judge.me or Loox, rewrite these
 * function bodies against the platform's API and keep the signatures.
 */
import { reviewSource, reviews } from "@/data/reviews";
import type { Review, ReviewSummary } from "@/types/review";

export { ratingLabel } from "./rating";

export async function getReviewSummary(): Promise<ReviewSummary | null> {
  "use cache";
  const count = reviewSource.totalReviews ?? reviews.length;
  if (count === 0) return null;
  const average =
    reviewSource.overallRating ??
    reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1);
  return {
    platform: reviewSource.platform,
    rating: Math.round(average * 10) / 10,
    count,
    profileUrl: reviewSource.profileUrl || undefined,
  };
}

/** Newest first. With a product slug, that product's reviews come first. */
export async function getReviews(productSlug?: string): Promise<Review[]> {
  "use cache";
  const sorted = [...reviews].sort((a, b) => b.date.localeCompare(a.date));
  if (!productSlug) return sorted;
  return [
    ...sorted.filter((r) => r.productSlug === productSlug),
    ...sorted.filter((r) => r.productSlug !== productSlug),
  ];
}
