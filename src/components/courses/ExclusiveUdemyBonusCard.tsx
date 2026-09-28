
import { ArrowDown, Check, Gift } from "lucide-react";

import { UDEMY_BONUS_SECTION_ID } from "@/components/courses/UdemyBonusSection";

const perks = [
  "No extra cost, included in the fee",
  "Lifetime access on Udemy",
  "You pick the course that suits you",
];

/**
 * Sits under the enrollment card when the course has Udemy bonus courses.
 */
export function ExclusiveUdemyBonusCard({
  courseName,
}: {
  courseName: string;
}) {
  return (
    <section
      aria-labelledby="exclusive-bonus-heading"
      className="bonus-glow bonus-shake relative rounded-2xl bg-navy p-6 text-white shadow-card-hover"
    >
      {/* Sheen */}
      <span
        aria-hidden
        className="bonus-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      />

      {/* Label */}
      <p className="relative flex items-center gap-2 text-sm font-medium text-green">
        <Gift
          aria-hidden
          className="gift-wiggle size-4"
        />
        Exclusive bonus
      </p>

      {/* Heading */}
      <h2
        id="exclusive-bonus-heading"
        className="relative mt-3 text-xl font-semibold leading-snug"
      >
        Get a FREE Udemy course with lifetime access
      </h2>

      {/* Description */}
      <p className="relative mt-2 text-sm leading-relaxed text-white/75">
        Included in your {courseName} fee. Choose the Udemy course that fits
        your program and keep it forever.
      </p>

      {/* Benefits */}
      <ul className="relative mt-5 space-y-2.5 text-sm">
        {perks.map((perk) => (
          <li
            key={perk}
            className="flex items-start gap-3"
          >
            <span className="mt-px flex size-4.5 shrink-0 items-center justify-center rounded-full bg-green/20">
              <Check
                aria-hidden
                className="size-3 text-green"
                strokeWidth={3}
              />
            </span>

            {perk}
          </li>
        ))}
      </ul>

      {/* Link */}
      <a
        href={`#${UDEMY_BONUS_SECTION_ID}`}
        className="relative mt-5 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-white underline decoration-white/35 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-white"
      >
        See the courses you can choose
        <ArrowDown
          aria-hidden
          className="size-3.5"
        />
      </a>
    </section>
  );
}



