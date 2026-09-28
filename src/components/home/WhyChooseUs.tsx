import Image from "next/image";
import { createElement } from "react";

import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { featureIcons } from "@/components/shared/feature-icons";
import type { Feature } from "@/types/content";

interface WhyChooseUsProps {
  features: Feature[];
  images: {
    primary: { src: string; alt: string };
    secondary: { src: string; alt: string };
  };
}

/** Decorative code window using the palette's window-chrome colours. */
function CodeWindow() {
  return (
    <div aria-hidden className="flex h-full flex-col justify-between rounded-xl bg-navy-deep p-3 sm:p-4 shadow-card-hover">
      <div className="flex gap-1.5">
        <span className="size-2 sm:size-2.5 rounded-full bg-window-red" />
        <span className="size-2 sm:size-2.5 rounded-full bg-window-yellow" />
        <span className="size-2 sm:size-2.5 rounded-full bg-window-green" />
      </div>
      <pre className="mt-2.5 overflow-hidden font-mono text-[9.5px] xs:text-[10px] leading-4 sm:mt-4 sm:text-[11px] sm:leading-5 text-white/75">
        <code>
          <span className="text-sky">const</span> project = <span className="text-teal">build</span>({"{"}
          {"\n  "}skills: [<span className="text-blue-light">&quot;react&quot;</span>,{" "}
          <span className="text-blue-light">&quot;ai&quot;</span>],
          {"\n  "}mentor: <span className="text-window-green">true</span>,{"\n"}
          {"}"});
          {"\n\n"}
          <span className="text-sky">await</span> project.<span className="text-teal">ship</span>();
        </code>
      </pre>
    </div>
  );
}

export function WhyChooseUs({ features, images }: WhyChooseUsProps) {
  return (
    <section aria-labelledby="why-heading" className="border-y bg-surface-blue/50 py-16 sm:py-24">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Editorial image composition: primary image, code window and secondary image. */}
        <div className="grid grid-cols-1 gap-3.5 sm:h-130 sm:grid-cols-[3fr_2fr] sm:gap-4">
          <div className="relative h-48 xs:h-56 sm:h-full overflow-hidden rounded-2xl bg-surface-gray">
            <Image
              src={images.primary.src}
              alt={images.primary.alt}
              fill
              sizes="(min-width: 1024px) 340px, (min-width: 640px) 60vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:flex sm:flex-col sm:gap-4">
            <div className="flex-1">
              <CodeWindow />
            </div>
            <div className="relative min-h-[130px] flex-1 overflow-hidden rounded-2xl bg-surface-gray sm:min-h-0">
              <Image
                src={images.secondary.src}
                alt={images.secondary.alt}
                fill
                sizes="(min-width: 1024px) 230px, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div>
          <SectionHeading
            id="why-heading"
            eyebrow="Why LeafClutch"
            title="Learning built around real work"
            description="We teach the way the industry works: small groups, practical projects and mentors who have shipped what they teach."
          />
          <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.id}>
                <span className="flex size-10 items-center justify-center rounded-lg border bg-white shadow-card">
                  {createElement(featureIcons[feature.icon], {
                    "aria-hidden": true,
                    className: "size-5 text-navy",
                  })}
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
