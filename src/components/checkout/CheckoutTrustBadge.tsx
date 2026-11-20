import { BuckMark } from "@/components/brand/BuckMark";
import { TrustpilotLogo, TrustpilotStars } from "@/components/reviews/Stars";
import { cn } from "@/lib/format";
import type { ReviewSummary } from "@/types/review";

/**
 * Bucke × Trustpilot lockup for the checkout header: the buck mark on an ink
 * tile, a hairline, then Trustpilot's logo, stars, score and review count.
 * Rating and count come from src/data/reviews.ts (via the review summary), so
 * they match the Trustpilot block in the order summary.
 *
 * `layout="card"` sits in the header's right column on desktop;
 * `layout="strip"` is the centred version under the header on mobile.
 */
export function CheckoutTrustBadge({
  summary,
  layout,
  className,
}: {
  summary: ReviewSummary;
  layout: "card" | "strip";
  className?: string;
}) {
  const card = layout === "card";
  const score = summary.rating.toFixed(1);
  const count = `${summary.count.toLocaleString("en-US")}+`;

  return (
    <div
      role="group"
      aria-label={`Bucke is rated ${score} out of 5 on Trustpilot, based on ${count} reviews`}
      className={cn(
        "inline-flex items-center",
        card
          ? "gap-3.5 rounded-xl border border-grey-200 bg-white py-2.5 pr-4 pl-2.5 shadow-[0_1px_2px_rgb(14_14_13/0.04),0_8px_20px_-10px_rgb(14_14_13/0.14)]"
          : "gap-3",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative isolate grid shrink-0 place-items-center overflow-hidden rounded-lg bg-ink text-bone",
          card ? "size-11" : "size-9",
        )}
      >
        {/* Ember glow from the lower corner, as on the cart banner */}
        <span className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_0%_100%,color-mix(in_oklab,var(--color-accent)_28%,transparent),transparent_70%)]" />
        <BuckMark className={card ? "h-6 w-auto" : "h-5 w-auto"} />
      </span>

      <span aria-hidden="true" className={cn("w-px shrink-0 bg-grey-200", card ? "h-9" : "h-8")} />

      <span aria-hidden="true" className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-2">
          <TrustpilotLogo className={card ? "text-[0.9375rem]" : "text-sm"} />
          <TrustpilotStars rating={summary.rating} className={card ? "text-[0.8125rem]" : "text-xs"} />
          <span className={cn("font-semibold tabular-nums", card ? "text-sm" : "text-[13px]")}>{score}</span>
        </span>
        <span className={cn("text-muted", card ? "text-xs" : "text-[11px]")}>
          Based on <span className="font-semibold text-ink tabular-nums">{count}</span> reviews
        </span>
      </span>
    </div>
  );
}
