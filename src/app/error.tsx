"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[60vh] flex-col justify-center py-24">
      <p className="type-label text-grey-600">Something went wrong</p>
      <h1 className="type-display mt-4 text-display-lg">We tripped on a root.</h1>
      <p className="mt-5 max-w-sm text-grey-600">An unexpected error stopped this page from loading.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Back home
        </ButtonLink>
      </div>
    </section>
  );
}
