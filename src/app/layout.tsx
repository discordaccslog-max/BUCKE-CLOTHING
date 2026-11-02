import type { Metadata, Viewport } from "next";
import { Archivo, Geist } from "next/font/google";
import { ViewTransition } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/Providers";
import { site } from "@/lib/site";
import { tokens } from "@/lib/tokens";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: Premium Streetwear`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.legalName,
  openGraph: {
    type: "website",
    siteName: site.legalName,
    locale: "en_US",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: tokens.ink,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${geist.variable} antialiased`}
      // The homepage hero sets data-hero before first paint.
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="type-label sr-only z-[60] bg-ink px-4 py-3 text-bone focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 pt-16 outline-none md:pt-20">
            <ViewTransition update="page" default="none">
              {children}
            </ViewTransition>
          </main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
