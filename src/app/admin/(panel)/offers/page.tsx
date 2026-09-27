import {
  createOffer,
  deleteOffer,
  removeOfferThumbnail,
  updateOffer,
  uploadOfferThumbnail,
} from "@/actions/offers";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { offerFields } from "@/components/admin/field-sets";
import { getAdminCourseOptions, getAdminOffers } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/pricing";

export const metadata = { title: "Offers" };

export default async function OffersPage() {
  const [offers, courses] = await Promise.all([getAdminOffers(), getAdminCourseOptions()]);
  const rows = offers.map((offer) => ({
    ...offer,
    course_label: (offer.course_name as string | null) ?? "—",
    price_label: offer.price != null ? formatPrice(Number(offer.price)) : "—",
  }));

  return (
    <>
      <PageHeader
        title="Offers"
        description="Create and manage offers displayed on the home page. Only active offers appear on the website."
      />
      <ResourceManager
        title="Offers"
        rows={rows}
        fields={offerFields(courses)}
        labelKey="title"
        metaKeys={["course_label", "price_label"]}
        create={createOffer}
        update={updateOffer}
        remove={deleteOffer}
        image={{ key: "thumbnail", label: "Offer thumbnail", upload: uploadOfferThumbnail, clear: removeOfferThumbnail }}
        addLabel="Add offer"
        emptyText="No offers yet. Add your first one above."
      />
    </>
  );
}
