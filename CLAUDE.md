@AGENTS.md

# Bucke Clothing — project notes

Storefront for Bucke, a streetwear brand. Next.js 16.4 (App Router, Cache Components, `partialPrefetching`), React 19.3, TypeScript, Tailwind CSS v4, Framer Motion. No backend: the catalogue is typed files, and checkout, newsletter and contact are stubs. README.md has the full tour; this file is the short version plus standing rules.

Next.js 16 differs from older versions. Read `node_modules/next/dist/docs/` before writing Next code (see AGENTS.md).

## Commands

- `npm run dev` / `build` / `lint` / `typecheck`
- `npm run import:products`: regenerates `src/data/products.ts` from the CSVs in `/data`
- `npm run placeholders`: draws placeholder images for any product/lookbook image that's missing (never overwrites)
- `npm run featured-look`: rebuilds the homepage featured-look images
- `npm run brand`: rebuilds logo paths, `buck-mark.svg`, icons
- Scripts in `/scripts` run on Node's built-in TypeScript support (Node ≥ 22.18). `scripts/enhance.cjs` is the exception (CommonJS, run with `node scripts/enhance.cjs <src> <dst>`).

## Structure

- `src/app/`: routes. Home, `/shop`, `/shop/[category]`, `/product/[slug]`, `/lookbook`, `/about`, `/contact`, sitemap, robots, OG image.
- `src/components/`: `home/`, `shop/`, `product/`, `cart/`, `layout/`, `reviews/`, `ui/`, `brand/`, `commerce/`, `contact/`.
- `src/data/`: catalogue (`products.ts`, `categories.ts`, `lookbook.ts`, `size-guides.ts`, `reviews.ts`, `storefront.ts`).
- `src/lib/products.ts` is the **only** module that reads `src/data`. Components call its async `"use cache"` functions (`getProducts`, `getProduct`, `getProductsByCategory`, …), never the data files.
- `src/types/product.ts`: domain types. Prices are in cents (USD). Categories are `hoodies`, `longsleeves`, `shirts`, `pants-jeans`.

## Product data

- Source of truth: Shopify product-export CSVs in `/data` (`1-hoodies.csv` … `20-new-hoodies.csv`). The number prefix sets "Featured" order, and an earlier file wins when the same handle appears twice. Give a new export the next number.
- `src/data/products.ts` is **generated**. Don't hand-edit it; change the CSVs or `scripts/import-config.ts` and run `npm run import:products`. It currently holds 101 products.
- `scripts/import-config.ts` holds the import rules: `TYPE_TO_CATEGORY` (an unmapped Type stops the import), `EXCLUDED_TYPES` (Shorts, Sets), `EXCLUDED_HANDLES` (duplicates and garments showing another brand's logo, with a reason for each), `BRAND_WORDS_TO_STRIP` ("NOIRIX" is removed from titles, descriptions and slugs), `COLOR_SWATCHES`, `IMAGE_OVERRIDES`.
- `data/product-copy.json`: rewritten name, description and price per slug.
- The product slug is the CSV handle, which can differ from the display name. For example, "Graffiti Distressed Hoodie" is `graffiti-distressed-hoodie-heather-grey`, and the plain `graffiti-distressed-hoodie` handle is excluded as a duplicate. Similar names are separate products: `rhinestone-jeans` (dark indigo, rhinestone back pocket) ≠ `rhinestone-wash-jeans` (grey acid wash, rhinestones all over). Check by slug and description, not by filename or a loose name match.

## Product images

- Location and naming: `public/products/<product-slug>/front.webp`, 1200×1200, white background, garment front view. Placeholders for products with no photo are `public/products/<slug>/<color-slug>-1.svg`.
- **Almost every product has exactly one photo: the front.** The exceptions are `faded-red-zip-hoodie` and `i-am-grateful-hoodie`, which also have `back.webp` as a second image. There are no side or detail shots in the repo.
- Every product is wired to its local photo through `IMAGE_OVERRIDES` in `scripts/import-config.ts`. README.md, `public/products/README.md` and `next.config.ts` say photos come from the Shopify CDN, but `src/data/products.ts` currently references only local `/products/...` paths. The CDN `remotePatterns` entry is still there for CSV image URLs.
- To add a photo: run `node scripts/enhance.cjs <src> public/products/<slug>/front.webp` (resizes to 1200×1200, contain fit on white, WebP q90). Then add or confirm the `IMAGE_OVERRIDES` entry and run `npm run import:products`. Extra image rows give a gallery, and the second image shows on card hover.
- Editorial: `public/editorial/`. `featured-look.png` (transparent cutout) builds `featured-look-{600,900,1345}.{webp,avif}`. `look-*.svg` are lookbook placeholders, wired in `src/data/lookbook.ts`.
- "See it in action" product videos: `actionVideos` in `src/data/storefront.ts`, keyed by product slug, each with `{ src, poster (9:16), alt }`. Currently empty. Put files under `/public/videos/`.

## Image optimization

- `next.config.ts`: `images.formats: ["image/avif", "image/webp"]`, plus a remote pattern for the store's Shopify CDN path.
- Every `<Image>` passes an explicit `sizes` (e.g. `RAIL_SIZES`, `MAIN_SIZES`, `"96px"` thumbnails). Product shots use `object-contain` on white, never cropped.
- The featured look is the exception: it's `unoptimized` and uses a hand-built `<picture>` with AVIF/WebP `srcSet`s from `npm run featured-look`.
- `sharp` is a dev dependency used by the image scripts.

## Design tokens

- Defined once in `@theme` in `src/app/globals.css`. The default Tailwind palette is cleared (`--color-*: initial`), so only these colors exist: `white`, `black`, `ink` #0e0e0d, `bone` #f3f0ea, `paper` #faf8f4, warm greys `grey-100…900`, the single accent **Ember** `accent` #9a4a2e / `accent-light` #c9774f (for use on ink), and commerce-only `gold`, `shoppay`, `trustpilot`.
- Type: Archivo display (condensed, 800) via `type-display`, using the `text-display-{md,lg,xl,2xl}` fluid sizes; Geist for body; `type-label` for labels. Tracking tokens are `display` and `label`.
- Easing: `ease-out-expo`, `ease-editorial`. Animations: `rise`, `fade`, `lift`.
- Custom variants: `hero-top` (transparent header over the hero), `surface-white` (pages on pure white).
- Contexts that can't read CSS variables (OG image, theme-color) use `src/lib/tokens.ts`. Keep it in sync with `globals.css`.

## Content goal: faceless only

All product videos and images for this site are **faceless**: no presenters, no visible faces, no scripts, no voiceover, no talking to camera. Hands partly in frame are fine.

- **Video:** use Seedance (`seedance_2_5`, or `seedance_2_0` for 4K) or Kling (`kling3_0`). Do **not** use Marketing Studio's UGC modes (`marketing_studio_video` with `ugc`, `ugc_how_to`, `ugc_unboxing`, etc.). They rewrite the prompt into a talking-head ad with a scripted line and turn audio on even when `generate_audio=false` was sent (seen on job `e8b38658`, 2026-11-09).
- **Images:** use Nano Banana Pro (CLI id `nano_banana_2`, which is an alias for Nano Banana Pro; `nano_banana_flash` is the different Nano Banana 2).
- **Silent by default:** Seedance defaults to `generate_audio=true`. Always pass `--generate_audio false`. After submitting, check the saved job (`higgsfield generate get <id> --json`) to confirm `generate_audio` is `false`, and check the output file has no audio track before calling it silent.

## Image generation rules

Standing rules for the Higgsfield skills:

- When a reference image shows a garment, don't name the garment type in the prompt. Describe what to preserve instead: cut, sleeve length, neckline, colors, wash, graphic placement. Naming the type makes the model invent a different garment.
- Campaign, hero and lookbook shots: creative interpretation is fine.
- Product page images: these need to match the real product, since customers buy from them. Keep graphics and text accurate to the reference.
- Generate one test image before any batch and show it to the user.
- After a batch, assemble a contact sheet for review.
- Run `higgsfield generate cost` before a batch and tell the user the total.
- CLI and MCP generations consume credits even for models marked unlimited on the web plan, so prefer the web app for experimentation.
- Model choices: Soul 2.0 for casting, Nano Banana Pro for garment-on-model and face consistency, Seedance 2.0 for image-to-video. For this site's faceless content, the "Content goal" section above takes precedence: Nano Banana Pro for images, Seedance or Kling for video, no presenters.

Practical notes:

- Before using a product photo as a reference, find it by slug in `public/products/`, open it, and confirm it matches the product's description in `data/product-copy.json`. Show it to the user before spending credits.
- Only the front of each product is photographed (apart from the two hoodies above). Don't prompt for backs, back pockets or other angles that aren't in the reference, or the model will invent them. Ask for more photos instead.
- Small handwritten or printed text on garments tends to blur or garble in 720p motion. Check it closely before using a clip on a product page.
