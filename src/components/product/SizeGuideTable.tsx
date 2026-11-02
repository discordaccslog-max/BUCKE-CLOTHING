import type { SizeGuide } from "@/data/size-guides";

export function SizeGuideTable({ guide, productName }: { guide: SizeGuide; productName: string }) {
  return (
    <div className="space-y-6 px-5 py-6 md:px-6">
      <p className="text-sm text-grey-600">{guide.intro}</p>
      <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <table className="w-full min-w-[28rem] border-collapse text-sm tabular-nums">
          <caption className="sr-only">Size guide for {productName}, measurements in centimetres</caption>
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
                    {v}
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
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
