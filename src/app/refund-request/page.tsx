import type { Metadata } from "next";
import Link from "next/link";
import RefundRequestForm from "./RefundRequestForm";

export const metadata: Metadata = {
  title: "Refund Request — Bucke",
  description: "Submit a refund request for your Bucke order.",
  robots: { index: false, follow: false },
};

export default function RefundRequestPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <nav className="mb-10">
          <Link href="/" className="text-xs font-bold uppercase tracking-[0.14em] text-grey-500 hover:text-ink">
            ← Back to Bucke
          </Link>
        </nav>

        <h1 className="mb-3 font-display text-display-md font-extrabold tracking-tight text-ink">
          Refund Request
        </h1>
        <p className="mb-8 max-w-lg text-grey-600">
          We&apos;re sorry your order didn&apos;t make it. Fill out the form below and we&apos;ll process your refund within 3–5 business days. A member of our team will reach out via email to confirm.
        </p>

        <RefundRequestForm />
      </div>
    </main>
  );
}
