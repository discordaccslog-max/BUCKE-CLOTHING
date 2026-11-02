import { MARK_ANTLERS, MARK_SHAPES, MARK_STROKE_WIDTH, MARK_VIEWBOX } from "./mark";

/** Mark for next/og ImageResponse (Satori renders inline SVG paths). */
export function MarkImage({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox={MARK_VIEWBOX}>
      {MARK_ANTLERS.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={MARK_STROKE_WIDTH}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      ))}
      {MARK_SHAPES.map((d) => (
        <path key={d} d={d} fill={color} />
      ))}
    </svg>
  );
}
