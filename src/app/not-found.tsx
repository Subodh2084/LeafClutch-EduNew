import Link from "next/link";
import { Compass } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 items-center py-24">
      <Container className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-blue">
          <Compass aria-hidden className="size-5 text-navy" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          The page you’re looking for doesn’t exist or hasn’t been published yet.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/courses" className={buttonVariants({ size: "xl" })}>
            Browse courses
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "xl" }))}>
            Go to homepage
          </Link>
        </div>
      </Container>
    </main>
  );
}
