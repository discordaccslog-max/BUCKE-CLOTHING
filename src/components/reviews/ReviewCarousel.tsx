"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";

/**
 * Scroll-snap carousel: 3 cards on desktop, 2 on tablet, 1 plus a peek of
 * the next on mobile. Swipe on touch; round arrow buttons centred below.
 */
export function ReviewCarousel({ children, label }: { children: ReactNode[]; label: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function update() {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  function go(direction: 1 | -1) {
    const el = trackRef.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  }

  const arrow =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-white transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-ink/20";

  return (
    <div>
      <ul
        ref={trackRef}
        onScroll={update}
        aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <li key={i} className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]">
            {child}
          </li>
        ))}
      </ul>
      {children.length > 1 && (
        <div className={cn("mt-6 flex justify-center gap-3", atStart && atEnd && "hidden")}>
          <button type="button" className={arrow} onClick={() => go(-1)} disabled={atStart} aria-label="Previous reviews">
            <ChevronIcon className="rotate-180" width={18} height={18} />
          </button>
          <button type="button" className={arrow} onClick={() => go(1)} disabled={atEnd} aria-label="Next reviews">
            <ChevronIcon width={18} height={18} />
          </button>
        </div>
      )}
    </div>
  );
}
