"use client";

import { useEffect } from "react";

export function BackGuard() {
  useEffect(() => {
    // Push multiple duplicate entries so there's a buffer against rapid back presses
    // and so the user has to press back many times to actually leave
    const pushGuard = () => {
      for (let i = 0; i < 3; i++) {
        history.pushState(null, "", window.location.href);
      }
    };

    pushGuard();

    const onPopState = () => {
      // On any back navigation attempt, push more state entries
      pushGuard();
    };

    const onPageShow = (e: PageTransitionEvent) => {
      // If this page was restored from bfcache (e.g., mobile Safari), re-setup the guard
      // This is critical for mobile Stripe where the previous page may be restored from cache
      if (e.persisted) {
        pushGuard();
      }
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
