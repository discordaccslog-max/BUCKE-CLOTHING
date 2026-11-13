import type { Review, ReviewPlatform } from "../types/review";

/**
 * Customer reviews: one shared list, shown the same on every product page
 * (and on the homepage).
 *
 * ⚠ PLACEHOLDER DEMO CONTENT. The reviews, names and the 4.7 / 2,128 score
 * below are made up for the demo. Replace them with real reviews copied from
 * your Trustpilot account before the site takes real orders.
 *
 * Fields:
 *   author       As the customer wants it shown, e.g. "Jake M."
 *   rating       1 to 5
 *   body         The review text
 *   date         ISO date the review was written (newest shows first)
 *   verified     Shows the "Verified Buyer" badge
 *   productSlug  The product reviewed: its photo, name and price fill the
 *                mini product card. Must match a slug in src/data/products.ts.
 *   purchasedAt  ISO purchase date, shown as "Purchased on …"
 *   photo        REVIEW IMAGE SLOT. Leave null for a text-only card. To add
 *                a customer photo, put the file in /public/reviews/ and set
 *                e.g. { src: "/reviews/r-01.webp", alt: "…", width: 900, height: 1200 }.
 *                It shows full-width at the top of the card.
 */
export const reviews: Review[] = [
  {
    id: "r-01",
    author: "Marcus T.",
    rating: 5,
    body: "lowkey better than i expected, the fit is actually so good. heavy material too, not that thin stuff",
    date: "2026-11-11",
    verified: true,
    productSlug: "bandana-star-camo-hoodie",
    purchasedAt: "2026-11-02",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-02",
    author: "Jaylen R.",
    rating: 5,
    body: "clean from the front then the rhinestone pocket hits from behind. got asked where they're from twice the first day i wore them",
    date: "2026-11-09",
    verified: true,
    productSlug: "rhinestone-jeans",
    purchasedAt: "2026-10-31",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-03",
    author: "Sofia M.",
    rating: 4,
    body: "the distressing looks properly worn in, not fake looking at all. runs a lil big so size down if you want it fitted",
    date: "2026-11-07",
    verified: true,
    productSlug: "graffiti-distressed-hoodie-heather-grey",
    purchasedAt: "2026-10-29",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-04",
    author: "Devon K.",
    rating: 5,
    body: "the pink spray paint is even louder in person. baggy fit is exactly what i wanted and shipping was quicker than i thought",
    date: "2026-11-05",
    verified: true,
    productSlug: "spray-paint-jeans",
    purchasedAt: "2026-10-27",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-05",
    author: "Aaliyah B.",
    rating: 5,
    body: "that faded red is perfect, looks vintage straight out the bag. already wore it like 4 times this week lol",
    date: "2026-11-02",
    verified: true,
    productSlug: "faded-red-zip-hoodie",
    purchasedAt: "2026-10-24",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-06",
    author: "Chris P.",
    rating: 4,
    body: "solid long sleeve, the sleeve crosses are clean and the fabric is thick. took a couple extra days to arrive but worth the wait",
    date: "2026-10-30",
    verified: true,
    productSlug: "cross-long-sleeve-tee",
    purchasedAt: "2026-10-19",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-07",
    author: "Nina V.",
    rating: 5,
    body: "obsessed. the rhinestones catch the light so nice and the boxy fit is perfect. held up great in the wash too",
    date: "2026-10-27",
    verified: true,
    productSlug: "halo-rhinestone-tee-washed-grey",
    purchasedAt: "2026-10-17",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-08",
    author: "Tyler W.",
    rating: 5,
    body: "third order from bucke and still no misses. camo is hard and they stack right on my shoes",
    date: "2026-10-24",
    verified: true,
    productSlug: "camo-baggy-jeans",
    purchasedAt: "2026-10-14",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-09",
    author: "Imani J.",
    rating: 5,
    body: "the chrome cross on the front goes crazy. quality feels way more expensive than what i paid fr",
    date: "2026-10-21",
    verified: true,
    productSlug: "new-york-cross-hoodie",
    purchasedAt: "2026-10-11",
    photo: null, // ← REVIEW IMAGE SLOT
  },
];

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
  overallRating: 4.7, // ⚠ placeholder
  totalReviews: 2128, // ⚠ placeholder; shown as "2,128+"
};
