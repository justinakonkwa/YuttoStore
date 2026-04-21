import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  add: (product: Product, qty?: number, selectedColor?: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, qty = 1, selectedColor) =>
        set((s) => {
          const existing = s.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + qty, product.stock || 99) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...s.items,
              { product, quantity: qty, selectedColor: selectedColor ?? product.images[0]?.color },
            ],
          };
        }),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.product.id === id
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.product.stock || 99)) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.quantity * i.product.price, 0),
    }),
    { name: "yutto-cart" }
  )
);
