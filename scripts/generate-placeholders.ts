/**
 * Generates placeholder imagery for any product or lookbook image
 * that doesn't exist yet in /public.
 *
 *   npm run placeholders            # fill in missing images only
 *   npm run placeholders -- --force # also redraw existing placeholders
 *
 * Real photography is never overwritten (see scripts/lib/placeholders.ts).
 */
import { join } from "node:path";
import { lookbook } from "../src/data/lookbook.ts";
import { products } from "../src/data/products.ts";
import { generatePlaceholders } from "./lib/placeholders.ts";

const report = generatePlaceholders({
  publicDir: join(import.meta.dirname, "..", "public"),
  products,
  lookbook,
  force: process.argv.includes("--force"),
});

console.log(`Placeholders written: ${report.written.length}, skipped (already present): ${report.skipped.length}`);
