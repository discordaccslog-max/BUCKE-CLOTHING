"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { PRICE_BANDS, activeFilterCount, type FilterState, type PriceBand } from "@/lib/filters";
import type { Category, CategorySlug } from "@/types/product";

interface FilterPanelProps {
  state: FilterState;
  onChange: (next: FilterState) => void;
  categories: Category[];
  sizes: string[];
  /** Hide the category group on category-scoped pages. */
  showCategories: boolean;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-ink/10 pt-5">
      <legend className="type-label float-left mb-4 w-full">{legend}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="flex h-4 w-4 shrink-0 items-center justify-center border border-ink/40 transition-colors peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent group-hover:border-ink"
      >
        <svg viewBox="0 0 12 12" className={cn("h-2.5 w-2.5 text-bone", !checked && "invisible")}>
          <path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      <span className="text-ink/80 group-hover:text-ink peer-checked:text-ink">{children}</span>
    </label>
  );
}

export function FilterPanel({ state, onChange, categories, sizes, showCategories }: FilterPanelProps) {
  const count = activeFilterCount(state);

  return (
    <div className="space-y-6">
      {showCategories && (
        <Group legend="Category">
          {categories.map((c) => (
            <CheckRow
              key={c.slug}
              checked={state.categories.includes(c.slug)}
              onChange={() =>
                onChange({ ...state, categories: toggle<CategorySlug>(state.categories, c.slug) })
              }
            >
              {c.name}
            </CheckRow>
          ))}
        </Group>
      )}

      <Group legend="Size">
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => {
            const checked = state.sizes.includes(size);
            return (
              <label key={size} className="relative">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange({ ...state, sizes: toggle(state.sizes, size) })}
                  className="peer sr-only"
                />
                <span className="flex h-10 cursor-pointer items-center justify-center border border-ink/20 text-sm transition-colors hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bone peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                  <span className="sr-only">Size </span>
                  {size}
                </span>
              </label>
            );
          })}
        </div>
      </Group>

      <Group legend="Price">
        {PRICE_BANDS.map((band) => (
          <CheckRow
            key={band.value}
            checked={state.prices.includes(band.value)}
            onChange={() => onChange({ ...state, prices: toggle<PriceBand>(state.prices, band.value) })}
          >
            {band.label}
          </CheckRow>
        ))}
      </Group>

      {count > 0 && (
        <button
          type="button"
          onClick={() => onChange({ ...state, categories: [], sizes: [], prices: [] })}
          className="type-label border-b border-ink/40 pb-1 hover:border-ink"
        >
          Clear all filters ({count})
        </button>
      )}
    </div>
  );
}
