"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { searchOwn } from "@/lib/store/search";
import { useCatalog } from "@/lib/store/store";

/** Part / OE number search with live suggestions from own stock. Submitting goes to /parts?q=. */
export function SearchBox({
  size = "md",
  placeholder,
  buttonLabel = "Search",
  initial = "",
  autoFocus,
}: {
  size?: "md" | "lg";
  placeholder: string;
  buttonLabel?: string;
  initial?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const products = useCatalog();
  const listId = useId();
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const q = value.trim();
  const suggestions = q.length >= 2 ? searchOwn(q, products).slice(0, 6) : [];
  const showList = open && suggestions.length > 0;

  const go = (query: string) => {
    setOpen(false);
    if (query.trim()) router.push(`/parts?q=${encodeURIComponent(query.trim())}`);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (showList && active >= 0) router.push(`/parts/${suggestions[active].id}`);
    else go(value);
  };

  const onKey = (event: KeyboardEvent) => {
    if (!showList) return;
    if (event.key === "ArrowDown") setActive((i) => (i + 1) % suggestions.length);
    else if (event.key === "ArrowUp") setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    else if (event.key === "Escape") setOpen(false);
    else return;
    event.preventDefault();
  };

  const lg = size === "lg";

  return (
    <form onSubmit={submit} role="search" className="relative w-full">
      <div
        className={`flex items-center gap-2 border border-[var(--s-line-strong)] bg-white focus-within:border-[var(--s-text)] focus-within:shadow-[0_0_0_4px_rgba(11,92,255,.12)] ${
          lg ? "h-16 rounded-xl ps-5 pe-2 shadow-[0_10px_30px_rgba(15,17,21,.08)]" : "h-10 rounded-lg ps-3 pe-1"
        }`}
      >
        <Search size={lg ? 20 : 16} className="shrink-0 text-[var(--s-muted)]" aria-hidden="true" />
        <input
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKey}
          placeholder={placeholder}
          aria-label={placeholder}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--s-muted)] ${lg ? "text-[17px]" : "text-[14px]"}`}
        />
        <button type="submit" className="s-btn" data-variant={lg ? "primary" : "ghost"} data-size={lg ? undefined : "sm"} style={lg ? { height: 48 } : undefined}>
          {lg ? buttonLabel : <span className="sr-only">{buttonLabel}</span>}
          {!lg && <Search size={15} aria-hidden="true" />}
        </button>
      </div>

      {showList && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[var(--s-line)] bg-white py-1.5 text-start shadow-[0_18px_40px_rgba(15,17,21,.14)]">
          {suggestions.map((p, i) => (
            <li key={p.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => router.push(`/parts/${p.id}`)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-start ${i === active ? "bg-[var(--s-surface)]" : "hover:bg-[var(--s-surface)]"}`}
              >
                <img src={p.image} alt="" className="h-9 w-9 shrink-0 rounded-md bg-[var(--s-surface)] object-contain p-1 mix-blend-multiply" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{p.name}</span>
                  <span className="mono block truncate text-[12px] text-[var(--s-muted)]">
                    {p.brand} · {p.partNumber} · OE {p.oe[0]}
                  </span>
                </span>
              </button>
            </li>
          ))}
          <li>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => go(value)} className="w-full border-t border-[var(--s-line)] px-4 py-2.5 text-start text-[13px] font-medium text-[var(--s-accent)] hover:bg-[var(--s-surface)]">
              Search all parts and TecDoc for “{q}” →
            </button>
          </li>
        </ul>
      )}
    </form>
  );
}
