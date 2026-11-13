"use client";

import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";

/**
 * Paged scroll-snap carousel: 3 cards per page on desktop, 2 on tablet, 1 on
 * mobile. The arrows move a whole page; swipe and trackpad scroll still work.
 * `header` sits on the left of the top row, with the arrows on its right
 * (desktop) or under the cards (mobile).
 */
export function ReviewCarousel({ children, label, header }: { children: ReactNode[]; label: string; header?: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  /** Width of one page of cards, plus the gap to the next page. */
  function measure() {
    const el = trackRef.current;
    const card = el?.querySelector("li");
    if (!el || !card) return null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const perPage = Math.max(1, Math.round((el.clientWidth + gap) / step));
    return { el, pageWidth: perPage * step, perPage };
  }

  function update() {
    const m = measure();
    if (!m) return;
    const total = Math.ceil(children.length / m.perPage);
    setPages(total);
    const atEnd = m.el.scrollLeft + m.el.clientWidth >= m.el.scrollWidth - 4;
    setPage(atEnd ? total - 1 : Math.round(m.el.scrollLeft / m.pageWidth));
  }

  // Measures on mount (the observer fires once on observe) and whenever the track resizes.
  const onResize = useEffectEvent(update);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => onResize());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function go(direction: 1 | -1) {
    const m = measure();
    if (!m) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    m.el.scrollTo({ left: (page + direction) * m.pageWidth, behavior: reduce ? "auto" : "smooth" });
  }

  const atStart = page <= 0;
  const atEnd = page >= pages - 1;
  const arrow =
    "inline-flex h-11 w-11 items-center justify-center border border-ink/20 transition-colors hover:bg-ink hover:text-bone disabled:pointer-events-none disabled:opacity-30";

  const controls = (
    <div className={cn("flex items-center gap-4", pages <= 1 && "invisible")}>
      <span className="type-label tabular-nums text-grey-600" aria-live="polite">
        <span className="sr-only">Page </span>
        {String(page + 1).padStart(2, "0")} / {String(pages).padStart(2, "0")}
      </span>
      <div className="flex gap-2">
        <button type="button" className={arrow} onClick={() => go(-1)} disabled={atStart} aria-label="Previous reviews">
          <ArrowRightIcon className="rotate-180" />
        </button>
        <button type="button" className={arrow} onClick={() => go(1)} disabled={atEnd} aria-label="Next reviews">
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0">{header}</div>
        <div className="hidden shrink-0 md:block">{controls}</div>
      </div>
      <ul
        ref={trackRef}
        onScroll={update}
        aria-label={label}
        className={cn(
          "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:gap-5 md:px-0 [&::-webkit-scrollbar]:hidden",
          header ? "mt-10 md:mt-12" : undefined,
        )}
      >
        {children.map((child, i) => (
          <li key={i} className="w-full shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
            {child}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-center md:hidden">{controls}</div>
    </div>
  );
}
