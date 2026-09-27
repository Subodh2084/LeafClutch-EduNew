import { createElement } from "react";

import { aboutIcons } from "@/components/about/about-icons";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { cn } from "@/lib/utils";
import type { AboutContent } from "@/types/about";

export function AboutVisionMission({ content }: { content: AboutContent["visionMission"] }) {
  const { items, ...intro } = content;
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="vision-heading" className="py-16 sm:py-24">
      <Container>
        <SectionHeading id="vision-heading" {...intro} />
        <div className="mt-12 grid grid-cols-1 overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-2">
          {items.map((item, i) => (
            <div key={item.id} className={cn("p-6 sm:p-10", i > 0 && "border-t md:border-t-0 md:border-l")}>
              <span className="flex size-11 items-center justify-center rounded-xl bg-surface-blue text-navy">
                {createElement(aboutIcons[item.icon], { "aria-hidden": true, className: "size-5" })}
              </span>
              <h3 className="mt-5 text-base font-semibold text-blue-text">{item.title}</h3>
              <p className="mt-2 max-w-prose text-xl leading-relaxed font-medium text-foreground sm:text-2xl sm:leading-snug">
                {item.statement}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
