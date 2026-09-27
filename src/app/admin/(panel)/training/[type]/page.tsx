import { notFound } from "next/navigation";

import {
  addTrainingPageImage,
  createTrainingPageItem,
  deleteTrainingPageImage,
  deleteTrainingPageItem,
  replaceTrainingPageImageFile,
  updateTrainingPageImage,
  updateTrainingPageItem,
} from "@/actions/training-pages";
import {
  createTrainingPartner,
  deleteTrainingPartner,
  removeTrainingPartnerLogo,
  updateTrainingPartner,
  uploadTrainingPartnerLogo,
} from "@/actions/training-partners";
import { ImageAdder } from "@/components/admin/ImageAdder";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import {
  partnerFields,
  trainingCardFields,
  trainingImageFields,
  trainingTypeOptions,
} from "@/components/admin/field-sets";
import { getAdminTrainingPage } from "@/lib/admin/queries";
import type { TrainingType } from "@/types/training";

const placementLabel: Record<string, string> = { hero: "Hero slider", why_choose_us: "Collage" };

export default async function TrainingTypeAdminPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const option = trainingTypeOptions.find((o) => o.value === type);
  if (!option) notFound();

  const page = await getAdminTrainingPage(type as TrainingType);
  const images = page.images.map((image) => ({ ...image, where: placementLabel[String(image.placement)] }));

  return (
    <>
      <PageHeader
        title={`${option.label} training`}
        description={`Everything on /${type}-training except the headings and paragraphs.`}
        back={{ href: "/admin/training", label: "Training pages" }}
      />
      <div className="space-y-6">
        <ResourceManager
          title="Partners"
          description="Shown in the logo strip under the hero."
          rows={page.partners}
          fields={partnerFields}
          fixed={{ type }}
          labelKey="name"
          metaKeys={["website"]}
          create={createTrainingPartner}
          update={updateTrainingPartner}
          remove={deleteTrainingPartner}
          image={{ key: "logo", label: "Logo", upload: uploadTrainingPartnerLogo, clear: removeTrainingPartnerLogo }}
          addLabel="Add partner"
        />

        <ResourceManager
          title="Why choose us"
          rows={page.features}
          fields={trainingCardFields}
          fixed={{ type, section: "feature" }}
          labelKey="title"
          metaKeys={["icon", "description"]}
          create={createTrainingPageItem}
          update={updateTrainingPageItem}
          remove={deleteTrainingPageItem}
          addLabel="Add feature"
        />

        <ResourceManager
          title="Programs"
          rows={page.programs}
          fields={trainingCardFields}
          fixed={{ type, section: "program" }}
          labelKey="title"
          metaKeys={["icon", "description"]}
          create={createTrainingPageItem}
          update={updateTrainingPageItem}
          remove={deleteTrainingPageItem}
          addLabel="Add program"
        />

        <section className="overflow-hidden rounded-xl border bg-white">
          <header className="border-b px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Photos</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Hero slider photos and the why-choose-us collage (the first three are used).
            </p>
          </header>
          <ImageAdder add={addTrainingPageImage} fixed={{ type }} />
          <ResourceManager
            title="Current photos"
            rows={images}
            fields={trainingImageFields}
            fixed={{ type }}
            labelKey="alt"
            metaKeys={["where", "display_order"]}
            update={updateTrainingPageImage}
            remove={deleteTrainingPageImage}
            image={{ key: "image_url", label: "Photo", upload: replaceTrainingPageImageFile }}
            emptyText="No photos yet."
          />
        </section>
      </div>
    </>
  );
}
