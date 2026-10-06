"use client";

import { CURRENCY, formatMoney } from "@/lib/counter/billing";
import type { Bill, BillLine, Customer, Totals } from "@/lib/counter/types";
import { Overlay } from "./overlay";

export function ConfirmDialog({
  bill,
  customer,
  totals,
  shortBy,
  onConfirm,
  onClose,
}: {
  bill: Bill;
  customer: Customer;
  totals: Totals;
  shortBy: (line: BillLine) => number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const short = bill.lines.filter((l) => shortBy(l) > 0);
  const unverified = bill.lines.filter((l) => !l.verified).length;
  const specialOrders = bill.lines.filter((l) => l.specialOrder).length;

  return (
    <Overlay title="Confirm bill" onClose={onClose}>
      <div className="grid gap-3 p-4">
        <dl className="c-dl">
          <dt>Customer</dt>
          <dd>
            {customer.name} {customer.trn && <span className="mono muted">TRN {customer.trn}</span>}
          </dd>
          <dt>Lines</dt>
          <dd className="mono">
            {bill.lines.length} ({bill.lines.reduce((n, l) => n + l.qty, 0)} pcs)
          </dd>
          <dt>Subtotal</dt>
          <dd className="mono">{formatMoney(totals.subtotal)}</dd>
          <dt>Discount</dt>
          <dd className="mono">{formatMoney(totals.discountTotal)}</dd>
          <dt>VAT 5%</dt>
          <dd className="mono">{formatMoney(totals.vat)}</dd>
          <dt className="font-semibold text-[var(--c-text)]">Total {CURRENCY}</dt>
          <dd className="mono text-[18px] font-bold">{formatMoney(totals.total)}</dd>
        </dl>

        {short.length > 0 && (
          <div className="border border-[var(--c-red)] bg-[var(--c-red-soft)] p-2 text-[12px] text-[var(--c-red)]">
            <strong>Stock short:</strong>{" "}
            {short.map((l) => `${l.partNumber} (short ${shortBy(l)})`).join(", ")}. Confirming books them as backorder.
          </div>
        )}
        {(unverified > 0 || specialOrders > 0) && (
          <p className="muted text-[12px]">
            {unverified > 0 && `${unverified} line(s) without verified fitment. `}
            {specialOrders > 0 && `${specialOrders} special-order line(s) will be ordered in.`}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button className="c-btn" onClick={onClose}>
            Back <span className="c-kbd">Esc</span>
          </button>
          <button autoFocus className="c-btn" data-primary="true" onClick={onConfirm}>
            {short.length ? "Confirm anyway" : "Confirm & create invoice"} <span className="c-kbd">Enter</span>{" "}
            <span className="c-kbd">F9</span>
          </button>
        </div>
      </div>
    </Overlay>
  );
}
