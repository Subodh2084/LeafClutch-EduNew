import { HeroStats } from "@/components/home/HeroStats";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { AboutContent } from "@/types/about";
import type { StatItem } from "@/types/content";

interface AboutWhoWeAreProps {
  intro: AboutContent["whoWeAre"];
  stats: StatItem[];
}

export function AboutWhoWeAre({ intro, stats }: AboutWhoWeAreProps) {
  return (
    <section aria-labelledby="who-heading" className="py-16 sm:py-24">
      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading id="who-heading" eyebrow={intro.eyebrow} title={intro.title} />
          <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {intro.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <HeroStats stats={stats} variant="panel" />
      </Container>
    </section>
  );
}
