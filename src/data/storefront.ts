/**
 * Storefront settings.
 *
 * The copy, toggles and offers behind the announcement bar, the product page
 * and the reviews sections. Change a value here and the site follows; no
 * component needs editing. Anything that makes a claim to customers (badges,
 * delivery times, ratings) is off or empty until you fill it in with facts.
 */

/* ---------- Announcement bar (top of every page) ---------- */
export const announcement = {
  enabled: true,
  /** Rotates automatically; customers can also use the arrows. */
  messages: [
    "Free shipping on orders over $150",
    "Free returns within 30 days",
    "Winter 26 collection is live",
  ],
  intervalMs: 5000,
};

/* ---------- Badge under the product title ---------- */
export const badge = {
  /** Off by default: only switch on when the claim is true. */
  enabled: false,
  rank: "#1",
  title: "Bestseller of 2026",
  subline: "A customer favorite this year",
  /** Limit to these product slugs; empty means every product. */
  products: [] as string[],
};

/* ---------- Delivery estimate (product page and cart) ---------- */
export const delivery = {
  enabled: true,
  /** Business days to pack and hand over to the carrier. */
  processingDays: 2,
  /** Carrier transit time in business days: [fastest, slowest]. Confirm with your carrier. */
  transitDays: [3, 6] as [number, number],
};

/* ---------- Checkout extras ---------- */
export const checkoutExtras = {
  /** Shop Pay button + "More payment options". Shown only once checkout is live (src/lib/checkout.ts). */
  expressCheckout: true,
  trustRow: true,
  /** Order of the payment marks under the trust row. Empty hides the row. */
  paymentMethods: ["mastercard", "amex", "applepay", "googlepay", "shoppay", "discover", "visa"] as const,
};

/* ---------- Product page accordions ---------- */
export const productInfo = {
  sizeFit: "Sizes run XS to L with a relaxed fit. Check the size guide for garment measurements.",
  /** Used when a product has no materials of its own. Check against the care label. */
  fabricCare:
    "Wash cold, inside out, with similar colours. Hang dry or tumble dry low. Do not bleach, and do not iron directly on prints.",
  guarantee: [
    "Not the right fit? Send it back within 30 days, unworn with tags attached, and we'll refund you.",
    "Every order is packed and checked by hand before it ships.",
  ],
};

/* ---------- Size guide popup ---------- */
export const sizeGuideNote = {
  /** e.g. "6'1\" / 185cm". Leave empty to hide the model line. */
  modelHeight: "",
  modelSize: "",
};

/* ---------- "See it in action" videos ---------- */
export interface ActionVideo {
  /** MP4 URL or path under /public. Loaded only when tapped. */
  src: string;
  /** Poster image (9:16) shown until tapped. */
  poster: string;
  alt: string;
}

/**
 * Per-product TikTok-style clips, keyed by product slug. A product with no
 * entry shows no video section. Example:
 *   "bandana-star-camo-hoodie": {
 *     stat: "Over 1M views on TikTok",
 *     videos: [{ src: "/videos/hoodie-1.mp4", poster: "/videos/hoodie-1.webp", alt: "Hoodie on body" }],
 *   },
 */
export const actionVideos: Record<string, { stat: string; videos: ActionVideo[] }> = {};

/* ---------- Sticky bottom bar on product pages ---------- */
export const stickyBar = {
  enabled: true,
  buttonLabel: "Shop now",
};
