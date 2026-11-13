"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { MAX_QUANTITY, cartStore } from "@/components/cart/cart-store";
import { PaymentIcons } from "@/components/commerce/PaymentIcons";
import { bigButtonClasses } from "@/components/commerce/styles";
import { PlatformLogo, Stars } from "@/components/reviews/Stars";
import { Accordion } from "@/components/ui/Accordion";
import { BagIcon, CheckCircleIcon, ShieldIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Sheet } from "@/components/ui/Sheet";
import { shippingCopy, sizeGuides } from "@/data/size-guides";
import { actionVideos, badge, checkoutExtras, productInfo, stickyBar } from "@/data/storefront";
import { CHECKOUT_ENABLED, startCheckout } from "@/lib/checkout";
import { cn, formatPrice } from "@/lib/format";
import { ratingLabel } from "@/lib/rating";
import { UNNAMED_COLOR, type Product } from "@/types/product";
import type { ReviewSummary } from "@/types/review";
import { DeliveryEstimate } from "./DeliveryEstimate";
import { Gallery } from "./Gallery";
import { SeeItInAction } from "./SeeItInAction";
import { SizeGuideTable } from "./SizeGuideTable";
import { StickyBuyBar } from "./StickyBuyBar";

interface ProductDetailProps {
  product: Product;
  /** Store-wide rating; the strip is hidden when null. */
  summary: ReviewSummary | null;
}

export function ProductDetail({ product, summary }: ProductDetailProps) {
  const { openCart } = useCart();
  const [colorSlug, setColorSlug] = useState(product.colors[0].slug);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const sizeGroupRef = useRef<HTMLFieldSetElement>(null);
  const errorId = useId();
  const [guideOpen, setGuideOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const buyRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Every colour's photos in one gallery; picking a colour jumps to its first photo.
  const images = useMemo(() => {
    const seen = new Set<string>();
    return product.colors.flatMap((c) => c.images).filter((img) => !seen.has(img.src) && seen.add(img.src));
  }, [product.colors]);
  const color = product.colors.find((c) => c.slug === colorSlug) ?? product.colors[0];
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  const showBadge = badge.enabled && (badge.products.length === 0 || badge.products.includes(product.slug));
  const videos = actionVideos[product.slug];
  const guide = sizeGuides[product.category];

  /** Adds the selection to the cart. Returns false when a size is still missing. */
  function addSelection(): boolean {
    if (!size) {
      setSizeError(true);
      sizeGroupRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus();
      return false;
    }
    cartStore.add(
      {
        key: `${product.id}:${color.slug}:${size}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        colorName: color.name,
        colorSlug: color.slug,
        size,
        price: product.price,
        compareAtPrice: product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice : undefined,
        image: { src: color.images[0].src, alt: color.images[0].alt },
      },
      quantity,
    );
    setQuantity(1);
    return true;
  }

  function onAddToCart() {
    if (addSelection()) openCart();
  }

  /** Express checkout (Shop Pay): add, then go straight to checkout. */
  async function onExpressCheckout() {
    if (pending || !addSelection()) return;
    if (!CHECKOUT_ENABLED) {
      openCart();
      return;
    }
    setPending(true);
    setMessage(null);
    const result = await startCheckout(cartStore.getSnapshot());
    if (result.status === "redirect") {
      window.location.assign(result.url);
      return;
    }
    setMessage(result.message);
    setPending(false);
    openCart();
  }

  return (
    <div className="container-page grid gap-8 pt-6 pb-16 md:grid-cols-2 md:gap-10 md:pt-10 lg:gap-16">
      <div className="md:sticky md:top-[calc(var(--header-h)+1.5rem)] md:self-start">
        <Gallery images={images} productName={product.name} focusSrc={color.images[0].src} />
      </div>

      <div className="mx-auto w-full max-w-xl space-y-6 md:mx-0">
        {summary && (
          <a href="#reviews-product" className="flex flex-wrap items-center gap-2 text-sm">
            <Stars rating={summary.rating} className="text-base" />
            <span>
              <span className="font-semibold">{ratingLabel(summary.rating)}</span> {summary.rating.toFixed(1)} / 5
            </span>
            <PlatformLogo platform={summary.platform} />
          </a>
        )}

        <h1 className="text-4xl leading-[1.05] font-bold tracking-tight md:text-5xl">{product.name}</h1>

        {showBadge && (
          <div className="inline-flex items-stretch overflow-hidden rounded-md border border-black">
            <span className="flex w-12 items-center justify-center bg-black text-lg font-bold text-white">{badge.rank}</span>
            <span className="px-3 py-2">
              <span className="block text-sm font-bold uppercase">{badge.title}</span>
              <span className="block text-xs text-grey-600 italic">{badge.subline}</span>
            </span>
          </div>
        )}

        <p className="text-xl tabular-nums">
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

        <p className="leading-relaxed text-grey-600">{product.description}</p>

        <div ref={optionsRef} className="scroll-mt-[calc(var(--header-h)+1rem)] space-y-8 pt-2">
          {/* Color: a picker only when there is a choice */}
          {product.colors.length === 1 ? (
            color.name !== UNNAMED_COLOR && (
              <p className="type-label">
                Color: <span className="text-grey-600">{color.name}</span>
              </p>
            )
          ) : (
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
                      className="block h-9 w-9 rounded-full border border-ink/20 ring-offset-2 ring-offset-white transition-shadow peer-checked:ring-1 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent"
                      style={{ backgroundColor: c.swatch }}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Size */}
          <fieldset
            ref={sizeGroupRef}
            aria-describedby={sizeError ? errorId : undefined}
            aria-invalid={sizeError || undefined}
          >
            <legend className="sr-only">Size</legend>
            {/* Visible label row: a plain flex row, because positioned
                children of a fieldset are offset below its legend. */}
            <div className="flex items-baseline justify-between">
              <span className="type-label">
                Size{size && <span className="text-grey-600">: {size}</span>}
              </span>
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="type-label border-b border-ink/40 pb-0.5 hover:border-ink"
                aria-haspopup="dialog"
              >
                Size guide
              </button>
            </div>
            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))] gap-2">
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
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={MAX_QUANTITY}
                label={product.name}
                className="rounded-full px-1"
              />
            <button
              ref={buyRef}
              type="button"
              onClick={onAddToCart}
              className={cn(bigButtonClasses, "flex-1")}
            >
              <BagIcon width={24} height={24} strokeWidth={2} />
              Add to cart
            </button>
          </div>
          {message && (
            <p role="status" className="text-center text-xs text-accent">
              {message}
            </p>
          )}
          <DeliveryEstimate />

          {CHECKOUT_ENABLED && checkoutExtras.expressCheckout && (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onExpressCheckout}
                className="flex h-12 w-full items-center justify-center gap-1.5 rounded-lg bg-shoppay text-white transition hover:brightness-110"
              >
                Buy with <span className="font-bold">shop</span>
                <span className="rounded bg-white px-1 text-xs font-bold text-shoppay">Pay</span>
              </button>
              <button type="button" onClick={onExpressCheckout} className="block w-full text-center text-xs underline underline-offset-4">
                More payment options
              </button>
            </div>
          )}
        </div>

        {checkoutExtras.trustRow && (
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <li className="flex items-center gap-1.5">
              <ShieldIcon width={18} height={18} />
              Secure Checkout
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircleIcon width={18} height={18} />
              Shop With Confidence
            </li>
          </ul>
        )}
        <PaymentIcons methods={checkoutExtras.paymentMethods} />

        <Accordion
          headingLevel="h2"
          items={[
            {
              id: "size-fit",
              title: "Size & Fit",
              content: (
                <div className="space-y-3">
                  <p>{product.fit ?? productInfo.sizeFit}</p>
                  <button type="button" onClick={() => setGuideOpen(true)} className="text-ink underline underline-offset-4">
                    Open the size guide
                  </button>
                </div>
              ),
            },
            { id: "fabric", title: "Fabric & Care", content: <p>{product.materials ?? productInfo.fabricCare}</p> },
            {
              id: "shipping",
              title: "Shipping Info",
              content: (
                <div className="space-y-3">
                  {shippingCopy.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              ),
            },
            {
              id: "guarantee",
              title: "Satisfaction Guarantee",
              content: (
                <div className="space-y-3">
                  {productInfo.guarantee.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              ),
            },
          ]}
        />

        {videos && <SeeItInAction stat={videos.stat} videos={videos.videos} />}
      </div>

      <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} title="Size guide" side="center">
        <SizeGuideTable guide={guide} productName={product.name} />
      </Sheet>

      {stickyBar.enabled && (
        <StickyBuyBar
          watchRef={buyRef}
          targetRef={optionsRef}
          name={product.name}
          image={color.images[0]}
          label={stickyBar.buttonLabel}
        />
      )}
    </div>
  );
}
