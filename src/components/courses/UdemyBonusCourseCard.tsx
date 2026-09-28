import Image from "next/image";
import { ArrowUpRight, ChartNoAxesColumn, Clock, PlayCircle, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { UdemyBonusCourse } from "@/types/course";

const countFormat = new Intl.NumberFormat(siteConfig.currency.locale);

interface UdemyBonusCourseCardProps {
  course: UdemyBonusCourse;
  /** Image beside the text from sm up — used when a course has a single bonus. */
  horizontal?: boolean;
}

/** Navy, like the exclusive bonus card, so the Udemy bonus reads as one system. */
export function UdemyBonusCourseCard({ course, horizontal = false }: UdemyBonusCourseCardProps) {
  return (
    <article
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden rounded-xl bg-navy text-white shadow-card-hover",
        horizontal && "sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]",
      )}
    >
      {/* Covers carry text, so the horizontal layout insets the image at 16:9 rather than cropping it. */}
      <div
        className={cn(
          "relative aspect-video overflow-hidden bg-white/10",
          horizontal && "sm:m-5 sm:mr-0 sm:self-start sm:rounded-lg",
        )}
      >
        <Image
          src={course.image_url}
          alt={`Cover of the Udemy course “${course.title}”`}
          fill
          sizes={horizontal ? "(min-width: 640px) 320px, 100vw" : "(min-width: 768px) 400px, 100vw"}
          className="object-cover"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-green-text shadow-card">
          <span aria-hidden className="size-1.5 rounded-full bg-green" />
          Free · lifetime
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug font-semibold wrap-break-word text-white">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed wrap-break-word text-white/75">
          {course.description}
        </p>

        <p className="mt-4 text-sm font-medium text-white">
          <span className="sr-only">Instructor: </span>
          {course.instructor}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm">
          <Star aria-hidden className="size-4 fill-window-yellow text-window-yellow" />
          <span className="font-semibold text-white">
            {course.rating.toFixed(1)}
            <span className="sr-only"> out of 5</span>
          </span>
          <span className="text-white/70">({countFormat.format(course.ratings_count)} ratings)</span>
        </p>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/75">
          <li className="flex items-center gap-1.5">
            <Clock aria-hidden className="size-4" />
            {course.total_hours}
            <span className="sr-only"> of video</span>
          </li>
          <li className="flex items-center gap-1.5">
            <PlayCircle aria-hidden className="size-4" />
            {countFormat.format(course.lectures)} lectures
          </li>
          <li className="flex items-center gap-1.5">
            <ChartNoAxesColumn aria-hidden className="size-4" />
            <span className="sr-only">Level: </span>
            {course.level}
          </li>
        </ul>

        <div className="mt-5 flex flex-1 flex-wrap items-end justify-between gap-3">
          <p className="text-sm font-medium text-green">Free with your enrollment</p>
          <a
            href={course.course_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white px-4 text-navy hover:bg-white/85 focus-visible:ring-white/60",
            )}
          >
            Explore
            <span className="sr-only"> {course.title} on Udemy (opens in a new tab)</span>
            <ArrowUpRight data-icon="inline-end" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}
