import Link from "next/link";
import { SearchX } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";

export default function CourseNotFound() {
  return (
    <main id="main" className="flex flex-1 items-center py-24">
      <Container className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-blue">
          <SearchX aria-hidden className="size-5 text-navy" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold text-foreground">Course not found</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          This course doesn’t exist or isn’t available right now. Browse our current courses to
          find something similar.
        </p>
        <Link href="/courses" className={`${buttonVariants({ size: "xl" })} mt-8`}>
          Browse all courses
        </Link>
      </Container>
    </main>
  );
}
