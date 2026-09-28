export type FaqCategory = "general" | "course" | "enrollment" | "payment" | "certificate";

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  /** null for site-wide FAQs; set for course-specific ones. */
  course_id: string | null;
  is_active: boolean;
  display_order: number;
}

export type TestimonialType = "student" | "corporate" | "academic" | "government";

export interface Testimonial {
  id: string;
  type: TestimonialType;
  name: string;
  image: string | null;
  /** Set for student reviews of a course; null for organisation testimonials. */
  course_id: string | null;
  course_name: string | null;
  /** Role and organisation, shown instead of the course, e.g. "HR Manager, Summit Logistics". */
  designation: string | null;
  review: string;
  rating: number | null;
  is_active: boolean;
  is_featured: boolean;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export type FeatureIcon =
  | "practical"
  | "mentor"
  | "projects"
  | "certificate"
  | "flexible"
  | "curriculum"
  | "career";

export interface Feature {
  id: string;
  icon: FeatureIcon;
  title: string;
  description: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

/** The single row of global settings. */
export interface SiteSettings {
  /** Short notice shown above the navbar on every public page; empty hides it. */
  announcement?: string | null;
  site_name?: string | null;
  logo_url?: string | null;
  footer_logo_url?: string | null;
  favicon_url?: string | null;
  description?: string | null;
  email: string | null;
  phone: string | null;
  /** International format, digits only, no "+". */
  whatsapp: string | null;
  address: string | null;
  /** Google Maps "Embed a map" link for the Contact page. */
  map_embed_url?: string | null;
  social_links: SocialLink[];
  /** Shown on the Contact page, e.g. { days: "Sunday – Friday", hours: "9:00 AM – 6:00 PM" }. */
  opening_hours: { days: string; hours: string }[];
}

export interface Offer {
  id: string;
  course_id: string | null;
  course_name: string | null;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number | null;
  discount_price: number | null;
  is_active: boolean;
  display_order: number;
}
