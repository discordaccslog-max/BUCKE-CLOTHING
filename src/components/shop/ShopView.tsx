"use client";

import { useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { Sheet } from "@/components/ui/Sheet";
import { buttonClasses } from "@/components/ui/Button";
import {
  EMPTY_FILTERS,
  PRICE_BANDS,
  SORT_OPTIONS,
  activeFilterCount,
  applyFilters,
  parseFilters,
  serializeFilters,
  sizeFacet,
  type FilterState,
  type SortValue,
} from "@/lib/filters";
import type { Category, Product } from "@/types/product";
import { FilterPanel } from "./FilterPanel";

// Matches the grid: 4 columns beside the filter sidebar on xl, 3 on md/lg, 2 on mobile.
export const GRID_SIZES = "(min-width: 1280px) 20vw, (min-width: 1024px) 24vw, (min-width: 768px) 31vw, 47vw";

interface ShopViewProps {
  products: Product[];
  categories: Category[];
  /** Path the filter query string is applied to, e.g. "/shop/hoodies". */
  basePath: string;
  showCategoryFilter: boolean;
}

/**
 * Client-side filtering over the local catalogue. The URL is the source of
 * truth: controls write search params with history.replaceState (no
 * server round-trip), and useSearchParams reads them back.
 */
export function ShopView(props: ShopViewProps) {
  const searchParams = useSearchParams();
  const state = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);

  function onChange(next: FilterState) {
    const qs = serializeFilters(next);
    window.history.replaceState(null, "", qs ? `${props.basePath}?${qs}` : props.basePath);
  }

  return <ShopLayout {...props} state={state} onChange={onChange} />;
}

/** Server-rendered stand-in shown until the URL has been read on the client. */
export function ShopViewFallback(props: ShopViewProps) {
  return <ShopLayout {...props} state={EMPTY_FILTERS} />;
}

function ShopLayout({
  products,
  categories,
  showCategoryFilter,
  state,
  onChange,
}: ShopViewProps & { state: FilterState; onChange?: (next: FilterState) => void }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const sortId = useId();
  const resultsId = useId();
  const headingId = useId();
  const sizes = useMemo(() => sizeFacet(products), [products]);
  const results = useMemo(() => applyFilters(products, state), [products, state]);
  const count = activeFilterCount(state);
  const change = onChange ?? (() => {});

  const panel = (
    <FilterPanel
      state={state}
      onChange={change}
      categories={categories}
      sizes={sizes}
      showCategories={showCategoryFilter}
    />
  );

  const chips = [
    ...state.categories.map((v) => ({
      label: categories.find((c) => c.slug === v)?.name ?? v,
      remove: () => change({ ...state, categories: state.categories.filter((x) => x !== v) }),
    })),
    ...state.sizes.map((v) => ({
      label: `Size ${v}`,
      remove: () => change({ ...state, sizes: state.sizes.filter((x) => x !== v) }),
    })),
    ...state.prices.map((v) => ({
      label: PRICE_BANDS.find((b) => b.value === v)?.label ?? v,
      remove: () => change({ ...state, prices: state.prices.filter((x) => x !== v) }),
    })),
  ];

  return (
    <div className="container-page pb-24 md:pb-32">
      {/* Toolbar */}
      <div className="sticky top-(--header-h) z-20 -mx-4 flex items-center justify-between gap-4 border-y border-ink/10 bg-bone/95 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8 lg:static lg:mx-0 lg:border-x-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="type-label inline-flex h-10 items-center gap-2 lg:hidden"
          aria-haspopup="dialog"
        >
          <FilterIcon />
          Filter{count > 0 && ` (${count})`}
        </button>
        <p id={resultsId} className="type-label hidden text-grey-600 lg:block">
          {results.length} {results.length === 1 ? "product" : "products"}
        </p>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {results.length} {results.length === 1 ? "product" : "products"} shown
        </p>
        <div className="flex items-center gap-3">
          <label htmlFor={sortId} className="type-label text-grey-600">
            Sort
          </label>
          <select
            id={sortId}
            value={state.sort}
            onChange={(e) => change({ ...state, sort: e.target.value as SortValue })}
            className="type-label h-10 cursor-pointer border border-ink/20 bg-transparent pr-8 pl-3 hover:border-ink"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-8">
        <aside aria-label="Filters" className="hidden lg:col-span-3 lg:block xl:col-span-2">
          <div className="sticky top-[calc(var(--header-h)+2rem)]">{panel}</div>
        </aside>

        <section aria-labelledby={headingId} className="lg:col-span-9 xl:col-span-10">
          <h2 id={headingId} className="sr-only">
            Products
          </h2>
          {chips.length > 0 && (
            <ul className="mb-6 flex flex-wrap gap-2" aria-label="Active filters">
              {chips.map((chip) => (
                <li key={chip.label}>
                  <button
                    type="button"
                    onClick={chip.remove}
                    className="inline-flex h-8 items-center gap-2 border border-ink/20 px-3 text-xs hover:border-ink"
                    aria-label={`Remove filter: ${chip.label}`}
                  >
                    {chip.label}
                    <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {results.length === 0 ? (
            <div className="flex flex-col items-start gap-6 py-20">
              <p className="type-display text-display-md">Nothing matches those filters.</p>
              <button
                type="button"
                onClick={() => change({ ...state, categories: [], sizes: [], prices: [] })}
                className={buttonClasses("outline")}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul
              key={serializeFilters(state)}
              className="grid animate-fade grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-14 xl:grid-cols-4"
            >
              {results.map((product, i) => (
                <Reveal as="li" key={product.id} delay={(i % 4) * 0.06}>
                  <ProductCard product={product} sizes={GRID_SIZES} preload={i < 2} />
                </Reveal>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filter"
        side="bottom"
        footer={
          <div className="p-4">
            <button type="button" onClick={() => setSheetOpen(false)} className={buttonClasses("solid", "w-full")}>
              Show {results.length} {results.length === 1 ? "result" : "results"}
            </button>
          </div>
        }
      >
        <div className="px-5 py-6">{panel}</div>
      </Sheet>
    </div>
  );
}
