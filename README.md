# Bucke Clothing

Storefront for Bucke, premium streetwear. Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS v4 and Framer Motion. No backend yet: the catalogue lives in typed files and checkout is stubbed behind a single function.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script                 | What it does                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Dev server                                                         |
| `npm run build`        | Production build (all pages prerender statically)                  |
| `npm run lint`         | ESLint                                                             |
| `npm run typecheck`    | `tsc --noEmit`                                                     |
| `npm run import:products` | Rebuilds `src/data/products.ts` from the Shopify CSV exports in `/data` |
| `npm run placeholders` | Draws placeholder images for any product/lookbook image missing from `/public` |
| `npm run brand`        | Rebuilds the mark path data, `/public/buck-mark.svg`, `icon.svg` and `favicon.ico` from `/public/buck.svg` |

Scripts in `/scripts` run directly with Node's built-in TypeScript support (Node 22.18+), so there's no extra tooling.

## Deploying

Import the repo on Vercel. No configuration is needed. Optionally set `NEXT_PUBLIC_SITE_URL` (for example `https://buckeclothing.com`) so canonical URLs, the sitemap and Open Graph tags use your domain. Without it, Vercel's production URL is used.

## Project structure

```
src/
  app/                 Routes: home, /shop, /shop/[category], /product/[slug],
                       /lookbook, /about, /contact, 404, sitemap, robots, OG image
  components/
    brand/             Buck mark path data (generated) + React/OG renderers
    cart/              Bag store (localStorage), provider, drawer
    home/ shop/ product/ layout/ contact/ ui/
  data/                Typed catalogue: products, categories, lookbook, size guides
  lib/
    products.ts        Data layer: the ONLY module that reads /src/data
    checkout.ts        Checkout boundary (stubbed)
    newsletter.ts      Newsletter boundary (stubbed, logs)
    contact.ts         Contact boundary (stubbed, logs)
    filters.ts         Shop filter/sort logic and URL (de)serialisation
  types/               Domain types
scripts/               CSV product import, placeholder + brand asset generators
data/                  Shopify product-export CSVs (import source)
```

## Data layer

Components never import from `/src/data`. They call the async functions in `src/lib/products.ts` (`getProducts`, `getProduct`, `getProductsByCategory`, …). To move to a database or a commerce API, rewrite those function bodies and keep their signatures; nothing else changes. Each function is marked `"use cache"`, so a slow source still yields static, cached pages.

Categories: **Hoodies**, **Longsleeves**, **Shirts** and **Pants & Jeans** (`src/types/product.ts`, `src/data/categories.ts`). Each category tile uses its top-ranked product's photo.

## Importing products

The catalogue comes from Shopify product-export CSVs in `/data` (`1-hoodies.csv` to `10-more-longsleeves.csv`). The number prefix sets the order: earlier files rank first in "Featured" and win when the same handle appears twice, so give a new export the next number. To update it, replace or add CSVs there and run:

```bash
npm run import:products
```

`scripts/import-products.ts` reads every CSV in `/data`, imports each handle once, writes `src/data/products.ts` and prints a report of what it imported, excluded and defaulted. Its rules live in `scripts/import-config.ts`:

- **Type → category** (`TYPE_TO_CATEGORY`). A Type that is neither mapped nor excluded stops the import and writes nothing, so a new product type is never guessed into a category.
- **Excluded types** (`EXCLUDED_TYPES`): Shorts and Sets aren't stocked.
- **Excluded products** (`EXCLUDED_HANDLES`): duplicates and products whose photos show NOIRIX or another brand's logo on the garment. This was a visual review, so check new products' photos and add any branded ones here.
- **Brand words** (`BRAND_WORDS_TO_STRIP`): "NOIRIX" is removed from titles, descriptions and URL slugs.
- **Colours** come from a Color/Wash option, else from the title after "—" (e.g. "— Washed Grey"), else "As pictured", which is hidden in the UI. Swatches for multi-colour products are in `COLOR_SWATCHES`.
- - **Local photos** (`IMAGE_OVERRIDES`): swap a product's CSV photos for retouched files in `/public/products`.
- Inventory quantities are ignored until there is a backend. Products with no image get a local placeholder.

## Storefront settings and reviews

`src/data/storefront.ts` holds the copy, toggles and offers for the announcement bar and product page: rotating messages, the #1 badge (off until the claim is true), delivery estimate (processing + carrier transit days), accordion copy, payment marks, the sticky "Shop now" bar and per-product "See it in action" videos. Change a value there and the site follows.

Reviews live in `src/data/reviews.ts` and are read through `src/lib/reviews.ts`. Add real reviews (with customer photos in `/public/reviews/`), your Trustpilot profile link and, optionally, your overall TrustScore and total. Until there is at least one review, the homepage "See our reviews" section, the product page rating strip and the Customer Reviews carousel stay hidden. "Verified Buyer" shows only on reviews marked `verified`. To pull reviews live from Trustpilot, Judge.me or Loox, rewrite the functions in `src/lib/reviews.ts` and keep their signatures.

## Checkout

The bag drawer only knows about `CHECKOUT_ENABLED` and `startCheckout()` in `src/lib/checkout.ts`. To go live (Stripe Checkout, Shopify, …), implement `startCheckout` so it returns `{ status: "redirect", url }`, then flip `CHECKOUT_ENABLED` to `true`. It's a one-file change. The checkout button stays visibly disabled ("Coming soon") until then.

## Photography

Product photos are served from the store's Shopify CDN: the `Image Src` URLs in the CSVs, allowed in `next.config.ts` under `images.remotePatterns`. They are white-background product shots, so cards and galleries fit the whole garment on white instead of cropping it. The import records each photo's real dimensions, and the first photo becomes the product's Open Graph image.

Each product currently has one photo. Add more image rows for a handle in the CSV and they appear in the gallery; the second also shows on card hover.

Lookbook images (`/public/editorial/look-*.svg`) are still generated placeholders. To use real editorial photos, add them to `/public/editorial` and update `src/data/lookbook.ts`. `npm run placeholders` only creates missing files and never overwrites real photography.

## Logo

`/public/buck.svg` is the master mark: 8 named paths (nose, face, inner antlers, lower sweeps, outer tips). It is only used, inlined, as the homepage hero centrepiece. `/public/buck-mark.svg` is a simplified variant (antlers + nose, no face detail) for anything small: header, footer, favicon, apple icon and OG image. Both are generated into `src/components/brand/buck-paths.ts` by `npm run brand`. To change the logo, replace `/public/buck.svg` (keeping the path classes) and re-run it.

## Design tokens

Defined once in `src/app/globals.css` (`@theme`):

- Colors: `ink`, `bone`, `paper`, warm greys `grey-100…900`, and one accent, **Ember** (`accent`, plus `accent-light` for dark backgrounds). The default Tailwind palette is cleared, so only these exist.
- Type: Archivo (condensed width, 800) for display via the `type-display` utility; Geist for body; `type-label` for small caps-style labels.
- Contexts that can't read CSS variables (OG image, theme-color) use `src/lib/tokens.ts`.

## Motion and accessibility

- Hero intro runs once per browser session (decided before first paint): the 8 mark paths build in a 90ms cascade, then eyebrow, headline, CTA and the bottom row follow in strict sequence on one easing curve. Reduced motion renders the final state immediately.
- Scroll reveals never hide content that's already on screen, so there's no LCP penalty and nothing waits on JS.
- Page transitions use React `<ViewTransition>`; `prefers-reduced-motion` disables all of it.
- Sheets (bag, menu, filters, size guide) trap focus, close on Escape, make the page behind them inert and restore focus.

## Placeholder content to replace before launch

- Lookbook photography
- About page copy, size guide measurements (`src/data/size-guides.ts`), shipping copy
- Product details, materials and fit (not in the Shopify export; those sections are hidden until added)
- `site.email` and `site.instagram` in `src/lib/site.ts`
- Newsletter and contact form stubs (`src/lib/newsletter.ts`, `src/lib/contact.ts`) currently just log
