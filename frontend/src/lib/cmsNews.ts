import { designImages } from "@/src/lib/designAssets";
import type { NewsArticle } from "@/src/types/cms";

const cardFallbackImages = [
  designImages.prensa.article1,
  designImages.prensa.article2,
  designImages.prensa.article3,
] as const;

/** Imagen de tarjeta: CMS o fallback institucional de prensa (no contenido ficticio). */
export function newsCardImage(article: NewsArticle, index = 0): string {
  return article.featured_image?.file ?? cardFallbackImages[index % cardFallbackImages.length];
}

export function newsDetailPath(slug: string, locale: "es" | "en"): string {
  return locale === "en" ? `/en/news/${slug}` : `/prensa/${slug}`;
}
