"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { PaymentMark } from "@/components/commerce/PaymentIcons";
import { useDeliveryRange } from "@/components/product/DeliveryEstimate";
import { ChevronIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { RadioCard, SelectField, sectionHeading, TextField } from "./fields";
import { OrderSummary } from "./OrderSummary";

const COUNTRIES = [
  { code: "US", name: "United States", region: "State", postal: "ZIP code" },
  { code: "CA", name: "Canada", region: "Province", postal: "Postal code" },
  { code: "GB", name: "United Kingdom", region: "County", postal: "Postcode" },
  { code: "AU", name: "Australia", region: "State/territory", postal: "Postcode" },
] as const;

const US_STATES = (
  "AL Alabama|AK Alaska|AZ Arizona|AR Arkansas|CA California|CO Colorado|CT Connecticut|DE Delaware|" +
  "DC District of Columbia|FL Florida|GA Georgia|HI Hawaii|ID Idaho|IL Illinois|IN Indiana|IA Iowa|" +
  "KS Kansas|KY Kentucky|LA Louisiana|ME Maine|MD Maryland|MA Massachusetts|MI Michigan|MN Minnesota|" +
  "MS Mississippi|MO Missouri|MT Montana|NE Nebraska|NV Nevada|NH New Hampshire|NJ New Jersey|" +
  "NM New Mexico|NY New York|NC North Carolina|ND North Dakota|OH Ohio|OK Oklahoma|OR Oregon|" +
  "PA Pennsylvania|RI Rhode Island|SC South Carolina|SD South Dakota|TN Tennessee|TX Texas|UT Utah|" +
  "VT Vermont|VA Virginia|WA Washington|WV West Virginia|WI Wisconsin|WY Wyoming"
)
  .split("|")
  .map((s) => ({ code: s.slice(0, 2), name: s.slice(3) }));

const CARD_MARKS = ["visa", "mastercard", "amex", "discover"] as const;

const noop = () => () => {};

export function Checkout() {
  const { lines, subtotal } = useCart();
  // The cart lives in localStorage, so it is only known after hydration.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const summaryId = useId();

  return (
    <div
      data-checkout
      data-surface="white"
      className="flex min-h-dvh flex-col bg-white text-co-ink [&_:focus-visible]:outline-co-ink"
    >
      <h1 className="sr-only">Checkout</h1>
      <div className="flex h-14 items-center justify-center border-b border-co-line px-4">
        <Link href="/" className="text-[15px] font-bold tracking-[0.15em] uppercase">
          {site.name}
        </Link>
      </div>

      {hydrated && lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <p className="text-2xl font-semibold">Your cart is empty</p>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center rounded-lg bg-co-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="flex-1 lg:grid lg:grid-cols-2">
          {/* Mobile: the summary collapses into a bar above the form. */}
          <div className="border-b border-co-line bg-co-tint lg:hidden">
            <button
              type="button"
              onClick={() => setSummaryOpen((o) => !o)}
              aria-expanded={summaryOpen}
              aria-controls={summaryId}
              className="mx-auto flex h-16 w-full max-w-[500px] items-center justify-between gap-4 px-4 sm:box-content sm:px-8"
            >
              <span className="flex items-center gap-1.5 text-sm">
                {summaryOpen ? "Hide order summary" : "Show order summary"}
                <ChevronIcon
                  width={14}
                  height={14}
                  className={summaryOpen ? "-rotate-90 transition-transform" : "rotate-90 transition-transform"}
                />
              </span>
              <span className="text-[17px] font-semibold tabular-nums">{hydrated ? formatPrice(subtotal) : ""}</span>
            </button>
            <div id={summaryId} hidden={!summaryOpen} className="border-t border-co-line">
              <div className="mx-auto max-w-[500px] px-4 py-6 sm:box-content sm:px-8">
                <OrderSummary />
              </div>
            </div>
          </div>

          <div className="px-4 pt-10 pb-20 sm:px-8 lg:pt-12">
            <div className="mx-auto max-w-[500px]">
              <CheckoutForm />
            </div>
          </div>

          <aside aria-label="Order summary" className="hidden bg-co-tint lg:block">
            <div className="sticky top-0 max-h-dvh max-w-[480px] overflow-y-auto px-10 py-12">
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
  const [usState, setUsState] = useState("");
  const [payment, setPayment] = useState<"card" | "applepay" | null>(null);
  const deliveryRange = useDeliveryRange();
  const id = useId();
  const region = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];

  return (
    // Pay now isn't wired to a payment provider yet.
    <form onSubmit={(e) => e.preventDefault()} noValidate aria-label="Checkout" className="space-y-11">
      <section aria-labelledby={`${id}-contact`}>
        <div className="mb-3.5 flex items-baseline justify-between gap-4">
          <h2 id={`${id}-contact`} className={sectionHeading}>
            Contact
          </h2>
          <button type="button" className="text-sm underline underline-offset-2 hover:no-underline">
            Sign in
          </button>
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
        <h2 id={`${id}-delivery`} className={`${sectionHeading} mb-3.5`}>
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
            {country === "US" ? (
              <SelectField
                label="State"
                name="state"
                autoComplete="address-level1"
                required
                empty={usState === ""}
                value={usState}
                onChange={(e) => setUsState(e.target.value)}
              >
                <option value="" disabled hidden />
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </SelectField>
            ) : (
              <TextField label={region.region} name="state" autoComplete="address-level1" required />
            )}
            <TextField label={region.postal} name="zip" autoComplete="postal-code" autoCapitalize="characters" required />
          </div>
          <TextField label="Phone" type="tel" name="phone" autoComplete="tel" className="col-span-2" />
        </div>
        <label className="mt-3.5 flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" name="saveInfo" className="size-[18px] shrink-0 cursor-pointer accent-co-ink" />
          Save this information for next time
        </label>
      </section>

      <fieldset>
        <legend className={`${sectionHeading} mb-3.5`}>Shipping method</legend>
        <RadioCard
          name="shipping"
          value="standard"
          defaultChecked
          aside={<span className="text-sm font-semibold">Free</span>}
        >
          <span className="block text-sm">Standard</span>
          {deliveryRange && <span className="block text-[13px] text-co-muted">Estimated delivery {deliveryRange}</span>}
        </RadioCard>
      </fieldset>

      <section aria-labelledby={`${id}-payment`}>
        <h2 id={`${id}-payment`} className={sectionHeading}>
          Payment
        </h2>
        <p className="mt-1 text-sm text-co-muted">All transactions are secure and encrypted.</p>
        <fieldset className="mt-4">
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
              <span className="text-sm">Credit / Debit Card</span>
            </RadioCard>
            <RadioCard
              name="payment"
              value="applepay"
              checked={payment === "applepay"}
              onChange={() => setPayment("applepay")}
              aside={<PaymentMark method="applepay" />}
            >
              <span className="text-sm">Apple Pay</span>
            </RadioCard>
          </div>
        </fieldset>
      </section>

      <button
        type="submit"
        className="h-14 w-full rounded-lg bg-co-ink text-lg font-semibold text-white transition-colors duration-150 hover:bg-black"
      >
        Pay now
      </button>
    </form>
  );
}
