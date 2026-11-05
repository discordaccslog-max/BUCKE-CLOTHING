import type { CSSProperties } from "react";
import { BUCK_PATHS, BUCK_VIEWBOX } from "@/components/brand/buck-paths";
import { ButtonLink } from "@/components/ui/Button";
import { InlineScript } from "@/components/ui/InlineScript";
import { HeroController } from "./HeroController";
import { introInlineScript } from "./intro";

const HERO_ID = "hero";

/**
 * Intro choreography (ms). One strict sequence on one easing curve:
 * the 8 buck paths cascade in DOM order, a pause, then eyebrow, headline,
 * CTA and finally the bottom row.
 */
const PATH_STAGGER = 90;
const PATH_DURATION = 450;
const MARK_END = (BUCK_PATHS.length - 1) * PATH_STAGGER + PATH_DURATION;
const EYEBROW = { at: MARK_END + 300, dur: 500 };
const HEADLINE = { at: EYEBROW.at + EYEBROW.dur, dur: 600 };
const CTA = { at: HEADLINE.at + HEADLINE.dur, dur: 400 };
const FOOTER_ROW = { at: CTA.at + CTA.dur, dur: 400 };

const step = (s: { at: number; dur: number }) =>
  ({ "--d": `${s.at}ms`, "--dur": `${s.dur}ms` }) as CSSProperties;

/**
 * Full-bleed homepage hero with the full buck mark as its centerpiece.
 * The intro runs once per browser session, gated by data-intro="play" on
 * the section (set before first paint by an inline script). Without it, or
 * with reduced motion, everything renders in its final state.
 */
export function Hero() {
  return (
    <section
      id={HERO_ID}
      aria-labelledby="hero-title"
      className="hero-intro on-ink relative -mt-[var(--header-h)] flex min-h-[100svh] flex-col overflow-hidden bg-ink text-bone"
      suppressHydrationWarning
    >
      <InlineScript html={introInlineScript(HERO_ID)} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_38%,var(--color-grey-800),transparent_70%)]"
      />

      <div className="container-page relative flex flex-1 flex-col items-center justify-center pt-24 pb-16 text-center">
        {/* Width + viewBox reserve the mark's full box from the first paint. */}
        <svg
          viewBox={BUCK_VIEWBOX}
          fill="currentColor"
          className="h-auto w-[min(78vw,15rem)] md:w-80"
          role="img"
          aria-label="Bucke buck mark"
          overflow="visible"
        >
          {BUCK_PATHS.map((p, i) => (
            <path
              key={p.name}
              d={p.d}
              className={`buck-path buck-${p.name}`}
              style={{ "--d": `${i * PATH_STAGGER}ms`, "--dur": `${PATH_DURATION}ms` } as CSSProperties}
            />
          ))}
        </svg>

        <div className="mt-10 flex items-center gap-4">
          <span
            aria-hidden="true"
            className="intro-rule h-px w-8 origin-right bg-accent-light"
            style={step(EYEBROW)}
          />
          <p className="intro-fade-up type-label text-grey-400" style={step(EYEBROW)}>
            Winter 26 Collection
          </p>
          <span
            aria-hidden="true"
            className="intro-rule h-px w-8 origin-left bg-accent-light"
            style={step(EYEBROW)}
          />
        </div>

        <h1
          id="hero-title"
          className="intro-fade-up type-display mt-6 text-display-2xl text-balance max-[359px]:text-[3.25rem]"
          style={step(HEADLINE)}
        >
          Bucke Streetwear Clothing
        </h1>

        <div className="intro-fade mt-10" style={step(CTA)}>
          <ButtonLink href="/shop" variant="light">
            Shop the collection
          </ButtonLink>
        </div>
      </div>

      <div
        className="intro-fade container-page relative flex items-end justify-between pb-6 text-grey-400 md:pb-8"
        style={step(FOOTER_ROW)}
      >
        <p className="type-label">Hoodies / Longsleeves / Shirts / Pants &amp; Jeans</p>
        <p className="type-label hidden md:block">Scroll</p>
      </div>

      <HeroController heroId={HERO_ID} introId={HERO_ID} />
    </section>
  );
}
