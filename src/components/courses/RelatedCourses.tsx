import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CourseGrid } from "@/components/courses/CourseGrid";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { coursesHref } from "@/lib/course-display";
import type { Course, CourseCategory } from "@/types/course";

interface RelatedCoursesProps {
  courses: Course[];
  category: CourseCategory;
}

export function RelatedCourses({ courses, category }: RelatedCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="border-t bg-surface-blue/50 py-16 sm:py-20">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            id="related-heading"
            eyebrow={category.name}
            title="Related Courses"
          />
          <Link
            href={coursesHref({ category: category.slug })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:underline hover:underline-offset-4"
          >
            All {category.short_name} courses
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <CourseGrid courses={courses} className="mt-10" />
      </Container>
    </section>
  );
}
