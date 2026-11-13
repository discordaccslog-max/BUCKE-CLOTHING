import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your payment was cancelled.",
};

export default function PaymentCancelPage() {
  return (
    <div className="container-page pt-16 pb-24 md:pt-28 md:pb-36">
      <header className="max-w-lg">
        <p className="type-label animate-rise text-grey-600">Payment cancelled</p>
        <h1 className="type-display mt-5 animate-lift text-display-xl [animation-delay:80ms]">
          No charge was made.
        </h1>
        <p className="mt-6 text-grey-600">
          Your payment was cancelled and nothing was charged. Your bag is still saved if you&rsquo;d like to try again.
        </p>
        <Link
          href="/shop"
          className="mt-10 inline-block underline underline-offset-4 hover:text-accent"
        >
          Back to the shop
        </Link>
      </header>
    </div>
  );
}
