import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/format";
import type { Category } from "@/types/product";

/** Editorial four-up of the categories, alternate tiles dropped for rhythm. */
export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="categories-title" className="container-page pt-24 pb-8 md:pt-36">
      <Reveal className="grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="type-label text-grey-600">The categories</p>
          <h2 id="categories-title" className="type-display mt-3 text-display-xl">
            Shop by
            <br /> category.
          </h2>
        </div>
        <p className="max-w-sm text-grey-600 md:col-span-4 md:col-start-9">
          Hoodies, longsleeves, shirts and denim. Loud graphics, washed fabrics, wide cuts.
        </p>
      </Reveal>

      <ul className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 md:mt-20 md:grid-cols-4 md:gap-x-5">
        {categories.map((category, i) => (
          <Reveal as="li" key={category.slug} delay={i * 0.08} className={cn(i % 2 === 1 && "mt-12 md:mt-20")}>
            <Link href={`/shop/${category.slug}`} className="group block">
              {/* Product photos are white-background flat lays: fit, don't crop. */}
              <div className="relative aspect-[4/5] overflow-hidden bg-white">
                <Image
                  src={category.image.src}
                  alt={category.image.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-contain p-4 transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.05]"
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <h3 className="type-display text-display-md">{category.name}</h3>
                <ArrowRightIcon className="shrink-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
              </div>
              <p className="mt-2 text-sm text-grey-600">{category.description}</p>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
