import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import type { LookbookEntry } from "@/data/lookbook";

interface LookbookBandProps {
  season: { title: string; subtitle: string };
  looks: LookbookEntry[];
}

/** Dark editorial band: two large images, minimal copy. */
export function LookbookBand({ season, looks }: LookbookBandProps) {
  const [lead, second] = looks;
  return (
    <section aria-labelledby="lookbook-band-title" className="on-ink bg-ink py-24 text-bone md:py-36">
      <div className="container-page grid gap-10 md:grid-cols-12 md:gap-6">
        <Reveal className="md:col-span-7">
          <Link href="/lookbook" className="group block" aria-label={`${season.title} lookbook: ${lead.caption}`}>
            <div className="relative aspect-[2/3] overflow-hidden bg-grey-900 md:aspect-[4/5]">
              <Image
                src={lead.image.src}
                alt={lead.image.alt}
                fill
                sizes="(min-width: 768px) 58vw, 100vw"
                className="object-cover transition-transform duration-[1.6s] ease-out-expo group-hover:scale-[1.04]"
              />
            </div>
          </Link>
        </Reveal>

        <div className="flex flex-col justify-between gap-10 md:col-span-4 md:col-start-9">
          <Reveal>
            <p className="type-label text-grey-400">Lookbook</p>
            <h2 id="lookbook-band-title" className="type-display mt-3 text-display-xl">
              {season.title}
            </h2>
            <p className="mt-6 max-w-xs text-grey-400">{season.subtitle}</p>
            <Link
              href="/lookbook"
              className="type-label mt-8 inline-block border-b border-bone/50 pb-1 transition-colors hover:border-accent-light hover:text-accent-light"
            >
              View the lookbook
            </Link>
          </Reveal>
          {second && (
            <Reveal delay={0.15}>
              <div className="relative aspect-square overflow-hidden bg-grey-900">
                <Image
                  src={second.image.src}
                  alt={second.image.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-xs text-grey-400">{second.caption}</p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
