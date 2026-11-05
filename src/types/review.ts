export type ReviewPlatform = "trustpilot" | "judgeme" | "loox";

export interface Review {
  id: string;
  /** As the customer wants it shown, e.g. "Jake M." */
  author: string;
  /** 1 to 5. */
  rating: number;
  title?: string;
  body: string;
  /** ISO date the review was written. */
  date: string;
  /** True only when the review platform matched the review to a real order. */
  verified: boolean;
  /** Slug of the product reviewed, for the mini product card. */
  productSlug?: string;
  /** ISO date of the purchase, when the platform provides it. */
  purchasedAt?: string;
  /** Customer photo. Local path under /public or an allowed remote URL. */
  photo?: { src: string; alt: string; width: number; height: number };
}

export interface ReviewSummary {
  platform: ReviewPlatform;
  /** Average rating out of 5, one decimal. */
  rating: number;
  count: number;
  /** Public profile, e.g. https://www.trustpilot.com/review/buckeclothing.com */
  profileUrl?: string;
}
