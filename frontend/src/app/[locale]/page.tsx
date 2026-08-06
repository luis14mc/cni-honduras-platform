import { notFound } from "next/navigation";
import { HomePageView } from "@/src/components/cni/HomePageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getFeaturedNews, getInstitutionalLinks, getSiteBanners } from "@/src/services/cms";
import { getSuccessStories, getSectors } from "@/src/services/investment";
import type { NewsArticle, InstitutionalLink, SiteBanner } from "@/src/types/cms";
import type { SuccessStory, Sector } from "@/src/types/investment";
import { loadAsyncData } from "@/src/lib/asyncData";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.home);

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const [newsResult, storiesResult, sectorsResult, linksResult, heroResult] = await Promise.all([
    loadAsyncData(async () => {
      const news = await getFeaturedNews({ locale });
      return [...news]
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, 3);
    }, [] as NewsArticle[]),
    loadAsyncData(
      () => getSuccessStories({ featured: true, locale }),
      [] as SuccessStory[],
    ),
    loadAsyncData(() => getSectors({ locale }), [] as Sector[]),
    loadAsyncData(
      () => getInstitutionalLinks("home_interest", { locale }),
      [] as InstitutionalLink[],
    ),
    loadAsyncData(
      () => getSiteBanners("home_hero", { locale }),
      [] as SiteBanner[],
    ),
  ]);

  return (
    <HomePageView
      locale={locale}
      latestNews={newsResult.data}
      latestNewsStatus={newsResult.status}
      featuredStories={storiesResult.data}
      featuredStoriesStatus={storiesResult.status}
      apiSectors={sectorsResult.data}
      sectorsStatus={sectorsResult.status}
      interestLinks={linksResult.data}
      interestLinksStatus={linksResult.status}
      heroBanners={heroResult.data}
      heroBannersStatus={heroResult.status}
    />
  );
}
