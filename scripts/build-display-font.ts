/**
 * Builds the display font: a static instance of Archivo at the exact width
 * and weight the `type-display` utility uses (wdth 72, wght 800), subset to
 * the characters headings can contain. Display text is always uppercase, so
 * this is a fraction of the size of the full variable font, which matters
 * because headings are usually the page's largest paint.
 *
 *   npm run font
 *
 * Writes src/app/fonts/archivo-display.woff2 (loaded with next/font/local).
 * Archivo is licensed under the SIL Open Font License 1.1.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import subsetFont from "subset-font";

const require = createRequire(import.meta.url);
const root = join(import.meta.dirname, "..");
const source = require.resolve("@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2");

// Printable ASCII, Latin-1 letters and the typographic punctuation used in copy.
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join("");
const text = range(0x20, 0x7e) + range(0xc0, 0xff) + "–—‘’“”…€×·";

const output = await subsetFont(readFileSync(source), text, {
  targetFormat: "woff2",
  variationAxes: { wdth: 72, wght: 800 },
});
writeFileSync(join(root, "src/app/fonts/archivo-display.woff2"), output);
console.log(`archivo-display.woff2: ${(output.length / 1024).toFixed(1)} KB`);
