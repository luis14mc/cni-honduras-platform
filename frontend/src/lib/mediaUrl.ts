import { API_BASE_URL } from "@/src/lib/api";

/** API origin without the /api/v1 suffix — used for relative /media/ paths. */
export function mediaOriginFromApi(): string {
  return API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");
}

/** Resolve a media path to an absolute URL consumable by next/image or <img>. */
export function resolveMediaFileUrl(file: string | null | undefined): string | null {
  if (!file) return null;
  if (/^https?:\/\//i.test(file)) return file;
  const origin = mediaOriginFromApi();
  return `${origin}${file.startsWith("/") ? file : `/${file}`}`;
}
