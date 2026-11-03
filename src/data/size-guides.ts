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
  ],
  howToMeasure: [
    "Chest: straight across, 2cm below the armhole.",
    "Length: from the high point of the shoulder to the hem.",
    "Sleeve: from the shoulder seam to the cuff edge.",
  ],
};

const bottoms: SizeGuide = {
  intro: "Garment measurements in centimetres, laid flat. Our jeans are cut wide and baggy.",
  columns: ["Waist (½)", "Rise", "Inseam", "Leg opening (½)"],
  rows: [
    { size: "XS", values: [37, 29, 78, 24] },
    { size: "S", values: [39.5, 30, 79, 25] },
    { size: "M", values: [42, 31, 80, 26] },
    { size: "L", values: [44.5, 32, 81, 27] },
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
  shirts: tops,
  "pants-jeans": bottoms,
};

export const shippingCopy = [
  "Free standard shipping on orders over $150. Orders ship within 2 business days.",
  "Free returns within 30 days on unworn items with tags attached.",
];
