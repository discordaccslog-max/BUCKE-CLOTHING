"use client";

import { Fragment, useSyncExternalStore } from "react";
import { BagCheckIcon, LocationPinIcon, TruckIcon } from "@/components/ui/icons";
import { delivery, shippingOptions } from "@/data/storefront";
import { cn } from "@/lib/format";

const subscribeNoop = () => () => {};
const short = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

/** "Nov 19 – Nov 21", or just "Nov 19" when both ends fall on the same day. */
function formatRange(first: Date, last: Date): string {
  const a = short.format(first);
  const b = short.format(last);
  return a === b ? a : `${a} – ${b}`;
}

function range(from: Date, [first, last]: [number, number]): string {
  return formatRange(addDays(from, first), addDays(from, last));
}

/**
 * Today's date in the browser; null during server render, so prerendered
 * pages never show the build day's dates.
 */
function useToday(): Date | null {
  const today = useSyncExternalStore(subscribeNoop, () => new Date().toDateString(), () => null);
  return today ? new Date(today) : null;
}

/** Moves forward `days` working days, skipping Saturdays and Sundays. */
function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) left -= 1;
  }
  return d;
}

/**
 * The one delivery calculation on the site: the order-ready range
 * (`delivery.readyDays`) plus a shipping option's `transit` business days.
 */
function deliveredRange(today: Date, transit: readonly [number, number]): string {
  const [readyFirst, readyLast] = delivery.readyDays;
  return formatRange(
    addBusinessDays(addDays(today, readyFirst), transit[0]),
    addBusinessDays(addDays(today, readyLast), transit[1]),
  );
}

/** Transit time of the default (first) checkout option, used where no option is chosen yet. */
const DEFAULT_TRANSIT = shippingOptions[0].transitDays;

/** The cart's estimate: delivery with the default shipping option, or null on the server / when off. */
export function useDeliveryRange(): string | null {
  const today = useToday();
  if (!delivery.enabled || !today) return null;
  return deliveredRange(today, DEFAULT_TRANSIT);
}

/** Checkout's estimate for one shipping option. Null on the server, like the other estimates. */
export function useShippingRange(transit: readonly [number, number]): string | null {
  const today = useToday();
  if (!today) return null;
  return deliveredRange(today, transit);
}

/**
 * Ordered → Order ready → Delivered, under the Add to cart button. Dates
 * count from today (src/data/storefront.ts `delivery`), computed in the
 * browser so they're always current.
 */
export function DeliveryTimeline({ className }: { className?: string }) {
  const today = useToday();
  if (!delivery.enabled) return null;

  const steps = [
    { label: "Ordered", icon: BagCheckIcon, date: today && short.format(today) },
    { label: "Order ready", icon: TruckIcon, date: today && range(today, delivery.readyDays) },
    { label: "Delivered", icon: LocationPinIcon, date: today && deliveredRange(today, DEFAULT_TRANSIT) },
  ];

  return (
    <ol aria-label="Estimated delivery" className={cn("flex items-start", className)}>
      {steps.map((step, i) => (
        <Fragment key={step.label}>
          {i > 0 && (
            <li aria-hidden="true" className="mx-3 mt-[1.375rem] h-px min-w-3 flex-1 bg-ink sm:mx-5" />
          )}
          <li
            className={cn(
              "flex shrink-0 flex-col gap-2",
              i === 0 && "items-start text-left",
              i === 1 && "items-center text-center",
              i === 2 && "items-end text-right",
            )}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
              <step.icon width={22} height={22} strokeWidth={1.75} />
            </span>
            <span className="mt-1 font-display text-sm leading-none font-extrabold tracking-wide uppercase">
              {step.label}
            </span>
            <span className="text-xs text-grey-600 tabular-nums underline decoration-grey-400 decoration-dotted underline-offset-4">
              {/* Non-breaking space holds the line height until the browser fills in today's dates. */}
              {step.date ?? " "}
            </span>
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
