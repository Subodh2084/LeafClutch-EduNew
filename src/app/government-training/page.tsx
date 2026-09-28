import type { Metadata } from "next";

import { TrainingContact } from "@/components/training/TrainingContact";
import { TrainingCTA } from "@/components/training/TrainingCTA";
import { TrainingHero } from "@/components/training/TrainingHero";
import { TrainingProcess } from "@/components/training/TrainingProcess";
import { TrainingPrograms } from "@/components/training/TrainingPrograms";
import { TrainingTestimonials } from "@/components/training/TrainingTestimonials";
import { TrainingWhyChooseUs } from "@/components/training/TrainingWhyChooseUs";
import { getTrainingPage } from "@/lib/training";

export const metadata: Metadata = {
  title: "Government Training",
  description:
    "Practical digital skills training for government teams and public institutions: data, cybersecurity awareness, emerging technology and technical capacity building.",
};

export default async function GovernmentTrainingPage() {
  const { content, testimonials, contact } = await getTrainingPage("government");

  return (
    <main id="main" className="flex-1">
      <TrainingHero hero={content.hero} />
      <TrainingWhyChooseUs data={content.whyChooseUs} />
      <TrainingProcess data={content.process} />
      <TrainingPrograms data={content.programs} />
      <TrainingTestimonials intro={content.testimonials} testimonials={testimonials} />
      <TrainingCTA data={content.cta} />
      <TrainingContact type="government" info={contact.info} content={contact.content} />
    </main>
  );
}
