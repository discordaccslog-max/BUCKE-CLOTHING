import Image from "next/image";
import { BuckMark } from "@/components/brand/BuckMark";
import { TrustpilotLogo, TrustpilotStars } from "@/components/reviews/Stars";
import { cartTrustBanner } from "@/data/storefront";

/**
 * Bucke × Trustpilot banner at the top of the cart drawer. Built in code
 * (real text, vector logos) so it stays crisp at any width. Copy and the
 * optional background image live in `cartTrustBanner` in src/data/storefront.ts.
 */
export function CartTrustBanner() {
  const { enabled, rating, customers, backgroundImage } = cartTrustBanner;
  if (!enabled) return null;

  return (
    <aside aria-label="Bucke customer rating" className="on-ink relative isolate overflow-hidden bg-ink text-bone">
      {/* BACKGROUND IMAGE SLOT: set cartTrustBanner.backgroundImage to use one. */}
      {backgroundImage && (
        <>
          <Image src={backgroundImage} alt="" fill sizes="(min-width: 448px) 408px, 100vw" className="-z-20 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/85 to-ink/50" />
        </>
      )}

      {/* Warm Ember glow from the logo corner */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(90%_160%_at_0%_100%,color-mix(in_oklab,var(--color-accent)_32%,transparent),transparent_70%)]"
      />
      {/* Faint oversized wordmark, decorative (drawn with a pseudo-element so it isn't read as text). */}
      <div
        aria-hidden="true"
        className="type-display pointer-events-none absolute -right-3 -bottom-[0.22em] -z-10 text-[7.5rem] leading-none text-bone/[0.045] select-none before:content-['Bucke']"
      />
      {/* Ember hairline across the top */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent-light/70 to-transparent" />

      <div className="flex items-center gap-3 px-4 py-6 sm:gap-4 sm:px-5">
        <BuckMark className="h-8 w-auto shrink-0 text-bone sm:h-9" title="Bucke" />
        <span aria-hidden="true" className="h-12 w-px shrink-0 bg-bone/15" />
        <div className="min-w-0 space-y-2">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-2.5">
            <TrustpilotLogo tone="light" className="text-[0.9375rem] sm:text-base" />
            {rating !== null && (
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <TrustpilotStars rating={rating} className="text-xs" />
                <span className="text-sm font-semibold tabular-nums">{rating.toFixed(1)}/5</span>
              </span>
            )}
          </p>
          <p className="type-label text-grey-300">{customers}</p>
        </div>
      </div>
    </aside>
  );
}
