import Link from "next/link";

import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminCounts } from "@/lib/admin/queries";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const counts = await getAdminCounts();
  const cards = [
    { href: "/admin/courses", label: "Courses", count: counts.courses },
    { href: "/admin/instructors", label: "Instructors", count: counts.instructors },
    { href: "/admin/faqs", label: "FAQs", count: counts.faqs },
    { href: "/admin/testimonials", label: "Testimonials", count: counts.testimonials },
    { href: "/admin/training", label: "Training partners", count: counts.training_partners },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Changes you save here show on the website on the next page load." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href}>
            <Link href={card.href} className="block rounded-xl border bg-white p-5 hover:border-navy/40">
              <p className="text-3xl font-semibold text-navy tabular-nums">{card.count}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
