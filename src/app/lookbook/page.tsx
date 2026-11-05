import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { lookbookSeason } from "@/data/lookbook";
import { cn } from "@/lib/format";
import { getLookbook, getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: `Lookbook: ${lookbookSeason.title}`,
  description: lookbookSeason.subtitle,
  alternates: { canonical: "/lookbook" },
  openGraph: { url: "/lookbook" },
};

/** Hand-placed editorial rhythm on the 12-column grid (cycles if more looks are added). */
const PLACEMENT = [
  "md:col-span-5 md:col-start-1",
  "md:col-span-4 md:col-start-8 md:mt-40",
  "md:col-span-7 md:col-start-1 md:-mt-10",
  "md:col-span-4 md:col-start-9 md:mt-24",
  "md:col-span-4 md:col-start-2",
  "md:col-span-5 md:col-start-7 md:-mt-32",
  "md:col-span-7 md:col-start-3",
  "md:col-span-3 md:col-start-10 md:mt-48",
];

const SIZES: Record<string, string> = {
  tall: "(min-width: 768px) 42vw, 100vw",
  wide: "(min-width: 768px) 58vw, 100vw",
  square: "(min-width: 768px) 33vw, 100vw",
};

export default async function LookbookPage() {
  const [looks, products] = await Promise.all([getLookbook(), getProducts()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  return (
    <div className="on-ink -mt-[var(--header-h)] bg-ink pt-(--header-h) text-bone">
      <header className="container-page pt-16 pb-16 md:pt-28 md:pb-24">
        <p className="type-label animate-rise text-grey-400">Lookbook</p>
        <h1 className="type-display mt-4 animate-lift text-display-2xl [animation-delay:80ms]">
          {lookbookSeason.title}
        </h1>
        <p className="mt-6 max-w-md animate-rise text-grey-400 [animation-delay:160ms]">
          {lookbookSeason.subtitle}
        </p>
      </header>

      <ol className="container-page grid gap-x-6 gap-y-16 pb-28 md:grid-cols-12 md:gap-y-24 md:pb-40">
        {looks.map((look, i) => {
          const items = look.productSlugs.map((s) => bySlug.get(s)).filter((p) => p !== undefined);
          return (
            <Reveal as="li" key={look.id} className={cn(PLACEMENT[i % PLACEMENT.length])}>
              <figure className="group">
                <div
                  className="relative overflow-hidden bg-grey-900"
                  style={{ aspectRatio: `${look.image.width} / ${look.image.height}` }}
                >
                  <Image
                    src={look.image.src}
                    alt={look.image.alt}
                    fill
                    sizes={SIZES[look.layout]}
                    preload={i === 0}
                    loading={i < 2 ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-[1.6s] ease-out-expo group-hover:scale-[1.03]"
                  />
                  <span className="type-label absolute top-4 left-4 text-bone/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <span className="text-sm">{look.caption}</span>
                  {items.length > 0 && (
                    <span className="type-label text-grey-400">
                      Shop:{" "}
                      {items.map((p, j) => (
                        <span key={p.slug}>
                          {j > 0 && ", "}
                          <Link
                            href={`/product/${p.slug}`}
                            className="text-bone underline-offset-4 transition-colors hover:text-accent-light hover:underline"
                          >
                            {p.name}
                          </Link>
                        </span>
                      ))}
                    </span>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
