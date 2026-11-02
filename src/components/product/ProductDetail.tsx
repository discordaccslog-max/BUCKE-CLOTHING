"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { MAX_QUANTITY } from "@/components/cart/cart-store";
import { Accordion } from "@/components/ui/Accordion";
import { buttonClasses } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Sheet } from "@/components/ui/Sheet";
import { shippingCopy, sizeGuides } from "@/data/size-guides";
import { cn, formatPrice } from "@/lib/format";
import type { Category, Product } from "@/types/product";
import { Gallery } from "./Gallery";
import { SizeGuideTable } from "./SizeGuideTable";

interface ProductDetailProps {
  product: Product;
  category: Category;
}

export function ProductDetail({ product, category }: ProductDetailProps) {
  const { addLine } = useCart();
  const [colorSlug, setColorSlug] = useState(product.colors[0].slug);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const sizeGroupRef = useRef<HTMLFieldSetElement>(null);
  const errorId = useId();
  const priceId = useId();

  const color = product.colors.find((c) => c.slug === colorSlug) ?? product.colors[0];
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const guide = sizeGuides[product.category];

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!size) {
      setSizeError(true);
      sizeGroupRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus();
      return;
    }
    addLine(
      {
        key: `${product.id}:${color.slug}:${size}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        colorName: color.name,
        colorSlug: color.slug,
        size,
        price: product.price,
        image: { src: color.images[0].src, alt: color.images[0].alt },
      },
      quantity,
    );
    setQuantity(1);
  }

  return (
    <div className="container-page grid gap-10 pt-6 pb-20 md:grid-cols-12 md:gap-8 md:pt-10 lg:gap-12 xl:gap-16">
      <div className="md:col-span-6 lg:col-span-7">
        <Gallery key={color.slug} images={color.images} productName={product.name} />
      </div>

      <div className="md:col-span-6 lg:col-span-5">
        <div className="md:sticky md:top-28">
          <nav aria-label="Breadcrumb" className="type-label text-grey-600">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/shop" className="hover:text-ink">
                  Shop
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/shop/${category.slug}`} className="hover:text-ink">
                  {category.name}
                </Link>
              </li>
            </ol>
          </nav>

          <h1 className="type-display mt-5 animate-lift text-display-lg">{product.name}</h1>

          <p id={priceId} className="mt-4 text-lg tabular-nums">
            {onSale && (
              <>
                <s className="mr-3 text-grey-500">
                  <span className="sr-only">Was </span>
                  {formatPrice(product.compareAtPrice!)}
                </s>
                <span className="sr-only">Now </span>
              </>
            )}
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 max-w-md leading-relaxed text-grey-600">{product.description}</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-8" noValidate>
            {/* Color */}
            <fieldset>
              <legend className="type-label">
                Color: <span className="text-grey-600">{color.name}</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.colors.map((c) => (
                  <label key={c.slug} className="relative cursor-pointer" title={c.name}>
                    <input
                      type="radio"
                      name="color"
                      value={c.slug}
                      checked={c.slug === color.slug}
                      onChange={() => setColorSlug(c.slug)}
                      className="peer sr-only"
                    />
                    <span className="sr-only">{c.name}</span>
                    <span
                      aria-hidden="true"
                      className="block h-9 w-9 rounded-full border border-ink/20 ring-offset-2 ring-offset-bone transition-shadow peer-checked:ring-1 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent"
                      style={{ backgroundColor: c.swatch }}
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Size */}
            <fieldset
              ref={sizeGroupRef}
              className="relative"
              aria-describedby={sizeError ? errorId : undefined}
              aria-invalid={sizeError || undefined}
            >
              <legend className="type-label">
                Size{size && <span className="text-grey-600">: {size}</span>}
              </legend>
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="type-label absolute top-0 right-0 border-b border-ink/40 pb-0.5 hover:border-ink"
                aria-haspopup="dialog"
              >
                Size guide
              </button>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {product.sizes.map((s) => {
                  const soldOut = product.soldOutSizes.includes(s);
                  return (
                    <label key={s} className={cn("relative", soldOut ? "cursor-not-allowed" : "cursor-pointer")}>
                      <input
                        type="radio"
                        name="size"
                        value={s}
                        checked={size === s}
                        disabled={soldOut}
                        onChange={() => {
                          setSize(s);
                          setSizeError(false);
                        }}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "flex h-12 items-center justify-center border text-sm transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                          soldOut
                            ? "border-ink/10 text-grey-500 line-through"
                            : "border-ink/20 hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bone",
                          sizeError && !soldOut && "border-accent/60",
                        )}
                      >
                        {s}
                        {soldOut && <span className="sr-only"> (sold out)</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p id={errorId} role="alert" className="mt-3 min-h-5 text-sm text-accent">
                {sizeError ? "Select a size to add this to your bag." : ""}
              </p>
            </fieldset>

            {/* Quantity + add */}
            <div className="flex gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={MAX_QUANTITY}
                label={product.name}
              />
              <button type="submit" className={buttonClasses("solid", "flex-1 justify-between")} aria-describedby={priceId}>
                <span>Add to bag</span>
                <span className="tabular-nums">{formatPrice(product.price * quantity)}</span>
              </button>
            </div>
          </form>

          <div className="mt-10">
            <Accordion
              headingLevel="h2"
              defaultOpen="details"
              items={[
                {
                  id: "details",
                  title: "Details",
                  content: (
                    <ul className="list-disc space-y-1 pl-5">
                      {product.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "sizing",
                  title: "Materials & fit",
                  content: (
                    <div className="space-y-3">
                      <p>{product.materials}</p>
                      <p>{product.fit}</p>
                      <button
                        type="button"
                        onClick={() => setGuideOpen(true)}
                        className="text-ink underline underline-offset-4"
                      >
                        Open the size guide
                      </button>
                    </div>
                  ),
                },
                {
                  id: "shipping",
                  title: "Shipping & returns",
                  content: (
                    <div className="space-y-3">
                      {shippingCopy.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} title="Size guide" side="center">
        <SizeGuideTable guide={guide} productName={product.name} />
      </Sheet>
    </div>
  );
}
