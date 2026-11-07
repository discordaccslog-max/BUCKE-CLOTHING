/**
 * Decisions the product import applies. Edit this file (not the generated
 * src/data/products.ts) when the catalogue rules change, then re-run
 * `npm run import:products`.
 */
import { UNNAMED_COLOR, type CategorySlug } from "../src/types/product.ts";

/**
 * Shopify "Type" → Bucke category. A row whose Type is neither mapped here
 * nor excluded below stops the import with an error instead of guessing.
 */
export const TYPE_TO_CATEGORY: Record<string, CategorySlug> = {
  Hoodie: "hoodies",
  "Zip Hoodie": "hoodies",
  "Long Sleeve": "longsleeves",
  "T-Shirt": "shirts",
  Jeans: "pants-jeans",
  // Added 2026-11-06 with the hoodies/sweatshirts/jackets export: no
  // sweatshirt or jacket category yet, so both sit with hoodies.
  Sweatshirt: "hoodies",
  Jacket: "hoodies",
  Pants: "pants-jeans",
};

/** Types intentionally left out of the store (decided 2026-11-02). */
export const EXCLUDED_TYPES: Record<string, string> = {
  Shorts: "Shorts are not stocked on the Bucke site",
  Set: "Multi-piece sets are not stocked on the Bucke site",
};

/**
 * Individual products left out. Reviewed by eye against the product photos:
 * anything with NOIRIX branding on the garment itself is excluded.
 */
export const EXCLUDED_HANDLES: Record<string, string> = {
  "distressed-workwear-zip-hoodie-washed-brown": "Carhartt logo patch on the pocket (another brand's trademark)",
  "sabre-graffiti-jeans": "Rotary International emblem patch on the leg (another organisation's trademark)",
  "forest-splatter-hoodie": "California YMCA logo on the chest (another organisation's trademark)",
  "graffiti-distressed-hoodie": "Duplicate of graffiti-distressed-hoodie-heather-grey (same garment and photo)",
  "noirix-script-airbrush-hoodie-washed-grey": "NOIRIX script printed on the garment",
  "noirix-motors-pain-suffering-long-sleeve": "NOIRIX logo in the chest graphic, set in a copy of Harley-Davidson's bar-and-shield logo",
};

/**
 * Per-product fixes for rows the CSV leaves incomplete, keyed by handle:
 * a category when the Type is blank, a description when the body is empty.
 */
export const PRODUCT_OVERRIDES: Record<string, { category?: CategorySlug; description?: string }> = {
  "afterlife-fc-maroon-away-jersey": {
    category: "longsleeves",
    description:
      "White long-sleeve football jersey with a maroon portrait print sweeping across the body and sleeves, a Cyrillic chest graphic, contrast piping and a crew collar. Back shown in the second photo.",
  },
};

/**
 * Local photos that replace a product's CSV images, keyed by handle. Files
 * live in /public, e.g. a retouched or higher-resolution shot. The first
 * photo becomes the main image.
 */
export const IMAGE_OVERRIDES: Record<string, { src: string; alt?: string }[]> = {
  // Retouched 2026-11-06: white background, upscaled and sharpened.
  "angel-guitar-layered-zip-hoodie": [{ src: "/products/angel-guitar-layered-zip-hoodie/front.webp" }],
  // Added 2026-11-06 from product screenshots (price text cropped off, background cleaned).
  "spray-paint-jeans": [{ src: "/products/spray-paint-jeans/front.webp", alt: "Spray Paint Jeans" }],
  "rhinestone-jeans": [{ src: "/products/rhinestone-jeans/front.webp", alt: "Rhinestone Jeans, back view" }],
  "saints-leopard-jeans": [{ src: "/products/saints-leopard-jeans/front.webp", alt: "Saints Leopard Jeans" }],
  "camo-graffiti-jeans": [{ src: "/products/camo-graffiti-jeans/front.webp", alt: "Camo Graffiti Jeans" }],
  "text-graphic-jeans": [{ src: "/products/text-graphic-jeans/front.webp", alt: "Text Graphic Jeans, back view" }],
  "patchwork-jeans": [{ src: "/products/patchwork-jeans/front.webp", alt: "Patchwork Jeans" }],
  "blessed-script-tee": [{ src: "/products/blessed-script-tee/front.webp", alt: "Blessed Script Tee" }],
  "tulsa-sketch-tee": [{ src: "/products/tulsa-sketch-tee/front.webp", alt: "Tulsa Sketch Tee" }],
  "distressed-text-tee": [{ src: "/products/distressed-text-tee/front.webp", alt: "Distressed Text Tee" }],
  "distressed-symbol-tee": [{ src: "/products/distressed-symbol-tee/front.webp", alt: "Distressed Symbol Tee" }],
  "flag-raglan-ls": [{ src: "/products/flag-raglan-ls/front.webp", alt: "Flag Raglan LS" }],
  "sketch-collage-ls": [{ src: "/products/sketch-collage-ls/front.webp", alt: "Sketch Collage LS" }],
  "camo-text-ls": [{ src: "/products/camo-text-ls/front.webp", alt: "Camo Text LS" }],
  "union-distressed-ls": [{ src: "/products/union-distressed-ls/front.webp", alt: "Union Distressed LS" }],
  "graffiti-art-ls": [{ src: "/products/graffiti-art-ls/front.webp", alt: "Graffiti Art LS" }],
  "distressed-text-ls": [{ src: "/products/distressed-text-ls/front.webp", alt: "Distressed Text LS" }],
  "spike-orbit-ls": [{ src: "/products/spike-orbit-ls/front.webp", alt: "Spike Orbit LS" }],
  "camo-thermal-ls": [{ src: "/products/camo-thermal-ls/front.webp", alt: "Camo Thermal LS" }],
  "military-raglan-ls": [{ src: "/products/military-raglan-ls/front.webp", alt: "Military Raglan LS" }],
  // Added 2026-11-07 from product screenshots.
  "fangs-tee": [{ src: "/products/fangs-tee/front.webp", alt: "Fangs Tee" }],
  "star-arc-tee": [{ src: "/products/star-arc-tee/front.webp", alt: "Star Arc Tee" }],
  "cross-henley-ls": [{ src: "/products/cross-henley-ls/front.webp", alt: "Cross Henley Longsleeve" }],
  "star-camo-ls": [{ src: "/products/star-camo-ls/front.webp", alt: "Star Camo Longsleeve" }],
  "flag-camo-thermal": [{ src: "/products/flag-camo-thermal/front.webp", alt: "Flag Camo Thermal" }],
  "camo-script-raglan": [{ src: "/products/camo-script-raglan/front.webp", alt: "Camo Script Raglan" }],
  "script-oversized-ls": [{ src: "/products/script-oversized-ls/front.webp", alt: "Script Oversized Longsleeve" }],
  "pink-camo-thermal-ls": [{ src: "/products/pink-camo-thermal-ls/front.webp", alt: "Camo Thermal Longsleeve" }],
  "text-oversized-ls": [{ src: "/products/text-oversized-ls/front.webp", alt: "Text Oversized Longsleeve" }],
  "distressed-text-ls2": [{ src: "/products/distressed-text-ls2/front.webp", alt: "Distressed Text Longsleeve" }],
  "distressed-collage-ls": [{ src: "/products/distressed-collage-ls/front.webp", alt: "Distressed Collage Longsleeve" }],
  "gallery-sketch-ringer-tee": [{ src: "/products/gallery-sketch-ringer-tee/front.webp", alt: "Gallery Sketch Tee" }],
  "chrome-grill-tee": [{ src: "/products/chrome-grill-tee/front.webp", alt: "Chrome Grill Tee" }],
  "gallery-sketch-tee-cream": [{ src: "/products/gallery-sketch-tee-cream/front.webp", alt: "Gallery Sketch Tee Cream" }],
};

/**
 * Words removed from titles, descriptions and URL slugs (whole words, any
 * case). Products whose photos show these words are excluded above.
 */
export const BRAND_WORDS_TO_STRIP = ["noirix"];

/**
 * Sizes offered on every product, replacing whatever the CSV lists
 * (decided 2026-11-06). Set to null to use each CSV's own sizes again.
 */
export const SIZE_RUN: string[] | null = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

/** Shopify option names treated as size or colour. Any other option stops the import. */
export const SIZE_OPTION_NAMES = ["size"];
export const COLOR_OPTION_NAMES = ["color", "colour", "wash"];

/** Colour name used when a product has no colour option and none in its title. */
export const FALLBACK_COLOR_NAME = UNNAMED_COLOR;

/** Swatches for colour names (lower-case). Only shown when a product has 2+ colours. */
export const COLOR_SWATCHES: Record<string, string> = {
  "light wash": "#b9c6d2",
  "dark wash": "#2c3546",
  "washed grey": "#9a9894",
  "heather grey": "#a6a5a1",
  "washed black": "#2a2927",
  "baby blue": "#b5d1ea",
  sand: "#cbb9a0",
  cream: "#e6d9bf",
  "washed olive": "#5d5a3a",
  "olive / grey multi": "#6c6b56",
  "pink acid wash": "#d58a92",
  olive: "#5f6440",
  grey: "#6f6f6c",
  blue: "#3f5f8f",
  pink: "#d991ad",
  purple: "#6e5a8c",
  red: "#a8302f",
  black: "#262626",
  orange: "#d9772f",
  "teal python": "#2f6363",
  "washed tan": "#8a6f4a",
};
export const DEFAULT_SWATCH = "#bdb6ab";
