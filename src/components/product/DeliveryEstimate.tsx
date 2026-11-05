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

/**
 * "Order today, arrives Nov 11 – Nov 17", from the processing and transit
 * times in src/data/storefront.ts. Computed in the browser so the dates are
 * today's, not the build day's.
 */
export function DeliveryEstimate() {
  const today = useSyncExternalStore(subscribeNoop, () => new Date().toDateString(), () => null);
  if (!delivery.enabled) return null;

  let text = " ";
  if (today) {
    const now = new Date(today);
    const [fast, slow] = delivery.transitDays;
    const from = addBusinessDays(now, delivery.processingDays + fast);
    const to = addBusinessDays(now, delivery.processingDays + slow);
    text = `Order today, arrives ${short.format(from)} – ${short.format(to)}`;
  }
  return <p className="text-center text-sm font-medium">{text}</p>;
}
