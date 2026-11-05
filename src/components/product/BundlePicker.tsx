"use client";

import Image from "next/image";
import { useId, type RefObject } from "react";
import type { BundleTier } from "@/data/storefront";
import { bundlePrice } from "@/lib/bundles";
import { cn, formatPrice } from "@/lib/format";
import { UNNAMED_COLOR, type Product } from "@/types/product";

export interface BundleItem {
  color: string;
  size: string;
}

interface BundlePickerProps {
  product: Product;
  heading: string;
  tiers: BundleTier[];
  quantity: number;
  onQuantityChange: (q: number) => void;
  items: BundleItem[];
  onItemChange: (index: number, patch: Partial<BundleItem>) => void;
  /** Indexes of items still missing a size, after a failed Buy Now. */
  missing: number[];
  sizeRefs: RefObject<(HTMLSelectElement | null)[]>;
  onOpenSizeGuide: () => void;
}

const selectClass =
  "h-11 w-full min-w-0 appearance-none rounded-md border bg-white bg-no-repeat pl-3 pr-8 text-sm disabled:opacity-100";

/** Chevron drawn into the select's background, since appearance-none removes the native one. */
const selectStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundSize: "14px",
  backgroundPosition: "right 0.6rem center",
};

export function BundlePicker({
  product,
  heading,
  tiers,
  quantity,
  onQuantityChange,
  items,
  onItemChange,
  missing,
  sizeRefs,
  onOpenSizeGuide,
}: BundlePickerProps) {
  const headingId = useId();
  const errorId = useId();
  const name = useId();
  const choosableColor = product.colors.length > 1 || product.colors[0].name !== UNNAMED_COLOR;

  return (
    <div>
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-black/15" />
        <span id={headingId} className="text-[0.7rem] font-bold tracking-[0.14em] uppercase">
          {heading}
        </span>
        <span className="h-px flex-1 bg-black/15" />
      </div>

      <div role="radiogroup" aria-label={heading} className="mt-4 space-y-3">
        {tiers.map((tier) => {
          const selected = tier.quantity === quantity;
          const price = bundlePrice(product.price, tier.quantity);
          const full = (product.compareAtPrice ?? product.price) * tier.quantity;
          const inputId = `${name}-${tier.quantity}`;
          return (
            <div
              key={tier.quantity}
              className={cn(
                "relative rounded-lg border transition-colors",
                selected ? "border-black bg-white ring-1 ring-black" : "border-black/15 bg-black/[0.03] hover:border-black/40",
              )}
            >
              <label htmlFor={inputId} className="flex min-h-16 cursor-pointer items-center gap-3 py-3 pr-14 pl-4">
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={tier.quantity}
                  checked={selected}
                  onChange={() => onQuantityChange(tier.quantity)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                    selected ? "border-black" : "border-black/30",
                  )}
                >
                  {selected && <span className="h-2.5 w-2.5 rounded-full bg-black" />}
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold uppercase">{tier.label}</span>
                  {tier.tag && (
                    <span className="rounded bg-black/[0.06] px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-wide uppercase">
                      {tier.tag}
                    </span>
                  )}
                </span>
                <span className="ml-auto text-right tabular-nums">
                  <span className="block font-bold">{formatPrice(price)}</span>
                  {full > price && (
                    <s className="block text-xs text-grey-500">
                      <span className="sr-only">Regular price </span>
                      {formatPrice(full)}
                    </s>
                  )}
                </span>
              </label>

              {tier.sticker && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-6 -right-3 flex h-14 w-14 rotate-12 items-center justify-center rounded-full bg-black text-center text-[0.6rem] leading-tight font-bold text-white uppercase shadow-md"
                >
                  {tier.sticker}
                </span>
              )}

              {selected && (
                <div className="border-t border-black/10 px-4 pt-3 pb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold">{choosableColor ? "Color, Size" : "Size"}</span>
                    <button
                      type="button"
                      onClick={onOpenSizeGuide}
                      className="-my-3 inline-flex min-h-11 items-center text-xs underline underline-offset-4"
                      aria-haspopup="dialog"
                    >
                      Size guide
                    </button>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {items.slice(0, tier.quantity).map((item, i) => {
                      const color = product.colors.find((c) => c.slug === item.color) ?? product.colors[0];
                      const isMissing = missing.includes(i);
                      const label = tier.quantity > 1 ? `Item ${i + 1}` : product.name;
                      return (
                        <li key={i} className="flex items-center gap-2">
                          {tier.quantity > 1 && (
                            <span className="w-5 shrink-0 text-xs font-semibold text-grey-600">#{i + 1}</span>
                          )}
                          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white">
                            <Image src={color.images[0].src} alt="" fill sizes="44px" className="object-contain p-0.5" />
                          </span>
                          {choosableColor && (
                            <select
                              aria-label={`${label}: color`}
                              value={color.slug}
                              onChange={(e) => onItemChange(i, { color: e.target.value })}
                              className={cn(selectClass, "border-black/15")}
                              style={selectStyle}
                              disabled={product.colors.length === 1}
                            >
                              {product.colors.map((c) => (
                                <option key={c.slug} value={c.slug}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          )}
                          <select
                            ref={(el) => {
                              sizeRefs.current[i] = el;
                            }}
                            aria-label={`${label}: size`}
                            aria-invalid={isMissing || undefined}
                            aria-describedby={isMissing ? errorId : undefined}
                            value={item.size}
                            onChange={(e) => onItemChange(i, { size: e.target.value })}
                            className={cn(selectClass, isMissing ? "border-accent" : "border-black/15")}
                            style={selectStyle}
                          >
                            <option value="" disabled>
                              Size
                            </option>
                            {product.sizes.map((s) => {
                              const soldOut = product.soldOutSizes.includes(s);
                              return (
                                <option key={s} value={s} disabled={soldOut}>
                                  {s}
                                  {soldOut ? " (sold out)" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </li>
                      );
                    })}
                  </ul>
                  <p id={errorId} role="alert" className="mt-2 min-h-4 text-xs text-accent">
                    {missing.length > 0 ? "Choose a size for every item." : ""}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
