import type { ProductImage } from "../types/product";

export interface LookbookEntry {
  id: string;
  image: ProductImage;
  caption: string;
  /** Slugs of products worn in the look. */
  productSlugs: string[];
  /** Grid shape on the lookbook page. */
  layout: "tall" | "wide" | "square";
}

export const lookbookSeason = {
  title: "Winter 26",
  subtitle: "Shot on the edge of the treeline, first light.",
};

function img(id: string, w: number, h: number, alt: string): ProductImage {
  return { src: `/editorial/look-${id}.svg`, alt, width: w, height: h };
}

export const lookbook: LookbookEntry[] = [
  { id: "01", layout: "tall", image: img("01", 1600, 2400, "Model in washed black hoodie standing in fog"), caption: "Antler Hoodie, Forest Jean", productSlugs: ["antler-heavyweight-hoodie", "forest-straight-jean"] },
  { id: "02", layout: "square", image: img("02", 1600, 1600, "Close crop of bone longsleeve cuff"), caption: "Tine Longsleeve", productSlugs: ["tine-heavy-longsleeve"] },
  { id: "03", layout: "wide", image: img("03", 2400, 1600, "Two figures walking through a clearing"), caption: "Ridge Zip, Carpenter Pant", productSlugs: ["ridge-zip-hoodie", "canvas-carpenter-pant"] },
  { id: "04", layout: "tall", image: img("04", 1600, 2400, "Ember boxy hoodie against dark timber"), caption: "Stag Boxy Hoodie", productSlugs: ["stag-boxy-hoodie"] },
  { id: "05", layout: "square", image: img("05", 1600, 1600, "Detail of selvedge denim hem"), caption: "Forest Straight Jean", productSlugs: ["forest-straight-jean"] },
  { id: "06", layout: "tall", image: img("06", 1600, 2400, "Model in mock neck and pleated trouser"), caption: "Mock Neck, Pleated Trouser", productSlugs: ["mock-neck-longsleeve", "wide-pleated-trouser"] },
  { id: "07", layout: "wide", image: img("07", 2400, 1600, "Oat pullover folded on a stone ledge"), caption: "Field Pullover", productSlugs: ["field-pullover-hood"] },
  { id: "08", layout: "square", image: img("08", 1600, 1600, "Waffle knit texture in stone"), caption: "Tracker Waffle", productSlugs: ["tracker-waffle-longsleeve"] },
];
