"use client";

import { inView } from "framer-motion";
import { useLayoutEffect } from "react";

const ENTRANCE = {
  duration: 900,
  textDuration: 800,
  modelDelay: 200,
  textDelay: 420,
  stagger: 80,
  modelRise: 24,
  textRise: 16,
};
/** Vertical travel (px) across the section's pass through the viewport. */
const PARALLAX = { model: 40, text: 10 };
/** Max tilt (deg) on the model and counter-shift (px) on the glow. */
const TILT = { y: 4, x: 2, glowX: 18, glowY: 10 };
/** Damping time constant (ms): higher drifts more slowly. */
const TILT_TAU = 220;
const TILT_QUERY = "(min-width: 64rem) and (hover: hover) and (pointer: fine)";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Motion for the featured-look section. The server HTML is the final state,
 * so with reduced motion (or no JS) nothing here runs. Entrance uses the Web
 * Animations API for the same reason as Reveal: Next keeps visited pages
 * mounted, and WAAPI holds no per-element state between visits.
 */
export function FeaturedLookController({ sectionId }: { sectionId: string }) {
  useLayoutEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pick = (name: string) => section.querySelector<HTMLElement>(`[data-fl="${name}"]`);
    const glowReveal = pick("glow-reveal");
    const glowMove = pick("glow-move");
    const modelReveal = pick("model-reveal");
    const modelTilt = pick("model-tilt");
    const modelParallax = pick("model-parallax");
    const textParallax = pick("text-parallax");
    const textItems = [...section.querySelectorAll<HTMLElement>('[data-fl="text-item"]')];
    if (!glowReveal || !glowMove || !modelReveal || !modelTilt || !modelParallax || !textParallax) return;

    const cleanups: Array<() => void> = [];
    const easing =
      getComputedStyle(document.documentElement).getPropertyValue("--ease-editorial").trim() || "ease-out";

    /* ---------- Entrance: once, only if the section starts below the fold ---------- */
    if (section.getBoundingClientRect().top > window.innerHeight * 0.92) {
      const hiddenModel = { opacity: "0", transform: `translateY(${ENTRANCE.modelRise}px)` };
      const hiddenText = { opacity: "0", transform: `translateY(${ENTRANCE.textRise}px)` };
      const shown = { opacity: "1", transform: "none" };
      glowReveal.style.opacity = "0";
      Object.assign(modelReveal.style, hiddenModel);
      textItems.forEach((el) => Object.assign(el.style, hiddenText));

      const clearInline = () => {
        glowReveal.style.opacity = "";
        modelReveal.style.opacity = modelReveal.style.transform = "";
        textItems.forEach((el) => (el.style.opacity = el.style.transform = ""));
      };
      let animations: Animation[] = [];

      const stop = inView(
        section,
        () => {
          stop();
          // Backwards fill holds each hidden state through its delay, so the
          // inline styles can be cleared as soon as the animations exist.
          animations = [
            glowReveal.animate([{ opacity: "0" }, { opacity: "1" }], {
              duration: ENTRANCE.duration,
              easing,
              fill: "backwards",
            }),
            modelReveal.animate([hiddenModel, shown], {
              duration: ENTRANCE.duration,
              delay: ENTRANCE.modelDelay,
              easing,
              fill: "backwards",
            }),
            ...textItems.map((el, i) =>
              el.animate([hiddenText, shown], {
                duration: ENTRANCE.textDuration,
                delay: ENTRANCE.textDelay + i * ENTRANCE.stagger,
                easing,
                fill: "backwards",
              }),
            ),
          ];
          clearInline();
        },
        { amount: 0.3 },
      );
      cleanups.push(() => {
        stop();
        animations.forEach((a) => a.cancel());
        clearInline();
      });
    }

    /* ---------- Parallax + tilt: one rAF loop off cached values ---------- */
    const box = { top: 0, left: 0, width: 1, height: 1, vh: window.innerHeight };
    let scrollY = window.scrollY;
    const measure = () => {
      const r = section.getBoundingClientRect();
      box.top = r.top + window.scrollY;
      box.left = r.left;
      box.width = r.width || 1;
      box.height = r.height || 1;
      box.vh = window.innerHeight;
      schedule();
    };

    const tiltMq = window.matchMedia(TILT_QUERY);
    let tiltOn = tiltMq.matches;
    const target = { rx: 0, ry: 0, gx: 0, gy: 0 };
    const current = { rx: 0, ry: 0, gx: 0, gy: 0 };
    let lastParallax = NaN;
    let raf = 0;
    let lastTime = 0;

    function schedule() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function tick(now: number) {
      raf = 0;
      const dt = lastTime ? Math.min(now - lastTime, 64) : 16;

      const progress = clamp((scrollY + box.vh - box.top) / (box.vh + box.height), 0, 1) - 0.5;
      if (progress !== lastParallax) {
        lastParallax = progress;
        modelParallax!.style.transform = `translate3d(0, ${(-progress * PARALLAX.model).toFixed(2)}px, 0)`;
        textParallax!.style.transform = `translate3d(0, ${(progress * PARALLAX.text).toFixed(2)}px, 0)`;
      }

      const k = 1 - Math.exp(-dt / TILT_TAU);
      let moving = false;
      for (const key of ["rx", "ry", "gx", "gy"] as const) {
        current[key] += (target[key] - current[key]) * k;
        if (Math.abs(target[key] - current[key]) > 0.005) moving = true;
        else current[key] = target[key];
      }
      modelTilt!.style.transform =
        current.rx || current.ry ? `rotateX(${current.rx.toFixed(3)}deg) rotateY(${current.ry.toFixed(3)}deg)` : "";
      glowMove!.style.transform =
        current.gx || current.gy ? `translate3d(${current.gx.toFixed(2)}px, ${current.gy.toFixed(2)}px, 0)` : "";

      if (moving) {
        lastTime = now;
        schedule();
      } else {
        lastTime = 0;
      }
    }

    const onScroll = () => {
      scrollY = window.scrollY;
      schedule();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!tiltOn || e.pointerType === "touch") return;
      const nx = clamp(((e.clientX - box.left) / box.width) * 2 - 1, -1, 1);
      const ny = clamp(((e.clientY - (box.top - scrollY)) / box.height) * 2 - 1, -1, 1);
      target.ry = nx * TILT.y;
      target.rx = -ny * TILT.x;
      target.gx = -nx * TILT.glowX;
      target.gy = -ny * TILT.glowY;
      schedule();
    };
    const resetTilt = () => {
      target.rx = target.ry = target.gx = target.gy = 0;
      schedule();
    };
    const onTiltMq = () => {
      tiltOn = tiltMq.matches;
      if (!tiltOn) resetTilt();
    };

    const ro = new ResizeObserver(measure);
    ro.observe(section);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    section.addEventListener("pointermove", onPointerMove);
    section.addEventListener("pointerleave", resetTilt);
    tiltMq.addEventListener("change", onTiltMq);
    measure();

    cleanups.push(() => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", resetTilt);
      tiltMq.removeEventListener("change", onTiltMq);
      modelParallax.style.transform = textParallax.style.transform = "";
      modelTilt.style.transform = glowMove.style.transform = "";
    });

    return () => cleanups.forEach((fn) => fn());
  }, [sectionId]);

  return null;
}
