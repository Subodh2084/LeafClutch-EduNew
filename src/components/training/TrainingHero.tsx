import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { TrainingGallery } from "@/components/training/TrainingGallery";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TrainingPageData } from "@/types/training";

export function TrainingHero({ hero }: { hero: TrainingPageData["hero"] }) {
  return (
    <section
      aria-labelledby="training-heading"
      className="relative overflow-hidden border-b bg-surface-blue/50"
    >
      {/* Faint technical grid, fading out towards the copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(6_33_101/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(6_33_101/0.04)_1px,transparent_1px)] mask-[linear-gradient(to_left,black,transparent_75%)] bg-size-[44px_44px]"
      />

      <Container className="relative grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 lg:py-20">
        <div>
          <p className="border-l-3 border-sky p-1 text-lg font-medium text-blue-text">{hero.eyebrow}</p>
          <h1
            id="training-heading"
            className="mt-3 text-4xl leading-[1.1] font-bold text-foreground sm:text-5xl"
          >
            {hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {hero.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href={hero.ctaHref} className={cn(buttonVariants({ size: "xl" }), "w-full sm:w-auto")}>
              {hero.ctaLabel}
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Link>
            <Link
              href="#training-courses"
              className="py-2 text-center text-sm font-medium text-navy underline-offset-4 hover:underline"
            >
              See relevant courses
            </Link>
          </div>
        </div>

        <TrainingGallery images={hero.gallery} />
      </Container>
    </section>
  );
}
