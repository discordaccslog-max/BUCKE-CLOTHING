"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/format";

interface NavItem {
  href: string;
  label: string;
}

interface NavLinksProps {
  items: readonly NavItem[];
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}

function isActive(pathname: string, href: string) {
  return href === "/shop"
    ? pathname === "/shop"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function Links({
  items,
  className,
  linkClassName,
  onNavigate,
  pathname,
}: NavLinksProps & { pathname: string | null }) {
  return (
    <ul className={className}>
      {items.map((item) => {
        const active = pathname ? isActive(pathname, item.href) : false;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-block py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-out-expo hover:after:scale-x-100 aria-[current=page]:after:scale-x-100",
                linkClassName,
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveLinks(props: NavLinksProps) {
  const pathname = usePathname();
  return <Links {...props} pathname={pathname} />;
}

/**
 * Nav list with aria-current on the active link. The pathname can be
 * unknown while prerendering dynamic routes, so the same list renders
 * without an active state as the Suspense fallback.
 */
export function NavLinks(props: NavLinksProps) {
  return (
    <Suspense fallback={<Links {...props} pathname={null} />}>
      <ActiveLinks {...props} />
    </Suspense>
  );
}
