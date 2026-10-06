"use client";

import Link from "next/link";
import { MARKETS } from "@/lib/shop/market";
import { useAppState } from "@/lib/store/store";
import { Logo } from "./site-header";

export function SiteFooter() {
  const { prefs } = useAppState();
  return (
    <footer className="mt-24 border-t border-[var(--s-line)] bg-[var(--s-surface)]">
      <div className="s-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-[14px] leading-6 text-[var(--s-text-2)]">
            Commercial vehicle parts for UAE fleets and workshops. Demo storefront with synthetic catalogue data.
          </p>
        </div>
        <FooterCol title="Shop" links={[["All parts", "/parts"], ["Braking", "/parts?category=Braking"], ["Filters", "/parts?category=Filters"], ["Engine", "/parts?category=Engine"]]} />
        <FooterCol title="Help" links={[["Find by vehicle", "/#vehicles"], ["How ordering works", "/#how"], ["Brands", "/#brands"]]} />
        <FooterCol title="Business" links={[["Staff · Billing counter", "/counter"], ["Catalogue admin", "/admin"]]} />
      </div>
      <div className="border-t border-[var(--s-line)]">
        <div className="s-container flex flex-col justify-between gap-2 py-5 text-[13px] text-[var(--s-muted)] md:flex-row">
          <p>© 2026 Desert Route Truck Parts · UAE · Qatar · Saudi Arabia</p>
          <p>
            Prices in {MARKETS[prefs.market].currency}, excluding VAT.
            {prefs.market !== "UAE" && " Non-AED prices are estimates; orders are invoiced in AED."}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-[13px] font-semibold">{title}</p>
      <ul className="mt-3 grid gap-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-[14px] text-[var(--s-text-2)] hover:text-[var(--s-text)]">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
