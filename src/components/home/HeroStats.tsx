import {
  Award,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import type { StatItem } from "@/types/content";

const statIcons = [Users, BookOpen, GraduationCap, Award];

interface HeroStatsProps {
  stats: StatItem[];
  /**
   * "band": full-width strip under the home hero (1×4 on desktop).
   * "panel": rounded 2×2 block that sits inside a page column.
   */
  variant?: "band" | "panel";
  className?: string;
}

/** Cell dividers for each layout, so the grid lines never double up. */
function cellBorders(i: number, variant: "band" | "panel") {
  if (variant === "panel") {
    return cn(i % 2 === 1 && "border-l border-white/10", i >= 2 && "border-t border-white/10");
  }
  return cn(
    i % 2 === 1 && "border-l border-white/10 lg:border-l",
    i >= 2 && "border-t border-white/10 lg:border-t-0",
    i === 2 && "lg:border-l border-white/10",
  );
}

export function HeroStats({ stats, variant = "band", className }: HeroStatsProps) {
  if (stats.length === 0) return null;

  const isPanel = variant === "panel";

  const list = (
    <ul aria-label={isPanel ? "LeafClutch in numbers" : undefined} className={cn("grid grid-cols-2", !isPanel && "lg:grid-cols-4")}>
      {stats.map((stat, i) => {
        const Icon = statIcons[i % statIcons.length];

        return (
          <li
            key={stat.id}
            className={cn(
              "relative flex transition-colors duration-300 hover:bg-white/4",
              isPanel
                ? "flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:gap-4 sm:p-7"
                : "items-center gap-4 px-5 py-7 sm:px-8 sm:py-9",
              cellBorders(i, variant),
            )}
          >
            {/* Icon */}
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky ring-1 ring-white/10">
              <Icon aria-hidden className="size-5" />
            </div>

            {/* Content */}
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight text-white tabular-nums sm:text-3xl">
                {stat.value}
              </p>

              <p className="mt-1 text-sm font-medium text-white/60">
                {stat.label}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );

  const glow = (
    <>
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 top-1/2 size-80 -translate-y-1/2 rounded-full bg-blue/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/2 size-80 -translate-y-1/2 rounded-full bg-sky/10 blur-3xl" />
    </>
  );

  if (isPanel) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl bg-navy", className)}>
        {glow}
        <div className="relative">{list}</div>
      </div>
    );
  }

  return (
    <section
      aria-label="LeafClutch in numbers"
      className={cn("relative overflow-hidden bg-navy", className)}
    >
      {glow}
      <Container className="relative">{list}</Container>
    </section>
  );
}
