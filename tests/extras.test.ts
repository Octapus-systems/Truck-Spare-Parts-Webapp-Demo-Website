// Run: npm test — payments, returns, garage, quotes, reports.
import assert from "node:assert/strict";
import { test } from "node:test";
import { seedProducts } from "../data/products.ts";
import { liveProducts } from "../lib/store/catalog.ts";
import { activeVehicle, fitsVehicle, removeVehicle, saveVehicle, setActiveVehicle } from "../lib/store/garage.ts";
import { amountDue, changeDue, invoiceStatus, paidAmount, recordPayment } from "../lib/store/payments.ts";
import { closeQuote, requestQuote } from "../lib/store/quotes.ts";
import { addLine, confirmBill, hydrate, initialState, setDiscount } from "../lib/store/reducer.ts";
import { dailySeries, invoicesCsv, lowStock, summary, topParts } from "../lib/store/reports.ts";
import { creditTotals, issueCreditNote, returnedQty } from "../lib/store/returns.ts";
import type { AppState, BillLine } from "../lib/store/types.ts";

const NOW = new Date("2026-10-07T09:00:00");
const p1 = seedProducts.find((p) => p.id === "p1")!;

const ownLine = (productId: string, unitPrice: number, qty: number): Omit<BillLine, "id"> => ({
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

/** One invoice: p1 × 4 at 100.00 and p2 × 1 at 50.00, 10% discount → subtotal 450, discount 45, VAT 20.25, total 425.25. */
function invoiced(payments = [] as Parameters<typeof confirmBill>[2]): AppState {
  let s = addLine(initialState(), ownLine("p1", 10000, 4));
  s = addLine(s, ownLine("p2", 5000, 1));
  s = setDiscount(s, { kind: "percent", value: 10 });
  return confirmBill(s, NOW, payments).state;
}

test("payment status: unpaid, part-paid, paid; credit-on-account is not paid", () => {
  let s = invoiced([{ method: "credit", amount: 42525, at: NOW.toISOString() }]);
  let inv = s.invoices[0];
  assert.equal(inv.total, 42525);
  assert.equal(paidAmount(inv), 0);
  assert.equal(invoiceStatus(inv, []), "unpaid");

  s = recordPayment(s, inv.number, { method: "cash", amount: 20000, at: NOW.toISOString() });
  inv = s.invoices[0];
  assert.equal(invoiceStatus(inv, []), "part-paid");
  assert.equal(amountDue(inv, []), 22525);

  s = recordPayment(s, inv.number, { method: "card", amount: 22525, at: NOW.toISOString() });
  assert.equal(invoiceStatus(s.invoices[0], []), "paid");
  assert.equal(recordPayment(s, inv.number, { method: "cash", amount: 0, at: "" }), s);
  assert.equal(changeDue(50000, 42525), 7475);
  assert.equal(changeDue(100, 500), 0);
});

test("credit note: proportional discount, VAT reversed, stock back, limits", () => {
  let s = invoiced([{ method: "cash", amount: 42525, at: NOW.toISOString() }]);
  const inv = s.invoices[0];
  const line1 = inv.lines.find((l) => l.productId === "p1")!;
  const stockAfterSale = liveProducts(seedProducts, s).find((p) => p.id === "p1")!.stock;
  assert.equal(stockAfterSale, p1.stock - 4);

  const first = issueCreditNote(s, inv.number, [{ lineId: line1.id, qty: 1 }], NOW);
  s = first.state;
  assert.equal(first.creditNote?.number, "CN-2026-000001");
  assert.deepEqual(
    { sub: first.creditNote!.subtotal, disc: first.creditNote!.discountTotal, vat: first.creditNote!.vat, total: first.creditNote!.total },
    { sub: 10000, disc: 1000, vat: 450, total: 9450 },
  );
  assert.equal(liveProducts(seedProducts, s).find((p) => p.id === "p1")!.stock, stockAfterSale + 1);
  assert.equal(returnedQty(inv.number, line1.id, s.creditNotes), 1);

  // Asking for more than is left is clamped to the 3 remaining.
  const second = issueCreditNote(s, inv.number, [{ lineId: line1.id, qty: 10 }], NOW);
  assert.equal(second.creditNote?.lines[0].qty, 3);
  s = second.state;
  assert.equal(issueCreditNote(s, inv.number, [{ lineId: line1.id, qty: 1 }], NOW).creditNote, null);

  // Returning everything credits the full invoice.
  const all = creditTotals(inv, inv.lines);
  assert.equal(all.total, inv.total);
});

test("fully returned invoice shows as returned and nothing due", () => {
  let s = invoiced();
  const inv = s.invoices[0];
  s = issueCreditNote(s, inv.number, inv.lines.map((l) => ({ lineId: l.id, qty: l.qty })), NOW).state;
  assert.equal(invoiceStatus(s.invoices[0], s.creditNotes), "returned");
  assert.equal(amountDue(s.invoices[0], s.creditNotes), 0);
});

test("garage: save makes active, remove picks next, fit matching", () => {
  let s = saveVehicle(initialState(), { make: "Mercedes-Benz", series: "Actros", year: "2018", nickname: " " });
  const first = s.activeVehicleId!;
  assert.equal(activeVehicle(s)?.nickname, "Mercedes-Benz Actros");
  s = saveVehicle(s, { make: "MAN", series: "TGX", year: "2020", nickname: "Fleet #12" });
  assert.equal(activeVehicle(s)?.nickname, "Fleet #12");
  s = setActiveVehicle(s, first);
  assert.equal(activeVehicle(s)?.make, "Mercedes-Benz");
  s = removeVehicle(s, first);
  assert.equal(activeVehicle(s)?.make, "MAN");
  assert.equal(setActiveVehicle(s, "missing").activeVehicleId, null);

  assert.ok(fitsVehicle(p1, { make: "Mercedes-Benz", series: "Actros" }));
  assert.ok(!fitsVehicle(p1, { make: "Mercedes-Benz", series: "Atego" }));
  assert.ok(fitsVehicle(p1, { make: "Mercedes-Benz", series: "" }));
  assert.ok(!fitsVehicle(p1, { make: "Volvo", series: "" }));
});

test("quote requests save the customer and close", () => {
  const part = { brand: "ASUKI", partNumber: "FO-YC6001", description: "Oil Filter", productId: null, tecdocKey: "ASUKI:FOYC6001" };
  const { state, quote } = requestQuote(
    initialState(),
    { customer: { name: "Fleet Co", phone: "0501234567", trn: null }, part, qty: 0, note: " urgent " },
    NOW,
  );
  assert.equal(quote.number, "QR-2026-0001");
  assert.equal(quote.qty, 1);
  assert.equal(quote.note, "urgent");
  assert.equal(state.customers.length, 2);
  assert.equal(closeQuote(state, quote.number).quotes[0].status, "done");
});

test("reports: net of credit notes, daily series, top parts, low stock, CSV", () => {
  let s = invoiced([{ method: "cash", amount: 42525, at: NOW.toISOString() }]);
  const inv = s.invoices[0];
  const line1 = inv.lines.find((l) => l.productId === "p1")!;
  s = issueCreditNote(s, inv.number, [{ lineId: line1.id, qty: 1 }], NOW).state;

  const day = summary(s.invoices, s.creditNotes, new Date("2026-10-07T00:00:00"), new Date("2026-10-08T00:00:00"));
  assert.equal(day.net, 42525 - 9450);
  assert.equal(day.invoices, 1);
  assert.equal(day.vat, 2025 - 450);
  assert.equal(summary(s.invoices, s.creditNotes, new Date("2026-10-08"), new Date("2026-10-09")).invoices, 0);

  const series = dailySeries(s.invoices, s.creditNotes, NOW, 14);
  assert.equal(series.length, 14);
  assert.equal(series[13].total, 42525 - 9450);
  assert.equal(series[0].total, 0);

  assert.deepEqual(topParts(s.invoices, s.creditNotes).map((p) => [p.partNumber, p.qty]), [["p1", 3], ["p2", 1]]);
  assert.ok(lowStock(seedProducts, 5).every((p) => p.stock <= 5));

  const csv = invoicesCsv(s.invoices, s.creditNotes).split("\n");
  assert.equal(csv[0].split(",")[0], "Invoice");
  assert.match(csv[1], /^INV-2026-000001,.*,425\.25,425\.25,0\.00,paid$/);
});

test("hydrate adds new fields and payments to old invoices", () => {
  const s = hydrate({ invoices: [{ number: "INV-1", lines: [] }] });
  assert.deepEqual(s.invoices[0].payments, []);
  assert.deepEqual(s.garage, []);
  assert.equal(s.nextCreditSeq, 1);
  assert.equal(s.nextQuoteSeq, 1);
});
