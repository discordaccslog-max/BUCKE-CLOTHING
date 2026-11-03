"use client";

import { inView } from "framer-motion";
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

const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Fade/slide an element in when it scrolls into view.
 *
 * Server HTML is always fully visible, so content never waits on
 * JavaScript and LCP isn't delayed. On mount, only elements that start
 * below the fold are hidden and then revealed on scroll; anything already
 * on screen is left alone. Reduced motion skips the effect entirely.
 *
 * The reveal uses the Web Animations API directly rather than Framer's
 * `animate()`: Next keeps visited pages mounted (React <Activity>), and
 * Framer caches each element's last animated values, so on a return visit
 * it would treat opacity 1 → 1 as already done and leave the hidden element
 * invisible. WAAPI keeps no per-element state.
 */
export function Reveal({ children, as: Tag = "div", className, delay = 0, y = 28 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    const hidden = { opacity: "0", transform: `translateY(${y}px)` };
    el.style.opacity = hidden.opacity;
    el.style.transform = hidden.transform;
    let animation: Animation | undefined;

    const stop = inView(
      el,
      () => {
        // The animation's backwards fill holds the hidden state through the
        // delay, so the inline styles can be cleared straight away.
        animation = el.animate([hidden, { opacity: "1", transform: "none" }], {
          duration: 900,
          delay: delay * 1000,
          easing: EASING,
          fill: "backwards",
        });
        el.style.opacity = "";
        el.style.transform = "";
      },
      { margin: "0px 0px -8% 0px" },
    );
    return () => {
      stop();
      animation?.cancel();
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
