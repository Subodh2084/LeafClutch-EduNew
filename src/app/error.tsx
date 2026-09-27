"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  /** Re-fetches and re-renders the failed segment (stable since Next 16.3). */
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex flex-1 items-center py-24">
      <Container className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-blue">
          <TriangleAlert aria-hidden className="size-5 text-navy" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          We couldn’t load this page. Please try again in a moment.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="xl" onClick={() => retry()}>
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "xl" })}>
            Go to homepage
          </Link>
        </div>
      </Container>
    </main>
  );
}
