import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { FaqList } from "@/components/shared/FaqList";
import { siteConfig } from "@/config/site";
import type { Faq } from "@/types/content";

export function FAQSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20 border-t py-16 sm:py-24">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] lg:gap-16">
        <div>
          <SectionHeading
            id="faq-heading"
            eyebrow="FAQ"
            title="Questions, answered"
            description="What to know about courses, enrollment, payment and certificates."
          />
          <p className="mt-6 text-sm text-muted-foreground">
            Can’t find your answer?{" "}
            <Link
              href={siteConfig.nav.contact}
              className="font-medium text-navy underline underline-offset-4 hover:decoration-2"
            >
              Contact us
            </Link>
          </p>
        </div>
        <FaqList faqs={faqs} showFilter />
      </Container>
    </section>
  );
}
