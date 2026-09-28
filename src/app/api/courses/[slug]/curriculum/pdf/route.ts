import { readFile } from "node:fs/promises";
import path from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";

import { CourseCurriculumPdf } from "@/components/courses/CourseCurriculumPdf";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/content";
import { curriculumPdfFilename } from "@/lib/course-display";
import { getCourseBySlug } from "@/lib/courses";

// GET /api/courses/[slug]/curriculum/pdf — the curriculum of one published
// course as a PDF, built from the same getCourseBySlug data as its page.

const LOGO_PATH = path.join(process.cwd(), "public/companyLogo/leafclutch-logo.png");

function error(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

export async function GET(_request: Request, ctx: RouteContext<"/api/courses/[slug]/curriculum/pdf">) {
  const { slug } = await ctx.params;

  let course;
  let siteName: string;
  try {
    const [detail, settings] = await Promise.all([getCourseBySlug(slug), getSiteSettings()]);
    course = detail;
    siteName = settings.site_name || siteConfig.name;
  } catch (cause) {
    console.error(`Curriculum PDF: could not load course "${slug}"`, cause);
    return error(503, "The course could not be loaded. Please try again.");
  }

  if (!course) return error(404, "Course not found.");
  // No curriculum: never hand out an empty document.
  if (course.modules.length === 0) return error(404, "This course has no curriculum yet.");

  try {
    const logo = await readFile(LOGO_PATH);
    const document = createElement(CourseCurriculumPdf, { course, siteName, logo });
    const pdf = await renderToBuffer(document as unknown as ReactElement<DocumentProps>);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${curriculumPdfFilename(course.slug)}"`,
        // Repeat downloads within a few minutes reuse the file instead of regenerating it.
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (cause) {
    console.error(`Curriculum PDF: could not render "${slug}"`, cause);
    return error(500, "The PDF could not be generated. Please try again.");
  }
}
