// Single source of truth for site-wide settings.
export const siteConfig = {
  name: "Leafclutch Technologies",
  shortName: "Leafclutch",
  description:
    "Practical, project-based technology courses in web development, AI, data science, design, cybersecurity and cloud — taught by working professionals in Nepal.",
  currency: {
    symbol: "Rs.",
    locale: "en-IN", // lakh grouping (1,00,000), matching Nepali convention
  },

  // Contact details, WhatsApp and social links live in Supabase (site_settings)
  // and are read with getSiteSettings() from lib/content.

  nav: {
    login: "https://lcon.leafclutch.com.np/login",
    enroll: "/enroll",
    contact: "/contact",
    about: "/about",
    verifyCertificate: "https://verify.leafclutch.com.np/",
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

  /** The parent company's main website, linked from the footer. */
  companyUrl: "https://leafclutch.com.np/",

  // Legal pages live on the company site (copies: privacy.md, "terms of service.md").
  legal: {
    privacy: "https://leafclutch.com.np/privacy",
    terms: "https://leafclutch.com.np/terms",
  },
} as const;
