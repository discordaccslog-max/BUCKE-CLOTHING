import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/format";

type Variant = "solid" | "outline" | "light" | "outline-light" | "muted";

const base =
  "type-label inline-flex h-12 items-center justify-center gap-3 px-7 transition-colors duration-300 ease-out disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-bone hover:bg-grey-800",
  outline: "border border-ink text-ink hover:bg-ink hover:text-bone",
  light: "bg-bone text-ink hover:bg-white",
  "outline-light": "border border-bone/70 text-bone hover:bg-bone hover:text-ink",
  muted: "bg-grey-200 text-grey-700",
};

export function buttonClasses(variant: Variant = "solid", className?: string) {
  return cn(base, variants[variant], className);
}

export function Button({
  variant = "solid",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "solid",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
