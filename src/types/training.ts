import type { ImageAsset } from "@/types/about";

export type TrainingType = "corporate" | "academic" | "government";

/** Publication state of a row in the training_programs table (admin actions). */
export type TrainingStatus = "draft" | "published";

/** Icon names resolved to Lucide icons in components/training/training-icons. */
export type TrainingIcon =
  | "Award"
  | "BarChart3"
  | "BookOpenCheck"
  | "Bot"
  | "BriefcaseBusiness"
  | "Building2"
  | "CalendarClock"
  | "ChartNoAxesCombined"
  | "FolderCode"
  | "GraduationCap"
  | "Handshake"
  | "Landmark"
  | "Laptop"
  | "Presentation"
  | "Rocket"
  | "Settings2"
  | "ShieldCheck"
  | "Sprout"
  | "Target"
  | "UsersRound"
  | "Workflow"
  | "Wrench";

export interface Partnership {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  type: TrainingType;
  display_order: number;
  is_active: boolean;
}

export interface TrainingFeature {
  id: string;
  title: string;
  description: string;
  icon: TrainingIcon;
}

export interface TrainingProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  icon: TrainingIcon;
}

export interface TrainingPageData {
  type: TrainingType;

  hero: {
    eyebrow: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    /** Images carry alt text, unlike a bare string[]. */
    gallery: ImageAsset[];
  };

  partnership: {
    title: string;
  };

  courses: {
    title: string;
    description: string;
  };

  whyChooseUs: {
    title: string;
    description: string;
    /** The collage places the first three; fewer fall back to a simpler layout. */
    images: ImageAsset[];
    features: TrainingFeature[];
  };

  process: {
    title: string;
    description?: string;
    steps: TrainingProcessStep[];
  };

  programs: {
    title: string;
    description: string;
    items: TrainingProgram[];
  };

  testimonials: {
    title: string;
    description: string;
  };

  cta: {
    title: string;
    description: string;
    label: string;
    href: string;
  };
}

/**
 * A training page's text (from the training_pages table). The lists and
 * images are loaded separately and merged in to make TrainingPageData.
 */
export type TrainingPageCopy = Omit<TrainingPageData, "hero" | "whyChooseUs" | "process" | "programs"> & {
  hero: Omit<TrainingPageData["hero"], "gallery">;
  whyChooseUs: Omit<TrainingPageData["whyChooseUs"], "images" | "features">;
  process: Omit<TrainingPageData["process"], "steps">;
  programs: Omit<TrainingPageData["programs"], "items">;
};

export type TrainingMode = "online" | "on_site" | "hybrid";

export type TrainingInquiryStatus = "new" | "contacted" | "in_progress" | "completed" | "closed";

/** Prepared for the future inquiry form / Supabase table; not used by the UI yet. */
export interface TrainingInquiry {
  id: string;
  training_type: TrainingType;

  organization_name: string;
  contact_person: string;

  email: string;
  phone?: string;

  participants?: number;
  preferred_duration?: string;

  preferred_mode?: TrainingMode;

  message: string;

  status: TrainingInquiryStatus;

  created_at?: string;
}
