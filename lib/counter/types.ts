// Counter (staff catalogue + billing) shapes. Money is integer fils (1 AED = 100).
import type { Product } from "../../data/products";
import type { TecdocArticle } from "../tecdoc/types";

export type Money = number;

export type BillLine = {
  id: string;
  source: "own" | "tecdoc";
  /** Own catalogue item. */
  productId: string | null;
  /** TecDoc article key (`SUPPLIER:ARTICLENO`). */
  tecdocKey: string | null;
  partNumber: string;
  brand: string;
  description: string;
  unitPrice: Money;
  qty: number;
  /** Fitment checked by staff. */
  verified: boolean;
  /** TecDoc lines: priced at the counter, ordered in, no stock deduction. */
  specialOrder: boolean;
};

export type Discount = { kind: "amount"; value: Money } | { kind: "percent"; value: number };

export type Bill = { lines: BillLine[]; customerId: string; discount: Discount | null };

export type Customer = { id: string; name: string; phone: string; trn: string | null };

export type Totals = { subtotal: Money; discountTotal: Money; vat: Money; total: Money };

export type Invoice = Totals & {
  number: string;
  issuedAt: string;
  customer: Customer;
  lines: BillLine[];
  discount: Discount | null;
};

/** qty is negative for stock going out. */
export type StockMovement = { productId: string; qty: number; invoice: string };

export type CounterState = {
  bill: Bill;
  customers: Customer[];
  invoices: Invoice[];
  movements: StockMovement[];
  nextInvoiceSeq: number;
};

/** One row in the results table: an own catalogue item or a TecDoc article. */
export type ResultRow = {
  key: string;
  source: "own" | "tecdoc";
  product: Product | null;
  article: TecdocArticle | null;
  brand: string;
  partNumber: string;
  description: string;
  /** Available stock for own items; null for TecDoc. */
  stock: number | null;
  price: Money | null;
  image: string | null;
};
