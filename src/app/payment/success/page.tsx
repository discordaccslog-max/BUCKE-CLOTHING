import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your order has been placed successfully.",
};

export default function PaymentSuccessPage() {
  return (
    <div className="container-page pt-16 pb-24 md:pt-28 md:pb-36">
      <header className="max-w-lg">
        <p className="type-label animate-rise text-grey-600">Order confirmed</p>
        <h1 className="type-display mt-5 animate-lift text-display-xl [animation-delay:80ms]">
          You&rsquo;re all set.
        </h1>
        <p className="mt-6 text-grey-600">
          Your payment was successful. We&rsquo;ll get your order packed and on its way.
        </p>
        <Link
          href="/shop"
          className="mt-10 inline-block underline underline-offset-4 hover:text-accent"
        >
          Continue shopping
        </Link>
      </header>
    </div>
  );
}
