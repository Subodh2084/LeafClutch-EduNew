import { CourseDetailSection } from "@/components/courses/CourseDetailSection";
import { toolIcons } from "@/components/courses/tool-icons";
import type { CourseTool } from "@/types/course";

export function CourseTools({ tools }: { tools: CourseTool[] }) {
  // No tools listed yet: leave the section out rather than show an empty frame.
  if (tools.length === 0) return null;

  return (
    <CourseDetailSection id="tools" title="Tools Covered">
      <ul className="grid grid-cols-1 gap-x-6 gap-y-5 min-[420px]:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon ? toolIcons[tool.icon] : undefined;
          return (
            <li key={tool.id} className="flex min-w-0 items-center gap-3.5">
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-white text-navy shadow-card"
              >
                {Icon ? (
                  <Icon className="size-5.5" />
                ) : (
                  <span className="text-base font-semibold">{tool.name.charAt(0).toUpperCase()}</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block font-medium wrap-break-word text-foreground">{tool.name}</span>
                {tool.description && (
                  <span className="block text-sm wrap-break-word text-muted-foreground">
                    {tool.description}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </CourseDetailSection>
  );
}
