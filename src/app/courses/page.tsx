import type { Metadata } from "next";

import { ActiveCourseFilters } from "@/components/courses/ActiveCourseFilters";
import { CourseFilterSidebar } from "@/components/courses/CourseFilterSidebar";
import { CourseEmptyState, CourseGrid } from "@/components/courses/CourseGrid";
import { CoursePagination } from "@/components/courses/CoursePagination";
import { CourseResultsHeader } from "@/components/courses/CourseResultsHeader";
import { CourseSearch } from "@/components/courses/CourseSearch";
import { CoursesHeader } from "@/components/courses/CoursesHeader";
import { MobileCourseFilters } from "@/components/courses/MobileCourseFilters";
import { Container } from "@/components/layout/Container";
import { filterCourses, paginate, parseCourseFilters } from "@/lib/course-search";
import { getCourseCategories, getPublishedCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse practical technology courses in web development, AI, data science, UI/UX, cybersecurity, graphic design and cloud computing.",
};

const PAGE_SIZE = 9;

export default async function CoursesPage({ searchParams }: PageProps<"/courses">) {
  const [courses, categories] = await Promise.all([getPublishedCourses(), getCourseCategories()]);
  const { search, category, page } = parseCourseFilters(
    await searchParams,
    categories.map((c) => c.slug),
  );

  // Category counts reflect the current search, so each count is what you get by clicking it.
  const searchMatches = filterCourses(courses, { search });
  const results = category
    ? searchMatches.filter((course) => course.category.slug === category)
    : searchMatches;
  const pageData = paginate(results, page, PAGE_SIZE);

  const categoryOptions = categories.map((c) => ({
    category: c,
    count: searchMatches.filter((course) => course.category_id === c.id).length,
  }));
  const activeCategory = categories.find((c) => c.slug === category) ?? null;
  const filterProps = {
    options: categoryOptions,
    totalCount: searchMatches.length,
    activeCategory: category,
    search,
  };

  return (
    <main id="main" className="flex-1">
      <CoursesHeader>
        <CourseSearch mode="filter" value={search} category={category} />
      </CoursesHeader>

      <Container className="grid grid-cols-1 gap-10 py-10 sm:py-14 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <CourseFilterSidebar {...filterProps} />
        </div>

        <div className="min-w-0 space-y-6">
          <CourseResultsHeader total={results.length} from={pageData.from} to={pageData.to}>
            <MobileCourseFilters {...filterProps} />
          </CourseResultsHeader>

          <ActiveCourseFilters category={activeCategory} search={search} />

          {results.length > 0 ? (
            <CourseGrid courses={pageData.items} headingLevel="h3" className="lg:grid-cols-2 xl:grid-cols-3" />
          ) : (
            <CourseEmptyState />
          )}

          <div className="pt-4">
            <CoursePagination
              page={pageData.page}
              totalPages={pageData.totalPages}
              category={category}
              search={search}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
