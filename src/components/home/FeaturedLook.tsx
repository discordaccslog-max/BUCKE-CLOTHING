import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import type { Product } from "@/types/product";
import { CATEGORIES_ID } from "./CategoryGrid";
import { FeaturedLookController } from "./FeaturedLookController";

const SECTION_ID = "featured-look";

/** Full-res cutout is 1345x4664; variants come from `npm run featured-look`. */
const MODEL = { width: 1345, height: 4664, widths: [600, 900, 1345] } as const;
const srcSet = (ext: "avif" | "webp") =>
  MODEL.widths.map((w) => `/editorial/featured-look-${w}.${ext} ${w}w`).join(", ");
/**
 * Rendered width is the model's height times its aspect ratio (0.288):
 * desktop ~85vh tall, mobile at most 70vh, so phones stay on the 600w file.
 */
const SIZES = "(min-width: 64rem) 25vh, 21vh";

/**
 * Dark editorial section under the hero: one full-body look with a built
 * environment (light, contact shadow, floor fade) and a difference-blend
 * headline that crosses the model on desktop (see .featured-look in
 * globals.css). Server HTML is final; FeaturedLookController layers the
 * panel reveal, parallax and tilt on top.
 */
export function FeaturedLook({ products }: { products: Product[] }) {
  return (
    <section
      id={SECTION_ID}
      aria-label="Featured look"
      className="featured-look @container on-ink relative isolate flex min-h-[100svh] flex-col overflow-x-clip bg-ink text-bone"
    >
      {/* The dark surface. Scroll drives it up over the previous section. */}
      <div
        aria-hidden="true"
        data-fl="panel"
        className="pointer-events-none absolute inset-0 z-0 bg-ink will-change-transform"
      />

      {/* Floor fade into the page: sits under the model and text, so it only
          lightens the ground he stands on. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-linear-to-b from-transparent to-bone lg:h-1/5"
      />

      {/* No stacking context between the headline and the section, so its
          blend sees the panel and the model. */}
      <div className="container-page grid flex-1 pb-28 lg:min-h-[100svh] lg:grid-cols-12 lg:items-center lg:pb-0">
        <div className="mt-10 lg:col-span-5 lg:mt-0 lg:pl-8 xl:pl-16 lg:supports-[mix-blend-mode:difference]:max-w-(--fl-col-w)">
          <div data-fl="text-parallax" className="relative z-20">
            <p data-fl="text-item" className="type-label text-grey-400">
              Winter 26
            </p>
          </div>
          <h2
            data-fl="text-item"
            data-fl-headline=""
            className="featured-look-title type-display relative z-30 mt-4 text-display-lg leading-none tracking-tighter text-paper mix-blend-difference lg:mt-6"
          >
            Winter 26’
            <br className="featured-look-break" /> Collection
            <br />
            Shop the drop
          </h2>
          <div data-fl="text-parallax" className="relative z-20">
            <p data-fl="text-item" className="mt-5 max-w-sm text-grey-400 lg:mt-8 lg:text-lg">
              Washed cotton, studded denim, heavy boots. A uniform for the cold months, made to be worn hard and
              noticed quietly.
            </p>
            <div data-fl="text-item" className="mt-8 lg:mt-10">
              <a href={`#${CATEGORIES_ID}`} className={buttonClasses("light")}>
                Shop the collection
              </a>
            </div>
            {products.length > 0 && (
              <p data-fl="text-item" className="mt-8 text-xs text-grey-400 lg:mt-10">
                <span className="sr-only">Wearing: </span>
                {products.map((product, i) => (
                  <span key={product.id}>
                    {i > 0 && <span aria-hidden="true"> / </span>}
                    <Link
                      href={`/product/${product.slug}`}
                      className="underline-offset-4 transition-colors hover:text-bone hover:underline"
                    >
                      {product.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* The stage: first on mobile, the right half on desktop. */}
      <div className="relative z-20 order-first flex justify-center pt-[calc(var(--header-h)+var(--spacing)*6)] lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:items-end lg:pt-0 lg:pb-8">
        <div
          data-fl="model-parallax"
          className="relative aspect-[1345/4664] h-[min(70svh,calc(100svh-var(--header-h)-var(--spacing)*52))] perspective-distant will-change-transform lg:h-(--fl-h)"
        >
          {/* Light source behind the upper body. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[28%] left-1/2 -z-10 h-[55%] w-[420%] -translate-x-1/2 -translate-y-1/2"
          >
            <div data-fl="glow-move" className="h-full w-full">
              <div data-fl="glow-reveal" className="h-full w-full">
                <div className="h-full w-full rounded-full bg-[radial-gradient(closest-side,var(--color-grey-500),transparent)] opacity-40 blur-3xl saturate-0" />
              </div>
            </div>
          </div>

          {/* Contact shadow: wider than tall, under the boots. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[2%] w-[150%] -translate-x-1/2 translate-y-1/2 rounded-full bg-black opacity-50 blur-lg"
          />

          <div data-fl="model-tilt" className="h-full w-full origin-bottom will-change-transform">
            <div data-fl="model-reveal" className="h-full w-full">
              <picture>
                <source type="image/avif" srcSet={srcSet("avif")} sizes={SIZES} />
                <source type="image/webp" srcSet={srcSet("webp")} sizes={SIZES} />
                <Image
                  src={`/editorial/featured-look-${MODEL.widths[1]}.webp`}
                  alt="Model standing facing the camera in the cream Bankroll Club Long Sleeve with a silver chain, washed Saint Studded Denim and black leather boots."
                  width={MODEL.width}
                  height={MODEL.height}
                  sizes={SIZES}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </picture>
            </div>
          </div>
        </div>
      </div>

      <FeaturedLookController sectionId={SECTION_ID} />
    </section>
  );
}
