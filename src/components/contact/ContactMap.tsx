import { ExternalLink, MapPin } from "lucide-react";

import { Container } from "@/components/layout/Container";

/** Google Map of the office, under the contact form and details. */
export function ContactMap({
  embedUrl,
  openUrl,
  address,
}: {
  embedUrl: string;
  openUrl: string;
  address: string | null;
}) {
  return (
    <section aria-labelledby="contact-map-heading" className="pb-14 sm:pb-20">
      <Container>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="contact-map-heading" className="text-xl font-semibold text-foreground">
              Find us
            </h2>
            {address && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin aria-hidden className="size-4 shrink-0 text-navy" />
                {address}
              </p>
            )}
          </div>
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy underline-offset-4 hover:underline"
          >
            Open in Google Maps
            <ExternalLink aria-hidden className="size-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border bg-surface-gray">
          <iframe
            src={embedUrl}
            title={address ? `Map showing ${address}` : "Map of our office"}
            className="block h-80 w-full sm:h-105"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </Container>
    </section>
  );
}
