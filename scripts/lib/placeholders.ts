/**
 * Local placeholder imagery. Draws clean studio-style SVGs (tonal background,
 * flat garment silhouette, product label) so the store reads as designed
 * before real photography exists.
 *
 * Files are only written when missing, or when they are earlier
 * placeholders (marked with PLACEHOLDER_MARK) and `force` is set. Real photos
 * are never touched.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Category, CategorySlug, Product } from "../../src/types/product.ts";
import type { LookbookEntry } from "../../src/data/lookbook.ts";

export const PLACEHOLDER_MARK = "<!-- bucke:placeholder -->";

// Mirrors the theme tokens in src/app/globals.css.
const T = {
  ink: "#0e0e0d",
  bone: "#f3f0ea",
  paper: "#faf8f4",
  g100: "#e9e5de",
  g200: "#d9d4cb",
  g300: "#bdb6ab",
  g700: "#3b3834",
  g800: "#24221f",
  g900: "#171614",
};

/* ---------- color helpers ---------- */
function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex([r, g, b]: number[]): string {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}
function mix(a: string, b: string, t: number): string {
  const A = rgb(a);
  const B = rgb(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}
function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------- garment silhouettes (800 x 1000 design space) ---------- */
type Garment = "hoodie" | "longsleeve" | "pants";
type View = "front" | "back" | "detail";

interface Shape {
  body: string[];
  details: string[];
}

function garmentShape(kind: Garment, view: View): Shape {
  const back = view === "back";
  if (kind === "hoodie") {
    return {
      body: [
        "M300 300 L220 330 L150 760 L150 800 L215 800 L260 470 L262 860 L538 860 L540 470 L585 800 L650 800 L650 760 L580 330 L500 300 Z",
        "M300 300 C292 205 340 150 400 150 C460 150 508 205 500 300 C470 330 430 345 400 345 C370 345 330 330 300 300 Z",
      ],
      details: back
        ? ["M400 160 V340", "M262 828 H538", "M151 770 L216 772", "M584 772 L649 770"]
        : [
            "M342 292 C346 228 454 228 458 292 C438 318 362 318 342 292 Z",
            "M300 690 H500 L522 800 H278 Z",
            "M262 828 H538",
            "M151 770 L216 772",
            "M584 772 L649 770",
          ],
    };
  }
  if (kind === "longsleeve") {
    return {
      body: [
        "M318 262 L218 300 L158 790 L222 800 L268 430 L270 870 L530 870 L532 430 L578 800 L642 790 L582 300 L482 262 C456 300 344 300 318 262 Z",
      ],
      details: back
        ? ["M318 262 C344 282 456 282 482 262", "M160 772 L224 781", "M576 781 L640 772"]
        : ["M318 262 C344 312 456 312 482 262", "M160 772 L224 781", "M576 781 L640 772"],
    };
  }
  return {
    body: ["M278 150 H522 L562 880 H432 L400 340 L368 880 H238 Z"],
    details: back
      ? ["M281 196 H519", "M282 250 L400 275 L518 250", "M300 300 H370 V380 L335 395 L300 380 Z", "M430 300 H500 V380 L465 395 L430 380 Z"]
      : ["M281 196 H519", "M400 196 V320", "M290 205 C320 250 335 255 350 210", "M510 205 C480 250 465 255 450 210"],
  };
}

function garmentFor(category: CategorySlug): Garment {
  return category === "hoodies" ? "hoodie" : category === "longsleeves" ? "longsleeve" : "pants";
}

function drawGarment(kind: Garment, view: View, fill: string, id: string): string {
  const s = garmentShape(kind, view);
  const light = luminance(fill) > 0.45;
  const line = light ? mix(fill, T.ink, 0.16) : mix(fill, T.bone, 0.14);
  const body = s.body.map((d) => `<path d="${d}" fill="${fill}"/>`).join("");
  const shade = s.body.map((d) => `<path d="${d}" fill="url(#shade-${id})"/>`).join("");
  const details = s.details
    .map((d) => `<path d="${d}" fill="${d.endsWith("Z") && kind === "hoodie" && d.includes("C") ? mix(fill, T.ink, 0.35) : "none"}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`)
    .join("");
  const flip = view === "back" ? ` transform="translate(800 0) scale(-1 1)"` : "";
  return `<g${flip}>${body}${shade}${details}</g>`;
}

function shadeDef(id: string): string {
  return `<linearGradient id="shade-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>`;
}

/* ---------- compositions ---------- */
function studioSvg(opts: {
  width: number;
  height: number;
  kind: Garment;
  view: View;
  fill: string;
  title: string;
  subtitle: string;
  index: string;
  /** Print the product name and color in the image. */
  label: boolean;
}): string {
  const W = 800;
  const H = Math.round((800 * opts.height) / opts.width);
  const garmentLight = luminance(opts.fill) > 0.55;
  const bgA = garmentLight ? T.g200 : T.g100;
  const bgB = garmentLight ? T.g300 : T.g200;
  const text = mix(T.ink, bgA, 0.35);
  const id = "s";

  // Fit the 800x1000 garment space into the frame; zoom for the detail view.
  const scale = opts.view === "detail" ? 1.9 * (H / 1000) : 0.84 * (H / 1000);
  const focusY = opts.kind === "pants" ? 330 : 470;
  const tx = W / 2 - 400 * scale;
  const ty = opts.view === "detail" ? H / 2 - focusY * scale : H / 2 - 515 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(opts.title)}">
${PLACEHOLDER_MARK}
<defs>
<radialGradient id="bg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="${mix(bgA, T.paper, 0.35)}"/><stop offset="1" stop-color="${bgB}"/></radialGradient>
<radialGradient id="floor" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
${shadeDef(id)}
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
${opts.view === "detail" ? "" : `<ellipse cx="${W / 2}" cy="${ty + 905 * scale}" rx="${260 * scale}" ry="${26 * scale}" fill="url(#floor)"/>`}
<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale.toFixed(4)})">${drawGarment(opts.kind, opts.view, opts.fill, id)}</g>
<g font-family="Helvetica, Arial, sans-serif" fill="${text}">
<text x="40" y="58" font-size="17" font-weight="700" letter-spacing="5">BUCKE</text>
<text x="${W - 40}" y="58" font-size="14" letter-spacing="3" text-anchor="end">${esc(opts.index)}</text>
${opts.label ? `<text x="40" y="${H - 66}" font-size="19" font-weight="700" letter-spacing="2.5">${esc(opts.title.toUpperCase())}</text>
<text x="40" y="${H - 40}" font-size="15" letter-spacing="2">${esc(opts.subtitle.toUpperCase())}</text>` : ""}
<text x="${W - 40}" y="${H - 40}" font-size="12" letter-spacing="2.5" text-anchor="end" opacity=".7">PLACEHOLDER</text>
</g>
</svg>
`;
}

function editorialSvg(opts: {
  width: number;
  height: number;
  top?: { kind: Garment; fill: string };
  bottom?: { kind: Garment; fill: string };
  caption: string;
  number: string;
  crop: boolean;
}): string {
  const W = 800;
  const H = Math.round((800 * opts.height) / opts.width);
  const wide = W > H * 1.2;

  // Build a headless figure: bottoms first, top garment overlapping the waist.
  const parts: string[] = [];
  let figH = 0;
  if (opts.bottom) {
    const y = opts.top ? 640 : 0;
    parts.push(`<g transform="translate(0 ${y})">${drawGarment(opts.bottom.kind, "front", opts.bottom.fill, "e")}</g>`);
    figH = y + 900;
  }
  if (opts.top) {
    parts.push(drawGarment(opts.top.kind, "front", opts.top.fill, "e"));
    figH = Math.max(figH, 880);
  }

  const scale = opts.crop ? (H / 1000) * 1.7 : (H * 0.9) / figH;
  const cx = wide ? W * 0.62 : W / 2;
  const tx = cx - 400 * scale;
  const ty = opts.crop ? H / 2 - 520 * scale : H - (figH - 40) * scale - H * 0.02;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(opts.caption)}">
${PLACEHOLDER_MARK}
<defs>
<linearGradient id="bg" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${T.g700}"/><stop offset=".6" stop-color="${T.g900}"/><stop offset="1" stop-color="${T.ink}"/></linearGradient>
<radialGradient id="light" cx="${wide ? 0.62 : 0.5}" cy=".3" r=".7"><stop offset="0" stop-color="${T.g300}" stop-opacity=".28"/><stop offset="1" stop-color="${T.g300}" stop-opacity="0"/></radialGradient>
${shadeDef("e")}
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#light)"/>
${wide ? `<rect y="${H * 0.78}" width="${W}" height="${H * 0.22}" fill="${T.ink}" opacity=".45"/>` : ""}
<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale.toFixed(4)})">${parts.join("")}</g>
<g font-family="Helvetica, Arial, sans-serif" fill="${T.g300}">
<text x="36" y="${H - 36}" font-size="14" letter-spacing="3">${esc(opts.number)}</text>
<text x="${W - 36}" y="${H - 36}" font-size="12" letter-spacing="2.5" text-anchor="end" opacity=".6">PLACEHOLDER</text>
</g>
</svg>
`;
}

/* ---------- writing ---------- */
export interface PlaceholderReport {
  written: string[];
  skipped: string[];
}

function writeIfPlaceholder(publicDir: string, src: string, svg: string, force: boolean, report: PlaceholderReport) {
  if (!src.startsWith("/") || !src.endsWith(".svg")) return; // real photo path: leave alone
  const file = join(publicDir, src);
  if (existsSync(file)) {
    const isPlaceholder = readFileSync(file, "utf8").includes(PLACEHOLDER_MARK);
    if (!force || !isPlaceholder) {
      report.skipped.push(src);
      return;
    }
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg);
  report.written.push(src);
}

const VIEW_ORDER: View[] = ["front", "back", "detail"];

export function generatePlaceholders(input: {
  publicDir: string;
  products: Product[];
  categories: Category[];
  lookbook: LookbookEntry[];
  force?: boolean;
}): PlaceholderReport {
  const report: PlaceholderReport = { written: [], skipped: [] };
  const force = Boolean(input.force);
  const bySlug = new Map(input.products.map((p) => [p.slug, p]));

  for (const p of input.products) {
    const kind = garmentFor(p.category);
    for (const c of p.colors) {
      c.images.forEach((img, i) => {
        const svg = studioSvg({
          width: img.width,
          height: img.height,
          kind,
          view: VIEW_ORDER[i % VIEW_ORDER.length],
          fill: c.swatch,
          title: p.name,
          subtitle: c.name,
          label: true,
          index: `${String(i + 1).padStart(2, "0")} / ${String(c.images.length).padStart(2, "0")}`,
        });
        writeIfPlaceholder(input.publicDir, img.src, svg, force, report);
      });
    }
  }

  const categoryFill: Record<CategorySlug, string> = {
    hoodies: "#1d1c1a",
    longsleeves: "#e6e0d4",
    "pants-jeans": "#22283a",
  };
  for (const cat of input.categories) {
    const svg = studioSvg({
      width: cat.image.width,
      height: cat.image.height,
      kind: garmentFor(cat.slug),
      view: "front",
      fill: categoryFill[cat.slug],
      title: cat.name,
      subtitle: "Category",
      index: "",
      label: false,
    });
    writeIfPlaceholder(input.publicDir, cat.image.src, svg, force, report);
  }

  for (const look of input.lookbook) {
    const items = look.productSlugs.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p));
    const topP = items.find((p) => p.category !== "pants-jeans");
    const botP = items.find((p) => p.category === "pants-jeans");
    const svg = editorialSvg({
      width: look.image.width,
      height: look.image.height,
      top: topP && { kind: garmentFor(topP.category), fill: topP.colors[0].swatch },
      bottom: botP && { kind: "pants", fill: botP.colors[0].swatch },
      caption: look.image.alt,
      number: `LOOK ${look.id}`,
      crop: items.length === 1 && look.layout === "square",
    });
    writeIfPlaceholder(input.publicDir, look.image.src, svg, force, report);
  }

  return report;
}
