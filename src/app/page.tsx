import { CourseCategoryMarquee } from "@/components/home/CourseCategoryMarquee";
import { CTA } from "@/components/home/CTA";
import { FAQSection } from "@/components/home/FAQSection";
import { Hero } from "@/components/home/Hero";
import { HeroStats } from "@/components/home/HeroStats";
import { OfferModal } from "@/components/home/OfferModal";
import { PopularCourses } from "@/components/home/PopularCourses";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import {
  getActiveOffers,
  getFeaturedTestimonials,
  getHomeStats,
  getSiteFAQs,
  getSiteSettings,
  getWhyChooseUs,
} from "@/lib/content";
import {
  getCourseCategories,
  getCourseNavigation,
  getFeaturedCourses,
  getPublishedCourses,
} from "@/lib/courses";

export default async function Home() {
  const [courses, featuredCourses, categories, categoryGroups, stats, whyChooseUs, testimonials, faqs, offers, siteSettings] =
    await Promise.all([
      getPublishedCourses(),
      getFeaturedCourses(),
      getCourseCategories(),
      getCourseNavigation(),
      getHomeStats(),
      getWhyChooseUs(),
      getFeaturedTestimonials(),
      getSiteFAQs(),
      getActiveOffers(),
      getSiteSettings(),
    ]);

  const activeOffer = offers[0] ?? null;

  return (
    <main id="main" className="flex-1">
      <Hero courses={courses} featuredCourses={featuredCourses} />
      <HeroStats stats={stats} />
      <CourseCategoryMarquee groups={categoryGroups} />
      <PopularCourses courses={courses} categories={categories} />
      <WhyChooseUs features={whyChooseUs.features} images={whyChooseUs.images} />
      <Testimonials testimonials={testimonials} />
      <CTA />
      <FAQSection faqs={faqs} />
      {activeOffer && (
        <OfferModal offer={activeOffer} whatsappNumber={siteSettings.whatsapp} />
      )}
    </main>
  );
}
