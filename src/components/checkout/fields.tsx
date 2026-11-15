"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { ChevronIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";

/**
 * Checkout form controls. Every field is the same 56px box with a floating
 * label: the label sits inside the box like a placeholder, then moves to the
 * top edge on focus or once the field has a value (including autofill).
 */

export const sectionHeading = "text-xl font-bold tracking-tight";

const control =
  "peer block h-14 w-full rounded-md border border-grey-300 bg-white px-3.5 pt-6 pb-1.5 text-base text-ink transition-[border-color,box-shadow] duration-150 hover:border-grey-400 focus:border-accent focus:shadow-[0_0_0_1px_var(--color-accent)] focus:outline-hidden";

// Floated by default; drops to the middle only while empty and unfocused.
const label =
  "pointer-events-none absolute top-2 left-3.5 max-w-[calc(100%-1.75rem)] truncate text-xs text-grey-500 transition-all duration-150 ease-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs";

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

type SelectFieldProps = ComponentProps<"select"> & { label: string };

/** A select always has a value, so its label stays at the top. */
export function SelectField({ label: text, id, className, children, ...props }: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={cn("relative", className)}>
      <select id={selectId} className={cn(control, "cursor-pointer appearance-none pr-10")} {...props}>
        {children}
      </select>
      <label htmlFor={selectId} className="pointer-events-none absolute top-2 left-3.5 text-xs text-grey-500">
        {text}
      </label>
      <ChevronIcon
        width={18}
        height={18}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 rotate-90 text-grey-600"
      />
    </div>
  );
}

const radio =
  "size-[18px] shrink-0 appearance-none rounded-full border border-grey-400 bg-white transition-[border-width,border-color] duration-150 checked:border-[6px] checked:border-ink";

type RadioCardProps = Omit<ComponentProps<"input">, "type" | "children"> & { children: ReactNode; aside?: ReactNode };

/** A bordered option with a radio on the left; the whole card is the click target. */
export function RadioCard({ children, aside, className, ...props }: RadioCardProps) {
  return (
    <label
      className={cn(
        "flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-grey-300 bg-white px-4 py-3 transition-[border-color,background-color,box-shadow] duration-150 hover:border-grey-400 has-checked:border-ink has-checked:bg-paper has-checked:shadow-[0_0_0_1px_var(--color-ink)]",
        className,
      )}
    >
      <input type="radio" className={radio} {...props} />
      <span className="min-w-0 flex-1">{children}</span>
      {aside}
    </label>
  );
}
