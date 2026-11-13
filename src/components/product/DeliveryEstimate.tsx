"use client";

import { Fragment, useSyncExternalStore } from "react";
import { BagCheckIcon, LocationPinIcon, TruckIcon } from "@/components/ui/icons";
import { delivery } from "@/data/storefront";
import { cn } from "@/lib/format";

const subscribeNoop = () => () => {};
const short = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

function range(from: Date, [first, last]: [number, number]): string {
  return `${short.format(addDays(from, first))} – ${short.format(addDays(from, last))}`;
}

/**
 * Today's date in the browser; null during server render, so prerendered
 * pages never show the build day's dates.
 */
function useToday(): Date | null {
  const today = useSyncExternalStore(subscribeNoop, () => new Date().toDateString(), () => null);
  return today ? new Date(today) : null;
}

/** "Nov 19 – Nov 25": the delivered range from src/data/storefront.ts, or null on the server / when off. */
export function useDeliveryRange(): string | null {
  const today = useToday();
  if (!delivery.enabled || !today) return null;
  return range(today, delivery.deliveredDays);
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
    { label: "Delivered", icon: LocationPinIcon, date: today && range(today, delivery.deliveredDays) },
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
