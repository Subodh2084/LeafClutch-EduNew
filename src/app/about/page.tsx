import type { Metadata } from "next";

import { AboutFeatures } from "@/components/about/AboutFeatures";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutLearningExperience } from "@/components/about/AboutLearningExperience";
import { AboutMentors } from "@/components/about/AboutMentors";
import { AboutValues } from "@/components/about/AboutValues";
import { AboutVisionMission } from "@/components/about/AboutVisionMission";
import { AboutWhoWeAre } from "@/components/about/AboutWhoWeAre";
import { CTA } from "@/components/home/CTA";
import { getAboutPageData } from "@/lib/content";
import { getInstructors } from "@/lib/courses";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "LeafClutch Technologies is a technology training institute in Nepal offering practical, project-based courses taught by working professionals.",
};

export default async function AboutPage() {
  const [{ content, stats, values, features, learningSteps }, mentors] = await Promise.all([
    getAboutPageData(),
    getInstructors(),
  ]);

  return (
    <main id="main" className="flex-1">
      <AboutHero hero={content.hero} />
      <AboutWhoWeAre intro={content.whoWeAre} stats={stats} />
      <AboutValues intro={content.values} values={values} />
      <AboutVisionMission content={content.visionMission} />
      <AboutFeatures intro={content.features} features={features} />
      <AboutMentors intro={content.mentors} mentors={mentors} />
      <AboutLearningExperience intro={content.learningExperience} steps={learningSteps} />
      <CTA title={content.cta.title} description={content.cta.description} className="pt-16 sm:pt-24" />
    </main>
  );
}
