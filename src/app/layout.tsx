import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PublicOnly } from "@/components/layout/PublicOnly";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";
import { siteConfig } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Every page reads live data from Supabase on each request.
export const dynamic = "force-dynamic";

import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings.site_name || siteConfig.name;
  const description = settings.description || siteConfig.description;

  return {
    title: {
      default: `${name} — Technology Training Institute`,
      template: `%s | ${name}`,
    },
    description,
    icons: {
      icon: settings.favicon_url || "/favicon.ico",
      shortcut: settings.favicon_url || "/favicon.ico",
      apple: settings.favicon_url || "/favicon.ico",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href={settings.favicon_url || "/favicon.ico"} />
        <link rel="apple-touch-icon" href={settings.favicon_url || "/favicon.ico"} />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <PublicOnly>
          <Navbar />
        </PublicOnly>
        {children}
        <PublicOnly>
          <Footer />
          <WhatsAppFloatingButton number={settings.whatsapp} />
        </PublicOnly>
      </body>
    </html>
  );
}
