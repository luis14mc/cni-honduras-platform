import { notFound } from "next/navigation";
import { HomePageView } from "@/src/components/cni/HomePageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getNews, getInstitutionalLinks } from "@/src/services/cms";
import { getSuccessStories, getSectors } from "@/src/services/investment";
import type { NewsArticle } from "@/src/types/cms";
import type { SuccessStory } from "@/src/types/investment";
import type { Sector } from "@/src/types/investment";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.home);

async function loadLatestNews(locale: Locale): Promise<NewsArticle[]> {
  try {
    const news = await getNews({ locale });
    return [...news]
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const [latestNews, featuredStories, sectors, interestLinks] = await Promise.all([
    loadLatestNews(locale),
    loadFeaturedStories(locale),
    loadSectors(locale),
    loadInterestLinks(locale),
  ]);

  return (
    <HomePageView
      locale={locale}
      latestNews={latestNews}
      featuredStories={featuredStories}
      apiSectors={sectors}
      interestLinks={interestLinks}
    />
  );
}

async function loadFeaturedStories(locale: Locale): Promise<SuccessStory[]> {
  try {
    return await getSuccessStories({ featured: true, locale });
  } catch {
    return [];
  }
}

async function loadSectors(locale: Locale): Promise<Sector[]> {
  try {
    return await getSectors({ locale });
  } catch {
    return [];
  }
}

async function loadInterestLinks(locale: Locale) {
  try {
    return await getInstitutionalLinks("home_interest", { locale });
  } catch {
    return [];
  }
}
