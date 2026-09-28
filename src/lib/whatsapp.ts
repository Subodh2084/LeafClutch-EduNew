import type { TrainingType } from "@/types/training";

const trainingLabels: Record<TrainingType, { label: string; audience: string }> = {
  corporate: { label: "Corporate Training", audience: "Organisation" },
  academic: { label: "Academic Training", audience: "Institution" },
  government: { label: "Government Training", audience: "Office" },
};

// WhatsApp deep links. The number always comes from site_settings — pass it in
// from the server (getSiteSettings); never hardcode it in a component.

/**
 * wa.me needs the full international number. A bare 10-digit Nepali mobile
 * (98…/97…/96…) is stored without the country code, so add 977.
 */
function toInternationalDigits(number: string | null): string {
  const digits = number?.replace(/\D/g, "") ?? "";
  return /^9[678]\d{8}$/.test(digits) ? `977${digits}` : digits;
}

/** wa.me link with a pre-filled message, or null when no number is configured. */
export function buildWhatsAppUrl(number: string | null, text?: string): string | null {
  const digits = toInternationalDigits(number);
  if (!digits) return null;
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}

/** Pre-filled message for "Request … Training", optionally naming a programme. */
export function buildTrainingInquiryMessage(type: TrainingType, programTitle?: string): string {
  const { label, audience } = trainingLabels[type];
  const lines = [
    "Hello Leafclutch,",
    "",
    `I would like to request ${label.toLowerCase()}${programTitle ? ` for: ${programTitle}` : ""}.`,
    "",
    `Name:`,
    `${audience}:`,
    "Number of participants:",
    "Preferred dates:",
  ];
  return lines.join("\n");
}
