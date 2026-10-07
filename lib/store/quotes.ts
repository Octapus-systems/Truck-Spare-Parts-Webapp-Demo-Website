// Quote requests from the shop for parts we don't stock (or are out of). Pure.
import { upsertCustomer } from "./reducer.ts";
import type { AppState, Customer, QuotePart, QuoteRequest } from "./types";

export const quoteNumber = (year: number, seq: number) => `QR-${year}-${String(seq).padStart(4, "0")}`;

export function requestQuote(
  state: AppState,
  input: { customer: Omit<Customer, "id">; part: QuotePart; qty: number; note: string },
  now: Date,
): { state: AppState; quote: QuoteRequest } {
  const { state: withCustomer, id: customerId } = upsertCustomer(state, input.customer);
  const quote: QuoteRequest = {
    number: quoteNumber(now.getFullYear(), state.nextQuoteSeq),
    createdAt: now.toISOString(),
    customerId,
    part: input.part,
    qty: Math.max(1, Math.floor(input.qty) || 1),
    note: input.note.trim(),
    status: "open",
  };
  return { quote, state: { ...withCustomer, quotes: [quote, ...state.quotes], nextQuoteSeq: state.nextQuoteSeq + 1 } };
}

export const closeQuote = (state: AppState, number: string): AppState => ({
  ...state,
  quotes: state.quotes.map((q) => (q.number === number ? { ...q, status: "done" } : q)),
});
