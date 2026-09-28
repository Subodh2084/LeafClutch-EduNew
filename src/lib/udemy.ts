import "server-only";

import { z } from "zod";

import { UserError } from "@/lib/admin/actions";

// Reads a Udemy course's public details from its link, for the admin's
// "Add from Udemy link" helper. This uses Udemy's own (undocumented) course
// API, so it can stop working at any time — the details are saved in our
// database and stay editable, and courses can always be added by hand.

const apiResponse = z.object({
  title: z.string(),
  headline: z.string().nullish(),
  image_480x270: z.string().url(),
  avg_rating: z.number().nullish(),
  num_reviews: z.number().nullish(),
  num_lectures: z.number().nullish(),
  instructional_level: z.string().nullish(),
  content_info: z.string().nullish(),
  visible_instructors: z.array(z.object({ display_name: z.string() })).nullish(),
});

export interface UdemyCourseDetails {
  title: string;
  description: string;
  image_url: string;
  instructor: string;
  rating: number;
  ratings_count: number;
  total_hours: string;
  lectures: number;
  level: string;
  course_url: string;
}

/** The course slug from a link like https://www.udemy.com/course/web-dev-master/. */
export function udemySlugFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (!/(^|\.)udemy\.com$/.test(parsed.hostname)) return null;
    return parsed.pathname.match(/^\/course\/([a-z0-9-]+)\/?/i)?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Fetches the details for a Udemy course link, or throws a UserError the admin can read. */
export async function fetchUdemyCourse(url: string): Promise<UdemyCourseDetails> {
  const slug = udemySlugFromUrl(url);
  if (!slug) throw new UserError("That isn't a Udemy course link. It should look like https://www.udemy.com/course/…");

  const fields = [
    "title", "headline", "image_480x270", "avg_rating", "num_reviews", "num_lectures",
    "instructional_level", "content_info", "visible_instructors",
  ].join(",");
  const api = `https://www.udemy.com/api-2.0/courses/${slug}/?fields[course]=${fields}&fields[user]=display_name`;

  let response: Response;
  try {
    response = await fetch(api, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; LeafClutch admin)" },
    });
  } catch {
    throw new UserError("Couldn't reach Udemy. Try again, or add the course manually.");
  }
  if (response.status === 404) throw new UserError("Udemy has no course at that link.");
  if (!response.ok) {
    throw new UserError(`Udemy didn't return the course details (error ${response.status}). Add the course manually.`);
  }

  const parsed = apiResponse.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new UserError("Udemy's reply wasn't in the expected format. Add the course manually.");
  const course = parsed.data;

  return {
    title: course.title,
    description: course.headline ?? "",
    image_url: course.image_480x270,
    instructor: course.visible_instructors?.map((i) => i.display_name).join(", ") || "Udemy instructor",
    rating: Math.round((course.avg_rating ?? 0) * 10) / 10,
    ratings_count: course.num_reviews ?? 0,
    // "100 total hours" → "100 hours", "45 total mins" → "45 mins"
    total_hours: (course.content_info ?? "").replace(/\s*total\s*/i, " ").trim(),
    lectures: course.num_lectures ?? 0,
    level: course.instructional_level ?? "All Levels",
    course_url: `https://www.udemy.com/course/${slug}/`,
  };
}
