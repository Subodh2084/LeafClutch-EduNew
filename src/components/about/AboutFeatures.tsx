import { createElement } from "react";

import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { featureIcons } from "@/components/shared/feature-icons";
import type { SectionIntro } from "@/types/about";
import type { Feature } from "@/types/content";

interface AboutFeaturesProps {
  intro: SectionIntro;
  features: Feature[];
}

export function AboutFeatures({ intro, features }: AboutFeaturesProps) {
  if (features.length === 0) return null;

  return (
    <section aria-labelledby="features-heading" className="border-y bg-surface-blue/50 py-16 sm:py-24">
      <Container>
        <SectionHeading id="features-heading" {...intro} />
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li key={feature.id} className="rounded-xl border bg-white p-6 shadow-card">
              <span className="flex size-10 items-center justify-center rounded-lg bg-surface-blue">
                {createElement(featureIcons[feature.icon], {
                  "aria-hidden": true,
                  className: "size-5 text-navy",
                })}
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
