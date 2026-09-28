import { Megaphone } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { getSiteSettings } from "@/lib/content";

/** The admin's site-wide notice (Site settings → Announcement), above the navbar. Hidden when empty. */
export async function AnnouncementBar() {
  const { announcement } = await getSiteSettings();
  const text = announcement?.trim();
  if (!text) return null;

  return (
    <aside aria-label="Announcement" className="bg-navy text-white">
      <Container className="flex items-center justify-center gap-2.5 py-2.5 text-center text-sm font-medium text-balance">
        <Megaphone aria-hidden className="size-4 shrink-0 text-sky" />
        <p className="min-w-0 wrap-break-word">{text}</p>
      </Container>
    </aside>
  );
}
