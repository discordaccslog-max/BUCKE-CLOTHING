import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";
import { getReviewCards } from "@/components/reviews/ReviewsSection";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Same summary and review cards as the product pages (cached data).
  const reviews = await getReviewCards();
  return <Checkout reviews={reviews} />;
}
