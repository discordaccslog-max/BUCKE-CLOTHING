/**
 * Shop filtering and sorting. Pure functions shared by server and client.
 * Filter state is serialized to and from URL search params so filtered views
 * are linkable and survive reloads.
 *
 *   ?category=hoodies,longsleeves&size=M,L&price=100-150&sort=price-asc
 */
import type { CategorySlug, Product } from "@/types/product";
import { CATEGORY_SLUGS } from "@/types/product";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
] as const;
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/** Price bands in whole dollars. `max: null` means "and up". */
export const PRICE_BANDS = [
  { value: "0-25", label: "Under $25", min: 0, max: 25 },
  { value: "25-30", label: "$25 – $30", min: 25, max: 30 },
  { value: "30-35", label: "$30 – $35", min: 30, max: 35 },
  { value: "35-plus", label: "$35 and up", min: 35, max: null },
] as const;
export type PriceBand = (typeof PRICE_BANDS)[number]["value"];

/** Canonical display order for sizes across tops and waist sizes. */
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export function compareSizes(a: string, b: string): number {
  const ai = SIZE_ORDER.indexOf(a);
  const bi = SIZE_ORDER.indexOf(b);
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;
  const an = Number(a);
  const bn = Number(b);
  if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
  return a.localeCompare(b);
}

export interface FilterState {
  categories: CategorySlug[];
  sizes: string[];
  prices: PriceBand[];
  sort: SortValue;
}

export const EMPTY_FILTERS: FilterState = {
  categories: [],
  sizes: [],
  prices: [],
  sort: "featured",
};

function list(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function parseFilters(params: URLSearchParams): FilterState {
  const sort = params.get("sort");
  return {
    categories: list(params, "category").filter((c): c is CategorySlug =>
      (CATEGORY_SLUGS as readonly string[]).includes(c),
    ),
    sizes: list(params, "size"),
    prices: list(params, "price").filter((p): p is PriceBand =>
      PRICE_BANDS.some((b) => b.value === p),
    ),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortValue) : "featured",
  };
}

export function serializeFilters(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.categories.length) params.set("category", state.categories.join(","));
  if (state.sizes.length) params.set("size", state.sizes.join(","));
  if (state.prices.length) params.set("price", state.prices.join(","));
  if (state.sort !== "featured") params.set("sort", state.sort);
  // Keep commas readable in the address bar.
  return params.toString().replace(/%2C/g, ",");
}

export function activeFilterCount(state: FilterState): number {
  return state.categories.length + state.sizes.length + state.prices.length;
}

function inPriceBands(cents: number, bands: PriceBand[]): boolean {
  if (!bands.length) return true;
  const dollars = cents / 100;
  return bands.some((value) => {
    const band = PRICE_BANDS.find((b) => b.value === value)!;
    return dollars >= band.min && (band.max === null || dollars < band.max);
  });
}

export function applyFilters(products: Product[], state: FilterState): Product[] {
  const filtered = products.filter(
    (p) =>
      (!state.categories.length || state.categories.includes(p.category)) &&
      (!state.sizes.length ||
        state.sizes.some((s) => p.sizes.includes(s) && !p.soldOutSizes.includes(s))) &&
      inPriceBands(p.price, state.prices),
  );

  const sorted = [...filtered];
  switch (state.sort) {
    case "newest":
      sorted.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    default:
      sorted.sort((a, b) => a.featuredRank - b.featuredRank);
  }
  return sorted;
}

/** All sizes present in a product set, in display order. */
export function sizeFacet(products: Product[]): string[] {
  return [...new Set(products.flatMap((p) => p.sizes))].sort(compareSizes);
}
