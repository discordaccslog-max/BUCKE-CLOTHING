declare module "subset-font" {
  interface SubsetOptions {
    targetFormat?: "sfnt" | "woff" | "woff2" | "truetype";
    /** Pin an axis to a value, or narrow it to a range. */
    variationAxes?: Record<string, number | { min: number; max: number; default?: number }>;
    preserveNameIds?: number[];
  }
  export default function subsetFont(
    font: Uint8Array,
    text: string,
    options?: SubsetOptions,
  ): Promise<Uint8Array>;
}
