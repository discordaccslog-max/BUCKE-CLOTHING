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
  paymentMethod?: "card",
  shippingCents?: number,
  shippingName?: string,
): Promise<CheckoutResult> {
  const orderId = "ORDER_" + crypto.randomUUID().replace(/-/g, "_");

  try {
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, orderId, customer, paymentMethod, shippingCents, shippingName }),
    });

    const data = (await res.json()) as { url?: string; error?: string };

    if (data.url) {
      // Stash the full order data for the confirmation-email trigger that
      // fires when the customer lands back on /order-success.
      //
      // Site B's order-success redirect doesn't append ?order_no= to the
      // back URL, so we can't key by order_id — use a single fixed key.
      // The customer only has one in-flight payment at a time. Also clear
      // the sent-flag so a second order in the same tab doesn't get
      // skipped by the refresh guard on /order-success.
      if (customer) {
        try {
          const subtotalCents = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
          const totalCents = subtotalCents + (shippingCents ?? 0);
          localStorage.setItem(
            "bucke_pending_order",
            JSON.stringify({
              order: {
                orderNumber: orderId,
                customer,
                lines,
                shippingCents: shippingCents ?? 0,
                shippingName: shippingName ?? "Shipping",
                subtotalCents,
                totalCents,
              },
              createdAt: Date.now(),
            })
          );
          sessionStorage.removeItem("bucke_pending_order_sent");
        } catch {
          /* localStorage quota or disabled — email just won't fire */
        }
      }
      return { status: "redirect", url: data.url };
    }

    return { status: "error", message: data.error ?? "Payment unavailable." };
  } catch {
    return { status: "error", message: "Could not reach the payment gateway." };
  }
}
