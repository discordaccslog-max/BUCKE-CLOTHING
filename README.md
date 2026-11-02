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
scripts/               Placeholder + brand asset generators (CSV import coming)
```

## Data layer

Components never import from `/src/data`. They call the async functions in `src/lib/products.ts` (`getProducts`, `getProduct`, `getProductsByCategory`, …). To move to a database or a commerce API, rewrite those function bodies and keep their signatures; nothing else changes. Each function is marked `"use cache"`, so a slow source still yields static, cached pages.

Categories are fixed to **Hoodies**, **Longsleeves** and **Pants & Jeans** (`src/types/product.ts`).

**Product data is placeholder right now.** `src/data/products.ts` holds 12 seed products so the site could be built and reviewed. It will be replaced by `scripts/import-products.ts`, which generates it from `/data/products.csv`.

## Checkout

The bag drawer only knows about `CHECKOUT_ENABLED` and `startCheckout()` in `src/lib/checkout.ts`. To go live (Stripe Checkout, Shopify, …), implement `startCheckout` so it returns `{ status: "redirect", url }`, then flip `CHECKOUT_ENABLED` to `true`. It's a one-file change. The checkout button stays visibly disabled ("Coming soon") until then.

## Swapping in real photography

All current imagery is generated placeholder SVG (studio-style blocks with garment silhouettes) at the correct aspect ratios:

- Products: `/public/products/<product-slug>/<color-slug>-<n>.svg`, 4:5 (1600×2000). Image 1 is the front shot used on cards; image 2 shows on hover.
- Categories: `/public/editorial/category-<slug>.svg`, 4:5
- Lookbook: `/public/editorial/look-<id>.svg` (2:3, 3:2 or 1:1)

To use real photos:

1. Export JPG/PNG/WebP at the same aspect ratio, ideally at least 1600px on the long edge. `next/image` generates the responsive AVIF/WebP sizes.
2. Put them in the same folder (for example `/public/products/antler-heavyweight-hoodie/washed-black-1.jpg`).
3. Update the `src`, `width` and `height` in the data (or the CSV once the import exists). Placeholder SVGs that are no longer referenced can be deleted.

`npm run placeholders` only creates files that are missing and never overwrites real photography. Real photos also become the product's Open Graph image automatically (SVG placeholders fall back to the site OG image).

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

- Product catalogue (pending the CSV import)
- About page copy, lookbook captions, size guide measurements (`src/data/size-guides.ts`), shipping copy
- `site.email` and `site.instagram` in `src/lib/site.ts`
- Newsletter and contact form stubs (`src/lib/newsletter.ts`, `src/lib/contact.ts`) currently just log
