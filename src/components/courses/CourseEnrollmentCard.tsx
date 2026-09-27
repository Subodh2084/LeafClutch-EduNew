import Link from "next/link";
import { ArrowRight, Award, BookOpen, Clock, MonitorPlay, Wallet } from "lucide-react";

import { CoursePrice } from "@/components/courses/CoursePrice";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { buttonVariants } from "@/components/ui/button";
import { learningModeLabels } from "@/lib/course-display";
import { formatPrice, getCoursePricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

interface CourseEnrollmentCardProps {
  course: Course;
  moduleCount: number;
  lessonCount: number;
  installmentCount: number;
}

export function CourseEnrollmentCard({
  course,
  moduleCount,
  lessonCount,
  installmentCount,
}: CourseEnrollmentCardProps) {
  const { savings, savingsPercent } = getCoursePricing(course);

  const includes = [
    { icon: Clock, text: `${course.duration} duration` },
    { icon: MonitorPlay, text: `${learningModeLabels[course.learning_mode]} classes` },
    moduleCount > 0 && {
      icon: BookOpen,
      text: `${moduleCount} modules${lessonCount > 0 ? ` · ${lessonCount} lessons` : ""}`,
    },
    course.certificate_available && { icon: Award, text: "Certificate of completion" },
    installmentCount > 1 && { icon: Wallet, text: `Pay in ${installmentCount} instalments` },
  ].filter((item) => !!item);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card-hover">
      <CourseThumbnail
        course={course}
        decorative
        priority
        sizes="(min-width: 1024px) 360px, 100vw"
      />

      <div className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{course.name}</p>
        <CoursePrice course={course} size="lg" className="mt-2" />
        {savings != null && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green/10 px-3 py-1 text-sm font-medium text-navy">
            <span aria-hidden className="size-1.5 rounded-full bg-green" />
            Save {formatPrice(savings)} ({savingsPercent}%)
          </p>
        )}

        <Link
          href={`/enroll?course=${encodeURIComponent(course.slug)}`}
          className={cn(buttonVariants({ size: "xl" }), "mt-6 w-full")}
        >
          Enroll Now
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Link>
        <div className="mt-6 border-t pt-5">
          <h2 className="text-sm font-semibold text-foreground">This course includes</h2>
          <ul className="mt-3 space-y-2.5">
            {includes.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <Icon aria-hidden className="size-4 shrink-0 text-navy" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
