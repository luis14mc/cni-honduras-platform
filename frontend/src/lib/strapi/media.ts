export type StrapiMediaInput =
  | string
  | { url?: string | null }
  | null
  | undefined;

function strapiMediaBase(): string {
  const configured = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "").replace(/\/+$/, "");
  if (/^https?:\/\//i.test(configured)) return configured;
  return "";
}

/**
 * Resolve a Strapi media URL for the browser.
 *
 * - absolute (`http(s)://…`, including `https://pub-….r2.dev`) → keep
 * - relative (`/uploads/…`) + absolute STRAPI origin → prefix origin
 * - relative + path-only `NEXT_PUBLIC_STRAPI_URL` (`/strapi-api`) → keep site path
 *   (`/uploads` is proxied on the same host, not under `/strapi-api`)
 * - null / empty → null
 */
export function getStrapiMediaUrl(input: StrapiMediaInput): string | null {
  if (input == null) return null;
  const raw = typeof input === "string" ? input : input.url;
  if (raw == null) return null;
  const url = raw.trim();
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;

  const origin = strapiMediaBase();
  const path = url.startsWith("/") ? url : `/${url}`;
  return origin ? `${origin}${path}` : path;
}
