import { CTA } from "@/components/home/CTA";
import type { TrainingPageData } from "@/types/training";

/** The site's closing CTA band with a single training inquiry action. */
export function TrainingCTA({ data }: { data: TrainingPageData["cta"] }) {
  return (
    <CTA
      title={data.title}
      description={data.description}
      primaryAction={{ label: data.label, href: data.href }}
      secondaryAction={null}
    />
  );
}
