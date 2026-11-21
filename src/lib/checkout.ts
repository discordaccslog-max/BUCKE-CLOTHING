import type { CartLine } from "@/types/cart";

export const CHECKOUT_ENABLED = true;

export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export async function startCheckout(
  lines: CartLine[],
  customer?: CheckoutCustomer,
  paymentMethod?: "card" | "stripe",
): Promise<CheckoutResult> {
  const orderId = "ORDER_" + crypto.randomUUID().replace(/-/g, "_");

  try {
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, orderId, customer, paymentMethod }),
    });

    const data = (await res.json()) as { url?: string; error?: string };

    if (data.url) {
      return { status: "redirect", url: data.url };
    }

    return { status: "error", message: data.error ?? "Payment unavailable." };
  } catch {
    return { status: "error", message: "Could not reach the payment gateway." };
  }
}
