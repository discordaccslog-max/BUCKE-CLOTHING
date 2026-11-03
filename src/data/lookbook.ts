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

// Images are placeholders until editorial photography exists.
export const lookbook: LookbookEntry[] = [
  { id: "01", layout: "tall", image: img("01", 1600, 2400, "Model in a distressed graffiti hoodie and studded denim"), caption: "Graffiti Distressed Hoodie, Saint Studded Denim", productSlugs: ["graffiti-distressed-hoodie", "saint-studded-denim-washed-tan"] },
  { id: "02", layout: "square", image: img("02", 1600, 1600, "Close crop of a rhinestone halo tee"), caption: "Halo Rhinestone Tee", productSlugs: ["halo-rhinestone-tee-washed-grey"] },
  { id: "03", layout: "wide", image: img("03", 2400, 1600, "Figure in a layered zip hoodie and acid-wash denim"), caption: "Angel Guitar Zip Hoodie, Flame Denim", productSlugs: ["angel-guitar-layered-zip-hoodie", "flame-denim-pink-acid-wash"] },
  { id: "04", layout: "tall", image: img("04", 1600, 2400, "Rhinestone-hooded graphic hoodie against dark timber"), caption: "Rhinestone Graphic Hoodie", productSlugs: ["rhinestone-graphic-hoodie-sand"] },
  { id: "05", layout: "square", image: img("05", 1600, 1600, "Detail of teal python-print denim"), caption: "Snake Denim", productSlugs: ["snake-denim-teal-python"] },
  { id: "06", layout: "tall", image: img("06", 1600, 2400, "Model in a cross-print long sleeve and crystal-wash jeans"), caption: "Cross Long Sleeve Tee, Bunny & Alex Jeans", productSlugs: ["cross-long-sleeve-tee", "bunny-alex-crystal-wash-jeans"] },
  { id: "07", layout: "wide", image: img("07", 2400, 1600, "Paint-splattered hoodie on a stone ledge"), caption: "Painted Faces Hoodie", productSlugs: ["painted-faces-hoodie-washed-black"] },
  { id: "08", layout: "square", image: img("08", 1600, 1600, "Bankroll Club long sleeve, flat lay"), caption: "Bankroll Club Long Sleeve", productSlugs: ["bankroll-club-long-sleeve"] },
];
