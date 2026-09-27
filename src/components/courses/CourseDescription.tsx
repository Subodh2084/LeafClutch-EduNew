import { CourseDetailSection } from "@/components/courses/CourseDetailSection";

export function CourseDescription({ description }: { description: string }) {
  const paragraphs = description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <CourseDetailSection id="about" title="About This Course">
      <div className="max-w-prose space-y-4 text-base leading-relaxed text-foreground/85">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </CourseDetailSection>
  );
}
