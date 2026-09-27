import Link from "next/link";
import { X } from "lucide-react";

import { coursesHref } from "@/lib/course-display";
import type { CourseCategory } from "@/types/course";

interface ActiveCourseFiltersProps {
  category: CourseCategory | null;
  search: string;
}

const chipClass =
  "inline-flex h-8 items-center gap-1.5 rounded-full border bg-white pr-2 pl-3 text-sm text-foreground transition-colors outline-none hover:border-surface-blue-strong hover:text-navy focus-visible:ring-3 focus-visible:ring-ring/50";

export function ActiveCourseFilters({ category, search }: ActiveCourseFiltersProps) {
  if (!category && !search) return null;

  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
      {category && (
        <li>
          <Link href={coursesHref({ search })} scroll={false} className={chipClass}>
            {category.name}
            <X aria-hidden className="size-3.5 text-muted-foreground" />
            <span className="sr-only">(remove category filter)</span>
          </Link>
        </li>
      )}
      {search && (
        <li>
          <Link href={coursesHref({ category: category?.slug })} scroll={false} className={chipClass}>
            Search: “{search}”
            <X aria-hidden className="size-3.5 text-muted-foreground" />
            <span className="sr-only">(remove search)</span>
          </Link>
        </li>
      )}
      <li>
        <Link
          href="/courses"
          scroll={false}
          className="rounded-md px-2 py-1 text-sm font-medium text-navy underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Clear all
        </Link>
      </li>
    </ul>
  );
}
