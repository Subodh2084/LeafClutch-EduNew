import { ArrowUpRight, MonitorPlay } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CourseUdemy({ url }: { url: string | null }) {
  if (!url) return null;

  return (
    <section
      id="udemy"
      aria-labelledby="udemy-heading"
      className="flex scroll-mt-24 flex-col gap-6 rounded-2xl border bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div className="flex gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-blue">
          <MonitorPlay aria-hidden className="size-5 text-navy" />
        </span>
        <div>
          <h2 id="udemy-heading" className="text-xl font-semibold text-foreground">
            Learn This Course on Udemy
          </h2>
          <p className="mt-1 text-muted-foreground">
            Prefer self-paced learning? Take the recorded version of this course on Udemy.
          </p>
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "outline", size: "xl" }), "shrink-0")}
      >
        View Course on Udemy
        <ArrowUpRight data-icon="inline-end" aria-hidden />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </section>
  );
}
