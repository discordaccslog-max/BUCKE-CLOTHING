/**
 * Regenerates brand files from the mark geometry in
 * src/components/brand/mark.ts. Run after changing the mark:
 *
 *   npm run brand
 *
 * Writes: src/app/icon.svg, src/app/favicon.ico (16/32/48),
 * public/brand/bucke-mark.svg, public/brand/bucke-mark-light.svg.
 * (apple-icon and the OG image are rendered by Next from the same geometry.)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { markSvg } from "../src/components/brand/mark.ts";

const INK = "#0e0e0d";
const BONE = "#f3f0ea";
const root = join(import.meta.dirname, "..");

const appIcon = markSvg(BONE, INK).replace('<rect width="64" height="64"', '<rect width="64" height="64" rx="10"');
writeFileSync(join(root, "src/app/icon.svg"), appIcon);

mkdirSync(join(root, "public/brand"), { recursive: true });
writeFileSync(join(root, "public/brand/bucke-mark.svg"), markSvg(INK));
writeFileSync(join(root, "public/brand/bucke-mark-light.svg"), markSvg(BONE));

// favicon.ico: PNG-compressed entries (supported by all current browsers).
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(Buffer.from(markSvg(BONE, INK)), { density: 72 * (s / 16) }).resize(s, s).png().toBuffer()),
);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s === 256 ? 0 : s, 0);
  e.writeUInt8(s === 256 ? 0 : s, 1);
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(pngs[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
});
writeFileSync(join(root, "src/app/favicon.ico"), Buffer.concat([header, ...entries, ...pngs]));

console.log("Brand assets written.");
