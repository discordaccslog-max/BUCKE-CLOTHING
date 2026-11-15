"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { cn, formatPrice } from "@/lib/format";
import { UNNAMED_COLOR } from "@/types/product";
import { TextField } from "./fields";

/** Line items, discount code and totals, read from the live cart. */
export function OrderSummary() {
  const { lines, count, subtotal } = useCart();
  const [code, setCode] = useState("");

  return (
    <div>
      <ul className="space-y-4" aria-label="Items in your order">
        {lines.map((line) => {
          const variant = [line.colorName !== UNNAMED_COLOR && line.colorName, line.size].filter(Boolean).join(" / ");
          const lineTotal = line.price * line.quantity;
          const lineRegular = (line.compareAtPrice ?? line.price) * line.quantity;
          return (
            <li key={line.key} className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="relative size-16 overflow-hidden rounded-md border border-grey-200 bg-white">
                  <Image src={line.image.src} alt="" fill sizes="64px" className="object-contain p-1" />
                </div>
                <span
                  className="absolute -top-2 -right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-grey-700 px-1.5 text-xs font-semibold text-white tabular-nums"
                  aria-label={`Quantity ${line.quantity}`}
                >
                  {line.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug font-medium">{line.name}</p>
                <p className="mt-0.5 text-xs text-grey-600">{variant}</p>
              </div>
              <p className="shrink-0 text-right text-sm tabular-nums">
                {lineRegular > lineTotal && (
                  <s className="mr-1.5 text-xs text-grey-500">
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

      <form
        className="mt-6 flex gap-3"
        aria-label="Discount code"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
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
          className={cn(
            "type-label h-14 shrink-0 rounded-md px-5 transition-colors duration-150",
            "bg-ink text-bone hover:bg-grey-800 disabled:bg-grey-100 disabled:text-grey-500 disabled:hover:bg-grey-100",
          )}
        >
          Apply
        </button>
      </form>

      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt>
            Subtotal <span className="text-grey-600">· {count} {count === 1 ? "item" : "items"}</span>
          </dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Shipping</dt>
          <dd>Free</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 pt-3">
          <dt className="text-lg font-bold">Total</dt>
          <dd className="flex items-baseline gap-2">
            <span className="text-xs text-grey-500">USD</span>
            <span className="text-2xl font-bold tracking-tight tabular-nums">{formatPrice(subtotal)}</span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
