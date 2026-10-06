"use client";

import { useState, type FormEvent, type ReactNode } from "react";

/** Modal frame. Escape is handled globally by the counter key handler. */
export function Overlay({
  title,
  onClose,
  wide,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="c-overlay no-print-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-label={title} className={`c-dialog ${className}`} data-wide={wide}>
        <header className="c-pane-head no-print">
          <span>{title}</span>
          <button className="flex items-center gap-1.5 font-normal normal-case tracking-normal" onClick={onClose}>
            <span className="c-kbd">Esc</span> Close
          </button>
        </header>
        <div className="min-h-0 overflow-auto">{children}</div>
      </section>
    </div>
  );
}

/** One-field prompt (price, discount). `validate` returns an error message or null. */
export function Prompt({
  title,
  label,
  placeholder,
  hint,
  initial = "",
  validate,
  onSubmit,
  onClose,
}: {
  title: string;
  label: string;
  placeholder: string;
  hint?: ReactNode;
  initial?: string;
  validate: (value: string) => string | null;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const problem = validate(value);
    if (problem) setError(problem);
    else onSubmit(value);
  };
  return (
    <Overlay title={title} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3 p-4">
        {hint && <div className="text-[12px]">{hint}</div>}
        <label className="grid gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--c-muted)]">{label}</span>
          <input
            autoFocus
            className="c-input mono"
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            aria-invalid={!!error}
          />
        </label>
        {error && <p className="text-[12px] text-[var(--c-red)]">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="c-btn" onClick={onClose}>
            Cancel <span className="c-kbd">Esc</span>
          </button>
          <button type="submit" className="c-btn" data-primary="true">
            OK <span className="c-kbd">Enter</span>
          </button>
        </div>
      </form>
    </Overlay>
  );
}
