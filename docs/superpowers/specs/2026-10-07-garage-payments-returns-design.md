# Garage, Quotes, Payments, Returns, Dashboard, Scanner, Motion — Design

Date: 2026-10-07
Status: Approved in conversation

Builds on `2026-10-06-unified-shop-counter-design.md`. Same browser-only store.

## Shop
- **My Garage**: saved vehicles `{ id, make, series, year, nickname, vin? }`,
  one active. Header pill shows the active truck; parts whose fitment matches
  its make + series show "Fits your <nickname>"; `/parts` offers a one-click
  "Only parts for my truck" filter (`?make=&model=`).
- **WhatsApp**: floating button, number in `lib/shop/contact.ts`
  (placeholder `+971500000000`), message pre-filled with the current part.
- **Quick quote**: "Request quote" on TecDoc parts and out-of-stock items
  opens a form (name, mobile, qty, note) → `QR-{year}-{seq:4}` quote request
  stored for the counter. Customer saved/matched by phone like checkout.
- **Polished motion**: route fade, add-to-cart fly animation + badge pop,
  skeletons for TecDoc loads, count-up stats, scroll fade-in, card hover lift.
  All disabled under `prefers-reduced-motion`. Counter has no motion.

## Counter
- **Payments**: confirm dialog takes one or more payments
  (cash / card / bank / credit-on-account). Cash shows change due. Invoice
  status: paid / part-paid / unpaid, where due = total − credited − paid
  (credit-on-account is not paid). Payments can be added later from history.
- **Receipt**: 80 mm thermal receipt print next to the A4 tax invoice.
- **Returns**: from history pick lines + qty (≤ sold − already returned) →
  credit note `CN-{year}-{seq:6}`; amounts at invoice unit price, invoice
  discount applied proportionally, VAT 5% reversed; own-stock lines go back
  into stock.
- **Dashboard** (`F11`): today / this month net sales (invoices − credit
  notes), VAT, invoice count, average bill; 14-day sales bars; top parts;
  low stock (≤ 5); open quote requests; CSV export of invoices.
- **Scanner**: Enter in the search box with an exact part no / SKU / OE match
  adds it to the bill (USB scanners type + Enter). Camera scan uses the
  browser BarcodeDetector where available.

## Testing
Unit: payments/status, change, returns limits and credit totals, stock back,
reports summary and series, CSV, garage fit matching, quotes.
Browser: garage badge + filter, quote → counter, pay split + receipt,
return → credit note + stock, dashboard numbers, scanner add.
