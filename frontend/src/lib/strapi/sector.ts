/**
 * Normalize a free-form Strapi sector string to a comparable slug.
 * Does not create a sector catalog — Django Sector remains the source of truth.
 */
export function normalizeSectorSlug(value: string | null | undefined): string {
  if (value == null) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sectorsMatch(
  stored: string | null | undefined,
  requested: string | null | undefined,
): boolean {
  const left = normalizeSectorSlug(stored);
  const right = normalizeSectorSlug(requested);
  return Boolean(left) && left === right;
}
