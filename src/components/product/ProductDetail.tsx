"use client";

import { useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { cartStore } from "@/components/cart/cart-store";
import { PaymentIcons } from "@/components/commerce/PaymentIcons";
import { PlatformLogo, Stars } from "@/components/reviews/Stars";
import { Accordion } from "@/components/ui/Accordion";
import { BagIcon, CheckCircleIcon, ShieldIcon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/Sheet";
import { shippingCopy, sizeGuides } from "@/data/size-guides";
import { actionVideos, badge, bundles, checkoutExtras, productInfo, stickyBar } from "@/data/storefront";
import { bundleTiers } from "@/lib/bundles";
import { CHECKOUT_ENABLED, startCheckout } from "@/lib/checkout";
import { ratingLabel } from "@/lib/rating";
import type { Product } from "@/types/product";
import type { ReviewSummary } from "@/types/review";
import { BundlePicker, type BundleItem } from "./BundlePicker";
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
  const tiers = bundleTiers();
  const maxQty = Math.max(...tiers.map((t) => t.quantity));
  const [quantity, setQuantity] = useState(
    tiers.some((t) => t.quantity === bundles.defaultQuantity) ? bundles.defaultQuantity : tiers[0].quantity,
  );
  const [items, setItems] = useState<BundleItem[]>(() =>
    Array.from({ length: maxQty }, () => ({ color: product.colors[0].slug, size: "" })),
  );
  const [missing, setMissing] = useState<number[]>([]);
  const [guideOpen, setGuideOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const sizeRefs = useRef<(HTMLSelectElement | null)[]>([]);
  const buyRef = useRef<HTMLButtonElement>(null);
  const bundlesRef = useRef<HTMLDivElement>(null);

  // Every colour's photos in one gallery; picking a colour jumps to its first photo.
  const images = useMemo(() => {
    const seen = new Set<string>();
    return product.colors.flatMap((c) => c.images).filter((img) => !seen.has(img.src) && seen.add(img.src));
  }, [product.colors]);
  const primaryColor = product.colors.find((c) => c.slug === items[0].color) ?? product.colors[0];

  const showBadge = badge.enabled && (badge.products.length === 0 || badge.products.includes(product.slug));
  const videos = actionVideos[product.slug];
  const guide = sizeGuides[product.category];

  function onItemChange(index: number, patch: Partial<BundleItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
    if (patch.size) setMissing((m) => m.filter((i) => i !== index));
  }

  async function onBuyNow() {
    if (pending) return;
    const chosen = items.slice(0, quantity);
    const gaps = chosen.flatMap((it, i) => (it.size ? [] : [i]));
    if (gaps.length) {
      setMissing(gaps);
      sizeRefs.current[gaps[0]]?.focus();
      return;
    }
    setMissing([]);
    for (const it of chosen) {
      const color = product.colors.find((c) => c.slug === it.color) ?? product.colors[0];
      cartStore.add(
        {
          key: `${product.id}:${color.slug}:${it.size}`,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          colorName: color.name,
          colorSlug: color.slug,
          size: it.size,
          price: product.price,
          image: { src: color.images[0].src, alt: color.images[0].alt },
        },
        1,
      );
    }
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
        <Gallery images={images} productName={product.name} focusSrc={primaryColor.images[0].src} />
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

        <div ref={bundlesRef} className="scroll-mt-[calc(var(--header-h)+1rem)] pt-2">
          <BundlePicker
            product={product}
            heading={bundles.heading}
            tiers={tiers}
            quantity={quantity}
            onQuantityChange={(q) => {
              setQuantity(q);
              setMissing([]);
            }}
            items={items}
            onItemChange={onItemChange}
            missing={missing}
            sizeRefs={sizeRefs}
            onOpenSizeGuide={() => setGuideOpen(true)}
          />
        </div>

        <div className="space-y-3">
          <button
            ref={buyRef}
            type="button"
            onClick={onBuyNow}
            aria-busy={pending || undefined}
            className="flex h-16 w-full items-center justify-center gap-3 rounded-lg bg-linear-to-b from-grey-800 to-black text-base font-bold tracking-[0.08em] text-white uppercase shadow-sm transition hover:from-grey-700 hover:to-grey-900"
          >
            <BagIcon width={22} height={22} />
            {pending ? "One moment…" : "Buy now"}
          </button>
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
                onClick={onBuyNow}
                className="flex h-12 w-full items-center justify-center gap-1.5 rounded-lg bg-shoppay text-white transition hover:brightness-110"
              >
                Buy with <span className="font-bold">shop</span>
                <span className="rounded bg-white px-1 text-xs font-bold text-shoppay">Pay</span>
              </button>
              <button type="button" onClick={onBuyNow} className="block w-full text-center text-xs underline underline-offset-4">
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
          targetRef={bundlesRef}
          name={product.name}
          image={primaryColor.images[0]}
          label={stickyBar.buttonLabel}
        />
      )}
    </div>
  );
}
