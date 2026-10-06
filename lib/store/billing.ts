// Pure money maths for the counter. All amounts are integer fils (1 AED = 100 fils).
import type { Product } from "../../data/products";
import type { BillLine, Discount, Money, StockMovement, Totals } from "./types";

export const VAT_RATE = 0.05;
export const CURRENCY = "AED";

export const toFils = (aed: number): Money => Math.round(aed * 100);

/** "1,284.50" — no currency symbol; callers label the column. */
export const formatMoney = (fils: Money) =>
  (fils / 100).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const lineAmount = (line: Pick<BillLine, "unitPrice" | "qty">): Money => line.unitPrice * line.qty;

export function discountAmount(subtotal: Money, discount: Discount | null): Money {
  if (!discount || subtotal <= 0) return 0;
  if (discount.kind === "amount") return Math.min(Math.max(discount.value, 0), subtotal);
  const percent = Math.min(Math.max(discount.value, 0), 100);
  return Math.round((subtotal * percent) / 100);
}

/** Prices are VAT-exclusive; VAT applies after discount, rounded half-up to the fil. */
export function billTotals(lines: Pick<BillLine, "unitPrice" | "qty">[], discount: Discount | null): Totals {
  const subtotal = lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const discountTotal = discountAmount(subtotal, discount);
  const vat = Math.round((subtotal - discountTotal) * VAT_RATE);
  return { subtotal, discountTotal, vat, total: subtotal - discountTotal + vat };
}

export const invoiceNumber = (year: number, seq: number) => `INV-${year}-${String(seq).padStart(6, "0")}`;

/** Parses a counter-typed price ("45", "45.5", "1,250.00"). Null when not a positive amount. */
export function parsePrice(input: string): Money | null {
  const cleaned = input.replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const fils = toFils(Number(cleaned));
  return fils > 0 ? fils : null;
}

/** "10%" → percent, "25.50" → amount, "" → no discount. Returns an error string when invalid. */
export function parseDiscount(input: string, subtotal: Money): Discount | null | { error: string } {
  const value = input.trim();
  if (!value || value === "0") return null;
  if (value.endsWith("%")) {
    const percent = Number(value.slice(0, -1).trim());
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) return { error: "Percent must be between 0 and 100" };
    return { kind: "percent", value: percent };
  }
  const amount = parsePrice(value);
  if (amount === null) return { error: "Enter an amount like 25.50 or a percent like 10%" };
  if (amount > subtotal) return { error: "Discount is larger than the subtotal" };
  return { kind: "amount", value: amount };
}

export const describeDiscount = (discount: Discount | null) =>
  !discount ? "" : discount.kind === "percent" ? `${discount.value}%` : formatMoney(discount.value);

/** Catalogue stock plus all recorded movements (sales are negative). */
export function availableStock(product: Pick<Product, "id" | "stock">, movements: StockMovement[]): number {
  return movements.reduce((sum, m) => (m.productId === product.id ? sum + m.qty : sum), product.stock);
}
