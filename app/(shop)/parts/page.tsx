import type { Metadata } from "next";
import { Suspense } from "react";
import { PartsBrowser } from "@/components/shop/parts-browser";

export const metadata: Metadata = { title: "Parts | Desert Route Truck Parts" };

export default function Page() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense fallback={<div className="s-container py-10 text-[var(--s-muted)]">Loading parts…</div>}>
      <PartsBrowser />
    </Suspense>
  );
}
