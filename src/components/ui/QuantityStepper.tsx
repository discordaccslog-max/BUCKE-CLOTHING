"use client";

import { cn } from "@/lib/format";
import { MinusIcon, PlusIcon } from "./icons";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Used in button labels, e.g. "Decrease quantity of Ridge Zip Hoodie". */
  label: string;
  size?: "sm" | "md";
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
  size = "md",
}: QuantityStepperProps) {
  const box = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  return (
    <div className="inline-flex items-center border border-ink/20" role="group" aria-label={`Quantity, ${label}`}>
      <button
        type="button"
        className={cn(box, "inline-flex items-center justify-center transition-colors hover:bg-ink/5 disabled:opacity-30")}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
      >
        <MinusIcon width={14} height={14} />
      </button>
      <output
        className={cn("min-w-8 text-center tabular-nums", size === "sm" ? "text-sm" : "text-base")}
        aria-live="polite"
        aria-label={`Quantity ${value}`}
      >
        {value}
      </output>
      <button
        type="button"
        className={cn(box, "inline-flex items-center justify-center transition-colors hover:bg-ink/5 disabled:opacity-30")}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <PlusIcon width={14} height={14} />
      </button>
    </div>
  );
}
