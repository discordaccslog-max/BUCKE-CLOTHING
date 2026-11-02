import Link from "next/link";
import type { Category, CategorySlug } from "@/types/product";

interface ShopHeaderProps {
  title: string;
  description: string;
  categories: Category[];
  current?: CategorySlug;
}

/** Title block and category tabs shared by /shop and /shop/[category]. */
export function ShopHeader({ title, description, categories, current }: ShopHeaderProps) {
  const tabs = [{ href: "/shop", label: "All", active: !current }].concat(
    categories.map((c) => ({ href: `/shop/${c.slug}`, label: c.name, active: c.slug === current })),
  );

  return (
    <header className="container-page pt-12 pb-8 md:pt-20 md:pb-12">
      {current && (
        <nav aria-label="Breadcrumb" className="type-label mb-6 text-grey-600">
          <ol className="flex gap-2">
            <li>
              <Link href="/shop" className="hover:text-ink">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {title}
            </li>
          </ol>
        </nav>
      )}
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h1 className="type-display animate-lift text-display-xl md:col-span-8">{title}</h1>
        <p className="max-w-sm animate-rise text-grey-600 [animation-delay:120ms] md:col-span-4 md:justify-self-end">
          {description}
        </p>
      </div>
      <nav aria-label="Categories" className="mt-10 -mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        <ul className="flex gap-6 border-b border-ink/10 whitespace-nowrap">
          {tabs.map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className="type-label -mb-px inline-block border-b-2 border-transparent pb-3 text-grey-600 transition-colors hover:text-ink aria-[current=page]:border-accent aria-[current=page]:text-ink"
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
