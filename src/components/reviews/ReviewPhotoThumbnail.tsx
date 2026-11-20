"use client";

import Image from "next/image";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import type { Review } from "@/types/review";

/**
 * 80px thumbnail under the review text; opens the full photo alone in a
 * lightbox (the site's Sheet in `bare` mode: dark backdrop, X over the
 * photo's top-right corner, Escape/outside-click/X to close).
 */
export function ReviewPhotoThumbnail({ photo }: { photo: NonNullable<Review["photo"]> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View full photo: ${photo.alt}`}
        className="relative block h-20 w-20 shrink-0 cursor-zoom-in overflow-hidden rounded-md bg-paper transition-opacity hover:opacity-85"
      >
        <Image src={photo.src} alt="" fill sizes="80px" className="object-cover" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={photo.alt} side="center" bare>
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="(min-width: 640px) 40rem, 92vw"
          className="block h-auto max-h-[88dvh] w-auto max-w-[calc(100vw-2rem)] rounded-md"
        />
      </Sheet>
    </>
  );
}
