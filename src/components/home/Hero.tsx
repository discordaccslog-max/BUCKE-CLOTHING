import type { CSSProperties } from "react";
import { MARK_ANTLERS, MARK_SHAPES, MARK_STROKE_WIDTH, MARK_VIEWBOX } from "@/components/brand/mark";
import { ButtonLink } from "@/components/ui/Button";
import { InlineScript } from "@/components/ui/InlineScript";
import { HeroController } from "./HeroController";
import { introInlineScript } from "./intro";

const HERO_ID = "hero";
const INTRO_ID = "buck-intro";

// Draw order (seconds): beams, then tines, then the head and ears outline.
const ANTLER_DELAYS = [0, 0, 0.22, 0.22, 0.38, 0.38];
const SHAPE_DELAYS = [0.1, 0.32, 0.32];

/**
 * Full-bleed homepage hero. The buck mark line-draws once per session via
 * CSS (stroke-dasharray/dashoffset on normalized path lengths), then fills
 * solid; total ~1.7s. Without the `data-intro="play"` flag, or with reduced
 * motion, it renders as the static solid mark.
 */
export function Hero() {
  return (
    <section
      id={HERO_ID}
      aria-labelledby="hero-title"
      className="on-ink relative -mt-16 flex min-h-[100svh] flex-col overflow-hidden bg-ink text-bone md:-mt-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_38%,var(--color-grey-800),transparent_70%)]"
      />

      <div
        id={INTRO_ID}
        className="buck-intro container-page relative flex flex-1 flex-col items-center justify-center pt-24 pb-16 text-center"
        suppressHydrationWarning
      >
        <svg
          viewBox={MARK_VIEWBOX}
          className="h-auto w-24 md:w-32"
          role="img"
          aria-label="Bucke buck mark"
          overflow="visible"
        >
          <g fill="none" stroke="currentColor" strokeWidth={MARK_STROKE_WIDTH} strokeLinecap="square">
            {MARK_ANTLERS.map((d, i) => (
              <path
                key={d}
                d={d}
                pathLength={1}
                className="mark-stroke"
                style={{ "--d": ANTLER_DELAYS[i] } as CSSProperties}
              />
            ))}
          </g>
          <g fill="currentColor" stroke="currentColor" strokeWidth={0.75} strokeLinejoin="miter">
            {MARK_SHAPES.map((d, i) => (
              <path
                key={d}
                d={d}
                pathLength={1}
                className="mark-shape"
                style={{ "--d": SHAPE_DELAYS[i] } as CSSProperties}
              />
            ))}
          </g>
        </svg>
        <InlineScript html={introInlineScript(INTRO_ID)} />

        <div className="intro-after mt-10 flex items-center gap-4" style={{ "--after": "0.9s" } as CSSProperties}>
          <span aria-hidden="true" className="h-px w-8 bg-accent-light" />
          <p className="type-label text-grey-400">Winter 26 Collection</p>
          <span aria-hidden="true" className="h-px w-8 bg-accent-light" />
        </div>

        <h1
          id="hero-title"
          className="intro-after type-display mt-6 text-display-2xl"
          style={{ "--after": "0.55s" } as CSSProperties}
        >
          <span className="block">Built heavy.</span>
          <span className="block">Cut quiet.</span>
        </h1>

        <div className="intro-after mt-10" style={{ "--after": "1.15s" } as CSSProperties}>
          <ButtonLink href="/shop" variant="light">
            Shop the collection
          </ButtonLink>
        </div>
      </div>

      <div className="container-page relative flex items-end justify-between pb-6 text-grey-400 md:pb-8">
        <p className="type-label">Hoodies / Longsleeves / Pants &amp; Jeans</p>
        <p className="type-label hidden md:block">Scroll</p>
      </div>

      <HeroController heroId={HERO_ID} introId={INTRO_ID} />
    </section>
  );
}
