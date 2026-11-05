/** A line in the shopping bag. Price and name are snapshotted at add time;
 *  the checkout provider must re-price server-side before charging. */
export interface CartLine {
  /** `${productId}:${colorSlug}:${size}` */
  key: string;
  productId: string;
  slug: string;
  name: string;
  colorName: string;
  colorSlug: string;
  size: string;
  price: number;
  /** Regular price per item when the product is on sale; shows the "Save" pill. */
  compareAtPrice?: number;
  image: { src: string; alt: string };
  quantity: number;
}
