import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

/**
 * Hero call-out for the free Udemy course, on the navy hero; the whole pill
 * leads into enrollment. A sheen and a gift wiggle (globals.css) draw the eye.
 */
export function CourseUdemyBanner({
  course,
  className,
}: {
  course: Pick<Course, "name" | "slug">;
  className?: string;
}) {
  return (
    <Link
      href={`${siteConfig.nav.enroll}?course=${encodeURIComponent(course.slug)}`}
      className={cn(
        "group bonus-sheen relative inline-flex max-w-full items-center gap-3 overflow-hidden rounded-xl border border-green/50 bg-white/8 py-2 pr-4 pl-2 transition-colors hover:border-green hover:bg-white/14",
        className,
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green/20">
        <Gift aria-hidden className="gift-wiggle size-5 text-green" />
      </span>
      <span className="text-[0.9375rem] font-semibold text-white">
        Includes a free Udemy course
        <span className="sr-only"> — enroll in {course.name}</span>
      </span>
      <ArrowRight
        aria-hidden
        className="size-4 shrink-0 text-green transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
