"use client";

import { useSyncExternalStore } from "react";

// Cart lives in localStorage for guests and signed-in users alike.
// Prices are re-read from the DB at checkout; never trust these values.
export type CartItem = { variantId: string; quantity: number };

const KEY = "pds-cart";
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;

function read(): CartItem[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

function write(items: CartItem[]) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  listeners.forEach((l) => l());
}

const EMPTY: CartItem[] = [];

export const cart = {
  add(variantId: string, quantity = 1) {
    const items = read();
    const found = items.find((i) => i.variantId === variantId);
    write(found
      ? items.map((i) => (i.variantId === variantId ? { ...i, quantity: i.quantity + quantity } : i))
      : [...items, { variantId, quantity }]);
  },
  setQuantity(variantId: string, quantity: number) {
    write(quantity <= 0 ? read().filter((i) => i.variantId !== variantId) : read().map((i) => (i.variantId === variantId ? { ...i, quantity } : i)));
  },
  remove(variantId: string) {
    write(read().filter((i) => i.variantId !== variantId));
  },
  clear() {
    write([]);
  },
};

export function useCart() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => EMPTY,
  );
}

// Cart sheet open state: any client component can open the cart sheet (e.g. after add-to-cart).
let sheetOpen = false;
const sheetListeners = new Set<() => void>();

export function setCartSheetOpen(open: boolean) {
  sheetOpen = open;
  sheetListeners.forEach((l) => l());
}

export function useCartSheetOpen() {
  return useSyncExternalStore(
    (l) => {
      sheetListeners.add(l);
      return () => sheetListeners.delete(l);
    },
    () => sheetOpen,
    () => false,
  );
}
