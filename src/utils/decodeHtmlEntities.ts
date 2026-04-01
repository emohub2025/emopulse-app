// utils/decodeHtmlEntities.ts
export function decodeHtmlEntities(input: string | null | undefined): string {
  if (!input) return "";

  return input
    // Common named entities
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")

    // Smart quotes / dashes / ellipsis
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "…")

    // Numeric apostrophe fallback
    .replace(/&#39;/g, "'")

    // Generic numeric fallback
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}