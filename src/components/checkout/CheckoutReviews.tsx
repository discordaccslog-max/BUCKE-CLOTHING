"use client";

import { useState, type ReactNode } from "react";
import { ReviewCarousel } from "@/components/reviews/ReviewCarousel";
import { TrustpilotLogo, TrustpilotStars } from "@/components/reviews/Stars";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/format";
import type { ReviewSummary } from "@/types/review";

export interface CheckoutReviewsData {
  summary: ReviewSummary;
  /** Rendered ReviewCards, from getReviewCards() in ReviewsSection. */
  cards: ReactNode[];
}

/**
 * Trustpilot's widget line: logo, stars, score, review count.
 * Each piece is unbreakable, so when the line is too narrow it wraps
 * between pieces and the count drops to the next line first.
 */
function Rating({ summary, size }: { summary: ReviewSummary; size: "sm" | "lg" }) {
  const lg = size === "lg";
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-2.5", lg && "justify-center")}>
      <TrustpilotLogo className={lg ? "text-xl" : "text-[1.0625rem]"} />
      <TrustpilotStars rating={summary.rating} className={lg ? "text-lg" : "text-base"} />
      <span className={cn("tabular-nums whitespace-nowrap", lg ? "text-base" : "text-sm")}>
        {summary.rating.toFixed(1)}/5
      </span>
      <span className={cn("whitespace-nowrap text-muted", lg ? "text-sm" : "text-xs")}>
        based on {summary.count.toLocaleString("en-US")}+ reviews
      </span>
    </p>
  );
}

/**
 * Trustpilot rating under the order summary's total, with a "View reviews"
 * link that opens the site's review carousel in a dialog over the checkout.
 */
export function CheckoutReviews({ summary, cards }: CheckoutReviewsData) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-grey-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgb(14_14_13/0.04),0_8px_20px_-8px_rgb(14_14_13/0.12)]">
        <Rating summary={summary} size="sm" />
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="group mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
        >
          View reviews
          <ArrowRightIcon
            width={14}
            height={14}
            strokeWidth={2}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Customer reviews" side="dialog" tone="white">
        <div className="px-4 py-8 md:px-10 md:py-10">
          <Rating summary={summary} size="lg" />
          <div className="mt-8 md:mt-10">
            <ReviewCarousel label="Customer reviews">{cards}</ReviewCarousel>
          </div>
        </div>
      </Sheet>
    </>
  );
}
