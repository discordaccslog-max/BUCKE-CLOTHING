import type { Metadata } from "next";
import Link from "next/link";
import { BuckMark } from "@/components/brand/BuckMark";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="on-ink relative -mt-16 flex min-h-[100svh] flex-col justify-center overflow-hidden bg-ink pt-16 text-bone md:-mt-20 md:pt-20"
    >
      <p
        aria-hidden="true"
        className="type-display pointer-events-none absolute -bottom-[0.12em] left-1/2 -translate-x-1/2 select-none text-[clamp(10rem,48vw,44rem)] leading-none text-grey-900"
      >
        404
      </p>
      <div className="container-page relative">
        <BuckMark className="h-14 w-14 animate-fade text-accent-light" />
        <p className="type-label mt-10 animate-rise text-grey-400">Error 404</p>
        <h1 id="not-found-title" className="type-display mt-4 max-w-[12ch] animate-rise text-display-xl [animation-delay:80ms]">
          Off the trail.
        </h1>
        <p className="mt-6 max-w-sm animate-rise text-grey-400 [animation-delay:160ms]">
          The page you&apos;re looking for has moved, sold out or never existed. Head back to familiar ground.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 animate-rise [animation-delay:240ms]">
          <ButtonLink href="/shop" variant="light">
            Shop the collection
          </ButtonLink>
          <ButtonLink href="/" variant="outline-light">
            Back home
          </ButtonLink>
        </div>
        <p className="mt-16 text-sm text-grey-400">
          Still lost?{" "}
          <Link href="/contact" className="text-bone underline underline-offset-4 hover:text-accent-light">
            Contact the studio
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
