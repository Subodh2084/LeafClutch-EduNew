import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";

import type { ContactInfo } from "@/types/contact";

interface ContactDetailsProps {
  title: string;
  description: string;
  info: ContactInfo;
}

interface DetailItem {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  href: string | null;
  external?: boolean;
}

/** "9779800000000" → "+977 9800000000"; other country codes are shown as "+digits". */
function formatWhatsApp(digits: string) {
  return digits.startsWith("977") ? `+977 ${digits.slice(3)}` : `+${digits}`;
}

/** Contact channels that are configured. Null fields are skipped. */
function detailItems({ address, phone, email, whatsapp }: ContactInfo): DetailItem[] {
  const items: (DetailItem | null)[] = [
    address ? { id: "address", icon: MapPin, label: "Address", value: address, href: null } : null,
    phone
      ? { id: "phone", icon: Phone, label: "Phone", value: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` }
      : null,
    email ? { id: "email", icon: Mail, label: "Email", value: email, href: `mailto:${email}` } : null,
    whatsapp
      ? {
          id: "whatsapp",
          icon: MessageCircle,
          label: "WhatsApp",
          value: formatWhatsApp(whatsapp),
          href: `https://wa.me/${whatsapp}`,
          external: true,
        }
      : null,
  ];
  return items.filter((item): item is DetailItem => !!item);
}

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-blue text-navy">
      <Icon aria-hidden className="size-5" />
    </span>
  );
}

export function ContactDetails({ title, description, info }: ContactDetailsProps) {
  const items = detailItems(info);

  return (
    <aside
      aria-labelledby="contact-info-heading"
      className="rounded-2xl border bg-card p-6 shadow-card sm:p-8 lg:sticky lg:top-24 lg:self-start"
    >
      <h2 id="contact-info-heading" className="text-xl font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>

      <ul className="mt-6 divide-y">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4 first:pt-0">
            <IconTile icon={item.icon} />
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              {item.href ? (
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="font-medium text-foreground wrap-anywhere underline-offset-4 transition-colors hover:text-navy hover:underline"
                >
                  {item.value}
                  {item.external && (
                    <>
                      <ArrowUpRight
                        aria-hidden
                        className="ml-1 inline size-3.5 align-[-0.125em] text-muted-foreground"
                      />
                      <span className="sr-only">(opens in a new tab)</span>
                    </>
                  )}
                </a>
              ) : (
                <p className="font-medium text-foreground">{item.value}</p>
              )}
            </div>
          </li>
        ))}

        {info.openingHours.length > 0 && (
          <li className="flex gap-4 pt-4 first:pt-0">
            <IconTile icon={Clock} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Opening hours</p>
              <dl className="mt-1 space-y-2.5">
                {info.openingHours.map((row) => (
                  <div key={row.id}>
                    <dt className="text-foreground">{row.days}</dt>
                    <dd className="font-medium text-foreground tabular-nums">{row.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </li>
        )}
      </ul>
    </aside>
  );
}
