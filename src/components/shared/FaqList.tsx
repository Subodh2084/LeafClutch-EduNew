"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FilterChip } from "@/components/shared/FilterChip";
import type { Faq, FaqCategory } from "@/types/content";

const categoryLabels: Record<FaqCategory, string> = {
  general: "General",
  course: "Course",
  enrollment: "Enrollment",
  payment: "Payment",
  certificate: "Certificate",
};

interface FaqListProps {
  faqs: Faq[];
  /** Category filter for site-wide FAQs; off for short course FAQ lists. */
  showFilter?: boolean;
}

/** The one FAQ UI, used on the homepage and course detail pages. */
export function FaqList({ faqs, showFilter = false }: FaqListProps) {
  const [category, setCategory] = useState<FaqCategory | null>(null);

  // Only offer filters for categories that actually have questions.
  const categories = (Object.keys(categoryLabels) as FaqCategory[]).filter((key) =>
    faqs.some((faq) => faq.category === key),
  );
  const visible = category ? faqs.filter((faq) => faq.category === category) : faqs;

  if (faqs.length === 0) return null;

  return (
    <div>
      {showFilter && categories.length > 1 && (
        <div
          role="group"
          aria-label="Filter questions by topic"
          className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <FilterChip active={category === null} onClick={() => setCategory(null)}>
            All
          </FilterChip>
          {categories.map((key) => (
            <FilterChip key={key} active={category === key} onClick={() => setCategory(key)}>
              {categoryLabels[key]}
            </FilterChip>
          ))}
        </div>
      )}

      <Accordion className="rounded-xl border bg-card px-5 shadow-card sm:px-6">
        {visible.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="gap-4 py-5 text-base hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="max-w-prose pb-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
              <p>{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
