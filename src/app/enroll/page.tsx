import type { Metadata } from "next";

import { EnrollmentForm, type EnrollmentCourse } from "@/components/enroll/EnrollmentForm";
import { getSiteSettings } from "@/lib/content";
import { getPublishedCourseBySlug, getPublishedCourses } from "@/lib/courses";

type SearchParams = PageProps<"/enroll">["searchParams"];

async function requestedSlug(searchParams: SearchParams) {
  const { course } = await searchParams;
  return (Array.isArray(course) ? course[0] : course)?.trim() ?? "";
}

export async function generateMetadata({ searchParams }: PageProps<"/enroll">): Promise<Metadata> {
  const course = await getPublishedCourseBySlug(await requestedSlug(searchParams));
  return {
    title: course ? `Enroll in ${course.name}` : "Enroll",
    description: "Send your enrollment details to LeafClutch Technologies on WhatsApp or by email.",
    robots: { index: false }, // a form page, not content to rank
  };
}

export default async function EnrollPage({ searchParams }: PageProps<"/enroll">) {
  const [courses, settings, slug] = await Promise.all([
    getPublishedCourses(),
    getSiteSettings(),
    requestedSlug(searchParams),
  ]);

  // Only the fields the form needs reach the client.
  const options: EnrollmentCourse[] = courses.map((c) => ({
    slug: c.slug,
    name: c.name,
    duration: c.duration,
    learning_mode: c.learning_mode,
    actual_price: c.actual_price,
    discount_price: c.discount_price,
    categoryName: c.category.name,
  }));
  const initialCourse = options.some((c) => c.slug === slug) ? slug : "";

  return (
    <main id="main" className="flex-1">
      <EnrollmentForm
        courses={options}
        channels={{ whatsapp: settings.whatsapp, email: settings.email }}
        initialCourse={initialCourse}
        requestedUnavailable={slug !== "" && initialCourse === ""}
      />
    </main>
  );
}
