"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ActionResult } from "./fields";

/** Paste a Udemy course link; its details are filled in from Udemy. */
export function UdemyLinkAdder({ add }: { add: (url: string) => Promise<ActionResult> }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await add(url);
      if (!result.ok) {
        setMessage({ kind: "error", text: result.fieldErrors?.url?.[0] ?? result.error });
        return;
      }
      setUrl("");
      setMessage({ kind: "ok", text: "Added. Check the details below and edit them if needed." });
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-white p-5">
      <label htmlFor="udemy-link" className="block text-base font-semibold text-foreground">
        Add a free Udemy course from its link
      </label>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Title, cover image, instructor, rating, length, lectures and level are filled in from Udemy.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          id="udemy-link"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.udemy.com/course/…"
          className="h-9 flex-1 bg-white"
        />
        <Button type="submit" size="lg" disabled={pending || !url.trim()} className="bg-navy text-white hover:bg-navy/90">
          <Link2 data-icon="inline-start" /> {pending ? "Reading Udemy…" : "Add from link"}
        </Button>
      </div>
      {message && (
        <p role="status" className={message.kind === "error" ? "mt-2 text-sm text-destructive" : "mt-2 text-sm text-green-700"}>
          {message.text}
        </p>
      )}
    </form>
  );
}
