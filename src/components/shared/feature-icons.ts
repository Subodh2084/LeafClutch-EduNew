import {
  Award,
  BriefcaseBusiness,
  CalendarClock,
  FolderCode,
  Laptop,
  RefreshCw,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import type { FeatureIcon } from "@/types/content";

/** Lucide icon for each Feature.icon key. Shared by the home and About pages. */
export const featureIcons: Record<FeatureIcon, LucideIcon> = {
  practical: Laptop,
  mentor: UsersRound,
  projects: FolderCode,
  certificate: Award,
  flexible: CalendarClock,
  curriculum: RefreshCw,
  career: BriefcaseBusiness,
};
