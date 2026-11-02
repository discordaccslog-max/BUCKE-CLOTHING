"use client";

import { useLayoutEffect } from "react";
import { runIntroDecision } from "./intro";

/**
 * Keeps <html data-hero> in sync with the hero's visibility so the header
 * can sit transparent over it, and runs the intro decision on client-side
 * navigations (where the inline script doesn't execute).
 */
export function HeroController({ heroId, introId }: { heroId: string; introId: string }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const hero = document.getElementById(heroId);
    if (!hero) return;

    runIntroDecision(introId); // no-op if the inline script already decided

    const io = new IntersectionObserver(
      ([entry]) => {
        root.dataset.hero = entry.isIntersecting ? "top" : "past";
      },
      { rootMargin: "-80px 0px 0px 0px" },
    );
    io.observe(hero);
    return () => {
      io.disconnect();
      delete root.dataset.hero;
    };
  }, [heroId, introId]);

  return null;
}
