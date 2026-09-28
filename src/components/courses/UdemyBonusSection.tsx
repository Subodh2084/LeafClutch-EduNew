import { Gift, Info } from "lucide-react";

import { CourseDetailSection } from "@/components/courses/CourseDetailSection";
import { UdemyBonusCourseCard } from "@/components/courses/UdemyBonusCourseCard";
import { cn } from "@/lib/utils";
import type { UdemyBonusCourse } from "@/types/course";

export const UDEMY_BONUS_SECTION_ID = "udemy-bonus";

interface UdemyBonusSectionProps {
  courseName: string;
  courses: UdemyBonusCourse[];
}

export function UdemyBonusSection({ courseName, courses }: UdemyBonusSectionProps) {
  if (courses.length === 0) return null;
  const single = courses.length === 1;

  return (
    <CourseDetailSection
      id={UDEMY_BONUS_SECTION_ID}
      eyebrow={
        <p className="flex items-center gap-2 text-sm font-medium text-green-text">
          <Gift aria-hidden className="size-4" />
          Bonus with your enrollment
        </p>
      }
      title="Free Udemy courses with lifetime access"
      description={
        <span className="block max-w-2xl">
          Enroll in {courseName} and{" "}
          {single ? "get this Udemy course" : "choose one of these Udemy courses"} at no extra
          cost. It stays yours for life, so you can keep learning long after the program ends.
        </span>
      }
    >
      <ul
        className={cn(
          "grid grid-cols-1 gap-5",
          !single && "md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2",
        )}
      >
        {courses.map((course) => (
          <li key={course.id} className="flex min-w-0">
            <UdemyBonusCourseCard course={course} horizontal={single} />
          </li>
        ))}
      </ul>

      <p className="mt-4 flex gap-2 text-sm text-muted-foreground">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        Udemy is a separate platform. Course access is arranged by LeafClutch Academy after your
        enrollment is confirmed.
      </p>
    </CourseDetailSection>
  );
}
