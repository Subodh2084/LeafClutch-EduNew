import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CourseSearch } from "@/components/courses/CourseSearch";
import { FeaturedCourse } from "@/components/home/FeaturedCourse";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { coursesHref } from "@/lib/course-display";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

const suggestedSearches = ["AI", "React", "Data", "Design"];

/*
 * Technology logos floating behind the hero.
 * Positions are intentionally kept away from the main text
 * and featured course card.
 */
const techIcons = [
  {
    src: "/svgs/react-svgrepo-com.svg",
    className:
      "right-[6%] top-[1.5%] w-11 sm:w-14 lg:right-auto lg:left-[40%] lg:top-[3%] xl:left-[calc(50%_-_40px)] xl:top-[9%] xl:w-16",
    duration: "14s",
    delay: "-3s",
    tilt: "10deg",
    driftX: "12px",
    driftY: "-18px",
  },
  {
    src: "/svgs/docker-svgrepo-com.svg",
    className:
      "hidden sm:block right-[20%] top-[2%] w-12 lg:right-[3%] lg:top-[1.5%] lg:w-14",
    duration: "17s",
    delay: "-8s",
    tilt: "-6deg",
    driftX: "-14px",
    driftY: "14px",
  },
  {
    src: "/svgs/python-svgrepo-com.svg",
    className:
      "bottom-[1.5%] left-[5%] w-10 sm:w-12 lg:bottom-[3%] lg:left-[3%]",
    duration: "15s",
    delay: "-6s",
    tilt: "-8deg",
    driftX: "10px",
    driftY: "-16px",
  },
  {
    src: "/svgs/postgresql-svgrepo-com.svg",
    className:
      "bottom-[1.5%] right-[6%] w-10 sm:w-12 lg:bottom-[3%] lg:right-[5%]",
    duration: "19s",
    delay: "-11s",
    tilt: "7deg",
    driftX: "-12px",
    driftY: "-14px",
  },
  {
    src: "/svgs/nodejs-icon-svgrepo-com.svg",
    className:
      "hidden lg:block bottom-[7%] left-[50%] w-12",
    duration: "16s",
    delay: "-2s",
    tilt: "-9deg",
    driftX: "14px",
    driftY: "-12px",
  },
  {
    src: "/svgs/figma-svgrepo-com%20(1).svg",
    className:
      "hidden lg:block top-[46%] left-[55%] w-10",
    duration: "13s",
    delay: "-9s",
    tilt: "12deg",
    driftX: "-10px",
    driftY: "16px",
  },
  {
    src: "/svgs/linux-svgrepo-com.svg",
    className:
      "hidden md:block top-[2.5%] left-[30%] w-10 lg:top-[4%] lg:w-11",
    duration: "18s",
    delay: "-5s",
    tilt: "-7deg",
    driftX: "12px",
    driftY: "12px",
  },
  {
    src: "/svgs/photoshop-svgrepo-com.svg",
    className:
      "hidden 2xl:block top-[44%] right-[1.5%] w-10",
    duration: "15s",
    delay: "-12s",
    tilt: "8deg",
    driftX: "-8px",
    driftY: "-18px",
  },
];

interface HeroProps {
  courses: Course[];
  featuredCourses: Course[];
}

export function Hero({ courses, featuredCourses }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-section relative overflow-hidden border-b"
    >
      {/* Subtle technical grid */}
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />

      {/* Floating technology logos */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {techIcons.map((icon, index) => (
          <span
            key={icon.src}
            className={cn("hero-tech-icon", icon.className)}
            style={
              {
                "--hero-icon-enter-delay": `${index * 90}ms`,
                "--hero-icon-duration": icon.duration,
                "--hero-icon-delay": icon.delay,
                "--hero-icon-tilt": icon.tilt,
                "--hero-icon-drift-x": icon.driftX,
                "--hero-icon-drift-y": icon.driftY,
              } as CSSProperties
            }
          >
            <Image
              src={icon.src}
              alt=""
              width={64}
              height={64}
              unoptimized
            />
          </span>
        ))}
      </div>

      <Container className="relative grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16 lg:py-24">
        {/* Hero content */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/85 px-3 py-1 text-sm font-medium text-navy-soft shadow-sm backdrop-blur-sm">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-green"
            />
            Practical technology training
          </p>

          <h1
            id="hero-heading"
            className="mt-6 text-[2.5rem] leading-[1.06] font-extrabold text-foreground sm:text-5xl lg:text-[3.5rem]"
          >
            Learn{" "}
            <span className="font-bold text-sky">
              skills.
            </span>
            <br />
            Build projects.
            <br />
            <span className="font-extrabold text-navy">
              Shape your future.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Hands-on courses in web development, AI, data science,
            design and more — taught by people who do this work every
            day, and built around projects you can show.
          </p>

          <CourseSearch
            courses={courses}
            className="mt-8 max-w-xl"
          />

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href="/courses"
              className={cn(
                buttonVariants({ size: "xl" }),
                "w-full sm:w-auto",
              )}
            >
              Explore all courses
              <ArrowRight
                data-icon="inline-end"
                aria-hidden
              />
            </Link>

            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>Popular:</span>

              {suggestedSearches.map((term) => (
                <Link
                  key={term}
                  href={coursesHref({ search: term })}
                  className="font-medium text-navy-soft underline decoration-border underline-offset-4 transition-colors hover:text-navy hover:decoration-navy"
                >
                  {term}
                </Link>
              ))}
            </p>
          </div>
        </div>

        {/* Featured course */}
        <FeaturedCourse courses={featuredCourses} />
      </Container>
    </section>
  );
}