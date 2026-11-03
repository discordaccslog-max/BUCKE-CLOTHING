"use client";

import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";
import type { ProductImage } from "@/types/product";

interface GalleryProps {
  images: ProductImage[];
  productName: string;
}

const MAIN_SIZES = "(min-width: 1024px) 52vw, (min-width: 768px) 48vw, 100vw";

/**
 * Main image with thumbnails (a vertical rail on desktop, a row on mobile).
 * The parent remounts this with a `key` when the color changes, which
 * resets the selection to the first image.
 */
export function Gallery({ images, productName }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  const count = images.length;

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div
        className="relative aspect-[4/5] flex-1 overflow-hidden bg-white"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${productName} images`}
        onKeyDown={onKeyDown}
      >
        <AnimatePresence initial={false}>
          <m.div
            key={current.src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes={MAIN_SIZES}
              preload={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              className="object-contain p-4 md:p-8"
            />
          </m.div>
        </AnimatePresence>

        {count > 1 && (
          <div className="absolute inset-x-3 bottom-3 flex justify-between lg:hidden">
            <button
              type="button"
              onClick={() => go(-1)}
              className="inline-flex h-11 w-11 items-center justify-center bg-bone/90"
              aria-label="Previous image"
            >
              <ArrowRightIcon className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex h-11 w-11 items-center justify-center bg-bone/90"
              aria-label="Next image"
            >
              <ArrowRightIcon />
            </button>
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          Image {index + 1} of {count}
        </p>
      </div>

      {count > 1 && (
        <ul className="flex gap-2 lg:w-20 lg:flex-col xl:w-24" aria-label="Choose image">
          {images.map((img, i) => (
            <li key={img.src} className="w-16 lg:w-full">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block aspect-[4/5] w-full overflow-hidden bg-white transition-opacity",
                  i === index ? "opacity-100 ring-1 ring-ink" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.src} alt="" fill sizes="96px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
