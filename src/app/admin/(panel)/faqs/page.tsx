import { createFaq, deleteFaq, updateFaq } from "@/actions/content";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { faqFields } from "@/components/admin/field-sets";
import { getAdminCourseOptions, getAdminFaqs } from "@/lib/admin/queries";

export const metadata = { title: "FAQs" };

export default async function FaqsPage() {
  const [faqs, courses] = await Promise.all([getAdminFaqs(), getAdminCourseOptions()]);
  const courseName = new Map(courses.map((course) => [course.value, course.label]));
  const rows = faqs.map((faq) => ({
    ...faq,
    where: faq.course_id ? courseName.get(String(faq.course_id)) : "Home page",
  }));

  return (
    <>
      <PageHeader
        title="FAQs"
        description="FAQs without a course show on the home page; FAQs with a course show on that course's page."
      />
      <ResourceManager
        title="FAQs"
        rows={rows}
        fields={faqFields(courses)}
        labelKey="question"
        metaKeys={["where", "category"]}
        create={createFaq}
        update={updateFaq}
        remove={deleteFaq}
        addLabel="Add FAQ"
      />
    </>
  );
}
