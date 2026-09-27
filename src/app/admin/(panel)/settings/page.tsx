import { updateSiteSettings } from "@/actions/site-content";
import { EntityForm } from "@/components/admin/EntityForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { siteSettingsFields } from "@/components/admin/field-sets";
import { getAdminSiteSettings } from "@/lib/admin/queries";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const settings = await getAdminSiteSettings();
  return (
    <>
      <PageHeader
        title="Site settings"
        description="Contact details used in the footer, the Contact page, the enrollment form and the WhatsApp buttons."
      />
      <div className="rounded-xl border bg-white p-5">
        <EntityForm
          fields={siteSettingsFields}
          initial={settings ?? undefined}
          submit={updateSiteSettings}
        />
      </div>
    </>
  );
}
