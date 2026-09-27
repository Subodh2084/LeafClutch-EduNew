import {
  createInstructor,
  deleteInstructor,
  removeInstructorImage,
  updateInstructor,
  uploadInstructorImage,
} from "@/actions/instructors";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { instructorFields } from "@/components/admin/field-sets";
import { getAdminInstructors } from "@/lib/admin/queries";

export const metadata = { title: "Instructors" };

export default async function InstructorsPage() {
  const instructors = await getAdminInstructors();
  return (
    <>
      <PageHeader
        title="Instructors"
        description="Assign instructors on each course's page. Hidden instructors disappear from every course and the About page."
      />
      <ResourceManager
        title="Instructors"
        rows={instructors}
        fields={instructorFields}
        labelKey="name"
        metaKeys={["designation"]}
        create={createInstructor}
        update={updateInstructor}
        remove={deleteInstructor}
        image={{ key: "image", label: "Photo", upload: uploadInstructorImage, clear: removeInstructorImage }}
        addLabel="Add instructor"
      />
    </>
  );
}
