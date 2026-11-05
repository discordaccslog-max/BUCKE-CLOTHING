"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/format";
import type { ProductImage } from "@/types/product";

interface GalleryProps {
  images: ProductImage[];
  productName: string;
  /** When this changes (e.g. a colour is picked), the gallery jumps to that image. */
  focusSrc?: string;
}

const MAIN_SIZES = "(min-width: 768px) 50vw, 100vw";

/**
 * Swipeable main image (scroll-snap) with dots on mobile and a row of
 * thumbnails underneath on desktop. One track serves both, so swiping and
 * clicking a thumbnail always agree.
 */
export function Gallery({ images, productName, focusSrc }: GalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  function goTo(i: number, smooth = true) {
    const el = trackRef.current;
    if (!el) return;
    const next = (i + count) % count;
    el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setIndex(next);
  }

  useEffect(() => {
    if (!focusSrc) return;
    const i = images.findIndex((img) => img.src === focusSrc);
    if (i >= 0) goTo(i);
    // goTo is stable enough for this: it only reads the ref and count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSrc]);

  function onScroll() {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowRight") goTo(index + 1);
    if (e.key === "ArrowLeft") goTo(index - 1);
  }

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${productName} images`}
        onKeyDown={onKeyDown}
        className="relative"
      >
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex aspect-square snap-x snap-mandatory overflow-x-auto bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <div
              key={img.src}
              className="relative h-full w-full shrink-0 snap-center"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes={MAIN_SIZES}
                preload={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                className="object-contain p-4 md:p-8"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <div className="mt-3 flex justify-center gap-1 md:hidden">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className="inline-flex h-11 w-6 items-center justify-center"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full transition-all",
                    i === index ? "w-5 bg-black" : "w-2 bg-black/25",
                  )}
                />
              </button>
            ))}
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          Image {index + 1} of {count}
        </p>
      </div>

      {count > 1 && (
        <ul className="mt-4 hidden grid-cols-6 gap-2 md:grid" aria-label="Choose image">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-md bg-white transition",
                  i === index ? "ring-2 ring-black" : "ring-1 ring-black/10 hover:ring-black/40",
                )}
              >
                <Image src={img.src} alt="" fill sizes="96px" loading="lazy" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
