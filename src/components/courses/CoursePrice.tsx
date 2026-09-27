import { formatPrice, getCoursePricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

interface CoursePriceProps {
  course: Pick<Course, "actual_price" | "discount_price">;
  size?: "default" | "lg";
  className?: string;
}

export function CoursePrice({ course, size = "default", className }: CoursePriceProps) {
  const { current, original } = getCoursePricing(course);

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span
        className={cn(
          "font-semibold text-navy tabular-nums",
          size === "lg" ? "text-3xl" : "text-lg",
        )}
      >
        <span className="sr-only">Price: </span>
        {formatPrice(current)}
      </span>
      {original != null && (
        <s
          className={cn(
            "text-muted-foreground tabular-nums",
            size === "lg" ? "text-base" : "text-sm",
          )}
        >
          <span className="sr-only">Original price: </span>
          {formatPrice(original)}
        </s>
      )}
    </p>
  );
}
