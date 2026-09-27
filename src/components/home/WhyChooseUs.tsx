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
    <div aria-hidden className="rounded-xl bg-navy-deep p-4 shadow-card-hover">
      <div className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-window-red" />
        <span className="size-2.5 rounded-full bg-window-yellow" />
        <span className="size-2.5 rounded-full bg-window-green" />
      </div>
      <pre className="mt-4 overflow-hidden font-mono text-[11px] leading-5 text-white/75">
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
        {/* Editorial image composition: one tall image, a code window and a smaller image. */}
        <div className="grid h-95 grid-cols-[3fr_2fr] gap-4 sm:h-130">
          <div className="relative overflow-hidden rounded-2xl bg-surface-gray">
            <Image
              src={images.primary.src}
              alt={images.primary.alt}
              fill
              sizes="(min-width: 1024px) 340px, 60vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="hidden sm:block">
              <CodeWindow />
            </div>
            <div className="relative flex-1 overflow-hidden rounded-2xl bg-surface-gray">
              <Image
                src={images.secondary.src}
                alt={images.secondary.alt}
                fill
                sizes="(min-width: 1024px) 230px, 40vw"
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
