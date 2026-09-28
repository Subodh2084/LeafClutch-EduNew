import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addCourseUdemyBonusFromLink,
  createCourseBenefit,
  createCourseInstallment,
  createCourseLesson,
  createCourseModule,
  createCourseTool,
  createCourseUdemyBonus,
  deleteCourseBenefit,
  deleteCourseInstallment,
  deleteCourseLesson,
  deleteCourseModule,
  deleteCourseTool,
  deleteCourseUdemyBonus,
  removeCourseThumbnail,
  setCourseInstructors,
  updateCourse,
  updateCourseBenefit,
  updateCourseInstallment,
  updateCourseLesson,
  updateCourseModule,
  updateCourseTool,
  updateCourseUdemyBonus,
  uploadCourseThumbnail,
  uploadCourseUdemyBonusImage,
} from "@/actions/courses";
import { DeleteCourseButton } from "@/components/admin/DeleteCourseButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { FileUpload } from "@/components/admin/FileUpload";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { UdemyLinkAdder } from "@/components/admin/UdemyLinkAdder";
import {
  benefitFields,
  courseFields,
  courseToolFields,
  installmentFields,
  orderedItemFields,
  udemyBonusFields,
} from "@/components/admin/field-sets";
import { getAdminCategories, getAdminCourse, getAdminInstructors } from "@/lib/admin/queries";

export const metadata = { title: "Edit course" };

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-white p-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, categories, instructors] = await Promise.all([
    getAdminCourse(id),
    getAdminCategories(),
    getAdminInstructors(),
  ]);
  if (!course) notFound();

  const categoryOptions = categories.map((category) => ({ value: category.id, label: String(category.name) }));
  const instructorOptions = instructors.map((instructor) => ({
    value: instructor.id,
    label: `${String(instructor.name)}${instructor.is_active ? "" : " (hidden)"}`,
  }));
  const { fields, modules, benefits, installments, tools, udemyBonus, instructorIds } = course;
  const name = String(fields.name);

  return (
    <>
      <PageHeader title={name} back={{ href: "/admin/courses", label: "Courses" }}>
        {fields.status === "published" && (
          <Link href={`/courses/${String(fields.slug)}`} target="_blank" className="text-sm text-navy underline">
            View on site ↗
          </Link>
        )}
      </PageHeader>

      <div className="space-y-6">
        <Card title="Details">
          <EntityForm
            fields={courseFields(categoryOptions)}
            initial={fields}
            submit={updateCourse.bind(null, id)}
          />
        </Card>

        <Card
          title="Thumbnail"
          description="The curriculum PDF is created automatically from the modules and lessons below."
        >
          <FileUpload
            label="Thumbnail"
            kind="image"
            currentUrl={(fields.thumbnail as string | null) ?? null}
            upload={uploadCourseThumbnail.bind(null, id)}
            clear={removeCourseThumbnail.bind(null, id)}
          />
        </Card>

        <Card title="Instructors" description="Tick the instructors who teach this course.">
          <EntityForm
            fields={[{ name: "instructor_ids", label: "Instructors", type: "multiselect", options: instructorOptions, wide: true }]}
            initial={{ instructor_ids: instructorIds }}
            submit={async (values: { instructor_ids: string[] }) => {
              "use server";
              return setCourseInstructors(id, values.instructor_ids);
            }}
          />
        </Card>

        <ResourceManager
          title="What you will get"
          rows={benefits}
          fields={benefitFields}
          labelKey="title"
          metaKeys={["description"]}
          create={createCourseBenefit.bind(null, id)}
          update={updateCourseBenefit}
          remove={deleteCourseBenefit}
          addLabel="Add benefit"
        />

        <ResourceManager
          title="Curriculum modules"
          description="Lessons are managed under each module below."
          rows={modules.map(({ lessons, ...module }) => ({ ...module, lesson_count: `${lessons.length} lessons` }))}
          fields={orderedItemFields}
          labelKey="title"
          metaKeys={["lesson_count"]}
          create={createCourseModule.bind(null, id)}
          update={updateCourseModule}
          remove={deleteCourseModule}
          addLabel="Add module"
        />

        {modules.map((module, index) => (
          <ResourceManager
            key={module.id}
            title={`Module ${index + 1} lessons: ${String(module.title)}`}
            rows={module.lessons}
            fields={orderedItemFields}
            labelKey="title"
            create={createCourseLesson.bind(null, module.id)}
            update={updateCourseLesson}
            remove={deleteCourseLesson}
            addLabel="Add lesson"
            emptyText="No lessons yet."
          />
        ))}

        <ResourceManager
          title="Tools covered"
          rows={tools}
          fields={courseToolFields}
          labelKey="name"
          metaKeys={["description"]}
          create={createCourseTool.bind(null, id)}
          update={updateCourseTool}
          remove={deleteCourseTool}
          addLabel="Add tool"
          emptyText="No tools listed."
        />

        <UdemyLinkAdder add={addCourseUdemyBonusFromLink.bind(null, id)} />

        <ResourceManager
          title="Free Udemy courses"
          description="Udemy courses students get free with this course. Shown on the course page and in the curriculum PDF. If reading from a link fails, use Add manually."
          rows={udemyBonus}
          fields={udemyBonusFields}
          labelKey="title"
          metaKeys={["instructor", "total_hours"]}
          create={createCourseUdemyBonus.bind(null, id)}
          update={updateCourseUdemyBonus}
          remove={deleteCourseUdemyBonus}
          image={{ key: "image_url", label: "Cover image", upload: uploadCourseUdemyBonusImage }}
          addLabel="Add manually"
          emptyText="No Udemy courses."
        />

        <ResourceManager
          title="Instalment plan"
          description="Leave empty for no instalment plan. Percentages should add up to 100."
          rows={installments}
          fields={installmentFields}
          labelKey="title"
          metaKeys={["percentage", "description"]}
          create={createCourseInstallment.bind(null, id)}
          update={updateCourseInstallment}
          remove={deleteCourseInstallment}
          addLabel="Add instalment"
        />

        <Card title="Delete course">
          <DeleteCourseButton id={id} name={name} />
        </Card>
      </div>
    </>
  );
}
