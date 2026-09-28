import { z } from "zod";

import { extractGoogleMapsEmbedUrl } from "@/lib/maps";

// Admin form schemas. Use them with react-hook-form's zodResolver on the client;
// the server actions (src/actions) validate with the same schemas again.
// File fields (thumbnails, PDFs, images) are not here: they are set only
// through the upload actions, so a URL can't be typed in by hand.

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

/** "" and null both become null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "Too long")
    .nullable()
    .transform((value) => value || null);

const optionalHttpsUrl = z
  .union([
    z.literal(""),
    z
      .string()
      .transform((val) => {
        let v = val.trim();
        if (!v) return null;
        if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
        return v;
      })
      .pipe(z.string().url("Enter a valid https:// link")),
  ])
  .nullable()
  .transform((value) => value || null);

const slug = z
  .string()
  .trim()
  .transform((val) =>
    val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
  )
  .pipe(
    z
      .string()
      .min(1, "Slug is required")
      .max(100, "Slug is too long")
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens")
  );

const price = z.number({ error: "Enter a price" }).min(0, "Price can't be negative");
const displayOrder = z.number().int().min(0).default(0);

export const idSchema = z.uuid("Invalid id");

const trainingType = z.enum(["corporate", "academic", "government"]);

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export const courseSchema = z
  .object({
    category_id: z.uuid("Choose a category"),
    name: requiredText("Name", 150),
    slug,
    short_description: requiredText("Short description", 300),
    description: z.string().trim().max(10000, "Description is too long"),
    actual_price: price,
    discount_price: price.nullable(),
    duration: requiredText("Duration", 50),
    learning_mode: z.enum(["online", "physical", "hybrid"]),
    certificate_available: z.boolean(),
    is_featured: z.boolean(),
    status: z.enum(["draft", "published", "archived"]),
    /** Training pages that list this course. */
  })
  .refine((c) => c.discount_price == null || c.discount_price === 0 || c.discount_price < c.actual_price, {
    path: ["discount_price"],
    message: "Discount must be lower than the actual price",
  });

/** A tool on the course page's "Tools covered" list. */
export const courseToolSchema = z.object({
  name: requiredText("Name", 60),
  description: optionalText(200),
  display_order: displayOrder,
  is_active: z.boolean(),
});

/** A Udemy course included free with the course. */
export const courseUdemyBonusSchema = z.object({
  title: requiredText("Title", 200),
  course_url: z.url({ protocol: /^https$/, error: "Enter the full https:// Udemy link" }),
  image_url: z
    .url({ protocol: /^https$/, error: "Enter an https:// image link, or upload an image" })
    .or(z.literal(""))
    .transform((value) => value || ""),
  instructor: requiredText("Instructor", 120),
  rating: z.number().min(0).max(5),
  ratings_count: z.number().int().min(0),
  total_hours: z.string().trim().max(20),
  lectures: z.number().int().min(0),
  level: z.string().trim().max(40),
  description: z.string().trim().max(1000),
  display_order: displayOrder,
  is_active: z.boolean(),
});

export const courseStatusSchema = z.enum(["draft", "published", "archived"]);

export const courseBenefitSchema = z.object({
  title: requiredText("Title", 150),
  description: z.string().trim().max(500, "Description is too long"),
  display_order: displayOrder,
});

/** Modules, lessons, training objectives and training topics. */
export const orderedItemSchema = z.object({
  title: requiredText("Title", 200),
  description: optionalText(1000),
  display_order: displayOrder,
});

export const courseInstallmentSchema = z.object({
  title: requiredText("Title", 100),
  percentage: z.number().gt(0, "Must be above 0").max(100, "Can't exceed 100"),
  description: z.string().trim().max(300, "Description is too long"),
  display_order: displayOrder,
});

/** Ordered list of instructor ids; position = display order. */
export const courseInstructorIdsSchema = z.array(idSchema).max(20);

// ---------------------------------------------------------------------------
// Instructors
// ---------------------------------------------------------------------------

export const instructorSchema = z.object({
  name: requiredText("Name", 100),
  designation: requiredText("Designation", 100),
  bio: z.string().trim().max(2000, "Bio is too long"),
  linkedin_url: optionalHttpsUrl,
  is_active: z.boolean(),
});

// ---------------------------------------------------------------------------
// Training
// ---------------------------------------------------------------------------

export const trainingProgramSchema = z.object({
  type: z.enum(["corporate", "academic", "government"]),
  title: requiredText("Title", 150),
  slug,
  short_description: requiredText("Short description", 300),
  description: z.string().trim().max(10000, "Description is too long"),
  duration: optionalText(50),
  status: z.enum(["draft", "published"]),
});

export const trainingStatusSchema = z.enum(["draft", "published"]);

export const trainingGalleryItemSchema = z.object({
  title: optionalText(150),
  description: optionalText(500),
  display_order: displayOrder,
});

// ---------------------------------------------------------------------------
// Home stats
// ---------------------------------------------------------------------------

export const homeStatSchema = z.object({
  value: requiredText("Value", 20),
  label: requiredText("Label", 60),
  display_order: displayOrder,
  is_active: z.boolean(),
});

// ---------------------------------------------------------------------------
// Site settings (contact details shown in the footer, Contact page and forms)
// ---------------------------------------------------------------------------

const hrefLink = z
  .string()
  .trim()
  .transform((val) => {
    let v = val.trim();
    if (!v) return "";
    if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
    return v;
  })
  .pipe(z.string().url("Enter a valid link (e.g. https://facebook.com)"));

export const siteSettingsSchema = z.object({
  /** Short notice above the navbar on every public page; empty hides it. */
  announcement: z
    .string()
    .trim()
    .max(200, "Keep it under 200 characters so it fits in the bar")
    .nullish()
    .transform((value) => value || null),
  site_name: optionalText(100),
  logo_url: optionalHttpsUrl.optional(),
  footer_logo_url: optionalHttpsUrl.optional(),
  favicon_url: optionalHttpsUrl.optional(),
  description: optionalText(1000),
  email: z.union([z.literal(""), z.email("Enter a valid email")]).nullable().transform((v) => v || null),
  phone: optionalText(40),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[0-9]{8,15}$/, "Digits only, with country code, e.g. 9779800000000")
    .or(z.literal(""))
    .nullable()
    .transform((v) => v || null),
  address: optionalText(200),
  /** Pasted from Google Maps (Share → Embed a map): the iframe code or its link. */
  map_embed_url: z
    .string()
    .trim()
    .max(4000)
    .nullish()
    .transform((value, ctx) => {
      if (!value) return null;
      const url = extractGoogleMapsEmbedUrl(value);
      if (!url) {
        ctx.addIssue({
          code: "custom",
          message: "Paste the code from Google Maps → Share → Embed a map (it starts with <iframe or https://www.google.com/maps/embed?)",
        });
        return z.NEVER;
      }
      return url;
    }),
  social_links: z.array(z.object({ label: requiredText("Label", 40), href: hrefLink })).max(10),
  opening_hours: z.array(z.object({ days: requiredText("Days", 60), hours: requiredText("Hours", 60) })).max(10),
});

// ---------------------------------------------------------------------------
// About page cards
// ---------------------------------------------------------------------------

const aboutIcons = {
  value: ["guidance", "inclusive", "quality", "growth"],
  feature: ["practical", "mentor", "projects", "certificate", "flexible", "curriculum", "career"],
  learning_step: ["learn", "practice", "build", "grow"],
} as const;

/** A card on the About page; the icon must be one the section's design provides. */
export const aboutItemSchema = z
  .object({
    section: z.enum(["value", "feature", "learning_step"]),
    icon: z.string(),
    title: requiredText("Title", 100),
    description: z.string().trim().max(500, "Description is too long"),
    display_order: displayOrder,
    is_active: z.boolean(),
  })
  .refine((item) => (aboutIcons[item.section] as readonly string[]).includes(item.icon), {
    path: ["icon"],
    message: "Choose one of the icons for this section",
  });

// ---------------------------------------------------------------------------
// Training page lists and images
// ---------------------------------------------------------------------------

export const trainingIcons = [
  "Award", "BarChart3", "BookOpenCheck", "Bot", "BriefcaseBusiness", "Building2",
  "CalendarClock", "ChartNoAxesCombined", "FolderCode", "GraduationCap", "Handshake",
  "Landmark", "Laptop", "Presentation", "Rocket", "Settings2", "ShieldCheck", "Sprout",
  "Target", "UsersRound", "Workflow", "Wrench",
] as const;

/** A why-choose-us feature, program or process step. Steps may omit `type` (all pages). */
export const trainingPageItemSchema = z
  .object({
    type: trainingType.nullable(),
    section: z.enum(["feature", "program", "process_step"]),
    icon: z.enum(trainingIcons).nullable(),
    title: requiredText("Title", 120),
    description: z.string().trim().max(500, "Description is too long"),
    display_order: displayOrder,
    is_active: z.boolean(),
  })
  .refine((item) => item.section === "process_step" || (item.type !== null && item.icon !== null), {
    path: ["icon"],
    message: "Features and programs need a training page and an icon",
  });

/** Image details; the file itself is uploaded separately. */
export const trainingPageImageSchema = z.object({
  type: trainingType,
  placement: z.enum(["hero", "why_choose_us"]),
  alt: requiredText("Image description", 200),
  display_order: displayOrder,
  is_active: z.boolean(),
});

// ---------------------------------------------------------------------------
// Categories, FAQs, testimonials
// ---------------------------------------------------------------------------

export const categorySchema = z.object({
  name: requiredText("Name", 80),
  short_name: requiredText("Short name", 40),
  slug,
  description: optionalText(300),
  image_url: optionalHttpsUrl.optional(),
  display_order: displayOrder,
  is_active: z.boolean(),
});

export const faqSchema = z.object({
  question: requiredText("Question", 300),
  answer: requiredText("Answer", 2000),
  category: z.enum(["general", "course", "enrollment", "payment", "certificate"]),
  /** Empty = a site-wide FAQ. */
  course_id: z.union([z.literal(""), idSchema]).nullable().transform((v) => v || null),
  display_order: displayOrder,
  is_active: z.boolean(),
});

export const testimonialSchema = z.object({
  type: z.enum(["student", "corporate", "academic", "government"]),
  name: requiredText("Name", 100),
  course_id: z.union([z.literal(""), idSchema]).nullable().transform((v) => v || null),
  designation: optionalText(150),
  review: requiredText("Review", 1500),
  rating: z.number().int().min(1).max(5).nullable(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  display_order: displayOrder,
});

// ---------------------------------------------------------------------------
// Offers
// ---------------------------------------------------------------------------

export const offerSchema = z.object({
  course_id: idSchema.nullable(),
  title: requiredText("Title", 150),
  description: z.string().trim().max(2000, "Description is too long"),
  price: price.nullable(),
  discount_price: price.nullable(),
  is_active: z.boolean(),
  display_order: displayOrder,
});

export type CourseInput = z.input<typeof courseSchema>;
export type CourseToolInput = z.input<typeof courseToolSchema>;
export type CourseUdemyBonusInput = z.input<typeof courseUdemyBonusSchema>;
export type CourseBenefitInput = z.input<typeof courseBenefitSchema>;
export type OrderedItemInput = z.input<typeof orderedItemSchema>;
export type CourseInstallmentInput = z.input<typeof courseInstallmentSchema>;
export type InstructorInput = z.input<typeof instructorSchema>;
export type TrainingProgramInput = z.input<typeof trainingProgramSchema>;
export type TrainingGalleryItemInput = z.input<typeof trainingGalleryItemSchema>;
export type OfferInput = z.input<typeof offerSchema>;
export type HomeStatInput = z.input<typeof homeStatSchema>;
export type TrainingPageItemInput = z.input<typeof trainingPageItemSchema>;
export type TrainingPageImageInput = z.input<typeof trainingPageImageSchema>;
export type CategoryInput = z.input<typeof categorySchema>;
export type FaqInput = z.input<typeof faqSchema>;
export type TestimonialInput = z.input<typeof testimonialSchema>;
export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;
export type AboutItemInput = z.input<typeof aboutItemSchema>;
