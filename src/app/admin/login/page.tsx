import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <main id="main" className="flex flex-1 items-center justify-center bg-surface-blue/50 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-foreground">LeafClutch admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in with your admin account.</p>
        <LoginForm />
      </div>
    </main>
  );
}
