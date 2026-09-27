import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Container } from "@/components/layout/Container";

const techIcons = [
  {
    src: "/svgs/react-svgrepo-com.svg",
    className: "left-[3%] top-[18%] w-12 sm:w-14 lg:left-[5%] lg:w-16",
    delay: "-2s",
    duration: "16s",
    tilt: "8deg",
    x: "14px",
    y: "-12px",
  },
  {
    src: "/svgs/docker-svgrepo-com.svg",
    className: "left-[16%] top-[8%] hidden w-11 sm:block lg:w-14",
    delay: "-8s",
    duration: "19s",
    tilt: "-7deg",
    x: "-12px",
    y: "14px",
  },
  {
    src: "/svgs/python-svgrepo-com.svg",
    className: "left-[28%] bottom-[10%] w-10 sm:w-12 lg:w-14",
    delay: "-5s",
    duration: "17s",
    tilt: "-10deg",
    x: "10px",
    y: "-15px",
  },
  {
    src: "/svgs/postgresql-svgrepo-com.svg",
    className: "left-[40%] top-[9%] hidden w-10 md:block lg:w-12",
    delay: "-11s",
    duration: "20s",
    tilt: "7deg",
    x: "-10px",
    y: "-10px",
  },
  {
    src: "/svgs/nodejs-icon-svgrepo-com.svg",
    className: "left-[51%] bottom-[9%] w-10 sm:w-12",
    delay: "-4s",
    duration: "18s",
    tilt: "-8deg",
    x: "12px",
    y: "-12px",
  },
  {
    src: "/svgs/figma-svgrepo-com%20(1).svg",
    className: "right-[34%] top-[8%] hidden w-10 md:block lg:w-12",
    delay: "-9s",
    duration: "15s",
    tilt: "11deg",
    x: "-10px",
    y: "14px",
  },
  {
    src: "/svgs/linux-svgrepo-com.svg",
    className: "right-[20%] bottom-[11%] hidden w-10 sm:block lg:w-12",
    delay: "-6s",
    duration: "18s",
    tilt: "-7deg",
    x: "11px",
    y: "12px",
  },
  {
    src: "/svgs/photoshop-svgrepo-com.svg",
    className: "right-[6%] top-[17%] w-10 sm:w-12 lg:w-14",
    delay: "-12s",
    duration: "16s",
    tilt: "9deg",
    x: "-12px",
    y: "-14px",
  },
];

interface CoursesHeaderProps {
  children?: ReactNode;
}

export function CoursesHeader({ children }: CoursesHeaderProps) {
  return (
    <section
      aria-labelledby="courses-heading"
      className="courses-header relative isolate overflow-hidden border-b"
    >
      {/* Background grid */}
      <div
        aria-hidden
        className="courses-header-grid pointer-events-none absolute inset-0"
      />

      {/* Soft gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/2 size-80 -translate-y-1/2 rounded-full bg-sky/10 blur-3xl"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 size-96 rounded-full bg-blue/10 blur-3xl"
      />

      {/* Decorative technology icons */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {techIcons.map((icon, index) => (
          <span
            key={icon.src}
            className={`courses-header-tech ${icon.className}`}
            style={
              {
                "--courses-icon-delay": `${index * 80}ms`,
                "--courses-icon-duration": icon.duration,
                "--courses-icon-start-delay": icon.delay,
                "--courses-icon-tilt": icon.tilt,
                "--courses-icon-x": icon.x,
                "--courses-icon-y": icon.y,
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

      {/* Content */}
      <Container className="relative z-10 py-10 sm:py-14 lg:py-16">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-navy"
              >
                Home
              </Link>
            </li>

            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>

            <li
              aria-current="page"
              className="font-medium text-foreground"
            >
              Courses
            </li>
          </ol>
        </nav>

        <div className="mt-5 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-sm font-medium text-navy-soft shadow-sm backdrop-blur-sm">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-green"
            />
            Learn. Build. Grow.
          </span>

          <h1
            id="courses-heading"
            className="mt-4 text-3xl leading-tight font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Explore Our Courses
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Discover practical courses designed to help you build
            real-world technology skills.
          </p>

          {children && (
            <div className="mt-8 max-w-2xl">
              {children}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}