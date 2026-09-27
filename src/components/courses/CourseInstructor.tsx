import { CourseDetailSection } from "@/components/courses/CourseDetailSection";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import type { Instructor } from "@/types/course";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}


export function CourseInstructor({ instructors }: { instructors: Instructor[] }) {
  if (instructors.length === 0) return null;

  return (
    <CourseDetailSection
      id="instructors"
      title={instructors.length === 1 ? "Meet Your Instructor" : "Meet Your Instructors"}
    >
      <ul className="space-y-4">
        {instructors.map((instructor) => (
          <li key={instructor.id} className="flex flex-col gap-5 rounded-xl border bg-white p-6 sm:flex-row">
            <PersonAvatar name={instructor.name} image={instructor.image} size="lg" />
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">{instructor.name}</h3>
                {instructor.linkedin_url && (
                  <a
                    href={instructor.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-[#0a66c2]"
                    aria-label={`LinkedIn profile of ${instructor.name}`}
                  >
                    <LinkedInIcon className="size-5" />
                  </a>
                )}
              </div>
              <p className="text-sm font-medium text-blue-text">{instructor.designation}</p>
              <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-muted-foreground">
                {instructor.bio}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </CourseDetailSection>
  );
}
