import { BUCK_MARK_PATHS, BUCK_MARK_VIEWBOX } from "./buck-paths";

const [, , VB_W, VB_H] = BUCK_MARK_VIEWBOX.split(" ").map(Number);

/** Simplified mark for next/og ImageResponse (Satori renders inline SVG paths). */
export function MarkImage({ width, color }: { width: number; color: string }) {
  return (
    <svg width={width} height={Math.round((width * VB_H) / VB_W)} viewBox={BUCK_MARK_VIEWBOX}>
      {BUCK_MARK_PATHS.map((p) => (
        <path key={p.name} d={p.d} fill={color} />
      ))}
    </svg>
  );
}
