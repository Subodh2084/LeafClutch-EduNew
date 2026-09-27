"use client";

import Image from "next/image";
import { useRef, useState, type FocusEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Swiper as SwiperClass } from "swiper";
import { A11y, Autoplay, EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/about";

import "swiper/css";
import "swiper/css/a11y";
import "swiper/css/effect-coverflow";

const AUTOPLAY_DELAY = 3500;

const frameClass =
  "relative aspect-4/3 overflow-hidden rounded-xl bg-surface-gray shadow-card-hover";
const imageSizes = "(min-width: 1024px) 480px, (min-width: 640px) 75vw, 87vw";

const controlClass =
  "flex size-10 items-center justify-center rounded-full border bg-white text-navy shadow-card transition-colors hover:border-surface-blue-strong hover:bg-surface-blue";

export function TrainingGallery({ images }: { images: ImageAsset[] }) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = images.length;
  if (count === 0) return null;

  // Loop + coverflow needs a few slides; a single image is just a picture.
  if (count < 3) {
    return (
      <div className={frameClass}>
        <Image src={images[0].src} alt={images[0].alt} fill priority sizes={imageSizes} className="object-cover" />
      </div>
    );
  }

  // Centred loop mode can't keep a neighbour on both sides with only a few
  // slides, so short galleries are rendered twice. Positions map back with % count.
  const slides = count < 6 ? [...images, ...images] : images;

  // Go to the copy of an image nearest the current position.
  function showImage(index: number) {
    const swiper = swiperRef.current;
    if (!swiper) return;
    const copy = Math.floor(swiper.realIndex / count);
    swiper.slideToLoop(copy * count + index);
  }

  function togglePlayback() {
    const autoplay = swiperRef.current?.autoplay;
    if (!autoplay) return;
    if (paused) autoplay.start();
    else autoplay.stop();
    setPaused(!paused);
  }

  // Keyboard users get a still slideshow while they are inside it. Mouse
  // clicks on the controls don't match :focus-visible, so autoplay keeps going.
  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    if (!paused && event.target.matches(":focus-visible")) swiperRef.current?.autoplay.stop();
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    const autoplay = swiperRef.current?.autoplay;
    if (!paused && autoplay && !autoplay.running) autoplay.start();
  }

  return (
    <div className="min-w-0" onFocus={handleFocus} onBlur={handleBlur}>
      <Swiper
        modules={[A11y, Autoplay, EffectCoverflow]}
        effect="coverflow"
        centeredSlides
        loop
        grabCursor
        speed={700}
        slidesPerView={1.15}
        breakpoints={{
          640: { slidesPerView: 1.3 },
          1024: { slidesPerView: 1.35 },
        }}
        coverflowEffect={{ rotate: 14, stretch: 0, depth: 160, modifier: 1, slideShadows: false }}
        autoplay={{ delay: AUTOPLAY_DELAY, disableOnInteraction: false, pauseOnMouseEnter: true }}
        a11y={{
          containerRoleDescriptionMessage: "carousel",
          itemRoleDescriptionMessage: "slide",
          // Labelled per slide below, so duplicates read as "2 of 4", not "6 of 8".
          slideLabelMessage: "",
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onRealIndexChange={(swiper) => setActive(swiper.realIndex % count)}
        className="training-gallery"
      >
        {slides.map((image, index) => (
          <SwiperSlide key={`${index}-${image.src}`} aria-label={`${(index % count) + 1} of ${count}`}>
            <div
              className={cn(
                frameClass,
                "transition-opacity duration-500 in-[.swiper-slide-next]:opacity-55 in-[.swiper-slide-prev]:opacity-55",
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes={imageSizes}
                className="object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-5 flex items-center justify-between gap-4 px-1">
        <div className="flex items-center" role="group" aria-label="Choose image">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={`Show image ${index + 1} of ${count}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => showImage(index)}
              className="group/dot flex size-6 cursor-pointer items-center justify-center rounded-full"
            >
              <span
                aria-hidden
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === active ? "w-6 bg-navy" : "w-2 bg-navy/25 group-hover/dot:bg-navy/50",
                )}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => swiperRef.current?.slidePrev()}
            className={controlClass}
          >
            <ChevronLeft aria-hidden className="size-4.5" />
          </button>
          <button
            type="button"
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            onClick={togglePlayback}
            className={controlClass}
          >
            {paused ? (
              <Play aria-hidden className="size-4 fill-current" />
            ) : (
              <Pause aria-hidden className="size-4 fill-current" />
            )}
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => swiperRef.current?.slideNext()}
            className={controlClass}
          >
            <ChevronRight aria-hidden className="size-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
