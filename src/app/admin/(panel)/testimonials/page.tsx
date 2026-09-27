import {
  createTestimonial,
  deleteTestimonial,
  removeTestimonialImage,
  updateTestimonial,
  uploadTestimonialImage,
} from "@/actions/content";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { testimonialFields } from "@/components/admin/field-sets";
import { getAdminCourseOptions, getAdminTestimonials } from "@/lib/admin/queries";

export const metadata = { title: "Testimonials" };

const shownOn: Record<string, string> = {
  student: "Home page",
  corporate: "Corporate training",
  academic: "Academic training",
  government: "Government training",
};

export default async function TestimonialsPage() {
  const [testimonials, courses] = await Promise.all([getAdminTestimonials(), getAdminCourseOptions()]);
  const rows = testimonials.map((testimonial) => ({
    ...testimonial,
    where: shownOn[String(testimonial.type)],
    featured: testimonial.is_featured ? "featured" : "not featured",
  }));

  return (
    <>
      <PageHeader title="Testimonials" description="Each page shows up to three featured, visible testimonials of its type." />
      <ResourceManager
        title="Testimonials"
        rows={rows}
        fields={testimonialFields(courses)}
        labelKey="name"
        metaKeys={["where", "featured", "designation"]}
        create={createTestimonial}
        update={updateTestimonial}
        remove={deleteTestimonial}
        image={{ key: "image", label: "Photo", upload: uploadTestimonialImage, clear: removeTestimonialImage }}
        addLabel="Add testimonial"
      />
    </>
  );
}
