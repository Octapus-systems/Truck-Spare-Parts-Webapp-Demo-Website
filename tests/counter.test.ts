// Run: npm test  (Node's built-in runner with native TypeScript stripping)
import assert from "node:assert/strict";
import { test } from "node:test";
import { seedProducts } from "../data/products.ts";
import {
  availableStock,
  billTotals,
  discountAmount,
  formatMoney,
  invoiceNumber,
  parseDiscount,
  parsePrice,
} from "../lib/store/billing.ts";
import {
  WALK_IN,
  addLine,
  changeQty,
  confirmBill,
  customerOf,
  hydrate,
  initialState,
  removeLine,
  saveCustomer,
  setDiscount,
  toggleVerified,
} from "../lib/store/reducer.ts";
import { buildRows, searchOwn } from "../lib/store/search.ts";
import type { BillLine } from "../lib/store/types.ts";
import type { TecdocArticle } from "../lib/tecdoc/types.ts";

const ownLine = (productId: string, unitPrice: number, qty = 1): Omit<BillLine, "id"> => ({
  source: "own",
  productId,
  tecdocKey: null,
  partNumber: productId,
  brand: "Brand",
  description: "Part",
  unitPrice,
  qty,
  verified: false,
  specialOrder: false,
});

const tdLine = (tecdocKey: string, unitPrice: number): Omit<BillLine, "id"> => ({
  ...ownLine("", unitPrice),
  source: "tecdoc",
  productId: null,
  tecdocKey,
  specialOrder: true,
});

const article = (supplierName: string, articleNo: string): TecdocArticle => ({
  key: `${supplierName}:${articleNo}`,
  articleId: 1,
  articleNo,
  supplierName,
  productName: "Oil Filter",
  image: null,
  oeMatch: null,
});

test("totals: VAT 5% after discount, rounded half-up to the fil", () => {
  const lines = [{ unitPrice: 39000, qty: 2 }, { unitPrice: 4550, qty: 1 }];
  assert.deepEqual(billTotals(lines, null), { subtotal: 82550, discountTotal: 0, vat: 4128, total: 86678 });
  const discounted = billTotals(lines, { kind: "percent", value: 10 });
  assert.equal(discounted.discountTotal, 8255);
  assert.equal(discounted.vat, 3715); // 5% of 74295 = 3714.75
  assert.equal(discounted.total, 82550 - 8255 + 3715);
  assert.deepEqual(billTotals([], null), { subtotal: 0, discountTotal: 0, vat: 0, total: 0 });
});

test("discounts are capped", () => {
  assert.equal(discountAmount(1000, { kind: "amount", value: 5000 }), 1000);
  assert.equal(discountAmount(1000, { kind: "percent", value: 150 }), 1000);
  assert.equal(discountAmount(1000, null), 0);
});

test("price and discount parsing", () => {
  assert.equal(parsePrice("45"), 4500);
  assert.equal(parsePrice("1,250.5"), 125050);
  assert.equal(parsePrice("0"), null);
  assert.equal(parsePrice("-3"), null);
  assert.equal(parsePrice("abc"), null);
  assert.equal(parsePrice("1.234"), null);

  assert.deepEqual(parseDiscount("10%", 10000), { kind: "percent", value: 10 });
  assert.deepEqual(parseDiscount("25.50", 10000), { kind: "amount", value: 2550 });
  assert.equal(parseDiscount("", 10000), null);
  assert.ok("error" in (parseDiscount("120%", 10000) as object));
  assert.ok("error" in (parseDiscount("200", 10000) as object));
});

test("formatting and invoice numbers", () => {
  assert.equal(formatMoney(128450), "1,284.50");
  assert.equal(invoiceNumber(2026, 7), "INV-2026-000007");
});

test("addLine merges same own product and same TecDoc article at same price", () => {
  let s = addLine(initialState(), ownLine("p1", 48500));
  s = addLine(s, ownLine("p1", 48500, 2));
  assert.equal(s.bill.lines.length, 1);
  assert.equal(s.bill.lines[0].qty, 3);

  s = addLine(s, tdLine("ASUKI:FOYC6001", 4500));
  s = addLine(s, tdLine("ASUKI:FOYC6001", 4500));
  s = addLine(s, tdLine("ASUKI:FOYC6001", 5000));
  assert.equal(s.bill.lines.length, 3);
  assert.equal(s.bill.lines[1].qty, 2);
});

test("qty, verify and remove", () => {
  let s = addLine(initialState(), ownLine("p1", 100));
  const id = s.bill.lines[0].id;
  s = changeQty(s, id, -5);
  assert.equal(s.bill.lines[0].qty, 1);
  s = changeQty(s, id, 2);
  assert.equal(s.bill.lines[0].qty, 3);
  s = toggleVerified(s, id);
  assert.equal(s.bill.lines[0].verified, true);
  s = removeLine(s, id);
  assert.equal(s.bill.lines.length, 0);
});

test("confirm creates invoice, records own stock movements, clears bill", () => {
  let s = addLine(initialState(), ownLine("p1", 48500, 2));
  s = addLine(s, tdLine("ASUKI:FOYC6001", 4500));
  s = saveCustomer(s, { name: "Al Futtaim Fleet", phone: "0501234567", trn: "100123456700003" });
  s = setDiscount(s, { kind: "amount", value: 1000 });

  const { state, invoice } = confirmBill(s, new Date("2026-10-06T10:00:00Z"));
  assert.equal(invoice?.number, "INV-2026-000001");
  assert.equal(invoice?.customer.name, "Al Futtaim Fleet");
  assert.equal(invoice?.subtotal, 101500);
  assert.equal(invoice?.total, 101500 - 1000 + 5025);
  assert.deepEqual(state.movements, [{ productId: "p1", qty: -2, invoice: "INV-2026-000001" }]);
  assert.equal(state.bill.lines.length, 0);
  assert.equal(state.bill.customerId, WALK_IN.id);
  assert.equal(state.nextInvoiceSeq, 2);

  const product = seedProducts.find((p) => p.id === "p1")!;
  assert.equal(availableStock(product, state.movements), product.stock - 2);

  assert.equal(confirmBill(state, new Date()).invoice, null);
});

test("saveCustomer updates existing and sets bill customer", () => {
  let s = saveCustomer(initialState(), { name: "A", phone: "1", trn: null });
  const id = s.bill.customerId;
  s = saveCustomer(s, { id, name: "A2", phone: "1", trn: null });
  assert.equal(s.customers.length, 2);
  assert.equal(customerOf(s).name, "A2");
});

test("hydrate tolerates junk and keeps walk-in", () => {
  assert.deepEqual(hydrate("nope"), initialState());
  const h = hydrate({ customers: [{ id: "x", name: "X", phone: "", trn: null }], nextInvoiceSeq: -1 });
  assert.equal(h.customers[0].id, WALK_IN.id);
  assert.equal(h.nextInvoiceSeq, 1);
});

test("search: own first, TecDoc duplicates of own items folded in", () => {
  const p2 = seedProducts.find((p) => p.partNumber === "14.9398.10")!;
  const rows = buildRows("zzz-no-own-match", seedProducts, [article("BREMBO", "14 9398 10"), article("ASUKI", "FO-YC6001")], (p) => p.stock);
  assert.deepEqual(rows.map((r) => r.source), ["own", "tecdoc"]);
  assert.equal(rows[0].product?.id, p2.id);
  assert.equal(rows[0].price, p2.price * 100);
  assert.equal(rows[1].partNumber, "FO-YC6001");
  assert.equal(rows[1].stock, null);

  assert.ok(searchOwn("9424212112", seedProducts).length >= 2);
  assert.equal(searchOwn("", seedProducts).length, seedProducts.length);
});
