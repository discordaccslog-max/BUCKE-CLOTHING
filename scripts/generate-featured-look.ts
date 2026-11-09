/**
 * Builds the homepage featured-look images from the full-res cutout at
 * public/editorial/featured-look.png. Run after replacing that file:
 *
 *   npm run featured-look
 *
 * Writes public/editorial/featured-look-{600,900,1345}.{webp,avif}, keeping
 * the transparent background.
 */
import { join } from "node:path";
import sharp from "sharp";

const root = join(import.meta.dirname, "..");
const source = join(root, "public/editorial/featured-look.png");
const WIDTHS = [600, 900, 1345] as const;

const { width } = await sharp(source).metadata();

for (const w of WIDTHS) {
  const base = sharp(source).resize({ width: Math.min(w, width ?? w), kernel: "lanczos3" });
  await base.clone().webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(join(root, `public/editorial/featured-look-${w}.webp`));
  await base.clone().avif({ quality: 62, effort: 6 }).toFile(join(root, `public/editorial/featured-look-${w}.avif`));
  console.log(`featured-look-${w}.webp / .avif`);
}
