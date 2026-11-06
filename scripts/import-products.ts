/**
 * Imports the catalogue from Shopify product-export CSVs in /data into
 * src/data/products.ts. Re-run whenever the CSVs change:
 *
 *   npm run import:products
 *
 * - Reads every *.csv in /data; a handle that appears in more than one file
 *   is imported once.
 * - Maps Shopify "Type" to a category via scripts/import-config.ts. An
 *   unmapped type stops the import (nothing is written) rather than guessing.
 * - Missing colours, images or sizes get a sensible default and are listed
 *   in the report. Products without an image get a local placeholder.
 * - Fetches each image once to record its real dimensions. If an image can't
 *   be fetched (offline), the size from the previous import is reused.
 * - IMAGE_OVERRIDES swaps a product's CSV photos for local files in /public.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { lookbook } from "../src/data/lookbook.ts";
import type { CategorySlug, Product, ProductColor, ProductImage } from "../src/types/product.ts";
import {
  BRAND_WORDS_TO_STRIP,
  COLOR_OPTION_NAMES,
  COLOR_SWATCHES,
  DEFAULT_SWATCH,
  EXCLUDED_HANDLES,
  EXCLUDED_TYPES,
  FALLBACK_COLOR_NAME,
  IMAGE_OVERRIDES,
  SIZE_OPTION_NAMES,
  TYPE_TO_CATEGORY,
} from "./import-config.ts";
import { parseCsv } from "./lib/csv.ts";
import { generatePlaceholders } from "./lib/placeholders.ts";

const ROOT = join(import.meta.dirname, "..");
const DATA_DIR = join(ROOT, "data");
const OUT_FILE = join(ROOT, "src/data/products.ts");
const CATEGORY_ORDER: CategorySlug[] = ["hoodies", "longsleeves", "shirts", "pants-jeans"];

type Row = Record<string, string>;

interface Group {
  handle: string;
  file: string;
  rows: Row[];
}

const flags: string[] = [];
const excluded: string[] = [];
const flag = (handle: string, msg: string) => flags.push(`${handle}: ${msg}`);

/* ---------- helpers ---------- */
const brandRe = new RegExp(`\\b(${BRAND_WORDS_TO_STRIP.join("|")})\\b`, "gi");

function stripBrand(text: string): string {
  return text
    .replace(brandRe, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s\-—–:,]+|[\s\-—–:,]+$/g, "")
    .trim();
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugFromHandle(handle: string): string {
  const brand = new Set(BRAND_WORDS_TO_STRIP.map((w) => w.toLowerCase()));
  return handle
    .split("-")
    .filter((t) => !brand.has(t))
    .join("-");
}

function unique<T>(list: T[]): T[] {
  return [...new Set(list)];
}

/** Sizes recorded by the previous import, used when an image can't be fetched. */
const previousSizes = new Map<string, { width: number; height: number }>();
if (existsSync(OUT_FILE)) {
  try {
    const { products: previous } = (await import(pathToFileURL(OUT_FILE).href)) as { products: Product[] };
    for (const img of previous.flatMap((p) => p.colors.flatMap((c) => c.images))) {
      previousSizes.set(img.src, { width: img.width, height: img.height });
    }
  } catch {
    // No usable previous import; sizes are fetched or defaulted.
  }
}

async function imageSize(src: string): Promise<{ width: number; height: number } | null> {
  try {
    const buffer = src.startsWith("/")
      ? readFileSync(join(ROOT, "public", src))
      : await fetch(src).then(async (res) => (res.ok ? Buffer.from(await res.arrayBuffer()) : null));
    if (buffer) {
      const meta = await sharp(buffer).metadata();
      if (meta.width && meta.height) return { width: meta.width, height: meta.height };
    }
  } catch {
    // Fall through to the previous import's size.
  }
  return previousSizes.get(src) ?? null;
}

/* ---------- 1. read and group ---------- */
const files = readdirSync(DATA_DIR)
  .filter((f) => f.toLowerCase().endsWith(".csv"))
  .sort();
if (files.length === 0) {
  console.error("No CSV files found in /data.");
  process.exit(1);
}

const groups = new Map<string, Group>();
let totalRows = 0;
for (const file of files) {
  const rows = parseCsv(readFileSync(join(DATA_DIR, file), "utf8"));
  totalRows += rows.length;
  const seenHere = new Set<string>();
  for (const row of rows) {
    const handle = row["Handle"];
    if (!handle) continue;
    const existing = groups.get(handle);
    if (existing && existing.file !== file) {
      if (!seenHere.has(handle)) flag(handle, `also in ${file}; imported once from ${existing.file}`);
      seenHere.add(handle);
      continue;
    }
    if (!existing) groups.set(handle, { handle, file, rows: [] });
    groups.get(handle)!.rows.push(row);
  }
}

/* ---------- 2. validate (stop on anything unmapped) ---------- */
const unmapped: string[] = [];
const badOptions: string[] = [];
const toImport: Group[] = [];

for (const g of groups.values()) {
  const head = g.rows[0];
  const type = head["Type"];
  if (EXCLUDED_HANDLES[g.handle]) {
    excluded.push(`${head["Title"]} (${g.handle}): ${EXCLUDED_HANDLES[g.handle]}`);
    continue;
  }
  if (EXCLUDED_TYPES[type]) {
    excluded.push(`${head["Title"]} (${g.handle}): type "${type}", ${EXCLUDED_TYPES[type]}`);
    continue;
  }
  if (!TYPE_TO_CATEGORY[type]) {
    unmapped.push(`  "${type || "(blank)"}"  ${head["Title"]} [${g.handle}, ${g.file}]`);
    continue;
  }
  for (const n of [1, 2, 3]) {
    const name = head[`Option${n} Name`]?.toLowerCase();
    if (name && !SIZE_OPTION_NAMES.includes(name) && !COLOR_OPTION_NAMES.includes(name)) {
      badOptions.push(`  "${head[`Option${n} Name`]}"  ${head["Title"]} [${g.handle}]`);
    }
  }
  toImport.push(g);
}

if (unmapped.length || badOptions.length) {
  if (unmapped.length) {
    console.error("\nStopped: these product types don't map to a Bucke category.");
    console.error("Add them to TYPE_TO_CATEGORY or EXCLUDED_TYPES in scripts/import-config.ts:\n");
    console.error(unmapped.join("\n"));
  }
  if (badOptions.length) {
    console.error("\nStopped: these products use options other than size or colour:\n");
    console.error(badOptions.join("\n"));
  }
  console.error("\nNothing was written.");
  process.exit(1);
}

/* ---------- 3. build products ---------- */
const built: Omit<Product, "featuredRank">[] = [];
const today = new Date().toISOString().slice(0, 10);

for (const g of toImport) {
  const head = g.rows[0];
  const category = TYPE_TO_CATEGORY[head["Type"]];
  const slug = slugFromHandle(g.handle);
  const cleanTitle = stripBrand(head["Title"]);
  const [name, titleColor] = cleanTitle.split(/\s+[—–]\s+/);

  // Options
  const optionIndex = (names: string[]) =>
    [1, 2, 3].find((n) => names.includes(head[`Option${n} Name`]?.toLowerCase() ?? ""));
  const sizeOpt = optionIndex(SIZE_OPTION_NAMES);
  const colorOpt = optionIndex(COLOR_OPTION_NAMES);

  let sizes = sizeOpt ? unique(g.rows.map((r) => r[`Option${sizeOpt} Value`]).filter(Boolean)) : [];
  if (sizes.length === 0) {
    sizes = ["One Size"];
    flag(g.handle, 'no sizes; defaulted to "One Size"');
  }

  let colorNames: string[];
  if (colorOpt) {
    const optName = head[`Option${colorOpt} Name`];
    colorNames = unique(g.rows.map((r) => r[`Option${colorOpt} Value`]).filter(Boolean)).map((v) =>
      optName.toLowerCase() === "wash" && !/wash/i.test(v) ? `${v} Wash` : v,
    );
  } else if (titleColor) {
    colorNames = [titleColor];
  } else {
    colorNames = [FALLBACK_COLOR_NAME];
    flag(g.handle, `no colour in the CSV or title; shown as "${FALLBACK_COLOR_NAME}"`);
  }

  // Images: every row may carry one; sort by position, drop the cache-busting query.
  const rawImages = g.rows
    .filter((r) => r["Image Src"])
    .map((r) => ({ url: r["Image Src"], position: Number(r["Image Position"] || 99), alt: r["Image Alt Text"] }))
    .sort((a, b) => a.position - b.position);
  const versionStamp = Number(new URL(rawImages[0]?.url ?? "https://x.invalid").searchParams.get("v"));
  const override = IMAGE_OVERRIDES[g.handle];
  if (override) flag(g.handle, `using ${override.length} local photo(s) instead of the CSV images`);
  const imageUrls = override ? override.map((o) => o.src) : unique(rawImages.map((i) => i.url.split("?")[0]));

  let images: ProductImage[];
  if (imageUrls.length === 0) {
    flag(g.handle, "no image; generated a placeholder");
    images = [];
  } else {
    images = [];
    for (const [i, url] of imageUrls.entries()) {
      const size = await imageSize(url);
      if (!size) flag(g.handle, `couldn't read image ${url}; assumed 1000×1000`);
      const alt =
        override?.[i]?.alt || stripBrand(rawImages[i]?.alt || "") || `${name}${titleColor ? `, ${titleColor}` : ""}`;
      images.push({ src: url, alt, width: size?.width ?? 1000, height: size?.height ?? 1000 });
    }
  }

  const colors: ProductColor[] = colorNames.map((colorName) => {
    const swatch = COLOR_SWATCHES[colorName.toLowerCase()];
    if (!swatch && colorNames.length > 1) flag(g.handle, `no swatch for "${colorName}"; using neutral grey`);
    const colorSlug = slugify(colorName);
    return {
      name: colorName,
      slug: colorSlug,
      swatch: swatch ?? DEFAULT_SWATCH,
      images: images.length
        ? images
        : [{ src: `/products/${slug}/${colorSlug}-1.svg`, alt: `${name}, placeholder image`, width: 1600, height: 2000 }],
    };
  });

  // Pricing
  const prices = unique(g.rows.map((r) => Math.round(parseFloat(r["Variant Price"]) * 100)).filter((p) => p > 0));
  if (prices.length === 0) {
    console.error(`\nStopped: ${head["Title"]} [${g.handle}] has no price.\nNothing was written.`);
    process.exit(1);
  }
  if (prices.length > 1) flag(g.handle, `variants have different prices (${prices.join(", ")} cents); using the lowest`);
  const price = Math.min(...prices);
  const compares = g.rows.map((r) => Math.round(parseFloat(r["Variant Compare At Price"]) * 100)).filter((p) => p > price);

  built.push({
    id: g.handle,
    slug,
    name: name.trim(),
    category,
    price,
    ...(compares.length ? { compareAtPrice: Math.max(...compares) } : {}),
    currency: "USD",
    description: stripBrand(htmlToText(head["Body (HTML)"])),
    details: [],
    sizes,
    soldOutSizes: [],
    colors,
    isNew: false,
    releasedAt: versionStamp > 0 ? new Date(versionStamp * 1000).toISOString().slice(0, 10) : today,
  });
}

/* ---------- 4. order: interleave categories so "Featured" mixes them ---------- */
const byCategory = CATEGORY_ORDER.map((c) => built.filter((p) => p.category === c));
const products: Product[] = [];
for (let i = 0, rank = 1; byCategory.some((list) => i < list.length); i++) {
  for (const list of byCategory) if (list[i]) products.push({ ...list[i], featuredRank: rank++ });
}

const names = products.map((p) => p.name);
for (const n of unique(names.filter((n, i) => names.indexOf(n) !== i))) {
  flags.push(`duplicate product name "${n}" (${products.filter((p) => p.name === n).map((p) => p.slug).join(", ")})`);
}

/* ---------- 5. write ---------- */
writeFileSync(
  OUT_FILE,
  `/**
 * GENERATED by scripts/import-products.ts from the CSV files in /data.
 * Do not edit by hand: change the CSVs (or scripts/import-config.ts) and run
 * \`npm run import:products\`.
 */
import type { Product } from "../types/product";

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`,
);

const placeholderReport = generatePlaceholders({
  publicDir: join(ROOT, "public"),
  products,
  lookbook,
});

/* ---------- 6. report ---------- */
console.log(`\nRead ${files.length} file(s), ${totalRows} rows: ${files.join(", ")}`);
console.log(`Imported ${products.length} products:`);
for (const c of CATEGORY_ORDER) console.log(`  ${c.padEnd(12)} ${products.filter((p) => p.category === c).length}`);
if (excluded.length) console.log(`\nExcluded ${excluded.length}:\n  ${excluded.join("\n  ")}`);
console.log("\nInventory quantities are ignored until a backend exists (no sizes marked sold out).");
if (flags.length) console.log(`\nFlags (${flags.length}):\n  ${flags.join("\n  ")}`);
if (placeholderReport.written.length) console.log(`\nPlaceholder images written: ${placeholderReport.written.length}`);
console.log(`\nWrote ${OUT_FILE.replace(ROOT, ".")}`);
