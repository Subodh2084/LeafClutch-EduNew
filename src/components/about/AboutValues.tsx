import { createElement } from "react";

import { aboutIcons } from "@/components/about/about-icons";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { AboutValue, SectionIntro } from "@/types/about";

interface AboutValuesProps {
  intro: SectionIntro;
  values: AboutValue[];
}

export function AboutValues({ intro, values }: AboutValuesProps) {
  if (values.length === 0) return null;

  return (
    <section aria-labelledby="values-heading" className="border-y bg-surface-blue/50 py-16 sm:py-24">
      <Container>
        <SectionHeading id="values-heading" {...intro} />
        <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <li key={value.id} className="border-r border-navy/15 pr-6">
              {createElement(aboutIcons[value.icon], {
                "aria-hidden": true,
                className: "size-6 text-blue",
              })}
              <h3 className="mt-4 text-lg font-semibold text-foreground">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
