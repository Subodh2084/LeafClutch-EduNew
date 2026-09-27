// Field descriptions for the generic admin forms. Plain objects, so server
// pages can build them and pass them to the client form components.

export interface FieldOption {
  value: string;
  label: string;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "multiselect"
  /** A list of { [key]: string } rows, e.g. opening hours or social links. */
  | "pairs"
  /** A text input for URL combined with an inline file upload input. */
  | "file";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  /** Empty input is saved as null. */
  nullable?: boolean;
  hint?: string;
  placeholder?: string;
  /** Span the full width of the form grid. */
  wide?: boolean;
  /** For "pairs": the two keys of each row and their labels. */
  pairKeys?: [FieldOption, FieldOption];
}

export type FormValues = Record<string, unknown>;

/** Server action results, as returned by lib/admin/actions. */
export type ActionResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

/** Turns raw form input into the shape the server schemas expect. */
export function toSubmitValues(fields: FieldDef[], raw: FormValues): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    const value = raw[field.name];
    switch (field.type) {
      case "number": {
        const text = String(value ?? "").trim();
        values[field.name] = text === "" ? (field.nullable ? null : 0) : Number(text);
        break;
      }
      case "checkbox":
        values[field.name] = Boolean(value);
        break;
      case "multiselect":
      case "pairs":
        values[field.name] = Array.isArray(value) ? value : [];
        break;
      default: {
        let text = value == null ? "" : String(value);
        // Auto-prepend https:// to URLs if missing
        if ((field.name.endsWith("_url") || field.name === "website") && text.trim()) {
          const trimmed = text.trim();
          if (!/^https?:\/\//i.test(trimmed)) {
            text = `https://${trimmed}`;
          }
        }
        values[field.name] = field.nullable && (text === "" || text == null) ? null : text;
      }
    }
  }

  // Auto-generate slug from name or title if slug is empty
  if (fields.some((f) => f.name === "slug")) {
    const rawSlug = String(values["slug"] ?? "").trim();
    if (!rawSlug) {
      const sourceName = String(values["name"] || values["title"] || "").trim();
      if (sourceName) {
        values["slug"] = sourceName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
    }
  }

  return values;
}

/** Turns a stored row into form input (null → "" so inputs stay controlled). */
export function toFormValues(fields: FieldDef[], row: FormValues | undefined): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    const value = row?.[field.name];
    if (field.type === "checkbox") values[field.name] = value ?? false;
    else if (field.type === "multiselect" || field.type === "pairs") values[field.name] = value ?? [];
    else if (field.type === "select" && !field.nullable && (value == null || value === "")) {
      values[field.name] = field.options?.[0]?.value ?? "";
    } else values[field.name] = value == null ? "" : String(value);
  }
  return values;
}
