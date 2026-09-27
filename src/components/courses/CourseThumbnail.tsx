import Image from "next/image";

import { CategoryIcon } from "@/components/courses/CategoryIcon";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

interface CourseThumbnailProps {
  course: Pick<Course, "name" | "thumbnail" | "category">;
  sizes: string;
  priority?: boolean;
  /** Set when the course name is already visible next to the image. */
  decorative?: boolean;
  className?: string;
}

export function CourseThumbnail({
  course,
  sizes,
  priority,
  decorative,
  className,
}: CourseThumbnailProps) {
  const frame = cn("relative aspect-[16/10] overflow-hidden", className);

  if (course.thumbnail) {
    return (
      <div className={cn(frame, "bg-surface-gray")}>
        <Image
          src={course.thumbnail}
          alt={decorative ? "" : `${course.name} course`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  // Branded fallback so a missing thumbnail never leaves a broken image.
  return (
    <div
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : `${course.name} course`}
      aria-hidden={decorative || undefined}
      className={cn(
        frame,
        "border-b bg-surface-blue bg-[linear-gradient(to_right,rgb(6_33_101/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(6_33_101/0.05)_1px,transparent_1px)] bg-size-[28px_28px]",
      )}
    >
      <CategoryIcon
        slug={course.category.slug}
        strokeWidth={1}
        className="absolute -right-6 -bottom-8 size-44 text-navy/[0.07] transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute top-5 left-5 flex size-11 items-center justify-center rounded-lg border bg-white shadow-card">
        <CategoryIcon slug={course.category.slug} className="size-5 text-navy" />
      </div>
    </div>
  );
}
