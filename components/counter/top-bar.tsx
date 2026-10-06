"use client";

import Link from "next/link";
import { useState, type RefObject } from "react";
import { CURRENCY, formatMoney } from "@/lib/store/billing";
import type { Money } from "@/lib/store/types";

export function TopBar({
  searchRef,
  query,
  onQuery,
  customerName,
  lineCount,
  total,
  newOrders,
  onCustomer,
  onBill,
  onOrders,
  onReset,
}: {
  searchRef: RefObject<HTMLInputElement | null>;
  query: string;
  onQuery: (value: string) => void;
  customerName: string;
  lineCount: number;
  total: Money;
  newOrders: number;
  onCustomer: () => void;
  onBill: () => void;
  onOrders: () => void;
  onReset: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <header className="no-print flex h-11 shrink-0 items-stretch border-b border-[var(--c-text)] bg-[var(--c-bar)] text-white">
      <div className="flex items-center px-3 text-[12px] font-bold tracking-[.14em]">PARTS CATALOGUE</div>
      <label className="flex min-w-0 flex-1 items-center gap-2 border-x border-white/15 bg-white px-2 text-[var(--c-text)]">
        <span className="c-kbd text-[var(--c-muted)]">/</span>
        <input
          ref={searchRef}
          data-counter-search
          autoFocus
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Type part number / OE number / vehicle / description…"
          aria-label="Search parts"
          className="mono h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none"
          spellCheck={false}
          autoComplete="off"
        />
        {query && (
          <button className="muted text-[11px]" onClick={() => onQuery("")}>
            Clear
          </button>
        )}
      </label>
      <TopItem label="Orders" kbd="F6" onClick={onOrders}>
        <span className="mono">
          {newOrders > 0 ? <span className="bg-[var(--c-accent)] px-1.5 font-semibold">{newOrders} new</span> : "0 new"}
        </span>
      </TopItem>
      <TopItem label="Customer" kbd="F4" onClick={onCustomer}>
        <span className="block max-w-[160px] truncate">{customerName}</span>
      </TopItem>
      <TopItem label="Bill" kbd="F8" onClick={onBill}>
        <span className="mono">{lineCount} lines</span>
      </TopItem>
      <TopItem label={`Total ${CURRENCY}`} kbd="F9" onClick={onBill}>
        <span className="mono font-semibold">{formatMoney(total)}</span>
      </TopItem>
      <Link href="/" className="hidden items-center border-l border-white/15 px-3 text-[12px] hover:bg-white/10 md:flex">
        Shop ↗
      </Link>
      <div className="hidden items-center border-l border-white/15 px-3 text-[12px] md:flex">
        <span className="muted mr-1.5 text-[10px] uppercase tracking-[.08em] text-white/55">User</span> Counter 1
      </div>
      <div className="relative flex border-l border-white/15">
        <button className="px-3 text-[12px]" aria-expanded={settingsOpen} onClick={() => setSettingsOpen((v) => !v)}>
          Settings
        </button>
        {settingsOpen && (
          <div className="absolute right-0 top-full z-40 grid w-56 border border-[var(--c-text)] bg-white text-[12px] text-[var(--c-text)] shadow-lg">
            <Link href="/" className="px-3 py-2 hover:bg-[#f4f4f1]">
              Open customer shop
            </Link>
            <button
              className="px-3 py-2 text-left hover:bg-[#f4f4f1]"
              onClick={() => {
                if (!confirmReset) return setConfirmReset(true);
                onReset();
                setConfirmReset(false);
                setSettingsOpen(false);
              }}
            >
              {confirmReset ? (
                <span className="text-[var(--c-red)]">Click again to erase all demo data</span>
              ) : (
                "Reset demo data…"
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function TopItem({
  label,
  kbd,
  onClick,
  children,
}: {
  label: string;
  kbd: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="hidden flex-col justify-center border-l border-white/15 px-3 text-left text-[12px] hover:bg-white/10 sm:flex">
      <span className="flex items-center gap-1 text-[9.5px] uppercase tracking-[.08em] text-white/55">
        {label} <span className="c-kbd !text-[9px] !leading-[13px]">{kbd}</span>
      </span>
      {children}
    </button>
  );
}
