"use client";

import { useState } from "react";
import { CURRENCY, describeDiscount, formatMoney, lineAmount } from "@/lib/store/billing";
import { amountDue, creditedAmount, invoiceStatus, methodLabel, paidAmount } from "@/lib/store/payments";
import type { BillLine, CreditNote, Customer, Discount, Invoice, Payment, Totals } from "@/lib/store/types";
import { Overlay } from "./overlay";

// Demo seller details; replace with the real trading name and TRN before use.
const SELLER = {
  name: "Desert Route Truck Parts LLC",
  address: "Dubai Investment Park, Dubai, UAE",
  trn: "100000000000003",
};

const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" });

const STATUS_TAG = {
  paid: { label: "PAID", tone: "green" },
  "part-paid": { label: "PART-PAID", tone: "accent" },
  unpaid: { label: "UNPAID", tone: "red" },
  returned: { label: "RETURNED", tone: undefined },
} as const;

type DocProps = {
  title: string;
  number: string;
  issuedAt: string;
  customer: Customer;
  lines: BillLine[];
  totals: Totals;
  discount: Discount | null;
  reference?: string;
  payments?: Payment[];
  footer: string;
};

/** A4 tax document body shared by invoices and credit notes. */
function TaxDocument({ title, number, issuedAt, customer, lines, totals, discount, reference, payments, footer }: DocProps) {
  return (
    <article className="p-6 text-[12.5px]">
      <header className="flex justify-between gap-6 border-b-2 border-[var(--c-text)] pb-3">
        <div>
          <p className="text-[15px] font-bold">{SELLER.name}</p>
          <p className="muted">{SELLER.address}</p>
          <p className="mono">TRN {SELLER.trn}</p>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-bold tracking-[.04em]">{title}</p>
          <p className="mono">{number}</p>
          <p className="muted">{fmtDate(issuedAt)}</p>
          {reference && <p className="mono muted">Against {reference}</p>}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-6 py-3">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-[var(--c-muted)]">Bill to</p>
          <p className="font-semibold">{customer.name}</p>
          {customer.phone && <p className="mono">{customer.phone}</p>}
          {customer.trn && <p className="mono">TRN {customer.trn}</p>}
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
          {lines.map((line, i) => (
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

      <div className="mt-3 flex justify-between gap-6">
        <div className="text-[12px]">
          {payments && payments.length > 0 && (
            <>
              <p className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-[var(--c-muted)]">Payments</p>
              {payments.map((p, i) => (
                <p key={i} className="mono">
                  {methodLabel(p.method)} {formatMoney(p.amount)}
                  {p.tendered ? ` · tendered ${formatMoney(p.tendered)}` : ""}
                </p>
              ))}
            </>
          )}
        </div>
        <dl className="grid w-72 grid-cols-[1fr_auto] gap-y-1">
          <dt className="muted">Subtotal</dt>
          <dd className="num">{formatMoney(totals.subtotal)}</dd>
          {totals.discountTotal > 0 && (
            <>
              <dt className="muted">Discount {discount?.kind === "percent" && `(${describeDiscount(discount)})`}</dt>
              <dd className="num">−{formatMoney(totals.discountTotal)}</dd>
            </>
          )}
          <dt className="muted">Taxable amount</dt>
          <dd className="num">{formatMoney(totals.subtotal - totals.discountTotal)}</dd>
          <dt className="muted">VAT 5%</dt>
          <dd className="num">{formatMoney(totals.vat)}</dd>
          <dt className="border-t-2 border-[var(--c-text)] pt-1 font-bold">Total {CURRENCY}</dt>
          <dd className="num border-t-2 border-[var(--c-text)] pt-1 text-[16px] font-bold">{formatMoney(totals.total)}</dd>
        </dl>
      </div>

      <footer className="muted mt-8 border-t border-[var(--c-line)] pt-2 text-[11px]">{footer}</footer>
    </article>
  );
}

/** 80 mm thermal receipt. */
function Receipt({ invoice, due }: { invoice: Invoice; due: number }) {
  const rule = <p className="my-1 border-t border-dashed border-black" />;
  return (
    <article className="receipt mono mx-auto w-[72mm] bg-white p-3 text-[11px] leading-[1.35] text-black">
      <p className="text-center text-[13px] font-bold">{SELLER.name}</p>
      <p className="text-center">{SELLER.address}</p>
      <p className="text-center">TRN {SELLER.trn}</p>
      {rule}
      <p className="text-center font-bold">TAX INVOICE</p>
      <p>{invoice.number}</p>
      <p>{fmtDate(invoice.issuedAt)}</p>
      <p>{invoice.customer.name}</p>
      {invoice.customer.trn && <p>TRN {invoice.customer.trn}</p>}
      {rule}
      {invoice.lines.map((l) => (
        <div key={l.id} className="mb-1">
          <p className="truncate">{l.description}</p>
          <p className="flex justify-between">
            <span>
              {l.partNumber} {l.qty}×{formatMoney(l.unitPrice)}
            </span>
            <span>{formatMoney(lineAmount(l))}</span>
          </p>
        </div>
      ))}
      {rule}
      <Row label="Subtotal" value={invoice.subtotal} />
      {invoice.discountTotal > 0 && <Row label="Discount" value={-invoice.discountTotal} />}
      <Row label="VAT 5%" value={invoice.vat} />
      <p className="flex justify-between text-[13px] font-bold">
        <span>TOTAL {CURRENCY}</span>
        <span>{formatMoney(invoice.total)}</span>
      </p>
      {rule}
      {invoice.payments.map((p, i) => (
        <div key={i}>
          <Row label={methodLabel(p.method)} value={p.amount} />
          {p.tendered ? (
            <>
              <Row label="  Tendered" value={p.tendered} />
              <Row label="  Change" value={p.tendered - p.amount} />
            </>
          ) : null}
        </div>
      ))}
      {due > 0 && <Row label="AMOUNT DUE" value={due} bold />}
      {rule}
      <p className="text-center">Thank you · Returns within 14 days with receipt</p>
    </article>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <p className={`flex justify-between whitespace-pre ${bold ? "font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value < 0 ? `-${formatMoney(-value)}` : formatMoney(value)}</span>
    </p>
  );
}

export function InvoiceView({
  invoice,
  creditNotes,
  justCreated,
  onNew,
  onPay,
  onReturn,
  onClose,
}: {
  invoice: Invoice;
  creditNotes: CreditNote[];
  justCreated: boolean;
  onNew: () => void;
  onPay: () => void;
  onReturn: () => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"a4" | "receipt">("a4");
  const status = invoiceStatus(invoice, creditNotes);
  const due = amountDue(invoice, creditNotes);
  const credited = creditedAmount(invoice.number, creditNotes);
  const tag = STATUS_TAG[status];

  return (
    <Overlay title={`Invoice ${invoice.number}`} onClose={onClose} wide className="print-area">
      <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-[var(--c-line)] bg-[#f6f6f4] px-4 py-2">
        <span className="flex items-center gap-2 text-[12px]">
          {justCreated && <span className="text-[var(--c-green)]">✓ Invoice created. Stock updated.</span>}
          <span className="c-tag" data-tone={tag.tone}>
            {tag.label}
          </span>
          <span className="mono muted">
            paid {formatMoney(paidAmount(invoice))}
            {credited > 0 && ` · credited ${formatMoney(credited)}`} · due {formatMoney(due)}
          </span>
        </span>
        <span className="flex flex-wrap gap-2">
          <span className="flex">
            <button className="c-btn" data-primary={mode === "a4"} onClick={() => setMode("a4")}>
              A4
            </button>
            <button className="c-btn" data-primary={mode === "receipt"} onClick={() => setMode("receipt")}>
              Receipt 80mm
            </button>
          </span>
          <button className="c-btn" onClick={() => window.print()}>
            Print <span className="c-kbd">Ctrl+P</span>
          </button>
          <button className="c-btn" onClick={onPay} disabled={due === 0}>
            Record payment
          </button>
          <button className="c-btn" onClick={onReturn} disabled={status === "returned"}>
            Return items
          </button>
          <button autoFocus className="c-btn" data-primary="true" onClick={onNew}>
            New bill <span className="c-kbd">N</span>
          </button>
        </span>
      </div>

      {mode === "a4" ? (
        <TaxDocument
          title="TAX INVOICE"
          number={invoice.number}
          issuedAt={invoice.issuedAt}
          customer={invoice.customer}
          lines={invoice.lines}
          totals={invoice}
          discount={invoice.discount}
          payments={invoice.payments}
          footer="Demo invoice generated by the Desert Route counter prototype. Not a valid tax document."
        />
      ) : (
        <div className="bg-[#e9e9e5] py-4">
          <Receipt invoice={invoice} due={due} />
        </div>
      )}
    </Overlay>
  );
}

export function CreditNoteView({ creditNote, onClose }: { creditNote: CreditNote; onClose: () => void }) {
  return (
    <Overlay title={`Credit note ${creditNote.number}`} onClose={onClose} wide className="print-area">
      <div className="no-print flex items-center justify-between gap-2 border-b border-[var(--c-line)] bg-[#f6f6f4] px-4 py-2">
        <span className="text-[12px] text-[var(--c-green)]">✓ Credit note issued. Returned stock added back.</span>
        <button className="c-btn" onClick={() => window.print()}>
          Print <span className="c-kbd">Ctrl+P</span>
        </button>
      </div>
      <TaxDocument
        title="TAX CREDIT NOTE"
        number={creditNote.number}
        issuedAt={creditNote.issuedAt}
        customer={creditNote.customer}
        lines={creditNote.lines}
        totals={creditNote}
        discount={null}
        reference={creditNote.invoice}
        footer="Demo credit note generated by the Desert Route counter prototype. Not a valid tax document."
      />
    </Overlay>
  );
}
