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
  "rhinestone-graphic-hoodie-sand": "Only photo shows the back of the hoodie; hidden until a front photo is added",
  "studded-cross-hoodie": "Only photo shows the back of the hoodie; hidden until a front photo is added",
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
/**
 * Local photos that replace a product's CSV images, keyed by handle.
 */
export const IMAGE_OVERRIDES: Record<string, { src: string; alt?: string }[]> = {
  "bandana-star-camo-hoodie": [{ src: "/products/bandana-star-camo-hoodie/front.webp", alt: "Bandana Star Camo Hoodie" }],
  "cross-long-sleeve-tee": [{ src: "/products/cross-long-sleeve-tee/front.webp", alt: "Cross Long Sleeve Tee" }],
  "1-800-bankroll-hotline-tee": [{ src: "/products/1-800-bankroll-hotline-tee/front.webp", alt: "1 800 Bankroll Hotline Tee" }],
  "bunny-alex-crystal-wash-jeans": [{ src: "/products/bunny-alex-crystal-wash-jeans/front.webp", alt: "Bunny Alex Crystal Wash Jeans" }],
  "airbrush-star-hoodie-washed-grey": [{ src: "/products/airbrush-star-hoodie-washed-grey/front.webp", alt: "Airbrush Star Hoodie Washed Grey" }],
  "bankroll-club-long-sleeve": [{ src: "/products/bankroll-club-long-sleeve/front.webp", alt: "Bankroll Club Long Sleeve" }],
  "bankroll-grill-tee": [{ src: "/products/bankroll-grill-tee/front.webp", alt: "Bankroll Grill Tee" }],
  "spray-paint-jeans": [{ src: "/products/spray-paint-jeans/front.webp", alt: "Spray Paint Jeans" }],
  "1-800-bankroll-zip-up-baby-blue": [{ src: "/products/1-800-bankroll-zip-up-baby-blue/front.webp", alt: "1 800 Bankroll Zip Up Baby Blue" }],
  "afterlife-fc-maroon-away-jersey": [{ src: "/products/afterlife-fc-maroon-away-jersey/front.webp", alt: "Afterlife Fc Maroon Away Jersey" }],
  "american-psycho-tee": [{ src: "/products/american-psycho-tee/front.webp", alt: "American Psycho Tee" }],
  "rhinestone-jeans": [{ src: "/products/rhinestone-jeans/front.webp", alt: "Rhinestone Jeans" }],
  "valley-zip-hoodie": [{ src: "/products/valley-zip-hoodie/front.webp", alt: "Valley Zip Hoodie" }],
  "camo-raglan": [{ src: "/products/camo-raglan/front.webp", alt: "Camo Raglan" }],
  "halo-rhinestone-tee-washed-grey": [{ src: "/products/halo-rhinestone-tee-washed-grey/front.webp", alt: "Halo Rhinestone Tee Washed Grey" }],
  "flame-denim-pink-acid-wash": [{ src: "/products/flame-denim-pink-acid-wash/front.webp", alt: "Flame Denim Pink Acid Wash" }],
  "bandana-patchwork-zip-hoodie": [{ src: "/products/bandana-patchwork-zip-hoodie/front.webp", alt: "Bandana Patchwork Zip Hoodie" }],
  "script-longsleeve": [{ src: "/products/script-longsleeve/front.webp", alt: "Script Longsleeve" }],
  "1-800-pinksex-tee": [{ src: "/products/1-800-pinksex-tee/front.webp", alt: "1 800 Pinksex Tee" }],
  "snake-denim-teal-python": [{ src: "/products/snake-denim-teal-python/front.webp", alt: "Snake Denim Teal Python" }],
  "graffiti-distressed-hoodie-heather-grey": [{ src: "/products/graffiti-distressed-hoodie-heather-grey/front.webp", alt: "Graffiti Distressed Hoodie Heather Grey" }],
  "flag-raglan-ls": [{ src: "/products/flag-raglan-ls/front.webp", alt: "Flag Raglan Ls" }],
  "summer-ballet-tee": [{ src: "/products/summer-ballet-tee/front.webp", alt: "Summer Ballet Tee" }],
  "saint-studded-denim-washed-tan": [{ src: "/products/saint-studded-denim-washed-tan/front.webp", alt: "Saint Studded Denim Washed Tan" }],
  "rhinestone-graphic-hoodie-sand": [{ src: "/products/rhinestone-graphic-hoodie-sand/front.webp", alt: "Rhinestone Graphic Hoodie Sand" }],
  "sketch-collage-ls": [{ src: "/products/sketch-collage-ls/front.webp", alt: "Sketch Collage Ls" }],
  "grill-tee": [{ src: "/products/grill-tee/front.webp", alt: "Grill Tee" }],
  "saint-faded-jeans": [{ src: "/products/saint-faded-jeans/front.webp", alt: "Saint Faded Jeans" }],
  "bandana-patchwork-zip-hoodie-olive-grey-multi": [{ src: "/products/bandana-patchwork-zip-hoodie-olive-grey-multi/front.webp", alt: "Bandana Patchwork Zip Hoodie Olive Grey Multi" }],
  "camo-text-ls": [{ src: "/products/camo-text-ls/front.webp", alt: "Camo Text Ls" }],
  "blessed-script-tee": [{ src: "/products/blessed-script-tee/front.webp", alt: "Blessed Script Tee" }],
  "ggg-patch-denim-jeans": [{ src: "/products/ggg-patch-denim-jeans/front.webp", alt: "Ggg Patch Denim Jeans" }],
  "cigarette-graphic-zip-hoodie-washed-olive": [{ src: "/products/cigarette-graphic-zip-hoodie-washed-olive/front.webp", alt: "Cigarette Graphic Zip Hoodie Washed Olive" }],
  "union-distressed-ls": [{ src: "/products/union-distressed-ls/front.webp", alt: "Union Distressed Ls" }],
  "tulsa-sketch-tee": [{ src: "/products/tulsa-sketch-tee/front.webp", alt: "Tulsa Sketch Tee" }],
  "embellished-cargo-denim": [{ src: "/products/embellished-cargo-denim/front.webp", alt: "Embellished Cargo Denim" }],
  "notebook-zip-hoodie": [{ src: "/products/notebook-zip-hoodie/front.webp", alt: "Notebook Zip Hoodie" }],
  "graffiti-art-ls": [{ src: "/products/graffiti-art-ls/front.webp", alt: "Graffiti Art Ls" }],
  "distressed-text-tee": [{ src: "/products/distressed-text-tee/front.webp", alt: "Distressed Text Tee" }],
  "painters-cargo-pants": [{ src: "/products/painters-cargo-pants/front.webp", alt: "Painters Cargo Pants" }],
  "star-applique-zip-hoodie-cream": [{ src: "/products/star-applique-zip-hoodie-cream/front.webp", alt: "Star Applique Zip Hoodie Cream" }],
  "distressed-text-ls": [{ src: "/products/distressed-text-ls/front.webp", alt: "Distressed Text Ls" }],
  "distressed-symbol-tee": [{ src: "/products/distressed-symbol-tee/front.webp", alt: "Distressed Symbol Tee" }],
  "saints-leopard-jeans": [{ src: "/products/saints-leopard-jeans/front.webp", alt: "Saints Leopard Jeans" }],
  "painted-faces-hoodie-washed-black": [{ src: "/products/painted-faces-hoodie-washed-black/front.webp", alt: "Painted Faces Hoodie Washed Black" }],
  "spike-orbit-ls": [{ src: "/products/spike-orbit-ls/front.webp", alt: "Spike Orbit Ls" }],
  "fangs-tee": [{ src: "/products/fangs-tee/front.webp", alt: "Fangs Tee" }],
  "camo-graffiti-jeans": [{ src: "/products/camo-graffiti-jeans/front.webp", alt: "Camo Graffiti Jeans" }],
  "camo-graffiti-zip-hoodie": [{ src: "/products/camo-graffiti-zip-hoodie/front.webp", alt: "Camo Graffiti Zip Hoodie" }],
  "camo-thermal-ls": [{ src: "/products/camo-thermal-ls/front.webp", alt: "Camo Thermal Ls" }],
  "star-arc-tee": [{ src: "/products/star-arc-tee/front.webp", alt: "Star Arc Tee" }],
  "text-graphic-jeans": [{ src: "/products/text-graphic-jeans/front.webp", alt: "Text Graphic Jeans" }],
  "nakamoto-rhinestone-sweatshirt": [{ src: "/products/nakamoto-rhinestone-sweatshirt/front.webp", alt: "Nakamoto Rhinestone Sweatshirt" }],
  "military-raglan-ls": [{ src: "/products/military-raglan-ls/front.webp", alt: "Military Raglan Ls" }],
  "gallery-sketch-ringer-tee": [{ src: "/products/gallery-sketch-ringer-tee/front.webp", alt: "Gallery Sketch Ringer Tee" }],
  "patchwork-jeans": [{ src: "/products/patchwork-jeans/front.webp", alt: "Patchwork Jeans" }],
  "paint-splatter-hoodie": [{ src: "/products/paint-splatter-hoodie/front.webp", alt: "Paint Splatter Hoodie" }],
  "cross-henley-ls": [{ src: "/products/cross-henley-ls/front.webp", alt: "Cross Henley Ls" }],
  "chrome-grill-tee": [{ src: "/products/chrome-grill-tee/front.webp", alt: "Chrome Grill Tee" }],
  "distressed-baggy-jeans": [{ src: "/products/distressed-baggy-jeans/front.webp", alt: "Distressed Baggy Jeans" }],
  "apocalypse-graphic-zip-hoodie": [{ src: "/products/apocalypse-graphic-zip-hoodie/front.webp", alt: "Apocalypse Graphic Zip Hoodie" }],
  "star-camo-ls": [{ src: "/products/star-camo-ls/front.webp", alt: "Star Camo Ls" }],
  "gallery-sketch-tee-cream": [{ src: "/products/gallery-sketch-tee-cream/front.webp", alt: "Gallery Sketch Tee Cream" }],
  "patchwork-jeans-light-blue": [{ src: "/products/patchwork-jeans-light-blue/front.webp", alt: "Patchwork Jeans Light Blue" }],
  "gem-sleeve-zip-hoodie": [{ src: "/products/gem-sleeve-zip-hoodie/front.webp", alt: "Gem Sleeve Zip Hoodie" }],
  "flag-camo-thermal": [{ src: "/products/flag-camo-thermal/front.webp", alt: "Flag Camo Thermal" }],
  "porsche-text-tee": [{ src: "/products/porsche-text-tee/front.webp", alt: "Porsche Text Tee" }],
  "floral-pocket-jeans": [{ src: "/products/floral-pocket-jeans/front.webp", alt: "Floral Pocket Jeans" }],
  "camo-14-zip-hoodie": [{ src: "/products/camo-14-zip-hoodie/front.webp", alt: "Camo 14 Zip Hoodie" }],
  "camo-script-raglan": [{ src: "/products/camo-script-raglan/front.webp", alt: "Camo Script Raglan" }],
  "guardian-angel-tee": [{ src: "/products/guardian-angel-tee/front.webp", alt: "Guardian Angel Tee" }],
  "faded-baggy-jeans": [{ src: "/products/faded-baggy-jeans/front.webp", alt: "Faded Baggy Jeans" }],
  "sketch-graphic-hoodie": [{ src: "/products/sketch-graphic-hoodie/front.webp", alt: "Sketch Graphic Hoodie" }],
  "script-oversized-ls": [{ src: "/products/script-oversized-ls/front.webp", alt: "Script Oversized Ls" }],
  "pure-love-graphic-tee": [{ src: "/products/pure-love-graphic-tee/front.webp", alt: "Pure Love Graphic Tee" }],
  "cargo-baggy-jeans": [{ src: "/products/cargo-baggy-jeans/front.webp", alt: "Cargo Baggy Jeans" }],
  "studded-cross-hoodie": [{ src: "/products/studded-cross-hoodie/front.webp", alt: "Studded Cross Hoodie" }],
  "pink-camo-thermal-ls": [{ src: "/products/pink-camo-thermal-ls/front.webp", alt: "Pink Camo Thermal Ls" }],
  "chrow-text-tee": [{ src: "/products/chrow-text-tee/front.webp", alt: "Chrow Text Tee" }],
  "tiger-embroidery-jeans": [{ src: "/products/tiger-embroidery-jeans/front.webp", alt: "Tiger Embroidery Jeans" }],
  "pink-star-stud-zip-hoodie": [{ src: "/products/pink-star-stud-zip-hoodie/front.webp", alt: "Pink Star Stud Zip Hoodie" }],
  "text-oversized-ls": [{ src: "/products/text-oversized-ls/front.webp", alt: "Text Oversized Ls" }],
  "rhinestone-wash-jeans": [{ src: "/products/rhinestone-wash-jeans/front.webp", alt: "Rhinestone Wash Jeans" }],
  "camo-stud-cross-zip-hoodie": [{ src: "/products/camo-stud-cross-zip-hoodie/front.webp", alt: "Camo Stud Cross Zip Hoodie" }],
  "distressed-text-ls-white": [{ src: "/products/distressed-text-ls-white/front.webp", alt: "Distressed Text Ls White" }],
  "camo-baggy-jeans": [{ src: "/products/camo-baggy-jeans/front.webp", alt: "Camo Baggy Jeans" }],
  "embellished-denim-bomber": [{ src: "/products/embellished-denim-bomber/front.webp", alt: "Embellished Denim Bomber" }],
  "distressed-collage-ls": [{ src: "/products/distressed-collage-ls/front.webp", alt: "Distressed Collage Ls" }],
  "saint-los-santos-zip-hoodie-washed-navy": [{ src: "/products/saint-los-santos-zip-hoodie-washed-navy/front.webp", alt: "Saint Los Santos Zip Hoodie Washed Navy" }],
  "beaded-workwear-zip-hoodie-washed-brown": [{ src: "/products/beaded-workwear-zip-hoodie-washed-brown/front.webp", alt: "Beaded Workwear Zip Hoodie Washed Brown" }],
  "orbit-patchwork-zip-hoodie-washed-red": [{ src: "/products/orbit-patchwork-zip-hoodie-washed-red/front.webp", alt: "Orbit Patchwork Zip Hoodie Washed Red" }],
  "salvage-patch-zip-hoodie-washed-olive": [{ src: "/products/salvage-patch-zip-hoodie-washed-olive/front.webp", alt: "Salvage Patch Zip Hoodie Washed Olive" }],
  "fade-core-zip-hoodie-washed-burgundy": [{ src: "/products/fade-core-zip-hoodie-washed-burgundy/front.webp", alt: "Fade Core Zip Hoodie Washed Burgundy" }],
  "drift-panel-zip-hoodie-washed-charcoal": [{ src: "/products/drift-panel-zip-hoodie-washed-charcoal/front.webp", alt: "Drift Panel Zip Hoodie Washed Charcoal" }],
  "akira-winners-club-hoodie": [{ src: "/products/akira-winners-club-hoodie/front.webp", alt: "Akira Winners Club Hoodie" }],
  "chaotic-athletics-hoodie": [{ src: "/products/chaotic-athletics-hoodie/front.webp", alt: "Chaotic Athletics Hoodie" }],
  "make-art-hoodie": [{ src: "/products/make-art-hoodie/front.webp", alt: "Make Art Hoodie" }],
  "i-love-ldn-hoodie": [{ src: "/products/i-love-ldn-hoodie/front.webp", alt: "I Love Ldn Hoodie" }],
  "swag-face-hoodie": [{ src: "/products/swag-face-hoodie/front.webp", alt: "Swag Face Hoodie" }],
  "camo-zip-hoodie-pink-hood": [{ src: "/products/camo-zip-hoodie-pink-hood/front.webp", alt: "Camo Zip Hoodie Pink Hood" }],
  "cloud-camo-zip-hoodie": [{ src: "/products/cloud-camo-zip-hoodie/front.webp", alt: "Cloud Camo Zip Hoodie" }],
  "faded-red-zip-hoodie": [
    { src: "/products/faded-red-zip-hoodie/front.webp", alt: "Faded Red Zip Hoodie, front" },
    { src: "/products/faded-red-zip-hoodie/back.webp", alt: "Faded Red Zip Hoodie, back" },
  ],
  "i-am-grateful-hoodie": [
    { src: "/products/i-am-grateful-hoodie/front.webp", alt: "I Am Grateful Hoodie, front" },
    { src: "/products/i-am-grateful-hoodie/back.webp", alt: "I Am Grateful Hoodie, back" },
  ],
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
