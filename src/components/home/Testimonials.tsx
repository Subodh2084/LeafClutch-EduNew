"use client";

import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";


import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/content";

function Rating({ value }: { value: number }) {
  return (
    <div role="img" aria-label={`Rated ${value} out of 5`} className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            "size-4",
            i < value ? "fill-window-yellow text-window-yellow" : "fill-surface-gray text-surface-gray",
          )}
        />
      ))}
    </div>
  );
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function Testimonials({
  testimonials,
  eyebrow = "Student stories",
  title = "Learners who built something real",
  description = "Hear from students about their projects, their mentors and what came next.",
}: TestimonialsProps) {
  if (testimonials.length === 0) return null;

  // Duplicate slides if there are too few, to ensure infinite loop works properly
  const slides = testimonials.length < 6 ? [...testimonials, ...testimonials, ...testimonials] : testimonials;

  return (
    <section aria-labelledby="testimonials-heading" className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          id="testimonials-heading"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="mt-12">
          <Swiper
            modules={[EffectCoverflow, Pagination, Autoplay]}
            effect="coverflow"
            centeredSlides
            loop
            grabCursor
            speed={700}
            spaceBetween={24}
            slidesPerView={1.15}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            coverflowEffect={{ rotate: 14, stretch: 0, depth: 160, modifier: 1, slideShadows: false }}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            className="!pb-14"
          >
            {slides.map((testimonial, index) => (
              <SwiperSlide key={`${testimonial.id}-${index}`} className="h-auto group">
                <figure className="relative flex h-full flex-col overflow-hidden rounded-xl border bg-card p-6 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-sky/20 to-blue/20 backdrop-blur-[2px] transition-opacity duration-500 group-[.swiper-slide-active]:opacity-0" aria-hidden="true" />
                  {testimonial.rating != null && <Rating value={testimonial.rating} />}
                  <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-foreground/90">
                    <p>{testimonial.review}</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
                    <PersonAvatar name={testimonial.name} image={testimonial.image} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                      {(testimonial.designation ?? testimonial.course_name) && (
                        <p className="text-sm text-muted-foreground">
                          {testimonial.designation ?? testimonial.course_name}
                        </p>
                      )}
                    </div>
                  </figcaption>
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
}
