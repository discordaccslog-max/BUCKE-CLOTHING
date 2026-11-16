/**
 * Storefront settings.
 *
 * The copy, toggles and offers behind the announcement bar, the product page
 * and the reviews sections. Change a value here and the site follows; no
 * component needs editing. Anything that makes a claim to customers (badges,
 * delivery times, ratings) is off or empty until you fill it in with facts.
 */
import { reviewSource } from "./reviews";

/* ---------- Announcement bar (top of every page) ---------- */
export const announcement = {
  enabled: true,
  /** Rotates automatically; customers can also use the arrows. */
  messages: [
    "Free shipping on every order",
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

/* ---------- Delivery timeline (product page) and estimate (cart) ---------- */
/**
 * Counted from today, in the shopper's browser, so the dates are never
 * stale. "Ordered" is always today. Every "delivered" date on the site (the
 * product page timeline, the cart estimate and each checkout option) is
 * `readyDays` plus that shipping option's `transitDays` below, so they
 * always agree. The product page and cart use the first (default) option.
 */
export const delivery = {
  enabled: true,
  /** "Order ready" range: [earliest, latest] calendar days from today. Matches "Ships within 24 hours". */
  readyDays: [1, 1] as [number, number],
};

/* ---------- Checkout shipping options ---------- */
/**
 * `transitDays` is the carrier's time in business days (Mon–Fri) once the
 * order is ready. `price` is in cents; the first option is the default.
 */
export const shippingOptions = [
  { id: "standard", name: "Standard USPS Shipping", price: 0, transitDays: [2, 3], tracked: true, badge: null },
  { id: "express", name: "Express FedEx Shipping", price: 599, transitDays: [1, 2], tracked: true, badge: "Fastest" },
] as const satisfies readonly {
  id: string;
  name: string;
  price: number;
  transitDays: readonly [number, number];
  tracked: boolean;
  /** Small uppercase label beside the name, or null. */
  badge: string | null;
}[];
export type ShippingOptionId = (typeof shippingOptions)[number]["id"];

/* ---------- Reassurance list under the checkout order summary ---------- */
/**
 * ⚠ Only list what's true, and keep it in line with the rest of the site:
 * the returns policy (`productInfo.guarantee` below and `shippingCopy` in
 * size-guides.ts) and `delivery.readyDays` above.
 * `icon` is one of "return" | "lock" | "box". Empty hides the list.
 */
export const checkoutReassurance = [
  { icon: "return", title: "Free 30-day returns", text: "Any reason, no conditions. Full refund." },
  { icon: "lock", title: "Secure checkout", text: "Encrypted and protected at every step." },
  { icon: "box", title: "Ships within 24 hours", text: "Tracking sent as soon as it leaves." },
] as const satisfies readonly { icon: "return" | "lock" | "box"; title: string; text: string }[];

/* ---------- Checkout extras ---------- */
export const checkoutExtras = {
  trustRow: true,
  /** Order of the payment marks under the trust row. Empty hides the row. */
  paymentMethods: ["mastercard", "amex", "applepay", "googlepay", "shoppay", "discover", "visa"] as const,
};

/* ---------- Trust banner at the top of the cart drawer ---------- */
export const cartTrustBanner = {
  enabled: true,
  /** Score shown as "4.7/5". Comes from src/data/reviews.ts so it's set in one place. */
  rating: reviewSource.overallRating,
  /** ⚠ Placeholder demo figure. */
  customers: "Over 4,000+ satisfied customers",
  /**
   * BACKGROUND IMAGE SLOT. Empty = solid ink with the faint Bucke wordmark.
   * To use a texture or photo, put it in /public/editorial/ and set e.g.
   * "/editorial/cart-banner.webp" (about 900×300). An ink overlay keeps the
   * text readable, so any image works.
   */
  backgroundImage: "",
};

/* ---------- Product page accordions ---------- */
export const productInfo = {
  sizeFit: "Sizes run XXS to XXL with a relaxed fit. Check the size guide for garment measurements.",
  /** Used when a product has no materials of its own. Check against the care label. */
  fabricCare:
    "Wash cold, inside out, with similar colours. Hang dry or tumble dry low. Do not bleach, and do not iron directly on prints.",
  /** The returns policy, in full. Keep `shippingCopy` (size-guides.ts) and `checkoutReassurance` in line with it. */
  guarantee: [
    "Send anything back within 30 days of your order, for any reason, and we'll refund you in full.",
    "No conditions. Worn, washed or tags off, it doesn't matter. If it isn't right for you, it comes back.",
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
