import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/content";
import { coursesHref } from "@/lib/course-display";
import { getCourseCategories } from "@/lib/courses";
import { buildTelUrl } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export async function Footer() {
  const [categories, contact] = await Promise.all([getCourseCategories(), getSiteSettings()]);
  const { nav } = siteConfig;
  const socials = contact.social_links;
  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp);

  const columns = [
    {
      title: "Courses",
      links: categories.map((c) => ({ label: c.name, href: coursesHref({ category: c.slug }) })),
    },
    {
      title: "Solutions",
      links: nav.solutions.map((s) => ({ label: s.title, href: s.href })),
    },
    {
      title: "Company",
      links: [
        { label: "About us", href: nav.about },
        { label: "All courses", href: "/courses" },
        { label: "Contact", href: nav.contact },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "FAQ", href: "/#faq" },
        { label: "Enroll", href: "/enroll" },
        { label: "Login", href: nav.login },
      ],
    },
  ];

  const contactItems = [
    contact.email && { icon: Mail, label: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { icon: Phone, label: contact.phone, href: buildTelUrl(contact.phone) },
    whatsappUrl && { icon: MessageCircle, label: "WhatsApp", href: whatsappUrl },
    contact.address && { icon: MapPin, label: contact.address, href: null },
  ].filter((item) => !!item);

  return (
    <footer className="bg-navy-deep text-white/70">
      <Container className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,3fr)]">
        <div className="max-w-sm">
          <Logo tone="light" logoUrl={contact.footer_logo_url || contact.logo_url} siteName={contact.site_name} />
          <p className="mt-5 text-sm leading-relaxed">{contact.description || siteConfig.description}</p>

          {contactItems.length > 0 && (
            <ul className="mt-6 space-y-2.5 text-sm">
              {contactItems.map(({ icon: Icon, label, href }) => (
                <li key={label} className="flex items-center gap-2.5">
                  <Icon aria-hidden className="size-4 shrink-0 text-white/50" />
                  {href ? (
                    <a href={href} className="hover:text-white">
                      {label}
                    </a>
                  ) : (
                    label
                  )}
                </li>
              ))}
            </ul>
          )}

          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {socials.map((social) => (
                <li key={social.href}>
                  <a href={social.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-semibold text-white">{column.title}</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>

      <div className="border-t border-white/10">
        {/* Bottom/right padding keeps these links clear of the floating WhatsApp button. */}
        <Container className="flex flex-col gap-3 pt-6 pb-24 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between sm:pb-6 sm:pr-24 lg:pr-24 2xl:pr-8">
          <p>
            © {new Date().getFullYear()} {contact.site_name || siteConfig.name}. All rights reserved.{" "}
            <a
              href={siteConfig.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap text-white/80 underline underline-offset-4 transition-colors hover:text-white"
            >
              leafclutch.com.np<span className="sr-only"> (company website, opens in a new tab)</span>
            </a>
          </p>
          <ul aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <a
                href={siteConfig.legal.privacy}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                Privacy Policy<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a
                href={siteConfig.legal.terms}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                Terms of Service<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <Link href="/admin" className="transition-colors hover:text-white">
                Admin
              </Link>
            </li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}
