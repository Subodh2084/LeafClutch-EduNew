import { z } from "zod";

import { PHONE_PATTERN } from "@/lib/validation/enrollment";

/** Contact form schema. Same rules as enrollment for the shared fields. */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(2, "Please enter your full name")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email address")),
  // Optional, but validated when given.
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || PHONE_PATTERN.test(value), "Enter a valid phone number"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .min(10, "Please add a little more detail (10 characters min)")
    .max(1000, "Message is too long (1,000 characters max)"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
