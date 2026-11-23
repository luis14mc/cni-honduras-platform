import { notFound } from "next/navigation";
import { NewsArticleContent, NewsArticleError } from "@/src/components/news/NewsArticleContent";
import { isLocale } from "@/src/i18n/config";
import { buildNewsArticleMetadata, loadNewsArticle } from "@/src/lib/cmsNews";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  return buildNewsArticleMetadata(slug, raw);
}

export default async function PrensaArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const result = await loadNewsArticle(slug, locale);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "error") {
    return <NewsArticleError locale={locale} />;
  }

  return <NewsArticleContent article={result.article} locale={locale} />;
}
