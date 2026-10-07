// Counter dashboard figures. Net sales = invoices − credit notes. Pure.
import type { Product } from "../../data/products";
import { formatMoney } from "./billing.ts";
import { amountDue, invoiceStatus, paidAmount } from "./payments.ts";
import type { CreditNote, Invoice, Money } from "./types";

const dayKey = (iso: string | Date) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export type Summary = { net: Money; vat: Money; invoices: number; average: Money; credited: Money; due: Money };

export function summary(invoices: Invoice[], creditNotes: CreditNote[], from: Date, to: Date): Summary {
  const inRange = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= from.getTime() && t < to.getTime();
  };
  const inv = invoices.filter((i) => inRange(i.issuedAt));
  const cns = creditNotes.filter((c) => inRange(c.issuedAt));
  const gross = inv.reduce((s, i) => s + i.total, 0);
  const credited = cns.reduce((s, c) => s + c.total, 0);
  return {
    net: gross - credited,
    vat: inv.reduce((s, i) => s + i.vat, 0) - cns.reduce((s, c) => s + c.vat, 0),
    invoices: inv.length,
    average: inv.length ? Math.round(gross / inv.length) : 0,
    credited,
    due: inv.reduce((s, i) => s + amountDue(i, creditNotes), 0),
  };
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Net sales per day for the `days` days ending today (oldest first). */
export function dailySeries(invoices: Invoice[], creditNotes: CreditNote[], today: Date, days = 14) {
  const totals = new Map<string, number>();
  for (const i of invoices) totals.set(dayKey(i.issuedAt), (totals.get(dayKey(i.issuedAt)) ?? 0) + i.total);
  for (const c of creditNotes) totals.set(dayKey(c.issuedAt), (totals.get(dayKey(c.issuedAt)) ?? 0) - c.total);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(startOfDay(today), i - days + 1);
    return { date, total: totals.get(dayKey(date)) ?? 0 };
  });
}

/** Best sellers by net quantity (sold − returned). */
export function topParts(invoices: Invoice[], creditNotes: CreditNote[], limit = 5) {
  const parts = new Map<string, { partNumber: string; brand: string; description: string; qty: number; amount: Money }>();
  const add = (lines: Invoice["lines"], sign: 1 | -1) => {
    for (const l of lines) {
      const key = `${l.brand}:${l.partNumber}`;
      const row = parts.get(key) ?? { partNumber: l.partNumber, brand: l.brand, description: l.description, qty: 0, amount: 0 };
      row.qty += sign * l.qty;
      row.amount += sign * l.qty * l.unitPrice;
      parts.set(key, row);
    }
  };
  invoices.forEach((i) => add(i.lines, 1));
  creditNotes.forEach((c) => add(c.lines, -1));
  return [...parts.values()].filter((p) => p.qty > 0).sort((a, b) => b.qty - a.qty || b.amount - a.amount).slice(0, limit);
}

export const lowStock = (products: Product[], threshold = 5) =>
  products.filter((p) => p.commercialData !== false && p.stock <= threshold).sort((a, b) => a.stock - b.stock);

const csvCell = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function invoicesCsv(invoices: Invoice[], creditNotes: CreditNote[]): string {
  const header = ["Invoice", "Date", "Customer", "TRN", "Lines", "Subtotal", "Discount", "VAT", "Total", "Paid", "Due", "Status"];
  const rows = invoices.map((i) => [
    i.number,
    i.issuedAt,
    i.customer.name,
    i.customer.trn ?? "",
    i.lines.length,
    formatMoney(i.subtotal).replace(/,/g, ""),
    formatMoney(i.discountTotal).replace(/,/g, ""),
    formatMoney(i.vat).replace(/,/g, ""),
    formatMoney(i.total).replace(/,/g, ""),
    formatMoney(paidAmount(i)).replace(/,/g, ""),
    formatMoney(amountDue(i, creditNotes)).replace(/,/g, ""),
    invoiceStatus(i, creditNotes),
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}
