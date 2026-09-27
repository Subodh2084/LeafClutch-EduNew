export interface OpeningHours {
  id: string;
  days: string;
  hours: string;
}

/** Null = not configured, so the item is not rendered. */
export interface ContactInfo {
  address: string | null;
  phone: string | null;
  email: string | null;
  /** International format, digits only, no "+". */
  whatsapp: string | null;
  openingHours: OpeningHours[];
}

export interface ContactPageContent {
  title: string;
  description: string;
  formTitle: string;
  infoTitle: string;
  infoDescription: string;
}
