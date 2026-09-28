import Link from "next/link";
import { Phone } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/content";
import { getCourseNavigation } from "@/lib/courses";
import { buildTelUrl, cn } from "@/lib/utils";

export async function Navbar() {
  const [groups, settings] = await Promise.all([getCourseNavigation(), getSiteSettings()]);
  const { nav } = siteConfig;

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md">
      <Container className="flex h-16 items-center gap-6 xl:gap-10">
        <Logo logoUrl={settings.logo_url} siteName={settings.site_name} />
        <DesktopNav groups={groups} />
        <div className="ml-auto flex items-center gap-2">
          {/* Only once there is room; below xl it lives in the mobile menu and footer. */}
          {settings.phone && (
            <a
              href={buildTelUrl(settings.phone)}
              className="mr-2 hidden items-center gap-2 rounded-md text-sm font-medium text-navy-soft tabular-nums transition-colors hover:text-navy xl:inline-flex"
            >
              <Phone aria-hidden className="size-4" />
              <span className="sr-only">Call </span>
              {settings.phone}
            </a>
          )}
          <Link
            href={nav.enroll}
            className={cn(buttonVariants({ size: "lg" }), "hidden px-4 lg:inline-flex")}
          >
            Enroll Now
          </Link>
          <Link
            href={nav.login}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "hidden px-4 lg:inline-flex")}
          >
            Login
          </Link>
          <MobileNav groups={groups} phone={settings.phone} />
        </div>
      </Container>
    </header>
  );
}
