import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseBenefits } from "@/components/courses/CourseBenefits";
import { CourseCertificate } from "@/components/courses/CourseCertificate";
import { CourseCurriculum } from "@/components/courses/CourseCurriculum";
import { CourseDescription } from "@/components/courses/CourseDescription";
import { CourseEnrollmentCard } from "@/components/courses/CourseEnrollmentCard";
import { CourseFAQ } from "@/components/courses/CourseFAQ";
import { CourseHero } from "@/components/courses/CourseHero";
import { CourseInstructor } from "@/components/courses/CourseInstructor";
import { CoursePayment } from "@/components/courses/CoursePayment";
import { CourseUdemy } from "@/components/courses/CourseUdemy";
import { RelatedCourses } from "@/components/courses/RelatedCourses";
import { Container } from "@/components/layout/Container";
import { getCourseBySlug, getRelatedCourses } from "@/lib/courses";

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const course = await getCourseBySlug((await params).slug);
  if (!course) return {};

  return {
    title: `${course.name} Course`,
    description: course.short_description,
    openGraph: {
      title: `${course.name} Course`,
      description: course.short_description,
      ...(course.thumbnail && { images: [{ url: course.thumbnail, alt: course.name }] }),
    },
  };
}

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  // Unknown and unpublished courses both 404.
  // One query loads every section; generateMetadata's call is deduplicated.
  const course = await getCourseBySlug((await params).slug);
  if (!course) notFound();

  const related = await getRelatedCourses(course.id, course.category_id);
  const { benefits, modules: curriculum, instructors, installments, faqs } = course;

  return (
    <main id="main" className="flex-1">
      {/* Desktop: main column + sticky enrollment card spanning the hero and content rows.
          Mobile: hero → card → sections, in source order. */}
      <Container className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-x-12">
        <CourseHero course={course} className="lg:col-start-1 lg:row-start-1" />

        <aside
          aria-label="Enrollment"
          className="pt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-14 lg:pb-16"
        >
          <div className="lg:sticky lg:top-24">
            <CourseEnrollmentCard
              course={course}
              moduleCount={curriculum.length}
              lessonCount={curriculum.reduce((sum, m) => sum + m.lessons.length, 0)}
              installmentCount={installments.length}
            />
          </div>
        </aside>

        <div className="min-w-0 space-y-14 py-12 sm:space-y-16 lg:col-start-1 lg:row-start-2 lg:pb-20">
          <CourseDescription description={course.description} />
          <CourseBenefits benefits={benefits} />
          <CourseCurriculum modules={curriculum} pdfUrl={course.curriculum_pdf_url} />
          <CoursePayment course={course} installments={installments} />
          <CourseUdemy url={course.udemy_url} />
          <CourseInstructor instructors={instructors} />
          <CourseCertificate course={course} />
          <CourseFAQ faqs={faqs} />
        </div>
      </Container>

      <RelatedCourses courses={related} category={course.category} />
    </main>
  );
}
