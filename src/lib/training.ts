import "server-only";

import { getFeaturedTestimonials, getSiteSettings } from "@/lib/content";
import { getCoursesForTraining } from "@/lib/courses";
import { throwIfError } from "@/lib/data";
import { getPublicClient } from "@/lib/supabase/public";
import { buildTrainingInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { ImageAsset } from "@/types/about";
import type { Testimonial } from "@/types/content";
import type { Course } from "@/types/course";
import type {
  Partnership,
  TrainingFeature,
  TrainingIcon,
  TrainingPageCopy,
  TrainingPageData,
  TrainingProcessStep,
  TrainingProgram,
  TrainingType,
} from "@/types/training";

// Training pages (corporate / academic / government). Everything comes from
// Supabase: text (training_pages), lists and images, partners, courses and
// testimonials.

/** The page's text from training_pages, in the shape the components expect. */
async function getTrainingCopy(type: TrainingType): Promise<TrainingPageCopy> {
  const { data, error } = await getPublicClient().from("training_pages").select("*").eq("type", type).maybeSingle();
  throwIfError(error, `load ${type} training page text`);
  if (!data) throw new Error(`The "${type}" row is missing from training_pages. Run supabase/seed.sql.`);

  const t = data as Record<string, string | null>;
  const text = (column: string) => t[column] ?? "";
  // Button links are decided in getTrainingPageContent (WhatsApp or /contact), not stored.
  return {
    type,
    hero: {
      eyebrow: text("hero_eyebrow"),
      title: text("hero_title"),
      description: text("hero_description"),
      ctaLabel: text("hero_cta_label"),
      ctaHref: "/contact",
    },
    partnership: { title: text("partners_title") },
    courses: { title: text("courses_title"), description: text("courses_description") },
    whyChooseUs: { title: text("why_title"), description: text("why_description") },
    process: { title: text("process_title"), description: t.process_description ?? undefined },
    programs: { title: text("programs_title"), description: text("programs_description") },
    testimonials: { title: text("testimonials_title"), description: text("testimonials_description") },
    cta: { title: text("cta_title"), description: text("cta_description"), label: text("cta_label"), href: "/contact" },
  };
}

type ItemRow = {
  id: string;
  type: TrainingType | null;
  section: "feature" | "program" | "process_step";
  icon: TrainingIcon | null;
  title: string;
  description: string;
};
type ImageRow = { placement: "hero" | "why_choose_us"; image_url: string; alt: string };

/** Features, programs and process steps for one page. Steps with no type are shared. */
async function getTrainingItems(type: TrainingType) {
  const { data, error } = await getPublicClient()
    .from("training_page_items")
    .select("id, type, section, icon, title, description")
    .or(`type.eq.${type},type.is.null`)
    .order("display_order");
  throwIfError(error, `load ${type} training page items`);

  const rows = data as ItemRow[];
  const withIcon = (section: ItemRow["section"]) =>
    rows
      .filter((row) => row.section === section && row.type === type && row.icon)
      .map(({ id, icon, title, description }) => ({ id, icon: icon!, title, description }));

  // A page-specific step list replaces the shared one; otherwise the shared steps show.
  const ownSteps = rows.filter((row) => row.section === "process_step" && row.type === type);
  const steps =
    ownSteps.length > 0 ? ownSteps : rows.filter((row) => row.section === "process_step" && row.type === null);

  return {
    features: withIcon("feature") as TrainingFeature[],
    programs: withIcon("program") as TrainingProgram[],
    steps: steps.map(
      ({ title, description }, i): TrainingProcessStep => ({
        number: String(i + 1).padStart(2, "0"),
        title,
        description,
      }),
    ),
  };
}

async function getTrainingImages(type: TrainingType) {
  const { data, error } = await getPublicClient()
    .from("training_page_images")
    .select("placement, image_url, alt")
    .eq("type", type)
    .order("display_order");
  throwIfError(error, `load ${type} training page images`);

  const rows = data as ImageRow[];
  const at = (placement: ImageRow["placement"]): ImageAsset[] =>
    rows.filter((row) => row.placement === placement).map(({ image_url, alt }) => ({ src: image_url, alt }));
  return { hero: at("hero"), whyChooseUs: at("why_choose_us") };
}

/**
 * The full page content: text, lists and images.
 * "Request … Training" opens WhatsApp with a pre-filled message (number from
 * site_settings), or keeps the page's own link (/contact) when none is set.
 */
export async function getTrainingPageContent(type: TrainingType): Promise<TrainingPageData> {
  const [copy, items, images, { whatsapp }] = await Promise.all([
    getTrainingCopy(type),
    getTrainingItems(type),
    getTrainingImages(type),
    getSiteSettings(),
  ]);
  const inquiryUrl = buildWhatsAppUrl(whatsapp, buildTrainingInquiryMessage(type));

  return {
    ...copy,
    hero: { ...copy.hero, gallery: images.hero, ctaHref: inquiryUrl ?? copy.hero.ctaHref },
    whyChooseUs: { ...copy.whyChooseUs, images: images.whyChooseUs, features: items.features },
    process: { ...copy.process, steps: items.steps },
    programs: { ...copy.programs, items: items.programs },
    cta: { ...copy.cta, href: inquiryUrl ?? copy.cta.href },
  };
}

/** Active partners for a training type, in display order. */
export async function getTrainingPartners(type: TrainingType): Promise<Partnership[]> {
  const { data, error } = await getPublicClient()
    .from("training_partners")
    .select("id, type, name, logo, website, display_order, is_active")
    .eq("type", type)
    .order("display_order");
  throwIfError(error, `load ${type} training partners`);

  // Nullable columns become optional fields, as the Partnership type expects.
  type PartnerRow = Omit<Partnership, "logo" | "website"> & { logo: string | null; website: string | null };
  return (data as PartnerRow[]).map(({ logo, website, ...partner }) => ({
    ...partner,
    logo: logo ?? undefined,
    website: website ?? undefined,
  }));
}

export interface TrainingPage {
  content: TrainingPageData;
  partners: Partnership[];
  courses: Course[];
  testimonials: Testimonial[];
}

/** Everything a training page renders, fetched in parallel. */
export async function getTrainingPage(type: TrainingType): Promise<TrainingPage> {
  const [content, partners, courses, testimonials] = await Promise.all([
    getTrainingPageContent(type),
    getTrainingPartners(type),
    getCoursesForTraining(type),
    getFeaturedTestimonials(3, type),
  ]);
  return { content, partners, courses, testimonials };
}
