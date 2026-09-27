import Image from "next/image";
import Link from "next/link";

import { CategoryIcon } from "@/components/courses/CategoryIcon";
import { courseHref } from "@/lib/course-display";
import { formatPrice, getCoursePricing } from "@/lib/pricing";
import type { Course } from "@/types/course";

export function CourseSearchResult({ course }: { course: Course }) {
  return (
    <Link
      href={courseHref(course.slug)}
      data-search-result
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 outline-none hover:bg-surface-blue focus-visible:bg-surface-blue focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {course.thumbnail ? (
        <div className="relative size-9 shrink-0 overflow-hidden rounded-md border bg-surface-gray">
          <Image
            src={course.thumbnail}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-white">
          <CategoryIcon slug={course.category.slug} className="size-4 text-navy" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{course.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {course.category.name} · {course.duration}
        </span>
      </span>
      <span className="shrink-0 text-sm font-medium text-navy tabular-nums">
        {formatPrice(getCoursePricing(course).current)}
      </span>
    </Link>
  );
}
