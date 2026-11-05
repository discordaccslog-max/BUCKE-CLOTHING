"use client";

import Image from "next/image";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { PlayIcon, TikTokIcon } from "@/components/ui/icons";
import type { ActionVideo } from "@/data/storefront";

/**
 * Three 9:16 tiles showing posters only. A tap opens a lightbox that loads
 * and plays that video with sound; nothing downloads before then.
 */
export function SeeItInAction({ stat, videos }: { stat: string; videos: ActionVideo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (videos.length === 0) return null;
  const current = open === null ? null : videos[open];

  return (
    <section aria-labelledby="see-it-in-action" className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="see-it-in-action" className="text-lg font-bold">
          See it in action
        </h2>
        {stat && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1 text-xs font-semibold">
            <TikTokIcon width={14} height={14} />
            {stat}
          </span>
        )}
      </div>
      <ul className="grid grid-cols-3 gap-2">
        {videos.slice(0, 3).map((v, i) => (
          <li key={`${v.src}-${i}`}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="relative block aspect-[9/16] w-full overflow-hidden rounded-xl bg-black/5"
              aria-label={`Play video: ${v.alt}`}
            >
              <Image src={v.poster} alt="" fill sizes="(min-width: 768px) 12vw, 30vw" loading="lazy" className="object-cover" />
              <span className="absolute bottom-2 left-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white">
                <PlayIcon width={16} height={16} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={current !== null} onClose={() => setOpen(null)} title={current?.alt ?? "Video"} side="center" className="max-w-sm">
        {current && (
          <video
            key={current.src}
            src={current.src}
            poster={current.poster}
            controls
            autoPlay
            playsInline
            className="aspect-[9/16] w-full bg-black"
          />
        )}
      </Sheet>
    </section>
  );
}
