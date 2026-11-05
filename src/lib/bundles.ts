/**
 * Bundle pricing, shared by the product page (what the cards show) and the
 * bag (what is charged), so the two can never disagree.
 */
import { bundles, type BundleTier } from "@/data/storefront";
import type { CartLine } from "@/types/cart";

export function bundleTiers(): BundleTier[] {
  return bundles.enabled ? bundles.tiers : bundles.tiers.filter((t) => t.quantity === 1);
}

/** The best tier a quantity qualifies for. */
export function tierFor(quantity: number): BundleTier | undefined {
  return [...bundles.tiers]
    .filter((t) => t.quantity <= quantity)
    .sort((a, b) => b.quantity - a.quantity)[0];
}

/** Bundle total in cents for `quantity` items at `unitPrice`. */
export function bundlePrice(unitPrice: number, quantity: number): number {
  const percent = bundles.enabled ? (tierFor(quantity)?.discountPercent ?? 0) : 0;
  return Math.round(unitPrice * quantity * (1 - percent / 100));
}

/**
 * Bundle savings across a bag, in cents. Items of the same product count
 * together, whatever their colour or size, so a mixed Buy 2 still saves.
 */
export function bundleDiscount(lines: CartLine[]): number {
  if (!bundles.enabled) return 0;
  const byProduct = new Map<string, { qty: number; full: number }>();
  for (const l of lines) {
    const entry = byProduct.get(l.productId) ?? { qty: 0, full: 0 };
    entry.qty += l.quantity;
    entry.full += l.price * l.quantity;
    byProduct.set(l.productId, entry);
  }
  let discount = 0;
  for (const { qty, full } of byProduct.values()) {
    const percent = tierFor(qty)?.discountPercent ?? 0;
    discount += Math.round((full * percent) / 100);
  }
  return discount;
}
