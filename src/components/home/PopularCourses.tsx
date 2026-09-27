import { PopularCoursesGrid } from "@/components/home/PopularCoursesGrid";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { Course, CourseCategory } from "@/types/course";

interface PopularCoursesProps {
  courses: Course[];
  categories: CourseCategory[];
}

export function PopularCourses({ courses, categories }: PopularCoursesProps) {
  if (courses.length === 0) return null;

  // Featured courses lead; the rest keep their catalogue order.
  const ordered = [...courses].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

  return (
    <section aria-labelledby="popular-heading" className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          id="popular-heading"
          eyebrow="Popular courses"
          title="Start with what learners choose most"
          description="Practical programmes with clear outcomes, real projects and mentors who review your work."
        />
        <PopularCoursesGrid courses={ordered} categories={categories} />
      </Container>
    </section>
  );
}
