import type { Metadata } from "next";

import { PartnershipMarquee } from "@/components/training/PartnershipMarquee";
import { TrainingCourses } from "@/components/training/TrainingCourses";
import { TrainingCTA } from "@/components/training/TrainingCTA";
import { TrainingHero } from "@/components/training/TrainingHero";
import { TrainingProcess } from "@/components/training/TrainingProcess";
import { TrainingPrograms } from "@/components/training/TrainingPrograms";
import { TrainingTestimonials } from "@/components/training/TrainingTestimonials";
import { TrainingWhyChooseUs } from "@/components/training/TrainingWhyChooseUs";
import { getTrainingPage } from "@/lib/training";

export const metadata: Metadata = {
  title: "Corporate Training",
  description:
    "Practical, customized technology training for businesses and organizations in Nepal: AI and automation, data, cloud, cybersecurity and more, delivered on-site, online or hybrid.",
};

export default async function CorporateTrainingPage() {
  const { content, partners, courses, testimonials } = await getTrainingPage("corporate");

  return (
    <main id="main" className="flex-1">
      <TrainingHero hero={content.hero} />
      <PartnershipMarquee title={content.partnership.title} partners={partners} />
      <TrainingCourses {...content.courses} courses={courses} />
      <TrainingWhyChooseUs data={content.whyChooseUs} />
      <TrainingProcess data={content.process} />
      <TrainingPrograms data={content.programs} />
      <TrainingTestimonials intro={content.testimonials} testimonials={testimonials} />
      <TrainingCTA data={content.cta} />
    </main>
  );
}
