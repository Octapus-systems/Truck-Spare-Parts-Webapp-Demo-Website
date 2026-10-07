"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { useAppState } from "@/lib/store/store";
import { SiteFooter } from "./site-footer";
import { QuoteProvider } from "./quote-dialog";
import { SiteHeader } from "./site-header";
import { WhatsAppButton } from "./whatsapp-button";

/** Shared frame for every shop page: header, footer, toasts, text direction. */
export function ShopShell({ className, children }: { className: string; children: React.ReactNode }) {
  const { prefs } = useAppState();
  const pathname = usePathname();
  return (
    <div dir={prefs.locale === "ar" ? "rtl" : "ltr"} lang={prefs.locale === "ar" ? "ar" : "en-AE"} className={`shop ${className}`}>
      <QuoteProvider>
        <Toaster position="top-right" richColors closeButton />
        <SiteHeader />
        {/* Keyed by route so each page fades in. */}
        <main key={pathname} className="s-page flex-1">
          {children}
        </main>
        <SiteFooter />
        <WhatsAppButton />
      </QuoteProvider>
    </div>
  );
}
