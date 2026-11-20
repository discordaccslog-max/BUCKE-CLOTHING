import { BuckMark } from "@/components/brand/BuckMark";
import { TrustpilotLogo, TrustpilotStars } from "@/components/reviews/Stars";
import type { ReviewSummary } from "@/types/review";

/** Shown as "Based on 2,000+ reviews". Rounded down on purpose for the header. */
const HEADER_REVIEW_COUNT = "2,000+";

/**
 * The checkout header's centre lockup: the buck mark with the Trustpilot
 * rating set directly underneath it (logo, stars, score, review count).
 * No box: it reads as one piece with the mark. The score comes from the
 * shared review summary (src/data/reviews.ts), so it matches the order
 * summary's Trustpilot block. Compact on mobile, larger from md up.
 */
export function CheckoutRatingLockup({ summary }: { summary: ReviewSummary }) {
  const score = summary.rating.toFixed(1);
  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      <BuckMark className="h-9 w-auto md:h-14" />
      <div
        role="img"
        aria-label={`Rated ${score} out of 5 on Trustpilot, based on ${HEADER_REVIEW_COUNT} reviews`}
        className="flex flex-col items-center gap-1 md:gap-1.5"
      >
        <span aria-hidden="true" className="flex items-center gap-1.5 md:gap-2.5">
          <TrustpilotLogo className="text-[0.8125rem] md:text-lg" />
          <TrustpilotStars rating={summary.rating} className="text-[0.6875rem] md:text-base" />
          <span className="text-xs font-semibold tabular-nums md:text-base">{score}</span>
        </span>
        <span aria-hidden="true" className="text-[11px] whitespace-nowrap text-muted md:text-sm">
          Based on <span className="font-semibold text-ink tabular-nums">{HEADER_REVIEW_COUNT}</span> reviews
        </span>
      </div>
    </div>
  );
}
