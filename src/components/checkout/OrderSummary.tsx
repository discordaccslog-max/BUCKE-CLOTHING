"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { UNNAMED_COLOR } from "@/types/product";
import { TextField } from "./fields";

/** Line items, discount code and totals, read from the live cart. */
export function OrderSummary() {
  const { lines, subtotal } = useCart();
  const [code, setCode] = useState("");

  return (
    <div className="text-co-ink">
      <ul className="space-y-4" aria-label="Items in your order">
        {lines.map((line) => {
          const variant = [line.colorName !== UNNAMED_COLOR && line.colorName, line.size].filter(Boolean).join(" / ");
          const lineTotal = line.price * line.quantity;
          const lineRegular = (line.compareAtPrice ?? line.price) * line.quantity;
          return (
            <li key={line.key} className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="relative size-16 overflow-hidden rounded-lg border border-co-line bg-white">
                  <Image src={line.image.src} alt="" fill sizes="64px" className="object-contain p-1" />
                </div>
                <span
                  className="absolute -top-2 -right-2 inline-flex h-[21px] min-w-[21px] items-center justify-center rounded-full bg-co-ink px-1.5 text-xs font-medium text-white tabular-nums"
                  aria-label={`Quantity ${line.quantity}`}
                >
                  {line.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{line.name}</p>
                <p className="mt-0.5 text-[13px] text-co-muted">{variant}</p>
              </div>
              <p className="shrink-0 text-right text-sm tabular-nums">
                {lineRegular > lineTotal && (
                  <s className="mr-1.5 text-[13px] text-co-muted">
                    <span className="sr-only">Was </span>
                    {formatPrice(lineRegular)}
                  </s>
                )}
                {formatPrice(lineTotal)}
              </p>
            </li>
          );
        })}
      </ul>

      <form className="mt-6 flex gap-3" aria-label="Discount code" onSubmit={(e) => e.preventDefault()} noValidate>
        <TextField
          label="Discount code"
          name="discount"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1"
        />
        <button
          type="submit"
          disabled={code.trim() === ""}
          className="h-[52px] shrink-0 rounded-lg border border-co-ink bg-co-ink px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-black disabled:border-co-line disabled:bg-black/5 disabled:text-co-muted"
        >
          Apply
        </button>
      </form>

      <dl className="mt-6 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="mt-2 flex justify-between gap-4">
          <dt>Shipping</dt>
          <dd>Free</dd>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <dt className="text-[19px] font-semibold">Total</dt>
          <dd className="flex items-baseline gap-2">
            <span className="text-xs text-co-muted">USD</span>
            <span className="text-[19px] font-semibold tabular-nums">{formatPrice(subtotal)}</span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
