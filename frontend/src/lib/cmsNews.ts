import { ApiError } from "@/src/lib/api";
import { designImages } from "@/src/lib/designAssets";
import { buildDetailMetadata, buildMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getNewsArticle } from "@/src/services/cms";
import type { Locale } from "@/src/i18n/config";
import type { NewsArticle } from "@/src/types/cms";
import type { Metadata } from "next";

const cardFallbackImages = [
  designImages.prensa.article1,
  designImages.prensa.article2,
  designImages.prensa.article3,
] as const;

export type NewsArticleLoadResult =
  | { status: "ok"; article: NewsArticle }
  | { status: "not_found" }
  | { status: "error" };

/** Clasifica errores de fetch de detalle: 404 vs fallos transitorios/de servidor. */
export function resolveNewsArticleFetch(error: unknown): "not_found" | "error" {
  if (error instanceof ApiError && error.status === 404) {
    return "not_found";
  }
  return "error";
}

export async function loadNewsArticle(
  slug: string,
  locale: Locale,
): Promise<NewsArticleLoadResult> {
  try {
    const article = await getNewsArticle(slug, { locale });
    return { status: "ok", article };
  } catch (error) {
    return resolveNewsArticleFetch(error) === "not_found"
      ? { status: "not_found" }
      : { status: "error" };
  }
}

export async function buildNewsArticleMetadata(
  slug: string,
  locale: Locale,
): Promise<Metadata> {
  try {
    const article = await getNewsArticle(slug, { locale });
    const title = article.seo_title?.trim() || article.title;
    const description =
      article.seo_description?.trim() || article.summary?.trim() || article.title;

    return buildDetailMetadata({
      locale,
      slugPath: `/prensa/${slug}`,
      enMirrorPath: `/en/news/${slug}`,
      title,
      description,
      image: article.featured_image?.file ?? null,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {};
    }
    return buildMetadata(PAGE_SEO.prensa, locale);
  }
}

/** Imagen de tarjeta: CMS o fallback institucional de prensa (no contenido ficticio). */
export function newsCardImage(article: NewsArticle, index = 0): string {
  return article.featured_image?.file ?? cardFallbackImages[index % cardFallbackImages.length];
}

export function newsDetailPath(slug: string, locale: "es" | "en"): string {
  return locale === "en" ? `/en/news/${slug}` : `/prensa/${slug}`;
}
