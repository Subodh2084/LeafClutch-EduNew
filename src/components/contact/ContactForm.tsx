"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageCircle } from "lucide-react";

import { HandoffNotice, type Handoff } from "@/components/shared/HandoffNotice";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getContactUrl,
  sendContactMessage,
  type ContactChannel,
  type ContactChannels,
} from "@/lib/contact";
import { contactSchema, type ContactFormValues } from "@/lib/validation/contact";

interface ContactFormProps {
  title: string;
  /** Where messages go; from contact data, later Supabase site settings. */
  channels: ContactChannels;
}

const controlClass = "h-11 bg-white px-3 md:text-base";

function Required() {
  return (
    <span aria-hidden className="text-destructive">
      *
    </span>
  );
}

export function ContactForm({ title, channels }: ContactFormProps) {
  const [sent, setSent] = useState<Handoff | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
    mode: "onTouched",
  });

  function submitVia(channel: ContactChannel) {
    return handleSubmit((values) => {
      const url = getContactUrl(channel, values, channels);
      if (!url) return;
      sendContactMessage(channel, url);
      setSent({ channel, url });
    });
  }

  const describedBy = (name: keyof ContactFormValues) =>
    errors[name] ? `contact-${name}-error` : undefined;
  const emailChannel = channels.email || "info@leafclutch.com";
  const noChannels = !channels.whatsapp && !emailChannel;

  return (
    <form
      noValidate
      onSubmit={channels.whatsapp ? submitVia("whatsapp") : submitVia("email")}
      aria-labelledby="contact-form-heading"
      className="rounded-2xl border bg-card p-6 shadow-card sm:p-8"
    >
      <h2 id="contact-form-heading" className="text-xl font-semibold text-foreground">
        {title}
      </h2>

      <FieldGroup className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.name} className="sm:col-span-2">
          <FieldLabel htmlFor="contact-name">
            Full Name <Required />
          </FieldLabel>
          <Input
            id="contact-name"
            autoComplete="name"
            aria-required
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            className={controlClass}
            {...register("name")}
          />
          <FieldError id="contact-name-error" errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="contact-email">
            Email <Required />
          </FieldLabel>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-required
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            className={controlClass}
            {...register("email")}
          />
          <FieldError id="contact-email-error" errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="contact-phone">
            Phone Number <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="98XXXXXXXX"
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone")}
            className={controlClass}
            {...register("phone")}
          />
          <FieldError id="contact-phone-error" errors={[errors.phone]} />
        </Field>

        <Field data-invalid={!!errors.message} className="sm:col-span-2">
          <FieldLabel htmlFor="contact-message">
            Message <Required />
          </FieldLabel>
          <Textarea
            id="contact-message"
            rows={5}
            placeholder="How can we help? Ask about a course, batch timings, fees or anything else."
            aria-required
            aria-invalid={!!errors.message}
            aria-describedby={describedBy("message")}
            className="min-h-32 bg-white px-3 py-2.5 md:text-base"
            {...register("message")}
          />
          <FieldError id="contact-message-error" errors={[errors.message]} />
        </Field>
      </FieldGroup>

      <div className="mt-8 border-t pt-6">
        {noChannels ? (
          <p className="text-sm text-muted-foreground">
            Online messaging isn’t available yet. Please use the contact details on this page.
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
              {emailChannel && (
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
              This opens WhatsApp or your email app with your message filled in. Review it there and
              press send.
            </p>
          </>
        )}

        <HandoffNotice sent={sent} detail="your message" />
      </div>
    </form>
  );
}
