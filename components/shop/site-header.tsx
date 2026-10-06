"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CountryFlag } from "@/components/country-flag";
import { strings } from "@/lib/shop/i18n";
import { setPrefs } from "@/lib/store/reducer";
import { update, useAppState } from "@/lib/store/store";
import type { Market } from "@/lib/store/types";
import { CartSheet } from "./cart-sheet";
import { SearchBox } from "./search-box";

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Desert Route Truck Parts home">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--s-dark)] text-white" aria-hidden="true">
        <svg width="20" height="22" viewBox="0 0 24 26" fill="none">
          <path d="M4 3h6c7 0 10 4 10 10s-3 10-10 10H4V3Z" stroke="currentColor" strokeWidth="2.3" />
          <path d="m10 8 5 5-5 5M4 13h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="leading-none">
        <strong className="block text-[15px] font-semibold tracking-[-.02em]">Desert Route</strong>
        <span className="mt-1 block text-[10px] font-semibold tracking-[.16em] text-[var(--s-muted)]">TRUCK PARTS</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { prefs } = useAppState();
  const t = strings(prefs.locale);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/parts", label: t.parts, active: pathname.startsWith("/parts") },
    { href: "/#vehicles", label: t.vehicles, active: false },
    { href: "/#brands", label: t.brands, active: false },
    { href: "/admin", label: t.admin, active: pathname.startsWith("/admin") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--s-line)] bg-white/90 backdrop-blur-md">
      <div className="s-container flex h-16 items-center gap-4">
        <Logo />
        <nav aria-label="Main" className="ms-4 hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className="whitespace-nowrap rounded-md px-3 py-2 text-[14px] font-medium text-[var(--s-text-2)] hover:bg-[var(--s-surface)] hover:text-[var(--s-text)] aria-[current=page]:text-[var(--s-text)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mx-auto hidden w-full max-w-[380px] md:block">
          {pathname !== "/" && <SearchBox key={pathname} placeholder={t.searchPlaceholder} buttonLabel={t.search} />}
        </div>

        <div className="ms-auto flex items-center gap-1">
          <label className="hidden items-center gap-1.5 rounded-md px-2 hover:bg-[var(--s-surface)] sm:flex">
            <CountryFlag market={prefs.market} className="rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" />
            <select
              aria-label="Display currency"
              value={prefs.market}
              onChange={(e) => update((s) => setPrefs(s, { market: e.target.value as Market }))}
              className="h-9 cursor-pointer bg-transparent text-[13px] font-medium outline-none"
            >
              <option value="UAE">AED</option>
              <option value="Qatar">QAR</option>
              <option value="Saudi">SAR</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <button
            onClick={() => update((s) => setPrefs(s, { locale: prefs.locale === "en" ? "ar" : "en" }))}
            className="hidden h-9 rounded-md px-2.5 text-[13px] font-medium text-[var(--s-text-2)] hover:bg-[var(--s-surface)] sm:block"
            aria-label="Switch language"
          >
            {prefs.locale === "en" ? "عربي" : "EN"}
          </button>
          <Link href="/counter" className="hidden h-9 items-center whitespace-nowrap rounded-md border border-[var(--s-line)] px-3 text-[12.5px] font-medium text-[var(--s-text-2)] hover:border-[var(--s-text)] hover:text-[var(--s-text)] xl:flex">
            {t.staff}
          </Link>
          <CartSheet label={t.cart} />
          <button
            className="grid h-10 w-10 place-items-center rounded-md hover:bg-[var(--s-surface)] lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-[var(--s-line)] bg-white lg:hidden">
          <div className="s-container grid gap-1 py-3">
            {pathname !== "/" && (
              <div className="mb-2 md:hidden">
                <SearchBox placeholder={t.searchPlaceholder} buttonLabel={t.search} />
              </div>
            )}
            {[...links, { href: "/counter", label: t.staff, active: false }].map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-[15px] font-medium hover:bg-[var(--s-surface)]">
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 px-3 pt-2 sm:hidden">
              <select
                aria-label="Display currency"
                value={prefs.market}
                onChange={(e) => update((s) => setPrefs(s, { market: e.target.value as Market }))}
                className="s-select !h-10 !w-auto"
              >
                <option value="UAE">AED</option>
                <option value="Qatar">QAR</option>
                <option value="Saudi">SAR</option>
                <option value="USD">USD</option>
              </select>
              <button onClick={() => update((s) => setPrefs(s, { locale: prefs.locale === "en" ? "ar" : "en" }))} className="s-btn" data-variant="outline">
                {prefs.locale === "en" ? "عربي" : "English"}
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
