import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Container } from "@/components/layout/Container";

interface ContactHeaderProps {
  title: string;
  description: string;
}

/** Page header in the same style as the Enroll page. */
export function ContactHeader({ title, description }: ContactHeaderProps) {
  return (
    <section aria-labelledby="contact-heading" className="border-b bg-surface-blue/50">
      <Container className="py-10 sm:py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-navy">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current="page" className="font-medium text-foreground">
              Contact
            </li>
          </ol>
        </nav>
        <h1
          id="contact-heading"
          className="mt-4 text-3xl leading-tight font-semibold text-foreground sm:text-4xl"
        >
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      </Container>
    </section>
  );
}
