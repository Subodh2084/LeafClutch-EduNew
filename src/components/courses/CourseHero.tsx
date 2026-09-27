import Link from "next/link";
import { Award, ChevronRight, Clock, MonitorPlay } from "lucide-react";

import { coursesHref, learningModeLabels } from "@/lib/course-display";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

export function CourseHero({ course, className }: { course: Course; className?: string }) {
  const facts = [
    { icon: Clock, label: "Duration", value: course.duration },
    { icon: MonitorPlay, label: "Learning mode", value: learningModeLabels[course.learning_mode] },
    ...(course.certificate_available
      ? [{ icon: Award, label: "Certificate", value: "Included" }]
      : []),
  ];

  return (
    // bleed-surface-blue paints the band edge to edge; the enrollment card sits over it on desktop.
    <section aria-labelledby="course-heading" className={cn("bleed-surface-blue py-10 sm:py-14", className)}>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-navy">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link href="/courses" className="hover:text-navy">
              Courses
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            {course.name}
          </li>
        </ol>
      </nav>

      <Link
        href={coursesHref({ category: course.category.slug })}
        className="mt-6 inline-flex rounded-full border border-surface-blue-strong bg-white px-3 py-1 text-sm font-medium text-blue-text hover:text-navy"
      >
        {course.category.name}
      </Link>

      <h1
        id="course-heading"
        className="mt-4 text-[2rem] leading-tight font-semibold text-foreground sm:text-5xl"
      >
        {course.name}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        {course.short_description}
      </p>

      <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
        {facts.map(({ icon: Icon, label, value }) => (
          // dt/dd must be direct children of the group div, so the icon lives inside dt.
          <div key={label} className="relative flex min-h-10 flex-col justify-center pl-13">
            <dt className="text-xs text-muted-foreground">
              <span className="absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg border bg-white">
                <Icon aria-hidden className="size-5 text-navy" />
              </span>
              {label}
            </dt>
            <dd className="text-sm font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
