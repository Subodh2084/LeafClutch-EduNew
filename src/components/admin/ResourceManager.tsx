"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

import { EntityForm } from "./EntityForm";
import { FileUpload } from "./FileUpload";
import type { ActionResult, FieldDef, FormValues } from "./fields";

interface ResourceManagerProps {
  title: string;
  description?: string;
  rows: FormValues[];
  fields: FieldDef[];
  /** Which column names the row in the list. */
  labelKey: string;
  /** Extra columns shown under the label. */
  metaKeys?: string[];
  fixed?: FormValues;
  // Server actions validate their own input with Zod, so any action fits here
  // (`never` parameters accept every action signature).
  create?: (values: never) => Promise<ActionResult>;
  update: (id: string, values: never) => Promise<ActionResult>;
  remove?: (id: string) => Promise<ActionResult>;
  /** Optional per-row image upload (e.g. a partner logo). */
  image?: {
    key: string;
    label: string;
    upload: (id: string, formData: FormData) => Promise<ActionResult>;
    clear?: (id: string) => Promise<ActionResult>;
  };
  addLabel?: string;
  emptyText?: string;
}

/** A list of rows with add, inline edit and delete. */
export function ResourceManager({
  title,
  description,
  rows,
  fields,
  labelKey,
  metaKeys = [],
  fixed,
  create,
  update,
  remove,
  image,
  addLabel = "Add",
  emptyText = "Nothing here yet.",
}: ResourceManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete(row: FormValues) {
    if (!remove || !window.confirm(`Delete "${String(row[labelKey])}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await remove(String(row.id));
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <section className="rounded-xl border bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {create && !adding && (
          <Button variant="outline" size="lg" onClick={() => setAdding(true)}>
            <Plus data-icon="inline-start" /> {addLabel}
          </Button>
        )}
      </header>

      {adding && create && (
        <div className="border-b bg-surface-blue/40 px-5 py-5">
          <EntityForm
            fields={fields}
            fixed={fixed}
            fileUpload={image ? { label: image.label, kind: "image" } : undefined}
            submit={async (values, file) => {
              const result = await create(values as never);
              if (result.ok && result.data && typeof result.data === "object" && "id" in result.data && file && image) {
                const formData = new FormData();
                formData.append("file", file);
                const uploadResult = await image.upload(result.data.id as string, formData);
                if (!uploadResult.ok) return uploadResult;
              }
              return result;
            }}
            submitLabel={addLabel}
            onDone={() => {
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="border-b bg-destructive/5 px-5 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="divide-y">
          {rows.map((row) => {
            const id = String(row.id);
            const hidden = row.is_active === false || row.status === "draft" || row.status === "archived";
            return (
              <li key={id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {image && Boolean(row[image.key]) && (
                      <div className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={String(row[image.key])}
                          alt=""
                          className="size-11 rounded-lg border bg-white object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {String(row[labelKey] ?? "")}
                        {hidden && (
                          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                            {row.status ? String(row.status) : "hidden"}
                          </span>
                        )}
                      </p>
                      {metaKeys.length > 0 && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                          {metaKeys
                            .map((key) => row[key])
                            .filter((value) => value !== null && value !== undefined && value !== "")
                            .map(String)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center shrink-0 gap-2">
                    {image && Boolean(row[image.key]) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(editing === id ? null : id)}
                        className="hidden sm:inline-flex"
                      >
                        <Upload data-icon="inline-start" />
                        Change Image
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      aria-label={`Edit ${String(row[labelKey])}`}
                      onClick={() => setEditing(editing === id ? null : id)}
                    >
                      <Pencil />
                    </Button>
                    {remove && (
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        aria-label={`Delete ${String(row[labelKey])}`}
                        disabled={pending}
                        onClick={() => handleDelete(row)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </div>

                {editing === id && (
                  <div className="mt-4 space-y-5 rounded-lg bg-surface-blue/40 p-4">
                    {image && (
                      <FileUpload
                        label={image.label}
                        currentUrl={(row[image.key] as string | null) ?? null}
                        kind="image"
                        upload={(formData) => image.upload(id, formData)}
                        clear={image.clear ? () => image.clear!(id) : undefined}
                      />
                    )}
                    <EntityForm
                      fields={fields}
                      initial={row}
                      fixed={fixed}
                      submit={(values) => update(id, values as never)}
                      onDone={() => setEditing(null)}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
