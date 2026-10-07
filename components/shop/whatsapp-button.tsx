"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/shop/contact";
import { useCatalog } from "@/lib/store/store";

/** Floating WhatsApp chat; on a product page the message names the part. */
export function WhatsAppButton() {
  const pathname = usePathname();
  const products = useCatalog();
  const productId = pathname.match(/^\/parts\/([^/]+)$/)?.[1];
  const product = products.find((p) => p.id === productId);
  const message = product
    ? `Hello, I'm interested in ${product.brand} ${product.partNumber} (${product.name}). Is it available?`
    : "Hello, I need help finding a truck part.";

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="s-float-in group fixed bottom-5 end-5 z-50 flex h-14 items-center gap-2 rounded-full bg-[#25d366] ps-4 pe-4 text-white shadow-[0_12px_30px_rgba(37,211,102,.35)] transition-transform hover:scale-[1.04] md:pe-5"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
      </svg>
      <span className="hidden text-[14px] font-semibold md:inline">WhatsApp us</span>
    </a>
  );
}
