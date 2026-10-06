"use client";

import { useState, type KeyboardEvent } from "react";
import { CURRENCY, formatMoney } from "@/lib/counter/billing";
import type { Invoice } from "@/lib/counter/types";
import { Overlay } from "./overlay";

export function InvoiceHistory({
  invoices,
  onOpen,
  onClose,
}: {
  invoices: Invoice[];
  onOpen: (invoice: Invoice) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") setIndex((i) => Math.min(i + 1, invoices.length - 1));
    else if (event.key === "ArrowUp") setIndex((i) => Math.max(i - 1, 0));
    else if (event.key === "Enter" && invoices[index]) onOpen(invoices[index]);
    else return;
    event.preventDefault();
  };

  return (
    <Overlay title={`Invoices · ${invoices.length}`} onClose={onClose} wide>
      <div tabIndex={0} autoFocus onKeyDown={onKey} className="outline-none" ref={(el) => el?.focus()}>
        <table className="c-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Date</th>
              <th className="w-full">Customer</th>
              <th className="text-right">Lines</th>
              <th className="text-right">Total {CURRENCY}</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={inv.number} aria-selected={i === index} onClick={() => setIndex(i)} onDoubleClick={() => onOpen(inv)}>
                <td className="mono">{inv.number}</td>
                <td className="mono">{new Date(inv.issuedAt).toLocaleString("en-AE", { dateStyle: "short", timeStyle: "short" })}</td>
                <td className="ellipsis">{inv.customer.name}</td>
                <td className="num">{inv.lines.length}</td>
                <td className="num">{formatMoney(inv.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!invoices.length && <p className="muted p-4">No invoices yet.</p>}
        <p className="muted p-3 text-[12px]">
          <span className="c-kbd">↑</span> <span className="c-kbd">↓</span> select · <span className="c-kbd">Enter</span>{" "}
          open / reprint
        </p>
      </div>
    </Overlay>
  );
}
