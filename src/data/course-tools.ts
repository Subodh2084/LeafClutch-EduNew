import type { CourseTool } from "@/types/course";

// PLACEHOLDER until a course_tools table exists. Keyed by course slug and merged
// into the course detail by getCourseBySlug (lib/courses) — the only swap point.
// Each list names only tools the course's curriculum already covers.

export const courseTools: Record<string, CourseTool[]> = {
  "mern-stack-development": [
    { id: "mern-javascript", name: "JavaScript", icon: "javascript", description: "ES6+ and async code" },
    { id: "mern-react", name: "React", icon: "react", description: "Components, state and routing" },
    { id: "mern-node", name: "Node.js", icon: "nodejs", description: "Server-side JavaScript" },
    { id: "mern-express", name: "Express", icon: "express", description: "REST APIs and middleware" },
    { id: "mern-mongodb", name: "MongoDB", icon: "mongodb", description: "Document database" },
    { id: "mern-mongoose", name: "Mongoose", icon: "mongoose", description: "Schemas and models" },
  ],
  "data-science-with-python": [
    { id: "ds-python", name: "Python", icon: "python", description: "The language for the whole course" },
    { id: "ds-numpy", name: "NumPy", icon: "numpy", description: "Fast numerical arrays" },
    { id: "ds-pandas", name: "pandas", icon: "pandas", description: "Cleaning and reshaping data" },
    { id: "ds-sql", name: "SQL", icon: null, description: "Queries and joins" },
    { id: "ds-matplotlib", name: "Matplotlib", icon: null, description: "Charts and plots" },
    { id: "ds-seaborn", name: "Seaborn", icon: null, description: "Statistical visualisation" },
  ],
};
