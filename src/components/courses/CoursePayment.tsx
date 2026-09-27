import { CourseDetailSection } from "@/components/courses/CourseDetailSection";
import { formatPrice, getCoursePricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Course, CourseInstallment } from "@/types/course";

const segmentColors = ["bg-navy", "bg-blue", "bg-sky", "bg-blue-light"];

interface CoursePaymentProps {
  course: Course;
  installments: CourseInstallment[];
}

export function CoursePayment({ course, installments }: CoursePaymentProps) {
  if (installments.length === 0) return null;

  const { current } = getCoursePricing(course);

  return (
    <CourseDetailSection
      id="payment"
      title="Payment Options"
      description="No payment is taken on this website. Our team confirms payment details after you enroll."
    >
      <div className="space-y-10">
        {installments.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-foreground">Instalment plan</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Amounts are based on the current course fee of {formatPrice(current)}.
            </p>

            {/* Proportions at a glance; the list below carries the same information. */}
            <div aria-hidden className="mt-5 flex h-2 gap-1 overflow-hidden rounded-full">
              {installments.map((item, i) => (
                <span
                  key={item.id}
                  className={cn("rounded-full", segmentColors[i % segmentColors.length])}
                  style={{ flexGrow: item.percentage }}
                />
              ))}
            </div>

            <ol className="mt-5 space-y-3">
              {installments.map((item, i) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border bg-white p-4 sm:p-5"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-surface-blue text-sm font-semibold text-navy tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-navy tabular-nums">{item.percentage}%</p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatPrice(Math.round((current * item.percentage) / 100))}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </CourseDetailSection>
  );
}
