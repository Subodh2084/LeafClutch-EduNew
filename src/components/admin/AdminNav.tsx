import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";

import { signOut } from "@/actions/auth";

const sections = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/instructors", label: "Instructors" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/home-stats", label: "Home stats" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/about", label: "About page" },
  { href: "/admin/training", label: "Training pages" },
  { href: "/admin/settings", label: "Site settings" },
];

export function AdminNav({ email }: { email: string }) {
  return (
    <aside className="border-b bg-navy-deep text-white/80 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
      <div className="flex h-full flex-col px-4 py-5">
        <Link href="/admin" className="px-2 text-lg font-semibold text-white">
          LeafClutch admin
        </Link>
        <nav aria-label="Admin" className="mt-5 flex gap-1 overflow-x-auto lg:flex-col">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="shrink-0 rounded-md px-2 py-1.5 text-sm hover:bg-white/10 hover:text-white"
            >
              {section.label}
            </Link>
          ))}
        </nav>
        <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm lg:mt-auto">
          <Link href="/" target="_blank" className="flex items-center gap-2 px-2 hover:text-white">
            <ExternalLink className="size-4" /> View site
          </Link>
          <p className="truncate px-2 text-xs text-white/50">{email}</p>
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-2 px-2 hover:text-white">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
