import { Award, Leaf } from "lucide-react";

import type { Course } from "@/types/course";

export function CourseCertificate({ course }: { course: Pick<Course, "name" | "certificate_available"> }) {
  // Never imply a certificate the course does not offer.
  if (!course.certificate_available) return null;

  return (
    <section
      id="certificate"
      aria-labelledby="certificate-heading"
      className="grid scroll-mt-24 items-center gap-8 rounded-2xl border bg-surface-blue/60 p-6 sm:grid-cols-[minmax(0,1fr)_220px] sm:p-8"
    >
      <div>
        <span className="flex size-11 items-center justify-center rounded-lg border bg-white">
          <Award aria-hidden className="size-5 text-navy" />
        </span>
        <h2 id="certificate-heading" className="mt-5 text-2xl font-semibold text-foreground">
          Certificate of Completion
        </h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Successfully complete the course and receive a LeafClutch certificate.
        </p>
      </div>

      {/* Illustrative certificate preview, not the actual design. */}
      <div aria-hidden className="rotate-1 rounded-lg border bg-white p-2 shadow-card-hover">
        <div className="rounded border border-surface-blue-strong px-4 py-5 text-center">
          <Leaf className="mx-auto size-4 text-green" />
          <p className="mt-2 text-[0.625rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Certificate of Completion
          </p>
          <p className="mt-2 text-sm font-semibold text-navy">{course.name}</p>
          <div className="mx-auto mt-4 h-px w-16 bg-border" />
          <p className="mt-1.5 text-[0.625rem] text-muted-foreground">LeafClutch Technologies</p>
        </div>
      </div>
    </section>
  );
}
