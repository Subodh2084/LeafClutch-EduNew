"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock,
  Mail,
  MessageCircle,
  MonitorPlay,
} from "lucide-react";

import { CoursePrice } from "@/components/courses/CoursePrice";
import { Container } from "@/components/layout/Container";
import { HandoffNotice, type Handoff } from "@/components/shared/HandoffNotice";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { courseHref, learningModeLabels } from "@/lib/course-display";
import {
  getEnrollmentUrl,
  sendEnrollment,
  type EnrollmentChannel,
  type EnrollmentChannels,
} from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import { createEnrollmentSchema, type EnrollmentFormValues } from "@/lib/validation/enrollment";
import type { Course } from "@/types/course";

export type EnrollmentCourse = Pick<
  Course,
  "slug" | "name" | "duration" | "learning_mode" | "actual_price" | "discount_price"
> & { categoryName: string };

interface EnrollmentFormProps {
  courses: EnrollmentCourse[];
  /** From site_settings, loaded on the server. */
  channels: EnrollmentChannels;
  /** Slug from ?course=, already validated on the server ("" if none). */
  initialCourse: string;
  /** ?course= named a course that doesn't exist or isn't published. */
  requestedUnavailable: boolean;
}

const controlClass = "h-11 bg-white px-3 md:text-base";

function Required() {
  return (
    <span aria-hidden className="text-destructive">
      *
    </span>
  );
}

export function EnrollmentForm({
  courses,
  channels,
  initialCourse,
  requestedUnavailable,
}: EnrollmentFormProps) {
  const [sent, setSent] = useState<Handoff | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EnrollmentFormValues>({
    resolver: zodResolver(createEnrollmentSchema(courses.map((c) => c.slug))),
    defaultValues: { name: "", email: "", phone: "", address: "", course: initialCourse, message: "" },
    mode: "onTouched",
  });

  const selectedSlug = useWatch({ control, name: "course" });
  const selected = courses.find((c) => c.slug === selectedSlug);

  function submitVia(channel: EnrollmentChannel) {
    return handleSubmit((values) => {
      const course = courses.find((c) => c.slug === values.course);
      if (!course) return;
      const url = getEnrollmentUrl(channel, { ...values, courseName: course.name }, channels);
      if (!url) return;
      sendEnrollment(channel, url);
      setSent({ channel, url });
    });
  }

  const describedBy = (name: keyof EnrollmentFormValues) =>
    errors[name] ? `${name}-error` : undefined;
  const noChannels = !channels.whatsapp && !channels.email;

  return (
    <>
      <section aria-labelledby="enroll-heading" className="border-b bg-surface-blue/50">
        <Container className="py-10 sm:py-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-navy">
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link href="/courses" className="hover:text-navy">
                  Courses
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li aria-current="page" className="font-medium text-foreground">
                Enroll
              </li>
            </ol>
          </nav>
          <h1
            id="enroll-heading"
            className="mt-4 text-3xl leading-tight font-semibold text-foreground sm:text-4xl"
          >
            {selected ? `Enroll in ${selected.name}` : "Enroll in a Course"}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Share your details and send them to us on WhatsApp or by email. Our team will confirm
            your seat and payment details.
          </p>
        </Container>
      </section>

      <Container className="grid grid-cols-1 gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <form
          noValidate
          onSubmit={channels.whatsapp ? submitVia("whatsapp") : submitVia("email")}
          aria-labelledby="enroll-heading"
          className="rounded-2xl border bg-card p-6 shadow-card sm:p-8"
        >
          {requestedUnavailable && (
            <p className="mb-6 flex gap-2.5 rounded-lg border border-window-yellow/50 bg-window-yellow/10 p-3 text-sm text-foreground">
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-navy" />
              The course you selected isn’t available for enrollment. Please choose another course
              below.
            </p>
          )}

          <FieldGroup className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">
                Full Name <Required />
              </FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                aria-required
                aria-invalid={!!errors.name}
                aria-describedby={describedBy("name")}
                className={controlClass}
                {...register("name")}
              />
              <FieldError id="name-error" errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">
                Email <Required />
              </FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                aria-required
                aria-invalid={!!errors.email}
                aria-describedby={describedBy("email")}
                className={controlClass}
                {...register("email")}
              />
              <FieldError id="email-error" errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">
                Phone <Required />
              </FieldLabel>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="98XXXXXXXX"
                aria-required
                aria-invalid={!!errors.phone}
                aria-describedby={describedBy("phone")}
                className={controlClass}
                {...register("phone")}
              />
              <FieldError id="phone-error" errors={[errors.phone]} />
            </Field>

            <Field data-invalid={!!errors.address}>
              <FieldLabel htmlFor="address">
                Address <Required />
              </FieldLabel>
              <Input
                id="address"
                autoComplete="street-address"
                placeholder="City, district"
                aria-required
                aria-invalid={!!errors.address}
                aria-describedby={describedBy("address")}
                className={controlClass}
                {...register("address")}
              />
              <FieldError id="address-error" errors={[errors.address]} />
            </Field>

            <Field data-invalid={!!errors.course} className="sm:col-span-2">
              <FieldLabel htmlFor="course">
                Course <Required />
              </FieldLabel>
              {/* A fixed list of published courses — never free text. */}
              <div className="relative">
                <select
                  id="course"
                  aria-required
                  aria-invalid={!!errors.course}
                  aria-describedby={describedBy("course")}
                  className="h-11 w-full appearance-none rounded-lg border border-input bg-white pr-10 pl-3 text-base text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                  {...register("course", {
                    // Keep ?course= in sync so a refresh or shared link keeps the choice.
                    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
                      const slug = event.target.value;
                      window.history.replaceState(
                        null,
                        "",
                        slug ? `/enroll?course=${encodeURIComponent(slug)}` : "/enroll",
                      );
                    },
                  })}
                >
                  <option value="">Choose a course…</option>
                  {courses.map((course) => (
                    <option key={course.slug} value={course.slug}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
              </div>
              <FieldError id="course-error" errors={[errors.course]} />
            </Field>

            <Field data-invalid={!!errors.message} className="sm:col-span-2">
              <FieldLabel htmlFor="message">
                Message <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="message"
                rows={4}
                placeholder="Anything we should know — preferred batch time, questions about the course…"
                aria-invalid={!!errors.message}
                aria-describedby={describedBy("message")}
                className="min-h-28 bg-white px-3 py-2.5 md:text-base"
                {...register("message")}
              />
              <FieldError id="message-error" errors={[errors.message]} />
            </Field>
          </FieldGroup>

          <div className="mt-8 border-t pt-6">
            {noChannels ? (
              <p className="text-sm text-muted-foreground">
                Online enrollment isn’t available yet. Please contact us directly.
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {channels.whatsapp && (
                    <Button type="submit" size="xl" disabled={isSubmitting} className="sm:flex-1">
                      <MessageCircle data-icon="inline-start" aria-hidden />
                      Send via WhatsApp
                    </Button>
                  )}
                  {channels.email && (
                    <Button
                      type={channels.whatsapp ? "button" : "submit"}
                      variant={channels.whatsapp ? "outline" : "default"}
                      size="xl"
                      disabled={isSubmitting}
                      onClick={channels.whatsapp ? submitVia("email") : undefined}
                      className="sm:flex-1"
                    >
                      <Mail data-icon="inline-start" aria-hidden />
                      Send via Email
                    </Button>
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  This opens WhatsApp or your email app with your details filled in — review the
                  message and press send.
                </p>
              </>
            )}

            <HandoffNotice sent={sent} detail="your enrollment details" />
          </div>
        </form>

        <aside aria-label="Selected course" className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            {selected ? (
              <>
                <p className="text-xs font-medium text-blue-text">{selected.categoryName}</p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">{selected.name}</h2>
                <CoursePrice course={selected} className="mt-3" />
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <Clock aria-hidden className="size-4 text-navy" />
                    {selected.duration}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <MonitorPlay aria-hidden className="size-4 text-navy" />
                    {learningModeLabels[selected.learning_mode]} classes
                  </li>
                </ul>
                <Link
                  href={courseHref(selected.slug)}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-navy hover:underline hover:underline-offset-4"
                >
                  View course details
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Choose a course to see its price and details here.
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-surface-blue/50 p-6">
            <h2 className="text-sm font-semibold text-foreground">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {[
                "Send your details on WhatsApp or by email.",
                "Our team contacts you to confirm your seat, batch and payment.",
                "Complete payment and start learning.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-navy ring-1 ring-border",
                    )}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </Container>
    </>
  );
}
