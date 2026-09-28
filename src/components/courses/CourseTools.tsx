import { CourseDetailSection } from "@/components/courses/CourseDetailSection";
import type { CourseTool } from "@/types/course";

export function CourseTools({ tools }: { tools: CourseTool[] }) {
  // No tools listed yet: leave the section out rather than show an empty frame.
  if (tools.length === 0) return null;

  return (
    <CourseDetailSection id="tools" title="Tools Covered">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tools.map((tool) => (
          <li key={tool.id} className="min-w-0 rounded-lg border bg-surface-blue/60 px-4 py-3">
            <span className="block font-semibold wrap-break-word text-navy">{tool.name}</span>
            {tool.description && (
              <span className="mt-0.5 block text-sm leading-snug wrap-break-word text-muted-foreground">
                {tool.description}
              </span>
            )}
          </li>
        ))}
      </ul>
    </CourseDetailSection>
  );
}
