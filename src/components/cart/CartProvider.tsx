"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { bundleDiscount } from "@/lib/bundles";
import type { CartLine } from "@/types/cart";
import { cartStore } from "./cart-store";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** Bundle savings in cents (see src/lib/bundles.ts). */
  discount: number;
  /** subtotal - discount */
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, "quantity">, quantity: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const addLine = useCallback<CartContextValue["addLine"]>((line, qty) => {
    cartStore.add(line, qty);
    setIsOpen(true);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
    const discount = bundleDiscount(lines);
    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal,
      discount,
      total: subtotal - discount,
      isOpen,
      openCart,
      closeCart,
      addLine,
      setQuantity: cartStore.setQuantity,
      removeLine: cartStore.remove,
    };
  }, [lines, isOpen, openCart, closeCart, addLine],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
