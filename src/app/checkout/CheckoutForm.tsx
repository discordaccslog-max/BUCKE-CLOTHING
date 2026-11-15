"use client";

import { type ChangeEvent, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { startCheckout } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { bigButtonClasses } from "@/components/commerce/styles";
import { LockIcon } from "@/components/ui/icons";

const inputClasses =
  "w-full border border-grey-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-grey-400 focus:border-ink focus:outline-none";

const labelClasses = "block text-xs font-semibold uppercase tracking-label text-grey-600 mb-1";

export function CheckoutForm() {
  const { lines, subtotal } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  function set(field: string) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await startCheckout(lines, form);
    if (result.status === "redirect") {
      window.location.assign(result.url);
      return;
    }
    setError(result.message);
    setPending(false);
  }

  if (lines.length === 0) {
    return (
      <p className="text-grey-600">
        Your cart is empty.{" "}
        <a href="/shop" className="underline">
          Continue shopping
        </a>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Order summary */}
      <div className="space-y-3 border border-grey-100 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-label text-grey-600">Order summary</h2>
        {lines.map((l) => (
          <div key={l.key} className="flex items-center justify-between gap-4 text-sm">
            <span className="truncate">
              {l.name}
              {l.size ? ` / ${l.size}` : ""}
              {l.quantity > 1 ? ` ×${l.quantity}` : ""}
            </span>
            <span className="shrink-0 font-medium">{formatPrice(l.price * l.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-grey-100 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-label text-grey-600">Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>First name</label>
            <input required className={inputClasses} value={form.firstName} onChange={set("firstName")} placeholder="Jane" />
          </div>
          <div>
            <label className={labelClasses}>Last name</label>
            <input required className={inputClasses} value={form.lastName} onChange={set("lastName")} placeholder="Doe" />
          </div>
        </div>
        <div>
          <label className={labelClasses}>Email</label>
          <input required type="email" className={inputClasses} value={form.email} onChange={set("email")} placeholder="jane@example.com" />
        </div>
        <div>
          <label className={labelClasses}>Phone</label>
          <input required type="tel" className={inputClasses} value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" />
        </div>
      </div>

      {/* Shipping address */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-label text-grey-600">Shipping address</h2>
        <div>
          <label className={labelClasses}>Address</label>
          <input required className={inputClasses} value={form.address1} onChange={set("address1")} placeholder="123 Main St" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>City</label>
            <input required className={inputClasses} value={form.city} onChange={set("city")} placeholder="New York" />
          </div>
          <div>
            <label className={labelClasses}>State</label>
            <input required className={inputClasses} value={form.state} onChange={set("state")} placeholder="NY" maxLength={2} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>ZIP code</label>
            <input required className={inputClasses} value={form.zip} onChange={set("zip")} placeholder="10001" />
          </div>
          <div>
            <label className={labelClasses}>Country</label>
            <select required className={inputClasses} value={form.country} onChange={set("country")}>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <button type="submit" disabled={pending} className={bigButtonClasses}>
        <LockIcon width={22} height={22} />
        {pending ? "Redirecting to payment…" : `Pay ${formatPrice(subtotal)}`}
      </button>

      <p className="text-center text-xs text-grey-500">
        You'll be redirected to our secure payment partner to complete your order.
      </p>
    </form>
  );
}
