"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ActionResult } from "./fields";

interface FileUploadProps {
  label: string;
  currentUrl: string | null;
  kind: "image" | "pdf";
  upload: (formData: FormData) => Promise<ActionResult>;
  clear?: () => Promise<ActionResult>;
}

const limits = {
  image: { accept: "image/jpeg,image/png,image/webp", hint: "JPG, PNG or WebP" },
  pdf: { accept: "application/pdf", hint: "PDF, up to 10 MB" },
};

/** Upload, replace or remove one file. The server checks type and size again. */
export function FileUpload({ label, currentUrl, kind, upload, clear }: FileUploadProps) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
      else router.refresh();
      if (input.current) input.current.value = "";
    });
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    run(() => upload(formData));
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-3">
        {currentUrl ? (
          kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of any stored URL
            <img src={currentUrl} alt="" className="h-14 w-20 rounded-md border bg-white object-cover" />
          ) : (
            <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-navy underline">
              <FileText className="size-4" /> Current file
            </a>
          )
        ) : (
          <span className="text-sm text-muted-foreground">None</span>
        )}
        <input
          ref={input}
          type="file"
          accept={limits[kind].accept}
          className="sr-only"
          id={`upload-${label}`}
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <Button variant="outline" size="lg" disabled={pending} onClick={() => input.current?.click()}>
          <Upload data-icon="inline-start" /> {pending ? "Uploading…" : currentUrl ? "Replace" : "Upload"}
        </Button>
        {currentUrl && clear && (
          <Button
            variant="ghost"
            size="lg"
            disabled={pending}
            className="text-destructive"
            onClick={() => window.confirm("Remove this file?") && run(clear)}
          >
            Remove
          </Button>
        )}
        <span className="text-xs text-muted-foreground">{limits[kind].hint}</span>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
