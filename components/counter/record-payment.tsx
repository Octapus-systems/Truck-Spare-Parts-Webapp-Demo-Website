"use client";

import { formatMoney } from "@/lib/store/billing";
import type { Invoice, Money, Payment } from "@/lib/store/types";
import { Overlay } from "./overlay";
import { usePaymentEntry } from "./payment-entry";

/** Later payment against an unpaid or part-paid invoice. */
export function RecordPayment({
  invoice,
  due,
  onSave,
  onClose,
}: {
  invoice: Invoice;
  due: Money;
  onSave: (payments: Payment[]) => void;
  onClose: () => void;
}) {
  const payment = usePaymentEntry(due);
  return (
    <Overlay title={`Record payment · ${invoice.number}`} onClose={onClose}>
      <form
        className="grid gap-3 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!payment.error && payment.payments.length) onSave(payment.payments);
        }}
      >
        <p>
          {invoice.customer.name} · total <span className="mono">{formatMoney(invoice.total)}</span> · due{" "}
          <span className="mono font-semibold">{formatMoney(due)}</span>
        </p>
        {payment.form}
        <div className="flex justify-end gap-2">
          <button type="button" className="c-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" autoFocus className="c-btn" data-primary="true" disabled={!!payment.error || !payment.payments.length}>
            Save payment <span className="c-kbd">Enter</span>
          </button>
        </div>
      </form>
    </Overlay>
  );
}
