# Product images

Product photos are served from the store's Shopify CDN (the `Image Src` URLs in the CSVs in `/data`).

This folder holds local product photos set in `IMAGE_OVERRIDES` (scripts/import-config.ts), such as
retouched shots (`<product-slug>/front.webp`), and generated placeholders for products whose CSV rows have no image
(`<product-slug>/<color-slug>-1.svg`, 4:5). Add an image URL to the CSV and re-run
`npm run import:products`; the placeholder is no longer referenced and can be deleted.
