import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CourseCard } from "@/components/courses/CourseCard";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { siteConfig } from "@/config/site";
import type { Course } from "@/types/course";

interface TrainingCoursesProps {
  title: string;
  description: string;
  /** Already filtered to this training type by the data layer. */
  courses: Course[];
}

export function TrainingCourses({ title, description, courses }: TrainingCoursesProps) {
  return (
    <section
      id="training-courses"
      aria-labelledby="training-courses-heading"
      className="scroll-mt-16 py-16 sm:py-24"
    >
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading id="training-courses-heading" title={title} description={description} />
          <Link
            href="/courses"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-navy underline-offset-4 hover:underline"
          >
            Browse all courses
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        {courses.length > 0 ? (
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} headingLevel="h3" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-xl border border-dashed bg-surface-blue/40 p-6 text-muted-foreground">
            We build this training around your needs.{" "}
            <Link href={siteConfig.nav.contact} className="font-medium text-navy underline underline-offset-4">
              Tell us what your team needs to learn
            </Link>
            .
          </p>
        )}
      </Container>
    </section>
  );
}
