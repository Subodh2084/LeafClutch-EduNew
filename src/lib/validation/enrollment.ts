import { z } from "zod";

/** Local or international phone number: digits, spaces and dashes, optional leading +. */
export const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,17}$/;

/**
 * Enrollment form schema. `course` must be one of the published course slugs,
 * so the course can't be changed to arbitrary text.
 */
export function createEnrollmentSchema(courseSlugs: string[]) {
  return z.object({
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
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(PHONE_PATTERN, "Enter a valid phone number"),
    address: z.string().trim().min(1, "Address is required").max(200, "Address is too long"),
    course: z.string().refine((slug) => courseSlugs.includes(slug), "Please choose a course"),
    message: z.string().trim().max(1000, "Message is too long (1,000 characters max)"),
  });
}

export type EnrollmentFormValues = z.infer<ReturnType<typeof createEnrollmentSchema>>;
