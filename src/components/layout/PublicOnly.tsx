"use client";

import { usePathname } from "next/navigation";

/** Renders its children everywhere except the admin panel (which has its own chrome). */
export function PublicOnly({ children }: { children: React.ReactNode }) {
  return usePathname().startsWith("/admin") ? null : children;
}
