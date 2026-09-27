import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCourses } from "@/lib/admin/queries";
import { formatPrice, getCoursePricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const metadata = { title: "Courses" };

const statusStyle: Record<string, string> = {
  published: "bg-green/15 text-navy",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

export default async function CoursesAdminPage() {
  const courses = await getAdminCourses();

  return (
    <>
      <PageHeader title="Courses" description="Only published courses appear on the website.">
        <Link href="/admin/courses/new" className={cn(buttonVariants({ size: "lg" }), "bg-navy text-white hover:bg-navy/90")}>
          <Plus data-icon="inline-start" /> New course
        </Link>
      </PageHeader>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-surface-gray/50 text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-surface-blue/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/courses/${course.id}`} className="font-medium text-navy hover:underline">
                    {course.name}
                  </Link>
                  {course.is_featured && <span className="ml-2 text-xs text-muted-foreground">featured</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{course.category?.name}</td>
                <td className="px-4 py-3 tabular-nums">{formatPrice(getCoursePricing(course).current)}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded px-2 py-0.5 text-xs", statusStyle[course.status])}>{course.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
