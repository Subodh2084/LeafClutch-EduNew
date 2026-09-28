"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Tag, X } from "lucide-react";

import { formatPrice } from "@/lib/pricing";
import type { Offer } from "@/types/content";

interface OfferModalProps {
  offer: Offer;
  whatsappNumber: string | null;
}

export function OfferModal({
  offer,
  whatsappNumber,
}: OfferModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const key = `offer-seen-${offer.id}`;

    if (sessionStorage.getItem(key)) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(key, "1");
    }, 1200);

    return () => clearTimeout(timer);
  }, [offer.id]);

  if (!open) return null;

  const hasDiscount =
    offer.discount_price != null &&
    offer.price != null &&
    offer.discount_price > 0 &&
    offer.discount_price < offer.price;

  const discountPercent =
    hasDiscount && offer.price
      ? Math.round(
        ((offer.price - offer.discount_price!) / offer.price) * 100,
      )
      : 0;

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Hi Leafclutch, I'm interested in the offer: ${offer.title}`,
    )}`
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] animate-in bg-black/65 fade-in backdrop-blur-sm duration-300"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={offer.title}
        className="fixed inset-2 z-[9999] m-auto flex max-h-[calc(100vh-1rem)] w-full max-w-[800px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] ring-1 ring-black/5 animate-in zoom-in-95 slide-in-from-bottom-4 fade-in duration-300 sm:inset-6 sm:max-h-[min(500px,92vh)] sm:rounded-3xl md:flex-row"
      >
        {/* Close */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close offer"
          className="absolute right-3 top-3 z-20 flex size-10 items-center justify-center rounded-full bg-white/90 text-navy shadow-md ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white hover:text-navy-deep hover:shadow-lg active:scale-95 sm:right-4 sm:top-4"
        >
          <X className="size-5" />
        </button>

        {/* Mobile thumbnail banner */}
        {offer.thumbnail && (
          <div className="relative h-36 w-full shrink-0 overflow-hidden bg-surface-blue md:hidden">
            <Image
              src={offer.thumbnail}
              alt={offer.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>
        )}

        {/* Information */}
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full max-w-2xl flex-col justify-center px-5 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
            {/* Badge */}
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-blue px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-blue">
              <Tag className="size-3.5" />
              Limited-time offer
            </span>

            {/* Title */}
            <h2 className="mt-3 max-w-xl text-xl font-bold leading-tight tracking-tight text-navy-deep sm:mt-4 sm:text-3xl lg:text-[2.5rem] lg:leading-[1.08]">
              {offer.title}
            </h2>

            {/* Course */}
            {offer.course_name && (
              <p className="mt-2.5 text-sm font-semibold text-blue sm:text-base">
                {offer.course_name}
              </p>
            )}

            {/* Description */}
            {offer.description && (
              <p className="mt-2.5 line-clamp-3 max-w-xl text-xs leading-5 text-muted-foreground sm:mt-3.5 sm:line-clamp-none sm:text-base sm:leading-7">
                {offer.description}
              </p>
            )}

            {/* Pricing */}
            {offer.price != null && (
              <div className="mt-4 sm:mt-6">
                {hasDiscount ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-2xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl">
                      {formatPrice(offer.discount_price!)}
                    </span>

                    <span className="text-sm font-medium text-muted-foreground line-through sm:text-lg lg:text-xl">
                      {formatPrice(offer.price)}
                    </span>

                    <span className="rounded-full bg-green/10 px-2.5 py-0.5 text-xs font-bold text-green sm:px-3 sm:py-1 sm:text-sm">
                      Save {discountPercent}%
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl">
                    {formatPrice(offer.price)}
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            {whatsappUrl && (
              <div className="mt-5 sm:mt-7">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition-all hover:bg-navy-deep hover:shadow-xl hover:shadow-navy/25 active:scale-[0.99] sm:w-fit sm:px-7 sm:text-base"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="size-5"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>

                  Contact us on WhatsApp

                  <ArrowRight
                    aria-hidden="true"
                    className="size-4"
                  />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Desktop sidebar image */}
        {offer.thumbnail && (
          <div className="relative hidden shrink-0 overflow-hidden bg-surface-blue md:block lg:w-[350px]">
            <Image
              src={offer.thumbnail}
              alt={offer.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/20 via-transparent to-white/5" />
          </div>
        )}
      </div>
    </>
  );
}