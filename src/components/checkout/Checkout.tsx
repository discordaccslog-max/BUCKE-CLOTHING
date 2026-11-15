"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { BuckMark } from "@/components/brand/BuckMark";
import { useCart } from "@/components/cart/CartProvider";
import { PaymentMark } from "@/components/commerce/PaymentIcons";
import { bigButtonClasses } from "@/components/commerce/styles";
import { useDeliveryRange } from "@/components/product/DeliveryEstimate";
import { buttonClasses } from "@/components/ui/Button";
import { ChevronIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { RadioCard, SelectField, sectionHeading, TextField } from "./fields";
import { OrderSummary } from "./OrderSummary";

const COUNTRIES = [
  { code: "US", name: "United States", region: "State", postal: "ZIP code" },
  { code: "CA", name: "Canada", region: "Province", postal: "Postal code" },
  { code: "GB", name: "United Kingdom", region: "County", postal: "Postcode" },
  { code: "AU", name: "Australia", region: "State/territory", postal: "Postcode" },
] as const;

const CARD_MARKS = ["visa", "mastercard", "amex", "discover"] as const;

const noop = () => () => {};

export function Checkout() {
  const { lines, subtotal } = useCart();
  // The cart lives in localStorage, so it is only known after hydration.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const summaryId = useId();

  return (
    <div data-checkout data-surface="white" className="flex min-h-dvh flex-col bg-white">
      <h1 className="sr-only">Checkout</h1>
      <div className="flex justify-center border-b border-grey-200 px-4 py-8 md:py-10">
        <Link href="/" aria-label="Bucke, home">
          <BuckMark className="h-10 w-auto md:h-12" />
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
              <span className="text-lg font-bold tabular-nums">{hydrated ? formatPrice(subtotal) : ""}</span>
            </button>
            <div id={summaryId} hidden={!summaryOpen} className="border-t border-grey-200">
              <div className="mx-auto max-w-xl px-4 py-6 sm:px-8">
                <OrderSummary />
              </div>
            </div>
          </div>

          <div className="px-4 py-8 sm:px-8 lg:py-12 lg:pr-12 xl:pr-16">
            <div className="mx-auto max-w-xl lg:mr-0 lg:ml-auto">
              <CheckoutForm />
            </div>
          </div>

          <aside aria-label="Order summary" className="hidden border-l border-grey-200 bg-bone lg:block">
            <div className="sticky top-0 max-h-dvh max-w-md overflow-y-auto px-8 py-12 xl:px-12">
              <OrderSummary />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function CheckoutForm() {
  const [country, setCountry] = useState<string>("US");
  const [payment, setPayment] = useState<"card" | "applepay" | null>(null);
  const deliveryRange = useDeliveryRange();
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
        <RadioCard
          name="shipping"
          value="standard"
          defaultChecked
          aside={<span className="text-sm font-semibold">Free</span>}
        >
          <span className="block text-sm font-medium">Standard</span>
          {deliveryRange && <span className="block text-xs text-grey-600">Estimated delivery {deliveryRange}</span>}
        </RadioCard>
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
            <RadioCard
              name="payment"
              value="applepay"
              checked={payment === "applepay"}
              onChange={() => setPayment("applepay")}
              aside={<PaymentMark method="applepay" />}
            >
              <span className="text-sm font-medium sm:text-base">Apple Pay</span>
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
