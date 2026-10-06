"use client";

import { Toaster } from "sonner";
import { useAppState } from "@/lib/store/store";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Shared frame for every shop page: header, footer, toasts, text direction. */
export function ShopShell({ className, children }: { className: string; children: React.ReactNode }) {
  const { prefs } = useAppState();
  return (
    <div dir={prefs.locale === "ar" ? "rtl" : "ltr"} lang={prefs.locale === "ar" ? "ar" : "en-AE"} className={`shop ${className}`}>
      <Toaster position="top-right" richColors closeButton />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
