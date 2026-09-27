"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ActionResult } from "./fields";

interface ImageAdderProps {
  /** Receives the image details and a FormData with the "file". */
  add: (values: never, formData: FormData) => Promise<ActionResult>;
  /** Details the admin doesn't choose here, e.g. { type: "corporate" }. */
  fixed: Record<string, unknown>;
}

/** Upload a new training page image with its description and placement. */
export function ImageAdder({ add, fixed }: ImageAdderProps) {
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [placement, setPlacement] = useState("hero");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const chosen = file.current?.files?.[0];
    if (!chosen) return setError("Choose an image to upload.");
    const formData = new FormData();
    formData.append("file", chosen);
    setError(null);
    startTransition(async () => {
      const values = { ...fixed, placement, alt, display_order: 99, is_active: true };
      const result = await add(values as never, formData);
      if (!result.ok) {
        setError(result.fieldErrors?.alt?.[0] ?? result.error);
        return;
      }
      setAlt("");
      if (file.current) file.current.value = "";
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 border-b bg-surface-blue/40 px-5 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div>
        <label htmlFor="new-image-file" className="mb-1.5 block text-sm font-medium">
          Image (JPG, PNG or WebP, max 5 MB)
        </label>
        <input id="new-image-file" ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
      </div>
      <div>
        <label htmlFor="new-image-alt" className="mb-1.5 block text-sm font-medium">
          Description
        </label>
        <Input
          id="new-image-alt"
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          placeholder="What the photo shows"
          className="h-9 bg-white"
        />
      </div>
      <div className="flex items-end gap-2">
        <select
          aria-label="Where it shows"
          value={placement}
          onChange={(event) => setPlacement(event.target.value)}
          className="h-9 rounded-lg border bg-white px-2 text-sm"
        >
          <option value="hero">Hero slider</option>
          <option value="why_choose_us">Collage</option>
        </select>
        <Button type="submit" size="lg" disabled={pending} className="bg-navy text-white hover:bg-navy/90">
          <Plus data-icon="inline-start" /> {pending ? "Uploading…" : "Add"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive sm:col-span-3">{error}</p>}
    </form>
  );
}
