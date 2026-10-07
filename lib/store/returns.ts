// Returns: credit notes against invoices, stock back in. Pure.
import { lineAmount, VAT_RATE } from "./billing.ts";
import type { AppState, BillLine, CreditNote, Invoice, Totals } from "./types";

export const creditNoteNumber = (year: number, seq: number) => `CN-${year}-${String(seq).padStart(6, "0")}`;

/** Qty of an invoice line already returned on earlier credit notes. */
export const returnedQty = (invoiceNo: string, lineId: string, creditNotes: CreditNote[]) =>
  creditNotes
    .filter((cn) => cn.invoice === invoiceNo)
    .reduce((sum, cn) => sum + (cn.lines.find((l) => l.id === lineId)?.qty ?? 0), 0);

/**
 * Credit for returned lines at invoice prices. The invoice discount is spread
 * proportionally, so returning everything credits exactly the invoice total.
 */
export function creditTotals(invoice: Invoice, lines: Pick<BillLine, "unitPrice" | "qty">[]): Totals {
  const subtotal = lines.reduce((sum, l) => sum + lineAmount(l), 0);
  const discountTotal = invoice.subtotal ? Math.round((subtotal * invoice.discountTotal) / invoice.subtotal) : 0;
  const vat = Math.round((subtotal - discountTotal) * VAT_RATE);
  return { subtotal, discountTotal, vat, total: subtotal - discountTotal + vat };
}

export type ReturnRequest = { lineId: string; qty: number }[];

/** Issues a credit note. Quantities are clamped to what is still returnable; nothing to return → no note. */
export function issueCreditNote(
  state: AppState,
  invoiceNo: string,
  request: ReturnRequest,
  now: Date,
): { state: AppState; creditNote: CreditNote | null } {
  const invoice = state.invoices.find((inv) => inv.number === invoiceNo);
  if (!invoice) return { state, creditNote: null };

  const lines: BillLine[] = [];
  for (const { lineId, qty } of request) {
    const line = invoice.lines.find((l) => l.id === lineId);
    if (!line) continue;
    const left = line.qty - returnedQty(invoiceNo, lineId, state.creditNotes);
    const take = Math.min(Math.max(0, Math.floor(qty)), left);
    if (take > 0) lines.push({ ...line, qty: take });
  }
  if (!lines.length) return { state, creditNote: null };

  const number = creditNoteNumber(now.getFullYear(), state.nextCreditSeq);
  const creditNote: CreditNote = {
    number,
    issuedAt: now.toISOString(),
    invoice: invoiceNo,
    customer: invoice.customer,
    lines,
    ...creditTotals(invoice, lines),
  };
  const movements = lines
    .filter((l) => l.source === "own" && l.productId)
    .map((l) => ({ productId: l.productId!, qty: l.qty, invoice: number }));

  return {
    creditNote,
    state: {
      ...state,
      creditNotes: [creditNote, ...state.creditNotes],
      nextCreditSeq: state.nextCreditSeq + 1,
      movements: [...state.movements, ...movements],
    },
  };
}
