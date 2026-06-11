import { notFound } from "next/navigation";
import { HomePageView } from "@/src/components/cni/HomePageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getNews } from "@/src/services/cms";
import type { NewsArticle } from "@/src/types/cms";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.home);

async function loadLatestNews(): Promise<NewsArticle[]> {
  try {
    const news = await getNews();
    return news.slice(0, 3);
  } catch {
    return [];
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const latestNews = await loadLatestNews();
  return <HomePageView locale={locale as Locale} latestNews={latestNews} />;
}
