// Storage buckets and their upload rules. Mirrors supabase/migrations/*_storage.sql,
// which enforces the same limits server-side. Safe to import in client
// components (e.g. for an <input accept>), since it has no secrets.

const images = ["image/jpeg", "image/png", "image/webp"] as const;
const MB = 1024 * 1024;

export const buckets = {
  courseThumbnails: { id: "course-thumbnails", maxBytes: 5 * MB, types: images },
  courseCurriculums: { id: "course-curriculums", maxBytes: 10 * MB, types: ["application/pdf"] },
  instructorImages: { id: "instructor-images", maxBytes: 5 * MB, types: images },
  trainingImages: { id: "training-images", maxBytes: 5 * MB, types: images },
  offerImages: { id: "offer-images", maxBytes: 5 * MB, types: images },
  /** Logos and favicon. */
  siteAssets: { id: "site-assets", maxBytes: 2 * MB, types: [...images, "image/x-icon"] },
} as const;

/** Largest image upload, for checks in the browser before sending. */
export const MAX_IMAGE_BYTES = 5 * MB;

export type BucketKey = keyof typeof buckets;

export const extensions: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/x-icon": "ico",
};

/**
 * The real type from the file's first bytes. The browser-reported type and the
 * file name are both user-controlled, so neither is trusted.
 */
export function detectFileType(bytes: Uint8Array): string | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts(0x25, 0x50, 0x44, 0x46, 0x2d)) return "application/pdf"; // %PDF-
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x00, 0x00, 0x01, 0x00)) return "image/x-icon";
  if (starts(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") {
    return "image/webp";
  }
  return null;
}
