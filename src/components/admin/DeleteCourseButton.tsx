"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";

export function DeleteCourseButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${name}" with its curriculum, benefits and files? This can't be undone. To just hide it, set its status to Draft.`,
    );
    if (!confirmed) return;
    startTransition(async () => {
      const result = await deleteCourse(id);
      if (!result.ok) setError(result.error);
      else router.push("/admin/courses");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="destructive" size="lg" disabled={pending} onClick={handleDelete}>
        {pending ? "Deleting…" : "Delete course"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
