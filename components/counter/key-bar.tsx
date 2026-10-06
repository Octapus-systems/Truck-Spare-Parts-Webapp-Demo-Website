"use client";

import { SHORTCUTS, keyLabel, type CounterAction } from "@/lib/store/keys";
import { Overlay } from "./overlay";

/** Bottom bar: clickable shortcut hints, generated from the shortcut table. */
export function KeyBar({ onAction }: { onAction: (action: CounterAction) => void }) {
  return (
    <nav aria-label="Keyboard shortcuts" className="no-print flex h-8 shrink-0 items-center gap-1 overflow-x-auto bg-[var(--c-bar)] px-2 text-[11.5px] text-white">
      {SHORTCUTS.filter((s) => s.bar).map((s) => (
        <button
          key={s.action}
          onClick={() => onAction(s.action)}
          className="flex h-6 shrink-0 items-center gap-1.5 px-2 hover:bg-white/10"
        >
          <span className="c-kbd">{keyLabel(s.keys[0])}</span>
          {s.label}
        </button>
      ))}
    </nav>
  );
}

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <Overlay title="Keyboard shortcuts" onClose={onClose}>
      <table className="c-table">
        <thead>
          <tr>
            <th>Key</th>
            <th className="w-full">Action</th>
          </tr>
        </thead>
        <tbody>
          {SHORTCUTS.map((s) => (
            <tr key={s.action}>
              <td>
                <span className="flex gap-1">
                  {[...new Set(s.keys.map((k) => keyLabel(k.length === 1 ? k.toUpperCase() : k)))].map((k) => (
                    <span key={k} className="c-kbd">
                      {k}
                    </span>
                  ))}
                </span>
              </td>
              <td>{s.label}</td>
            </tr>
          ))}
          <tr>
            <td>
              <span className="c-kbd">Ctrl+P</span>
            </td>
            <td>Print open invoice</td>
          </tr>
        </tbody>
      </table>
      <p className="muted p-3 text-[12px]">
        Letter keys work when the cursor is not in a text box. Press <span className="c-kbd">Esc</span> to leave the
        search box, then use them.
      </p>
    </Overlay>
  );
}
