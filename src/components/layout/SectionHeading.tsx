import { cn } from "@/lib/utils";
interface SectionHeadingProps {
  /** Used by the section's aria-labelledby. */
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="text-lg p-1 border-l-3 border-sky font-bold text-blue-text">{eyebrow}</p>}
      <h2
        id={id}
        className="mt-2 text-3xl leading-tight font-semibold text-foreground sm:text-4xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
