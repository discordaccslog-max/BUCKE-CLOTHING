import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/format";
import type { Category } from "@/types/product";

/** Editorial three-up of the categories, middle tile dropped for rhythm. */
export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="categories-title" className="container-page pt-24 pb-8 md:pt-36">
      <Reveal className="grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="type-label text-grey-600">The categories</p>
          <h2 id="categories-title" className="type-display mt-3 text-display-xl">
            Three things,
            <br /> done properly.
          </h2>
        </div>
        <p className="max-w-sm text-grey-600 md:col-span-4 md:col-start-9">
          We make hoodies, longsleeves and trousers. Nothing else. Heavier cloth, cleaner cuts, fewer
          pieces.
        </p>
      </Reveal>

      <ul className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-5">
        {categories.map((category, i) => (
          <Reveal as="li" key={category.slug} delay={i * 0.1} className={cn(i === 1 && "md:mt-28")}>
            <Link href={`/shop/${category.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-grey-100">
                <Image
                  src={category.image.src}
                  alt={category.image.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.06]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-bone md:p-6">
                  <h3 className="type-display text-display-md">{category.name}</h3>
                  <ArrowRightIcon className="mb-1 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                </div>
              </div>
              <p className="mt-3 text-sm text-grey-600">{category.description}</p>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
