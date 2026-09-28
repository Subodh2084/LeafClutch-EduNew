import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { ContactInfo, ContactPageContent } from "@/types/contact";
import type { TrainingType } from "@/types/training";

const invitation: Record<TrainingType, { title: string; description: string }> = {
  corporate: {
    title: "Plan training for your team",
    description:
      "Tell us about your team, the skills you want to build and when you would like to start. Message us on WhatsApp or by email and we will get back to you to shape a program that fits your goals and schedule.",
  },
  academic: {
    title: "Plan a program for your students",
    description:
      "Tell us about your institution, your students and your academic calendar. Message us on WhatsApp or by email and we will get back to you to plan the right workshops, bootcamps or courses.",
  },
  government: {
    title: "Plan training for your department",
    description:
      "Tell us about your office, the teams you want to train and your timeline. Message us on WhatsApp or by email and we will get back to you to design a program around your institution's needs.",
  },
};

/**
 * The end of each training page: the Contact page's message form and contact
 * details (from Site settings), so organisations can get in touch right there.
 */
export function TrainingContact({
  type,
  info,
  content,
}: {
  type: TrainingType;
  info: ContactInfo;
  content: ContactPageContent;
}) {
  return (
    <section id="contact" aria-labelledby="training-contact-heading" className="scroll-mt-16 border-t py-16 sm:py-24">
      <Container>
        <SectionHeading
          id="training-contact-heading"
          eyebrow="Contact"
          title={invitation[type].title}
          description={invitation[type].description}
        />
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          <ContactForm title={content.formTitle} channels={{ whatsapp: info.whatsapp, email: info.email }} />
          <ContactDetails title={content.infoTitle} description={content.infoDescription} info={info} />
        </div>
      </Container>
    </section>
  );
}
