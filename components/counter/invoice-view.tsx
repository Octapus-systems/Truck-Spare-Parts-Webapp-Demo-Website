"use client";

import { CURRENCY, describeDiscount, formatMoney, lineAmount } from "@/lib/counter/billing";
import type { Invoice } from "@/lib/counter/types";
import { Overlay } from "./overlay";

// Demo seller details; replace with the real trading name and TRN before use.
const SELLER = {
  name: "Desert Route Truck Parts LLC",
  address: "Dubai Investment Park, Dubai, UAE",
  trn: "100000000000003",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" });

/** Printable tax invoice. Ctrl+P prints only this (see @media print in counter.css). */
export function InvoiceView({ invoice, onNew, onClose }: { invoice: Invoice; onNew: () => void; onClose: () => void }) {
  return (
    <Overlay title={`Invoice ${invoice.number}`} onClose={onClose} wide className="print-area">
      <div className="no-print flex items-center justify-between gap-2 border-b border-[var(--c-line)] bg-[#f6f6f4] px-4 py-2">
        <span className="text-[12px] text-[var(--c-green)]">✓ Invoice created. Stock updated.</span>
        <span className="flex gap-2">
          <button className="c-btn" onClick={() => window.print()}>
            Print <span className="c-kbd">Ctrl+P</span>
          </button>
          <button autoFocus className="c-btn" data-primary="true" onClick={onNew}>
            New bill <span className="c-kbd">N</span>
          </button>
        </span>
      </div>

      <article className="p-6 text-[12.5px]">
        <header className="flex justify-between gap-6 border-b-2 border-[var(--c-text)] pb-3">
          <div>
            <p className="text-[15px] font-bold">{SELLER.name}</p>
            <p className="muted">{SELLER.address}</p>
            <p className="mono">TRN {SELLER.trn}</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-bold tracking-[.04em]">TAX INVOICE</p>
            <p className="mono">{invoice.number}</p>
            <p className="muted">{fmtDate(invoice.issuedAt)}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 py-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-[var(--c-muted)]">Bill to</p>
            <p className="font-semibold">{invoice.customer.name}</p>
            {invoice.customer.phone && <p className="mono">{invoice.customer.phone}</p>}
            {invoice.customer.trn && <p className="mono">TRN {invoice.customer.trn}</p>}
          </div>
          <div className="text-right">
            <p className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-[var(--c-muted)]">Currency</p>
            <p>{CURRENCY} · prices excl. VAT</p>
          </div>
        </section>

        <table className="c-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Part no</th>
              <th>Brand</th>
              <th className="w-full">Description</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Unit</th>
              <th className="text-right">VAT %</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, i) => (
              <tr key={line.id}>
                <td className="mono">{i + 1}</td>
                <td className="mono">{line.partNumber}</td>
                <td>{line.brand}</td>
                <td className="ellipsis">
                  {line.description}
                  {line.specialOrder && " (special order)"}
                </td>
                <td className="num">{line.qty}</td>
                <td className="num">{formatMoney(line.unitPrice)}</td>
                <td className="num">5</td>
                <td className="num">{formatMoney(lineAmount(line))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-3 grid w-72 grid-cols-[1fr_auto] gap-y-1">
          <dt className="muted">Subtotal</dt>
          <dd className="num">{formatMoney(invoice.subtotal)}</dd>
          {invoice.discountTotal > 0 && (
            <>
              <dt className="muted">Discount {invoice.discount?.kind === "percent" && `(${describeDiscount(invoice.discount)})`}</dt>
              <dd className="num">−{formatMoney(invoice.discountTotal)}</dd>
            </>
          )}
          <dt className="muted">Taxable amount</dt>
          <dd className="num">{formatMoney(invoice.subtotal - invoice.discountTotal)}</dd>
          <dt className="muted">VAT 5%</dt>
          <dd className="num">{formatMoney(invoice.vat)}</dd>
          <dt className="border-t-2 border-[var(--c-text)] pt-1 font-bold">Total {CURRENCY}</dt>
          <dd className="num border-t-2 border-[var(--c-text)] pt-1 text-[16px] font-bold">{formatMoney(invoice.total)}</dd>
        </dl>

        <footer className="muted mt-8 border-t border-[var(--c-line)] pt-2 text-[11px]">
          Demo invoice generated by the Desert Route counter prototype. Not a valid tax document.
        </footer>
      </article>
    </Overlay>
  );
}
