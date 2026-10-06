"use client";

// The only stateful counter module. Components read with useCounterState() and
// change state with update(); nothing else touches localStorage. Swapping this
// file for a database-backed store leaves the UI unchanged.
import { useSyncExternalStore } from "react";
import { hydrate, initialState } from "./reducer.ts";
import type { CounterState } from "./types";

const STORAGE_KEY = "counter:v1";
const SERVER_STATE = initialState();

let state: CounterState | null = null;
let storageOk = true;
const listeners = new Set<() => void>();

function load(): CounterState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return hydrate(raw ? JSON.parse(raw) : null);
  } catch {
    storageOk = false;
    return initialState();
  }
}

function save(next: CounterState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    storageOk = true;
  } catch {
    storageOk = false;
  }
}

const current = () => (state ??= load());

export function update(fn: (s: CounterState) => CounterState) {
  const next = fn(current());
  if (next === state) return;
  state = next;
  save(next);
  listeners.forEach((listener) => listener());
}

/** Clears bill, customers, invoices and stock movements. */
export const resetDemo = () => update(() => initialState());

export const isStorageOk = () => storageOk;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useCounterState = () => useSyncExternalStore(subscribe, current, () => SERVER_STATE);
