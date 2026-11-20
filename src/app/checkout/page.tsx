import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";
import { getReviewSummary } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Trustpilot score for the header lockup (cached data).
  const rating = await getReviewSummary();
  return <Checkout rating={rating} />;
}
