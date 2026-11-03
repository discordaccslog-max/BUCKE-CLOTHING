import type { Metadata } from "next";
import Image from "next/image";
import { BuckMark } from "@/components/brand/BuckMark";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getLookbook } from "@/lib/products";

export const metadata: Metadata = {
  title: "About",
  description: "Bucke makes heavyweight hoodies, longsleeves and trousers. Fewer pieces, made properly.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

// PLACEHOLDER brand copy: replace with the real story before launch.
const principles = [
  {
    title: "Heavy cloth",
    body: "We start with the fabric. Dense loopback, compact jersey, selvedge denim. Weight you can feel, that holds its shape for years.",
  },
  {
    title: "Quiet cuts",
    body: "No oversized logos, no seasonal gimmicks. Proportion does the talking: a dropped shoulder, a clean hem, a stacked break.",
  },
  {
    title: "Fewer pieces",
    body: "Four categories, done properly. We would rather perfect one hoodie than release twelve.",
  },
];

export default async function AboutPage() {
  const looks = await getLookbook();
  const [first, second] = [looks[2], looks[5]];

  return (
    <>
      <header className="container-page pt-16 pb-20 md:pt-28 md:pb-32">
        <p className="type-label animate-rise text-grey-600">About Bucke</p>
        <h1 className="type-display mt-5 max-w-[16ch] animate-lift text-display-xl [animation-delay:80ms]">
          Made for the long walk, not the drop.
        </h1>
      </header>

      <section aria-label="Our story" className="container-page grid gap-10 pb-24 md:grid-cols-12 md:gap-6 md:pb-36">
        <Reveal className="md:col-span-7">
          <div className="relative aspect-[3/2] overflow-hidden bg-grey-900">
            <Image
              src={first.image.src}
              alt={first.image.alt}
              fill
              preload
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="space-y-6 text-lg leading-relaxed text-grey-700 md:col-span-4 md:col-start-9 md:self-end">
          <p>
            Bucke started with a simple frustration: the best-made basics felt anonymous, and the most
            interesting streetwear fell apart in a season.
          </p>
          <p>
            So we narrowed the brief. Hoodies, longsleeves, shirts and jeans, built from heavier cloth
            than anyone needs, cut with the restraint of tailoring, and finished to be worn hard.
          </p>
          <p>The buck is our mark: alert, unhurried, built for the terrain.</p>
        </Reveal>
      </section>

      <section aria-labelledby="principles-title" className="on-ink bg-ink py-24 text-bone md:py-36">
        <div className="container-page">
          <Reveal className="flex items-center gap-5">
            <BuckMark className="h-8 w-auto text-accent-light" />
            <h2 id="principles-title" className="type-display text-display-lg">
              What we hold to
            </h2>
          </Reveal>
          <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.1} className="border-t border-bone/20 pt-6">
                <p className="type-label text-grey-400">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="type-display mt-4 text-display-md">{p.title}</h3>
                <p className="mt-4 max-w-sm leading-relaxed text-grey-400">{p.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-label="Closing" className="container-page grid gap-10 py-24 md:grid-cols-12 md:items-center md:gap-6 md:py-36">
        <Reveal className="md:col-span-4 md:col-start-2">
          <div className="relative aspect-[2/3] overflow-hidden bg-grey-900">
            <Image
              src={second.image.src}
              alt={second.image.alt}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-5 md:col-start-7">
          <p className="type-display text-display-lg">Wear it in. Then wear it for years.</p>
          <ButtonLink href="/shop" className="mt-10">
            Shop the collection
          </ButtonLink>
        </Reveal>
      </section>
    </>
  );
}
