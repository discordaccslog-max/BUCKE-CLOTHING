"use client";

import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, type RefObject } from "react";

interface StickyBuyBarProps {
  /** The Buy Now button: the bar shows once it has scrolled above the screen. */
  watchRef: RefObject<HTMLElement | null>;
  /** Where "Shop now" scrolls back to. */
  targetRef: RefObject<HTMLElement | null>;
  name: string;
  image: { src: string; alt: string };
  label: string;
}

export function StickyBuyBar({ watchRef, targetRef, name, image, label }: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = watchRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [watchRef]);

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)]"
        >
          <div className="container-page flex h-16 items-center gap-3">
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white">
              <Image src={image.src} alt="" fill sizes="44px" className="object-contain p-0.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</span>
            <button
              type="button"
              onClick={() => targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="inline-flex h-11 shrink-0 items-center rounded-md bg-black px-6 text-xs font-bold tracking-[0.12em] text-white uppercase hover:bg-grey-800 md:px-10"
            >
              {label}
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
