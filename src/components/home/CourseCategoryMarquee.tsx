import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { coursesHref } from "@/lib/course-display";
import type { CourseNavGroup } from "@/types/course";

function CourseCategoryItem({
  group,
  hidden = false,
}: {
  group: CourseNavGroup;
  hidden?: boolean;
}) {
  const { category } = group;

  return (
    <li className="shrink-0">
      <Link
        href={coursesHref({ category: category.slug })}
        tabIndex={hidden ? -1 : undefined}
        aria-hidden={hidden}
        className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
      >
        <Image
          src={
            category.image_url ||
            `/course-categories/${category.slug}.webp`
          }
          alt={hidden ? "" : category.name}
          width={80}
          height={80}
          quality={90}
          sizes="80px"
          className="size-16 object-contain transition-transform duration-300 ease-out group-hover:scale-110 sm:size-20"
        />
      </Link>
    </li>
  );
}

export function CourseCategoryMarquee({
  groups,
}: {
  groups: CourseNavGroup[];
}) {
  if (groups.length === 0) return null;

  return (
    <section
      aria-labelledby="categories-heading"
      className="course-category-section border-b border-border py-10 sm:py-12"
    >
      <Container>
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="categories-heading"
            className="text-sm font-semibold text-leaf-text"
          >
            Explore by category
          </h2>

          <Link
            href="/courses"
            className="text-sm font-medium text-leaf-navy transition-colors hover:text-leaf-green-dark"
          >
            View all courses
          </Link>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-14 bg-linear-to-r from-[#f8fbff] to-transparent" />

          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-14 bg-linear-to-l from-[#f8fbff] to-transparent" />

          <div className="group/marquee overflow-hidden">
            <div className="flex w-max animate-marquee group-hover/marquee:paused group-focus-within/marquee:paused motion-reduce:animate-none">
              <ul className="flex shrink-0 items-center gap-8 pr-8 sm:gap-10 sm:pr-10">
                {groups.map((group) => (
                  <CourseCategoryItem
                    key={`first-${group.category.id}`}
                    group={group}
                  />
                ))}
              </ul>

              <ul
                aria-hidden="true"
                className="flex shrink-0 items-center gap-8 pr-8 sm:gap-10 sm:pr-10"
              >
                {groups.map((group) => (
                  <CourseCategoryItem
                    key={`second-${group.category.id}`}
                    group={group}
                    hidden
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}