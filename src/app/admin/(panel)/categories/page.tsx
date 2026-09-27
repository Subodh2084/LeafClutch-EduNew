import {
  createCategory,
  deleteCategory,
  removeCategoryImage,
  updateCategory,
  uploadCategoryImage,
} from "@/actions/content";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { categoryFields } from "@/components/admin/field-sets";
import { getAdminCategories } from "@/lib/admin/queries";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <>
      <PageHeader title="Course categories" description="A category can only be deleted once no course uses it." />
      <ResourceManager
        title="Categories"
        rows={categories}
        fields={categoryFields}
        labelKey="name"
        metaKeys={["slug"]}
        create={createCategory}
        update={updateCategory}
        remove={deleteCategory}
        image={{
          key: "image_url",
          label: "Category photo / image",
          upload: uploadCategoryImage,
          clear: removeCategoryImage,
        }}
        addLabel="Add category"
      />
    </>
  );
}
