"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { ChevronIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";

/**
 * Checkout form controls, styled after a hosted Shopify checkout. Every field
 * is the same 52px box with a floating label: centred in the box while empty,
 * then shrunk to the top-left once focused or filled (including autofill).
 */

export const sectionHeading = "text-lg font-semibold text-co-ink";

const control =
  "peer block h-[52px] w-full rounded-lg border border-co-line bg-white px-3.5 pt-[22px] pb-1.5 text-base leading-5 text-co-ink transition-[border-color,box-shadow] duration-150 focus:border-co-ink focus:shadow-[0_0_0_3px_rgb(0_0_0/0.08)] focus:outline-hidden";

// Floated by default; drops to the middle only while empty and unfocused.
const label =
  "pointer-events-none absolute top-2 left-3.5 max-w-[calc(100%-1.75rem)] truncate text-xs leading-4 text-co-muted transition-all duration-150 ease-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs";

type TextFieldProps = Omit<ComponentProps<"input">, "placeholder"> & { label: string };

export function TextField({ label: text, id, className, ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn("relative", className)}>
      {/* A blank placeholder lets CSS tell an empty field from a filled one. */}
      <input id={inputId} placeholder=" " className={control} {...props} />
      <label htmlFor={inputId} className={label}>
        {text}
      </label>
    </div>
  );
}

type SelectFieldProps = ComponentProps<"select"> & { label: string; empty?: boolean };

/** Label sits at the top, or centred like an empty text field while `empty`. */
export function SelectField({ label: text, id, className, children, empty, ...props }: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={cn("relative", className)}>
      <select id={selectId} className={cn(control, "cursor-pointer appearance-none pr-10")} {...props}>
        {children}
      </select>
      <label
        htmlFor={selectId}
        className={cn(
          "pointer-events-none absolute left-3.5 leading-4 text-co-muted transition-all duration-150 ease-out",
          empty
            ? "top-1/2 -translate-y-1/2 text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs"
            : "top-2 text-xs",
        )}
      >
        {text}
      </label>
      <ChevronIcon
        width={16}
        height={16}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 rotate-90 text-co-ink"
      />
    </div>
  );
}

const radio =
  "size-[18px] shrink-0 appearance-none rounded-full border border-co-line bg-white transition-[border-width,border-color] duration-150 checked:border-[6px] checked:border-co-ink";

type RadioCardProps = Omit<ComponentProps<"input">, "type" | "children"> & { children: ReactNode; aside?: ReactNode };

/** A bordered option with a radio on the left; the whole card is the click target. */
export function RadioCard({ children, aside, className, ...props }: RadioCardProps) {
  return (
    <label
      className={cn(
        "flex min-h-[52px] cursor-pointer items-center gap-3 rounded-lg border border-co-line bg-white px-3.5 py-3 text-co-ink transition-[border-color,background-color,box-shadow] duration-150 has-checked:border-co-ink has-checked:bg-co-tint has-checked:shadow-[0_0_0_1px_var(--color-co-ink)]",
        className,
      )}
    >
      <input type="radio" className={radio} {...props} />
      <span className="min-w-0 flex-1">{children}</span>
      {aside}
    </label>
  );
}
