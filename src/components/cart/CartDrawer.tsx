"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { PaymentIcons } from "@/components/commerce/PaymentIcons";
import { bigButtonClasses } from "@/components/commerce/styles";
import { useDeliveryRange } from "@/components/product/DeliveryEstimate";
import { buttonClasses } from "@/components/ui/Button";
import { LockIcon, TrashIcon, TruckIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Sheet } from "@/components/ui/Sheet";
import { checkoutExtras } from "@/data/storefront";
import { CHECKOUT_ENABLED, startCheckout } from "@/lib/checkout";
import { cn, formatPrice } from "@/lib/format";
import { UNNAMED_COLOR } from "@/types/product";
import { MAX_QUANTITY } from "./cart-store";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { lines, count, subtotal, isOpen, closeCart, setQuantity, removeLine } = useCart();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const noteId = useId();
  const deliveryRange = useDeliveryRange();

  // Savings only exist for items with a real compare-at (sale) price.
  const regularTotal = lines.reduce((n, l) => n + (l.compareAtPrice ?? l.price) * l.quantity, 0);
  const savings = regularTotal - subtotal;

  async function onCheckout() {
    if (pending) return;
    if (!CHECKOUT_ENABLED) {
      setMessage("Online checkout is coming soon. Your bag is saved on this device.");
      return;
    }
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

  const heading = (
    <span className="flex items-center gap-3">
      <span className="text-2xl font-bold tracking-tight">Your Cart</span>
      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-black px-2 text-sm font-bold text-white tabular-nums">
        {count}
      </span>
    </span>
  );

  const footer =
    lines.length > 0 ? (
      <div className="space-y-3 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
        {deliveryRange && (
          <p className="flex items-center gap-2 text-sm">
            <TruckIcon width={20} height={20} className="shrink-0" />
            <span>
              Estimated delivery: <span className="font-semibold">{deliveryRange}</span>
            </span>
          </p>
        )}

        <dl className="space-y-1.5">
          {savings > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-base">Savings</dt>
              <dd className="inline-flex items-center gap-1.5 rounded-md bg-black px-2.5 py-1 text-sm font-semibold text-white tabular-nums">
                −{formatPrice(savings)}
              </dd>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <dt className="text-lg font-bold">
              Total: {count} {count === 1 ? "Item" : "Items"}
            </dt>
            <dd className="text-lg tabular-nums">
              {savings > 0 && <s className="mr-2 font-normal text-grey-500">{formatPrice(regularTotal)}</s>}
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onCheckout}
          aria-disabled={!CHECKOUT_ENABLED || pending}
          aria-describedby={noteId}
          aria-busy={pending || undefined}
          className={cn(bigButtonClasses, !CHECKOUT_ENABLED && "cursor-not-allowed")}
        >
          <LockIcon width={22} height={22} />
          {pending ? "One moment…" : "Secure checkout"}
        </button>

        <div id={noteId} className="space-y-0.5 text-center">
          <p className="text-sm">100% Satisfaction Guarantee</p>
          <p className="text-xs text-grey-600">
            {CHECKOUT_ENABLED ? "Shipping and taxes calculated at checkout." : "Online checkout is coming soon."}
          </p>
        </div>
        {message && (
          <p role="status" className="text-center text-xs text-accent">
            {message}
          </p>
        )}
        <PaymentIcons methods={checkoutExtras.paymentMethods} />
      </div>
    ) : null;

  return (
    <Sheet open={isOpen} onClose={closeCart} title={`Your cart, ${count} items`} heading={heading} tone="white" footer={footer}>
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-start justify-center gap-6 px-5 py-16 md:px-6">
          <p className="text-3xl font-bold tracking-tight">Your cart is empty.</p>
          <Link href="/shop" onClick={closeCart} className={buttonClasses("outline")}>
            Shop the collection
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-black/10">
          {lines.map((line) => {
            const lineTotal = line.price * line.quantity;
            const lineRegular = (line.compareAtPrice ?? line.price) * line.quantity;
            const lineSaving = lineRegular - lineTotal;
            const details = [line.colorName !== UNNAMED_COLOR && `Color: ${line.colorName}`, `Size: ${line.size}`]
              .filter(Boolean)
              .join(",  ");
            return (
              <li key={line.key} className="flex gap-4 px-5 py-5 md:px-6">
                <Link
                  href={`/product/${line.slug}`}
                  onClick={closeCart}
                  className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-md bg-white"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <Image src={line.image.src} alt="" fill sizes="96px" className="object-contain" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/product/${line.slug}`}
                      onClick={closeCart}
                      className="text-lg leading-tight font-bold tracking-tight hover:underline"
                    >
                      {line.name}
                    </Link>
                    <span className="shrink-0 text-right text-sm tabular-nums">
                      {lineSaving > 0 && <s className="mr-1.5 text-grey-500">{formatPrice(lineRegular)}</s>}
                      {formatPrice(lineTotal)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-grey-600">{details}</p>
                    {lineSaving > 0 && (
                      <span className="shrink-0 rounded-full bg-black/[0.07] px-2.5 py-0.5 text-xs font-medium tabular-nums">
                        Save {formatPrice(lineSaving)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-5">
                    <QuantityStepper
                      size="sm"
                      value={line.quantity}
                      min={1}
                      max={MAX_QUANTITY}
                      onChange={(q) => setQuantity(line.key, q)}
                      label={`${line.name}, ${line.colorName}, size ${line.size}`}
                      className="rounded-md border-black/20 [&>*+*]:border-l [&>*+*]:border-black/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="-m-2 inline-flex h-11 w-11 items-center justify-center hover:opacity-60"
                      aria-label={`Remove ${line.name}, ${line.colorName}, size ${line.size} from cart`}
                    >
                      <TrashIcon width={22} height={22} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
