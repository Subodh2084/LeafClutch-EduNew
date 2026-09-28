import { FaWhatsapp } from "react-icons/fa";

import { buildWhatsAppUrl } from "@/lib/whatsapp";

/** Fixed bottom-right chat link on every public page. Hidden when no number is configured. */
export function WhatsAppFloatingButton({ number }: { number: string | null }) {
  const href = buildWhatsAppUrl(number);
  if (!href) return null;

  return (
    // A landmark, so the button isn't stray content outside the page regions.
    <aside aria-label="WhatsApp chat">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Leafclutch on WhatsApp (opens in a new tab)"
        className="whatsapp-glow fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_6px_20px_rgb(29_168_81/0.4)] transition-transform outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-whatsapp/40 sm:right-6 sm:bottom-6"
      >
        <FaWhatsapp aria-hidden className="size-7" />
      </a>
    </aside>
  );
}
