import { createElement } from "react";
import {
  BrainCircuit,
  ChartColumn,
  Cloud,
  CodeXml,
  GraduationCap,
  Palette,
  PenTool,
  ShieldCheck,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  "web-development": CodeXml,
  "ai-ml": BrainCircuit,
  "data-science": ChartColumn,
  "ui-ux": PenTool,
  cybersecurity: ShieldCheck,
  "graphic-design": Palette,
  "cloud-computing": Cloud,
};

export function CategoryIcon({ slug, ...props }: LucideProps & { slug: string }) {
  return createElement(categoryIcons[slug] ?? GraduationCap, { "aria-hidden": true, ...props });
}
