import Link from "next/link";
import { SearchX } from "lucide-react";

import { CourseCard } from "@/components/courses/CourseCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

interface CourseGridProps {
  courses: Course[];
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
}

/** 1 column on mobile, 2 on tablet, 3 on desktop (override when beside a sidebar). */
export function CourseGrid({ courses, headingLevel, className }: CourseGridProps) {
  return (
    <ul className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {courses.map((course) => (
        <li key={course.id}>
          <CourseCard course={course} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}

export function CourseEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-white px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-blue">
        <SearchX aria-hidden className="size-5 text-navy" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-foreground">No courses found</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        We couldn’t find any courses matching your search or selected category.
      </p>
      <Link href="/courses" scroll={false} className={cn(buttonVariants({ size: "xl" }), "mt-6")}>
        Clear Filters
      </Link>
    </div>
  );
}
