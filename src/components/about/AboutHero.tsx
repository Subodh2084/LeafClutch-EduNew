import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AboutContent } from "@/types/about";

export function AboutHero({ hero }: { hero: AboutContent["hero"] }) {
  return (
    <section aria-labelledby="about-heading" className="border-b bg-surface-blue/50">
      <Container className="grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          {hero.eyebrow && (
            <p className="border-l-3 border-sky p-1 text-lg font-medium text-blue-text">{hero.eyebrow}</p>
          )}
          <h1
            id="about-heading"
            className="mt-3 text-4xl leading-[1.1] font-bold text-foreground sm:text-5xl"
          >
            {hero.title}
          </h1>
          {hero.description && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {hero.description}
            </p>
          )}
          <div className="mt-8">
            <Link href={hero.cta.href} className={cn(buttonVariants({ size: "xl" }), "w-full sm:w-auto")}>
              {hero.cta.label}
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-surface-gray shadow-card-hover">
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            priority
            sizes="(min-width: 1240px) 580px, (min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
