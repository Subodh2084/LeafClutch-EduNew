import type { EnrollmentFormValues } from "@/lib/validation/enrollment";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Enrollment delivery, kept in one place. For now both channels hand off to
// the user's own WhatsApp / email app; nothing is sent from the browser and no
// credentials are involved. When a backend exists (e.g. a Supabase insert or a
// server action that emails admissions), replace `sendEnrollment` only — the
// form does not need to change.

export type EnrollmentChannel = "whatsapp" | "email";

export interface EnrollmentRequest extends EnrollmentFormValues {
  courseName: string;
}

export function buildEnrollmentMessage(request: EnrollmentRequest): string {
  const lines = [
    "Hello LeafClutch,",
    "",
    "I would like to enroll in:",
    "",
    `Course: ${request.courseName}`,
    "",
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    `Phone: ${request.phone}`,
    `Address: ${request.address}`,
  ];
  if (request.message) lines.push("", "Message:", request.message);
  return lines.join("\n");
}

export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const target = to.trim() || "info@leafclutch.com";
  // encodeURIComponent (not URLSearchParams) so spaces become %20, which mail clients expect.
  return `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Contact details from site_settings. A channel set to null is hidden. */
export interface EnrollmentChannels {
  whatsapp: string | null;
  email: string | null;
}

/** The pre-filled WhatsApp or mailto URL, or null if the channel is not configured. */
export function getEnrollmentUrl(
  channel: EnrollmentChannel,
  request: EnrollmentRequest,
  { whatsapp, email }: EnrollmentChannels,
): string | null {
  const message = buildEnrollmentMessage(request);
  const targetEmail = email?.trim() || "info@leafclutch.com";

  if (channel === "whatsapp") return buildWhatsAppUrl(whatsapp, message);
  return buildMailtoUrl(targetEmail, `Enrollment request: ${request.courseName}`, message);
}

/**
 * Hands the enrollment to the user's WhatsApp or mail app. This is the one
 * function to replace when enrollments are stored or emailed server-side.
 */
export function sendEnrollment(channel: EnrollmentChannel, url: string) {
  if (channel === "whatsapp") {
    // New tab keeps the form available. (A "noopener" feature string would make
    // window.open return null, so detach the opener manually instead.)
    const tab = window.open(url, "_blank");
    if (tab) tab.opener = null;
    else window.location.href = url; // popup blocked
    return;
  }
  // Mailto link trigger: Using a temporary anchor tag is reliable across all browsers
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
