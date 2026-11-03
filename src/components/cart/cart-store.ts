/**
 * Bag state as a tiny external store backed by localStorage.
 * Read through useSyncExternalStore so server render and hydration agree
 * (the server snapshot is always an empty bag).
 */
import type { CartLine } from "@/types/cart";

// v2: real catalogue import; drops bags holding placeholder products.
const KEY = "bucke:bag:v2";
const EMPTY: CartLine[] = [];
export const MAX_QUANTITY = 10;

let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function isLine(value: unknown): value is CartLine {
  const v = value as CartLine;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.key === "string" &&
    typeof v.slug === "string" &&
    typeof v.price === "number" &&
    typeof v.quantity === "number"
  );
}

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter(isLine) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: CartLine[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: keep the in-memory bag for this session.
  }
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: read,
  getServerSnapshot: () => EMPTY,

  add(line: Omit<CartLine, "quantity">, quantity: number) {
    const lines = read();
    const existing = lines.find((l) => l.key === line.key);
    if (existing) {
      write(
        lines.map((l) =>
          l.key === line.key
            ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + quantity) }
            : l,
        ),
      );
    } else {
      write([...lines, { ...line, quantity: Math.min(MAX_QUANTITY, quantity) }]);
    }
  },
  setQuantity(key: string, quantity: number) {
    if (quantity <= 0) return cartStore.remove(key);
    write(read().map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) } : l)));
  },
  remove(key: string) {
    write(read().filter((l) => l.key !== key));
  },
  clear() {
    write([]);
  },
};
