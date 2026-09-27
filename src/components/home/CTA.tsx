import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface CTAAction {
  label: string;
  href: string;
}

interface CTAProps {
  title?: string;
  description?: string;
  primaryAction?: CTAAction;
  /** null hides the second button. */
  secondaryAction?: CTAAction | null;
  className?: string;
}

export function CTA({
  title = "Not sure where to start?",
  description = "Tell us what you want to build and we will help you choose a course that fits your goals and schedule.",
  primaryAction = { label: "Explore courses", href: "/courses" },
  secondaryAction = { label: "Contact us now", href: siteConfig.nav.contact },
  className,
}: CTAProps) {
  return (
    <section aria-labelledby="cta-heading" className={cn("pb-16 sm:pb-24", className)}>
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-navy-deep px-6 py-12 sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] mask-[linear-gradient(to_left,black,transparent_70%)] bg-size-[44px_44px]"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 id="cta-heading" className="text-3xl leading-tight font-semibold text-white sm:text-4xl">
                {title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                {description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryAction.href}
                className={cn(
                  buttonVariants({ size: "xl" }),
                  "bg-white text-navy hover:bg-white/90",
                )}
              >
                {primaryAction.label}
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Link>
              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "xl" }),
                    "border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white",
                  )}
                >
                  {secondaryAction.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
