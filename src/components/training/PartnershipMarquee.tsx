import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import type { Partnership } from "@/types/training";

const minorWords = new Set(["of", "the", "and", "&", "for"]);

function monogram(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => !minorWords.has(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function PartnerMark({ partner, hidden = false }: { partner: Partnership; hidden?: boolean }) {
  const content = partner.logo ? (
    <Image
      src={partner.logo}
      alt={partner.name}
      width={140}
      height={140}
      className="h-20 w-auto object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
    />
  ) : (
    // Wordmark fallback until real partner logos are supplied.
    <span className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-12 shrink-0 items-center justify-center rounded-md border border-surface-blue-strong bg-surface-blue text-sm font-bold tracking-wide text-navy"
      >
        {monogram(partner.name)}
      </span>
      <span className="text-[0.9375rem] font-semibold whitespace-nowrap text-navy-soft">
        {partner.name}
      </span>
    </span>
  );

  return (
    <li className="shrink-0">
      {partner.website ? (
        <a
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={hidden ? -1 : undefined}
          className="block rounded-md"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}

interface PartnershipMarqueeProps {
  title: string;
  partners: Partnership[];
}

export function PartnershipMarquee({ title, partners }: PartnershipMarqueeProps) {
  if (partners.length === 0) return null;

  const listClass =
    "flex shrink-0 items-center gap-12 pr-12 motion-reduce:w-full motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-6 motion-reduce:pr-0";

  return (
    <section aria-labelledby="partners-heading" className="border-b bg-white py-10 sm:py-12">
      <Container>
        <h2
          id="partners-heading"
          className="text-center text-base font-medium text-muted-foreground"
        >
          {title}
        </h2>

        {/* Pauses on hover and while a partner link has focus. */}
        <div className="group/marquee mt-7 overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:mask-none">
          <div
            className={cn(
              "flex w-max animate-marquee motion-reduce:w-full motion-reduce:animate-none",
              "group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]",
            )}
          >
            <ul className={listClass}>
              {partners.map((partner) => (
                <PartnerMark key={partner.id} partner={partner} />
              ))}
            </ul>
            {/* Second copy makes the loop seamless; hidden from assistive tech. */}
            <ul aria-hidden className={cn(listClass, "motion-reduce:hidden")}>
              {partners.map((partner) => (
                <PartnerMark key={partner.id} partner={partner} hidden />
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
