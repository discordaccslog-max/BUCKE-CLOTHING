import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Checkout } from "@/components/checkout/Checkout";

// Checkout reads neutral and unbranded, so it uses Inter instead of the
// site's Geist/Archivo. Self-hosted at build time by next/font.
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    // The body turns on Geist's ss01 digits; Inter's ss01 means something else.
    <div className={`${inter.className} [font-feature-settings:normal]`}>
      <Checkout />
    </div>
  );
}
