import type { ContactPageContent } from "@/types/contact";

// Contact page copy. The contact details themselves (address, phone, email,
// WhatsApp, opening hours) come from Supabase site_settings.
export const contactPageContent: ContactPageContent = {
  title: "Contact Us",
  description:
    "Questions about a course, batch timings or payment? Send us a message on WhatsApp or by email and our team will get back to you.",
  formTitle: "Send us a message",
  infoTitle: "Get in touch",
  infoDescription: "Prefer to reach us directly? Use any of these.",
};
