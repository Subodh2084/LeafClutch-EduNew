interface CourseResultsHeaderProps {
  total: number;
  from: number;
  to: number;
  children?: React.ReactNode;
}

export function CourseResultsHeader({ total, from, to, children }: CourseResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div role="status">
        <h2 className="text-lg font-semibold text-foreground">
          {total} {total === 1 ? "Course" : "Courses"} Found
        </h2>
        {total > to - from + 1 && (
          <p className="text-sm text-muted-foreground">
            Showing {from}–{to}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
