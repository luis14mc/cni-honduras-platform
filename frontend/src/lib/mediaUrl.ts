import { API_BASE_URL } from "@/src/lib/api";

/** Image extensions accepted by the CMS media library (backend allowlist). */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
] as const;

export type SupportedImageExtension = (typeof SUPPORTED_IMAGE_EXTENSIONS)[number];

export type MediaUrlSource = {
  file_url?: string | null;
  file?: string | null;
} | null | undefined;

/** API origin without the /api/vN suffix — only for legacy relative /media/ paths. */
export function mediaOriginFromApi(): string {
  return API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");
}

/**
 * Resolve a media path or asset to a browser-usable URL.
 *
 * Prefer backend `file_url` (already absolute / CDN / signed). Fall back to
 * relative `file` only for legacy rows — never hardcode hostnames.
 */
export function resolveMediaFileUrl(
  fileOrAsset: string | MediaUrlSource | null | undefined,
): string | null {
  if (fileOrAsset == null) return null;
  if (typeof fileOrAsset === "object") {
    return resolveMediaFileUrl(fileOrAsset.file_url || fileOrAsset.file || null);
  }
  const file = fileOrAsset.trim();
  if (!file) return null;
  if (/^https?:\/\//i.test(file)) return file;
  const origin = mediaOriginFromApi();
  return `${origin}${file.startsWith("/") ? file : `/${file}`}`;
}

export function isSupportedImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0]?.split("#")[0] ?? "";
  const ext = path.includes(".") ? path.split(".").pop()?.toLowerCase() : "";
  return Boolean(
    ext && (SUPPORTED_IMAGE_EXTENSIONS as readonly string[]).includes(ext),
  );
}
