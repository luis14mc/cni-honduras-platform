import { notFound } from "next/navigation";
import { NewsArticleContent, NewsArticleError } from "@/src/components/news/NewsArticleContent";
import { isLocale } from "@/src/i18n/config";
import { buildNewsArticleMetadata, loadNewsArticle } from "@/src/lib/cmsNews";
import { editorialPath } from "@/src/lib/editorialSeo";
import { siteUrl } from "@/src/lib/seo";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { BreadcrumbJsonLd } from "@/src/components/seo/BreadcrumbJsonLd";

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

  const { article } = result;
  const url = siteUrl(editorialPath("news", locale, slug));
  const image = article.seo_image || article.featured_image?.file_url || article.featured_image?.file;
  return (
    <>
      <JsonLd id="ld-news-article" value={{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        description: article.summary || article.title,
        mainEntityOfPage: url,
        inLanguage: locale,
        ...(article.published_at ? { datePublished: article.published_at } : {}),
        ...(image ? { image: [siteUrl(image)] } : {}),
        author: article.author_name
          ? { "@type": "Person", name: article.author_name }
          : { "@type": "Organization", name: "CNI Honduras", url: siteUrl("/") },
        publisher: { "@type": "GovernmentOrganization", name: "CNI Honduras", url: siteUrl("/") },
      }} />
      <BreadcrumbJsonLd id="ld-news-breadcrumb" crumbs={[
        { name: locale === "es" ? "Inicio" : "Home", item: siteUrl(locale === "es" ? "/" : "/en") },
        { name: locale === "es" ? "Prensa" : "News", item: siteUrl(locale === "es" ? "/prensa" : "/en/news") },
        { name: article.title, item: url },
      ]} />
      <NewsArticleContent article={article} locale={locale} />
    </>
  );
}
