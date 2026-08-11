import { designImages } from "@/src/lib/designAssets";
import type { Locale } from "@/src/i18n/config";
import { resolveMediaFileUrl } from "@/src/lib/mediaUrl";
import type { CmsDocument } from "@/src/types/cms";

/** URL de apertura/descarga: archivo del CMS o URL externa. */
export function documentOpenUrl(doc: CmsDocument): string | null {
  const fileUrl = resolveMediaFileUrl(doc.file_url || doc.file);
  if (fileUrl) return fileUrl;
  if (doc.external_url) return doc.external_url;
  return null;
}

export function isExternalDocument(doc: CmsDocument): boolean {
  const hasFile = Boolean(resolveMediaFileUrl(doc.file_url || doc.file));
  return !hasFile && Boolean(doc.external_url);
}

export function documentLinkTarget(_doc: CmsDocument): "_blank" {
  return "_blank";
}

export function documentLinkRel(doc: CmsDocument): string {
  return isExternalDocument(doc) ? "noopener noreferrer" : "noopener noreferrer";
}

export function formatDocumentFileSize(bytes: number | null, locale: Locale): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = Math.round(bytes / 1024);
    return locale === "en" ? `${kb} KB` : `${kb} KB`;
  }
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return locale === "en" ? `${mb} MB` : `${mb} MB`;
}

export function documentDisplayDate(doc: CmsDocument): string | null {
  return doc.document_date ?? doc.published_at ?? null;
}

export function formatDocumentDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

/** Fallback institucional cuando no hay portada en CMS. */
export function documentCoverImage(doc: CmsDocument): string | null {
  return resolveMediaFileUrl(doc.cover_image?.file_url || doc.cover_image?.file);
}

export function documentCoverFallback(): string {
  return designImages.resourcesDetail.hero;
}

export const documentActionLabels = {
  es: {
    download: "Descargar",
    open: "Abrir",
    openExternal: "Abrir enlace",
    featured: "Destacado",
  },
  en: {
    download: "Download",
    open: "Open",
    openExternal: "Open link",
    featured: "Featured",
  },
} as const;

export function documentActionLabel(doc: CmsDocument, locale: Locale): string {
  const labels = documentActionLabels[locale];
  if (isExternalDocument(doc)) return labels.openExternal;
  return labels.open;
}
