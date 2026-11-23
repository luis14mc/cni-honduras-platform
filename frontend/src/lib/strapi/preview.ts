import { createHmac, timingSafeEqual } from "node:crypto";
import { isLocale } from "@/src/i18n/config";

export function verifyEditorialPreview(
  locale: string,
  searchParams: Record<string, string | string[] | undefined>,
  secret = process.env.STRAPI_PREVIEW_SECRET?.trim(),
  now = Date.now(),
) {
  const { collection, documentId, status, expires, signature } = searchParams;
  if (
    !secret || !isLocale(locale) ||
    (collection !== "pages" && collection !== "banners") ||
    (status !== "draft" && status !== "published") ||
    typeof documentId !== "string" || !/^[a-z0-9]+$/.test(documentId) ||
    typeof expires !== "string" || !/^\d+$/.test(expires) || Number(expires) <= now ||
    typeof signature !== "string" || !/^[0-9a-f]{64}$/.test(signature)
  ) return null;

  const expected = createHmac("sha256", secret)
    .update(`${collection}:${documentId}:${locale}:${status}:${expires}`)
    .digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) return null;

  return { collection, documentId, locale, status } as const;
}
