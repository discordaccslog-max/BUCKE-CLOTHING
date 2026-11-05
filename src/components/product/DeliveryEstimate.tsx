"use client";

import { useSyncExternalStore } from "react";
import { delivery } from "@/data/storefront";

const subscribeNoop = () => () => {};
const short = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) left -= 1;
  }
  return d;
}

/** "Nov 12 – Nov 17" from the delivery settings, or null on the server / when off. */
export function useDeliveryRange(): string | null {
  const today = useSyncExternalStore(subscribeNoop, () => new Date().toDateString(), () => null);
  if (!delivery.enabled || !today) return null;
  const now = new Date(today);
  const [fast, slow] = delivery.transitDays;
  const from = addBusinessDays(now, delivery.processingDays + fast);
  const to = addBusinessDays(now, delivery.processingDays + slow);
  return `${short.format(from)} – ${short.format(to)}`;
}

/**
 * "Order today, arrives Nov 11 – Nov 17", from the processing and transit
 * times in src/data/storefront.ts. Computed in the browser so the dates are
 * today's, not the build day's.
 */
export function DeliveryEstimate() {
  const range = useDeliveryRange();
  if (!delivery.enabled) return null;
  return <p className="text-center text-sm font-medium">{range ? `Order today, arrives ${range}` : "\u00a0"}</p>;
}
