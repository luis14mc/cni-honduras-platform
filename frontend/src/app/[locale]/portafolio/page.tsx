import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { PageHero } from "@/src/components/cni/PageHero";
import { PortfolioCatalogClient } from "@/src/components/cni/PortfolioCatalogClient";
import { loadAsyncData } from "@/src/lib/asyncData";
import { getOpportunities, getProjects } from "@/src/services/investment";
import { getDocuments } from "@/src/lib/strapi/editorial";
import {
  formatUsdMillions,
  getSeedCatalog,
  opportunityToCatalogItem,
  mergeCatalogSources,
  parseUnifiedFilters,
  projectToCatalogItem,
  sumAmountUsd,
} from "@/src/lib/portfolioCatalog";
import { designImages } from "@/src/lib/designAssets";
import type { InvestmentOpportunity, InvestmentProject } from "@/src/types/investment";
import type { CmsDocument } from "@/src/types/cms";
import type { UnifiedPortfolioTab } from "@/src/lib/portfolioCatalog";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.portafolio);
export const revalidate = 300;

const HERO = {
  es: {
    eyebrow: "Portafolio de Inversiones",
    title: "PORTAFOLIO DE INVERSIONES",
    description:
      "Explore las fichas de proyectos y las Opportunity Cards del CNI Honduras, filtradas por tipo y sector.",
    sectors: "Sectores cubiertos",
  },
  en: {
    eyebrow: "Investment Portfolio",
    title: "INVESTMENT PORTFOLIO",
    description:
      "Browse CNI Honduras project sheets and Opportunity Cards, filtered by type and sector.",
    sectors: "Sectors covered",
  },
} as const;

export default async function PortafolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const hero = HERO[locale];
  const initialFilters = parseUnifiedFilters(await searchParams);

  const [djangoProjects, djangoOpportunities, documents] = await Promise.all([
    loadAsyncData(() => getProjects({ locale }), [] as InvestmentProject[]),
    loadAsyncData(() => getOpportunities({ locale }), [] as InvestmentOpportunity[]),
    loadAsyncData(
      () => getDocuments(locale),
      [] as CmsDocument[],
    ),
  ]);

  const projects = mergeCatalogSources(
    {
      ...djangoProjects,
      data: djangoProjects.data.map((item) => projectToCatalogItem(item, locale)),
    },
    getSeedCatalog("project", locale),
  );
  const opportunities = mergeCatalogSources(
    {
      ...djangoOpportunities,
      data: djangoOpportunities.data.map((item) => opportunityToCatalogItem(item, locale)),
    },
    getSeedCatalog("opportunity", locale),
  );

  const totalAmountUsd = sumAmountUsd([...projects.data, ...opportunities.data]);
  const stats = [
    {
      key: "proyectos",
      count: projects.data.length,
      amount: formatUsdMillions(sumAmountUsd(projects.data)),
      label: locale === "es" ? "proyectos" : "projects",
    },
    {
      key: "oportunidades",
      count: opportunities.data.length,
      amount: formatUsdMillions(sumAmountUsd(opportunities.data)),
      label: locale === "es" ? "oportunidades" : "opportunities",
    },
    {
      key: "sectores",
      count: 5,
      amount: null,
      label: hero.sectors,
    },
  ];

  const documentTypeForTab: Record<UnifiedPortfolioTab, string> = {
    proyectos: "project_sheet",
    oportunidades: "opportunity_card",
  };

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        imageSrc={designImages.portfolio.hero}
        imageAlt=""
        heightClass="min-h-[480px] pt-28 md:min-h-[560px]"
        imageClassName="absolute inset-0 object-cover opacity-40"
        overlayClassName="bg-gradient-to-r from-[#000a1e]/90 via-[#000a1e]/70 to-[#000a1e]/35"
      />

      <section className="bg-[#001a33] py-8 text-white" aria-label={hero.sectors}>
        <div className="mx-auto max-w-screen-2xl px-4 md:px-10">
          <ul className="grid gap-4 md:grid-cols-3" role="list">
            {stats.map((stat) => (
              <li
                key={stat.key}
                className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <span className="font-headline text-[10px] font-bold uppercase tracking-[0.22em] text-[#8DC046]">
                  {stat.label}
                </span>
                <span className="mt-3 font-display text-2xl font-extrabold leading-tight md:text-3xl">
                  {stat.amount ?? `${stat.count}`}
                </span>
                <span className="mt-1 font-body text-sm text-white/70">
                  {stat.count} {stat.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="sr-only">
            {stats.map((s) => `${s.count} ${s.label}`).join(" · ")}
            {totalAmountUsd > 0 ? ` · Total ${formatUsdMillions(totalAmountUsd)}` : ""}
          </p>
        </div>
      </section>

      <PortfolioCatalogClient
        locale={locale}
        projects={projects.data}
        opportunities={opportunities.data}
        documents={documents.status === "ok" ? documents.data : []}
        initialFilters={initialFilters}
        documentTypeForTab={documentTypeForTab}
      />
    </div>
  );
}