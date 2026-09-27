import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import type { SectionIntro } from "@/types/about";
import type { Instructor } from "@/types/course";

interface AboutMentorsProps {
  intro: SectionIntro;
  mentors: Instructor[];
}

/** Same card content as the course page's CourseInstructor, laid out as a grid. */
export function AboutMentors({ intro, mentors }: AboutMentorsProps) {
  if (mentors.length === 0) return null;

  return (
    <section aria-labelledby="mentors-heading" className="py-16 sm:py-24">
      <Container>
        <SectionHeading id="mentors-heading" {...intro} />
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <li key={mentor.id} className="rounded-xl border bg-white p-6 shadow-card">
              <div className="flex items-center gap-4">
                <PersonAvatar name={mentor.name} image={mentor.image} size="lg" />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">{mentor.name}</h3>
                  <p className="text-sm font-medium text-blue-text">{mentor.designation}</p>
                </div>
              </div>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">{mentor.bio}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
