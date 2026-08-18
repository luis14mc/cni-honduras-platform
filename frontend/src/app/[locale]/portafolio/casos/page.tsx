import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getSuccessStories } from "@/src/lib/strapi/editorial";
import type { SuccessStory } from "@/src/types/investment";
import { loadAsyncData } from "@/src/lib/asyncData";
import { CasosPageView } from "@/src/components/cni/CasosPageView";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["portafolio-casos"]);

export default async function CasosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const stories = await loadAsyncData(() => getSuccessStories(locale), [] as SuccessStory[]);

  return <CasosPageView locale={locale} stories={stories} />;
}
