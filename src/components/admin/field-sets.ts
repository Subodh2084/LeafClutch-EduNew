import type { FieldDef, FieldOption } from "./fields";

// Form fields for each kind of content. They mirror the Zod schemas in
// lib/validation/admin.ts, which the server actions validate against.

const order: FieldDef = { name: "display_order", label: "Order", type: "number", hint: "Lower numbers show first" };
const active: FieldDef = { name: "is_active", label: "Visible on the site", type: "checkbox" };
const opts = (...values: [string, string][]): FieldOption[] => values.map(([value, label]) => ({ value, label }));

export const trainingTypeOptions = opts(["corporate", "Corporate"], ["academic", "Academic"], ["government", "Government"]);

export function courseFields(categories: FieldOption[]): FieldDef[] {
  return [
    { name: "name", label: "Name", type: "text" },
    { name: "slug", label: "URL slug", type: "text", hint: "e.g. agentic-ai → /courses/agentic-ai" },
    { name: "category_id", label: "Category", type: "select", options: categories },
    { name: "status", label: "Status", type: "select", options: opts(["draft", "Draft"], ["published", "Published"], ["archived", "Archived"]) },
    { name: "short_description", label: "Short description", type: "textarea" },
    { name: "description", label: "Description", type: "textarea", hint: "Separate paragraphs with a blank line" },
    { name: "actual_price", label: "Price (Rs.)", type: "number" },
    { name: "discount_price", label: "Discount price (Rs.)", type: "number", nullable: true, hint: "Leave empty for no discount" },
    { name: "duration", label: "Duration", type: "text", placeholder: "3 months" },
    { name: "learning_mode", label: "Learning mode", type: "select", options: opts(["online", "Online"], ["physical", "In-person"], ["hybrid", "Hybrid"]) },
    { name: "udemy_url", label: "Udemy link", type: "text", nullable: true, placeholder: "https://www.udemy.com/…", hint: "Shows “Includes a free Udemy course” on the course page" },
    { name: "certificate_available", label: "Certificate included", type: "checkbox" },
    { name: "is_featured", label: "Featured on the home page", type: "checkbox" },
  ];
}

export const courseToolFields: FieldDef[] = [
  { name: "name", label: "Tool", type: "text", placeholder: "React" },
  {
    name: "icon",
    label: "Logo",
    type: "select",
    nullable: true,
    hint: "Empty = the tool's first letter",
    options: [
      "express", "figma", "javascript", "jupyter", "mongodb", "mongoose", "nodejs",
      "numpy", "pandas", "postgresql", "python", "react", "scikit-learn",
    ].map((key) => ({ value: key, label: key })),
  },
  { name: "description", label: "Short description", type: "text", nullable: true, wide: true },
  order,
  active,
];

export const udemyBonusFields: FieldDef[] = [
  { name: "title", label: "Course title", type: "text", wide: true },
  { name: "course_url", label: "Udemy course link", type: "text", placeholder: "https://www.udemy.com/course/…" },
  { name: "image_url", label: "Cover image link", type: "text", hint: "Udemy's image link, or leave empty and upload one" },
  { name: "instructor", label: "Udemy instructor", type: "text" },
  { name: "level", label: "Level", type: "text", placeholder: "All Levels" },
  { name: "rating", label: "Rating (0–5)", type: "number" },
  { name: "ratings_count", label: "Number of ratings", type: "number" },
  { name: "total_hours", label: "Total length", type: "text", placeholder: "99h 48m" },
  { name: "lectures", label: "Lectures", type: "number" },
  { name: "description", label: "Description", type: "textarea" },
  order,
  active,
];

export const benefitFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text" },
  order,
  { name: "description", label: "Description", type: "textarea" },
];

/** Modules, lessons, training objectives/topics. */
export const orderedItemFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text" },
  order,
  { name: "description", label: "Description", type: "textarea", nullable: true },
];

export const installmentFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", placeholder: "First Instalment" },
  { name: "percentage", label: "Percentage of the fee", type: "number" },
  { name: "description", label: "When it's due", type: "text", placeholder: "Payable at enrollment", wide: true },
  order,
];

export const categoryFields: FieldDef[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "short_name", label: "Short name", type: "text", hint: "Used in tight spaces, e.g. \"AI & ML\"" },
  { name: "slug", label: "URL slug", type: "text" },
  order,
  { name: "description", label: "Description", type: "textarea", nullable: true },
  active,
];

export const instructorFields: FieldDef[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "designation", label: "Designation", type: "text", placeholder: "Senior Full-Stack Developer" },
  { name: "linkedin_url", label: "LinkedIn link", type: "text", nullable: true, placeholder: "https://www.linkedin.com/in/…" },
  active,
  { name: "bio", label: "Bio", type: "textarea" },
];

export function faqFields(courses: FieldOption[]): FieldDef[] {
  return [
    { name: "question", label: "Question", type: "text", wide: true },
    { name: "answer", label: "Answer", type: "textarea" },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: opts(["general", "General"], ["course", "Course"], ["enrollment", "Enrollment"], ["payment", "Payment"], ["certificate", "Certificate"]),
    },
    { name: "course_id", label: "Course", type: "select", nullable: true, options: courses, hint: "Empty = shown on the home page" },
    order,
    active,
  ];
}

export function testimonialFields(courses: FieldOption[]): FieldDef[] {
  return [
    { name: "name", label: "Name", type: "text" },
    {
      name: "type",
      label: "Shown on",
      type: "select",
      options: opts(["student", "Home page (student)"], ["corporate", "Corporate training"], ["academic", "Academic training"], ["government", "Government training"]),
    },
    { name: "course_id", label: "Course", type: "select", nullable: true, options: courses, hint: "For student reviews" },
    { name: "designation", label: "Role and organisation", type: "text", nullable: true, hint: "For organisations, e.g. \"HR Manager, Summit Logistics\"" },
    { name: "review", label: "Review", type: "textarea" },
    { name: "rating", label: "Rating (1–5)", type: "number", nullable: true },
    order,
    { name: "is_featured", label: "Featured (shown on the page)", type: "checkbox" },
    active,
  ];
}

export const homeStatFields: FieldDef[] = [
  { name: "value", label: "Value", type: "text", placeholder: "1,000+" },
  { name: "label", label: "Label", type: "text", placeholder: "Students trained" },
  order,
  active,
];

const aboutIconOptions = {
  value: opts(["guidance", "Guidance"], ["inclusive", "Inclusive"], ["quality", "Quality"], ["growth", "Growth"]),
  feature: opts(
    ["practical", "Practical"], ["mentor", "Mentor"], ["projects", "Projects"], ["certificate", "Certificate"],
    ["flexible", "Flexible"], ["curriculum", "Curriculum"], ["career", "Career"],
  ),
  learning_step: opts(["learn", "Learn"], ["practice", "Practice"], ["build", "Build"], ["grow", "Grow"]),
};

export function aboutItemFields(section: keyof typeof aboutIconOptions): FieldDef[] {
  return [
    { name: "title", label: "Title", type: "text" },
    { name: "icon", label: "Icon", type: "select", options: aboutIconOptions[section] },
    { name: "description", label: "Description", type: "textarea" },
    order,
    active,
  ];
}

export const trainingIconOptions: FieldOption[] = [
  "Award", "BarChart3", "BookOpenCheck", "Bot", "BriefcaseBusiness", "Building2", "CalendarClock",
  "ChartNoAxesCombined", "FolderCode", "GraduationCap", "Handshake", "Landmark", "Laptop", "Presentation",
  "Rocket", "Settings2", "ShieldCheck", "Sprout", "Target", "UsersRound", "Workflow", "Wrench",
].map((icon) => ({ value: icon, label: icon }));

/** Why-choose-us features and programs. */
export const trainingCardFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "icon", label: "Icon", type: "select", options: trainingIconOptions },
  { name: "description", label: "Description", type: "textarea" },
  order,
  active,
];

export const processStepFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text" },
  order,
  { name: "description", label: "Description", type: "textarea" },
  active,
];

export const trainingImageFields: FieldDef[] = [
  { name: "alt", label: "Image description (for screen readers)", type: "text", wide: true },
  { name: "placement", label: "Where it shows", type: "select", options: opts(["hero", "Hero slider"], ["why_choose_us", "Why-choose-us collage (first 3)"]) },
  order,
  active,
];

export const siteSettingsFields: FieldDef[] = [
  { name: "site_name", label: "Site Name", type: "text", nullable: true, placeholder: "LeafClutch Technologies" },
  { name: "logo_url", label: "Header Logo Image", type: "file", nullable: true, hint: "Upload image file or paste URL" },
  { name: "footer_logo_url", label: "Footer Logo Image (Optional)", type: "file", nullable: true, hint: "Upload image file or paste URL. Defaults to Header Logo if empty" },
  { name: "favicon_url", label: "Favicon Icon", type: "file", nullable: true, hint: "Upload icon (.ico, .png, .svg) or paste URL" },
  { name: "description", label: "Site Description", type: "textarea", nullable: true, hint: "Shown in the footer and website description" },
  { name: "email", label: "Email", type: "text", nullable: true },
  { name: "phone", label: "Phone", type: "text", nullable: true },
  { name: "whatsapp", label: "WhatsApp number", type: "text", nullable: true, hint: "Digits only with country code, e.g. 9779800000000" },
  { name: "address", label: "Address", type: "text", nullable: true },
  {
    name: "map_embed_url",
    label: "Google Maps (Contact page)",
    type: "textarea",
    nullable: true,
    hint: "In Google Maps, find your office → Share → Embed a map → Copy HTML, and paste it here. Leave empty to show a map of the address.",
  },
  {
    name: "opening_hours",
    label: "Opening hours",
    type: "pairs",
    pairKeys: [{ value: "days", label: "Days" }, { value: "hours", label: "Hours" }],
  },
  {
    name: "social_links",
    label: "Social links",
    type: "pairs",
    pairKeys: [{ value: "label", label: "Name, e.g. Facebook" }, { value: "href", label: "https://…" }],
  },
];

export function offerFields(courses: FieldOption[]): FieldDef[] {
  return [
    { name: "title", label: "Offer title", type: "text", wide: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "course_id", label: "Course", type: "select", nullable: true, options: courses, hint: "Link to an existing course (optional)" },
    { name: "price", label: "Price (Rs.)", type: "number", nullable: true },
    { name: "discount_price", label: "Discount price (Rs.)", type: "number", nullable: true, hint: "Leave empty for no discount" },
    order,
    { name: "is_active", label: "Show on website", type: "checkbox" },
  ];
}
