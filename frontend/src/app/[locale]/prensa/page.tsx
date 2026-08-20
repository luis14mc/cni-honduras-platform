import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getNews } from "@/src/lib/strapi/editorial";
import type { NewsArticle } from "@/src/types/cms";
import { loadAsyncData } from "@/src/lib/asyncData";
import { PrensaPageView } from "@/src/components/cni/PrensaPageView";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.prensa);

export default async function PrensaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const news = await loadAsyncData(() => getNews(locale), [] as NewsArticle[]);

  return <PrensaPageView locale={locale} news={news} />;
}
