"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // reducedMotion="user": Framer drops transform animations when the OS
    // asks for reduced motion, keeping only opacity fades.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <CartProvider>{children}</CartProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
