import type { Metadata } from "next";

import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactHeader } from "@/components/contact/ContactHeader";
import { Container } from "@/components/layout/Container";
import { getContactInfo, getContactPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact LeafClutch Technologies about courses, batch timings or fees. Send us a message on WhatsApp or by email.",
};

export default async function ContactPage() {
  const [info, content] = await Promise.all([getContactInfo(), getContactPageContent()]);

  return (
    <main id="main" className="flex-1">
      <ContactHeader title={content.title} description={content.description} />
      <Container className="grid grid-cols-1 gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <ContactForm
          title={content.formTitle}
          channels={{ whatsapp: info.whatsapp, email: info.email }}
        />
        <ContactDetails title={content.infoTitle} description={content.infoDescription} info={info} />
      </Container>
    </main>
  );
}
