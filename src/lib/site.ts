function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const site = {
  name: "Bucke",
  legalName: "Bucke Clothing",
  tagline: "Built heavy. Cut quiet.",
  description:
    "Bucke is streetwear: graphic hoodies, longsleeves, shirts and wide-leg denim.",
  url: resolveSiteUrl(),
  email: "studio@buckeclothing.com",
  instagram: "https://instagram.com/buckeclothing",
} as const;

export const mainNav = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop/hoodies", label: "Hoodies" },
  { href: "/shop/longsleeves", label: "Longsleeves" },
  { href: "/shop/shirts", label: "Shirts" },
  { href: "/shop/pants-jeans", label: "Pants & Jeans" },
  { href: "/lookbook", label: "Lookbook" },
] as const;

export const secondaryNav = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
