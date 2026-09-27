import { NewCourseForm } from "@/components/admin/NewCourseForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { courseFields } from "@/components/admin/field-sets";
import { getAdminCategories } from "@/lib/admin/queries";

export const metadata = { title: "New course" };

export default async function NewCoursePage() {
  const categories = await getAdminCategories();
  const options = categories.map((category) => ({ value: category.id, label: String(category.name) }));

  return (
    <>
      <PageHeader
        title="New course"
        description="Save the basics first; the curriculum, instructors and files are added on the next page."
        back={{ href: "/admin/courses", label: "Courses" }}
      />
      <div className="rounded-xl border bg-white p-5">
        <NewCourseForm fields={courseFields(options)} />
      </div>
    </>
  );
}
