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
  title: "Academic Training",
  description:
    "Industry-focused technology training for colleges and schools: hands-on projects, experienced mentors, workshops, bootcamps and faculty development.",
};

export default async function AcademicTrainingPage() {
  const { content, partners, courses, testimonials } = await getTrainingPage("academic");

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
