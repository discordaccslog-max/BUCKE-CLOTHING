"use client";

import Link from "next/link";
import { useState } from "react";
import { BuckMark } from "@/components/brand/BuckMark";
import { useCart } from "@/components/cart/CartProvider";
import { BagIcon, MenuIcon } from "@/components/ui/icons";
import { mainNav, secondaryNav } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

/**
 * Fixed site header. On the homepage the hero sets <html data-hero="top">
 * while it is in view; the `hero-top:` variant then makes the header
 * transparent and hides the small mark until the hero scrolls past.
 */
export function Header() {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-bone/90 text-ink backdrop-blur-md transition-[background-color,color,border-color] duration-500 hero-top:border-transparent hero-top:bg-transparent hero-top:text-bone hero-top:backdrop-blur-none">
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
        <div className="flex items-center">
          <button
            type="button"
            className="-ml-2 inline-flex h-11 w-11 items-center justify-center lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
          >
            <MenuIcon />
          </button>
          <nav aria-label="Primary" className="hidden lg:block">
            <NavLinks items={mainNav} className="type-label flex gap-7" />
          </nav>
        </div>

        <Link
          href="/"
          aria-label="Bucke, home"
          className="flex items-center justify-center transition-[opacity,visibility] duration-500 hero-top:invisible hero-top:opacity-0"
        >
          <BuckMark className="h-9 w-9 md:h-10 md:w-10" />
        </Link>

        <div className="flex items-center justify-end gap-7">
          <nav aria-label="Secondary" className="hidden lg:block">
            <NavLinks items={secondaryNav} className="type-label flex gap-7" />
          </nav>
          <button
            type="button"
            onClick={openCart}
            className="type-label -mr-2 inline-flex h-11 items-center gap-2 px-2"
            aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
            aria-haspopup="dialog"
          >
            <BagIcon className="md:hidden" />
            <span className="hidden md:inline">Bag</span>
            <span className="tabular-nums">({count})</span>
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
