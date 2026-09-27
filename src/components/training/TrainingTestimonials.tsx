import { Testimonials } from "@/components/home/Testimonials";
import type { Testimonial } from "@/types/content";
import type { TrainingPageData } from "@/types/training";

interface TrainingTestimonialsProps {
  intro: TrainingPageData["testimonials"];
  /** Already filtered to this training type by the data layer. */
  testimonials: Testimonial[];
}

/** The site's testimonial section with training-specific copy. */
export function TrainingTestimonials({ intro, testimonials }: TrainingTestimonialsProps) {
  return (
    <Testimonials
      testimonials={testimonials}
      eyebrow="Testimonials"
      title={intro.title}
      description={intro.description}
    />
  );
}
