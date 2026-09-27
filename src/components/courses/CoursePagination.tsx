import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { coursesHref } from "@/lib/course-display";
import { cn } from "@/lib/utils";

interface CoursePaginationProps {
  page: number;
  totalPages: number;
  category: string;
  search: string;
}

const itemClass =
  "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function CoursePagination({ page, totalPages, category, search }: CoursePaginationProps) {
  if (totalPages <= 1) return null;
  // Unavailable Previous/Next are rendered invisible (not dimmed) so the row stays centred
  // without low-contrast text.

  const href = (target: number) => coursesHref({ category, search, page: target });
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Course pages" className="flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(itemClass, "bg-white hover:border-surface-blue-strong hover:text-navy")}>
          <ChevronLeft aria-hidden className="size-4" />
          <span>Previous</span>
        </Link>
      ) : (
        <span aria-hidden className={cn(itemClass, "invisible")}>
          <ChevronLeft className="size-4" />
          Previous
        </span>
      )}

      <ul className="hidden items-center gap-2 sm:flex">
        {pages.map((n) => (
          <li key={n}>
            <Link
              href={href(n)}
              aria-current={n === page ? "page" : undefined}
              aria-label={`Page ${n}`}
              className={cn(
                itemClass,
                n === page
                  ? "border-navy bg-navy text-primary-foreground"
                  : "bg-white hover:border-surface-blue-strong hover:text-navy",
              )}
            >
              {n}
            </Link>
          </li>
        ))}
      </ul>
      <p className="px-2 text-sm text-muted-foreground sm:hidden">
        Page {page} of {totalPages}
      </p>

      {page < totalPages ? (
        <Link href={href(page + 1)} className={cn(itemClass, "bg-white hover:border-surface-blue-strong hover:text-navy")}>
          <span>Next</span>
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : (
        <span aria-hidden className={cn(itemClass, "invisible")}>
          Next
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
