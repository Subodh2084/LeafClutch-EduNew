import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { TrainingPageData } from "@/types/training";

/** Numbered steps: a vertical timeline on mobile, a single row on desktop. */
export function TrainingProcess({ data }: { data: TrainingPageData["process"] }) {
  if (data.steps.length === 0) return null;

  return (
    <section aria-labelledby="training-process-heading" className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          id="training-process-heading"
          eyebrow="How it works"
          title={data.title}
          description={data.description}
        />

        <ol className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-8">
          {data.steps.map((step, i) => (
            <li key={step.number} className="relative flex gap-5 lg:flex-col lg:gap-6">
              {i < data.steps.length - 1 && (
                <>
                  <span
                    aria-hidden
                    className="absolute top-14 left-5.5 h-[calc(100%-1.75rem)] w-px bg-navy/15 lg:hidden"
                  />
                  <span
                    aria-hidden
                    className="absolute top-5.5 left-14 hidden h-px w-[calc(100%-2.25rem)] bg-navy/15 lg:block"
                  />
                </>
              )}
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-navy text-sm font-semibold text-white tabular-nums"
              >
                {step.number}
              </span>
              <div className="pt-2 lg:pt-0">
                <h3 className="text-lg leading-snug font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
