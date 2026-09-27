"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { CourseGrid } from "@/components/courses/CourseGrid";
import { FilterChip } from "@/components/shared/FilterChip";
import { buttonVariants } from "@/components/ui/button";
import { coursesHref } from "@/lib/course-display";
import { cn } from "@/lib/utils";
import type { Course, CourseCategory } from "@/types/course";

const LIMIT = 6;

interface PopularCoursesGridProps {
  courses: Course[];
  categories: CourseCategory[];
}

export function PopularCoursesGrid({ courses, categories }: PopularCoursesGridProps) {
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  const matching = categorySlug
    ? courses.filter((course) => course.category.slug === categorySlug)
    : courses;
  const visible = matching.slice(0, LIMIT);
  const activeCategory = categories.find((category) => category.slug === categorySlug);

  return (
    <>
      {/* Scrolls sideways on small screens instead of wrapping into many rows. */}
      <div
        role="group"
        aria-label="Filter courses by category"
        className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0"
      >
        <FilterChip active={categorySlug === null} onClick={() => setCategorySlug(null)}>
          All
        </FilterChip>
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            active={categorySlug === category.slug}
            onClick={() => setCategorySlug(category.slug)}
          >
            {category.short_name}
          </FilterChip>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        Showing {visible.length} {activeCategory ? activeCategory.name : ""} courses
      </p>

      <CourseGrid courses={visible} className="mt-8" />

      <div className="mt-10 flex justify-center">
        <Link
          href={coursesHref({ category: categorySlug ?? undefined })}
          className={cn(buttonVariants({ variant: "outline", size: "xl" }), "w-full sm:w-auto")}
        >
          {activeCategory && matching.length > 0
            ? `View all ${matching.length} ${activeCategory.short_name} courses`
            : "View all courses"}
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Link>
      </div>
    </>
  );
}
