import { notFound } from "next/navigation";
import { HomePageView } from "@/src/components/cni/HomePageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getFeaturedNews } from "@/src/services/cms";
import type { NewsArticle } from "@/src/types/cms";
import { loadAsyncData } from "@/src/lib/asyncData";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["home-ledger"]);

export default async function HomeLedgerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const newsResult = await loadAsyncData(async () => {
    const news = await getFeaturedNews({ locale: locale as Locale });
    return [...news]
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 3);
  }, [] as NewsArticle[]);

  return (
    <HomePageView
      locale={locale as Locale}
      latestNews={newsResult.data}
      latestNewsStatus={newsResult.status}
    />
  );
}
