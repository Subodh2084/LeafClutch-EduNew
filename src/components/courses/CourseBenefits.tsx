import { CircleCheck } from "lucide-react";

import { CourseDetailSection } from "@/components/courses/CourseDetailSection";
import type { CourseBenefit } from "@/types/course";

export function CourseBenefits({ benefits }: { benefits: CourseBenefit[] }) {
  if (benefits.length === 0) return null;

  return (
    <CourseDetailSection id="benefits" title="What You Will Get">
      <ul className="grid gap-4 sm:grid-cols-2">
        {benefits.map((benefit) => (
          <li key={benefit.id} className="flex gap-4 rounded-xl border bg-white p-5">
            <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-blue" />
            <div>
              <h3 className="text-base font-semibold text-foreground">{benefit.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </CourseDetailSection>
  );
}
