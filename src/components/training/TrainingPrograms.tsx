import { createElement } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { trainingIcons } from "@/components/training/training-icons";
import { siteConfig } from "@/config/site";
import type { TrainingPageData, TrainingProgram } from "@/types/training";

function ProgramCard({ program }: { program: TrainingProgram }) {
  return (
    <div className="h-full rounded-xl border bg-white p-6 shadow-card">
      <span className="flex size-11 items-center justify-center rounded-lg bg-navy">
        {createElement(trainingIcons[program.icon], {
          "aria-hidden": true,
          className: "size-5 text-white",
        })}
      </span>
      <h3 className="mt-5 text-lg leading-snug font-semibold text-foreground">{program.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{program.description}</p>
    </div>
  );
}

export function TrainingPrograms({ data }: { data: TrainingPageData["programs"] }) {
  if (data.items.length === 0) return null;

  return (
    <section
      aria-labelledby="training-programs-heading"
      className="border-y bg-surface-blue/50 py-16 sm:py-24"
    >
      <Container>
        <SectionHeading
          id="training-programs-heading"
          eyebrow="Training programs"
          title={data.title}
          description={data.description}
        />

        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((program) => (
            <li key={program.id}>
              <ProgramCard program={program} />
            </li>
          ))}
        </ul>

        <p className="mt-10 flex flex-col gap-2 text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
          Need a different focus? Every program can be adapted.
          <Link
            href={siteConfig.nav.contact}
            className="inline-flex items-center gap-1.5 font-medium text-navy underline-offset-4 hover:underline"
          >
            Discuss a custom program
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </p>
      </Container>
    </section>
  );
}
