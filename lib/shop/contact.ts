// Business contact details. PLACEHOLDER — replace with the real WhatsApp
// business number (digits only, country code first, no +).
export const WHATSAPP_NUMBER = "971500000000";

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
