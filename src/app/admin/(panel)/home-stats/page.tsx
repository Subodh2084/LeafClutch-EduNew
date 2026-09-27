import { createHomeStat, deleteHomeStat, updateHomeStat } from "@/actions/home-stats";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { homeStatFields } from "@/components/admin/field-sets";
import { getAdminHomeStats } from "@/lib/admin/queries";

export const metadata = { title: "Home stats" };

export default async function HomeStatsPage() {
  const stats = await getAdminHomeStats();
  return (
    <>
      <PageHeader title="Home stats" description="The numbers on the home page and the About page. Four fit best." />
      <ResourceManager
        title="Stats"
        rows={stats}
        fields={homeStatFields}
        labelKey="label"
        metaKeys={["value"]}
        create={createHomeStat}
        update={updateHomeStat}
        remove={deleteHomeStat}
        addLabel="Add stat"
      />
    </>
  );
}
