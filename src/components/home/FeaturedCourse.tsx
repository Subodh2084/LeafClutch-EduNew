"use client";

import Link from "next/link";
import { useRef, useState, type FocusEvent } from "react";
import { ArrowRight, Clock, MonitorPlay, Pause, Play, Star } from "lucide-react";
import type { Swiper as SwiperClass } from "swiper";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { CoursePrice } from "@/components/courses/CoursePrice";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { Button, buttonVariants } from "@/components/ui/button";
import { courseHref, learningModeLabels } from "@/lib/course-display";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

import "swiper/css";
import "swiper/css/a11y";
import "swiper/css/pagination";

const AUTOPLAY_DELAY = 5000;
// The dots live below the slides, outside the Swiper element. Passing `el` as a
// selector stops swiper/react from rendering its own pagination inside.
const PAGINATION_CLASS = "featured-course-pagination";

export function FeaturedCourse({ courses }: { courses: Course[] }) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [paused, setPaused] = useState(false);

  if (courses.length === 0) return null;
  const canRotate = courses.length > 1;

  function togglePlayback() {
    const autoplay = swiperRef.current?.autoplay;
    if (!autoplay) return;
    if (paused) autoplay.start();
    else autoplay.stop();
    setPaused(!paused);
  }

  // Keyboard users get a still carousel while they are inside it. Mouse
  // clicks don't match :focus-visible, and hover already pauses autoplay.
  function handleFocus(event: FocusEvent<HTMLElement>) {
    if (!paused && event.target.matches(":focus-visible")) swiperRef.current?.autoplay?.stop();
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    const autoplay = swiperRef.current?.autoplay;
    if (!paused && autoplay && !autoplay.running) autoplay.start();
  }

  return (
    <section
      aria-label="Featured courses"
      className="w-full min-w-0"
      onFocus={canRotate ? handleFocus : undefined}
      onBlur={canRotate ? handleBlur : undefined}
    >
      <Swiper
        modules={[A11y, Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={40}
        speed={600}
        loop={canRotate}
        autoplay={
          canRotate && {
            delay: AUTOPLAY_DELAY,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }
        }
        pagination={
          canRotate && {
            el: `.${PAGINATION_CLASS}`,
            clickable: true,
            bulletClass: "featured-course-bullet",
            bulletActiveClass: "is-active",
          }
        }
        a11y={{
          containerRoleDescriptionMessage: "carousel",
          itemRoleDescriptionMessage: "slide",
          // Each slide is labelled below with the real position.
          slideLabelMessage: "",
          paginationBulletMessage: "Show featured course {{index}}",
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          if (canRotate && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            swiper.autoplay.stop();
            setPaused(true);
          }
        }}
        // The padding (offset by negative margins) keeps the card shadow from being clipped.
        // swiper/css is unlayered, so these need ! to beat its .swiper margin/padding.
        className="-mx-4! -mt-2! -mb-8! px-4! pt-2! pb-8!"
      >
        {courses.map((course, index) => (
          <SwiperSlide
            key={course.id}
            aria-label={`${index + 1} of ${courses.length}`}
            className="h-auto!"
          >
            <FeaturedCourseCard course={course} priority={index === 0} />
          </SwiperSlide>
        ))}
      </Swiper>

      {canRotate && (
        <div className="mt-4 flex items-center justify-center gap-1">
          <div className={cn(PAGINATION_CLASS, "flex w-auto! items-center")} />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={togglePlayback}
            aria-label={paused ? "Resume rotating featured courses" : "Pause rotating featured courses"}
            className="ml-1 text-muted-foreground"
          >
            {paused ? <Play /> : <Pause />}
          </Button>
        </div>
      )}
    </section>
  );
}

function FeaturedCourseCard({ course, priority }: { course: Course; priority: boolean }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card-hover">
      <div className="relative">
        <CourseThumbnail
          course={course}
          decorative
          priority={priority}
          sizes="(min-width: 1024px) 440px, 100vw"
        />
        <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs font-medium text-navy shadow-card">
          <Star aria-hidden className="size-3.5 fill-window-yellow text-window-yellow" />
          Featured course
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-medium text-blue-text">{course.category.name}</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">{course.name}</h2>
        <p className="mt-2 line-clamp-2 min-h-[2lh] text-sm leading-relaxed text-muted-foreground">
          {course.short_description}
        </p>

        <ul className="mt-4 mb-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t pt-5">
          <CoursePrice course={course} />
          <Link href={courseHref(course.slug)} className={cn(buttonVariants({ size: "lg" }), "px-4")}>
            View course
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
