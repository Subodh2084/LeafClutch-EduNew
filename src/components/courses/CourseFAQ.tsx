import { CourseDetailSection } from "@/components/courses/CourseDetailSection";
import { FaqList } from "@/components/shared/FaqList";
import type { Faq } from "@/types/content";

export function CourseFAQ({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <CourseDetailSection id="faq" title="Frequently Asked Questions">
      <FaqList faqs={faqs} />
    </CourseDetailSection>
  );
}
