import {
  BadgeCheck,
  BookOpen,
  Compass,
  DoorOpen,
  Eye,
  Hammer,
  PencilRuler,
  Sprout,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import type { AboutIcon } from "@/types/about";

/** Lucide icon for each AboutIcon key used in the About page data. */
export const aboutIcons: Record<AboutIcon, LucideIcon> = {
  guidance: Compass,
  inclusive: DoorOpen,
  quality: BadgeCheck,
  growth: Sprout,
  mission: Target,
  vision: Eye,
  learn: BookOpen,
  practice: PencilRuler,
  build: Hammer,
  grow: TrendingUp,
};
