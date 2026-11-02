import type { CategorySlug } from "../types/product";

/**
 * PLACEHOLDER measurements. Replace with real garment specs before launch.
 * Values are garment measurements in centimetres.
 */
export interface SizeGuide {
  intro: string;
  columns: string[];
  rows: { size: string; values: number[] }[];
  howToMeasure: string[];
}

const tops: SizeGuide = {
  intro: "Garment measurements in centimetres, laid flat. Our tops are cut relaxed; size down for a closer fit.",
  columns: ["Chest (½)", "Length", "Sleeve"],
  rows: [
    { size: "XS", values: [56, 66, 60] },
    { size: "S", values: [59, 69, 62] },
    { size: "M", values: [62, 72, 64] },
    { size: "L", values: [65, 75, 66] },
    { size: "XL", values: [68, 78, 68] },
    { size: "XXL", values: [71, 80, 70] },
  ],
  howToMeasure: [
    "Chest: straight across, 2cm below the armhole.",
    "Length: from the high point of the shoulder to the hem.",
    "Sleeve: from the shoulder seam to the cuff edge.",
  ],
};

const bottoms: SizeGuide = {
  intro: "Garment measurements in centimetres, laid flat. Sizes refer to waist in inches.",
  columns: ["Waist (½)", "Rise", "Inseam", "Leg opening (½)"],
  rows: [
    { size: "28", values: [37, 29, 81, 20] },
    { size: "30", values: [39.5, 29.5, 81, 20.5] },
    { size: "32", values: [42, 30, 82, 21] },
    { size: "34", values: [44.5, 30.5, 82, 21.5] },
    { size: "36", values: [47, 31, 83, 22] },
    { size: "38", values: [49.5, 31.5, 83, 22.5] },
  ],
  howToMeasure: [
    "Waist: straight across the top of the waistband.",
    "Rise: from the crotch seam to the top of the waistband.",
    "Inseam: from the crotch seam to the hem.",
  ],
};

export const sizeGuides: Record<CategorySlug, SizeGuide> = {
  hoodies: tops,
  longsleeves: tops,
  "pants-jeans": bottoms,
};

export const shippingCopy = [
  "Free standard shipping on orders over $150. Orders ship within 2 business days.",
  "Free returns within 30 days on unworn items with tags attached.",
];
