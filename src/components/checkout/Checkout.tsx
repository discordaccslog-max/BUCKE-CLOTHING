"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { BuckMark } from "@/components/brand/BuckMark";
import { useCart } from "@/components/cart/CartProvider";
import { PaymentMark } from "@/components/commerce/PaymentIcons";
import { bigButtonClasses } from "@/components/commerce/styles";
import { useShippingRange } from "@/components/product/DeliveryEstimate";
import { buttonClasses } from "@/components/ui/Button";
import { BoltIcon, CheckIcon, ChevronIcon, TruckIcon } from "@/components/ui/icons";
import { shippingOptions, type ShippingOptionId } from "@/data/storefront";
import { cn, formatPrice } from "@/lib/format";
import type { ReviewSummary } from "@/types/review";
import { CheckoutRatingLockup } from "./CheckoutRatingLockup";
import { RadioCard, SelectField, sectionHeading, TextField } from "./fields";
import { OrderSummary } from "./OrderSummary";

const COUNTRIES = [
  { code: "US", name: "United States", region: "State", postal: "ZIP code" },
  { code: "CA", name: "Canada", region: "Province", postal: "Postal code" },
  { code: "GB", name: "United Kingdom", region: "County", postal: "Postcode" },
  { code: "AU", name: "Australia", region: "State/territory", postal: "Postcode" },
] as const;

const CARD_MARKS = ["visa", "mastercard", "amex", "discover"] as const;

const WORDMARK = [..."Bucke"];

const SHIPPING_ICONS ={ standard: TruckIcon, express: BoltIcon } satisfies Record<ShippingOptionId, unknown>;

const noop = () => () => {};

export function Checkout({ rating }: { rating: ReviewSummary | null }) {
  const { lines, subtotal } = useCart();
  // The cart lives in localStorage, so it is only known after hydration.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [shippingId, setShippingId] = useState<ShippingOptionId>(shippingOptions[0].id);
  const shipping = (shippingOptions.find((o) => o.id === shippingId) ?? shippingOptions[0]).price;
  const summaryId = useId();

  return (
    <div data-checkout data-surface="white" className="flex min-h-dvh flex-col bg-white">
      <h1 className="sr-only">Checkout</h1>
      {/* Header: big wordmark on the left, the buck mark with the Trustpilot
          rating under it in the centre (right-aligned on mobile). "BUCKE"
          rises in letter by letter, then the centre lockup pops in (CSS
          keyframes in globals.css, transform + opacity only, so nothing
          shifts). Plays once per page load. */}
      <div className="flex items-center justify-center gap-8 border-b border-grey-200 px-4 py-6 sm:px-8 md:grid md:grid-cols-[1fr_auto_1fr] md:py-8 lg:px-12">
        <Link
          href="/"
          aria-label="Bucke, home"
          className="type-display justify-self-start text-[2.25rem] leading-[0.85] tracking-[0.02em] whitespace-nowrap md:text-[3.25rem] lg:text-[4rem] xl:text-[4.75rem]"
        >
          {WORDMARK.map((letter, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="inline-block animate-lockup-letter"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {letter}
            </span>
          ))}
        </Link>
        <Link href="/" tabIndex={-1} className="inline-flex animate-lockup-mark">
          {rating ? <CheckoutRatingLockup summary={rating} /> : <BuckMark className="h-10 w-auto md:h-14" />}
        </Link>
      </div>

      {hydrated && lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <p className="text-3xl font-bold tracking-tight">Your cart is empty.</p>
          <Link href="/shop" className={buttonClasses("outline")}>
            Shop the collection
          </Link>
        </div>
      ) : (
        <div className="flex-1 lg:grid lg:grid-cols-[55fr_45fr]">
          {/* Mobile: the summary collapses into a bar above the form. */}
          <div className="border-b border-grey-200 bg-bone lg:hidden">
            <button
              type="button"
              onClick={() => setSummaryOpen((o) => !o)}
              aria-expanded={summaryOpen}
              aria-controls={summaryId}
              className="mx-auto flex h-16 w-full max-w-xl items-center justify-between gap-4 px-4 sm:px-8"
            >
              <span className="flex items-center gap-1.5 text-sm text-accent">
                {summaryOpen ? "Hide order summary" : "Show order summary"}
                <ChevronIcon
                  width={16}
                  height={16}
                  className={summaryOpen ? "-rotate-90 transition-transform" : "rotate-90 transition-transform"}
                />
              </span>
              <span className="text-lg font-bold tabular-nums">{hydrated ? formatPrice(subtotal + shipping) : ""}</span>
            </button>
            <div id={summaryId} hidden={!summaryOpen} className="border-t border-grey-200">
              <div className="mx-auto max-w-xl px-4 py-6 sm:px-8">
                <OrderSummary shipping={shipping} />
              </div>
            </div>
          </div>

          <div className="px-4 py-8 sm:px-8 lg:py-12 lg:pr-12 xl:pr-16">
            <div className="mx-auto max-w-xl lg:mr-0 lg:ml-auto">
              <CheckoutForm shippingId={shippingId} onShippingChange={setShippingId} />
            </div>
          </div>

          <aside aria-label="Order summary" className="hidden border-l border-grey-200 bg-bone lg:block">
            <div className="sticky top-0 max-h-dvh max-w-md overflow-y-auto px-8 py-12 xl:px-12">
              <OrderSummary shipping={shipping} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function ShippingOption({
  option,
  checked,
  onSelect,
}: {
  option: (typeof shippingOptions)[number];
  checked: boolean;
  onSelect: () => void;
}) {
  const estimate = useShippingRange(option.transitDays);
  const [first, last] = option.transitDays;
  const Icon = SHIPPING_ICONS[option.id];
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] p-5 transition-[border-color,background-color,box-shadow,translate] duration-150 ease-out sm:gap-4",
        checked
          ? "border-ink bg-tint"
          : "border-grey-200 bg-white hover:-translate-y-0.5 hover:border-grey-400 hover:shadow-[0_8px_20px_-10px_rgb(14_14_13/0.22)]",
      )}
    >
      {/* Radio: a ring that fills with a checkmark when selected. */}
      <span className="relative mt-3 flex size-5 shrink-0 items-center justify-center">
        <input
          type="radio"
          name="shipping"
          value={option.id}
          checked={checked}
          onChange={onSelect}
          className="peer absolute inset-0 m-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-grey-300 bg-white transition-colors duration-150 checked:border-ink checked:bg-ink"
        />
        <CheckIcon
          width={12}
          height={12}
          strokeWidth={3}
          className="pointer-events-none relative text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
        />
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg text-ink transition-colors duration-150 sm:size-11",
          checked ? "bg-white" : "bg-tint",
        )}
      >
        <Icon width={22} height={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-base leading-snug font-semibold text-ink">{option.name}</span>
            {option.badge && (
              <span className="rounded bg-ink px-1.5 py-1 text-[10px] leading-none font-semibold tracking-[0.08em] text-white uppercase">
                {option.badge}
              </span>
            )}
          </span>
          {option.price === 0 ? (
            <span className="mt-0.5 shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-[11px] leading-none font-semibold tracking-[0.06em] text-success uppercase">
              Free
            </span>
          ) : (
            <span className="shrink-0 text-base leading-snug font-bold text-ink tabular-nums">
              {formatPrice(option.price)}
            </span>
          )}
        </span>
        <span className="mt-2 block space-y-1 text-[13px] leading-snug text-muted">
          <span className="block">
            {first}–{last} business days
          </span>
          {/* Empty until hydration: dates come from the shopper's own clock. */}
          <span className="block min-h-[1.1rem]">{estimate && `Estimated delivery ${estimate}`}</span>
          {option.tracked && (
            <span className="flex items-center gap-1.5">
              <CheckIcon width={13} height={13} strokeWidth={2.25} className="shrink-0 text-success" />
              Tracking number provided
            </span>
          )}
        </span>
      </span>
    </label>
  );
}

function CheckoutForm({
  shippingId,
  onShippingChange,
}: {
  shippingId: ShippingOptionId;
  onShippingChange: (id: ShippingOptionId) => void;
}) {
  const [country, setCountry] = useState<string>("US");
  const [payment, setPayment] = useState<"card" | null>(null);
  const id = useId();
  const region = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];

  return (
    // Pay now isn't wired to a payment provider yet.
    <form onSubmit={(e) => e.preventDefault()} noValidate aria-label="Checkout" className="space-y-10">
      <section aria-labelledby={`${id}-contact`}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id={`${id}-contact`} className={sectionHeading}>
            Contact
          </h2>
          <p className="text-sm text-grey-600">
            Already have an account?{" "}
            <button
              type="button"
              className="text-accent underline underline-offset-4 transition-colors hover:text-ink"
            >
              Log in
            </button>
          </p>
        </div>
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
      </section>

      <section aria-labelledby={`${id}-delivery`}>
        <h2 id={`${id}-delivery`} className={`${sectionHeading} mb-4`}>
          Delivery
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Country/Region"
            name="country"
            autoComplete="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="col-span-2"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <TextField label="First name" name="firstName" autoComplete="given-name" required />
          <TextField label="Last name" name="lastName" autoComplete="family-name" required />
          <TextField label="Address" name="address1" autoComplete="address-line1" required className="col-span-2" />
          <TextField
            label="Apartment, suite, etc. (optional)"
            name="address2"
            autoComplete="address-line2"
            className="col-span-2"
          />
          <div className="col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <TextField
              label="City"
              name="city"
              autoComplete="address-level2"
              required
              className="col-span-2 sm:col-span-1"
            />
            <TextField label={region.region} name="state" autoComplete="address-level1" required />
            <TextField label={region.postal} name="zip" autoComplete="postal-code" autoCapitalize="characters" required />
          </div>
          <TextField label="Phone" type="tel" name="phone" autoComplete="tel" className="col-span-2" />
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" name="saveInfo" className="size-[18px] shrink-0 cursor-pointer accent-ink" />
          Save this information for next time
        </label>
      </section>

      <fieldset>
        <legend className={`${sectionHeading} mb-4`}>Shipping method</legend>
        <div className="space-y-3">
          {shippingOptions.map((option) => (
            <ShippingOption
              key={option.id}
              option={option}
              checked={shippingId === option.id}
              onSelect={() => onShippingChange(option.id)}
            />
          ))}
        </div>
      </fieldset>

      <section aria-labelledby={`${id}-payment`}>
        <h2 id={`${id}-payment`} className={sectionHeading}>
          Payment
        </h2>
        <p className="mt-1 text-sm text-grey-600">All transactions are secure and encrypted.</p>
        <fieldset className="mt-5">
          <legend className="mb-3 text-sm font-medium">Select a payment method</legend>
          <div className="space-y-3">
            <RadioCard
              name="payment"
              value="card"
              checked={payment === "card"}
              onChange={() => setPayment("card")}
              aside={
                <span className="flex flex-wrap justify-end gap-1">
                  {CARD_MARKS.map((m) => (
                    <PaymentMark key={m} method={m} />
                  ))}
                </span>
              }
            >
              <span className="text-sm font-medium sm:text-base">Credit / Debit Card</span>
            </RadioCard>
          </div>
        </fieldset>
      </section>

      <button type="submit" className={bigButtonClasses}>
        Pay now
      </button>
    </form>
  );
}
