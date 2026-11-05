"use client";

import { useState } from "react";
import type { SizeGuide } from "@/data/size-guides";
import { sizeGuideNote } from "@/data/storefront";
import { cn } from "@/lib/format";

type Unit = "in" | "cm";

function convert(cm: number, unit: Unit): string {
  if (unit === "cm") return String(cm);
  return (Math.round((cm / 2.54) * 4) / 4).toString();
}

export function SizeGuideTable({ guide, productName }: { guide: SizeGuide; productName: string }) {
  const [unit, setUnit] = useState<Unit>("in");
  const { modelHeight, modelSize } = sizeGuideNote;

  return (
    <div className="space-y-6 px-5 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-sm text-grey-600">{guide.intro}</p>
        <div role="group" aria-label="Units" className="inline-flex rounded-full border border-black/15 p-0.5">
          {(["in", "cm"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className={cn(
                "h-9 min-w-11 rounded-full px-3 text-xs font-semibold uppercase",
                unit === u ? "bg-black text-white" : "text-grey-600",
              )}
            >
              {u === "in" ? "Inches" : "CM"}
            </button>
          ))}
        </div>
      </div>
      {modelHeight && modelSize && (
        <p className="text-sm font-semibold">
          Model is {modelHeight}, wearing {modelSize}
        </p>
      )}
      <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <table className="w-full min-w-[28rem] border-collapse text-sm tabular-nums">
          <caption className="sr-only">
            Size guide for {productName}, measurements in {unit === "in" ? "inches" : "centimetres"}
          </caption>
          <thead>
            <tr className="border-b border-ink">
              <th scope="col" className="type-label py-3 pr-4 text-left">
                Size
              </th>
              {guide.columns.map((c) => (
                <th key={c} scope="col" className="type-label py-3 pr-4 text-left">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row) => (
              <tr key={row.size} className="border-b border-ink/10">
                <th scope="row" className="py-3 pr-4 text-left font-medium">
                  {row.size}
                </th>
                {row.values.map((v, i) => (
                  <td key={guide.columns[i]} className="py-3 pr-4">
                    {convert(v, unit)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="type-label">How to measure</h3>
        <ul className="mt-3 space-y-1 text-sm text-grey-600">
          {guide.howToMeasure.map((m) => (
            <li key={m}>{m.replace(/2cm/g, unit === "in" ? "¾in" : "2cm")}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
