// Invoice payments: what's paid, what's still due. Pure.
import type { AppState, CreditNote, Invoice, Money, Payment, PaymentMethod } from "./types";

export const PAYMENT_METHODS: { method: PaymentMethod; label: string }[] = [
  { method: "cash", label: "Cash" },
  { method: "card", label: "Card" },
  { method: "bank", label: "Bank transfer" },
  { method: "credit", label: "On account" },
];

export const methodLabel = (method: PaymentMethod) => PAYMENT_METHODS.find((m) => m.method === method)?.label ?? method;

/** Credit-on-account is a promise to pay, not money received. */
export const paidAmount = (invoice: Pick<Invoice, "payments">): Money =>
  invoice.payments.reduce((sum, p) => (p.method === "credit" ? sum : sum + p.amount), 0);

export const creditedAmount = (invoiceNo: string, creditNotes: CreditNote[]): Money =>
  creditNotes.reduce((sum, cn) => (cn.invoice === invoiceNo ? sum + cn.total : sum), 0);

/** Never negative: an over-refund or overpayment shows as zero due. */
export const amountDue = (invoice: Invoice, creditNotes: CreditNote[]): Money =>
  Math.max(0, invoice.total - creditedAmount(invoice.number, creditNotes) - paidAmount(invoice));

export type InvoiceStatus = "paid" | "part-paid" | "unpaid" | "returned";

export function invoiceStatus(invoice: Invoice, creditNotes: CreditNote[]): InvoiceStatus {
  const credited = creditedAmount(invoice.number, creditNotes);
  if (credited >= invoice.total) return "returned";
  const due = amountDue(invoice, creditNotes);
  if (due === 0) return "paid";
  return paidAmount(invoice) > 0 ? "part-paid" : "unpaid";
}

/** Cash given minus the cash portion owed. */
export const changeDue = (tendered: Money, cashOwed: Money): Money => Math.max(0, tendered - cashOwed);

export function recordPayment(state: AppState, invoiceNo: string, payment: Payment): AppState {
  if (payment.amount <= 0) return state;
  return {
    ...state,
    invoices: state.invoices.map((inv) =>
      inv.number === invoiceNo ? { ...inv, payments: [...inv.payments, payment] } : inv,
    ),
  };
}
