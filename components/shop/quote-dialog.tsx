"use client";

import { CheckCircle2, X } from "lucide-react";
import { createContext, useContext, useEffect, useState, type FormEvent } from "react";
import type { Product } from "@/data/products";
import { requestQuote } from "@/lib/store/quotes";
import { update } from "@/lib/store/store";
import type { QuotePart, QuoteRequest } from "@/lib/store/types";
import type { TecdocArticle } from "@/lib/tecdoc/types";

export const partFromArticle = (a: TecdocArticle): QuotePart => ({
  brand: a.supplierName,
  partNumber: a.articleNo,
  description: a.productName ?? "Spare part",
  productId: null,
  tecdocKey: a.key,
});

export const partFromProduct = (p: Product): QuotePart => ({
  brand: p.brand,
  partNumber: p.partNumber,
  description: p.name,
  productId: p.id,
  tecdocKey: null,
});

const QuoteContext = createContext<(part: QuotePart) => void>(() => {});

/** Opens the quick-quote form from anywhere in the shop. */
export const useQuote = () => useContext(QuoteContext);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [part, setPart] = useState<QuotePart | null>(null);
  return (
    <QuoteContext.Provider value={setPart}>
      {children}
      {part && <QuoteDialog part={part} onClose={() => setPart(null)} />}
    </QuoteContext.Provider>
  );
}

function QuoteDialog({ part, onClose }: { part: QuotePart; onClose: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<QuoteRequest | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const problems: Record<string, string> = {};
    if (!field("name")) problems.name = "Enter your name or company";
    if (!/^[+\d][\d\s-]{6,}$/.test(field("phone"))) problems.phone = "Enter a mobile number";
    setErrors(problems);
    if (Object.keys(problems).length) return;
    let quote = null as QuoteRequest | null;
    update((s) => {
      const result = requestQuote(
        s,
        { customer: { name: field("name"), phone: field("phone"), trn: null }, part, qty: Number(field("qty")), note: field("note") },
        new Date(),
      );
      quote = result.quote;
      return result.state;
    });
    setSent(quote);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="quote-title" className="s-page w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="quote-title" className="text-[19px] font-semibold tracking-[-.02em]">
              {sent ? "Quote request sent" : "Request a quote"}
            </h2>
            <p className="mono mt-1 text-[13px] text-[var(--s-text-2)]">
              {part.brand} · {part.partNumber}
            </p>
            <p className="text-[13px] text-[var(--s-muted)]">{part.description}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-md hover:bg-[var(--s-surface)]">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="mt-6 text-center">
            <CheckCircle2 size={40} strokeWidth={1.5} className="mx-auto text-[var(--s-green)]" />
            <p className="mt-3">
              Reference <span className="mono font-semibold">{sent.number}</span>
            </p>
            <p className="mt-1 text-[14px] text-[var(--s-text-2)]">Our counter team will call you with price and lead time.</p>
            <button className="s-btn mt-6 w-full" data-variant="primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5 grid gap-3">
            <label>
              <span className="s-label">Name or company *</span>
              <input name="name" autoFocus className="s-input" aria-invalid={!!errors.name} />
              {errors.name && <span className="mt-1 block text-[12.5px] text-[var(--s-red)]">{errors.name}</span>}
            </label>
            <div className="grid grid-cols-[1fr_96px] gap-3">
              <label>
                <span className="s-label">Mobile *</span>
                <input name="phone" type="tel" className="s-input" placeholder="05X XXX XXXX" aria-invalid={!!errors.phone} />
                {errors.phone && <span className="mt-1 block text-[12.5px] text-[var(--s-red)]">{errors.phone}</span>}
              </label>
              <label>
                <span className="s-label">Qty</span>
                <input name="qty" type="number" min={1} defaultValue={1} className="s-input" />
              </label>
            </div>
            <label>
              <span className="s-label">Note</span>
              <textarea name="note" rows={2} className="s-input !h-auto py-2.5" placeholder="Vehicle, VIN or deadline" />
            </label>
            <button type="submit" className="s-btn mt-1 w-full" data-variant="primary" data-size="lg">
              Send quote request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
