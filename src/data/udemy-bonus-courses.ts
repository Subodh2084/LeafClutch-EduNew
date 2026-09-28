import type { UdemyBonusCourse } from "@/types/course";

// PLACEHOLDER until Udemy bonus courses are stored in Supabase. Keyed by course
// slug and merged into the course detail by getCourseBySlug (lib/courses).
// This is content LeafClutch maintains; nothing here is fetched from Udemy.

const webDevelopment: UdemyBonusCourse = {
  id: "udemy-web-development",
  title: "Complete web development course",
  description:
    "Only web development course that you will need. Covers HTML, CSS, Tailwind, Node, React, MongoDB, Prisma, Deployment etc",
  image_url: "https://img-c.udemycdn.com/course/480x270/6035102_7d1a.jpg",
  instructor: "Hitesh Choudhary",
  rating: 4.5,
  ratings_count: 22660,
  total_hours: "99h 48m",
  lectures: 331,
  level: "All Levels",
  course_url: "https://www.udemy.com/course/web-dev-master/",
};

export const udemyBonusCourses: Record<string, UdemyBonusCourse[]> = {
  "mern-stack-development": [webDevelopment],
};
