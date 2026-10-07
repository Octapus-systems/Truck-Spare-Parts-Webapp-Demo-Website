"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/store/billing";
import { creditTotals, returnedQty, type ReturnRequest } from "@/lib/store/returns";
import type { CreditNote, Invoice } from "@/lib/store/types";
import { Overlay } from "./overlay";

/** Pick lines and quantities to return; previews the credit note totals. */
export function ReturnDialog({
  invoice,
  creditNotes,
  onIssue,
  onClose,
}: {
  invoice: Invoice;
  creditNotes: CreditNote[];
  onIssue: (request: ReturnRequest) => void;
  onClose: () => void;
}) {
  const left = (lineId: string, qty: number) => qty - returnedQty(invoice.number, lineId, creditNotes);
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const request: ReturnRequest = Object.entries(qtys)
    .filter(([, qty]) => qty > 0)
    .map(([lineId, qty]) => ({ lineId, qty }));
  const preview = creditTotals(
    invoice,
    request.map(({ lineId, qty }) => ({ unitPrice: invoice.lines.find((l) => l.id === lineId)!.unitPrice, qty })),
  );

  const set = (lineId: string, value: number, max: number) =>
    setQtys((q) => ({ ...q, [lineId]: Math.min(Math.max(0, Math.floor(value) || 0), max) }));

  return (
    <Overlay title={`Return items · ${invoice.number}`} onClose={onClose} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (request.length) onIssue(request);
        }}
      >
        <table className="c-table">
          <thead>
            <tr>
              <th className="w-full">Part</th>
              <th className="text-right">Sold</th>
              <th className="text-right">Returned</th>
              <th className="text-right">Return now</th>
              <th className="text-right">Unit</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, i) => {
              const max = left(line.id, line.qty);
              return (
                <tr key={line.id}>
                  <td className="ellipsis">
                    <span className="mono font-semibold">{line.partNumber}</span> <span className="muted">{line.brand}</span> · {line.description}
                  </td>
                  <td className="num">{line.qty}</td>
                  <td className="num">{line.qty - max}</td>
                  <td className="num">
                    <input
                      autoFocus={i === 0}
                      aria-label={`Return quantity for ${line.partNumber}`}
                      className="c-input mono !h-7 !w-16 text-right"
                      type="number"
                      min={0}
                      max={max}
                      disabled={max === 0}
                      value={qtys[line.id] ?? 0}
                      onChange={(e) => set(line.id, Number(e.target.value), max)}
                    />
                  </td>
                  <td className="num">{formatMoney(line.unitPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex flex-wrap items-end justify-between gap-4 p-4">
          <button
            type="button"
            className="c-btn"
            onClick={() => setQtys(Object.fromEntries(invoice.lines.map((l) => [l.id, left(l.id, l.qty)])))}
          >
            Return everything left
          </button>
          <dl className="mono grid grid-cols-[auto_auto] gap-x-6 text-right">
            <dt className="muted">Subtotal</dt>
            <dd>{formatMoney(preview.subtotal)}</dd>
            {preview.discountTotal > 0 && (
              <>
                <dt className="muted">Discount share</dt>
                <dd>−{formatMoney(preview.discountTotal)}</dd>
              </>
            )}
            <dt className="muted">VAT 5%</dt>
            <dd>{formatMoney(preview.vat)}</dd>
            <dt className="font-bold">Credit AED</dt>
            <dd className="font-bold">{formatMoney(preview.total)}</dd>
          </dl>
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--c-line)] p-3">
          <button type="button" className="c-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="c-btn" data-primary="true" disabled={!request.length}>
            Issue credit note <span className="c-kbd">Enter</span>
          </button>
        </div>
      </form>
    </Overlay>
  );
}
