import { notFound } from "next/navigation";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { CrecerPageView } from "@/src/components/cni/CrecerPageView";
import { loadAsyncData } from "@/src/lib/asyncData";
import { getOpportunities, getSuccessStories } from "@/src/lib/strapi/editorial";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import type { InvestmentOpportunity, SuccessStory } from "@/src/types/investment";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.crecer);

export default async function CrecerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const [opportunities, stories] = await Promise.all([
    loadAsyncData(() => getOpportunities(locale), [] as InvestmentOpportunity[]),
    loadAsyncData(() => getSuccessStories(locale), [] as SuccessStory[]),
  ]);

  return (
    <CrecerPageView locale={locale} opportunities={opportunities} stories={stories} />
  );
}
