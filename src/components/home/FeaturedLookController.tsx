"use client";

import { useLayoutEffect } from "react";

/**
 * Panel reveal, driven by p: 0 when the section's top meets the viewport's
 * bottom, 1 when it reaches the top. The panel's top edge sits at
 * vh·(1-p)³, always at or above the section's own top (vh·(1-p)), so it rises
 * ahead of the scroll over the previous section and meets the section top
 * exactly at p = 1. Nothing is pinned and scrolling itself is never touched.
 */
const MODEL_REVEAL = { from: 0.55, to: 0.9 };
/** The panel is within ~1px of rest here; the text stagger waits for it. */
const PANEL_SETTLED = 0.9;
const TEXT = { duration: 800, delay: 120, stagger: 80, rise: 16 };
/** Vertical travel (px) across the section's pass through the viewport. */
const PARALLAX = { model: 40, text: 10 };
/** Max tilt (deg) on the model and counter-shift (px) on the glow. */
const TILT = { y: 4, x: 2, glowX: 18, glowY: 10 };
/** Damping time constant (ms): higher drifts more slowly. */
const TILT_TAU = 220;
const TILT_QUERY = "(min-width: 64rem) and (hover: hover) and (pointer: fine)";

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/**
 * Motion for the featured-look section. The server HTML is the final state,
 * so with reduced motion (or no JS) nothing here runs. The text stagger uses
 * the Web Animations API for the same reason as Reveal: Next keeps visited
 * pages mounted, and WAAPI holds no per-element state between visits.
 */
export function FeaturedLookController({ sectionId }: { sectionId: string }) {
  useLayoutEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pick = (name: string) => section.querySelector<HTMLElement>(`[data-fl="${name}"]`);
    const panel = pick("panel");
    const glowReveal = pick("glow-reveal");
    const glowMove = pick("glow-move");
    const modelReveal = pick("model-reveal");
    const modelTilt = pick("model-tilt");
    const modelParallax = pick("model-parallax");
    const headline = section.querySelector<HTMLElement>("[data-fl-headline]");
    const textParallax = [...section.querySelectorAll<HTMLElement>('[data-fl="text-parallax"]')];
    const textItems = [...section.querySelectorAll<HTMLElement>('[data-fl="text-item"]')];
    if (!panel || !glowReveal || !glowMove || !modelReveal || !modelTilt || !modelParallax || !headline) return;

    const easing =
      getComputedStyle(document.documentElement).getPropertyValue("--ease-editorial").trim() || "ease-out";

    // Reveal only when the section starts below the fold; otherwise it is
    // already on screen and stays in its final state.
    const reveal = section.getBoundingClientRect().top > window.innerHeight * 0.92;
    let modelShown = !reveal;
    let textShown = !reveal;
    let textAnimations: Animation[] = [];
    const hiddenText = { opacity: "0", transform: `translateY(${TEXT.rise}px)` };
    if (reveal) {
      glowReveal.style.opacity = modelReveal.style.opacity = "0";
      textItems.forEach((el) => Object.assign(el.style, hiddenText));
    }

    const showText = () => {
      textShown = true;
      // Backwards fill holds each hidden state through its delay, so the
      // inline styles can be cleared as soon as the animations exist.
      textAnimations = textItems.map((el, i) =>
        el.animate([hiddenText, { opacity: "1", transform: "none" }], {
          duration: TEXT.duration,
          delay: TEXT.delay + i * TEXT.stagger,
          easing,
          fill: "backwards",
        }),
      );
      textItems.forEach((el) => (el.style.opacity = el.style.transform = ""));
    };

    /* ---------- One rAF loop off cached values ---------- */
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
    let lastScroll = NaN;
    let raf = 0;
    let lastTime = 0;

    function schedule() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function applyScroll() {
      const sectionTop = box.top - scrollY;
      const p = clamp((box.vh - sectionTop) / box.vh);

      if (reveal) {
        const lead = (1 - p) ** 3 - (1 - p);
        panel!.style.transform = lead ? `translate3d(0, ${(box.vh * lead).toFixed(1)}px, 0)` : "";
      }
      if (!modelShown) {
        const o = clamp((p - MODEL_REVEAL.from) / (MODEL_REVEAL.to - MODEL_REVEAL.from));
        if (o >= 1) {
          modelShown = true;
          glowReveal!.style.opacity = modelReveal!.style.opacity = "";
        } else {
          glowReveal!.style.opacity = modelReveal!.style.opacity = o.toFixed(3);
        }
      }
      if (!textShown && p >= PANEL_SETTLED) showText();

      // Parallax over the section's whole pass through the viewport. The
      // headline rides with the model so its overlap on him never drifts.
      const pass = clamp((scrollY + box.vh - box.top) / (box.vh + box.height)) - 0.5;
      const modelY = `${(-pass * PARALLAX.model).toFixed(2)}px`;
      modelParallax!.style.transform = `translate3d(0, ${modelY}, 0)`;
      headline!.style.translate = `0 ${modelY}`;
      const textY = `translate3d(0, ${(pass * PARALLAX.text).toFixed(2)}px, 0)`;
      textParallax.forEach((el) => (el.style.transform = textY));
    }

    function tick(now: number) {
      raf = 0;
      if (scrollY !== lastScroll) {
        lastScroll = scrollY;
        applyScroll();
      }

      const dt = lastTime ? Math.min(now - lastTime, 64) : 16;
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
    const onResize = () => {
      lastScroll = NaN;
      measure();
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

    const ro = new ResizeObserver(onResize);
    ro.observe(section);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    section.addEventListener("pointermove", onPointerMove);
    section.addEventListener("pointerleave", resetTilt);
    tiltMq.addEventListener("change", onTiltMq);
    measure();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", resetTilt);
      tiltMq.removeEventListener("change", onTiltMq);
      textAnimations.forEach((a) => a.cancel());
      panel.style.transform = modelParallax.style.transform = "";
      modelTilt.style.transform = glowMove.style.transform = "";
      headline.style.translate = "";
      glowReveal.style.opacity = modelReveal.style.opacity = "";
      textParallax.forEach((el) => (el.style.transform = ""));
      textItems.forEach((el) => (el.style.opacity = el.style.transform = ""));
    };
  }, [sectionId]);

  return null;
}
