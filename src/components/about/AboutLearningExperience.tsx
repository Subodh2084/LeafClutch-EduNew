import { createElement } from "react";

import { aboutIcons } from "@/components/about/about-icons";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { LearningStep, SectionIntro } from "@/types/about";

interface AboutLearningExperienceProps {
  intro: SectionIntro;
  steps: LearningStep[];
}

/** The Learn → Practice → Build → Grow path: vertical on mobile, a row on desktop. */
export function AboutLearningExperience({
  intro,
  steps,
}: AboutLearningExperienceProps) {
  if (steps.length === 0) return null;

  return (
    <section
      aria-labelledby="experience-heading"
      className="border-y bg-surface-blue/50 py-16 sm:py-24"
    >
      <Container className="flex flex-col justify-center">
        <SectionHeading id="experience-heading" {...intro} />

        <ol className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, i) => (
            <li
              key={step.id}
              className="relative flex gap-5 lg:flex-col lg:gap-0"
            >
              {/* Connector */}
              {i < steps.length - 1 && (
                <>
                  {/* Mobile: vertical connector */}
                  <span
                    aria-hidden
                    className="absolute left-6 top-12 h-[calc(100%+2rem)] w-px bg-navy/20 lg:hidden"
                  />
                  <span
                    aria-hidden
                    className="absolute left-12 top-6 hidden h-px w-[calc(100%+1.5rem)] bg-navy/20 lg:block"
                  />
                </>
              )}
              <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-navy text-white ring-4 ring-surface-blue">
                {createElement(aboutIcons[step.icon], {
                  "aria-hidden": true,
                  className: "size-5",
                })}
              </span>
              <div className="pt-1 lg:pt-5">
                <h3 className="text-lg font-semibold text-foreground">
                  {step.title}
                </h3>

                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
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