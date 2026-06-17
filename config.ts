export const ENGINE_URL = "https://api.emopulse.ai";
export const AVATAR_URL = "https://avatar.emopulse.ai";
export const INGEST_URL = "https://ingest.emopulse.ai";

export function normalizeAvatarUrl(url: string): string {
  return url.replace(/^http:\/\/172\.236\.119\.144:4000/, AVATAR_URL);
}
