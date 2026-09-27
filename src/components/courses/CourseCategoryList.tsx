import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import { CategoryIcon } from "@/components/courses/CategoryIcon";
import { coursesHref } from "@/lib/course-display";
import { cn } from "@/lib/utils";
import type { CourseCategory } from "@/types/course";

export interface CategoryOption {
  category: CourseCategory;
  /** Courses in this category matching the current search. */
  count: number;
}

interface CourseCategoryListProps {
  options: CategoryOption[];
  totalCount: number;
  activeCategory: string;
  search: string;
  /** Lets the mobile sheet close itself after navigation. */
  onNavigate?: () => void;
}

/** Category filter as plain links, so it works without JavaScript. */
export function CourseCategoryList({
  options,
  totalCount,
  activeCategory,
  search,
  onNavigate,
}: CourseCategoryListProps) {
  const items = [
    { slug: "", label: "All Courses", count: totalCount },
    ...options.map(({ category, count }) => ({ slug: category.slug, label: category.name, count })),
  ];

  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active = item.slug === activeCategory;
        return (
          <li key={item.slug || "all"}>
            <Link
              href={coursesHref({ category: item.slug, search })}
              onClick={onNavigate}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active
                  ? "bg-surface-blue font-medium text-navy"
                  : "text-muted-foreground hover:bg-surface-blue/60 hover:text-foreground",
              )}
            >
              {item.slug ? (
                <CategoryIcon slug={item.slug} className="size-4 shrink-0" />
              ) : (
                <LayoutGrid aria-hidden className="size-4 shrink-0" />
              )}
              <span className="flex-1">{item.label}</span>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  active ? "text-navy" : "text-muted-foreground",
                )}
              >
                {item.count}
                <span className="sr-only"> {item.count === 1 ? "course" : "courses"}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
