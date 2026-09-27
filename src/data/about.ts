import type { AboutContent } from "@/types/about";

// PLACEHOLDER About page copy — review with LeafClutch before launch.
// The stats, value/feature/step cards and mentors come from Supabase (lib/content).

// Photo: CC0 via Openverse, by cuboulder. Replace with a real LeafClutch class.
//   https://www.flickr.com/photos/38587132@N02/23928923468
export const aboutData: AboutContent = {
  hero: {
    eyebrow: "About LeafClutch",
    title: "We teach technology the way it is practised at work",
    description:
      "LeafClutch Technologies is a training institute in Nepal. We run practical courses in web development, AI, data science, design and cloud, taught by mentors who build software for a living.",
    image: {
      src: "/images/about/about-coding-class.jpg",
      alt: "Students following a live programming lesson on their laptops",
    },
    cta: { label: "Explore courses", href: "/courses" },
  },
  whoWeAre: {
    eyebrow: "Who we are",
    title: "A training institute run by people who work in tech",
    paragraphs: [
      "LeafClutch started with a simple observation: many graduates know the theory but have never built and shipped a working project. Employers notice the gap.",
      "Our courses close it. Classes stay small, every module ends with something you build, and mentors review your work the way a senior colleague would.",
    ],
  },
  values: {
    eyebrow: "Our values",
    title: "What we stand for",
    description: "The principles behind how we teach, advise and support every learner.",
  },
  visionMission: {
    eyebrow: "Vision & mission",
    title: "Why LeafClutch exists",
    items: [
      {
        id: "vision",
        icon: "vision",
        title: "Our vision",
        statement:
          "A Nepal where anyone with the drive to learn can build a career in technology, whatever their background or degree.",
      },
      {
        id: "mission",
        icon: "mission",
        title: "Our mission",
        statement:
          "To give learners practical, industry-relevant skills through hands-on projects and close mentorship, so they leave ready to do the work.",
      },
    ],
  },
  features: {
    eyebrow: "Why learn with us",
    title: "Built to get you job-ready",
    description: "Everything in a LeafClutch course is there to help you do the work, not just pass a test.",
  },
  mentors: {
    eyebrow: "Our mentors",
    title: "Learn from working professionals",
    description: "Our mentors teach what they practise every day, and they review your work closely.",
  },
  learningExperience: {
    eyebrow: "How you learn",
    title: "From your first lesson to your next role",
    description: "Every course follows the same four stages, so you always know what comes next.",
  },
  cta: {
    title: "Ready to start learning?",
    description:
      "Browse our courses, or tell us what you want to build and we will help you choose the right one.",
  },
};
