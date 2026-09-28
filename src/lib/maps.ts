// Google Maps for the Contact page. No API key is needed: the map is Google's
// standard embed, and the link opens Google Maps.

const EMBED_PREFIX = "https://www.google.com/maps/embed?";

/**
 * Accepts what an admin pastes from Google Maps (Share → Embed a map): either
 * the whole <iframe …> code or just its link. Returns the embed link, or null
 * if the input isn't a Google Maps embed.
 */
export function extractGoogleMapsEmbedUrl(input: string): string | null {
  const text = input.trim();
  const src = text.match(/src\s*=\s*["']([^"']+)["']/i)?.[1] ?? text;
  const url = src.replace(/&amp;/g, "&").trim();
  return url.startsWith(EMBED_PREFIX) ? url : null;
}

/** The map to show: the saved embed, or a map of the address, or none. */
export function contactMap(embedUrl: string | null, address: string | null) {
  const query = address?.trim();
  if (!embedUrl && !query) return null;
  return {
    embedUrl: embedUrl ?? `https://maps.google.com/maps?q=${encodeURIComponent(query!)}&output=embed`,
    openUrl: query
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      : embedUrl!.replace("/maps/embed?", "/maps?"),
  };
}
