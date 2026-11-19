import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import type { Category } from "@/types/product";

export const CATEGORIES_ID = "categories";

/** Editorial four-up of the categories, one row at a time as the viewport allows. */
export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section
      id={CATEGORIES_ID}
      aria-labelledby="categories-title"
      className="container-page scroll-mt-(--header-h) pt-24 pb-8 md:pt-36"
    >
      <Reveal className="grid gap-3 md:grid-cols-12 md:items-end md:gap-6">
        <div className="md:col-span-7">
          <p className="type-label text-grey-600">The categories</p>
          <h2 id="categories-title" className="type-display mt-3 text-display-xl">
            Shop by
            <br /> category.
          </h2>
        </div>
        <p className="max-w-sm text-base text-grey-600 md:col-span-4 md:col-start-9 md:text-lg">
          Hoodies, longsleeves, shirts and denim. Loud graphics, washed fabrics, wide cuts.
        </p>
      </Reveal>

      <ul className="mt-14 grid grid-cols-1 gap-x-5 gap-y-12 md:mt-20 md:grid-cols-2 md:gap-y-16 xl:grid-cols-4">
        {categories.map((category, i) => (
          <Reveal as="li" key={category.slug} delay={i * 0.08}>
            <Link
              href={`/shop/${category.slug}`}
              className="group block transition-transform duration-300 ease-out pointer-fine:hover:-translate-y-1"
            >
              {/* Product photos are white-background flat lays: fit, don't crop. */}
              <div className="relative aspect-[4/5] overflow-hidden bg-white">
                <Image
                  src={category.image.src}
                  alt={category.image.alt}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-contain p-2 transition-transform duration-300 ease-out pointer-fine:group-hover:scale-[1.03] md:p-3"
                />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="type-display text-display-md">{category.name}</h3>
                <ArrowRightIcon className="shrink-0 transition-transform duration-300 ease-out pointer-fine:group-hover:translate-x-1" />
              </div>
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-grey-500">{category.description}</p>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
