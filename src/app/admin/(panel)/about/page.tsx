import { createAboutItem, deleteAboutItem, updateAboutItem } from "@/actions/site-content";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { aboutItemFields } from "@/components/admin/field-sets";
import { getAdminAboutItems } from "@/lib/admin/queries";

export const metadata = { title: "About page" };

const sections = [
  { key: "value", title: "Our values" },
  { key: "feature", title: "Why learn with us" },
  { key: "learning_step", title: "How you learn (steps)" },
] as const;

export default async function AboutAdminPage() {
  const items = await getAdminAboutItems();
  return (
    <>
      <PageHeader
        title="About page"
        description="The cards on the About page. Headings and paragraphs are part of the site's code."
      />
      <div className="space-y-6">
        {sections.map((section) => (
          <ResourceManager
            key={section.key}
            title={section.title}
            rows={items.filter((item) => item.section === section.key)}
            fields={aboutItemFields(section.key)}
            fixed={{ section: section.key }}
            labelKey="title"
            metaKeys={["description"]}
            create={createAboutItem}
            update={updateAboutItem}
            remove={deleteAboutItem}
            addLabel="Add card"
          />
        ))}
      </div>
    </>
  );
}
