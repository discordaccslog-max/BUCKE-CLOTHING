"use client";

import { animate, inView } from "framer-motion";
import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds. Use small multiples (0.08) for staggered groups. */
  delay?: number;
  /** Vertical travel in px. */
  y?: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Fade/slide an element in when it scrolls into view.
 *
 * Server HTML is always fully visible, so content never waits on
 * JavaScript and LCP isn't delayed. On mount, only elements that start
 * below the fold are hidden and then revealed on scroll; anything already
 * on screen is left alone. Reduced motion skips the effect entirely.
 */
export function Reveal({ children, as: Tag = "div", className, delay = 0, y = 28 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.style.opacity = "0";
    el.style.transform = `translateY(${y}px)`;
    const stop = inView(
      el,
      () => {
        animate(el, { opacity: 1, transform: "translateY(0px)" }, { duration: 0.9, delay, ease: EASE });
      },
      { margin: "0px 0px -8% 0px" },
    );
    return () => {
      stop();
      el.style.opacity = "";
      el.style.transform = "";
    };
  }, [delay, y]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
