"use client";

import Link from "next/link";
import { Sheet } from "@/components/ui/Sheet";
import { mainNav, secondaryNav, site } from "@/lib/site";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Menu" side="left">
      <nav aria-label="Mobile" className="flex h-full flex-col justify-between px-5 py-8">
        <ul className="space-y-2">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="type-display block text-[2.75rem] leading-[1.02]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="space-y-6">
          <ul className="type-label flex gap-6">
            {secondaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={onClose}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm text-grey-600">{site.tagline}</p>
        </div>
      </nav>
    </Sheet>
  );
}
