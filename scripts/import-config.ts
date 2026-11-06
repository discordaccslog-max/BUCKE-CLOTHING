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
  "forest-splatter-hoodie": "California YMCA logo on the chest (another organisation's trademark)",
  "graffiti-distressed-hoodie": "Duplicate of graffiti-distressed-hoodie-heather-grey (same garment and photo)",
  "noirix-script-airbrush-hoodie-washed-grey": "NOIRIX script printed on the garment",
  "noirix-motors-pain-suffering-long-sleeve": "NOIRIX logo in the chest graphic",
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
};

/**
 * Words removed from titles, descriptions and URL slugs (whole words, any
 * case). Products whose photos show these words are excluded above.
 */
export const BRAND_WORDS_TO_STRIP = ["noirix"];

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
