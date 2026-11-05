"use client";

import { useEffect, useState } from "react";
import { ChevronIcon } from "@/components/ui/icons";
import { announcement } from "@/data/storefront";

/**
 * Black bar above the header with rotating messages. Pauses while hovered
 * or focused so a message can be read; arrows step through by hand.
 */
export function AnnouncementBar() {
  const { messages, intervalMs } = announcement;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = messages.length;

  useEffect(() => {
    if (paused || count < 2) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearInterval(t);
  }, [paused, count, intervalMs]);

  if (!announcement.enabled || count === 0) return null;

  const step = (d: number) => setIndex((i) => (i + d + count) % count);
  const arrow = "inline-flex h-(--announce-h) w-11 shrink-0 items-center justify-center opacity-70 hover:opacity-100";

  return (
    <div
      className="on-ink bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto flex h-(--announce-h) max-w-[100rem] items-center justify-between px-1 md:px-6">
        {count > 1 ? (
          <button type="button" className={arrow} onClick={() => step(-1)} aria-label="Previous announcement">
            <ChevronIcon className="rotate-180" width={14} height={14} strokeWidth={2} />
          </button>
        ) : (
          <span className="w-11" />
        )}
        <p className="min-w-0 truncate text-center text-[0.625rem] font-bold tracking-[0.06em] uppercase sm:text-[0.7rem] sm:tracking-[0.14em]" aria-live={paused ? "polite" : "off"}>
          <span key={index} className="inline-block animate-fade">
            {messages[index]}
          </span>
        </p>
        {count > 1 ? (
          <button type="button" className={arrow} onClick={() => step(1)} aria-label="Next announcement">
            <ChevronIcon width={14} height={14} strokeWidth={2} />
          </button>
        ) : (
          <span className="w-11" />
        )}
      </div>
    </div>
  );
}
