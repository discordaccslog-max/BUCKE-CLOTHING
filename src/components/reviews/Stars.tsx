import Image from "next/image";
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

/**
 * Trustpilot's rating style: white stars on green squares, filled to
 * `rating` (fractions supported). Sized in em, so set it with a text size.
 */
export function TrustpilotStars({ rating, className }: { rating: number; className?: string }) {
  const id = useId();
  return (
    <span className={cn("inline-flex gap-[0.12em]", className)} role="img" aria-label={`Rated ${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        const gradId = `${id}-${i}`;
        return (
          <svg key={i} viewBox="0 0 24 24" className="h-[1.25em] w-[1.25em]" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={gradId}>
                <stop offset={fill} style={{ stopColor: "var(--color-trustpilot)" }} />
                <stop offset={fill} style={{ stopColor: "var(--color-grey-200)" }} />
              </linearGradient>
            </defs>
            <rect width="24" height="24" fill={`url(#${gradId})`} />
            <path d={STAR} transform="translate(3.6 4.1) scale(0.7)" style={{ fill: "var(--color-white)" }} />
          </svg>
        );
      })}
    </span>
  );
}

/**
 * The official Trustpilot logo (public/brand/trustpilot-logo*.svg, from
 * Trustpilot's brand CDN). Height follows the font size, so size it with a
 * text class. `tone="light"` is the white-wordmark version for dark grounds.
 */
export function TrustpilotLogo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Image
      src={tone === "light" ? "/brand/trustpilot-logo-white.svg" : "/brand/trustpilot-logo.svg"}
      alt="Trustpilot"
      width={1133}
      height={278}
      className={cn("inline-block h-[1.25em] w-auto align-middle", className)}
    />
  );
}

export function PlatformLogo({ platform, className }: { platform: string; className?: string }) {
  if (platform === "trustpilot") return <TrustpilotLogo className={className} />;
  const name = platform === "judgeme" ? "Judge.me" : platform === "loox" ? "Loox" : platform;
  return <span className={cn("font-semibold tracking-tight", className)}>{name}</span>;
}
