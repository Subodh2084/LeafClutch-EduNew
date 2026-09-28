import "server-only";

import { cache } from "react";

import { aboutData } from "@/data/about";
import { contactPageContent } from "@/data/contact";
import { whyChooseUsFeatures, whyChooseUsImages } from "@/data/home";
import { byDisplayOrder, throwIfError } from "@/lib/data";
import { contactMap } from "@/lib/maps";
import { getPublicClient } from "@/lib/supabase/public";
import type { AboutPageData, AboutValue, LearningStep } from "@/types/about";
import type { ContactInfo, ContactPageContent } from "@/types/contact";
import type {
  Faq,
  Feature,
  Offer,
  SiteSettings,
  StatItem,
  Testimonial,
  TestimonialType,
} from "@/types/content";

// Non-course content. Course-specific FAQs come with the course (lib/courses).

/** Active site-wide FAQs (not tied to a course). */
export async function getSiteFAQs(): Promise<Faq[]> {
  const { data, error } = await getPublicClient()
    .from("faqs")
    .select("*")
    .is("course_id", null)
    .order("display_order");
  throwIfError(error, "load FAQs");
  return data as Faq[];
}

/** Featured testimonials of one type: student reviews (home page) or organisations (training pages). */
export async function getFeaturedTestimonials(
  limit = 3,
  type: TestimonialType = "student",
): Promise<Testimonial[]> {
  const { data, error } = await getPublicClient()
    .from("testimonials")
    .select("*, course:courses(name)")
    .eq("type", type)
    .eq("is_featured", true)
    .order("display_order")
    .limit(limit);
  throwIfError(error, "load testimonials");

  return (data as (Testimonial & { course: { name: string } | null })[]).map(
    ({ course, ...testimonial }) => ({ ...testimonial, course_name: course?.name ?? null }),
  );
}

const emptySettings: SiteSettings = {
  announcement: null,
  site_name: null,
  logo_url: null,
  footer_logo_url: null,
  favicon_url: null,
  description: null,
  email: null,
  phone: null,
  whatsapp: null,
  address: null,
  social_links: [],
  opening_hours: [],
};

/** Global contact details and links. Missing settings render as "not configured". */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const { data, error } = await getPublicClient()
    .from("site_settings")
    .select("*")
    .maybeSingle();
  throwIfError(error, "load site settings");
  return {
    ...emptySettings,
    ...((data as Partial<SiteSettings> | null) ?? {}),
  };
});

export async function getActiveOffers(): Promise<Offer[]> {
  const { data, error } = await getPublicClient()
    .from("offers")
    .select("*, course:courses(name)")
    .eq("is_active", true)
    .order("display_order");
  throwIfError(error, "load offers");
  return (data as (Omit<Offer, "course_name"> & { course: { name: string } | null })[]).map(
    ({ course, ...rest }) => ({ ...rest, course_name: course?.name ?? null }),
  );
}

/** Active home page stats ("1,000+ Students trained"), in display order. */
export async function getHomeStats(): Promise<StatItem[]> {
  const { data, error } = await getPublicClient()
    .from("home_stats")
    .select("id, value, label")
    .order("display_order");
  throwIfError(error, "load home stats");
  return data as StatItem[];
}

// Marketing copy that has no table yet — still local.

export async function getWhyChooseUs() {
  return { features: whyChooseUsFeatures, images: whyChooseUsImages };
}

type AboutItemRow = { id: string; section: "value" | "feature" | "learning_step"; icon: string; title: string; description: string };

/** The About page: copy from data/about.ts; stats (same as the home page) and cards from Supabase. */
export async function getAboutPageData(): Promise<AboutPageData> {
  const [stats, items] = await Promise.all([
    getHomeStats(),
    getPublicClient().from("about_items").select("id, section, icon, title, description").order("display_order"),
  ]);
  throwIfError(items.error, "load about page items");

  const rows = items.data as AboutItemRow[];
  const inSection = (section: AboutItemRow["section"]) =>
    rows
      .filter((row) => row.section === section)
      .map(({ id, icon, title, description }) => ({ id, icon, title, description }));

  return {
    content: aboutData,
    stats,
    values: inSection("value") as AboutValue[],
    features: inSection("feature") as Feature[],
    learningSteps: inSection("learning_step") as LearningStep[],
  };
}

/** Contact details from site_settings, as the Contact page expects them. */
export async function getContactInfo(): Promise<ContactInfo> {
  const { address, phone, email, whatsapp, opening_hours, map_embed_url } = await getSiteSettings();
  return {
    address,
    phone,
    email,
    whatsapp,
    openingHours: opening_hours.map((row, i) => ({ id: String(i), ...row })),
    map: contactMap(map_embed_url ?? null, address),
  };
}

export async function getContactPageContent(): Promise<ContactPageContent> {
  return contactPageContent;
}
