import Link from "next/link";
import { ArrowRight, Clock, MonitorPlay } from "lucide-react";

import { CoursePrice } from "@/components/courses/CoursePrice";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { courseHref, learningModeLabels } from "@/lib/course-display";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
  /** Match the surrounding heading hierarchy. */
  headingLevel?: "h2" | "h3" | "h4";
  priority?: boolean;
  className?: string;
}

export function CourseCard({
  course,
  headingLevel: Heading = "h3",
  priority,
  className,
}: CourseCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-card transition-[box-shadow,translate,border-color] duration-200",
        "hover:-translate-y-0.5 hover:border-surface-blue-strong hover:shadow-card-hover",
        "has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50",
        className,
      )}
    >
      <CourseThumbnail
        course={course}
        decorative
        priority={priority}
        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
      />

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-blue-text">{course.category.name}</p>

        <Heading className="mt-2 text-lg leading-snug font-semibold text-foreground">
          {/* The stretched link makes the whole card clickable with one tab stop. */}
          <Link
            href={courseHref(course.slug)}
            className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-navy"
          >
            {course.name}
          </Link>
        </Heading>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {course.short_description}
        </p>

        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Clock aria-hidden className="size-4" />
            <span className="sr-only">Duration: </span>
            {course.duration}
          </li>
          <li className="flex items-center gap-1.5">
            <MonitorPlay aria-hidden className="size-4" />
            <span className="sr-only">Learning mode: </span>
            {learningModeLabels[course.learning_mode]}
          </li>
        </ul>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t pt-4">
            <CoursePrice course={course} />
            <span
              aria-hidden
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-navy"
            >
              View course
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
