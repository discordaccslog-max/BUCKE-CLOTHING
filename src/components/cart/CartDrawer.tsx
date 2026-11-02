"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { CHECKOUT_ENABLED, startCheckout } from "@/lib/checkout";
import { cn, formatPrice } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Sheet } from "@/components/ui/Sheet";
import { MAX_QUANTITY } from "./cart-store";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { lines, count, subtotal, isOpen, closeCart, setQuantity, removeLine } = useCart();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const noteId = useId();

  async function onCheckout() {
    if (!CHECKOUT_ENABLED || pending) return;
    setPending(true);
    setMessage(null);
    const result = await startCheckout(lines);
    if (result.status === "redirect") {
      window.location.assign(result.url);
      return;
    }
    setMessage(result.message);
    setPending(false);
  }

  const footer =
    lines.length > 0 ? (
      <div className="space-y-4 px-5 py-5 md:px-6">
        <div className="flex items-baseline justify-between">
          <span className="type-label">Subtotal</span>
          <span className="text-lg tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        <p id={noteId} className="text-xs text-grey-600">
          {CHECKOUT_ENABLED
            ? "Shipping and taxes calculated at checkout."
            : "Online checkout is coming soon. Your bag is saved on this device."}
        </p>
        <button
          type="button"
          onClick={onCheckout}
          aria-disabled={!CHECKOUT_ENABLED || pending}
          aria-describedby={noteId}
          className={buttonClasses(
            "solid",
            cn("w-full justify-between", !CHECKOUT_ENABLED && "bg-grey-300 text-grey-700 hover:bg-grey-300"),
          )}
        >
          <span>Checkout</span>
          {CHECKOUT_ENABLED ? (
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          ) : (
            <span className="border border-grey-700/40 px-2 py-1 text-[0.625rem]">Coming soon</span>
          )}
        </button>
        {message && (
          <p role="status" className="text-xs text-accent">
            {message}
          </p>
        )}
      </div>
    ) : null;

  return (
    <Sheet open={isOpen} onClose={closeCart} title={`Bag (${count})`} footer={footer}>
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-start justify-center gap-6 px-5 py-16 md:px-6">
          <p className="type-display text-display-md">Your bag is empty.</p>
          <Link href="/shop" onClick={closeCart} className={buttonClasses("outline")}>
            Shop the collection
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-ink/10">
          {lines.map((line) => (
            <li key={line.key} className="flex gap-4 px-5 py-5 md:px-6">
              <Link
                href={`/product/${line.slug}`}
                onClick={closeCart}
                className="relative block aspect-[4/5] w-20 shrink-0 overflow-hidden bg-grey-100"
                tabIndex={-1}
                aria-hidden="true"
              >
                <Image src={line.image.src} alt="" fill sizes="80px" className="object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={closeCart}
                    className="text-sm font-medium uppercase tracking-wide hover:underline"
                  >
                    {line.name}
                  </Link>
                  <span className="text-sm tabular-nums">{formatPrice(line.price * line.quantity)}</span>
                </div>
                <p className="mt-1 text-xs text-grey-600">
                  {line.colorName} · Size {line.size}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <QuantityStepper
                    size="sm"
                    value={line.quantity}
                    min={1}
                    max={MAX_QUANTITY}
                    onChange={(q) => setQuantity(line.key, q)}
                    label={`${line.name}, ${line.colorName}, size ${line.size}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    className="text-xs text-grey-600 underline underline-offset-4 hover:text-ink"
                    aria-label={`Remove ${line.name}, ${line.colorName}, size ${line.size} from bag`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
