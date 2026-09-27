import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/content";
import { getCourseNavigation } from "@/lib/courses";
import { cn } from "@/lib/utils";

export async function Navbar() {
  const [groups, settings] = await Promise.all([getCourseNavigation(), getSiteSettings()]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md">
      <Container className="flex h-16 items-center gap-6 lg:gap-10">
        <Logo logoUrl={settings.logo_url} siteName={settings.site_name} />
        <DesktopNav groups={groups} />
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={'https://lcon.leafclutch.com.np/login'}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "hidden px-4 lg:inline-flex bg-navy text-white",
            )}
          >
            Login
          </Link>
          <MobileNav groups={groups} />
        </div>
      </Container>
    </header>
  );
}
