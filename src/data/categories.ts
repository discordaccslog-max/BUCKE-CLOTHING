import type { Category } from "../types/product";

/** The three Bucke categories. There are no others. */
export const categories: Category[] = [
  {
    slug: "hoodies",
    name: "Hoodies",
    description: "Heavyweight fleece, structured hoods, built to last a decade.",
    image: {
      src: "/editorial/category-hoodies.svg",
      alt: "Heavyweight hoodie, studio shot",
      width: 1600,
      height: 2000,
    },
  },
  {
    slug: "longsleeves",
    name: "Longsleeves",
    description: "Dense jersey and waffle knits for every layer.",
    image: {
      src: "/editorial/category-longsleeves.svg",
      alt: "Longsleeve tee, studio shot",
      width: 1600,
      height: 2000,
    },
  },
  {
    slug: "pants-jeans",
    name: "Pants & Jeans",
    description: "Selvedge denim, duck canvas and heavy fleece.",
    image: {
      src: "/editorial/category-pants-jeans.svg",
      alt: "Straight-leg jean, studio shot",
      width: 1600,
      height: 2000,
    },
  },
];
