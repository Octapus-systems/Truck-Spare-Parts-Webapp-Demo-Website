"use client";

// The only stateful module, shared by the shop and the counter. Components read
// with useAppState()/useCatalog() and change state with update(); nothing else
// touches localStorage. Swapping this file for a database-backed store leaves
// the UI unchanged.
import { useMemo, useSyncExternalStore } from "react";
import { seedProducts } from "@/data/products";
import { liveProducts } from "./catalog.ts";
import { hydrate, initialState } from "./reducer.ts";
import type { AppState } from "./types";

// Key predates the shop wiring; hydrate() fills the newer fields.
const STORAGE_KEY = "counter:v1";
const SERVER_STATE = initialState();

let state: AppState | null = null;
let storageOk = true;
const listeners = new Set<() => void>();

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return hydrate(raw ? JSON.parse(raw) : null);
  } catch {
    storageOk = false;
    return initialState();
  }
}

function save(next: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    storageOk = true;
  } catch {
    storageOk = false;
  }
}

const current = () => (state ??= load());

export function update(fn: (s: AppState) => AppState) {
  const next = fn(current());
  if (next === state) return;
  state = next;
  save(next);
  listeners.forEach((listener) => listener());
}

/** Clears bill, customers, invoices, orders, cart, admin edits and stock movements. */
export const resetDemo = () => update(() => initialState());

export const isStorageOk = () => storageOk;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Other tabs (e.g. shop and counter side by side) see each other's changes.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    state = load();
    listeners.forEach((listener) => listener());
  });
}

export const useAppState = () => useSyncExternalStore(subscribe, current, () => SERVER_STATE);

/** Seed products with admin price/stock edits and sold stock applied. */
export function useCatalog() {
  const { overrides, movements } = useAppState();
  return useMemo(() => liveProducts(seedProducts, { overrides, movements }), [overrides, movements]);
}
