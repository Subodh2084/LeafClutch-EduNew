"use client";

import { useRef, useState } from "react";
import { FileDown, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { curriculumPdfFilename, curriculumPdfHref } from "@/lib/course-display";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "error";

/** Fetches the generated curriculum PDF for one course and saves it. */
export function DownloadCourseCurriculumButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  // The file from the first download, reused for repeat clicks.
  const fileUrl = useRef<string | null>(null);

  function save(url: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = curriculumPdfFilename(slug);
    link.click();
  }

  async function download() {
    if (status === "loading") return;
    if (fileUrl.current) {
      save(fileUrl.current);
      return;
    }

    setStatus("loading");
    setMessage("Preparing the curriculum PDF…");
    try {
      const response = await fetch(curriculumPdfHref(slug));
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "The PDF could not be generated. Please try again.");
      }
      fileUrl.current = URL.createObjectURL(await response.blob());
      save(fileUrl.current);
      setStatus("idle");
      setMessage("Curriculum PDF downloaded.");
    } catch (cause) {
      setStatus("error");
      setMessage(
        cause instanceof TypeError
          ? "Couldn’t reach the server. Check your connection and try again."
          : cause instanceof Error
            ? cause.message
            : "The PDF could not be generated. Please try again.",
      );
    }
  }

  const loading = status === "loading";

  return (
    <div className={cn("flex flex-col items-start gap-2 sm:items-end", className)}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={download}
        aria-disabled={loading || undefined}
        aria-busy={loading || undefined}
        className="px-4 aria-disabled:cursor-progress aria-disabled:opacity-70"
      >
        {loading ? (
          <LoaderCircle data-icon="inline-start" aria-hidden className="animate-spin" />
        ) : (
          <FileDown data-icon="inline-start" aria-hidden />
        )}
        {loading ? "Preparing PDF…" : "Download Course Curriculum"}
        {!loading && <span className="text-muted-foreground">PDF</span>}
      </Button>
      {/* Announces progress and the result; only errors are shown on screen. */}
      <p
        role="status"
        className={cn(
          "max-w-xs text-sm sm:text-right",
          status === "error" ? "text-destructive" : "sr-only",
        )}
      >
        {message}
      </p>
    </div>
  );
}
