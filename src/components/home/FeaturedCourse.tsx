"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Clock,
  MonitorPlay,
  Pause,
  Play,
  Star,
} from "lucide-react";

import { CoursePrice } from "@/components/courses/CoursePrice";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { Button, buttonVariants } from "@/components/ui/button";
import { courseHref, learningModeLabels } from "@/lib/course-display";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

const ROTATE_MS = 4500;

export function FeaturedCourse({ courses }: { courses: Course[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /*
   * IMPORTANT:
   * Autoplay only makes sense when there are at least 2 courses.
   */
  const canRotate = courses.length > 1;

  /*
   * Automatic rotation
   */
  useEffect(() => {
    if (!canRotate || paused) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= courses.length - 1) {
          return 0;
        }

        return prevIndex + 1;
      });
    }, ROTATE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentIndex, canRotate, paused, courses.length]);

  /*
   * If courses change dynamically and current index
   * becomes invalid, reset to first course.
   */
  useEffect(() => {
    if (currentIndex >= courses.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, courses.length]);

  const course = courses[currentIndex];

  if (!course) {
    return null;
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured courses"
      className="w-full"
    >
  <article
  key={course.id}
  aria-roledescription="slide"
  aria-label={`${currentIndex + 1} of ${courses.length}`}
  className="featured-course-enter overflow-hidden rounded-2xl border bg-card shadow-card-hover"
>
        {/* Thumbnail */}
       <div className="group relative overflow-hidden">
          <CourseThumbnail
            course={course}
            decorative
            priority
            sizes="(min-width: 1024px) 440px, 100vw"
          />

          <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs font-medium text-navy shadow-card">
            <Star
              aria-hidden
              className="size-3.5 fill-window-yellow text-window-yellow"
            />
            Featured course
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs font-medium text-blue-text">
            {course.category.name}
          </p>

          <h2 className="mt-2 text-xl font-semibold text-foreground">
            {course.name}
          </h2>

          <p className="mt-2 line-clamp-2 min-h-[2lh] text-sm leading-relaxed text-muted-foreground">
            {course.short_description}
          </p>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
            <CoursePrice course={course} />

            <Link
              href={courseHref(course.slug)}
              className={cn(
                buttonVariants({ size: "lg" }),
                "px-4"
              )}
            >
              View course
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Link>
          </div>
        </div>
      </article>

      {/* Controls */}
      {canRotate && (
        <div className="mt-4 flex items-center justify-center gap-1">
          {courses.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show ${item.name}`}
              aria-current={index === currentIndex}
              className="group/dot flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-5 bg-navy"
                    : "w-1.5 bg-navy/25 group-hover/dot:bg-navy/50"
                )}
              />
            </button>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setPaused((prev) => !prev)}
            aria-label={
              paused
                ? "Resume rotating featured courses"
                : "Pause rotating featured courses"
            }
            className="ml-1 text-muted-foreground"
          >
            {paused ? <Play /> : <Pause />}
          </Button>
        </div>
      )}
    </section>
  );
}