import { cn } from "@/lib/utils";

interface CourseDetailSectionProps {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Extra controls aligned with the heading, e.g. a download link. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Shared frame for every section in the course detail main column. */
export function CourseDetailSection({
  id,
  title,
  description,
  action,
  className,
  children,
}: CourseDetailSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("scroll-mt-24", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id={headingId} className="text-2xl font-semibold text-foreground sm:text-[1.75rem]">
            {title}
          </h2>
          {description && <p className="mt-2 text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
