import { buildMailtoUrl, sendEnrollment, type EnrollmentChannel } from "@/lib/enrollment";
import type { ContactFormValues } from "@/lib/validation/contact";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { ContactInfo } from "@/types/contact";

// Contact form delivery. Like enrollment, it hands the message to the user's
// own WhatsApp or mail app. When a backend exists (a Supabase insert or a
// server action), replace `sendContactMessage` only; the form stays the same.

export type ContactChannel = EnrollmentChannel;
export type ContactChannels = Pick<ContactInfo, "whatsapp" | "email">;

export function buildContactMessage(values: ContactFormValues): string {
  const lines = [
    "Hello LeafClutch,",
    "",
    values.message,
    "",
    `Name: ${values.name}`,
    `Email: ${values.email}`,
  ];
  if (values.phone) lines.push(`Phone: ${values.phone}`);
  return lines.join("\n");
}

/** The pre-filled WhatsApp or mailto URL, or null if the channel is not configured. */
export function getContactUrl(
  channel: ContactChannel,
  values: ContactFormValues,
  channels: ContactChannels,
): string | null {
  const message = buildContactMessage(values);
  const targetEmail = channels.email?.trim() || "info@leafclutch.com";

  if (channel === "whatsapp") return buildWhatsAppUrl(channels.whatsapp, message);
  return buildMailtoUrl(targetEmail, `Website enquiry from ${values.name}`, message);
}

/** Hands the message off. The one function to replace when messages are stored server-side. */
export function sendContactMessage(channel: ContactChannel, url: string) {
  sendEnrollment(channel, url);
}
