import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { PortafolioPageView } from "@/src/components/cni/PortafolioPageView";
import { loadAsyncData } from "@/src/lib/asyncData";
import { getOpportunities, getProjects } from "@/src/services/investment";
import { opportunityToCatalogItem, projectToCatalogItem } from "@/src/lib/portfolioCatalog";
import type { InvestmentOpportunity, InvestmentProject } from "@/src/types/investment";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.portafolio);
export const revalidate = 3600;

export default async function PortafolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const [projects, opportunities] = await Promise.all([
    loadAsyncData(() => getProjects({ locale }), [] as InvestmentProject[]),
    loadAsyncData(() => getOpportunities({ locale }), [] as InvestmentOpportunity[]),
  ]);
  return (
    <PortafolioPageView
      locale={locale}
      projects={{ ...projects, data: projects.data.map((item) => projectToCatalogItem(item, locale)) }}
      opportunities={{
        ...opportunities,
        data: opportunities.data.map((item) => opportunityToCatalogItem(item, locale)),
      }}
    />
  );
}
