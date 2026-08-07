/** Slugs that must not be deleted from the CMS (mirrors backend page_protection.py). */

export const PROTECTED_PAGE_SLUGS = new Set([
  "nosotros",
  "quienes-somos",
  "contacto",
  "invertir",
  "sectores",
  "facilidades-migratorias",
  "estudios",
]);

export function isProtectedPageSlug(slug: string): boolean {
  return PROTECTED_PAGE_SLUGS.has((slug || "").trim().toLowerCase());
}
