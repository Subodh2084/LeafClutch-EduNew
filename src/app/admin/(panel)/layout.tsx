import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminEmail } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | LeafClutch admin" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The real gate: only admins see any page below /admin (except /admin/login).
  const email = await getAdminEmail();
  if (!email) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-surface-gray/40 lg:flex-row">
      <AdminNav email={email} />
      <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
