// Shared app state for the shop and the staff counter. Money is integer fils (1 AED = 100).
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

export type Bill = {
  lines: BillLine[];
  customerId: string;
  discount: Discount | null;
  /** Shop order this bill was loaded from. */
  orderId: string | null;
};

export type Customer = { id: string; name: string; phone: string; trn: string | null; email?: string };

export type Totals = { subtotal: Money; discountTotal: Money; vat: Money; total: Money };

export type PaymentMethod = "cash" | "card" | "bank" | "credit";

/** credit = on account (customer owes); not counted as paid. */
export type Payment = { method: PaymentMethod; amount: Money; at: string; tendered?: Money };

export type Invoice = Totals & {
  number: string;
  issuedAt: string;
  customer: Customer;
  lines: BillLine[];
  discount: Discount | null;
  payments: Payment[];
};

/** Returned lines carry the returned qty at the invoice unit price. */
export type CreditNote = Totals & {
  number: string;
  issuedAt: string;
  invoice: string;
  customer: Customer;
  lines: BillLine[];
};

export type Vehicle = { id: string; make: string; series: string; year: string; nickname: string; vin?: string };

export type QuotePart = {
  brand: string;
  partNumber: string;
  description: string;
  productId: string | null;
  tecdocKey: string | null;
};

export type QuoteRequest = {
  number: string;
  createdAt: string;
  customerId: string;
  part: QuotePart;
  qty: number;
  note: string;
  status: "open" | "done";
};

/** qty is negative for stock going out. `invoice` is the invoice or credit note number. */
export type StockMovement = { productId: string; qty: number; invoice: string };

/** Shop order: own catalogue items only, priced at checkout. */
export type OrderLine = { productId: string; qty: number; unitPrice: Money };

export type Order = {
  number: string;
  createdAt: string;
  customerId: string;
  lines: OrderLine[];
  fulfilment: "pickup" | "delivery";
  note: string;
  status: "new" | "billed" | "cancelled";
  invoice: string | null;
};

/** Admin edits. Live stock = (stockBase ?? seed stock) + movements. Price in AED. */
export type ProductOverride = { price?: number; stockBase?: number };

export type Market = "UAE" | "Qatar" | "Saudi" | "USD";

export type Prefs = { market: Market; locale: "en" | "ar" };

export type AppState = {
  bill: Bill;
  customers: Customer[];
  invoices: Invoice[];
  movements: StockMovement[];
  nextInvoiceSeq: number;
  orders: Order[];
  nextOrderSeq: number;
  overrides: Record<string, ProductOverride>;
  /** Shop cart: productId → qty. */
  cart: Record<string, number>;
  prefs: Prefs;
  creditNotes: CreditNote[];
  nextCreditSeq: number;
  garage: Vehicle[];
  activeVehicleId: string | null;
  quotes: QuoteRequest[];
  nextQuoteSeq: number;
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
