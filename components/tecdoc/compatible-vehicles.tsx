"use client";

import type { ReactNode } from "react";
import { Truck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { FitmentGroup } from "@/lib/tecdoc/types";
import { useTecdoc, yearRange } from "./use-tecdoc";

/**
 * Real fitment for a product's primary OE number. Renders `fallback` (the static
 * demo fitment) when TecDoc is off, fails, or knows no vehicles for the OE.
 */
export function CompatibleVehicles({ make, oe, fallback }: { make: string | null; oe: string | undefined; fallback: ReactNode }) {
  const { data, loading } = useTecdoc<FitmentGroup[]>("fitment", make && oe ? { make, oe } : null);

  if (loading) {
    return (
      <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
        <Spinner /> Loading fitment from TecDoc…
      </p>
    );
  }
  if (!data?.length) return <>{fallback}</>;

  const variants = data.reduce((sum, group) => sum + group.variantCount, 0);
  return (
    <>
      <p className="mt-2 text-sm text-slate-500">
        TecDoc lists {variants} truck variants for OE {oe}, across {data.length} model series.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {data.map((group) => (
          <details key={`${group.manufacturer}-${group.model}`} className="rounded-lg bg-slate-50 p-4">
            <summary className="flex cursor-pointer list-none items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[#08bde8]">
                <Truck size={20} />
              </span>
              <span>
                <strong className="block">
                  {group.manufacturer} {group.model}
                </strong>
                <span className="text-sm text-slate-500">
                  {yearRange(group.from, group.to)} · {group.variantCount} variants · TecDoc verified
                </span>
              </span>
            </summary>
            <ul className="mt-3 max-h-64 space-y-1.5 overflow-auto border-t border-slate-200 pt-3 text-sm">
              {group.variants.map((v) => (
                <li key={[v.engine, v.bodyType, v.axle, v.from].join("|")} className="flex justify-between gap-3">
                  <span>
                    {v.engine}
                    {v.bodyType && <span className="text-slate-500"> · {v.bodyType}</span>}
                    {v.axle && <span className="text-slate-500"> · {v.axle}</span>}
                  </span>
                  <span className="shrink-0 text-slate-500">
                    {v.powerPs ? `${v.powerPs} PS · ` : ""}
                    {yearRange(v.from, v.to)}
                  </span>
                </li>
              ))}
              {group.variantCount > group.variants.length && (
                <li className="text-slate-500">+{group.variantCount - group.variants.length} more variants</li>
              )}
            </ul>
          </details>
        ))}
      </div>
    </>
  );
}
