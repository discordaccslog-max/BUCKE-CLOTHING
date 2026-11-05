/**
 * Checkout boundary.
 *
 * Everything that talks to a payment or commerce provider lives here. The
 * cart drawer only knows about `CHECKOUT_ENABLED` and `startCheckout`.
 *
 * To go live with Stripe Checkout, Shopify, etc.:
 *   1. Implement `startCheckout` (for example, POST the lines to a route
 *      handler that creates a Stripe Checkout Session and returns its URL).
 *   2. Set `CHECKOUT_ENABLED` to true.
 * Nothing else in the app needs to change.
 *
 * Bundle savings: the bag shows them via `bundleDiscount(lines)` from
 * src/lib/bundles.ts. Apply the same amount at the provider (an automatic
 * discount on Shopify, a coupon or line-item price on Stripe), re-pricing
 * server-side rather than trusting the browser.
 */
import type { CartLine } from "@/types/cart";

export const CHECKOUT_ENABLED = false;

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export async function startCheckout(lines: CartLine[]): Promise<CheckoutResult> {
  void lines;
  return {
    status: "unavailable",
    message: "Online checkout is coming soon.",
  };
}
