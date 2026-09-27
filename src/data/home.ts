import type { Feature } from "@/types/content";

export const whyChooseUsFeatures: Feature[] = [
  {
    id: "expert-led",
    icon: "mentor",
    title: "Expert-led learning",
    description: "Learn from practitioners who build and ship software for a living.",
  },
  {
    id: "hands-on",
    icon: "projects",
    title: "Hands-on projects",
    description: "Every module ends in something you build, not just a quiz.",
  },
  {
    id: "certification",
    icon: "certificate",
    title: "Industry certification",
    description: "Earn a LeafClutch certificate that shows what you can actually do.",
  },
  {
    id: "flexible",
    icon: "flexible",
    title: "Flexible learning",
    description: "Choose online, in-person or hybrid classes to fit your schedule.",
  },
  {
    id: "curriculum",
    icon: "curriculum",
    title: "Up-to-date curriculum",
    description: "Course content is reviewed regularly to match current tools and practice.",
  },
  {
    id: "career",
    icon: "career",
    title: "Career & networking",
    description: "Portfolio reviews, interview preparation and a network of alumni and mentors.",
  },
];

// Placeholder photography, CC0 via Openverse. Replace with real LeafClutch
// classroom photos. Sources:
//   why-focused-learning.jpg  https://cdn.stocksnap.io/img-thumbs/960w/0E0M5W9O3V.jpg
//   why-learning-together.jpg https://live.staticflickr.com/718/32851415932_5b1b685b66_b.jpg
export const whyChooseUsImages = {
  primary: {
    src: "/images/home/why-focused-learning.jpg",
    alt: "A learner working through a course project on a laptop",
  },
  secondary: {
    src: "/images/home/why-learning-together.jpg",
    alt: "Two learners studying side by side on a laptop and tablet",
  },
};
