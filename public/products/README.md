# Product images

Everything in this folder is currently a generated placeholder (`npm run placeholders`).

Layout: `<product-slug>/<color-slug>-<n>.<ext>`, aspect ratio 4:5 (for example 1600×2000).
Image 1 is the front shot (cards and the first gallery slide), image 2 shows on card hover, and the rest appear in the product gallery.

To swap in real photography, drop the photo in the same folder and point the product data at it
(update `src`, `width` and `height`). See "Swapping in real photography" in the root README.
The placeholder generator never overwrites real photos.
