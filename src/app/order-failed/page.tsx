import Link from "next/link";
import { BackGuard } from "../order-success/BackGuard";

export default function OrderFailedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
      <BackGuard />
      <h1 className="font-display text-display-lg text-ink">Payment failed</h1>
      <p className="max-w-sm text-grey-600">
        Something went wrong with your payment. Please try again.
      </p>
      <Link
        href="/shop"
        className="mt-4 inline-block bg-ink px-8 py-3 text-sm font-medium tracking-widest text-white uppercase hover:bg-accent transition-colors"
      >
        Back to shop
      </Link>
    </main>
  );
}
