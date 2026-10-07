"use client";

// Single source of truth for counter shortcuts. The key bar and the "?" help
// overlay render from SHORTCUTS, so hints never drift from behaviour.
import { useEffect, useRef } from "react";

export type CounterAction =
  | "search"
  | "up"
  | "down"
  | "enter"
  | "escape"
  | "add"
  | "compare"
  | "openCompare"
  | "verify"
  | "customer"
  | "bill"
  | "qtyUp"
  | "qtyDown"
  | "remove"
  | "discount"
  | "confirm"
  | "history"
  | "orders"
  | "dashboard"
  | "scan"
  | "newBill"
  | "help";

type Shortcut = {
  action: CounterAction;
  keys: string[];
  label: string;
  /** Shown in the bottom key bar (the rest only in the "?" list). */
  bar?: boolean;
  /** Printable keys are ignored while typing in a text field. */
  printable?: boolean;
};

export const SHORTCUTS: Shortcut[] = [
  { action: "search", keys: ["/"], label: "Search", bar: true, printable: true },
  { action: "up", keys: ["ArrowUp"], label: "Move up" },
  { action: "down", keys: ["ArrowDown"], label: "Move down" },
  { action: "enter", keys: ["Enter"], label: "Detail / select", bar: true },
  { action: "add", keys: ["F2"], label: "Add to bill", bar: true },
  { action: "compare", keys: ["F3"], label: "Mark compare", bar: true },
  { action: "openCompare", keys: ["c", "C"], label: "Open compare", printable: true },
  { action: "verify", keys: ["v", "V"], label: "Verify fitment", printable: true },
  { action: "customer", keys: ["F4"], label: "Customer", bar: true },
  { action: "orders", keys: ["F6"], label: "Shop orders", bar: true },
  { action: "dashboard", keys: ["F7"], label: "Dashboard", bar: true },
  { action: "scan", keys: ["s", "S"], label: "Camera scan", printable: true },
  { action: "bill", keys: ["F8"], label: "Bill lines", bar: true },
  { action: "qtyUp", keys: ["+", "="], label: "Qty +1", printable: true },
  { action: "qtyDown", keys: ["-"], label: "Qty −1", printable: true },
  { action: "remove", keys: ["Delete"], label: "Remove line" },
  { action: "discount", keys: ["d", "D"], label: "Discount", printable: true },
  { action: "confirm", keys: ["F9"], label: "Confirm", bar: true },
  { action: "history", keys: ["F10"], label: "Invoices", bar: true },
  { action: "newBill", keys: ["n", "N"], label: "New bill", printable: true },
  { action: "escape", keys: ["Escape"], label: "Back", bar: true },
  { action: "help", keys: ["?"], label: "All keys", bar: true, printable: true },
];

export const keyLabel = (key: string) =>
  ({ ArrowUp: "↑", ArrowDown: "↓", Enter: "Enter", Escape: "Esc", Delete: "Del" })[key] ?? key;

const byKey = new Map(SHORTCUTS.flatMap((s) => s.keys.map((k) => [k, s] as const)));

const isTextField = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Calls `handler` for counter shortcuts. While typing in a text field only
 * function keys, Escape and — in the main search box — arrows/Enter fire.
 * Return false from the handler to let the browser handle the key.
 */
export function useCounterKeys(handler: (action: CounterAction) => boolean | void) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const shortcut = byKey.get(event.key);
      if (!shortcut) return;
      if (isTextField(event.target)) {
        const inSearch = (event.target as HTMLElement).dataset.counterSearch !== undefined;
        const navigation = ["up", "down", "enter"].includes(shortcut.action);
        if (shortcut.printable || (navigation && !inSearch)) return;
      }
      if (ref.current(shortcut.action) === false) return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
