"use client";

import { useId, useRef, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";

interface ProductRailProps {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Horizontally scrolling rail with snap points. Native scrolling handles
 * touch, trackpad and keyboard focus; the arrow buttons are a convenience
 * for mouse users.
 */
export function ProductRail({ title, eyebrow, action, children }: ProductRailProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const headingId = useId();

  function scroll(direction: 1 | -1) {
    const list = listRef.current;
    if (!list) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section aria-labelledby={headingId} className="py-20 md:py-28">
      <div className="container-page flex items-end justify-between gap-6">
        <div>
          {eyebrow && <p className="type-label text-grey-600">{eyebrow}</p>}
          <h2 id={headingId} className="type-display mt-3 text-display-lg">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-6">
          {action}
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="inline-flex h-11 w-11 items-center justify-center border border-ink/20 transition-colors hover:bg-ink hover:text-bone"
              aria-label={`Scroll ${title} backward`}
            >
              <ArrowRightIcon className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="inline-flex h-11 w-11 items-center justify-center border border-ink/20 transition-colors hover:bg-ink hover:text-bone"
              aria-label={`Scroll ${title} forward`}
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </div>
      <div className="container-page mt-10 pr-0! md:mt-12">
        <ul
          ref={listRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 pr-4 [scrollbar-width:none] md:gap-5 md:pr-8 xl:pr-12 [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </ul>
      </div>
    </section>
  );
}

/** Width of a card inside a rail; matches RAIL_SIZES below. */
export const RAIL_ITEM_CLASS =
  "w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:w-[calc((100vw-6rem)/4.3)] max-w-[24rem]";
export const RAIL_SIZES = "(min-width: 1024px) 23vw, (min-width: 640px) 44vw, 72vw";
