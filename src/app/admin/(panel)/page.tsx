import Link from "next/link";
import {
  BookOpen,
  HelpCircle,
  MessageSquareQuote,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminCounts } from "@/lib/admin/queries";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const counts = await getAdminCounts();
  const cards = [
    { href: "/admin/courses", label: "Courses", count: counts.courses, icon: BookOpen },
    { href: "/admin/instructors", label: "Instructors", count: counts.instructors, icon: Users },
    { href: "/admin/faqs", label: "FAQs", count: counts.faqs, icon: HelpCircle },
    { href: "/admin/testimonials", label: "Testimonials", count: counts.testimonials, icon: MessageSquareQuote },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Changes you save here show on the website on the next page load." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <li key={card.href}>
              <Link
                href={card.href}
                className="group flex items-center justify-between rounded-xl border bg-white p-5 transition-all hover:border-navy/40 hover:shadow-sm"
              >
                <div>
                  <p className="text-3xl font-semibold text-navy tabular-nums">{card.count}</p>
                  <p className="mt-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                    {card.label}
                  </p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-navy/5 text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                  <Icon className="size-5" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
