import { FileDown } from "lucide-react";

import { CourseDetailSection } from "@/components/courses/CourseDetailSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CourseModuleWithLessons } from "@/types/course";

interface CourseCurriculumProps {
  modules: CourseModuleWithLessons[];
  pdfUrl: string | null;
}

export function CourseCurriculum({ modules, pdfUrl }: CourseCurriculumProps) {
  if (modules.length === 0 && !pdfUrl) return null;

  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  const download = pdfUrl ? (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "self-start px-4 sm:self-auto")}
    >
      <FileDown data-icon="inline-start" aria-hidden />
      Download Course Curriculum
      <span className="sr-only">(PDF, opens in a new tab)</span>
    </a>
  ) : null;

  return (
    <CourseDetailSection
      id="curriculum"
      title="Course Curriculum"
      description={
        modules.length > 0
          ? `${modules.length} modules${lessonCount > 0 ? ` · ${lessonCount} lessons` : ""}`
          : "The detailed module breakdown is available as a PDF."
      }
      action={download}
    >
      {modules.length > 0 && (
        <Accordion
          multiple
          defaultValue={[modules[0].id]}
          className="rounded-xl border bg-white px-5 sm:px-6"
        >
          {modules.map((module, index) => (
            <AccordionItem key={module.id} value={module.id}>
              <AccordionTrigger className="gap-4 py-5 text-base hover:no-underline">
                <span className="flex flex-1 items-baseline gap-4">
                  <span className="font-mono text-sm text-blue-text tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">{module.title}</span>
                  {module.lessons.length > 0 && (
                    <span className="hidden text-sm font-normal text-muted-foreground sm:inline">
                      {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-5 pl-9 text-[0.9375rem]">
                {module.description && (
                  <p className="text-muted-foreground">{module.description}</p>
                )}
                {module.lessons.length > 0 && (
                  <ol className="space-y-2.5">
                    {module.lessons.map((lesson, i) => (
                      <li key={lesson.id} className="flex gap-3">
                        <span className="w-5 shrink-0 text-right text-muted-foreground tabular-nums">
                          {i + 1}.
                        </span>
                        <span>
                          <span className="text-foreground">{lesson.title}</span>
                          {lesson.description && (
                            <span className="mt-0.5 block text-sm text-muted-foreground">
                              {lesson.description}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </CourseDetailSection>
  );
}
