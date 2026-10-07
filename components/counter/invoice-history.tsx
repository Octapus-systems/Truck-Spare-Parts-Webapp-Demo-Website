"use client";

import { useState, type KeyboardEvent } from "react";
import { CURRENCY, formatMoney } from "@/lib/store/billing";
import { amountDue, invoiceStatus } from "@/lib/store/payments";
import type { CreditNote, Invoice } from "@/lib/store/types";
import { Overlay } from "./overlay";

const TONE = { paid: "green", "part-paid": "accent", unpaid: "red", returned: undefined } as const;

const fmt = (iso: string) => new Date(iso).toLocaleString("en-AE", { dateStyle: "short", timeStyle: "short" });

export function InvoiceHistory({
  invoices,
  creditNotes,
  onOpen,
  onOpenCredit,
  onClose,
}: {
  invoices: Invoice[];
  creditNotes: CreditNote[];
  onOpen: (invoice: Invoice) => void;
  onOpenCredit: (creditNote: CreditNote) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<"invoices" | "credit">("invoices");

  const onKey = (event: KeyboardEvent) => {
    const count = tab === "invoices" ? invoices.length : creditNotes.length;
    if (event.key === "ArrowDown") setIndex((i) => Math.min(i + 1, count - 1));
    else if (event.key === "ArrowUp") setIndex((i) => Math.max(i - 1, 0));
    else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      setTab((t) => (t === "invoices" ? "credit" : "invoices"));
      setIndex(0);
    } else if (event.key === "Enter") {
      if (tab === "invoices" && invoices[index]) onOpen(invoices[index]);
      if (tab === "credit" && creditNotes[index]) onOpenCredit(creditNotes[index]);
    } else return;
    event.preventDefault();
  };

  return (
    <Overlay title="Invoices & credit notes" onClose={onClose} wide>
      <div tabIndex={0} onKeyDown={onKey} className="outline-none" ref={(el) => el?.focus()}>
        <div className="flex border-b border-[var(--c-line)]">
          {(
            [
              ["invoices", `Invoices · ${invoices.length}`],
              ["credit", `Credit notes · ${creditNotes.length}`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              className="px-3 py-1.5 text-[12px] font-semibold"
              style={tab === key ? { boxShadow: "inset 0 -2px 0 var(--c-accent)" } : { color: "var(--c-muted)" }}
              onClick={() => {
                setTab(key);
                setIndex(0);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "invoices" ? (
          <table className="c-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Date</th>
                <th className="w-full">Customer</th>
                <th className="text-right">Total {CURRENCY}</th>
                <th className="text-right">Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => {
                const status = invoiceStatus(inv, creditNotes);
                return (
                  <tr key={inv.number} aria-selected={i === index} onClick={() => setIndex(i)} onDoubleClick={() => onOpen(inv)}>
                    <td className="mono">{inv.number}</td>
                    <td className="mono">{fmt(inv.issuedAt)}</td>
                    <td className="ellipsis">{inv.customer.name}</td>
                    <td className="num">{formatMoney(inv.total)}</td>
                    <td className="num">{formatMoney(amountDue(inv, creditNotes))}</td>
                    <td>
                      <span className="c-tag" data-tone={TONE[status]}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="c-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Date</th>
                <th>Invoice</th>
                <th className="w-full">Customer</th>
                <th className="text-right">Credit {CURRENCY}</th>
              </tr>
            </thead>
            <tbody>
              {creditNotes.map((cn, i) => (
                <tr key={cn.number} aria-selected={i === index} onClick={() => setIndex(i)} onDoubleClick={() => onOpenCredit(cn)}>
                  <td className="mono">{cn.number}</td>
                  <td className="mono">{fmt(cn.issuedAt)}</td>
                  <td className="mono">{cn.invoice}</td>
                  <td className="ellipsis">{cn.customer.name}</td>
                  <td className="num">{formatMoney(cn.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {(tab === "invoices" ? invoices : creditNotes).length === 0 && <p className="muted p-4">Nothing yet.</p>}
        <p className="muted p-3 text-[12px]">
          <span className="c-kbd">↑</span> <span className="c-kbd">↓</span> select · <span className="c-kbd">←</span>{" "}
          <span className="c-kbd">→</span> switch list · <span className="c-kbd">Enter</span> open (pay, return, reprint)
        </p>
      </div>
    </Overlay>
  );
}
