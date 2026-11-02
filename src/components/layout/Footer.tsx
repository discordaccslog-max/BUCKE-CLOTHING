import Link from "next/link";
import { BuckMark } from "@/components/brand/BuckMark";
import { mainNav, secondaryNav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="on-ink bg-ink text-bone">
      <div className="container-page pt-20 pb-10 md:pt-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <BuckMark className="h-12 w-12" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-grey-400">{site.description}</p>
          </div>
          <nav aria-label="Shop" className="md:col-span-3">
            <h2 className="type-label text-grey-400">Shop</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-accent-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Company" className="md:col-span-2">
            <h2 className="type-label text-grey-400">Company</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {secondaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-accent-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-2">
            <h2 className="type-label text-grey-400">Follow</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={site.instagram}
                  className="hover:text-accent-light"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Instagram<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-accent-light">
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="type-display mt-20 select-none text-[clamp(5rem,27vw,26rem)] leading-[0.78] text-grey-800"
        >
          Bucke
        </p>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-bone/10 pt-6 text-xs text-grey-400 md:flex-row">
          <p>© {site.legalName}</p>
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
