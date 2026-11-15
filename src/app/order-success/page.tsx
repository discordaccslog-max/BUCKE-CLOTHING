import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
      <h1 className="font-display text-display-lg text-ink">Order confirmed</h1>
      <p className="max-w-sm text-grey-600">
        Your payment was successful. You&apos;ll receive a confirmation shortly.
      </p>
      <Link
        href="/shop"
        className="mt-4 inline-block bg-ink px-8 py-3 text-sm font-medium tracking-widest text-white uppercase hover:bg-accent transition-colors"
      >
        Continue shopping
      </Link>
    </main>
  );
}
