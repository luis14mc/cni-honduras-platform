import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getProjects, getSectors } from "@/src/services/investment";
import { getOpportunities as getEditorialOpportunities } from "@/src/lib/strapi/editorial";
import { loadAsyncData } from "@/src/lib/asyncData";
import { PortafolioPageView } from "@/src/components/cni/PortafolioPageView";
import type { InvestmentOpportunity, InvestmentProject, Sector } from "@/src/types/investment";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.portafolio);

export default async function PortafolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const [projects, opportunities, sectors] = await Promise.all([
    loadAsyncData(() => getProjects(), [] as InvestmentProject[]),
    loadAsyncData(() => getEditorialOpportunities(locale), [] as InvestmentOpportunity[]),
    loadAsyncData(() => getSectors({ locale }), [] as Sector[]),
  ]);

  return (
    <PortafolioPageView
      locale={locale}
      projects={projects}
      opportunities={opportunities}
      sectors={sectors}
    />
  );
}
