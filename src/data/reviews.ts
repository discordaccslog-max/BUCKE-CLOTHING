import type { Review, ReviewPlatform } from "../types/review";

/**
 * Customer reviews: one shared list, shown the same on every product page
 * (and on the homepage).
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
    author: "Chris L.",
    rating: 5,
    body: "fits good",
    date: "2026-11-16",
    verified: true,
    productSlug: "bandana-star-camo-hoodie",
    purchasedAt: "2026-11-07",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-02",
    author: "Andre M.",
    rating: 5,
    body: "goated shi, love bucke",
    date: "2026-11-15",
    verified: true,
    productSlug: "bandana-star-camo-hoodie",
    purchasedAt: "2026-11-07",
    photo: { src: "/reviews/andre-m-bandana-star-camo-hoodie.webp", alt: "Customer photo from Andre M.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-03",
    author: "Maya R.",
    rating: 5,
    body: "the studded letters are heavier than i thought, feels well made. distressing looks natural not forced",
    date: "2026-11-13",
    verified: true,
    productSlug: "graffiti-distressed-hoodie-heather-grey",
    purchasedAt: "2026-11-03",
    photo: { src: "/reviews/maya-r-graffiti-distressed-hoodie.webp", alt: "Customer photo from Maya R.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-04",
    author: "Dylan R.",
    rating: 4,
    body: "fits good but runs a lil big, went down a size and its perfect now",
    date: "2026-11-12",
    verified: true,
    productSlug: "graffiti-distressed-hoodie-heather-grey",
    purchasedAt: "2026-11-05",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-05",
    author: "Priya S.",
    rating: 5,
    body: "very comfy i love it, the fleece inside is so soft and it doesnt feel cheap at all. been my go to hoodie for like 2 weeks straight",
    date: "2026-11-09",
    verified: true,
    productSlug: "painted-faces-hoodie-washed-black",
    purchasedAt: "2026-10-29",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-06",
    author: "Tyler B.",
    rating: 4,
    body: "print is clean. only thing is the hood is kinda small but whatever",
    date: "2026-11-07",
    verified: true,
    productSlug: "painted-faces-hoodie-washed-black",
    purchasedAt: "2026-10-29",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-07",
    author: "Isaiah P.",
    rating: 5,
    body: "shipping took 4 days with fedex, 10/10",
    date: "2026-11-03",
    verified: true,
    productSlug: "1-800-bankroll-zip-up-baby-blue",
    purchasedAt: "2026-10-26",
    photo: { src: "/reviews/isaiah-p-1-800-bankroll-zip-hoodie.webp", alt: "Customer photo from Isaiah P.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-08",
    author: "Sam K.",
    rating: 5,
    body: "zip is sturdy, doesnt catch. been washed twice already no issues",
    date: "2026-11-02",
    verified: true,
    productSlug: "1-800-bankroll-zip-up-baby-blue",
    purchasedAt: "2026-10-21",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-09",
    author: "Jordan C.",
    rating: 5,
    body: "the puff stars are actually raised not just printed on, didnt expect that for the price",
    date: "2026-10-31",
    verified: true,
    productSlug: "star-applique-zip-hoodie-cream",
    purchasedAt: "2026-10-24",
    photo: { src: "/reviews/jordan-c-star-applique-zip-hoodie.webp", alt: "Customer photo from Jordan C.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-10",
    author: "Kevin O.",
    rating: 4,
    body: "simple and good, camo colors are nicer irl than the photos",
    date: "2026-10-26",
    verified: true,
    productSlug: "camo-zip-hoodie-pink-hood",
    purchasedAt: "2026-10-17",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-11",
    author: "Ryan T.",
    rating: 5,
    body: "feels high quality asf and it's %100 cotton",
    date: "2026-10-25",
    verified: true,
    productSlug: "cross-long-sleeve-tee",
    purchasedAt: "2026-10-15",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-12",
    author: "Noah D.",
    rating: 5,
    body: "best streetwear branddd (pls restock more longsleeves)",
    date: "2026-10-22",
    verified: true,
    productSlug: "cross-long-sleeve-tee",
    purchasedAt: "2026-10-14",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-13",
    author: "Devon A.",
    rating: 5,
    body: "3rd time buying, bucke doesn't miss",
    date: "2026-10-20",
    verified: true,
    productSlug: "bankroll-club-long-sleeve",
    purchasedAt: "2026-10-11",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-14",
    author: "Jamal E.",
    rating: 4,
    body: "solid but the sleeves are a bit long on me, im 5'9",
    date: "2026-10-19",
    verified: true,
    productSlug: "bankroll-club-long-sleeve",
    purchasedAt: "2026-10-08",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-15",
    author: "Hannah L.",
    rating: 5,
    body: "the crest detail is sick, way more going on than the pics show",
    date: "2026-10-15",
    verified: true,
    productSlug: "flag-raglan-ls",
    purchasedAt: "2026-10-08",
    photo: { src: "/reviews/hannah-l-flag-raglan-long-sleeve.webp", alt: "Customer photo from Hannah L.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-16",
    author: "Alex N.",
    rating: 5,
    body: "sleeves are the perfect length for once",
    date: "2026-10-13",
    verified: true,
    productSlug: "flag-raglan-ls",
    purchasedAt: "2026-10-04",
    photo: { src: "/reviews/alex-n-flag-raglan-long-sleeve.webp", alt: "Customer photo from Alex N.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-17",
    author: "Tanner V.",
    rating: 5,
    body: "flames on the sleeves go crazy ngl",
    date: "2026-10-10",
    verified: true,
    productSlug: "star-camo-ls",
    purchasedAt: "2026-09-30",
    photo: { src: "/reviews/tanner-v-star-camo-long-sleeve.webp", alt: "Customer photo from Tanner V.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-18",
    author: "Ethan G.",
    rating: 4,
    body: "cool piece, just wish it was a lil heavier for winter",
    date: "2026-10-09",
    verified: true,
    productSlug: "star-camo-ls",
    purchasedAt: "2026-10-01",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-19",
    author: "Trey W.",
    rating: 5,
    body: "thermal is actually warm, not one of those fake thin ones",
    date: "2026-10-07",
    verified: true,
    productSlug: "camo-thermal-ls",
    purchasedAt: "2026-09-25",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-20",
    author: "Brandon S.",
    rating: 5,
    body: "heavy tee, doesnt feel like paper like other brands",
    date: "2026-10-01",
    verified: true,
    productSlug: "1-800-bankroll-hotline-tee",
    purchasedAt: "2026-09-22",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-21",
    author: "Carlos M.",
    rating: 5,
    body: "bought 2",
    date: "2026-09-30",
    verified: true,
    productSlug: "1-800-bankroll-hotline-tee",
    purchasedAt: "2026-09-23",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-22",
    author: "Sofia M.",
    rating: 5,
    body: "rhinestones are all still on after like 4 washes, i was worried about that",
    date: "2026-09-28",
    verified: true,
    productSlug: "halo-rhinestone-tee-washed-grey",
    purchasedAt: "2026-09-18",
    photo: { src: "/reviews/sofia-m-halo-rhinestone-tee.webp", alt: "Customer photo from Sofia M.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-23",
    author: "Luis A.",
    rating: 3,
    body: "looks great but a couple stones came loose on the first wear. glued em back, still like it tho",
    date: "2026-09-25",
    verified: true,
    productSlug: "halo-rhinestone-tee-washed-grey",
    purchasedAt: "2026-09-16",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-24",
    author: "Pete R.",
    rating: 5,
    body: "print quality is actually insane, washed it like 3 times already and no cracking at all",
    date: "2026-09-24",
    verified: true,
    productSlug: "american-psycho-tee",
    purchasedAt: "2026-09-16",
    photo: { src: "/reviews/pete-r-american-psycho-tee.webp", alt: "Customer photo from Pete R.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-25",
    author: "Sean P.",
    rating: 4,
    body: "nice shirt, wish the fit was a bit boxier",
    date: "2026-09-20",
    verified: true,
    productSlug: "american-psycho-tee",
    purchasedAt: "2026-09-09",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-26",
    author: "Nico V.",
    rating: 5,
    body: "thick material, not see through like most graphic tees",
    date: "2026-09-18",
    verified: true,
    productSlug: "blessed-script-tee",
    purchasedAt: "2026-09-09",
    photo: { src: "/reviews/nico-v-blessed-script-tee.webp", alt: "Customer photo from Nico V.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-27",
    author: "Nadia K.",
    rating: 5,
    body: "the chrome effect looks way better irl than in the pics, colors are deeper",
    date: "2026-09-17",
    verified: true,
    productSlug: "chrome-grill-tee",
    purchasedAt: "2026-09-10",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-28",
    author: "Marcus D.",
    rating: 5,
    body: "clean from the front then the pocket hits from behind. exactly like the description said",
    date: "2026-09-14",
    verified: true,
    productSlug: "rhinestone-jeans",
    purchasedAt: "2026-09-04",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-29",
    author: "Malik J.",
    rating: 4,
    body: "good jeans, took a week to get here tho",
    date: "2026-09-12",
    verified: true,
    productSlug: "rhinestone-jeans",
    purchasedAt: "2026-09-04",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-30",
    author: "Jaylen W.",
    rating: 5,
    body: "the paint looks real not printed on, like actually layered",
    date: "2026-09-07",
    verified: true,
    productSlug: "spray-paint-jeans",
    purchasedAt: "2026-08-29",
    photo: { src: "/reviews/jaylen-w-spray-paint-jeans.webp", alt: "Customer photo from Jaylen W.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-31",
    author: "Daniel K.",
    rating: 5,
    body: "2nd pair i bought",
    date: "2026-09-06",
    verified: true,
    productSlug: "spray-paint-jeans",
    purchasedAt: "2026-08-25",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-32",
    author: "Liam H.",
    rating: 5,
    body: "python print is loud in the best way. fit is baggy like i wanted",
    date: "2026-09-04",
    verified: true,
    productSlug: "snake-denim-teal-python",
    purchasedAt: "2026-08-28",
    photo: { src: "/reviews/liam-h-snake-denim.webp", alt: "Customer photo from Liam H.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-33",
    author: "Omar F.",
    rating: 4,
    body: "fit is perfect im 6'1 180 got a large but the print is a bit darker than the photos",
    date: "2026-09-01",
    verified: true,
    productSlug: "snake-denim-teal-python",
    purchasedAt: "2026-08-23",
    photo: null, // ← REVIEW IMAGE SLOT
  },
  {
    id: "r-34",
    author: "Marcus T.",
    rating: 5,
    body: "rips are in good spots, not too much. wear these like 3 times a week",
    date: "2026-08-31",
    verified: true,
    productSlug: "distressed-baggy-jeans",
    purchasedAt: "2026-08-21",
    photo: { src: "/reviews/marcus-t-distressed-baggy-jeans.webp", alt: "Customer photo from Marcus T.'s review", width: 960, height: 1200 },
  },
  {
    id: "r-35",
    author: "Devon R.",
    rating: 3,
    body: "fit is good but one of the belt loops was stitched crooked. not a big deal",
    date: "2026-08-29",
    verified: true,
    productSlug: "distressed-baggy-jeans",
    purchasedAt: "2026-08-21",
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
