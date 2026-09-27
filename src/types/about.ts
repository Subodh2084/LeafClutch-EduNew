import type { Feature, StatItem } from "@/types/content";

export interface ImageAsset {
  src: string;
  alt: string;
}

export interface LinkAction {
  label: string;
  href: string;
}

/** Eyebrow + heading + intro shown above a section. */
export interface SectionIntro {
  eyebrow?: string;
  title: string;
  description?: string;
}

/** Icon keys resolved to Lucide icons in components/about/about-icons. */
export type AboutIcon =
  | "guidance"
  | "inclusive"
  | "quality"
  | "growth"
  | "mission"
  | "vision"
  | "learn"
  | "practice"
  | "build"
  | "grow";

export interface AboutValue {
  id: string;
  icon: AboutIcon;
  title: string;
  description: string;
}

export interface VisionMissionItem {
  id: "vision" | "mission";
  icon: AboutIcon;
  title: string;
  statement: string;
}

export interface LearningStep {
  id: string;
  icon: AboutIcon;
  title: string;
  description: string;
}

export interface AboutContent {
  hero: SectionIntro & { image: ImageAsset; cta: LinkAction };
  whoWeAre: SectionIntro & { paragraphs: string[] };
  values: SectionIntro;
  visionMission: SectionIntro & { items: VisionMissionItem[] };
  features: SectionIntro;
  mentors: SectionIntro;
  learningExperience: SectionIntro;
  cta: { title: string; description: string };
}

/** Everything the About page renders, as one payload. */
export interface AboutPageData {
  content: AboutContent;
  stats: StatItem[];
  values: AboutValue[];
  features: Feature[];
  learningSteps: LearningStep[];
}
