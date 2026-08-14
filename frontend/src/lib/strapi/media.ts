export type StrapiMediaInput =
  | string
  | { url?: string | null }
  | null
  | undefined;

function strapiOrigin(): string {
  return (process.env.NEXT_PUBLIC_STRAPI_URL ?? "").replace(/\/+$/, "");
}

/**
 * Resolve a Strapi media URL for the browser.
 *
 * - absolute (`http(s)://…`, including `https://pub-….r2.dev`) → keep
 * - relative (`/uploads/…`) → prefix `NEXT_PUBLIC_STRAPI_URL`
 * - null / empty → null
 */
export function getStrapiMediaUrl(input: StrapiMediaInput): string | null {
  if (input == null) return null;
  const raw = typeof input === "string" ? input : input.url;
  if (raw == null) return null;
  const url = raw.trim();
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;

  const origin = strapiOrigin();
  const path = url.startsWith("/") ? url : `/${url}`;
  return origin ? `${origin}${path}` : path;
}
