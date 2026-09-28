
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

/**
 * Hero call-out for the free Udemy course.
 * Bright gradient treatment makes the banner stand out against the navy hero.
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
      href={`${siteConfig.nav.enroll}?course=${encodeURIComponent(
        course.slug,
      )}`}
      className={cn(
        "group bonus-sheen relative inline-flex max-w-full items-center gap-3 overflow-hidden rounded-xl",
        "border border-green/70",
        "bg-linear-to-r from-green/20 via-emerald-400/15 to-sky/20",
        "px-2.5 py-2.5 pr-4",
        "shadow-[0_0_24px_rgb(40_200_64/0.12)]",
        "backdrop-blur-sm",
        "transition-all duration-300",
        "hover:-translate-y-0.5",
        "hover:border-green",
        "hover:from-green/30 hover:via-emerald-400/20 hover:to-sky/25",
        "hover:shadow-[0_0_32px_rgb(40_200_64/0.22)]",
        "focus-visible:ring-2 focus-visible:ring-green/60",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          "bg-linear-to-br from-green via-emerald-400 to-teal",
          "shadow-[0_4px_14px_rgb(40_200_64/0.28)]",
          "transition-transform duration-300",
          "group-hover:scale-105",
        )}
      >
        <Gift
          aria-hidden
          className="gift-wiggle size-5 text-white drop-shadow-sm"
          strokeWidth={2.5}
        />
      </span>
      <span className="min-w-0 text-[0.9375rem] font-semibold leading-snug text-white">
        Includes a{" "}
        <span className="font-extrabold text-white">
          free Udemy course
        </span>

        <span className="sr-only">
          {" "}
          — enroll in {course.name}
        </span>
      </span>
    </Link>
  );
}

