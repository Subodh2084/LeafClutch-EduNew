import {
  CourseCategoryList,
  type CategoryOption,
} from "@/components/courses/CourseCategoryList";

interface CourseFilterSidebarProps {
  options: CategoryOption[];
  totalCount: number;
  activeCategory: string;
  search: string;
}

export function CourseFilterSidebar(props: CourseFilterSidebarProps) {
  return (
    <aside aria-labelledby="category-filter-heading" className="sticky top-24">
      <h2
        id="category-filter-heading"
        className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Categories
      </h2>
      <nav aria-label="Course categories" className="mt-3">
        <CourseCategoryList {...props} />
      </nav>
    </aside>
  );
}
