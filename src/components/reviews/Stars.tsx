import { useId } from "react";
import { cn } from "@/lib/format";

const STAR = "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z";

/** Five gold stars, filled to `rating` (fractions supported). */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  const id = useId();
  return (
    <span className={cn("inline-flex gap-0.5 text-gold", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        const gradId = `${id}-${i}`;
        return (
          <svg key={i} viewBox="0 0 24 24" className="h-[1em] w-[1em]" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={gradId}>
                <stop offset={fill} stopColor="currentColor" />
                <stop offset={fill} stopColor="var(--color-grey-200)" />
              </linearGradient>
            </defs>
            <path d={STAR} fill={`url(#${gradId})`} />
          </svg>
        );
      })}
    </span>
  );
}

/** The Trustpilot wordmark with its star, for linking to a real profile. */
export function TrustpilotLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold tracking-tight text-ink", className)}>
      <svg viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em] text-trustpilot" aria-hidden="true" focusable="false">
        <path d={STAR} fill="currentColor" />
      </svg>
      Trustpilot
    </span>
  );
}

export function PlatformLogo({ platform, className }: { platform: string; className?: string }) {
  if (platform === "trustpilot") return <TrustpilotLogo className={className} />;
  const name = platform === "judgeme" ? "Judge.me" : platform === "loox" ? "Loox" : platform;
  return <span className={cn("font-semibold tracking-tight", className)}>{name}</span>;
}
