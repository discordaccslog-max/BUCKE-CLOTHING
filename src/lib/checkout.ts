import { randomUUID } from "crypto";
import type { CartLine } from "@/types/cart";

export const CHECKOUT_ENABLED = true;

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export async function startCheckout(lines: CartLine[]): Promise<CheckoutResult> {
  const orderId = "ORDER_" + randomUUID().replace(/-/g, "_");

  try {
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, orderId }),
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
