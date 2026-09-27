import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  FolderTree,
  HelpCircle,
  Info,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Settings,
  Tag,
  TrendingUp,
  GraduationCap,
  Users,
  type LucideIcon,
} from "lucide-react";

import { signOut } from "@/actions/auth";

const sections: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/instructors", label: "Instructors", icon: Users },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/home-stats", label: "Home stats", icon: TrendingUp },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/about", label: "About page", icon: Info },
  { href: "/admin/training", label: "Training pages", icon: GraduationCap },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
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
              className="flex shrink-0 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-white/10 hover:text-white"
            >
              <section.icon className="size-4 shrink-0" />
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
