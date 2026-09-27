import type { TrainingType } from "@/types/training";

const trainingLabels: Record<TrainingType, { label: string; audience: string }> = {
  corporate: { label: "Corporate Training", audience: "Organisation" },
  academic: { label: "Academic Training", audience: "Institution" },
  government: { label: "Government Training", audience: "Office" },
};

// WhatsApp deep links. The number always comes from site_settings — pass it in
// from the server (getSiteSettings); never hardcode it in a component.

/** wa.me link with a pre-filled message, or null when no number is configured. */
export function buildWhatsAppUrl(number: string | null, text?: string): string | null {
  const digits = number?.replace(/\D/g, "");
  if (!digits) return null;
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}

/** Pre-filled message for "Request … Training", optionally naming a programme. */
export function buildTrainingInquiryMessage(type: TrainingType, programTitle?: string): string {
  const { label, audience } = trainingLabels[type];
  const lines = [
    "Hello LeafClutch,",
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
