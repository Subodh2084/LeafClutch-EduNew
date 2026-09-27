import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { TrainingFeatureCard } from "@/components/training/TrainingFeatureCard";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/about";
import type { TrainingPageData } from "@/types/training";

function CollageImage({
  image,
  sizes,
  className,
}: {
  image: ImageAsset;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-surface-gray", className)}>
      <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

/**
 * Editorial collage: a large lead image, a narrow one beside it and a third
 * that overlaps the lead's corner. Fewer images fall back to simpler layouts.
 */
function ImageCollage({ images }: { images: ImageAsset[] }) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <CollageImage
        image={images[0]}
        sizes="(min-width: 1024px) 560px, 100vw"
        className="aspect-4/3 shadow-card-hover"
      />
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <CollageImage image={images[0]} sizes="(min-width: 1024px) 280px, 50vw" className="aspect-3/4" />
        <CollageImage
          image={images[1]}
          sizes="(min-width: 1024px) 280px, 50vw"
          className="mt-12 aspect-3/4"
        />
      </div>
    );
  }

  return (
    <div className="grid h-90 grid-cols-12 grid-rows-12 sm:h-130">
      {/* Dotted texture filling the corner the images leave open. */}
      <div
        aria-hidden
        className="col-start-1 col-end-5 row-start-9 row-end-13 bg-[radial-gradient(rgb(6_33_101/0.2)_1.5px,transparent_1.5px)] bg-size-[14px_14px]"
      />
      <CollageImage
        image={images[0]}
        sizes="(min-width: 1024px) 380px, 66vw"
        className="col-start-1 col-end-9 row-start-1 row-end-9 shadow-card"
      />
      <CollageImage
        image={images[1]}
        sizes="(min-width: 1024px) 190px, 33vw"
        className="col-start-9 col-end-13 row-start-2 row-end-7 ml-3 shadow-card sm:ml-4"
      />
      <CollageImage
        image={images[2]}
        sizes="(min-width: 1024px) 380px, 66vw"
        className="z-10 col-start-5 col-end-13 row-start-7 row-end-13 shadow-card-hover ring-6 ring-surface-blue"
      />
    </div>
  );
}

export function TrainingWhyChooseUs({ data }: { data: TrainingPageData["whyChooseUs"] }) {
  return (
    <section aria-labelledby="training-why-heading" className="border-y bg-surface-blue py-16 sm:py-24">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <ImageCollage images={data.images} />

        <div>
          <SectionHeading
            id="training-why-heading"
            eyebrow="Why LeafClutch"
            title={data.title}
            description={data.description}
          />
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.features.map((feature) => (
              <li key={feature.id}>
                <TrainingFeatureCard feature={feature} />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
