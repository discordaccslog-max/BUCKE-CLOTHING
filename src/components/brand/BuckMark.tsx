import { BUCK_MARK_PATHS, BUCK_MARK_VIEWBOX } from "./buck-paths";

interface BuckMarkProps {
  /** Size with a height class (e.g. "h-8 w-auto"); the mark is wider than tall. */
  className?: string;
  /** When set, the mark is announced as an image with this label. */
  title?: string;
}

/**
 * Simplified Bucke mark (antlers + nose) for small sizes: header, footer,
 * icons. The full mark with face detail is reserved for the homepage hero.
 * Inherits color via currentColor.
 */
export function BuckMark({ className, title }: BuckMarkProps) {
  return (
    <svg
      viewBox={BUCK_MARK_VIEWBOX}
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {BUCK_MARK_PATHS.map((p) => (
        <path key={p.name} d={p.d} />
      ))}
    </svg>
  );
}
