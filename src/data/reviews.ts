import type { Review, ReviewPlatform } from "../types/review";

/**
 * Customer reviews.
 *
 * Only real reviews go here, copied from (or later fetched live from) your
 * review platform. While the list is empty, every reviews section, the
 * rating strip and the rating pill stay hidden.
 *
 * Example entry:
 *   {
 *     id: "tp-001",
 *     author: "Jake M.",
 *     rating: 5,
 *     body: "Fits better than I expected and the print is heavy.",
 *     date: "2026-10-20",
 *     verified: true,
 *     productSlug: "bandana-star-camo-hoodie",
 *     purchasedAt: "2026-10-12",
 *     photo: { src: "/reviews/tp-001.webp", alt: "Customer wearing the hoodie", width: 900, height: 1200 },
 *   },
 */
export const reviews: Review[] = [];

export const reviewSource: {
  platform: ReviewPlatform;
  /** Public profile link, e.g. https://www.trustpilot.com/review/buckeclothing.com */
  profileUrl: string;
  /**
   * The platform's own score and total, when it shows more reviews than are
   * listed above (e.g. your TrustScore). Leave null to average the list.
   */
  overallRating: number | null;
  totalReviews: number | null;
} = {
  platform: "trustpilot",
  profileUrl: "",
  overallRating: null,
  totalReviews: null,
};
