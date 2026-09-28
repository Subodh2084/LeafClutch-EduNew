import Link from "next/link";
import { Award, ChevronRight, Clock, MonitorPlay } from "lucide-react";

import { CourseUdemyBanner } from "@/components/courses/CourseUdemyBanner";
import { coursesHref, hasUdemyBonus, learningModeLabels } from "@/lib/course-display";
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
    // bleed-navy paints the band edge to edge (the same navy as the exclusive bonus
    // card); the white enrollment card sits over it on desktop.
    <section aria-labelledby="course-heading" className={cn("bleed-navy py-10 text-white sm:py-14 [&_a:focus-visible]:outline-white", className)}>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
          <li>
            <Link href="/" className="hover:text-white">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link href="/courses" className="hover:text-white">
              Courses
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="font-medium text-white">
            {course.name}
          </li>
        </ol>
      </nav>

      <Link
        href={coursesHref({ category: course.category.slug })}
        className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-green transition-colors hover:bg-white/15"
      >
        {course.category.name}
      </Link>

      <h1
        id="course-heading"
        className="mt-4 text-[2rem] leading-tight font-semibold text-white sm:text-5xl"
      >
        {course.name}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">
        {course.short_description}
      </p>

      {hasUdemyBonus(course) && <CourseUdemyBanner course={course} className="mt-6" />}

      <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
        {facts.map(({ icon: Icon, label, value }) => (
          // dt/dd must be direct children of the group div, so the icon lives inside dt.
          <div key={label} className="relative flex min-h-10 flex-col justify-center pl-13">
            <dt className="text-xs text-white/65">
              <span className="absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg border border-white/15 bg-white/10">
                <Icon aria-hidden className="size-5 text-white" />
              </span>
              {label}
            </dt>
            <dd className="text-sm font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
