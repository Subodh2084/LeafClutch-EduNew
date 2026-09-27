import Link from "next/link";

import { createTrainingPageItem, deleteTrainingPageItem, updateTrainingPageItem } from "@/actions/training-pages";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { processStepFields, trainingTypeOptions } from "@/components/admin/field-sets";
import { getAdminSharedSteps } from "@/lib/admin/queries";

export const metadata = { title: "Training pages" };

export default async function TrainingAdminPage() {
  const steps = await getAdminSharedSteps();
  return (
    <>
      <PageHeader
        title="Training pages"
        description="Partners, features, programs and photos are managed per page. Headings and paragraphs are part of the site's code."
      />
      <ul className="mb-8 grid gap-4 sm:grid-cols-3">
        {trainingTypeOptions.map((type) => (
          <li key={type.value}>
            <Link
              href={`/admin/training/${type.value}`}
              className="block rounded-xl border bg-white p-5 font-medium text-navy hover:border-navy/40"
            >
              {type.label} training →
            </Link>
          </li>
        ))}
      </ul>
      <ResourceManager
        title="Process steps (all training pages)"
        description="Shown on all three pages, numbered in order."
        rows={steps}
        fields={processStepFields}
        fixed={{ section: "process_step", type: null, icon: null }}
        labelKey="title"
        metaKeys={["description"]}
        create={createTrainingPageItem}
        update={updateTrainingPageItem}
        remove={deleteTrainingPageItem}
        addLabel="Add step"
      />
    </>
  );
}
