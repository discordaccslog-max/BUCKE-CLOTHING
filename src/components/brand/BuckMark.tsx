import { MARK_ANTLERS, MARK_SHAPES, MARK_STROKE_WIDTH, MARK_VIEWBOX } from "./mark";

interface BuckMarkProps {
  className?: string;
  /** When set, the mark is announced as an image with this label. */
  title?: string;
}

/** Static Bucke mark. Inherits color via currentColor. */
export function BuckMark({ className, title }: BuckMarkProps) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={MARK_STROKE_WIDTH}
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        {MARK_ANTLERS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill="currentColor">
        {MARK_SHAPES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
