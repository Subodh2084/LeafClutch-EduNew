"use client";

import { useRouter } from "next/navigation";

import { createCourse } from "@/actions/courses";

import { EntityForm } from "./EntityForm";
import type { FieldDef } from "./fields";

/** Creates the course, then opens its edit page for curriculum, instructors and files. */
export function NewCourseForm({ fields }: { fields: FieldDef[] }) {
  const router = useRouter();
  const categoryField = fields.find((f) => f.name === "category_id");
  const defaultCategory = categoryField?.options?.[0]?.value ?? "";

  return (
    <EntityForm
      fields={fields}
      initial={{
        status: "draft",
        learning_mode: "online",
        certificate_available: true,
        training_types: [],
        category_id: defaultCategory,
      }}
      submitLabel="Create course"
      submit={async (values: Parameters<typeof createCourse>[0]) => {
        const result = await createCourse(values);
        if (result.ok) router.push(`/admin/courses/${result.data.id}`);
        return result;
      }}
    />
  );
}
