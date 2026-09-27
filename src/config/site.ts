// Single source of truth for site-wide settings.
export const siteConfig = {
  name: "LeafClutch Technologies",
  shortName: "LeafClutch",
  description:
    "Practical, project-based technology courses in web development, AI, data science, design, cybersecurity and cloud — taught by working professionals in Nepal.",
  currency: {
    symbol: "Rs.",
    locale: "en-IN", // lakh grouping (1,00,000), matching Nepali convention
  },

  // Contact details, WhatsApp and social links live in Supabase (site_settings)
  // and are read with getSiteSettings() from lib/content.

  nav: {
    login: "/login",
    contact: "/contact",
    about: "/about",
    solutions: [
      {
        title: "For Corporate",
        href: "/corporate-training",
        description: "Upskill your teams with tailored, hands-on training.",
      },
      {
        title: "For Academic",
        href: "/academic-training",
        description: "Industry-aligned programmes for colleges and schools.",
      },
      {
        title: "For Government",
        href: "/government-training",
        description: "Digital capability building for public institutions.",
      },
    ],
  },
} as const;
