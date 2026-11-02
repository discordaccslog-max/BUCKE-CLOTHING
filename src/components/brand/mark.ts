/**
 * The Bucke buck mark, drawn on a 64 x 64 grid.
 * Antlers are thick square-capped strokes; the head and ears are solid
 * shapes. Shared by the header, hero animation, favicon and OG image.
 */
export const MARK_VIEWBOX = "0 0 64 64";
export const MARK_STROKE_WIDTH = 3.5;

/** Antler strokes, ordered for the line-draw: beams, then tines. */
export const MARK_ANTLERS = [
  "M28 27 L21 19 V5",
  "M36 27 L43 19 V5",
  "M21 19 L13 13 V7",
  "M43 19 L51 13 V7",
  "M21 12 L26.5 7.5",
  "M43 12 L37.5 7.5",
] as const;

/** Solid shapes: head, then ears. */
export const MARK_SHAPES = [
  "M26 26 H38 L42 32.5 L34 57 H30 L22 32.5 Z",
  "M22.4 30 L12 27 L16.5 35 L23.2 35 Z",
  "M41.6 30 L52 27 L47.5 35 L40.8 35 Z",
] as const;

/** Standalone SVG markup (favicon, downloads). */
export function markSvg(color: string, background?: string): string {
  const bg = background ? `<rect width="64" height="64" fill="${background}"/>` : "";
  const strokes = MARK_ANTLERS.map((d) => `<path d="${d}"/>`).join("");
  const shapes = MARK_SHAPES.map((d) => `<path d="${d}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}">${bg}<g fill="none" stroke="${color}" stroke-width="${MARK_STROKE_WIDTH}" stroke-linecap="square" stroke-linejoin="miter">${strokes}</g><g fill="${color}">${shapes}</g></svg>`;
}
